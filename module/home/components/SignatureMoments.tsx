// module/home/components/SignatureMoments.tsx
//
// Homepage "Signature moments" — expanding photo panels on a cream band.
//   Large screens: the moments sit side by side as tall panels. The first
//   one is wide and shows its story; hovering (or tabbing to) another panel
//   widens that one instead. Pure CSS — see SignatureMoments.module.css.
//   Small screens: stacked cards with all text visible.
// Each panel links to /events.
//
// The hero's "Watch our events" button jumps here (id="moments").
//
// Content: module/home/business/data-v5.ts (`signature`). Demo data — no
// database. No client JavaScript.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";

import { signature } from "../business/data-v5";
import styles from "./SignatureMoments.module.css";

// The business card's elegant serif.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-moments-serif",
});

// Look (from the business card)
const NAVY = "#14245a";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on photos
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-moments-serif)" } as const;

export default function SignatureMoments() {
  return (
    <section id="moments" className={`${serif.variable} scroll-mt-24 py-24 lg:py-32`} style={{ background: CREAM }}>
      <div className={container}>
        {/* ── 1. Heading ─────────────────────────────────────────── */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-12" style={{ background: GOLD }} />
            <Star size={14} fill={GOLD} strokeWidth={0} />
            <span className="h-px w-12" style={{ background: GOLD }} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            Signature moments
          </p>
          <h2 className="mt-3 text-4xl leading-[1.1] font-semibold sm:text-5xl" style={{ ...SERIF, color: NAVY }}>
            Events we&apos;re{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              proud of.
            </em>
          </h2>
          <p className="mt-4 hidden text-sm italic text-slate-500 lg:block" style={SERIF}>
            Hover a moment to see its story
          </p>
        </div>

        {/* ── 2. The panels ──────────────────────────────────────── */}
        <ul className={`${styles.panels} mt-12`}>
          {signature.map((m, i) => (
            <li key={m.title} className={`${styles.panel} overflow-hidden rounded-[2rem] shadow-lg shadow-[#14245a]/10`} style={{ background: NAVY }}>
              <Link href="/events" className="group absolute inset-0 block outline-none focus-visible:ring-4 focus-visible:ring-[#c49a3c] focus-visible:ring-inset">
                <Image src={m.image} alt="" fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover transition duration-700 group-hover:scale-105" />
                {/* Dark fade at the bottom for the text */}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0d1840] via-[#0d1840]/35 to-transparent" />

                {/* Number, top left */}
                <span className="absolute top-6 left-7 text-3xl italic text-white/90 lining-nums" style={SERIF}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Arrow, top right */}
                <span
                  aria-hidden
                  className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition group-hover:border-transparent group-hover:bg-[#dcb45c] group-hover:text-[#0d1840]"
                >
                  <ArrowUpRight size={18} />
                </span>

                {/* Bottom text: category always; title + caption on the open panel */}
                <div className="absolute inset-x-0 bottom-0 p-7 lg:p-8">
                  <p className="flex items-center gap-2 text-[11px] font-semibold whitespace-nowrap uppercase tracking-[0.3em]" style={{ color: GOLD_LIGHT }}>
                    <Star size={10} fill={GOLD_LIGHT} strokeWidth={0} aria-hidden />
                    {m.category}
                  </p>
                  <div className={styles.details}>
                    <div>
                      <h3 className="mt-3 max-w-md text-3xl leading-tight font-semibold text-balance text-white lining-nums sm:text-4xl" style={SERIF}>
                        {m.title}
                      </h3>
                      <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80 lining-nums">{m.caption}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── 3. Link to all events ──────────────────────────────── */}
        <div className="mt-12 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-1 underline-offset-[6px] transition hover:decoration-2"
            style={{ color: NAVY, textDecorationColor: GOLD }}
          >
            See all our events <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
