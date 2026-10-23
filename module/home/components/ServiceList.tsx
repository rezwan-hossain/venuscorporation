// module/home/components/ServiceList.tsx
//
// Homepage "Our services" — an expandable list, one row per service
// (native <details>, the first one open). Each row opens to a photo, the
// description, what's included and links.
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
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-services-serif)" } as const;

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
