// module/dashboard/components/UserProfileCard.tsx
//
// Dashboard welcome band (cream): avatar with a gold ring, "Welcome back,
// <name>", contact details as pills, and Edit profile / Browse events buttons.

import type { DashboardUser } from "@/types/dashboard";
import { ArrowRight, Calendar, Mail, Pencil, Phone, Shield } from "lucide-react";
import Link from "next/link";

type UserProfileCardProps = {
  user: DashboardUser;
};

export function UserProfileCard({ user }: UserProfileCardProps) {
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const displayName = user.firstName || user.userName || user.email.split("@")[0];

  const details = [
    { icon: Mail, text: user.email },
    ...(user.phone ? [{ icon: Phone, text: user.phone }] : []),
    { icon: Calendar, text: `Joined ${joinDate}` },
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-center gap-5">
        {/* Avatar with a gold ring */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#14245a] shadow-lg shadow-[#14245a]/20 ring-2 ring-[#dcb45c] ring-offset-4 ring-offset-[#faf8f3] sm:h-24 sm:w-24">
          {user.image ? (
            // Plain <img>: profile photos can come from any host (e.g. Google).
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-semibold text-[#dcb45c]" style={{ fontFamily: "var(--font-dashboard-serif)" }}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c49a3c]">
            My dashboard
            {user.role === "ADMIN" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#14245a] px-2.5 py-0.5 text-[10px] tracking-[0.15em] text-[#dcb45c]">
                <Shield size={10} aria-hidden /> Admin
              </span>
            )}
          </p>
          <h1 className="mt-1 text-4xl leading-tight font-semibold text-[#14245a] sm:text-5xl" style={{ fontFamily: "var(--font-dashboard-serif)" }}>
            Welcome back, <em className="font-medium text-[#c49a3c]">{displayName}.</em>
          </h1>
          <ul className="mt-3 flex flex-wrap gap-2">
            {details.map(({ icon: Icon, text }) => (
              <li key={text} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#c49a3c]/30 bg-white px-3 py-1 text-xs text-slate-600">
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#c49a3c]" aria-hidden />
                <span className="truncate">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#14245a] shadow-sm ring-1 ring-[#c49a3c]/50 transition hover:bg-[#14245a] hover:text-white"
        >
          <Pencil size={14} aria-hidden /> Edit profile
        </Link>
        <Link
          href="/events"
          className="group inline-flex items-center gap-2 rounded-full bg-[#14245a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#14245a]/20 transition hover:bg-[#0d1840]"
        >
          Browse events <ArrowRight size={14} className="text-[#dcb45c] transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
