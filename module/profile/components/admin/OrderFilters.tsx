// module/profile/components/admin/OrderFilters.tsx
"use client";

import { Search, X } from "lucide-react";
import type { OrderFilterState } from "@/types/profile";

type Props = {
  filters: OrderFilterState;
  onChange: (filters: OrderFilterState) => void;
  resultCount: number;
  totalCount: number;
};

export function OrderFilters({
  filters,
  onChange,
  resultCount,
  totalCount,
}: Props) {
  const update = (key: keyof OrderFilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActive =
    filters.search ||
    filters.paymentStatus !== "all" ||
    filters.orderStatus !== "all";

  return (
    <div className="space-y-3 mb-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search by name, email, phone, transaction ID..."
          className="w-full h-11 pl-9 pr-9 border border-slate-200 rounded-xl bg-white text-sm outline-none transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15"
        />
        {filters.search && (
          <button
            onClick={() => update("search", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
        {/* Order Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Order:
          </span>
          {[
            { value: "all", label: "All" },
            { value: "CONFIRMED", label: "Confirmed" },
            { value: "PENDING", label: "Pending" },
            { value: "CANCELLED", label: "Cancelled" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => update("orderStatus", option.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                filters.orderStatus === option.value
                  ? "bg-[#14245a] text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#c49a3c]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Payment Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Payment:
          </span>
          {[
            { value: "all", label: "All" },
            { value: "PAID", label: "Paid" },
            { value: "PENDING", label: "Pending" },
            { value: "FAILED", label: "Failed" },
            { value: "REFUNDED", label: "Refunded" },
          ].map((option) => (
            <button
              key={`pay-${option.value}`}
              onClick={() => update("paymentStatus", option.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                filters.paymentStatus === option.value
                  ? "bg-[#14245a] text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#c49a3c]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => update("sortBy", e.target.value)}
          className="h-8 px-3 border border-slate-200 rounded-lg bg-white text-xs font-medium text-[#14245a] outline-none focus:border-[#c49a3c] cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount_high">Amount: High → Low</option>
          <option value="amount_low">Amount: Low → High</option>
        </select>

        <select
          value={filters.source}
          onChange={(e) =>
            onChange({
              ...filters,
              source: e.target.value as OrderFilterState["source"],
            })
          }
          className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-[#14245a] cursor-pointer outline-none focus:border-[#c49a3c]"
        >
          <option value="all">All sources</option>
          <option value="ONLINE">Online</option>
          <option value="MANUAL">Manual</option>
        </select>

        {/* Result count */}
        <span className="ml-auto text-xs text-slate-400 tabular-nums">
          {resultCount === totalCount
            ? `${totalCount} orders`
            : `${resultCount} of ${totalCount}`}
        </span>

        {/* Clear */}
        {hasActive && (
          <button
            onClick={() =>
              onChange({
                search: "",
                paymentStatus: "all",
                orderStatus: "all",
                sortBy: "newest",
                source: "all",
              })
            }
            className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
