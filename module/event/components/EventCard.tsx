// module/event/components/EventCard.tsx
//
// Event listing card (events page, home page). Takes the event as loaded from
// the database and formats it here, so callers just render <EventCard event={e} />.

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { EventData } from "@/types/event";

interface EventCardProps {
  event: EventData;
}

// Event dates are stored as UTC midnight and times as UTC wall-clock
// (see app/actions/admin.ts), so format both in UTC.
const fmt = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Date(date).toLocaleString("en-US", { timeZone: "UTC", ...options });

const formatPrice = (price: number) => `৳${price.toLocaleString("en-IN")}`;

export default function EventCard({ event }: EventCardProps) {
  const isCompleted = event.status === "COMPLETED";
  const href = `/events/${event.slug}`;

  const month = fmt(event.date, { month: "short" });
  const day = fmt(event.date, { day: "2-digit" });
  const weekday = fmt(event.date, { weekday: "short" });
  const year = fmt(event.date, { year: "numeric" });
  const time = fmt(event.time, { hour: "2-digit", minute: "2-digit" });

  const packages = event.packages.filter((p) => !p.isArchived);
  const fromPrice = packages.length
    ? Math.min(...packages.map((p) => p.price))
    : null;

  return (
    <article
      className={`group grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 transition-shadow duration-300 lg:grid-cols-5 ${
        isCompleted
          ? "bg-gray-50"
          : "bg-white hover:shadow-xl hover:shadow-gray-900/5"
      }`}
    >
      {/* Photo: on top on small screens, right-hand side on large ones */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative block min-h-56 overflow-hidden sm:min-h-72 lg:order-2 lg:col-span-3 lg:min-h-full"
      >
        <img
          src={event.bannerImage}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
            isCompleted ? "grayscale opacity-80" : "group-hover:scale-[1.03]"
          }`}
        />

        {/* Date badge */}
        <div className="absolute left-4 top-4 rounded-xl bg-white px-3.5 py-2 text-center shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            {month}
          </p>
          <p className="[font-family:var(--font-heading)] text-3xl leading-none text-gray-900">
            {day}
          </p>
        </div>

        {/* Status / type tag */}
        <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur">
          {isCompleted
            ? "Completed"
            : event.eventType === "VIRTUAL"
              ? "Virtual"
              : "In person"}
        </span>
      </Link>

      {/* Details */}
      <div className="flex flex-col p-5 sm:p-7 md:p-9 lg:order-1 lg:col-span-2">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
            isCompleted ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {weekday}, {month} {day}, {year} · {time}
        </p>

        <h3 className="mt-3 text-3xl leading-tight uppercase tracking-normal md:text-4xl">
          <Link
            href={href}
            className={`transition-colors ${
              isCompleted
                ? "text-gray-600"
                : "text-gray-900 hover:text-neon-lime"
            }`}
          >
            {event.name}
          </Link>
        </h3>

        <p
          className={`mt-3 line-clamp-2 text-sm leading-relaxed md:text-base ${
            isCompleted ? "text-gray-500" : "text-gray-600"
          }`}
        >
          {event.shortDesc || event.description}
        </p>

        <p
          className={`mt-5 flex items-start gap-2 text-sm font-medium ${
            isCompleted ? "text-gray-500" : "text-gray-700"
          }`}
        >
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
            aria-hidden
          />
          {event.address}
        </p>

        {packages.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Distances">
            {packages.map((pkg) => (
              <li
                key={pkg.id}
                className={`rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold ${
                  isCompleted ? "text-gray-500" : "text-gray-700"
                }`}
              >
                {pkg.distance}
              </li>
            ))}
          </ul>
        )}

        {/* Footer: price and call to action, pinned to the bottom */}
        <div className="mt-auto pt-8">
          <div className="flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {fromPrice !== null && (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    {packages.length > 1 ? "From" : "Entry"}
                  </p>
                  <p
                    className={`[font-family:var(--font-heading)] text-3xl leading-none ${
                      isCompleted ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {formatPrice(fromPrice)}
                  </p>
                </>
              )}
            </div>

            <Link
              href={href}
              className={`flex w-full items-center justify-between gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-xs sm:inline-flex sm:w-auto sm:shrink-0 sm:justify-start font-semibold uppercase tracking-widest transition-colors duration-200 ${
                isCompleted
                  ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  : "bg-[#dcb45c] text-[#0d1840] hover:bg-[#14245a] hover:text-white"
              }`}
            >
              {isCompleted ? "View recap" : "Event details"}
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                  isCompleted ? "bg-gray-700" : "bg-[#14245a]"
                }`}
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
