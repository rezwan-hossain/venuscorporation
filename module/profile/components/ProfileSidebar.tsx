// module/profile/components/ProfileSidebar.tsx
//
// Profile card at the top of the profile page's sidebar: navy card with the
// avatar (gold ring), name, @username, role badge, email and join date.

import { isAdminRole } from "@/lib/auth/roles";
import type { UserProfile } from "@/types/profile";
import { Mail, Calendar, Shield } from "lucide-react";

type ProfileSidebarProps = {
  profile: UserProfile;
};

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.userName ||
    profile.email.split("@")[0];
  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-center text-white shadow-xl shadow-[#14245a]/20"
      style={{
        background:
          "radial-gradient(120% 100% at 0% 0%, #1d3274 0%, #14245a 50%, #0d1840 100%)",
      }}
    >
      {/* Gold swoosh, bottom right (decorative) */}
      <svg
        viewBox="0 0 400 160"
        className="pointer-events-none absolute right-0 bottom-0 w-56 opacity-60"
        aria-hidden
      >
        <path
          d="M40 160 C175 132 280 82 400 34"
          fill="none"
          stroke="#c49a3c"
          strokeWidth="2.5"
        />
        <path
          d="M120 160 C225 138 305 104 400 66"
          fill="none"
          stroke="#c49a3c"
          strokeWidth="1.25"
          opacity="0.7"
        />
      </svg>

      <div className="relative">
        {/* Avatar with a gold ring */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-2 ring-[#dcb45c] ring-offset-4 ring-offset-[#14245a]">
          {profile.image ? (
            // Plain <img>: profile photos can come from any host (e.g. Google).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.image}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="text-4xl font-semibold text-[#dcb45c]"
              style={{ fontFamily: "var(--font-profile-serif)" }}
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <h2
          className="mt-5 text-2xl leading-tight font-semibold"
          style={{ fontFamily: "var(--font-profile-serif)" }}
        >
          {displayName}
        </h2>
        {profile.userName && (
          <p className="mt-0.5 text-sm text-white/50">@{profile.userName}</p>
        )}

        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase ${
            isAdminRole(profile.role)
              ? "bg-[#dcb45c] text-[#0d1840]"
              : "bg-white/10 text-white/80 ring-1 ring-white/15"
          }`}
        >
          <Shield className="h-3 w-3" aria-hidden />
          {profile.role.toLowerCase().replace("_", " ")}
        </span>

        <div className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-left text-sm text-white/70">
          <p className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 shrink-0 text-[#dcb45c]" aria-hidden />
            <span className="truncate">{profile.email}</span>
          </p>
          <p className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 shrink-0 text-[#dcb45c]" aria-hidden />
            Joined {joinDate}
          </p>
        </div>
      </div>
    </div>
  );
}
