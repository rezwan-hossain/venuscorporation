// module/home/pages/BusinessHomepageV5.tsx
//
// Homepage VARIATION 5 — event management, "invitation" style.
// Same brand as v3/v4 (business card: navy, gold, elegant serif, gold star),
// with a "Now showing" video hero, an expandable service list, client
// testimonials, an FAQ and a call to action.
//
// Content: module/home/business/data-v3.ts (services, numbers, steps,
// gallery, brand) + data-v5.ts (hero, signature moments, FAQ)
// + data.ts ("Who we are", "Featured work" and testimonials, shared with v1).
// Shown on the homepage via app/page.tsx.
//
// No client JavaScript: the expandable parts use the native <details> element,
// and the hero video is a plain <video> tag.
//
// Sections, top to bottom:
//   1. Hero — "Now showing"       5. Signature moments
//      Who we are                    Featured work
//   2. Services — expandable list 6. Testimonials
//   3. Numbers                       Gallery
//   4. How we plan — path cards   7. FAQ
//                                 8. Call to action

import Image from "next/image";
import Link from "next/link";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import { ArrowRight, ArrowUpRight, Check, Mail, Phone, Play, Plus, Quote, Star } from "lucide-react";

import { about, projects, testimonials as groupTestimonials } from "../business/data";
import { brand, cta, gallery, services, stats, steps } from "../business/data-v3";
import { faqs, invitation, signature, summitHero } from "../business/data-v5";

// The business card's elegant serif — loaded for this page only.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-v5-serif",
});

// Classical Roman capitals (like the "VENUS CORPORATION" lettering on the
// logo) for the hero headline — loaded for this page only.
const display = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-v5-display",
});

// Shared look (from the card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for buttons on navy
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-v5-serif)" } as const;
const DISPLAY = { fontFamily: "var(--font-v5-display)" } as const;
const SANS = { fontFamily: "var(--font-body)" } as const; // beats the global heading font

export default function BusinessHomepageV5() {
  return (
    <div className={`${serif.variable} ${display.variable} bg-white text-slate-600`}>
      <SummitHero />
      <WhoWeAre />
      <ServiceList />
      <Numbers />
      <PlanningPath />
      <SignatureMoments />
      <FeaturedWork />
      <Testimonials />
      <Gallery />
      <Faq />
      <ContactCta />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Shared pieces
// ════════════════════════════════════════════════════════════════════════

/** "— ★ —" ornament with the logo's gold star. */
function StarRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-12" style={{ background: GOLD }} />
      <Star size={14} fill={GOLD} strokeWidth={0} />
      <span className="h-px w-12" style={{ background: GOLD }} />
    </div>
  );
}

/** Small gold spaced capitals. */
function Kicker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${className}`} style={{ color: GOLD }}>
      {children}
    </p>
  );
}

/** Centered section heading: star ornament, kicker, serif title with gold italic. */
function SectionHeading({ kicker, title, italic, light = false }: { kicker: string; title: string; italic?: string; light?: boolean }) {
  return (
    <div className="text-center">
      <StarRule />
      <Kicker className="mt-5">{kicker}</Kicker>
      <h2 className="mt-3 text-4xl leading-[1.1] font-semibold sm:text-5xl" style={{ ...SERIF, color: light ? "#fff" : NAVY }}>
        {title}
        {italic && (
          <>
            {" "}
            <em className="font-medium" style={{ color: GOLD }}>
              {italic}
            </em>
          </>
        )}
      </h2>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  1. Hero — "Now showing": video (or photo) panel + "next event" bar
// ════════════════════════════════════════════════════════════════════════

function SummitHero() {
  const h = summitHero;
  return (
    // Starts below the fixed header so its dark text stays on white.
    // Large screens: header space + navy panel + white bar together are at
    // most one screen tall (capped at 50rem), so the bar shows on load.
    <section className="pt-24 lg:flex lg:h-[min(100svh,50rem)] lg:min-h-[34rem] lg:flex-col lg:pt-28">
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

// ════════════════════════════════════════════════════════════════════════
//  Who we are — photo with an offset gold frame + text (same as v1's About)
// ════════════════════════════════════════════════════════════════════════

function WhoWeAre() {
  return (
    <section className={`${container} grid items-center gap-14 pt-24 lg:grid-cols-2 lg:pt-32`}>
      {/* Photo with an offset gold frame */}
      <div className="relative">
        <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border-2 sm:-inset-3 sm:translate-x-6 sm:translate-y-6" style={{ borderColor: GOLD }} />
        <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem]">
          <Image src={about.image} alt="Venus Corporation team in a meeting" fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
        </div>
      </div>

      {/* Text */}
      <div>
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#a8852f]">
          <span className="h-px w-8" style={{ background: GOLD }} aria-hidden />
          {about.eyebrow}
        </p>
        {/* Uses the site's heading font (bold condensed capitals) */}
        <h2 className="mt-4 text-4xl leading-[1.05] tracking-wide uppercase sm:text-5xl" style={{ color: NAVY }}>
          {about.title}
        </h2>
        {about.paragraphs.map((p) => (
          <p key={p} className="mt-5 text-lg leading-relaxed">
            {p}
          </p>
        ))}
        <ul className="mt-7 space-y-3">
          {about.points.map((point) => (
            <li key={point} className="flex items-start gap-3 font-medium" style={{ color: NAVY }}>
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: "#f3e7c9" }}>
                <Check size={14} strokeWidth={3} style={{ color: "#a8852f" }} />
              </span>
              {point}
            </li>
          ))}
        </ul>
        <Link href="/teams" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline" style={{ color: NAVY }}>
          Meet the team <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  2. Services — expandable list (native <details>, first one open)
// ════════════════════════════════════════════════════════════════════════

function ServiceList() {
  return (
    <section id="services" className={`${container} scroll-mt-24 py-24 lg:py-32`}>
      <SectionHeading kicker="Our services" title="Every occasion," italic="handled with care." />

      <ul className="mx-auto mt-14 max-w-5xl border-t" style={{ borderColor: `${GOLD}55` }}>
        {services.map((s, i) => (
          <li key={s.name} className="border-b" style={{ borderColor: `${GOLD}55` }}>
            <details className="group" open={i === 0}>
              {/* 2.1 The row you click */}
              <summary className="flex cursor-pointer list-none items-center gap-5 py-7 [&::-webkit-details-marker]:hidden">
                <span className="w-10 shrink-0 text-2xl italic lining-nums" style={{ ...SERIF, color: GOLD }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-3xl font-semibold sm:text-4xl" style={{ ...SERIF, color: NAVY }}>
                  {s.name}
                </span>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-open:rotate-45"
                  style={{ borderColor: GOLD, color: NAVY }}
                  aria-hidden
                >
                  <Plus size={18} />
                </span>
              </summary>

              {/* 2.2 What opens: photo + details */}
              <div className="grid gap-8 pb-10 sm:pl-15 md:grid-cols-[1.1fr_1fr]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image src={s.image} alt="" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-lg leading-relaxed">{s.text}</p>
                  <ul className="mt-5 space-y-2" style={{ color: NAVY }}>
                    {s.includes.map((x) => (
                      <li key={x} className="flex items-center gap-3">
                        <Star size={12} fill={GOLD} strokeWidth={0} aria-hidden />
                        {x}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex flex-wrap gap-5">
                    <Link href={invitation.primaryCta.href} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: NAVY }}>
                      {invitation.primaryCta.label} <ArrowRight size={16} />
                    </Link>
                    {s.href && (
                      <Link href={s.href} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: GOLD }}>
                        Upcoming {s.name.toLowerCase()} <ArrowUpRight size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  3. Numbers — a slim band with gold dividers
// ════════════════════════════════════════════════════════════════════════

function Numbers() {
  return (
    <section style={{ background: CREAM }}>
      <dl className={`${container} grid grid-cols-2 py-14 lg:grid-cols-4`}>
        {stats.map((s, i) => (
          <div key={s.label} className={`px-4 py-4 text-center ${i % 2 === 1 ? "border-l" : ""} ${i === 2 ? "lg:border-l" : ""}`} style={{ borderColor: `${GOLD}55` }}>
            <dd className="text-5xl leading-none font-semibold lining-nums" style={{ ...SERIF, color: NAVY }}>
              {s.value}
            </dd>
            <dt className="mt-2 text-sm italic" style={{ ...SERIF, color: GOLD }}>
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  4. How we plan — path cards with arrows, on navy
// ════════════════════════════════════════════════════════════════════════

function PlanningPath() {
  return (
    <section className="py-24 lg:py-32" style={{ background: NAVY }}>
      <div className={container}>
        <SectionHeading light kicker="How we plan" title="Your event, step by" italic="step." />

        <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-4xl italic lining-nums" style={{ ...SERIF, color: GOLD }}>
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-white" style={SANS}>
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-white/65">{s.text}</p>

              {/* Arrow to the next card (large screens only) */}
              {i < steps.length - 1 && (
                <span
                  className="absolute -right-3.5 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full lg:flex"
                  style={{ background: GOLD, color: NAVY_DEEP }}
                  aria-hidden
                >
                  <ArrowRight size={14} />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  5. Signature moments — tall cards, caption slides up on hover
// ════════════════════════════════════════════════════════════════════════

function SignatureMoments() {
  return (
    <section id="moments" className={`${container} scroll-mt-24 py-24 lg:py-32`}>
      <SectionHeading kicker="Signature moments" title="Events we're" italic="proud of." />

      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {signature.map((m) => (
          <li key={m.title}>
            <figure className="group relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-3xl">
              <Image src={m.image} alt="" fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0d1840] via-[#0d1840]/30 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-7 text-center transition duration-500 md:translate-y-6 md:group-hover:translate-y-0">
                <Star size={14} fill={GOLD} strokeWidth={0} className="mx-auto" aria-hidden />
                <p className="mt-3 text-2xl font-semibold text-white" style={SERIF}>
                  {m.title}
                </p>
                <p className="mt-2 text-sm text-white/75 transition duration-500 md:opacity-0 md:group-hover:opacity-100">{m.caption}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Featured work — numbered list: number · title + client · category · photo
//  (same as v2's "Selected projects")
// ════════════════════════════════════════════════════════════════════════

function FeaturedWork() {
  return (
    <section className={`${container} py-24 lg:py-32`}>
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          {/* Small pill label with a gold dot */}
          <span
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em]"
            style={{ color: NAVY }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} aria-hidden />
            Featured work
          </span>
          {/* Uses the site's heading font (bold condensed capitals) */}
          <h2 className="mt-5 text-4xl leading-[1.05] tracking-wide uppercase sm:text-5xl" style={{ color: NAVY }}>
            Selected projects
          </h2>
        </div>
        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: "#a8852f" }}>
          Start your project <ArrowRight size={16} />
        </Link>
      </div>

      {/* One row per project; the photo shows on large screens only */}
      <ul className="mt-12 border-t border-slate-200">
        {projects.map((p, i) => (
          <li key={p.title} className="group border-b border-slate-200">
            <article className="grid items-center gap-5 py-7 transition-colors sm:grid-cols-[4rem_1fr_auto] lg:grid-cols-[5rem_1fr_12rem_14rem] lg:px-4 lg:hover:bg-[#faf8f3]">
              <span className="text-3xl lining-nums" style={{ color: GOLD }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-2xl tracking-wide uppercase sm:text-3xl" style={{ color: NAVY }}>
                  {p.title}
                </h3>
                <p className="mt-1 text-slate-500">
                  {p.client} · {p.result}
                </p>
              </div>
              <span
                className="w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
                style={{ borderColor: `${GOLD}99`, color: "#a8852f" }}
              >
                {p.category}
              </span>
              <div className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl lg:block">
                <Image src={p.image} alt="" fill sizes="14rem" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  6. Testimonials — quote cards (same as v1's testimonials)
// ════════════════════════════════════════════════════════════════════════

function Testimonials() {
  return (
    <section className={`${container} py-24 lg:py-32`}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#a8852f]">
          <span className="h-px w-8" style={{ background: GOLD }} aria-hidden />
          Testimonials
        </p>
        {/* Uses the site's heading font (bold condensed capitals) */}
        <h2 className="mt-4 text-4xl leading-[1.05] tracking-wide uppercase sm:text-5xl" style={{ color: NAVY }}>
          What our clients say
        </h2>
      </div>

      <ul className="mt-14 grid gap-6 lg:grid-cols-3">
        {groupTestimonials.map((t) => (
          <li key={t.name}>
            <figure className="flex h-full flex-col rounded-3xl bg-[#f8f6f1] p-8">
              <Quote size={32} style={{ color: GOLD }} aria-hidden />
              <blockquote className="mt-5 flex-1 text-lg leading-relaxed" style={{ color: NAVY }}>
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-7 border-t border-slate-200 pt-5">
                <p className="font-semibold" style={{ color: NAVY }}>
                  {t.name}
                </p>
                <p className="text-sm text-slate-500">{t.role}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Gallery — photo grid with serif labels (same as v3's gallery)
// ════════════════════════════════════════════════════════════════════════

/**
 * Which photo spans more than one cell (index = position in `gallery`).
 * Large screens, 3 columns:
 *   [ 0 | 1 | 2 ]
 *   [ 0 | 3 | 4 ]
 *   [ 5   5 | 4 ]
 * (Small screens: plain 2 columns, 3 full rows.)
 */
const GALLERY_SPAN = ["lg:row-span-2", "", "", "", "lg:row-span-2", "lg:col-span-2"];

function Gallery() {
  return (
    <section className={`${container} py-24 lg:py-32`}>
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            Moments we&apos;ve made
            <span className="h-px w-12" style={{ background: GOLD }} aria-hidden />
          </p>
          <h2 className="mt-4 text-4xl leading-[1.1] font-semibold sm:text-5xl" style={{ ...SERIF, color: NAVY }}>
            Our{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              gallery
            </em>
          </h2>
        </div>
        <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: NAVY }}>
          View full gallery <ArrowRight size={16} />
        </Link>
      </div>

      <ul className="mt-12 grid auto-rows-[14rem] grid-cols-2 gap-4 lg:grid-cols-3">
        {gallery.map((g, i) => (
          <li key={g.label} className={`group relative overflow-hidden rounded-3xl ${GALLERY_SPAN[i]}`}>
            <Image src={g.image} alt={g.label} fill sizes="(min-width: 1024px) 30vw, 45vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-sm italic backdrop-blur" style={{ ...SERIF, color: NAVY }}>
              {g.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  7. FAQ — native <details>
// ════════════════════════════════════════════════════════════════════════

function Faq() {
  return (
    <section className={`${container} py-24 lg:py-32`}>
      <SectionHeading kicker="Good to know" title="Questions," italic="answered." />

      <ul className="mx-auto mt-12 max-w-3xl space-y-3">
        {faqs.map((f) => (
          <li key={f.q}>
            <details className="group rounded-2xl border px-6 open:bg-[#faf8f3]" style={{ borderColor: `${GOLD}55` }}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold [&::-webkit-details-marker]:hidden" style={{ color: NAVY }}>
                {f.q}
                <Plus size={18} className="shrink-0 transition-transform duration-300 group-open:rotate-45" style={{ color: GOLD }} aria-hidden />
              </summary>
              <p className="pb-6 leading-relaxed">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  8. Call to action — full-width navy with the swoosh (same as v4's)
// ════════════════════════════════════════════════════════════════════════

/** The card's navy + gold corner swoosh (decorative). */
function Swoosh({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 160" className={`pointer-events-none ${className}`} aria-hidden>
      <path d="M0 160 C120 142 235 92 400 22 L400 160 Z" fill="#f4ecdb" opacity="0.12" />
      <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" />
      <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.8" />
      <path d="M235 160 C305 142 352 122 400 100 L400 160 Z" fill={NAVY_DEEP} />
    </svg>
  );
}

function ContactCta() {
  return (
    <section className="relative overflow-hidden" style={{ background: NAVY }}>
      <Swoosh className="absolute bottom-0 right-0 w-[36rem] max-w-[95%]" />

      <div className={`${container} relative grid gap-12 py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:py-32`}>
        {/* 8.1 The ask */}
        <div>
          <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            {brand.motto.left} · {brand.motto.right}
            <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />
          </p>
          <h2 className="mt-5 text-5xl leading-[1.05] font-semibold text-white sm:text-6xl" style={SERIF}>
            Let&apos;s create something <em className="font-medium" style={{ color: GOLD }}>unforgettable.</em>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/70">{cta.text}</p>
        </div>

        {/* 8.2 Three ways to reach us */}
        <ul className="space-y-3">
          <li>
            <Link
              href={cta.primary.href}
              className="flex items-center justify-between rounded-2xl px-6 py-5 font-semibold transition hover:opacity-90"
              style={{ background: GOLD, color: NAVY_DEEP }}
            >
              {cta.primary.label} <ArrowRight size={18} />
            </Link>
          </li>
          <li>
            <a href={cta.secondary.href} className="flex items-center gap-3 rounded-2xl border border-white/20 px-6 py-5 text-white transition hover:bg-white/10">
              <Phone size={18} style={{ color: GOLD }} /> {cta.secondary.label}
            </a>
          </li>
          <li>
            <Link href="/contact" className="flex items-center gap-3 rounded-2xl border border-white/20 px-6 py-5 text-white transition hover:bg-white/10">
              <Mail size={18} style={{ color: GOLD }} /> Send us a message
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
