// module/home/components/WhoWeAre.tsx
//
// Homepage "Who we are" — one big rounded navy panel, split in two:
//   left  — full-height team photo with a frosted "12+ years" badge
//   right — gold label, white serif heading, intro, numbered points,
//           gold "Meet the team" button + motto, gold swoosh in the corner
// (Small screens: photo on top, navy text below.)
//
// Content: module/home/business/data.ts (`about`) and the motto from
// data-v3.ts (`brand`). Demo data — no database. No client JavaScript.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight } from "lucide-react";

import { about } from "../business/data";
import { brand } from "../business/data-v3";

// The business card's elegant serif.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-about-serif",
});

// Look (from the business card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on navy
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-about-serif)" } as const;

/** "One group. Many ways to grow your business." → ["One group.", "Many ways to grow your business."] */
function splitTitle(title: string) {
  const cut = title.indexOf(". ");
  return cut === -1 ? [title, ""] : [title.slice(0, cut + 1), title.slice(cut + 2)];
}

export default function WhoWeAre() {
  const [lead, rest] = splitTitle(about.title);
  const [intro, ...more] = about.paragraphs;

  return (
    <section className={`${serif.variable} ${container} pt-24 lg:pt-32`}>
      <div
        className="group/panel relative isolate grid overflow-hidden rounded-[2.5rem] shadow-2xl shadow-[#14245a]/20 lg:grid-cols-2"
        style={{ background: `radial-gradient(120% 90% at 100% 0%, #1d3274 0%, ${NAVY} 50%, ${NAVY_DEEP} 100%)` }}
      >
        {/* Fine gold hairline inside the edge (decorative) */}
        <div aria-hidden className="pointer-events-none absolute inset-3 z-10 rounded-[2rem] border border-[#dcb45c]/20 sm:inset-4" />
        {/* ── 1. Photo ─────────────────────────────────────────────── */}
        <div className="relative aspect-[4/3.4] overflow-hidden sm:aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]">
          <Image
            src={about.image}
            alt="Venus Corporation team in a meeting"
            fill
            sizes="(min-width: 1024px) 45vw, 92vw"
            className="object-cover transition duration-[1500ms] ease-out group-hover/panel:scale-105"
          />
          {/* Blend into the navy side on large screens; darken the bottom for the badge */}
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#14245a]/75 via-transparent to-transparent" />
          <div aria-hidden className="absolute inset-0 hidden bg-linear-to-r from-transparent from-60% to-[#14245a] lg:block" />

          {/* Frosted badge */}
          <div className="absolute bottom-7 left-7 flex items-center gap-4 rounded-2xl border border-[#dcb45c]/30 bg-[#0d1840]/45 px-5 py-4 text-white shadow-xl shadow-black/20 backdrop-blur-md sm:bottom-9 sm:left-9">
            <span className="text-4xl leading-none font-semibold lining-nums sm:text-5xl" style={{ ...SERIF, color: GOLD_LIGHT }}>
              {about.badge.value}
            </span>
            <span className="max-w-[7rem] text-xs leading-snug font-semibold uppercase tracking-[0.2em] text-white/90">{about.badge.label}</span>
          </div>
        </div>

        {/* ── 2. Text ──────────────────────────────────────────────── */}
        <div className="relative px-7 py-10 sm:px-12 sm:py-12 lg:py-12 lg:pr-16 lg:pl-10">
          {/* Gold swoosh, bottom right (decorative) */}
          <svg viewBox="0 0 400 160" className="pointer-events-none absolute right-0 bottom-0 w-80 max-w-[70%]" aria-hidden>
            <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" opacity="0.8" />
            <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.5" />
            <path d="M235 160 C305 142 352 122 400 100 L400 160 Z" fill={NAVY_DEEP} />
          </svg>

          <div className="relative">
            <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD_LIGHT }}>
              {about.eyebrow}
              <span className="h-px w-12" style={{ background: GOLD_LIGHT }} aria-hidden />
            </p>
            <h2 className="mt-4 text-4xl leading-[1.08] font-semibold text-balance text-white sm:text-5xl" style={SERIF}>
              {lead}{" "}
              <em className="font-medium" style={{ color: GOLD_LIGHT }}>
                {rest}
              </em>
            </h2>

            <p className="mt-5 text-lg leading-relaxed text-white/80">{intro}</p>
            {more.map((p) => (
              <p key={p} className="mt-4 leading-relaxed text-white/60">
                {p}
              </p>
            ))}

            {/* Points: numbered, with fine dividers */}
            <ol className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {about.points.map((point, i) => (
                <li key={point} className="flex items-center gap-4 py-3 font-medium text-white">
                  <span className="w-6 shrink-0 text-xl italic lining-nums" style={{ ...SERIF, color: GOLD_LIGHT }}>
                    {i + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link
                href="/about#team"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide shadow-lg shadow-black/20 transition hover:brightness-110"
                style={{ background: GOLD_LIGHT, color: NAVY_DEEP }}
              >
                Meet the team <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <p className="text-xl text-white/85 italic" style={SERIF}>
                {brand.motto.left} <span style={{ color: GOLD_LIGHT }}>|</span> {brand.motto.right}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
