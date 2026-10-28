// module/profile/components/admin/EventOrdersModal.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getEventOrdersPaged,
  getEventOrdersForExport,
} from "@/app/actions/event-orders";
import type {
  AdminEvent,
  EventOrder,
  OrderFilterState,
  OrderStats,
} from "@/types/profile";
import { OrderStatsRow } from "./OrderStatsRow";
import { OrderFilters } from "./OrderFilters";
import { OrderCard } from "./OrderCard";
import { ManualRegistrationForm } from "./ManualRegistrationForm";
import { buildOrdersCsv, downloadCsv } from "@/lib/orders-csv";
import {
  X,
  Loader2,
  ShoppingBag,
  Download,
  RefreshCw,
  UserPlus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type View = "list" | "create";

type Props = {
  event: AdminEvent;
  onClose: () => void;
  /** Open straight into the manual registration form. */
  initialView?: View;
};

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

const DEFAULT_FILTERS: OrderFilterState = {
  search: "",
  paymentStatus: "all",
  orderStatus: "all",
  source: "all",
  sortBy: "newest",
};

export function EventOrdersModal({ event, onClose, initialView }: Props) {
  const [view, setView] = useState<View>(initialView ?? "list");

  // ─── Server-driven list state ────────────────────
  const [orders, setOrders] = useState<EventOrder[]>([]);
  const [total, setTotal] = useState(0); // rows matching the current filters
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<OrderStats | null>(null);

  const [firstLoad, setFirstLoad] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilterState>(DEFAULT_FILTERS);

  // Typing shouldn't fire a request per keystroke. Dropdowns and page clicks
  // are instant; only the search box waits.
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  // Guards against a slow early request landing after a newer one.
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(filters.search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [filters.search]);

  // ─── Load a page (orders + total + stats in one call) ───
  const loadPage = useCallback(async () => {
    const id = ++requestId.current;
    setFetching(true);

    const result = await getEventOrdersPaged(event.id, {
      search: debouncedSearch,
      paymentStatus: filters.paymentStatus,
      orderStatus: filters.orderStatus,
      source: filters.source,
      sortBy: filters.sortBy,
      page,
      pageSize: PAGE_SIZE,
    });

    // A newer request already started — throw this result away.
    if (id !== requestId.current) return;

    setError(result.error ?? "");
    setOrders(result.orders);
    setTotal(result.total);
    if (result.stats) setStats(result.stats);
    setFetching(false);
    setFirstLoad(false);
  }, [
    event.id,
    debouncedSearch,
    filters.paymentStatus,
    filters.orderStatus,
    filters.source,
    filters.sortBy,
    page,
  ]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  // ─── Close on Escape ─────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (view === "create") setView("list");
      else onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, view]);

  // ─── Prevent body scroll ─────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ─── Handlers ────────────────────────────────────

  // Changing a filter must send you back to page 1 — page 4 of the old
  // result set is meaningless against the new one. Both setters run in the
  // same handler so React batches them into a single fetch.
  const handleFilterChange = (next: OrderFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const handleRefresh = () => void loadPage();

  const handleManualSuccess = async () => {
    setView("list");
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    await loadPage();
  };

  // Update the row immediately so it feels instant, then resync from the
  // server — the status counts and revenue totals have moved too.
  const handleStatusChange = (
    orderId: string,
    newOrderStatus: string,
    newPaymentStatus: string,
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newOrderStatus,
              payment: o.payment
                ? { ...o.payment, status: newPaymentStatus }
                : null,
            }
          : o,
      ),
    );
    void loadPage();
  };

  // ─── CSV Export ───────────────────────────────────
  // Pulls every row matching the current filters, not just this page.
  const exportCSV = async () => {
    setExporting(true);

    const {
      orders: all,
      truncated,
      error: exportError,
    } = await getEventOrdersForExport(event.id, {
      search: debouncedSearch,
      paymentStatus: filters.paymentStatus,
      orderStatus: filters.orderStatus,
      source: filters.source,
      sortBy: filters.sortBy,
    });

    if (exportError) {
      setError(exportError);
      setExporting(false);
      return;
    }

    downloadCsv(
      `${event.slug}-orders-${new Date().toISOString().split("T")[0]}.csv`,
      buildOrdersCsv(all, event),
    );
    setError(
      truncated
        ? `Only the first ${all.length.toLocaleString()} orders were exported. Use the filters to export the rest in parts.`
        : "",
    );
    setExporting(false);
  };

  // ─── Derived ─────────────────────────────────────
  const isCreating = view === "create";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  // stats.total is the whole event; total is the filtered count. The two
  // together tell us whether an empty list means "no orders" or "no matches".
  const eventHasNoOrders = stats !== null && stats.total === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop — inert while the form is open so a stray click can't throw
          away a half-filled registration. */}
      <div
        className="absolute inset-0 bg-[#0d1840]/60 backdrop-blur-sm"
        onClick={isCreating ? undefined : onClose}
      />

      <div
        ref={modalRef}
        className="relative mx-3 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#faf8f3] shadow-2xl ring-1 ring-[#c49a3c]/20 sm:mx-4"
      >
        {/* ─── Header ─── */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#c49a3c]/15 bg-white px-4 py-4 sm:px-6">
          {isCreating ? (
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#14245a] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to orders
            </button>
          ) : (
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
                Orders · {stats ? `${stats.total.toLocaleString()} total` : "…"}
              </p>
              <p className="mt-0.5 truncate text-lg font-semibold text-[#14245a] sm:text-xl">
                {event.name}
              </p>
            </div>
          )}

          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
            {!isCreating && (
              <>
                <button
                  onClick={() => setView("create")}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#14245a] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1d3274]"
                  title="Register a participant manually"
                >
                  <UserPlus size={13} />
                  <span className="hidden sm:inline">Add</span> Manual
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={fetching}
                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14245a] disabled:opacity-50"
                  title="Refresh orders"
                >
                  <RefreshCw
                    size={16}
                    className={fetching ? "animate-spin" : ""}
                  />
                </button>

                {total > 0 && (
                  <button
                    onClick={exportCSV}
                    disabled={exporting}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#14245a] transition-colors hover:border-[#c49a3c] disabled:opacity-50"
                    title={`Export all ${total.toLocaleString()} matching orders`}
                  >
                    {exporting ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    CSV
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14245a]"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {isCreating ? (
            <ManualRegistrationForm
              event={event}
              onCancel={() => setView("list")}
              onSuccess={handleManualSuccess}
            />
          ) : firstLoad ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#c49a3c] mb-3" />
              <p className="text-sm text-slate-400">Loading orders...</p>
            </div>
          ) : eventHasNoOrders ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-white ring-1 ring-[#c49a3c]/30 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-[#c49a3c]" />
              </div>
              <p className="text-[#14245a] font-semibold text-lg">
                No orders yet
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Orders appear here once people register
              </p>
              <button
                onClick={() => setView("create")}
                className="mt-5 flex items-center gap-2 px-5 py-3 bg-[#14245a] text-white text-xs font-semibold rounded-lg hover:bg-[#1d3274] transition-colors cursor-pointer"
              >
                <UserPlus size={14} />
                Register someone manually
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs font-medium">{error}</p>
                </div>
              )}

              <OrderStatsRow stats={stats} />

              <OrderFilters
                filters={filters}
                onChange={handleFilterChange}
                resultCount={total}
                totalCount={stats?.total ?? total}
              />

              {total === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
                  <p className="text-slate-500 font-medium">
                    No orders match your filters
                  </p>
                  <button
                    onClick={() => handleFilterChange(DEFAULT_FILTERS)}
                    className="text-sm text-[#14245a] font-semibold mt-2 underline decoration-[#c49a3c] cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                // Dim rather than blank while a page loads — the list doesn't
                // jump and the admin keeps their place.
                <div
                  className={`space-y-2 transition-opacity ${
                    fetching ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onDetailsSaved={() => void loadPage()}
                      expanded={expandedOrder === order.id}
                      onToggle={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id,
                        )
                      }
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Footer ─── */}
        {!isCreating && !firstLoad && !eventHasNoOrders && (
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-[#c49a3c]/15 bg-white px-4 py-3 sm:px-6">
            <p className="text-xs text-slate-400 whitespace-nowrap tabular-nums">
              {rangeStart}–{rangeEnd} of {total.toLocaleString()}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || fetching}
                  className="p-1.5 text-[#14245a] rounded-lg border border-slate-200 hover:border-[#c49a3c] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold text-[#14245a] px-2 tabular-nums">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || fetching}
                  className="p-1.5 text-[#14245a] rounded-lg border border-slate-200 hover:border-[#c49a3c] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <p className="text-xs whitespace-nowrap text-slate-500">
              Collected{" "}
              <span className="font-semibold text-[#14245a] tabular-nums">
                ৳{(stats?.paidRevenue ?? 0).toLocaleString("en-IN")}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
