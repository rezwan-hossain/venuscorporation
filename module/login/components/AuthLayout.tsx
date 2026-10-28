// module/login/components/AuthLayout.tsx
//
// Shared look for the login and register pages (brand navy + gold):
//   AuthShell   — cream page with soft gold glow + swoosh, centred column
//   AuthHeader  — Venus Corporation logo, gold label, serif title, subtitle
//   AuthCard    — white card with a gold top line
//   GoogleButton — "Continue with Google" with the Google "G"
//   OrDivider   — "— or —" line

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"], style: ["normal", "italic"], display: "swap" });

const NAVY = "#14245a";
const GOLD = "#c49a3c";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 pt-28 pb-16" style={{ background: "#faf8f3" }}>
      {/* Soft gold glow + swoosh (decorative) */}
      <div aria-hidden className="absolute -top-40 left-1/2 -z-10 h-80 w-[40rem] max-w-full -translate-x-1/2 rounded-full opacity-25 blur-3xl" style={{ background: GOLD }} />
      <svg viewBox="0 0 400 160" className="pointer-events-none absolute right-0 bottom-0 -z-10 w-[30rem] max-w-[85%]" aria-hidden>
        <path d="M0 160 C120 142 235 92 400 22 L400 160 Z" fill="#f4ecdb" opacity="0.7" />
        <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" />
        <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.8" />
      </svg>
      <div className="w-full max-w-[460px]">{children}</div>
    </div>
  );
}

export function AuthHeader({ label, title, italic, subtitle }: { label: string; title: string; italic: string; subtitle: string }) {
  return (
    <div className="mb-8 text-center">
      <Link href="/" aria-label="Venus Corporation home" className="mx-auto inline-block transition-transform duration-300 hover:scale-[1.03]">
        <Image src="/venuscorporation-logo.png" alt="Venus Corporation" width={719} height={347} priority sizes="170px" className="mx-auto h-auto w-[170px]" />
      </Link>
      <p className="mt-7 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
        <span className="h-px w-8" style={{ background: GOLD }} aria-hidden />
        {label}
        <span className="h-px w-8" style={{ background: GOLD }} aria-hidden />
      </p>
      <h1 className={`${serif.className} mt-3 text-4xl leading-tight font-semibold sm:text-5xl`} style={{ color: NAVY }}>
        {title}{" "}
        <em className="font-semibold" style={{ color: GOLD }}>
          {italic}
        </em>
      </h1>
      <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border bg-white p-6 shadow-xl shadow-[#14245a]/10 sm:p-8" style={{ borderColor: `${GOLD}33` }}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#c49a3c] via-[#dcb45c] to-[#c49a3c]" />
      {children}
    </div>
  );
}

/** The four-colour Google "G". */
function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function GoogleButton({ onClick, loading = false }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex h-13 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c49a3c]/50 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
    >
      <GoogleG />
      {loading ? "Redirecting to Google…" : "Continue with Google"}
    </button>
  );
}

/** "— or —" divider. */
export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">or</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
