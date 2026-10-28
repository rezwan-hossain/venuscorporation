// module/dashboard/components/UpcomingEvents.tsx
//
// Dashboard sidebar: events open for registration, as compact cards
// (photo with type tag, name, date, venue, "from" price), then "All events".

import type { DashboardEvent } from "@/types/dashboard";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

type UpcomingEventsProps = {
  events: DashboardEvent[];
};

const SERIF = { fontFamily: "var(--font-dashboard-serif)" } as const;

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">No events open right now — check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const fromPrice = event.packages.length ? Math.min(...event.packages.map((p) => p.price)) : null;
        return (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group flex gap-4 rounded-2xl border border-[#c49a3c]/20 bg-white p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[#c49a3c]/40 hover:shadow-lg hover:shadow-[#14245a]/10"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#14245a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.bannerImage} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-[#0d1840]/70 py-0.5 text-center text-[9px] font-semibold tracking-[0.15em] text-white uppercase backdrop-blur">
                {event.eventType === "VIRTUAL" ? "Virtual" : "In person"}
              </span>
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <h3 className="line-clamp-2 text-lg leading-tight font-semibold text-[#14245a]" style={SERIF}>
                {event.name}
              </h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-[#c49a3c]" aria-hidden />
                {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#c49a3c]" aria-hidden />
                <span className="truncate">{event.address}</span>
              </p>
              {fromPrice !== null && (
                <p className="mt-1.5 text-xs text-slate-400">
                  From <span className="text-sm font-semibold text-[#14245a]">৳{fromPrice.toLocaleString("en-IN")}</span>
                </p>
              )}
            </div>
          </Link>
        );
      })}

      <Link
        href="/events"
        className="group flex items-center justify-center gap-2 rounded-2xl border border-[#c49a3c]/40 py-3 text-sm font-semibold text-[#14245a] transition hover:bg-[#14245a] hover:text-white"
      >
        All events <ArrowRight size={15} className="text-[#c49a3c] transition-transform group-hover:translate-x-1" aria-hidden />
      </Link>
    </div>
  );
}
