// module/home/components/HeroView.tsx
//
// How the homepage hero looks:
//   1. Navy photo panel: label, title, text, gold button + countdown,
//      "Watch our events" (only with a YouTube link).
//   2. White bar: the motto · the next event · a link to it.
//
// It only draws what it's given (see HeroContent in ../hero-content.ts), so
// the homepage (SummitHero) and the admin preview (HeroForm) share it.

import Image from "next/image";
import Link from "next/link";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import type { HeroContent } from "../hero-content";
import { brand } from "../business/data-v3";
import HeroCountdown from "./HeroCountdown";
import ShowreelButton from "./ShowreelButton";

// Fonts: Roman capitals for the headline, elegant serif for the motto.
const display = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-hero-display",
});
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
  display: "swap",
  variable: "--font-hero-serif",
});

// Colours (from the business card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for use on navy

const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";

export default function HeroView({ content }: { content: HeroContent }) {
  const { label, title, text, button, countdownTo } = content;

  return (
    // `contents`: no box of its own, so the parent's flex layout still
    // applies to the panel and the bar. It only carries the font variables.
    <div className={`${display.variable} ${serif.variable} contents`}>
      {/* ── 1. Navy panel ── */}
      <div
        className="relative isolate overflow-hidden lg:min-h-0 lg:flex-1"
        style={{ background: NAVY }}
      >
        <HeroBackground content={content} />

        <div
          className={`${container} flex min-h-[52svh] flex-col justify-center py-16 lg:h-full lg:min-h-0 lg:py-[clamp(1.5rem,5vh,4rem)]`}
        >
          {label && (
            <p
              className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] sm:text-xs"
              style={{ color: GOLD_LIGHT }}
            >
              <span
                className="h-px w-10 shrink-0"
                style={{ background: GOLD_LIGHT }}
                aria-hidden
              />
              {label}
            </p>
          )}

          <h1
            className="mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold text-balance text-white sm:text-6xl lg:mt-[2.5vh] lg:text-[clamp(2.5rem,7.2vh,4.5rem)]"
            style={{ fontFamily: "var(--font-hero-display)" }}
          >
            {title}
          </h1>

          {text && (
            <p className="mt-6 line-clamp-3 max-w-md text-base leading-relaxed text-white/85 sm:text-lg lg:mt-[2.5vh]">
              {text}
            </p>
          )}

          <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:gap-8 lg:mt-[4vh]">
            {/* Gold button + "Starts in 45 days" underneath */}
            {button && (
              <div className="relative flex w-full flex-col items-center gap-3 sm:w-auto sm:items-start">
                <Link
                  href={button.href}
                  className="inline-flex w-full max-w-xs items-center justify-center rounded-md px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition hover:brightness-110 sm:w-auto sm:max-w-none sm:px-9 sm:py-5"
                  style={{ background: GOLD_LIGHT, color: NAVY_DEEP }}
                >
                  {button.label}
                </Link>
                {/* Phones: under the button. Larger: hangs below it without taking up
                    row space, so the button stays level with "Watch our events". */}
                {countdownTo && (
                  <div className="sm:absolute sm:top-full sm:left-0 sm:mt-3 sm:whitespace-nowrap">
                    <HeroCountdown startsAt={countdownTo} />
                  </div>
                )}
              </div>
            )}
            {/* "Watch our events": only when there is a YouTube link */}
            {content.showreel && (
              <ShowreelButton
                label="Watch our events"
                video={content.showreel}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── 2. White bar ── */}
      <NextEventBar bar={content.bar} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Pieces
// ════════════════════════════════════════════════════════════════════════

/**
 * next/image only resizes photos from hosts listed in next.config.ts. The
 * admin can paste a link from anywhere, so other hosts load as-is.
 */
const canOptimize = (url: string) =>
  url.startsWith("/") ||
  url.startsWith("https://images.unsplash.com/") ||
  url.includes(".supabase.co/storage/");

/** Photo (desktop + optional phone photo), a dark wash and a gold glow. */
function HeroBackground({ content }: { content: HeroContent }) {
  const { image, mobileImage } = content;

  return (
    <>
      {/* With a mobile photo: desktop photo from `sm` up, mobile photo below. */}
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        unoptimized={!canOptimize(image)}
        className={`-z-20 object-cover ${mobileImage ? "hidden sm:block" : ""}`}
      />
      {mobileImage && (
        <Image
          src={mobileImage}
          alt=""
          fill
          priority
          sizes="100vw"
          unoptimized={!canOptimize(mobileImage)}
          className="-z-20 object-cover sm:hidden"
        />
      )}

      {/* Dark wash for the text: strong on the left, fading out on the right
          so the photo keeps its colours */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(9,12,24,0.92) 0%, rgba(9,12,24,0.78) 35%, rgba(9,12,24,0.35) 65%, rgba(9,12,24,0.1) 100%)",
        }}
      />

      {/* Subtle golden gradient: a warm glow rising from the bottom-left, a
          faint gold light in the top-right, and a dark fade at the bottom */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: [
            `radial-gradient(75% 95% at 0% 100%, ${GOLD}5c, transparent 68%)`,
            `radial-gradient(50% 65% at 100% 0%, ${GOLD}2e, transparent 70%)`,
            `linear-gradient(to top, ${NAVY_DEEP}b3, transparent 45%)`,
          ].join(", "),
        }}
      />
    </>
  );
}

/** White bar: motto · next event (or "coming soon") · link. */
function NextEventBar({ bar }: { bar: HeroContent["bar"] }) {
  return (
    <div className="shrink-0 border-b border-slate-200 bg-white">
      <div
        className={`${container} flex flex-col items-center gap-4 py-6 text-center lg:flex-row lg:justify-between lg:gap-8 lg:py-5 lg:text-left`}
      >
        {/* Motto: large screens only */}
        <p
          className="hidden shrink-0 text-xl whitespace-nowrap italic lg:block"
          style={{ fontFamily: "var(--font-hero-serif)", color: NAVY }}
        >
          {brand.motto.left} <span style={{ color: GOLD }}>|</span>{" "}
          {brand.motto.right}
        </p>

        {bar ? (
          <>
            {/* Phones/tablets: stacked — label, name, venue · date */}
            <div className="lg:hidden">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: GOLD }}
              >
                Next up
              </p>
              <p
                className="mt-1.5 text-lg font-semibold text-balance"
                style={{ color: NAVY }}
              >
                {bar.name}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin
                    size={14}
                    className="shrink-0"
                    style={{ color: GOLD }}
                    aria-hidden
                  />
                  {bar.address}
                </span>
                <span className="flex items-center gap-1.5 lining-nums">
                  <CalendarDays
                    size={14}
                    className="shrink-0"
                    style={{ color: GOLD }}
                    aria-hidden
                  />
                  {bar.date}
                </span>
              </p>
            </div>

            {/* Large screens: one line */}
            <p className="hidden text-sm text-slate-600 lg:block">
              <span className="text-slate-400">Next:</span>{" "}
              <span className="font-semibold" style={{ color: NAVY }}>
                {bar.name}
              </span>
              <span className="text-slate-400"> · </span>
              {bar.address}
              <span className="text-slate-400"> · </span>
              <span className="lining-nums">{bar.date}</span>
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-600">New events coming soon.</p>
        )}

        {/* Phones/tablets: outlined pill; large screens: underlined text link */}
        <Link
          href={bar ? bar.href : "/events"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold whitespace-nowrap uppercase tracking-[0.2em] transition hover:bg-[#14245a] hover:text-white lg:rounded-none lg:px-0 lg:py-0 lg:underline lg:underline-offset-4 lg:shadow-none! lg:hover:bg-transparent lg:hover:text-[#14245a]"
          style={{
            color: NAVY,
            textDecorationColor: GOLD,
            boxShadow: `inset 0 0 0 1px ${GOLD}99`,
          }}
        >
          {bar ? "Event details" : "Browse events"} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
