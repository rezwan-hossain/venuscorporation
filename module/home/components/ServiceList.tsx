// module/home/components/ServiceList.tsx
//
// Homepage "Our services" — an expandable list, one row per service
// (native <details>, the first one open, smooth open/close via
// ServiceList.module.css). Closed rows show a teaser of what's included;
// each row opens to a photo, the description, tags and links.
//
// Content: module/home/business/data-v3.ts (`services`) and the proposal
// link from data-v5.ts (`invitation`). Demo data — no database.
// No client JavaScript.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, ArrowUpRight, Plus, Star } from "lucide-react";

import { services } from "../business/data-v3";
import { invitation } from "../business/data-v5";
import styles from "./ServiceList.module.css";

// The business card's elegant serif.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-services-serif",
});

// Look (from the business card)
const NAVY = "#14245a";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on photos
const GOLD_DARK = "#a8852f"; // gold for small text on white (easier to read)
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-services-serif)" } as const;

/** "Exhibitions & Trade Shows" → "exhibitions-trade-shows" (anchor on /services). */
const serviceSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function ServiceList() {
  return (
    <section id="services" className={`${serif.variable} ${container} scroll-mt-24 py-24 lg:py-32`}>
      {/* Heading: "— ★ —" ornament, gold label, serif title */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3" aria-hidden>
          <span className="h-px w-12" style={{ background: GOLD }} />
          <Star size={14} fill={GOLD} strokeWidth={0} />
          <span className="h-px w-12" style={{ background: GOLD }} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
          Our services
        </p>
        <h2 className="mt-3 text-4xl leading-[1.1] font-semibold sm:text-5xl" style={{ ...SERIF, color: NAVY }}>
          Every occasion,{" "}
          <em className="font-medium" style={{ color: GOLD }}>
            handled with care.
          </em>
        </h2>
      </div>

      <ul className={`${styles.list} mx-auto mt-14 max-w-6xl space-y-3`}>
        {services.map((s, i) => (
          <li key={s.name}>
            <details
              className={`${styles.row} group rounded-3xl border border-transparent transition-[background-color,border-color] duration-300 open:border-[#c49a3c]/25 open:bg-[#faf8f3] hover:bg-[#faf8f3]`}
              open={i === 0}
            >
              {/* 1. The row you click */}
              <summary className="flex cursor-pointer list-none items-center gap-5 px-4 py-6 sm:gap-6 sm:px-7 [&::-webkit-details-marker]:hidden">
                <span className="w-9 shrink-0 text-2xl italic lining-nums sm:w-11 sm:text-3xl" style={{ ...SERIF, color: GOLD }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-2xl leading-tight font-semibold transition-transform duration-300 group-hover:translate-x-1 sm:text-4xl"
                    style={{ ...SERIF, color: NAVY }}
                  >
                    {s.name}
                  </span>
                  {/* Teaser: what's included (hidden once the row is open) */}
                  <span className="mt-1 hidden truncate text-sm text-slate-400 group-open:hidden md:block">{s.includes.join(" · ")}</span>
                </span>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c49a3c]/60 text-[#14245a] transition duration-300 group-hover:border-[#14245a] group-open:rotate-45 group-open:border-transparent group-open:bg-[#14245a] group-open:text-[#dcb45c]"
                  aria-hidden
                >
                  <Plus size={18} />
                </span>
              </summary>

              {/* 2. What opens: big photo + details */}
              <div className={`${styles.panel} grid gap-8 px-4 pb-6 sm:px-7 sm:pb-7 lg:grid-cols-[1.45fr_1fr] lg:gap-12`}>
                {/* 2.1 Photo */}
                <div
                  className="group/photo relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl shadow-[#14245a]/15 sm:aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]"
                  style={{ background: NAVY }}
                >
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 58vw, 92vw"
                    className="object-cover transition duration-[1200ms] ease-out group-hover/photo:scale-105"
                  />
                  <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0d1840]/60 via-transparent to-transparent" />
                  {/* Frosted label */}
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-3 rounded-full border border-white/20 bg-[#0d1840]/70 px-4 py-2 text-white sm:bottom-5 sm:left-5">
                    <span className="text-lg italic lining-nums" style={{ ...SERIF, color: GOLD_LIGHT }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-4 w-px bg-white/30" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">{s.name}</span>
                  </span>
                </div>

                {/* 2.2 Details */}
                <div className="flex flex-col justify-center py-2">
                  <p className="text-xl leading-relaxed text-slate-700" style={SERIF}>
                    {s.text}
                  </p>

                  <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD_DARK }}>
                    What we handle
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {s.includes.map((x) => (
                      <li key={x} className="inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-sm" style={{ borderColor: `${GOLD}55`, color: NAVY }}>
                        <Star size={10} fill={GOLD} strokeWidth={0} aria-hidden />
                        {x}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-7" style={{ borderColor: `${GOLD}33` }}>
                    <Link
                      href={invitation.primaryCta.href}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide text-white transition hover:opacity-90"
                      style={{ background: NAVY }}
                    >
                      {invitation.primaryCta.label} <ArrowRight size={16} />
                    </Link>
                    <Link
                      href={s.href ?? `/services#${serviceSlug(s.name)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                      style={{ color: GOLD_DARK }}
                    >
                      {s.href ? `Upcoming ${s.name.toLowerCase()}` : "Learn more"} <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <div className="mt-12 text-center">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-1 underline-offset-[6px] transition hover:decoration-2"
          style={{ color: NAVY, textDecorationColor: GOLD }}
        >
          See all services <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
