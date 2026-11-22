// hooks/useAuth.ts (Enhanced with session caching)
"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
// Supabase is NOT imported at the top: it's a big library (~220 KB) and the
// header is on every page. It's loaded inside the effect below, once the page
// has drawn and the browser is idle — so it never slows down the first paint.
const loadSupabase = () =>
  import("@/lib/supabase/client").then((m) => m.createClient());

/** Does this browser have a Supabase login cookie ("sb-…-auth-token")?
 *  Logged-out visitors don't — then there's no need to load Supabase at all. */
const hasSessionCookie = () =>
  /(?:^|;\s*)sb-[^=]+-auth-token/.test(document.cookie);

/** Run `task` when the browser has nothing else to do (or soon, as a fallback). */
function whenIdle(task: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(task, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(task, 1500);
  return () => clearTimeout(id);
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
} | null;

// Cache auth state in sessionStorage for instant loads
const AUTH_CACHE_KEY = "auth_user_cache";

function getCachedUser(): AuthUser {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_CACHE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(getCachedUser);
  const [loading, setLoading] = useState(!getCachedUser());
  // Re-check on every page change: after logging in, the visitor is sent to
  // another page — that's when the new login cookie is noticed.
  const pathname = usePathname();

  const updateUser = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    setCachedUser(newUser);
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    const getUser = async () => {
      const supabase = await loadSupabase();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      const userData = authUser
        ? {
            id: authUser.id,
            email: authUser.email || "",
            name:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              authUser.email?.split("@")[0] ||
              "User",
            image: authUser.user_metadata?.avatar_url || null,
          }
        : null;

      updateUser(userData);
      setLoading(false);
    };

    // Listen for log in / log out (e.g. in another tab)
    const listen = async () => {
      const supabase = await loadSupabase();
      if (!mounted) return;
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;

        const userData = session?.user
          ? {
              id: session.user.id,
              email: session.user.email || "",
              name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split("@")[0] ||
                "User",
              image: session.user.user_metadata?.avatar_url || null,
            }
          : null;

        updateUser(userData);
      });
      unsubscribe = () => subscription.unsubscribe();
    };

    // Wait until the page is idle, then:
    //   - no login cookie and nobody cached → logged out; skip Supabase
    //     entirely (most visitors — saves loading ~220 KB of code)
    //   - otherwise ask who's logged in (unless this tab already knows)
    //     and start listening for log in / log out.
    const cancelIdle = whenIdle(() => {
      if (!getCachedUser() && !hasSessionCookie()) {
        updateUser(null);
        setLoading(false);
        return;
      }
      if (!getCachedUser()) getUser();
      listen();
    });

    return () => {
      mounted = false;
      cancelIdle();
      unsubscribe();
    };
  }, [updateUser, pathname]);

  return { user, loading, setUser: updateUser };
}
