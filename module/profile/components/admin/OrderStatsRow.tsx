// module/profile/components/admin/OrderStatsRow.tsx
"use client";

import type { OrderStats } from "@/types/profile";
import { ShoppingBag, CheckCircle2, Clock, XCircle } from "lucide-react";

type Props = {
  /** Null while the aggregate query is still in flight. */
  stats: OrderStats | null;
};

/**
 * Whole-event totals.
 *
 * These used to be summed in the browser from every order on the event, which
 * meant the modal had to download all of them first. They're now computed by
 * Postgres via groupBy/aggregate, so this component just renders numbers.
 */
export function OrderStatsRow({ stats }: Props) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[70px] rounded-xl bg-white ring-1 ring-slate-200/70 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: ShoppingBag,
      tone: "text-[#14245a]",
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      tone: "text-amber-500",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      tone: "text-red-500",
    },
  ];

  return (
    <div className="mb-5 grid gap-2 lg:grid-cols-[1fr_auto]">
      {/* Order counts by status */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-3 ring-1 ring-slate-200/70"
          >
            <div className="flex items-center gap-1.5">
              <card.icon size={13} className={card.tone} />
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {card.label}
              </span>
            </div>
            <p className="mt-1 text-xl font-semibold text-[#14245a] tabular-nums">
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Money: collected vs. total value */}
      <div className="flex items-center gap-5 rounded-xl bg-[#14245a] px-4 py-3 text-white">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[#dcb45c] uppercase">
            Collected
          </span>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            ৳{stats.paidRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="h-10 w-px bg-white/15" />
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">
            Total value
          </span>
          <p className="mt-1 text-xl font-semibold text-white/80 tabular-nums">
            ৳{stats.totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}
