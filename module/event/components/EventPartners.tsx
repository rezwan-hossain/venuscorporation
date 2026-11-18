// module/event/components/EventPartners.tsx
//
// "Event partners" card on the event page: partner logos with their role
// and name, e.g.  [BAF] In association with · Bangladesh Athletics Federation
//
//   5+ partners → two rows that scroll slowly in opposite directions, with a
//                 Pause button (hovering also pauses). Visitors who prefer
//                 reduced motion get still rows they can swipe instead.
//   1–4         → one still row.
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

// From this many partners on, the rows scroll.
const SCROLL_FROM = 5;

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
  // Scrolling: split into two rows (1st, 3rd, 5th … on top; 2nd, 4th … below).
  const rows = scrolls
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
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#c49a3c] hover:text-[#14245a] motion-reduce:hidden"
          >
            {paused ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
            {paused ? "Play" : "Pause"}
          </button>
        )}
      </div>

      <div className="partners-marquee space-y-3">
        {rows.map((row, r) =>
          scrolls ? (
            // Scrolling row: the list twice, side by side, moved left by half
            // its width on a loop — so it never runs out. The copy is hidden
            // from screen readers.
            <div
              key={r}
              className="partners-track overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
            >
              <ul
                className={`animate-partners flex w-max ${r === 1 ? "reverse-row" : ""} ${paused ? "is-paused" : ""}`}
                style={{ animationDuration: `${Math.max(20, row.length * 6)}s` }}
              >
                {[...row, ...row].map((partner, i) => (
                  <li key={i} className="pr-3" aria-hidden={i >= row.length || undefined} data-copy={i >= row.length || undefined}>
                    <PartnerCard partner={partner} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul key={r} className={`grid grid-cols-2 gap-3 ${STILL_COLUMNS[row.length] ?? "sm:grid-cols-4"}`}>
              {row.map((partner, i) => (
                <li key={i}>
                  <PartnerCard partner={partner} fill />
                </li>
              ))}
            </ul>
          ),
        )}
      </div>
    </section>
  );
}

/**
 * One partner card:
 *   ┌──────────────────┐
 *   │   logo / BAF     │  ← fixed-height logo zone, centred
 *   │       ──         │  ← short gold rule
 *   │ IN ASSOCIATION…  │  ← role (small caps, gold)
 *   │ Bangladesh Ath…  │  ← name (2 lines max)
 *   └──────────────────┘
 * Fixed heights keep every card's text on the same line in a row.
 * `fill`: stretch to the grid cell (still layout) instead of a fixed width.
 */
function PartnerCard({ partner, fill = false }: { partner: EventPartner; fill?: boolean }) {
  return (
    <div
      className={`group flex h-44 flex-col items-center rounded-xl border border-slate-200 bg-white px-3 pt-4 pb-3 text-center transition duration-300 hover:-translate-y-0.5 hover:border-[#c49a3c]/60 hover:shadow-lg hover:shadow-[#14245a]/8 ${
        fill ? "w-full" : "w-44 sm:w-48"
      }`}
    >
      {/* Logo zone */}
      <div className="flex h-14 w-full items-center justify-center">
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            width={150}
            height={56}
            className="h-auto max-h-14 w-auto max-w-[9rem] object-contain transition duration-300 group-hover:scale-105"
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

      <span className="my-2.5 h-px w-8 shrink-0" style={{ background: `${GOLD}66` }} aria-hidden />

      {/* Role + name */}
      {partner.role && (
        <p className="line-clamp-2 text-[10px] leading-snug font-semibold tracking-[0.1em] uppercase" style={{ color: GOLD_DARK }}>
          {partner.role}
        </p>
      )}
      <p className="mt-1 line-clamp-2 text-[13px] leading-snug font-semibold" style={{ color: NAVY }}>
        {partner.name}
      </p>
    </div>
  );
}
