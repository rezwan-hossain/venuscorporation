// module/profile/components/admin/EventsList.tsx
"use client";

import { useState } from "react";
import type { AdminEvent } from "@/types/profile";
import {
  Calendar,
  MapPin,
  Users,
  Package,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Activity,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  toggleEventActive,
  deleteEvent,
  getAdminEvents,
} from "@/app/actions/admin";
import { getEventCategory } from "@/lib/event-checkout-form";

// Badge colours per event status.
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
  DEFAULT: "bg-slate-100 text-slate-500",
};

const iconButton =
  "cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14245a]";

type EventsListProps = {
  events: AdminEvent[];
  onEdit: (event: AdminEvent) => void;
  onViewOrders: (event: AdminEvent) => void; // ← NEW
  onViewActivity: (event: AdminEvent) => void;
  onRefresh: (events: AdminEvent[]) => void;
  /** Open "payments needing attention" per event id. */
  issueCounts?: Record<string, number>;
  onViewIssues?: (event: AdminEvent) => void;
};

export function EventsList({
  events,
  onEdit,
  onViewOrders, // ← NEW
  onViewActivity,
  onRefresh,
  issueCounts = {},
  onViewIssues,
}: EventsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (eventId: string, currentActive: boolean) => {
    setLoadingId(eventId);
    await toggleEventActive(eventId, !currentActive);
    const { events: updated } = await getAdminEvents();
    onRefresh(updated);
    setLoadingId(null);
  };

  const handleDelete = async (eventId: string, eventName: string) => {
    if (!confirm(`Delete "${eventName}"? This action cannot be undone.`))
      return;
    setLoadingId(eventId);
    await deleteEvent(eventId);
    const { events: updated } = await getAdminEvents();
    onRefresh(updated);
    setLoadingId(null);
  };

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] p-12 text-center">
        <Calendar className="mx-auto mb-4 h-10 w-10 text-[#c49a3c]" />
        <p className="text-lg font-semibold text-[#14245a]">No events yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Create your first event to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const date = new Date(event.date);
        const issues = issueCounts[event.id] ?? 0;
        const busy = loadingId === event.id;

        return (
          <div
            key={event.id}
            className={`group rounded-2xl bg-white p-3 ring-1 transition hover:shadow-lg hover:shadow-[#14245a]/5 sm:p-4 ${
              event.isActive
                ? "ring-slate-200/80"
                : "ring-slate-200/80 opacity-70"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Photo with a calendar tile for the date */}
              <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-auto sm:min-h-32 sm:w-44">
                <img
                  src={event.thumbImage || event.bannerImage}
                  alt={event.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 w-12 overflow-hidden rounded-lg bg-white text-center shadow-md">
                  <p className="bg-[#14245a] py-0.5 text-[9px] font-bold tracking-widest text-[#dcb45c] uppercase">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </p>
                  <p className="py-0.5 text-lg leading-tight font-bold text-[#14245a]">
                    {date.getDate()}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                {/* Badges: status, category, format, hidden */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${STATUS_STYLES[event.status] ?? STATUS_STYLES.DEFAULT}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {event.status}
                  </span>
                  <span className="rounded-full bg-[#c49a3c]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#a8852f] uppercase">
                    {getEventCategory(event.category).label.split(" /")[0]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                    {event.eventType === "VIRTUAL" ? "Virtual" : "In person"}
                  </span>
                  {!event.isActive && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-red-600 uppercase">
                      Hidden
                    </span>
                  )}
                </div>

                <p className="mt-2 truncate text-base font-semibold text-[#14245a] sm:text-lg">
                  {event.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {event.organizer.name} · /{event.slug}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#c49a3c]" />
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <MapPin size={13} className="shrink-0 text-[#c49a3c]" />
                    <span className="truncate">{event.address}</span>
                  </span>
                </div>

                {/* Packages */}
                {event.packages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {event.packages.map((pkg) => (
                      <span
                        key={pkg.id}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600"
                      >
                        <Package size={11} className="text-slate-400" />
                        {pkg.distance}
                        <span className="font-semibold text-[#14245a]">
                          ৳{Number(pkg.price).toLocaleString("en-IN")}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:w-44 sm:flex-col sm:items-stretch sm:justify-start sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                {/* Main actions */}
                <div className="flex gap-2 sm:flex-col">
                  <button
                    onClick={() => onViewOrders(event)}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-[#14245a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1d3274]"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users size={14} /> Orders
                    </span>
                    <span className="rounded-full bg-white/15 px-1.5 text-[11px] text-[#dcb45c]">
                      {event._count.orders}
                    </span>
                  </button>
                  <button
                    onClick={() => onEdit(event)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#14245a] transition hover:border-[#c49a3c] hover:bg-[#faf8f3]"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                </div>

                {/* Small icon actions */}
                <div className="flex items-center gap-0.5 sm:justify-between">
                  {busy ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin text-slate-400" />
                  ) : (
                    <>
                      <Link
                        href={`/events/${event.slug}`}
                        className={iconButton}
                        title="View on site"
                      >
                        <Eye size={15} />
                      </Link>

                      {/* Payments needing attention for this event */}
                      {onViewIssues && issues > 0 && (
                        <button
                          onClick={() => onViewIssues(event)}
                          className={`${iconButton} relative text-red-500 hover:bg-red-50 hover:text-red-700`}
                          title={`${issues} payment${issues === 1 ? " needs" : "s need"} attention`}
                        >
                          <AlertTriangle size={15} />
                          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                            {issues}
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewActivity(event)}
                        className={iconButton}
                        title="Activity log"
                      >
                        <Activity size={15} />
                      </button>
                      <button
                        onClick={() => handleToggle(event.id, event.isActive)}
                        className={`${iconButton} ${event.isActive ? "text-emerald-600" : "text-slate-400"}`}
                        title={
                          event.isActive ? "Hide from site" : "Show on site"
                        }
                      >
                        {event.isActive ? (
                          <ToggleRight size={17} />
                        ) : (
                          <ToggleLeft size={17} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(event.id, event.name)}
                        className={`${iconButton} hover:bg-red-50 hover:text-red-600`}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
