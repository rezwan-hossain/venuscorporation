// module/services/pages/ServicesPage.tsx
//
// /services — Venus Corporation's event-management services, in the
// business-card style (navy + gold, elegant serif, gold dashes, swoosh).
//
// Content (demo, no database):
//   services, steps, brand  → module/home/business/data-v3.ts
//   FAQ                     → module/home/business/data-v5.ts
// Editing those files updates this page and the v3–v5 homepages together.
//
// Each service has its own anchor, so other pages can link straight to it:
//   /services#corporate-events, /services#weddings, …
//
// Sections, top to bottom:
//   1. Hero + jump links to each service
//   2. The six services (one detailed row each)
//   3. How we plan your event
//   4. FAQ
//   5. Call to action

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, ArrowUpRight, Phone, Plus, Star } from "lucide-react";

import { brand, cta, services, steps } from "@/module/home/business/data-v3";
import { faqs } from "@/module/home/business/data-v5";

// The business card's elegant serif — loaded for this page only.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-services-serif",
});

// Shared look (from the card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-services-serif)" } as const;
const SANS = { fontFamily: "var(--font-body)" } as const; // beats the global heading font

/** "Exhibitions & Trade Shows" → "exhibitions-trade-shows" (anchor id). */
export const serviceSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function ServicesPage() {
  return (
    <div className={`${serif.variable} bg-white text-slate-600`}>
      <Hero />
      <ServiceDetails />
      <HowWePlan />
      <Faq />
      <CallToAction />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Shared pieces
// ════════════════════════════════════════════════════════════════════════

/** Gold spaced capitals with a line, like the card's "BUSINESS BEYOND BOUNDARIES ——". */
function GoldLabel({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p className={`flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] ${center ? "justify-center" : ""}`} style={{ color: GOLD }}>
      {center && <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />}
      {children}
      <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />
    </p>
  );
}

/** The card's navy + gold corner swoosh (decorative). */
function Swoosh({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 160" className={`pointer-events-none ${className}`} aria-hidden>
      <path d="M0 160 C120 142 235 92 400 22 L400 160 Z" fill="#f4ecdb" opacity="0.7" />
      <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" />
      <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.8" />
      <path d="M235 160 C305 142 352 122 400 100 L400 160 Z" fill={NAVY} />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  1. Hero + jump links
// ════════════════════════════════════════════════════════════════════════

function Hero() {
  return (
    // Light background at the top so the fixed header's dark text stays readable.
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pt-44 lg:pb-28" style={{ background: CREAM }}>
      <Swoosh className="absolute bottom-0 right-0 w-[30rem] max-w-[85%]" />

      <div className={`${container} relative`}>
        {/* 1.1 Title */}
        <GoldLabel>Our services</GoldLabel>
        <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold sm:text-7xl" style={{ ...SERIF, color: NAVY }}>
          Every occasion,{" "}
          <em className="font-medium" style={{ color: GOLD }}>
            handled with care.
          </em>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">
          From a boardroom conference to a once-in-a-lifetime wedding, {brand.name} plans, designs and runs every
          kind of event — with one dedicated team from first call to final applause.
        </p>

        {/* 1.2 Jump links: one per service (like the card's list) */}
        <nav aria-label="Jump to a service" className="mt-12">
          <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <li key={s.name}>
                <a href={`#${serviceSlug(s.name)}`} className="group flex items-baseline gap-3 text-lg" style={{ color: NAVY }}>
                  <span className="text-sm italic lining-nums" style={{ ...SERIF, color: GOLD }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px w-4 shrink-0 translate-y-[-0.3em]" style={{ background: GOLD }} aria-hidden />
                  <span className="underline-offset-4 group-hover:underline" style={{ textDecorationColor: GOLD }}>
                    {s.name}
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
//  2. The six services — one detailed row each, photo side alternating
// ════════════════════════════════════════════════════════════════════════

function ServiceDetails() {
  return (
    <section className={`${container} space-y-24 py-24 lg:space-y-32 lg:py-32`}>
      {services.map((s, i) => {
        const flip = i % 2 === 1; // every second row: photo on the right
        return (
          <article key={s.name} id={serviceSlug(s.name)} className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* 2.1 Photo (arched top, with the service number) */}
            <div className={`relative ${flip ? "lg:order-2" : ""}`}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-[12rem] rounded-b-3xl">
                <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 45vw, 92vw" className="object-cover" />
              </div>
              <span
                className="absolute -bottom-5 left-6 rounded-full px-5 py-2 text-2xl font-semibold italic lining-nums shadow-lg"
                style={{ ...SERIF, background: NAVY, color: GOLD }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            {/* 2.2 Text */}
            <div className={flip ? "lg:order-1" : ""}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                Service {String(i + 1).padStart(2, "0")} of {String(services.length).padStart(2, "0")}
              </p>
              <h2 className="mt-3 text-4xl font-semibold sm:text-5xl" style={{ ...SERIF, color: NAVY }}>
                {s.name}
              </h2>
              <p className="mt-5 text-lg leading-relaxed">{s.text}</p>

              {/* What we handle */}
              <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.2em]" style={{ ...SANS, color: NAVY }}>
                What we handle
              </h3>
              <ul className="mt-4 space-y-2.5" style={{ color: NAVY }}>
                {s.includes.map((x) => (
                  <li key={x} className="flex items-center gap-3">
                    <Star size={12} fill={GOLD} strokeWidth={0} aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  href={cta.primary.href}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:opacity-90"
                  style={{ background: NAVY }}
                >
                  {cta.primary.label} <ArrowRight size={16} />
                </Link>
                {s.href && (
                  <Link href={s.href} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: GOLD }}>
                    See upcoming {s.name.toLowerCase()} <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  3. How we plan your event
// ════════════════════════════════════════════════════════════════════════

function HowWePlan() {
  return (
    <section className="py-24 lg:py-32" style={{ background: NAVY }}>
      <div className={container}>
        <div className="text-center">
          <GoldLabel center>How we work</GoldLabel>
          <h2 className="mt-4 text-4xl leading-[1.1] font-semibold text-white sm:text-5xl" style={SERIF}>
            The same calm process,{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              for every event.
            </em>
          </h2>
        </div>

        <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-4xl italic lining-nums" style={{ ...SERIF, color: GOLD }}>
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-white" style={SANS}>
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-white/65">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  4. FAQ — native <details>, no JavaScript
// ════════════════════════════════════════════════════════════════════════

function Faq() {
  return (
    <section className={`${container} py-24 lg:py-32`}>
      <div className="text-center">
        <GoldLabel center>Good to know</GoldLabel>
        <h2 className="mt-4 text-4xl leading-[1.1] font-semibold sm:text-5xl" style={{ ...SERIF, color: NAVY }}>
          Questions,{" "}
          <em className="font-medium" style={{ color: GOLD }}>
            answered.
          </em>
        </h2>
      </div>

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
//  5. Call to action
// ════════════════════════════════════════════════════════════════════════

function CallToAction() {
  return (
    <section className={`${container} pb-24 lg:pb-32`}>
      <div className="relative overflow-hidden rounded-[2rem] px-8 py-16 sm:px-14 lg:py-20" style={{ background: NAVY_DEEP }}>
        <Swoosh className="absolute bottom-0 right-0 w-[26rem] max-w-[80%] opacity-60" />
        <div className="relative max-w-2xl">
          <GoldLabel>
            {brand.motto.left} · {brand.motto.right}
          </GoldLabel>
          <h2 className="mt-5 text-4xl leading-[1.1] font-semibold text-white sm:text-5xl" style={SERIF}>
            Not sure which service fits?{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              Let&apos;s talk.
            </em>
          </h2>
          <p className="mt-5 text-lg text-white/70">{cta.text}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={cta.primary.href}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-wide transition hover:opacity-90"
              style={{ background: GOLD, color: NAVY_DEEP }}
            >
              {cta.primary.label} <ArrowRight size={16} />
            </Link>
            <a
              href={cta.secondary.href}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm font-semibold tracking-wide text-white transition hover:bg-white/10"
            >
              <Phone size={16} style={{ color: GOLD }} /> {cta.secondary.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
