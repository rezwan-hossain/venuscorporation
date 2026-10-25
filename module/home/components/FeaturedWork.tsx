// module/home/components/FeaturedWork.tsx
//
// Homepage "Selected projects": a numbered list, one row per project —
//   number · photo · type + title + client · result (the highlight) · arrow
// Hover: soft cream row, photo zoom, arrow turns gold.
// Phones: number, small photo and text; the result moves under the title.
//
// Content: module/home/business/data.ts (`projects`). Demo data.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";

import { projects } from "../business/data";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], display: "swap" });

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const GOLD_DARK = "#a8852f";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";

export default function FeaturedWork() {
  return (
    <section className={`${container} py-24 lg:py-32`}>
      {/* ── Heading ── */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            <Star size={11} fill={GOLD} strokeWidth={0} aria-hidden />
            Featured work
            <span className="h-px w-12" style={{ background: GOLD }} aria-hidden />
          </p>
          <h2 className={`${serif.className} mt-4 text-4xl leading-[1.1] font-semibold sm:text-5xl`} style={{ color: NAVY }}>
            Selected{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              projects.
            </em>
          </h2>
        </div>
        <Link
          href="/contact"
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full px-6 py-3 text-sm font-semibold transition hover:bg-[#14245a] hover:text-white sm:self-auto"
          style={{ color: NAVY, boxShadow: `inset 0 0 0 1px ${GOLD}99` }}
        >
          Start your project <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* ── Projects ── */}
      <ol className="mt-12 border-t" style={{ borderColor: `${GOLD}40` }}>
        {projects.map((p, i) => (
          <li key={p.title} className="group border-b" style={{ borderColor: `${GOLD}40` }}>
            <article className="grid grid-cols-[2.5rem_5.5rem_1fr] items-center gap-4 rounded-2xl py-5 transition-colors duration-300 sm:grid-cols-[3.5rem_8rem_1fr] sm:gap-6 lg:grid-cols-[4rem_11rem_1fr_13rem_3rem] lg:gap-8 lg:px-4 lg:py-6 lg:hover:bg-[#faf8f3]">
              <span className={`${serif.className} text-2xl italic lining-nums sm:text-3xl`} style={{ color: GOLD }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#14245a] shadow-sm ring-1 ring-[#c49a3c]/15 sm:aspect-[16/10]">
                <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 11rem, 8rem" className="object-cover transition duration-700 group-hover:scale-110" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD_DARK }}>
                  {p.category}
                </p>
                <h3 className={`${serif.className} mt-1 text-xl leading-tight font-semibold sm:text-3xl`} style={{ color: NAVY }}>
                  {p.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {p.client}
                  {/* Result inline on phones/tablets */}
                  <span className="lg:hidden"> · {p.result}</span>
                </p>
              </div>

              {/* Result: the highlight (large screens) */}
              <p className={`${serif.className} hidden text-right leading-tight font-semibold lining-nums lg:block`} style={{ color: GOLD_DARK }}>
                {p.result.split(" · ").map((part, j) => (
                  <span key={part} className={j === 0 ? "block text-2xl" : "mt-0.5 block text-base text-slate-500"}>
                    {part}
                  </span>
                ))}
              </p>

              <span
                className="hidden h-11 w-11 items-center justify-center justify-self-end rounded-full border transition duration-300 group-hover:border-transparent group-hover:bg-[#dcb45c] lg:flex"
                style={{ borderColor: `${GOLD}66`, color: NAVY }}
                aria-hidden
              >
                <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
