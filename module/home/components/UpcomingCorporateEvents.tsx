// module/home/components/UpcomingCorporateEvents.tsx
//
// Homepage "Upcoming corporate events" — the next 4 events on the calendar
// (real events from the database, soonest first), each linking to its page.
//   Large screens: the soonest event is featured (big photo card with date
//   badge, In person/Virtual tag and a "Next up" tag), the other three are
//   rows beside it (date line, name, venue, price tag, arrow).
//   Small screens: featured card, then the rows.
// Shows nothing at all if there are no upcoming events.
//
// Data: getNextEvents() in app/actions/event.ts.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, ArrowUpRight, Clock, MapPin } from "lucide-react";

import { getNextEvents } from "@/app/actions/event";

// The business card's elegant serif.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-upcoming-serif",
});

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on navy
const GOLD_DARK = "#a8852f"; // gold for small text on white
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-upcoming-serif)" } as const;

// Event dates are stored as UTC midnight and times as UTC wall-clock
// (see app/actions/admin.ts), so format both in UTC.
const fmt = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Date(date).toLocaleString("en-US", { timeZone: "UTC", ...options });
const formatPrice = (price: number) => `৳${price.toLocaleString("en-IN")}`;

type NextEvent = Awaited<ReturnType<typeof getNextEvents>>["events"][number];

/** Everything a card needs, formatted once. */
function details(event: NextEvent) {
  const packages = event.packages.filter((p) => !p.isArchived);
  return {
    href: `/events/${event.slug}`,
    image: event.thumbImage || event.bannerImage,
    day: fmt(event.date, { day: "2-digit" }),
    month: fmt(event.date, { month: "short" }),
    weekday: fmt(event.date, { weekday: "short" }),
    longDate: fmt(event.date, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    shortDate: fmt(event.date, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    type: event.eventType === "VIRTUAL" ? "Virtual" : "In person",
    time: fmt(event.time, { hour: "2-digit", minute: "2-digit" }),
    fromPrice: packages.length
      ? Math.min(...packages.map((p) => p.price))
      : null,
  };
}

/** Navy date badge: "12 / DEC". */
function DateBadge({
  day,
  month,
  weekday,
  large = false,
}: {
  day: string;
  month: string;
  weekday?: string;
  large?: boolean;
}) {
  return (
    <span
      className={`flex flex-col items-center justify-center rounded-2xl text-white shadow-lg shadow-black/20 ${large ? "h-[5.5rem] w-20" : "h-16 w-16"}`}
      style={{ background: NAVY, boxShadow: `inset 0 0 0 1px ${GOLD_LIGHT}66` }}
    >
      <span
        className={`leading-none font-semibold lining-nums ${large ? "text-3xl" : "text-2xl"}`}
        style={SERIF}
      >
        {day}
      </span>
      <span
        className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em]"
        style={{ color: GOLD_LIGHT }}
      >
        {month}
      </span>
      {weekday && (
        <span className="mt-0.5 text-[10px] text-white/60">{weekday}</span>
      )}
    </span>
  );
}

export default async function UpcomingCorporateEvents() {
  const { events } = await getNextEvents(4);
  if (events.length === 0) return null;

  const [featured, ...rest] = events;
  const f = details(featured);

  return (
    <section className={`${serif.variable} ${container} py-24 lg:py-32`}>
      {/* ── 1. Heading ─────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p
            className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            On the calendar
            <span
              className="h-px w-12"
              style={{ background: GOLD }}
              aria-hidden
            />
          </p>
          <h2
            className="mt-4 text-4xl leading-[1.1] font-semibold sm:text-5xl"
            style={{ ...SERIF, color: NAVY }}
          >
            Upcoming corporate{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              events.
            </em>
          </h2>
          <p className="mt-4 max-w-lg text-slate-500">
            Reserve your place early — tickets for our next events are open now.
          </p>
        </div>
        <Link
          href="/events"
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full px-6 py-3 text-sm font-semibold transition hover:bg-[#14245a] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c49a3c]/40 sm:self-auto"
          style={{ color: NAVY, boxShadow: `inset 0 0 0 1px ${GOLD}99` }}
        >
          View all events{" "}
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div
        className={`mt-12 grid grid-cols-1 gap-6 ${rest.length ? "lg:grid-cols-12" : ""}`}
      >
        {/* ── 2. Featured: the next event ─────────────────────────── */}
        <Link
          href={f.href}
          className={`group relative isolate flex min-h-[28rem] min-w-0 flex-col justify-end overflow-hidden rounded-[2rem] p-7 pt-32 text-white shadow-xl shadow-[#14245a]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c49a3c]/50 sm:p-9 sm:pt-36 ${rest.length ? "lg:col-span-7" : ""}`}
          style={{ background: NAVY }}
        >
          <Image
            src={f.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 55vw, 92vw"
            className="-z-20 object-cover transition duration-700 group-hover:scale-105"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-linear-to-t from-[#0d1840] via-[#0d1840]/60 to-[#0d1840]/10"
          />
          {/* Thin gold frame that appears on hover */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-[1.5rem] border opacity-0 transition duration-500 group-hover:opacity-100"
            style={{ borderColor: `${GOLD_LIGHT}80` }}
          />

          <div className="absolute top-6 left-6 flex items-start gap-3 sm:top-8 sm:left-8">
            <DateBadge day={f.day} month={f.month} weekday={f.weekday} large />
            <span className="mt-1 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              {f.type}
            </span>
          </div>
          <span
            className="absolute top-7 right-7 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] sm:top-9 sm:right-9"
            style={{ background: GOLD_LIGHT, color: NAVY }}
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-[#14245a] opacity-60 motion-reduce:hidden" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[#14245a]" />
            </span>
            Next up
          </span>

          <h3
            className="max-w-xl text-3xl leading-tight font-semibold text-balance sm:text-4xl"
            style={SERIF}
          >
            {featured.name}
          </h3>
          {/* {featured.shortDesc && <p className="mt-3 line-clamp-2 max-w-xl text-white/75">{featured.shortDesc}</p>} */}
          <div className="mt-5 space-y-1.5 text-sm text-white/85">
            <p className="flex items-center gap-2 lining-nums">
              <Clock
                size={15}
                className="shrink-0"
                style={{ color: GOLD_LIGHT }}
                aria-hidden
              />{" "}
              {f.longDate} · {f.time}
            </p>
            <p className="flex items-start gap-2">
              <MapPin
                size={15}
                className="mt-0.5 shrink-0"
                style={{ color: GOLD_LIGHT }}
                aria-hidden
              />{" "}
              <span className="line-clamp-1">{featured.address}</span>
            </p>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
            {f.fromPrice !== null ? (
              <p className="text-sm text-white/60">
                From{" "}
                <span className="ml-1 text-2xl font-semibold text-white lining-nums">
                  {formatPrice(f.fromPrice)}
                </span>
              </p>
            ) : (
              <span />
            )}
            <span
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition group-hover:brightness-110"
              style={{ background: GOLD_LIGHT, color: NAVY }}
            >
              Event details{" "}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </div>
        </Link>

        {/* ── 3. The next three ───────────────────────────────────── */}
        {rest.length > 0 && (
          <ul className="flex min-w-0 flex-col gap-4 lg:col-span-5">
            {rest.map((event) => {
              const d = details(event);
              return (
                <li key={event.id} className="min-w-0 flex-1">
                  <Link
                    href={d.href}
                    className="group flex h-full items-center gap-4 rounded-[1.5rem] border bg-white p-3 pr-4 transition duration-300 hover:-translate-y-0.5 hover:border-transparent hover:shadow-xl hover:shadow-[#14245a]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c49a3c]/40 sm:gap-5 sm:p-4 sm:pr-5"
                    style={{ borderColor: `${GOLD}33` }}
                  >
                    <div
                      className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28"
                      style={{ background: NAVY }}
                    >
                      <Image
                        src={d.image}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover transition duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.18em] lining-nums"
                        style={{ color: GOLD_DARK }}
                      >
                        {d.shortDate} · {d.time}
                      </p>
                      <h3
                        className="mt-1 line-clamp-2 text-xl leading-snug font-semibold sm:text-[1.6rem] sm:leading-tight"
                        style={{ ...SERIF, color: NAVY }}
                      >
                        {event.name}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-slate-500">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <MapPin
                            size={13}
                            className="shrink-0"
                            style={{ color: GOLD }}
                            aria-hidden
                          />
                          <span className="line-clamp-1">{event.address}</span>
                        </span>
                        {d.fromPrice !== null && (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold lining-nums"
                            style={{ background: `${GOLD}1a`, color: NAVY }}
                          >
                            From {formatPrice(d.fromPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border transition duration-300 group-hover:border-transparent group-hover:bg-[#dcb45c] sm:flex"
                      style={{ borderColor: `${GOLD}66`, color: NAVY }}
                      aria-hidden
                    >
                      <ArrowUpRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
