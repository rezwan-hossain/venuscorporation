// module/home/components/Gallery.tsx
//
// Homepage "Our gallery" — a photo mosaic that ends with a navy
// "View full gallery" tile.
//   • every photo: number + serif label on a soft fade, gold frame and a
//     slow zoom on hover
//   • the last tile links to /gallery
//
// Photos: the 6 newest from the gallery (admin → Manage Gallery). They come
// from getGalleryImages(), which is cached for days and refreshed whenever a
// gallery photo is added, edited or deleted.
// With fewer than 6 photos in the gallery, the demo photos in
// business/data-v3.ts (`gallery`) fill the remaining tiles.
// No client JavaScript.

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowUpRight } from "lucide-react";

import { getGalleryImages } from "@/app/actions/gallery";
import { gallery as demoPhotos } from "../business/data-v3";

// The business card's elegant serif.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-gallery-serif",
});

// Look (from the business card)
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on dark
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-gallery-serif)" } as const;

/**
 * Size of each photo tile (index = position in `gallery`).
 * Large screens, 4 columns (★ = the "View full gallery" tile):
 *   [ 0 0 | 1 | 2 ]
 *   [ 0 0 | 3 | 2 ]
 *   [ 4 | 5 5 | ★ ]
 * Small screens, 2 columns: photos 0 and 5 are full width.
 */
const TILE = [
  "col-span-2 row-span-2", // 0 — big
  "", //                      1
  "lg:row-span-2", //         2 — tall
  "", //                      3
  "", //                      4
  "col-span-2", //            5 — wide
];

const PHOTO_COUNT = 6; // the mosaic has 6 photo tiles (see TILE)

type Photo = { image: string; label: string };

/**
 * next/image only resizes photos from hosts listed in next.config.ts. A
 * photo pasted from anywhere else is shown as it is.
 */
const canOptimize = (url: string) =>
  url.startsWith("/") ||
  url.startsWith("https://images.unsplash.com/") ||
  url.startsWith("https://res.cloudinary.com/") ||
  url.includes(".supabase.co/storage/");

/** The 6 newest gallery photos, topped up with demo photos if there are fewer. */
async function getPhotos(): Promise<Photo[]> {
  const newest = (await getGalleryImages()) // cached, newest first
    .slice(0, PHOTO_COUNT)
    .map((img) => ({ image: img.src, label: img.alt ?? "" }));
  const topUp = demoPhotos.slice(0, PHOTO_COUNT - newest.length);
  return [...newest, ...topUp];
}

export default async function Gallery() {
  const photos = await getPhotos();

  return (
    <section className={`${serif.variable} ${container} py-24 lg:py-32`}>
      {/* ── 1. Heading ─────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p
            className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            Moments we&apos;ve made
            <span
              className="h-px w-12"
              style={{ background: GOLD }}
              aria-hidden
            />
          </p>
          <h2
            className="mt-4 text-4xl leading-[1.1] font-semibold sm:text-5xl"
            style={{ ...SERIF, color: NAVY }}
          >
            Our{" "}
            <em className="font-medium" style={{ color: GOLD }}>
              gallery
            </em>
          </h2>
        </div>
        <p className="max-w-sm text-slate-500 lg:text-right">
          Weddings, summits, race days and celebrations — a few favourites from
          recent seasons.
        </p>
      </div>

      {/* ── 2. Mosaic ──────────────────────────────────────────── */}
      <ul className="mt-12 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:grid-cols-4">
        {photos.map((g, i) => (
          <li
            key={`${i}-${g.image}`}
            className={`group relative overflow-hidden rounded-3xl ${TILE[i] ?? ""}`}
            style={{ background: NAVY }}
          >
            <Image
              src={g.image}
              alt={g.label || "Photo from a Venus Corporation event"}
              fill
              unoptimized={!canOptimize(g.image)}
              sizes={
                i === 0 || i === 5
                  ? "(min-width: 1024px) 50vw, 92vw"
                  : "(min-width: 1024px) 25vw, 46vw"
              }
              className="object-cover transition duration-[1200ms] ease-out group-hover:scale-110"
            />
            {/* Soft fade at the bottom for the label; a little darker on hover */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#0d1840]/80 via-[#0d1840]/10 to-transparent transition duration-500 group-hover:from-[#0d1840]/90 group-hover:via-[#0d1840]/30"
            />
            {/* Thin gold frame that appears on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-2xl border opacity-0 transition duration-500 group-hover:opacity-100"
              style={{ borderColor: `${GOLD_LIGHT}b3` }}
            />
            {/* Number + label */}
            <p className="absolute bottom-4 left-5 flex items-baseline gap-2 text-white sm:bottom-5 sm:left-6">
              <span
                className="text-sm lining-nums"
                style={{ ...SERIF, color: GOLD_LIGHT }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {g.label && (
                <span
                  className={`line-clamp-1 italic transition duration-500 group-hover:-translate-y-0.5 ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}
                  style={SERIF}
                >
                  {g.label}
                </span>
              )}
            </p>
          </li>
        ))}

        {/* ── 3. "View full gallery" tile ─────────────────────────── */}
        <li className="col-span-2 lg:col-span-1">
          <Link
            href="/gallery"
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-6 text-white transition"
            style={{ background: NAVY_DEEP }}
          >
            {/* Gold swoosh in the corner (decorative) */}
            <svg
              viewBox="0 0 200 120"
              className="pointer-events-none absolute -right-6 bottom-0 w-48 opacity-70 transition duration-700 group-hover:translate-x-2"
              aria-hidden
            >
              <path
                d="M0 120 C70 108 130 78 200 30"
                fill="none"
                stroke={GOLD}
                strokeWidth="2"
              />
              <path
                d="M50 120 C110 104 160 80 200 58"
                fill="none"
                stroke={GOLD}
                strokeWidth="1"
                opacity="0.7"
              />
            </svg>

            <span
              className="text-[11px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: GOLD_LIGHT }}
            >
              See more
            </span>
            <span className="relative flex items-end justify-between gap-4">
              <span
                className="text-3xl leading-tight font-semibold"
                style={SERIF}
              >
                View full{" "}
                <em className="font-medium" style={{ color: GOLD_LIGHT }}>
                  gallery
                </em>
              </span>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 transition group-hover:border-transparent group-hover:bg-[#dcb45c] group-hover:text-[#0d1840]"
                aria-hidden
              >
                <ArrowUpRight size={18} />
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
