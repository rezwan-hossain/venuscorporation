// module/dashboard/pages/DashboardPage.tsx
//
// /dashboard — the signed-in user's home (brand navy + gold):
//   1. Cream welcome band: avatar, "Welcome back", details, actions
//   2. Four stat cards
//   3. Left: upcoming registrations, pending payments, all registrations
//      Right: events open for registration
"use client";

import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import { CalendarCheck, CreditCard, ShoppingBag, Sparkles, Ticket, Timer, type LucideIcon } from "lucide-react";
import type { DashboardUser, DashboardStats, DashboardOrder, DashboardEvent } from "@/types/dashboard";
import { StatCard } from "../components/StatCard";
import { UserProfileCard } from "../components/UserProfileCard";
import { MyRegistrations } from "../components/MyRegistrations";
import { UpcomingEvents } from "../components/UpcomingEvents";

// The business card's elegant serif — used by every dashboard component
// through var(--font-dashboard-serif).
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-dashboard-serif",
});

type DashboardPageProps = {
  user: DashboardUser;
  stats: DashboardStats;
  orders: DashboardOrder[];
  activeEvents: DashboardEvent[];
};

/** Section heading: navy icon circle, serif title, optional count. */
function SectionTitle({ icon: Icon, title, count }: { icon: LucideIcon; title: string; count?: number }) {
  return (
    <h2 className="mb-4 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14245a] text-[#dcb45c]">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-2xl font-semibold text-[#14245a]" style={{ fontFamily: "var(--font-dashboard-serif)" }}>
        {title}
      </span>
      {count !== undefined && <span className="rounded-full bg-[#c49a3c]/15 px-2 py-0.5 text-xs font-semibold text-[#a8852f]">{count}</span>}
      <span className="h-px flex-1 bg-[#c49a3c]/20" aria-hidden />
    </h2>
  );
}

const DashboardPage = ({ user, stats, orders, activeEvents }: DashboardPageProps) => {
  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED");
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const paidOrders = orders.filter((o) => o.payment?.status === "PAID");
  const upcomingRegistrations = confirmedOrders.filter((o) => new Date(o.event.date) >= new Date());

  const statCards = [
    {
      title: "Registrations",
      value: String(stats.totalOrders),
      change: stats.confirmedOrders > 0 ? `${stats.confirmedOrders} confirmed` : "No registrations yet",
      changeType: stats.confirmedOrders > 0 ? ("positive" as const) : ("neutral" as const),
      icon: Ticket,
    },
    {
      title: "Upcoming",
      value: String(stats.upcomingEvents),
      change: stats.upcomingEvents > 0 ? "Events you're going to" : "No upcoming events",
      changeType: stats.upcomingEvents > 0 ? ("positive" as const) : ("neutral" as const),
      icon: CalendarCheck,
    },
    {
      title: "Total paid",
      value: `৳${stats.totalPaid.toLocaleString("en-IN")}`,
      change: paidOrders.length > 0 ? `${paidOrders.length} payment${paidOrders.length > 1 ? "s" : ""} completed` : "No payments yet",
      changeType: paidOrders.length > 0 ? ("positive" as const) : ("neutral" as const),
      icon: CreditCard,
    },
    {
      title: "Pending",
      value: String(stats.pendingOrders),
      change: stats.pendingOrders > 0 ? "Awaiting payment" : "All payments up to date",
      changeType: stats.pendingOrders > 0 ? ("negative" as const) : ("positive" as const),
      icon: Timer,
    },
  ];

  return (
    <div className={`${serif.variable} min-h-screen bg-white`}>
      {/* ── 1. Welcome band (light, so the fixed header's dark text stays readable) ── */}
      <section className="relative overflow-hidden pt-32 pb-14 sm:pt-36 lg:pt-40" style={{ background: "#faf8f3" }}>
        <svg viewBox="0 0 400 160" className="pointer-events-none absolute right-0 bottom-0 w-[28rem] max-w-[80%]" aria-hidden>
          <path d="M0 160 C120 142 235 92 400 22 L400 160 Z" fill="#f4ecdb" opacity="0.7" />
          <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke="#c49a3c" strokeWidth="2.5" />
          <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke="#c49a3c" strokeWidth="1.25" opacity="0.8" />
        </svg>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <UserProfileCard user={user} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* ── 2. Stats (pulled up over the band) ── */}
        <div className="relative -mt-7 mb-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statCards.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        {/* ── 3. Registrations + open events ── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {pendingOrders.length > 0 && (
              <section>
                <SectionTitle icon={Timer} title="Pending payments" count={pendingOrders.length} />
                <MyRegistrations orders={pendingOrders} variant="pending" />
              </section>
            )}

            {upcomingRegistrations.length > 0 && (
              <section>
                <SectionTitle icon={CalendarCheck} title="Your upcoming events" count={upcomingRegistrations.length} />
                <MyRegistrations orders={upcomingRegistrations} variant="upcoming" />
              </section>
            )}

            <section>
              <SectionTitle icon={ShoppingBag} title="All registrations" count={orders.length} />
              {orders.length > 0 ? (
                <MyRegistrations orders={orders} variant="all" />
              ) : (
                <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] px-6 py-14 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#14245a] text-[#dcb45c]">
                    <Ticket className="h-6 w-6" aria-hidden />
                  </span>
                  <p className="mt-5 text-2xl font-semibold text-[#14245a]" style={{ fontFamily: "var(--font-dashboard-serif)" }}>
                    No registrations <em className="font-medium text-[#c49a3c]">yet</em>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Find an event you like and reserve your place.</p>
                  <Link
                    href="/events"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#14245a] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d1840]"
                  >
                    Browse events
                  </Link>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <SectionTitle icon={Sparkles} title="Open for registration" />
            <UpcomingEvents events={activeEvents} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
