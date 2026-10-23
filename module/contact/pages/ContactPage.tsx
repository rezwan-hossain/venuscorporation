// module/contact/pages/ContactPage.tsx
//
// /contact — in the brand style (navy + gold, elegant serif).
//   1. Hero — gold label, serif heading, intro and three promises
//   2. Contact card (navy, left) + event enquiry form (right)
//   3. Map — the Mirpur office
// (Small screens: everything stacks; the form comes right after the card.)
//
// Contact details live in module/contact/contact-details.ts.

import { Cormorant_Garamond } from "next/font/google";
import { Star } from "lucide-react";

import { cta } from "@/module/home/business/data-v3";
import ContactInfo from "../components/ContactInfo";
import ContactForm from "../components/ContactForm";
import { contactDetails } from "../contact-details";

// The business card's elegant serif — loaded for this page only.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-contact-serif",
});

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-contact-serif)" } as const;

const ContactPage = () => {
  return (
    <div className={`${serif.variable} bg-white text-slate-600`}>
      {/* ── 1. Hero (light, so the fixed header's dark text stays readable) ── */}
      <section className="relative overflow-hidden pt-32 pb-36 sm:pt-40 lg:pt-44 lg:pb-44" style={{ background: CREAM }}>
        {/* Gold swoosh, bottom right (decorative) */}
        <svg viewBox="0 0 400 160" className="pointer-events-none absolute right-0 bottom-0 w-[30rem] max-w-[85%]" aria-hidden>
          <path d="M0 160 C120 142 235 92 400 22 L400 160 Z" fill="#f4ecdb" opacity="0.7" />
          <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" />
          <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.8" />
        </svg>

        <div className={`${container} relative`}>
          <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            Contact us
            <span className="h-px w-12" style={{ background: GOLD }} aria-hidden />
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold text-balance sm:text-6xl lg:text-7xl" style={{ ...SERIF, color: NAVY }}>
            Tell us about your occasion.{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              We&apos;ll take it from there.
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">
            A wedding, a summit, a race day or a family celebration — share a few details and our team will come back with
            ideas and a clear quote.
          </p>
          <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {cta.promises.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm font-medium" style={{ color: NAVY }}>
                <Star size={12} fill={GOLD} strokeWidth={0} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 2. Contact card + form (pulled up over the hero) ─────────── */}
      <section className={`${container} relative -mt-20 grid items-start gap-8 lg:-mt-24 lg:grid-cols-[1fr_1.6fr] lg:gap-10`}>
        <ContactInfo />
        <ContactForm />
      </section>

      {/* ── 3. Map ─────────────────────────────────────────────────── */}
      <section className={`${container} py-24 lg:py-28`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Visit us
              <span className="h-px w-12" style={{ background: GOLD }} aria-hidden />
            </p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl" style={{ ...SERIF, color: NAVY }}>
              Our <em className="font-medium" style={{ color: GOLD }}>office</em>
            </h2>
          </div>
          <p className="max-w-sm sm:text-right">{contactDetails.address}</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] border shadow-xl shadow-[#14245a]/10" style={{ borderColor: `${GOLD}40` }}>
          <iframe
            title="Venus Corporation office on Google Maps"
            src={`https://www.google.com/maps?q=${encodeURIComponent(contactDetails.mapQuery)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[22rem] w-full grayscale-[30%] sm:h-[26rem]"
          />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
