// module/home/components/HomeFaq.tsx
//
// Homepage FAQ: "Good to know — Questions, answered."
// One card per question; click to open (native <details>, no JavaScript).
//
// Questions come from the database, edited in admin → Manage Homepage → FAQ.
// getPublicFaqs() is cached and refreshed the moment an admin saves. When
// every question is turned off, the section is hidden.

import { Cormorant_Garamond } from "next/font/google";
import { Plus, Star } from "lucide-react";

import { getPublicFaqs } from "@/app/actions/faq";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";

export default async function HomeFaq() {
  const faqs = await getPublicFaqs();
  if (faqs.length === 0) return null;

  return (
    // Comes right after the white gallery, so no extra top space.
    <section className={`${container} pb-24 lg:pb-32`}>
      {/* ── Heading: — ★ —  Good to know  Questions, answered. ── */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3" aria-hidden>
          <span className="h-px w-12" style={{ background: GOLD }} />
          <Star size={14} fill={GOLD} strokeWidth={0} />
          <span className="h-px w-12" style={{ background: GOLD }} />
        </div>
        <p
          className="mt-5 text-xs font-semibold tracking-[0.3em] uppercase"
          style={{ color: GOLD }}
        >
          Good to know
        </p>
        <h2
          className={`${serif.className} mt-3 text-4xl leading-[1.1] font-semibold sm:text-5xl`}
          style={{ color: NAVY }}
        >
          Questions,{" "}
          <em className="font-medium" style={{ color: GOLD }}>
            answered.
          </em>
        </h2>
      </div>

      {/* ── Questions ── */}
      <ul className="mx-auto mt-12 max-w-3xl space-y-3">
        {faqs.map((faq) => (
          <li key={faq.question}>
            <details
              className="group rounded-2xl border px-6 open:bg-[#faf8f3]"
              style={{ borderColor: `${GOLD}55` }}
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold [&::-webkit-details-marker]:hidden"
                style={{ color: NAVY }}
              >
                {faq.question}
                <Plus
                  size={18}
                  className="shrink-0 transition-transform duration-300 group-open:rotate-45"
                  style={{ color: GOLD }}
                  aria-hidden
                />
              </summary>
              <p className="pb-6 leading-relaxed whitespace-pre-line">
                {faq.answer}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
