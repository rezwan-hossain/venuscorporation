// module/home/components/SummitHero.tsx
//
// Homepage hero:
//   1. Navy photo (or video) panel with the next upcoming event's name,
//      date and short description, plus two buttons.
//   2. White bar: the motto · the next event's venue and date · a link to it.
//
// The event comes from the database (getNextEvents, cached). With no
// upcoming event, the static text in data-v5.ts (`summitHero`) is shown.
//
// Large screens: header space + panel + bar fit in one screen (max 50rem),
// so the bar is visible on load.

import Image from "next/image";
import Link from "next/link";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import { ArrowRight, CalendarDays, MapPin, Play } from "lucide-react";

import { getNextEvents } from "@/app/actions/event";
import { brand } from "../business/data-v3";
import { summitHero } from "../business/data-v5";
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

// ════════════════════════════════════════════════════════════════════════
//  Content: the next event, or the static fallback text
// ════════════════════════════════════════════════════════════════════════

/** Event dates are stored as UTC midnight, so format them in UTC. */
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

async function getHeroContent() {
  const { events } = await getNextEvents(1);
  const event = events[0];

  if (!event) {
    return {
      label: summitHero.kicker,
      title: summitHero.title,
      text: summitHero.text,
      next: null,
    };
  }

  const date = formatDate(event.date);
  return {
    label: ` ${date}`,
    title: event.name,
    text: event.shortDesc || summitHero.text,
    next: {
      name: event.name,
      address: event.address,
      date,
      href: `/events/${event.slug}`,
    },
  };
}

// ════════════════════════════════════════════════════════════════════════
//  The hero
// ════════════════════════════════════════════════════════════════════════

export default async function SummitHero() {
  const { label, title, text, next } = await getHeroContent();

  return (
    // pt-*: start below the fixed header (its dark text needs a light background).
    <section
      className={`${display.variable} ${serif.variable} pt-20 md:pt-24 lg:flex lg:h-[min(100svh,50rem)] lg:min-h-[34rem] lg:flex-col lg:pt-28`}
    >
      {/* ── 1. Navy panel ── */}
      <div
        className="relative isolate overflow-hidden lg:min-h-0 lg:flex-1"
        style={{ background: NAVY }}
      >
        <HeroBackground />

        <div
          className={`${container} flex min-h-[52svh] flex-col justify-center py-16 lg:h-full lg:min-h-0 lg:py-[clamp(1.5rem,5vh,4rem)]`}
        >
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

          <h1
            className="mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold text-balance text-white sm:text-6xl lg:mt-[2.5vh] lg:text-[clamp(2.5rem,7.2vh,4.5rem)]"
            style={{ fontFamily: "var(--font-hero-display)" }}
          >
            {title}
          </h1>

          <p className="mt-6 line-clamp-3 max-w-md text-base leading-relaxed text-white/85 sm:text-lg lg:mt-[2.5vh]">
            {text}
          </p>

          <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:gap-8 lg:mt-[4vh]">
            <Link
              href={summitHero.primaryCta.href}
              className="inline-flex w-full max-w-xs items-center justify-center px-8 py-4 text-xs sm:max-w-none sm:px-9 sm:py-5 font-semibold uppercase tracking-[0.2em] transition hover:brightness-110 sm:w-auto"
              style={{ background: GOLD_LIGHT, color: NAVY_DEEP }}
            >
              {summitHero.primaryCta.label}
            </Link>
            <WatchButton />
          </div>
        </div>
      </div>

      {/* ── 2. White bar ── */}
      <NextEventBar next={next} />
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Pieces
// ════════════════════════════════════════════════════════════════════════

/** Photo (always) + optional looping video, a navy wash and a dotted texture. */
function HeroBackground() {
  const { poster, video } = summitHero;
  return (
    <>
      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />

      {/* Muted + looping so browsers allow autoplay; hidden for reduced motion. */}
      {video && (
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden
        >
          <source src={video} type="video/mp4" />
        </video>
      )}

      {/* Dark wash for the text: near-black with only a hint of navy, strong on
          the left and fading out on the right so the photo keeps its colours */}
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

/** "Watch our events": opens the showreel, or (without one) jumps down the page. */
function WatchButton() {
  const { showreel, watchCta } = summitHero;
  if (showreel)
    return <ShowreelButton label={watchCta.label} video={showreel} />;

  return (
    <a
      href={watchCta.href}
      className="group inline-flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-white"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition group-hover:bg-white/10"
        style={{ borderColor: GOLD_LIGHT }}
        aria-hidden
      >
        <Play
          size={14}
          fill="#fff"
          strokeWidth={0}
          className="translate-x-px"
        />
      </span>
      {watchCta.label}
    </a>
  );
}

type NextEvent = Awaited<ReturnType<typeof getHeroContent>>["next"];

/** White bar: motto · next event (or "coming soon") · link. */
function NextEventBar({ next }: { next: NextEvent }) {
  const linkLabel = next ? "Event details" : "Browse events";

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

        {next ? (
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
                {next.name}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin
                    size={14}
                    className="shrink-0"
                    style={{ color: GOLD }}
                    aria-hidden
                  />
                  {next.address}
                </span>
                <span className="flex items-center gap-1.5 lining-nums">
                  <CalendarDays
                    size={14}
                    className="shrink-0"
                    style={{ color: GOLD }}
                    aria-hidden
                  />
                  {next.date}
                </span>
              </p>
            </div>

            {/* Large screens: one line */}
            <p className="hidden text-sm text-slate-600 lg:block">
              <span className="text-slate-400">Next:</span>{" "}
              <span className="font-semibold" style={{ color: NAVY }}>
                {next.name}
              </span>
              <span className="text-slate-400"> · </span>
              {next.address}
              <span className="text-slate-400"> · </span>
              <span className="lining-nums">{next.date}</span>
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-600">New events coming soon.</p>
        )}

        {/* Phones/tablets: outlined pill; large screens: underlined text link */}
        <Link
          href={next ? next.href : "/events"}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold whitespace-nowrap uppercase tracking-[0.2em] transition hover:bg-[#14245a] hover:text-white lg:rounded-none lg:px-0 lg:py-0 lg:underline lg:underline-offset-4 lg:shadow-none! lg:hover:bg-transparent lg:hover:text-[#14245a]"
          style={{
            color: NAVY,
            textDecorationColor: GOLD,
            boxShadow: `inset 0 0 0 1px ${GOLD}99`,
          }}
        >
          {linkLabel} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
