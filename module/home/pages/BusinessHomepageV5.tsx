// module/home/pages/BusinessHomepageV5.tsx
//
// Homepage VARIATION 5 — event management, "invitation" style.
// Same brand as v3/v4 (business card: navy, gold, elegant serif, gold star),
// with a "Now showing" video hero, an expandable service list, client
// testimonials, an FAQ and a call to action.
//
// Content: module/home/business/data-v3.ts (numbers, steps, brand)
// + data-v5.ts (FAQ) + data.ts ("Featured work" and
// testimonials).
// Shown on the homepage via app/page.tsx.
//
// No client JavaScript: the expandable parts use the native <details> element.
//
// Sections, top to bottom:
//   1. Hero — its own component: module/home/components/SummitHero.tsx
//      Who we are — module/home/components/WhoWeAre.tsx
//   2. Services — module/home/components/ServiceList.tsx
//   3. Numbers
//   4. How we plan — path cards
//   5. Signature moments — module/home/components/SignatureMoments.tsx
//      Featured work
//   6. Testimonials
//      Gallery — module/home/components/Gallery.tsx
//   7. FAQ
//   8. Call to action

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, Mail, Phone, Plus, Quote, Star } from "lucide-react";

import { projects, testimonials as groupTestimonials } from "../business/data";
import { brand, cta, stats, steps } from "../business/data-v3";
import { faqs } from "../business/data-v5";
import Gallery from "../components/Gallery";
import ServiceList from "../components/ServiceList";
import SignatureMoments from "../components/SignatureMoments";
import SummitHero from "../components/SummitHero";
import WhoWeAre from "../components/WhoWeAre";

// The business card's elegant serif — loaded for this page only.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-v5-serif",
});

// Shared look (from the card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on navy
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-v5-serif)" } as const;
const SANS = { fontFamily: "var(--font-body)" } as const; // beats the global heading font

export default function BusinessHomepageV5() {
  return (
    <div className={`${serif.variable} bg-white text-slate-600`}>
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
            <dt className="mt-2 text-base italic sm:text-lg" style={{ ...SERIF, color: "#a8852f" }}>
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  4. How we plan — numbered step cards joined by arrows, on navy
// ════════════════════════════════════════════════════════════════════════

function PlanningPath() {
  return (
    <section className="relative isolate overflow-hidden py-24 lg:py-32" style={{ background: NAVY }}>
      {/* Soft gold glow at the top + faint dot texture (decorative) */}
      <div aria-hidden className="absolute -top-40 left-1/2 -z-10 h-80 w-[48rem] max-w-full -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: GOLD }} />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1.2px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, transparent, #000 40%, transparent)",
        }}
      />

      <div className={container}>
        <SectionHeading light kicker="How we plan" title="Your event, step by" italic="step." />
        <p className="mx-auto mt-5 max-w-xl text-center text-white/65">
          One team guides you from the first conversation to the final report — you always know what happens next.
        </p>

        <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {steps.map((s, i) => (
            <li key={s.title} className={`group relative ${i === steps.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition duration-500 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:bg-white/[0.08] lg:p-7">
                {/* Gold line along the top that grows on hover */}
                <span aria-hidden className="absolute top-0 left-0 h-0.5 w-12 transition-all duration-500 group-hover:w-full" style={{ background: GOLD_LIGHT }} />

                <span className="text-5xl leading-none italic lining-nums" style={{ ...SERIF, color: GOLD_LIGHT }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-lg font-semibold text-white" style={SANS}>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{s.text}</p>
              </div>

              {/* Arrow to the next card (large screens only) */}
              {i < steps.length - 1 && (
                <span
                  className="absolute top-12 -right-[1.1rem] z-10 hidden h-8 w-8 items-center justify-center rounded-full border-4 lg:flex"
                  style={{ background: GOLD_LIGHT, color: NAVY_DEEP, borderColor: NAVY }}
                  aria-hidden
                >
                  <ArrowRight size={13} strokeWidth={2.5} />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
          <Link
            href={cta.primary.href}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-wide transition hover:brightness-110"
            style={{ background: GOLD_LIGHT, color: NAVY_DEEP }}
          >
            {cta.primary.label} <ArrowRight size={16} />
          </Link>
          <a href={cta.secondary.href} className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white">
            <Phone size={16} style={{ color: GOLD_LIGHT }} /> {cta.secondary.label}
          </a>
        </div>
      </div>
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
              <span className="text-3xl italic lining-nums" style={{ ...SERIF, color: GOLD }}>
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
    // Cream band so the white sections around it don't run together.
    <section className="py-24 lg:py-32" style={{ background: CREAM }}>
      <div className={container}>
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
              <figure className="flex h-full flex-col rounded-3xl border bg-white p-8 shadow-sm shadow-[#14245a]/5" style={{ borderColor: `${GOLD}33` }}>
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
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  7. FAQ — native <details>
// ════════════════════════════════════════════════════════════════════════

function Faq() {
  return (
    // Comes right after the white gallery, so no extra top space.
    <section className={`${container} pb-24 lg:pb-32`}>
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
