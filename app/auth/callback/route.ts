// app/auth/callback/route.ts
//
// Supabase sends people here in two ways:
//
//   ?code=…                  Google sign-in, and the default email link.
//                            Uses PKCE: the browser that STARTED sign-up keeps
//                            a secret cookie ("code verifier"). If the link is
//                            opened in another browser, the mail app's own
//                            browser, or clicked twice, that cookie is missing
//                            and the exchange fails.
//
//   ?token_hash=…&type=…     Email link with the recommended template (below).
//                            Needs no cookie, so it works in ANY browser.
//
// To use the token_hash link, in Supabase → Authentication → Email Templates
// → "Confirm signup", set the link to:
//
//   {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email
//
// (.RedirectTo is our emailRedirectTo — …/auth/callback — so this works on
// localhost and production without other changes.)

import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";

import { syncUser } from "@/lib/auth/syncUser";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Never log the code or token itself — they are live credentials.
  console.log("⚡️ Received auth callback", {
    hasCode: !!code,
    hasTokenHash: !!tokenHash,
  });

  const supabase = await createClient();
  let user: User | null = null;

  if (tokenHash && type) {
    // Email link (token_hash template) — works in any browser.
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) console.error("👀 Email verify failed:", error.message);
    user = data.user;
  } else if (code) {
    // Google sign-in, or the default email link.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("👀 Exchange failed:", error.message);
    user = data.user;
  } else {
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_code`);
  }

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange_failed`);
  }

  // Make sure the user has a row in our own database (adopts guest rows too).
  try {
    await syncUser(user);
  } catch (e) {
    console.error("syncUser failed in callback:", e);
    return NextResponse.redirect(`${origin}/auth/error?reason=sync_failed`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
