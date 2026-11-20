// module/event/components/EventPartners.tsx
//
// "Event partners" card on the event page: partner logos with their role
// and name, e.g.  [BAF] In association with · Bangladesh Athletics Federation
//
//   10+ partners → two rows that scroll slowly in opposite directions
//   5–9         → one scrolling row
//   1–4         → one still row (no scrolling)
// Scrolling rows have a Pause button (hovering also pauses). Visitors who
// prefer reduced motion get still rows they can swipe instead.
//
// Data: Event.partners (edited in admin → event → Event partners).
// Shape: lib/event-partners.ts. Scroll CSS: .animate-partners in globals.css.

"use client";

import { useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";

import { partnerWordmark, type EventPartner } from "@/lib/event-partners";

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const GOLD_DARK = "#a8852f"; // readable gold for small text on white
const SERIF = { fontFamily: "var(--font-event-serif)" } as const;

// From this many partners on, the logos scroll…
const SCROLL_FROM = 5;
// …and from this many on, they're split into two rows. (With fewer, two
// short rows would show the same logos side by side.)
const TWO_ROWS_FROM = 10;
// A scrolling row repeats its logos until it has at least this many cards,
// so it's always wider than the screen and never shows a gap.
const MIN_CARDS_PER_LOOP = 8;

/** Repeat a short row (A B C → A B C A B C A B C) up to MIN_CARDS_PER_LOOP. */
function fillRow(row: EventPartner[]): EventPartner[] {
  const filled = [...row];
  while (filled.length < MIN_CARDS_PER_LOOP) filled.push(...row);
  return filled;
}

// Still layout (1–4 partners): columns on larger screens, so the cards fill
// the width without an empty gap (written out in full for Tailwind).
const STILL_COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-3",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export default function EventPartners({ partners }: { partners: EventPartner[] }) {
  const [paused, setPaused] = useState(false);

  if (partners.length === 0) return null;

  const scrolls = partners.length >= SCROLL_FROM;
  // Many partners: two rows (1st, 3rd, 5th … on top; 2nd, 4th … below)
  const rows =
    partners.length >= TWO_ROWS_FROM
      ? [partners.filter((_, i) => i % 2 === 0), partners.filter((_, i) => i % 2 === 1)]
      : [partners];

  return (
    <section aria-labelledby="partners-heading" className="rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: `${GOLD}40` }}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="partners-heading" className="text-3xl leading-tight font-semibold" style={{ ...SERIF, color: NAVY }}>
            Event <em className="font-medium" style={{ color: GOLD }}>partners</em>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {partners.length} organisation{partners.length === 1 ? "" : "s"} making this event possible
          </p>
        </div>
        {scrolls && (
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
            aria-label={paused ? "Play partner logos" : "Pause partner logos"}
            // Cream pill with a navy round icon; the icon turns gold on hover
            className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border bg-[#faf8f3] py-1 pr-3.5 pl-1 text-xs font-semibold tracking-wide text-[#14245a] transition hover:bg-white hover:shadow-sm motion-reduce:hidden"
            style={{ borderColor: `${GOLD}55` }}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#14245a] text-white transition group-hover:bg-[#c49a3c]">
              {paused ? (
                <Play size={11} fill="currentColor" className="ml-px" aria-hidden />
              ) : (
                <Pause size={11} fill="currentColor" aria-hidden />
              )}
            </span>
            {paused ? "Play" : "Pause"}
          </button>
        )}
      </div>

      <div className="partners-marquee space-y-3">
        {rows.map((row, r) => {
          if (scrolls) {
            // Scrolling row: the (filled) list twice, side by side, moved left
            // by half its width on a loop — so it never runs out. Only the
            // first copy of each partner is read by screen readers.
            const loop = fillRow(row);
            return (
              <div
                key={r}
                // py-1: room for the hover lift and shadow, so they aren't cut off
                className="partners-track overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
              >
                <ul
                  className={`animate-partners flex w-max ${r === 1 ? "reverse-row" : ""} ${paused ? "is-paused" : ""}`}
                  style={{ animationDuration: `${loop.length * 5}s` }} // ~5 s per card
                >
                  {[...loop, ...loop].map((partner, i) => (
                    <li key={i} className="pr-3" aria-hidden={i >= row.length || undefined} data-copy={i >= row.length || undefined}>
                      <PartnerCard partner={partner} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <ul key={r} className={`grid grid-cols-2 gap-3 ${STILL_COLUMNS[row.length] ?? "sm:grid-cols-4"}`}>
              {row.map((partner, i) => (
                <li key={i}>
                  <PartnerCard partner={partner} fill />
                </li>
              ))}
            </ul>
          );
        })}
      </div>
    </section>
  );
}

/**
 * One partner card:
 *   ┌──────────────────┐
 *   │   logo / BAF     │  ← fixed-height logo zone, centred
 *   │       ──         │  ← short gold rule
 *   │ Bangladesh Ath…  │  ← name (2 lines max)
 *   │ IN ASSOCIATION…  │  ← role, if set (small caps, gold)
 *   └──────────────────┘
 * No fixed height: the card is as tall as its content, and every card in a
 * row stretches to the tallest one (h-full), with the content centred.
 * `fill`: stretch to the grid cell (still layout) instead of a fixed width.
 */
function PartnerCard({ partner, fill = false }: { partner: EventPartner; fill?: boolean }) {
  return (
    <div
      className={`group flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-5 text-center transition duration-300 hover:-translate-y-0.5 hover:border-[#c49a3c]/60 hover:shadow-md hover:shadow-[#14245a]/8 ${
        fill ? "w-full" : "w-40 sm:w-48"
      }`}
    >
      {/* Logo zone */}
      <div className="flex h-16 w-full items-center justify-center">
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            width={160}
            height={64}
            className="h-auto max-h-16 w-auto max-w-[8.5rem] object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            className="max-w-full truncate text-[1.65rem] leading-none font-extrabold tracking-tight transition duration-300 group-hover:scale-105"
            style={{ color: NAVY }}
            aria-hidden
          >
            {partnerWordmark(partner)}
          </span>
        )}
      </div>

      <span className="my-3 h-px w-8 shrink-0" style={{ background: `${GOLD}66` }} aria-hidden />

      {/* Name, then role (only if one is set — no empty space otherwise) */}
      <p className="line-clamp-2 text-sm leading-snug font-semibold" style={{ color: NAVY }}>
        {partner.name}
      </p>
      {partner.role && (
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug font-semibold tracking-[0.1em] uppercase" style={{ color: GOLD_DARK }}>
          {partner.role}
        </p>
      )}
    </div>
  );
}
