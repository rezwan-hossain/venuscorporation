// module/home/components/SummitHero.tsx
//
// Homepage hero — "Now showing": a navy video (or photo) panel with the
// headline and buttons, plus a white bar with the motto and the next event.
//
// Content: module/home/business/data-v5.ts (`summitHero`) and the motto from
// data-v3.ts (`brand`). Demo data — no database. No client JavaScript.
//
// Large screens: header space + navy panel + white bar fit in one screen
// (capped at 50rem), so the bar is visible on load.

import Image from "next/image";
import Link from "next/link";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import { ArrowRight, Play } from "lucide-react";

import { brand } from "../business/data-v3";
import { summitHero } from "../business/data-v5";
import ShowreelButton from "./ShowreelButton";

// Classical Roman capitals (like the "VENUS CORPORATION" lettering on the
// logo) for the headline.
const display = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-hero-display",
});

// Elegant serif for the motto in the white bar.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
  display: "swap",
  variable: "--font-hero-serif",
});

// Look (from the business card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for buttons on navy
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const DISPLAY = { fontFamily: "var(--font-hero-display)" } as const;
const SERIF = { fontFamily: "var(--font-hero-serif)" } as const;

export default function SummitHero() {
  const h = summitHero;
  return (
    // Starts below the fixed header so its dark text stays on white.
    // Large screens: header space + navy panel + white bar together are at
    // most one screen tall (capped at 50rem), so the bar shows on load.
    <section className={`${display.variable} ${serif.variable} pt-24 lg:flex lg:h-[min(100svh,50rem)] lg:min-h-[34rem] lg:flex-col lg:pt-28`}>
      {/* ── 1.1 The navy media panel ─────────────────────────── */}
      <div className="relative isolate overflow-hidden lg:min-h-0 lg:flex-1" style={{ background: NAVY }}>
        {/* Photo: always there — the video's poster, or the whole
            background when there's no video yet */}
        <Image src={h.poster} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />

        {/* Video on top of the photo (muted + looping, so browsers allow
            autoplay). Hidden for people who prefer reduced motion. */}
        {h.video && (
          <video
            className="absolute inset-0 -z-20 h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={h.poster}
            aria-hidden
          >
            <source src={h.video} type="video/mp4" />
          </video>
        )}

        {/* Navy wash: solid behind the text (left), lighter on the right */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY}eb 38%, ${NAVY}a6 68%, ${NAVY}73 100%)` }}
        />
        {/* Dotted texture fading in along the bottom */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-2/5"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 38%, transparent 40%)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(transparent, #000)",
          }}
        />

        {/* ── 1.2 Text ─────────────────────────────────────────── */}
        <div className={`${container} flex min-h-[52svh] flex-col justify-center py-16 lg:h-full lg:min-h-0 lg:py-[clamp(1.5rem,5vh,4rem)]`}>
          <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] sm:text-xs" style={{ color: GOLD_LIGHT }}>
            <span className="h-px w-10 shrink-0" style={{ background: GOLD_LIGHT }} aria-hidden />
            {h.kicker}
          </p>

          <h1
            className="mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold text-white sm:text-6xl lg:mt-[2.5vh] lg:text-[clamp(2.5rem,7.2vh,4.5rem)]"
            style={DISPLAY}
          >
            {h.title}
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/85 sm:text-lg lg:mt-[2.5vh]">{h.text}</p>

          {/* ── 1.3 Buttons ──────────────────────────────────────── */}
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 lg:mt-[4vh]">
            <Link
              href={h.primaryCta.href}
              className="inline-flex w-full items-center justify-center px-9 py-5 text-xs font-semibold uppercase tracking-[0.2em] transition hover:brightness-110 sm:w-auto"
              style={{ background: GOLD_LIGHT, color: NAVY_DEEP }}
            >
              {h.primaryCta.label}
            </Link>
            {/* Opens the showreel player; without a showreel it jumps to "Signature moments" */}
            {h.showreel ? (
              <ShowreelButton label={h.watchCta.label} video={h.showreel} />
            ) : (
              <a href={h.watchCta.href} className="group inline-flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition group-hover:bg-white/10"
                  style={{ borderColor: GOLD_LIGHT }}
                  aria-hidden
                >
                  <Play size={14} fill="#fff" strokeWidth={0} className="translate-x-px" />
                </span>
                {h.watchCta.label}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── 1.4 White bar: motto · next event · details link ────── */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className={`${container} flex flex-col gap-3 py-5 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:text-left`}>
          <p className="shrink-0 text-xl whitespace-nowrap italic" style={{ ...SERIF, color: NAVY }}>
            {brand.motto.left} <span style={{ color: GOLD }}>|</span> {brand.motto.right}
          </p>
          <p className="text-sm text-slate-600">
            <span className="text-slate-400">Next:</span>{" "}
            <span className="font-semibold" style={{ color: NAVY }}>
              {h.nextEvent.name}
            </span>
            <span className="text-slate-400"> · </span>
            {h.nextEvent.venue}
            <span className="text-slate-400"> · </span>
            {h.nextEvent.date}
          </p>
          <Link
            href={h.nextEvent.href}
            className="inline-flex shrink-0 items-center justify-center gap-2 text-xs font-bold whitespace-nowrap uppercase tracking-[0.2em] underline underline-offset-4 lg:justify-start"
            style={{ color: NAVY, textDecorationColor: GOLD }}
          >
            {h.nextEvent.linkLabel} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
