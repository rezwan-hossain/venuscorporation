// app/auth/error/page.tsx
// Shown when /auth/callback can't sign someone in. `?reason=` says why.

import Link from "next/link";
import { Suspense } from "react";

const MESSAGES: Record<string, string> = {
  // Most often: the email link was opened in a different browser than the one
  // used to sign up, or it was clicked twice. Supabase has usually already
  // confirmed the email by this point, so logging in normally works.
  exchange_failed:
    "This link couldn't sign you in here — usually because it was opened in a different browser, or used twice. Your email is most likely confirmed already, so try logging in.",
  missing_code: "This sign-in link is incomplete. Please try again.",
  sync_failed:
    "You're signed in, but we couldn't load your account. Please try logging in again.",
};

const DEFAULT_MESSAGE =
  "The link may have expired. Please try logging in, or register again.";

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <p className="mt-2 text-gray-500">
      {(reason && MESSAGES[reason]) || DEFAULT_MESSAGE}
    </p>
  );
}

export default function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-3xl font-semibold text-red-600">
          Authentication error
        </p>
        <Suspense fallback={<p className="mt-2 text-gray-500">&nbsp;</p>}>
          <ErrorMessage searchParams={searchParams} />
        </Suspense>
        <div className="mt-5 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-[#14245a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14245a]/90"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
