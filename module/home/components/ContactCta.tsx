// module/home/components/ContactCta.tsx
//
// Homepage closing section — "Let's create something unforgettable."
//   left  — motto label, serif heading, intro and three gold-star promises
//   right — "Get in touch" glass panel: plan your event (gold), call,
//           WhatsApp, message
// Background: a faint photo under the navy, a gold glow and the swoosh.
// (Small screens: text first, contact panel below.)
//
// Content: module/home/business/data-v3.ts (`cta`, `brand`). Demo data — no
// database. No client JavaScript.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, Check, Mail, MessageCircle, Phone, Star } from "lucide-react";

import { contactDetails } from "@/config/contact";
import { brand, cta } from "../business/data-v3";

// The business card's elegant serif.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cta-serif",
});

// Look (from the business card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on navy
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-cta-serif)" } as const;

/** The card's navy + gold corner swoosh (decorative). */
function Swoosh({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 160" className={`pointer-events-none ${className}`} aria-hidden>
      <path d="M0 160 C120 142 235 92 400 22 L400 160 Z" fill="#f4ecdb" opacity="0.08" />
      <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" />
      <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.7" />
      <path d="M235 160 C305 142 352 122 400 100 L400 160 Z" fill={NAVY_DEEP} />
    </svg>
  );
}

/** One way to reach us: icon · title + detail · arrow. */
function ContactOption({
  href,
  icon,
  title,
  detail,
  primary = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  primary?: boolean;
}) {
  const external = href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");
  const className = `group flex items-center gap-4 rounded-2xl px-5 py-3 transition duration-300 ${
    primary ? "hover:brightness-110" : "border border-white/15 hover:border-white/30 hover:bg-white/[0.07]"
  }`;
  const style = primary ? { background: GOLD_LIGHT, color: NAVY_DEEP } : { color: "#fff" };
  const body = (
    <>
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={primary ? { background: NAVY_DEEP, color: GOLD_LIGHT } : { background: "rgba(255,255,255,0.08)", color: GOLD_LIGHT }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className={`block truncate text-sm ${primary ? "text-[#0d1840]/70" : "text-white/60"}`}>{detail}</span>
      </span>
      <ArrowRight size={18} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
    </>
  );
  return external ? (
    <a href={href} className={className} style={style} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className} style={style}>
      {body}
    </Link>
  );
}

export default function ContactCta() {
  return (
    <section className={`${serif.variable} relative isolate overflow-hidden`} style={{ background: NAVY }}>
      {/* Faint photo + navy wash, gold glow, swoosh (all decorative) */}
      <Image src={cta.background} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-15 mix-blend-luminosity" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-[#14245a] via-[#14245a]/90 to-[#14245a]/70" />
      <div aria-hidden className="absolute -top-32 -left-32 -z-10 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: GOLD }} />
      <div aria-hidden className="absolute -right-24 -bottom-40 -z-10 h-96 w-96 rounded-full opacity-15 blur-3xl" style={{ background: "#6f86d6" }} />
      <Swoosh className="absolute right-0 bottom-0 -z-10 w-[36rem] max-w-[95%]" />

      <div className={`${container} grid gap-10 py-16 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16 lg:py-20`}>
        {/* 8.1 The ask */}
        <div>
          <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD_LIGHT }}>
            {brand.motto.left} · {brand.motto.right}
            <span className="h-px w-10" style={{ background: GOLD_LIGHT }} aria-hidden />
          </p>
          <h2 className="mt-5 text-4xl leading-[1.05] font-semibold text-balance text-white sm:text-5xl lg:text-6xl" style={SERIF}>
            Let&apos;s create something{" "}
            <em className="font-medium" style={{ color: GOLD_LIGHT }}>
              unforgettable.
            </em>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">{cta.text}</p>

          {/* Promises */}
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {cta.promises.map((p) => (
              <li key={p} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/85">
                <Check size={14} strokeWidth={2.5} style={{ color: GOLD_LIGHT }} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* 8.2 Three ways to reach us, in a glass panel */}
        <div className="rounded-[1.75rem] border border-[#dcb45c]/25 bg-white/[0.04] p-3 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-4">
          <p className="flex items-center justify-between px-3 pt-2 pb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
            Get in touch
            <span className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] normal-case text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" aria-hidden /> We&apos;re online
            </span>
          </p>
          <div className="space-y-2.5">
            <ContactOption primary href={cta.primary.href} icon={<Star size={18} fill="currentColor" strokeWidth={0} />} title={cta.primary.label} detail="Tell us about your occasion" />
            <ContactOption href={cta.secondary.href} icon={<Phone size={18} />} title={cta.secondary.label} detail={cta.phone} />
            <ContactOption href={contactDetails.whatsapp.href} icon={<MessageCircle size={18} />} title="WhatsApp" detail="Chat with our team" />
            <ContactOption href="/contact" icon={<Mail size={18} />} title="Send us a message" detail={cta.email} />
          </div>
          <p className="px-3 pt-3 text-center text-xs text-white/45">We reply within one working day.</p>
        </div>
      </div>
    </section>
  );
}
