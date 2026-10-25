// module/home/components/VenuePartners.tsx
//
// Homepage "Venue & vendor partners" — a partner wall on a cream band:
//   centred heading, then one grid of tiles separated by fine gold hairlines
//   (like a logo wall). Each tile: small gold type label, the name in serif
//   (or the logo), the city. Hover: tile lifts to white with a gold top line.
//   4 columns on large screens, 2 on phones.
//
// Content: module/home/business/data.ts (`venuePartners`). Demo data.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight } from "lucide-react";

import { venuePartners, type PartnerType } from "../business/data";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], display: "swap" });

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";

// Singular label shown on each tile.
const LABEL: Record<PartnerType, string> = {
  Venues: "Venue",
  Hotels: "Hotel",
  Catering: "Catering",
  "Décor & production": "Production",
};

export default function VenuePartners() {
  if (venuePartners.length === 0) return null;

  return (
    <section className="py-24 lg:py-28" style={{ background: CREAM }}>
      <div className={container}>
        {/* ── Heading ── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />
            Our network
            <span className="h-px w-10" style={{ background: GOLD }} aria-hidden />
          </p>
          <h2 className={`${serif.className} mt-4 text-4xl leading-[1.1] font-semibold sm:text-5xl`} style={{ color: NAVY }}>
            Venue &amp; vendor{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              partners.
            </em>
          </h2>
          <p className="mt-4 text-slate-500">
            The venues, hotels, caterers and production teams we trust — booked and managed by us, so you deal with one team.
          </p>
        </div>

        {/* ── Partner wall: the 1px gaps over a gold background draw the hairlines ── */}
        <ul className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border lg:grid-cols-4" style={{ background: `${GOLD}40`, borderColor: `${GOLD}40` }}>
          {venuePartners.map((p) => (
            <li
              key={p.name}
              className="group relative flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center transition-colors duration-300 hover:bg-white sm:min-h-44"
              style={{ background: CREAM }}
            >
              {/* Gold line that grows along the top on hover */}
              <span aria-hidden className="absolute top-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transition-all duration-500 group-hover:w-16" style={{ background: GOLD }} />

              <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                {LABEL[p.type]}
              </span>

              {p.logo ? (
                <Image src={p.logo} alt={p.name} width={180} height={64} className="mt-4 h-12 w-auto object-contain opacity-70 grayscale transition group-hover:opacity-100 group-hover:grayscale-0" />
              ) : (
                <span className={`${serif.className} mt-3 text-xl leading-tight font-semibold text-balance transition-colors duration-300 group-hover:text-[#a8852f] sm:text-2xl`} style={{ color: NAVY }}>
                  {p.name}
                </span>
              )}

              {p.place && <span className="mt-2 text-xs text-slate-400">{p.place}</span>}
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 text-sm font-semibold underline decoration-1 underline-offset-[6px] transition hover:decoration-2"
            style={{ color: NAVY, textDecorationColor: GOLD }}
          >
            Ask about a venue
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
