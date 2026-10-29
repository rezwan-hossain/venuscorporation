// module/profile/components/admin/AdminDashboardPanel.tsx
"use client";

// Admin dashboard. Data: getAnalytics() in app/actions/analytics.ts.
//
// Sections, top to bottom:
//   headline numbers · trends · pace · traffic · packages
//   attendees by event type        (all events, when there's more than one type)
//   marathon runners               (only when the selection has marathon sign-ups)
//   checkout answers               (conference, expo, gala, workshop questions)
//   money · coupons · returning attendees

import { useCallback, useEffect, useState } from "react";
import { getAnalytics } from "@/app/actions/analytics";
import { AdminReturningRunnersPanel } from "./AdminReturningRunnersPanel";
import { PaceCard } from "./analytics/PaceCard";
import { TrafficCard } from "./analytics/TrafficCard";
import type { AnalyticsData, AnalyticsRange } from "@/types/analytics";
import { BadgePercent, RefreshCw, Ticket, TrendingUp, Users } from "lucide-react";
import {
  BarList,
  Card,
  ColumnChart,
  CouponTable,
  PackageTable,
  SERIES_1,
  StatTile,
  num,
  taka,
} from "./analytics/charts";

type Props = {
  events: { id: string; name: string }[];
};

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All time" },
];

/** A small heading between groups of cards. */
function SectionTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-center gap-3 pt-3">
      <p className="text-[11px] font-semibold tracking-[0.2em] whitespace-nowrap text-[#a8852f] uppercase">
        {title}
      </p>
      {note && (
        <span className="text-xs whitespace-nowrap text-slate-400">{note}</span>
      )}
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] bg-white rounded-2xl ring-1 ring-slate-200/70"
          />
        ))}
      </div>
      <div className="h-64 bg-white rounded-2xl ring-1 ring-slate-200/70" />
      <div className="h-64 bg-white rounded-2xl ring-1 ring-slate-200/70" />
    </div>
  );
}

export function AdminDashboardPanel({ events }: Props) {
  const [eventId, setEventId] = useState<string>("all");
  const [range, setRange] = useState<AnalyticsRange>("30");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State is only set when the request returns; handlers flip `loading` first.
  const load = useCallback(
    (ev: string, r: AnalyticsRange) =>
      getAnalytics(ev, r).then((res) => {
        setData(res.data);
        setError(res.error ?? "");
        setLoading(false);
      }),
    [],
  );

  useEffect(() => {
    void load("all", "30");
  }, [load]);

  const change = (ev: string, r: AnalyticsRange) => {
    setEventId(ev);
    setRange(r);
    setLoading(true);
    void load(ev, r);
  };

  const k = data?.kpis;
  const rangeText = range === "all" ? "all time" : `last ${range} days`;

  return (
    <div className="space-y-4">
      {/* Header + filters (one row) */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
            Overview
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#14245a]">
            Dashboard
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Registrations, revenue and attendees ·{" "}
            <span className="font-semibold text-[#a8852f]">{rangeText}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="dash-event" className="sr-only">
            Event
          </label>
          <select
            id="dash-event"
            value={eventId}
            onChange={(e) => change(e.target.value, range)}
            className="h-9 max-w-[14rem] px-3 rounded-xl border border-slate-200 bg-white text-sm text-[#14245a] cursor-pointer outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15"
          >
            <option value="all">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <div
            className="flex rounded-xl border border-slate-200 bg-white p-0.5"
            role="group"
            aria-label="Time range"
          >
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => change(eventId, r.value)}
                aria-pressed={range === r.value}
                className={`px-2.5 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  range === r.value
                    ? "bg-[#14245a] text-white shadow-sm"
                    : "text-slate-600 hover:bg-[#faf8f3] hover:text-[#14245a]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => change(eventId, range)}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-[#14245a] hover:border-[#c49a3c] cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </p>
      )}

      {!data || !k ? (
        loading ? (
          <DashboardSkeleton />
        ) : null
      ) : (
        <div
          className={`space-y-4 transition-opacity ${loading ? "opacity-60" : ""}`}
        >
          {/* Headline numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile
              icon={TrendingUp}
              label="Revenue"
              value={taka(k.revenue)}
              note={`${num(k.paidOrders)} paid order${k.paidOrders === 1 ? "" : "s"} · avg ${taka(k.avgOrderValue)}`}
            />
            <StatTile
              icon={Users}
              label="Paid attendees"
              value={num(k.paidAttendees)}
              note={`${num(k.pendingOrders)} unpaid · ${num(k.cancelledOrders)} cancelled`}
            />
            <StatTile
              icon={Ticket}
              label="Checkout conversion"
              value={
                k.conversionRate === null
                  ? "—"
                  : `${Math.round(k.conversionRate * 100)}%`
              }
              note="Online orders that got paid"
            />
            <StatTile
              icon={BadgePercent}
              label="Discounts given"
              value={taka(k.discounts)}
              note={
                k.refunded > 0
                  ? `${taka(k.refunded)} refunded`
                  : "Coupons on paid orders"
              }
            />
          </div>

          <SectionTitle title="Trends" note={rangeText} />

          {/* Trends — separate charts, never two scales on one axis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card
              title="Paid registrations"
              subtitle={`Attendees per ${data.bucket} by order date (Dhaka time)`}
            >
              <ColumnChart
                points={data.series.map((p) => ({
                  date: p.date,
                  value: p.registrations,
                }))}
                format={num}
                unitLabel="paid registrations"
                bucket={data.bucket}
                color={SERIES_1}
              />
            </Card>
            <Card
              title="Revenue"
              subtitle={`Paid amount per ${data.bucket} by order date`}
            >
              <ColumnChart
                points={data.series.map((p) => ({
                  date: p.date,
                  value: p.revenue,
                }))}
                format={taka}
                unitLabel="revenue"
                bucket={data.bucket}
                color={SERIES_1}
              />
            </Card>
          </div>

          <SectionTitle title="Pace & traffic" />

          {/* This event vs last event */}
          <PaceCard key={eventId} eventId={eventId} />

          {/* Built-in page-view counter + visit → paid funnel */}
          <TrafficCard eventId={eventId} range={range} />

          <SectionTitle title="Tickets" />

          {/* Packages */}
          <Card
            title="Packages"
            subtitle="All-time capacity, sales and sell-out forecast"
          >
            <PackageTable rows={data.packages} showEvent={eventId === "all"} />
          </Card>

          {/* Attendees per event type: only useful with more than one type */}
          {data.breakdowns.categories.length > 1 && (
            <Card title="Attendees by event type" subtitle="Paid attendees">
              <BarList items={data.breakdowns.categories} />
            </Card>
          )}

          {/* Runners: marathon sign-ups only (other events don't ask these) */}
          {data.breakdowns.runners > 0 && (
            <>
              <SectionTitle
                title="Runners"
                note={`${num(data.breakdowns.runners)} paid marathon runner${data.breakdowns.runners === 1 ? "" : "s"}`}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  title="T-shirt sizes"
                  subtitle="In-person runs · for the print order"
                >
                  <BarList items={data.breakdowns.tshirt} />
                </Card>
                <Card title="Age groups" subtitle="From date of birth">
                  <BarList items={data.breakdowns.ageGroups} />
                </Card>
                <Card title="Gender">
                  <BarList items={data.breakdowns.gender} />
                </Card>
                <Card title="Blood group" subtitle="For the medical team">
                  <BarList items={data.breakdowns.bloodGroup} />
                </Card>
                <Card
                  title="Top communities"
                  subtitle="Running clubs and groups"
                >
                  <BarList
                    items={data.breakdowns.communities}
                    empty="No community names given"
                  />
                </Card>
                <Card title="Age category">
                  <BarList items={data.breakdowns.ageCategory} />
                </Card>
              </div>
            </>
          )}

          {/* Checkout answers: one card per question (non-marathon events) */}
          {data.breakdowns.answers.length > 0 && (
            <>
              <SectionTitle
                title="Checkout answers"
                note="One answer per paid order"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.breakdowns.answers.map((answer) => (
                  <Card key={answer.title} title={answer.title}>
                    <BarList items={answer.items} />
                  </Card>
                ))}
              </div>
            </>
          )}

          <SectionTitle title="Money" note="Paid orders" />

          {/* Money */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Payment methods" subtitle="Paid orders">
              <BarList
                items={data.breakdowns.paymentMethods}
                empty="No paid orders yet"
              />
            </Card>
            <Card title="Registration source" subtitle="Paid attendees">
              <BarList items={data.breakdowns.source} />
            </Card>
          </div>
          <Card title="Coupons" subtitle="Paid orders that used a coupon">
            <CouponTable rows={data.coupons} />
          </Card>

          {/* Follows the event filter at the top; always all-time. */}
          <SectionTitle title="Loyalty" note="All time" />
          <section className="bg-white rounded-2xl ring-1 ring-slate-200/70 p-5">
            <AdminReturningRunnersPanel
              events={events}
              eventId={eventId}
              embedded
            />
          </section>

          <p className="text-center text-[11px] text-slate-400">
            Updated{" "}
            {new Date(data.generatedAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Dhaka",
            })}{" "}
            (Dhaka). Revenue counts PAID payments only; refunded money is
            excluded.
          </p>
        </div>
      )}
    </div>
  );
}
