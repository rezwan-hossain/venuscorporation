// module/dashboard/components/StatCard.tsx
//
// One dashboard number: gold icon circle, label, big serif value and a short
// status line (green = good, amber = needs attention, grey = nothing yet).

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

const TONE = {
  positive: "text-emerald-600",
  negative: "text-amber-600",
  neutral: "text-slate-400",
} as const;

export function StatCard({ title, value, change, changeType, icon: Icon }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#c49a3c]/20 bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#14245a]/10">
      {/* Gold line that grows along the top on hover */}
      <span aria-hidden className="absolute top-0 left-0 h-0.5 w-10 bg-[#c49a3c] transition-all duration-500 group-hover:w-full" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14245a] text-[#dcb45c]">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-4xl leading-none font-semibold text-[#14245a] lining-nums" style={{ fontFamily: "var(--font-dashboard-serif)" }}>
        {value}
      </p>
      <p className={`mt-3 text-xs font-medium ${TONE[changeType]}`}>{change}</p>
    </div>
  );
}
