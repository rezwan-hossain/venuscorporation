"use client";

import { Suspense, use, useState } from "react";
import dynamic from "next/dynamic";
import { Cormorant_Garamond } from "next/font/google";
import { ProfileForm } from "../components/ProfileForm";
import { PasswordForm } from "../components/PasswordForm";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfilePanelSkeleton } from "../components/ProfileSkeletons";
import type {
  Coupon,
  CouponEvent,
} from "../components/admin/AdminCouponsPanel";
import type { UserProfile, AdminEvent, AdminOrganizer } from "@/types/profile";
import { isAdminRole } from "@/lib/auth/roles";
import type { HeroSectionData } from "@/types/homepage";
import type { GalleryImage } from "@/types/gallery";
import type { TeamMember } from "@/types/team";
import {
  User,
  Lock,
  CalendarPlus,
  Layout,
  ImageIcon,
  Ticket,
  Users,
  BarChart3,
  History,
  MessageSquare,
  ShieldCheck,
  Mail,
  MessageSquareText,
} from "lucide-react";

// The business card's elegant serif — the profile components use it through
// var(--font-profile-serif).
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-profile-serif",
});

// Admin panels are code-split: non-admins never download them, and admins
// only fetch a panel's code when they open its tab.
const panelLoading = () => <ProfilePanelSkeleton />;
const AdminEventsPanel = dynamic(
  () =>
    import("../components/admin/AdminEventsPanel").then(
      (m) => m.AdminEventsPanel,
    ),
  { loading: panelLoading },
);
const AdminCouponsPanel = dynamic(
  () =>
    import("../components/admin/AdminCouponsPanel").then(
      (m) => m.AdminCouponsPanel,
    ),
  { loading: panelLoading },
);
const ManageHomepagePanel = dynamic(
  () =>
    import("../components/admin/ManageHomepagePanel").then(
      (m) => m.ManageHomepagePanel,
    ),
  { loading: panelLoading },
);
const AdminGalleryPanel = dynamic(
  () =>
    import("../components/admin/AdminGalleryPanel").then(
      (m) => m.AdminGalleryPanel,
    ),
  { loading: panelLoading },
);
const AdminDashboardPanel = dynamic(
  () =>
    import("../components/admin/AdminDashboardPanel").then(
      (m) => m.AdminDashboardPanel,
    ),
  { loading: panelLoading },
);
const AdminAuditLogPanel = dynamic(
  () =>
    import("../components/admin/AdminAuditLogPanel").then(
      (m) => m.AdminAuditLogPanel,
    ),
  { loading: panelLoading },
);
const AdminSmsPanel = dynamic(
  () =>
    import("../components/admin/AdminSmsPanel").then((m) => m.AdminSmsPanel),
  { loading: panelLoading },
);
const AdminEmailPanel = dynamic(
  () =>
    import("../components/admin/AdminEmailPanel").then(
      (m) => m.AdminEmailPanel,
    ),
  { loading: panelLoading },
);
const AdminAdminsPanel = dynamic(
  () =>
    import("../components/admin/AdminAdminsPanel").then(
      (m) => m.AdminAdminsPanel,
    ),
  { loading: panelLoading },
);
const AdminContactsPanel = dynamic(
  () =>
    import("../components/admin/AdminContactsPanel").then(
      (m) => m.AdminContactsPanel,
    ),
  { loading: panelLoading },
);
const AdminTeamPanel = dynamic(
  () =>
    import("../components/admin/AdminTeamPanel").then((m) => m.AdminTeamPanel),
  { loading: panelLoading },
);

export type AdminData = {
  adminEvents: AdminEvent[];
  organizers: AdminOrganizer[];
  heroSections: HeroSectionData[];
  galleryImages: GalleryImage[];
  coupons: Coupon[];
  couponEvents: CouponEvent[];
  teamMembers: TeamMember[];
};

type ProfilePageProps = {
  profile: UserProfile;
  isOAuthUser: boolean;
  // Streamed from the server; null for non-admins.
  adminData: Promise<AdminData> | null;
};

type Tab =
  | "profile"
  | "dashboard"
  | "password"
  | "events"
  | "homepage"
  | "gallery"
  | "coupons"
  | "team"
  | "audit"
  | "sms"
  | "email"
  | "contacts"
  | "admins";

type AdminTab = Exclude<Tab, "profile" | "password">;

const isAdminTab = (tab: Tab): tab is AdminTab =>
  tab !== "profile" && tab !== "password";

// Suspends (showing the skeleton) until the streamed admin data arrives.
function AdminTabContent({
  tab,
  adminData,
}: {
  tab: AdminTab;
  adminData: Promise<AdminData>;
}) {
  const data = use(adminData);

  switch (tab) {
    case "dashboard":
      return (
        <AdminDashboardPanel
          events={data.adminEvents.map((e) => ({ id: e.id, name: e.name }))}
        />
      );
    case "events":
      return (
        <AdminEventsPanel
          initialEvents={data.adminEvents}
          initialOrganizers={data.organizers}
        />
      );
    case "coupons":
      return (
        <AdminCouponsPanel
          initialCoupons={data.coupons}
          events={data.couponEvents}
        />
      );
    case "homepage":
      return <ManageHomepagePanel initialHeroes={data.heroSections} />;
    case "gallery":
      return <AdminGalleryPanel initialImages={data.galleryImages} />;
    case "admins":
      return <AdminAdminsPanel />;
    case "sms":
      return <AdminSmsPanel />;
    case "email":
      return <AdminEmailPanel />;
    case "contacts":
      return <AdminContactsPanel />;
    case "audit":
      return (
        <AdminAuditLogPanel
          events={data.adminEvents.map((e) => ({ id: e.id, name: e.name }))}
        />
      );
    case "team":
      return <AdminTeamPanel initialMembers={data.teamMembers} />;
  }
}

const ProfilePage = ({ profile, isOAuthUser, adminData }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const isAdmin = isAdminRole(profile.role);

  const tabs = [
    {
      id: "profile" as Tab,
      label: "Profile Information",
      icon: User,
      description: "Update your personal details",
    },
    ...(isAdmin
      ? [
          {
            id: "dashboard" as Tab,
            label: "Dashboard",
            icon: BarChart3,
            description: "Sales, revenue & runners",
          },
        ]
      : []),
    ...(!isOAuthUser
      ? [
          {
            id: "password" as Tab,
            label: "Change Password",
            icon: Lock,
            description: "Update your password",
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: "events" as Tab,
            label: "Manage Events",
            icon: CalendarPlus,
            description: "Create and manage events",
          },
          {
            id: "contacts" as Tab,
            label: "Contact Messages",
            icon: MessageSquareText,
            description: "Enquiries from the contact page",
          },
          {
            id: "coupons" as Tab,
            label: "Manage Coupons",
            icon: Ticket,
            description: "Create & manage discounts",
          },
          {
            id: "homepage" as Tab,
            label: "Manage Homepage",
            icon: Layout,
            description: "Hero section & content",
          },
          {
            id: "gallery" as Tab,
            label: "Manage Gallery",
            icon: ImageIcon,
            description: "Add, edit & remove photos",
          },
          {
            id: "team" as Tab,
            label: "Manage Team",
            icon: Users,
            description: "Add & edit team members",
          },
          {
            id: "admins" as Tab,
            label: "Admins",
            icon: ShieldCheck,
            description: "Who has admin access",
          },
          {
            id: "sms" as Tab,
            label: "SMS Messages",
            icon: MessageSquare,
            description: "Edit the confirmation SMS",
          },
          {
            id: "email" as Tab,
            label: "Email Message",
            icon: Mail,
            description: "Edit the confirmation email",
          },
          {
            id: "audit" as Tab,
            label: "Audit Log",
            icon: History,
            description: "Who changed what, and when",
          },
        ]
      : []),
  ];

  const accountTabs = tabs.filter((t) => !isAdminTab(t.id));
  const adminTabs = tabs.filter((t) => isAdminTab(t.id));

  /** One sidebar tab: icon, label + description; navy with a gold bar when active. */
  const renderTab = (tab: (typeof tabs)[number]) => {
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        aria-current={active ? "page" : undefined}
        className={`group relative flex w-full shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition lg:shrink ${
          active
            ? "bg-[#14245a] text-white shadow-lg shadow-[#14245a]/20"
            : "text-slate-600 hover:bg-white hover:text-[#14245a] hover:shadow-sm"
        }`}
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-[#dcb45c]"
          />
        )}
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
            active
              ? "bg-white/10 text-[#dcb45c]"
              : "bg-[#c49a3c]/10 text-[#a8852f] group-hover:bg-[#c49a3c]/15"
          }`}
        >
          <tab.icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block whitespace-nowrap">{tab.label}</span>
          <span
            className={`hidden truncate text-xs font-normal lg:block ${active ? "text-white/60" : "text-slate-400"}`}
          >
            {tab.description}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div className={`${serif.variable} min-h-screen bg-white`}>
      {/* ── Header band (light, so the fixed header's dark text stays readable) ── */}
      <section
        className="relative overflow-hidden pt-32 pb-12 sm:pt-36 lg:pt-40"
        style={{ background: "#faf8f3" }}
      >
        <svg
          viewBox="0 0 400 160"
          className="pointer-events-none absolute right-0 bottom-0 w-[26rem] max-w-[75%]"
          aria-hidden
        >
          <path
            d="M0 160 C120 142 235 92 400 22 L400 160 Z"
            fill="#f4ecdb"
            opacity="0.7"
          />
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
            opacity="0.8"
          />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#c49a3c]">
            {isAdmin ? "Account & admin" : "Account settings"}
            <span className="h-px w-12 bg-[#c49a3c]" aria-hidden />
          </p>
          <h1
            className="mt-4 text-5xl leading-[1.05] font-semibold text-[#14245a] sm:text-6xl"
            style={{ fontFamily: "var(--font-profile-serif)" }}
          >
            Your <em className="font-medium text-[#c49a3c]">profile.</em>
          </h1>
          <p className="mt-3 max-w-xl text-slate-500">
            {isAdmin
              ? "Manage your details, and run events, content and settings for the site."
              : "Keep your details up to date — they're used for your tickets and receipts."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── Left: profile card + tabs ── */}
          <aside className="w-full shrink-0 lg:w-72">
            <ProfileSidebar profile={profile} />

            <nav
              aria-label="Profile sections"
              className="mt-6 rounded-2xl bg-[#faf8f3] p-2 ring-1 ring-[#c49a3c]/15"
            >
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                Account
              </p>
              {/* Phones: tabs scroll sideways; large screens: a vertical list */}
              <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
                {accountTabs.map(renderTab)}
              </div>

              {adminTabs.length > 0 && (
                <>
                  <p className="mt-2 flex items-center gap-2 border-t border-[#c49a3c]/15 px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a8852f]">
                    <ShieldCheck className="h-3 w-3" aria-hidden /> Admin
                  </p>
                  <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
                    {adminTabs.map(renderTab)}
                  </div>
                </>
              )}
            </nav>
          </aside>

          {/* ── Right: the selected section ── */}
          <div className="min-w-0 flex-1">
            {activeTab === "profile" && <ProfileForm profile={profile} />}
            {activeTab === "password" && !isOAuthUser && <PasswordForm />}
            {isAdmin && adminData && isAdminTab(activeTab) && (
              <Suspense fallback={<ProfilePanelSkeleton />}>
                <AdminTabContent tab={activeTab} adminData={adminData} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
