// module/home/components/WhoWeAre.tsx
//
// Homepage "Who we are" — photo with an offset gold frame + text, points
// and a "Meet the team" link.
//
// Content: module/home/business/data.ts (`about`). Demo data — no database.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { about } from "../business/data";

// Look (from the business card)
const NAVY = "#14245a";
const GOLD = "#c49a3c";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";

export default function WhoWeAre() {
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
