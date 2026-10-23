// module/services/pages/ServicesPage.tsx
//
// /services — Venus Corporation's event-management services, in the
// business-card style (navy + gold, elegant serif, gold star, swoosh).
//
// Content (demo, no database):
//   services, steps, brand, cta → module/home/business/data-v3.ts
//   FAQ                         → module/home/business/data-v5.ts
// Editing those files updates this page and the homepage together.
//
// Each service has its own anchor, so other pages can link straight to it:
//   /services#corporate-events, /services#weddings, …
//
// Sections, top to bottom:
//   1. Hero — heading + a photo grid of the six services (jump links)
//   2. Services — two-column cards
//   3. How we work — connected timeline on navy
//   4. FAQ — heading left, questions right
//   5. Call to action — full-width navy with the swoosh
//
// No client JavaScript: the FAQ uses the native <details> element.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, ArrowUpRight, Mail, Phone, Plus, Star } from "lucide-react";

import { brand, cta, services, steps } from "@/module/home/business/data-v3";
import { faqs } from "@/module/home/business/data-v5";

// The business card's elegant serif — loaded for this page only.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-services-page-serif",
});

// Shared look (from the card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on navy
const GOLD_DARK = "#a8852f"; // gold for small text on white (easier to read)
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-services-page-serif)" } as const;
const SANS = { fontFamily: "var(--font-body)" } as const; // beats the global heading font

/** "Exhibitions & Trade Shows" → "exhibitions-trade-shows" (anchor id). */
const serviceSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** 0 → "01" */
const num = (i: number) => String(i + 1).padStart(2, "0");

export default function ServicesPage() {
  return (
    <div className={`${serif.variable} bg-white text-slate-600`}>
      <Hero />
      <ServiceCards />
      <HowWeWork />
      <Faq />
      <CallToAction />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Shared pieces
// ════════════════════════════════════════════════════════════════════════

/** Gold spaced capitals with a line after them. */
function GoldLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  const color = light ? GOLD_LIGHT : GOLD;
  return (
    <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color }}>
      {children}
      <span className="h-px w-12" style={{ background: color }} aria-hidden />
    </p>
  );
}

/** Serif heading with a gold italic ending. */
function SerifTitle({ children, italic, light = false }: { children: React.ReactNode; italic: string; light?: boolean }) {
  return (
    <h2 className="mt-4 text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl" style={{ ...SERIF, color: light ? "#fff" : NAVY }}>
      {children}{" "}
      <em className="font-medium" style={{ color: light ? GOLD_LIGHT : GOLD }}>
        {italic}
      </em>
    </h2>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  1. Hero — heading + photo grid of the six services
// ════════════════════════════════════════════════════════════════════════

function Hero() {
  return (
    // Light background at the top so the fixed header's dark text stays readable.
    <section className="pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28" style={{ background: CREAM }}>
      <div className={`${container} grid items-center gap-14 lg:grid-cols-12 lg:gap-12`}>
        {/* 1.1 Text */}
        <div className="lg:col-span-5">
          <GoldLabel>Our services</GoldLabel>
          <h1 className="mt-6 text-5xl leading-[1.02] font-semibold text-balance sm:text-6xl lg:text-7xl" style={{ ...SERIF, color: NAVY }}>
            Every occasion,{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              handled with care.
            </em>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed">
            From a boardroom conference to a once-in-a-lifetime wedding, {brand.name} plans, designs and runs every
            kind of event — with one dedicated team from first call to final applause.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link
              href={cta.primary.href}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:opacity-90"
              style={{ background: NAVY }}
            >
              {cta.primary.label} <ArrowRight size={16} />
            </Link>
            <a href={cta.secondary.href} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: NAVY }}>
              <Phone size={16} style={{ color: GOLD }} /> {cta.secondary.label}
            </a>
          </div>
        </div>

        {/* 1.2 Photo grid — each tile jumps to its service below */}
        <nav aria-label="Jump to a service" className="lg:col-span-7">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {services.map((s, i) => (
              <li key={s.name}>
                <a
                  href={`#${serviceSlug(s.name)}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#c49a3c]"
                  style={{ background: NAVY }}
                >
                  <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 46vw" className="object-cover transition duration-700 group-hover:scale-110" />
                  <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0d1840]/90 via-[#0d1840]/20 to-transparent" />
                  <span className="absolute top-3 left-4 text-lg italic text-white/90 lining-nums" style={SERIF}>
                    {num(i)}
                  </span>
                  <span className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-2">
                    <span className="text-lg leading-tight font-semibold text-white sm:text-xl" style={SERIF}>
                      {s.name}
                    </span>
                    <ArrowRight size={16} className="mb-0.5 shrink-0 rotate-90 text-white/70 transition group-hover:translate-y-0.5 group-hover:text-[#dcb45c]" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  2. Services — two-column cards
// ════════════════════════════════════════════════════════════════════════

function ServiceCards() {
  return (
    <section className={`${container} py-24 lg:py-32`}>
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <GoldLabel>What we do</GoldLabel>
          <SerifTitle italic="one dedicated team.">Six kinds of events,</SerifTitle>
        </div>
        <p className="max-w-sm text-slate-500 lg:text-right">Pick a service to see what&apos;s included — or tell us about something different.</p>
      </div>

      <ul className="mt-14 grid gap-8 md:grid-cols-2 lg:gap-10">
        {services.map((s, i) => (
          <li key={s.name} id={serviceSlug(s.name)} className="scroll-mt-28">
            <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border bg-white transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#14245a]/10" style={{ borderColor: `${GOLD}33` }}>
              {/* 2.1 Photo with number + name */}
              <div className="relative aspect-[16/10] overflow-hidden" style={{ background: NAVY }}>
                <Image src={s.image} alt="" fill sizes="(min-width: 768px) 45vw, 92vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0d1840]/85 via-[#0d1840]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-7">
                  <span className="text-5xl leading-none italic lining-nums" style={{ ...SERIF, color: GOLD_LIGHT }}>
                    {num(i)}
                  </span>
                  <h3 className="text-3xl leading-tight font-semibold text-white sm:text-4xl" style={SERIF}>
                    {s.name}
                  </h3>
                </div>
              </div>

              {/* 2.2 Body */}
              <div className="flex flex-1 flex-col p-7 sm:p-8">
                <p className="text-lg leading-relaxed">{s.text}</p>

                <h4 className="mt-7 text-xs font-semibold uppercase tracking-[0.25em]" style={{ ...SANS, color: GOLD_DARK }}>
                  What we handle
                </h4>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {s.includes.map((x) => (
                    <li key={x} className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm" style={{ borderColor: `${GOLD}55`, color: NAVY }}>
                      <Star size={10} fill={GOLD} strokeWidth={0} aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>

                {/* Links, pinned to the bottom so cards line up */}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: `${GOLD}26`, marginTop: "2rem" }}>
                  <Link href={cta.primary.href} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: NAVY }}>
                    Plan this event
                    <span className="flex h-8 w-8 items-center justify-center rounded-full transition group-hover:translate-x-1" style={{ background: NAVY, color: GOLD_LIGHT }}>
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                  {s.href && (
                    <Link href={s.href} className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: GOLD_DARK }}>
                      Upcoming {s.name.toLowerCase()} <ArrowUpRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  3. How we work — connected timeline on navy
// ════════════════════════════════════════════════════════════════════════

function HowWeWork() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32" style={{ background: NAVY }}>
      <div className={container}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-12" style={{ background: GOLD_LIGHT }} />
            <Star size={14} fill={GOLD_LIGHT} strokeWidth={0} />
            <span className="h-px w-12" style={{ background: GOLD_LIGHT }} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD_LIGHT }}>
            How we work
          </p>
          <h2 className="mt-3 text-4xl leading-[1.1] font-semibold text-white sm:text-5xl" style={SERIF}>
            The same calm process,{" "}
            <em className="font-medium" style={{ color: GOLD_LIGHT }}>
              for every event.
            </em>
          </h2>
        </div>

        {/* Large screens: one row joined by a gold line. Small: a vertical line on the left. */}
        <ol className="relative mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
          <span aria-hidden className="absolute top-0 bottom-0 left-7 w-px lg:top-7 lg:right-[10%] lg:bottom-auto lg:left-[10%] lg:h-px lg:w-auto" style={{ background: `${GOLD_LIGHT}59` }} />
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-6 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
              <span
                className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-2xl italic lining-nums"
                style={{ ...SERIF, background: NAVY_DEEP, borderColor: GOLD_LIGHT, color: GOLD_LIGHT }}
              >
                {i + 1}
              </span>
              <div className="pt-2 lg:pt-6">
                <h3 className="text-lg font-semibold text-white" style={SANS}>
                  {s.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/65 lg:mx-auto">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  4. FAQ — heading + contact prompt left, questions right
// ════════════════════════════════════════════════════════════════════════

function Faq() {
  return (
    <section className={`${container} grid gap-12 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32`}>
      <div className="lg:col-span-4">
        <GoldLabel>Good to know</GoldLabel>
        <SerifTitle italic="answered.">Questions,</SerifTitle>
        <p className="mt-5 leading-relaxed">Can&apos;t find what you&apos;re looking for? We&apos;re happy to talk it through.</p>
        <a href={cta.secondary.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: NAVY }}>
          <Phone size={16} style={{ color: GOLD }} /> {cta.secondary.label}
        </a>
      </div>

      <ul className="space-y-3 lg:col-span-8">
        {faqs.map((f, i) => (
          <li key={f.q}>
            <details className="group rounded-2xl border px-6 transition-colors open:bg-[#faf8f3]" style={{ borderColor: `${GOLD}40` }} open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-5 py-5 font-semibold [&::-webkit-details-marker]:hidden" style={{ color: NAVY }}>
                <span className="text-xl italic lining-nums" style={{ ...SERIF, color: GOLD }}>
                  {num(i)}
                </span>
                <span className="flex-1">{f.q}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-open:rotate-45" style={{ borderColor: `${GOLD}80`, color: GOLD }} aria-hidden>
                  <Plus size={16} />
                </span>
              </summary>
              <p className="pb-6 pl-10 leading-relaxed">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  5. Call to action — full-width navy with the swoosh
// ════════════════════════════════════════════════════════════════════════

function CallToAction() {
  return (
    <section className="relative overflow-hidden" style={{ background: NAVY }}>
      <svg viewBox="0 0 400 160" className="pointer-events-none absolute right-0 bottom-0 w-[36rem] max-w-[95%]" aria-hidden>
        <path d="M0 160 C120 142 235 92 400 22 L400 160 Z" fill="#f4ecdb" opacity="0.12" />
        <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" />
        <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.8" />
        <path d="M235 160 C305 142 352 122 400 100 L400 160 Z" fill={NAVY_DEEP} />
      </svg>

      <div className={`${container} relative grid gap-12 py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:py-32`}>
        <div>
          <GoldLabel light>
            {brand.motto.left} · {brand.motto.right}
          </GoldLabel>
          <h2 className="mt-5 text-5xl leading-[1.05] font-semibold text-white sm:text-6xl" style={SERIF}>
            Not sure which service fits?{" "}
            <em className="font-medium" style={{ color: GOLD_LIGHT }}>
              Let&apos;s talk.
            </em>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/70">{cta.text}</p>
        </div>

        <ul className="space-y-3">
          <li>
            <Link
              href={cta.primary.href}
              className="flex items-center justify-between rounded-2xl px-6 py-5 font-semibold transition hover:brightness-110"
              style={{ background: GOLD_LIGHT, color: NAVY_DEEP }}
            >
              {cta.primary.label} <ArrowRight size={18} />
            </Link>
          </li>
          <li>
            <a href={cta.secondary.href} className="flex items-center gap-3 rounded-2xl border border-white/20 px-6 py-5 text-white transition hover:bg-white/10">
              <Phone size={18} style={{ color: GOLD_LIGHT }} /> {cta.secondary.label}
            </a>
          </li>
          <li>
            <Link href="/contact" className="flex items-center gap-3 rounded-2xl border border-white/20 px-6 py-5 text-white transition hover:bg-white/10">
              <Mail size={18} style={{ color: GOLD_LIGHT }} /> Send us a message
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
