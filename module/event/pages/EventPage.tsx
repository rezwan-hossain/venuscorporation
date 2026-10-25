// module/event/pages/EventPage.tsx
//
// /events — in the brand style (cream hero, navy + gold, elegant serif).
//   1. Hero — label, serif heading, short intro, event count
//   2. Upcoming events (soonest first)
//   3. Previous events (on cream)

import { Cormorant_Garamond } from "next/font/google";
import { CalendarDays } from "lucide-react";

import EventCard from "../components/EventCard";
import { EventData } from "@/types/event";

// The business card's elegant serif — loaded for this page only.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-events-serif",
});

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-events-serif)" } as const;

type EventsPageProps = {
  upcomingEvents: EventData[];
  previousEvents: EventData[];
  error?: string;
};

/** Gold label + serif heading with a gold italic word. */
function SectionHeading({ label, title, italic }: { label: string; title: string; italic: string }) {
  return (
    <div className="mb-10 text-center sm:mb-14">
      <p className="flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
        <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />
        {label}
        <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />
      </p>
      <h2 className="mt-4 text-4xl leading-[1.1] font-semibold sm:text-5xl" style={{ ...SERIF, color: NAVY }}>
        {title}{" "}
        <em className="font-medium" style={{ color: GOLD }}>
          {italic}
        </em>
      </h2>
    </div>
  );
}

const EventsPage = ({ upcomingEvents, previousEvents }: EventsPageProps) => {
  // Soonest first.
  const upcoming = [...upcomingEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className={`${serif.variable} min-h-screen bg-white`}>
      {/* ── 1. Hero (light, so the fixed header's dark text stays readable) ── */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 lg:pt-44 lg:pb-20" style={{ background: CREAM }}>
        <svg viewBox="0 0 400 160" className="pointer-events-none absolute right-0 bottom-0 w-[28rem] max-w-[80%]" aria-hidden>
          <path d="M0 160 C120 142 235 92 400 22 L400 160 Z" fill="#f4ecdb" opacity="0.7" />
          <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" />
          <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.8" />
        </svg>

        <div className={`${container} relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end`}>
          <div>
            <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Events
              <span className="h-px w-12" style={{ background: GOLD }} aria-hidden />
            </p>
            <h1 className="mt-6 text-5xl leading-[1.02] font-semibold sm:text-6xl lg:text-7xl" style={{ ...SERIF, color: NAVY }}>
              What&apos;s{" "}
              <em className="font-medium" style={{ color: GOLD }}>
                on.
              </em>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Summits, race days and celebrations — find your next event and reserve your place.
            </p>
          </div>

          {upcoming.length > 0 && (
            <p className="flex items-center gap-3 self-start rounded-full border bg-white px-5 py-2.5 text-sm font-medium lg:self-end" style={{ borderColor: `${GOLD}55`, color: NAVY }}>
              <CalendarDays size={16} style={{ color: GOLD }} aria-hidden />
              <span className="lining-nums">{upcoming.length}</span> upcoming {upcoming.length === 1 ? "event" : "events"}
            </p>
          )}
        </div>
      </section>

      {/* ── 2. Upcoming ─────────────────────────────────────────────── */}
      <section className={`${container} py-16 lg:py-24`}>
        <SectionHeading label="On the calendar" title="Upcoming" italic="events." />
        {upcoming.length > 0 ? (
          <div className="space-y-8 lg:space-y-10">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500">New events are coming soon — check back shortly.</p>
        )}
      </section>

      {/* ── 3. Previous ─────────────────────────────────────────────── */}
      {previousEvents?.length ? (
        <section className="py-16 lg:py-24" style={{ background: CREAM }}>
          <div className={container}>
            <SectionHeading label="Our track record" title="Previous" italic="events." />
            <div className="space-y-8 lg:space-y-10">
              {previousEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default EventsPage;
