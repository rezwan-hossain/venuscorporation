// module/gallery/pages/GalleryPage.tsx
//
// /gallery — in the brand style (navy + gold, elegant serif).
//   1. Hero — gold label, serif heading, photo count
//   2. The photo grid + lightbox (Gallery, client component)
//   3. Call to action — "Want moments like these?"
// Photos and event films come from the database (app/actions/gallery.ts,
// app/actions/gallery-videos.ts) — see app/gallery/page.tsx.

import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowRight, Camera, Play } from "lucide-react";

import Gallery from "../components/Gallery";
import VideoTheater from "../components/VideoTheater";
import type { GalleryVideo } from "../videos";
import type { GalleryImage } from "@/types/gallery";

// The business card's elegant serif — loaded for this page only.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-gallery-page-serif",
});

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c";
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-gallery-page-serif)" } as const;

type GalleryPageProps = {
  images: GalleryImage[];
  videos: GalleryVideo[]; // empty = no "Event films" section
};

const GalleryPage = ({ images, videos }: GalleryPageProps) => {
  return (
    <div className={`${serif.variable} bg-white text-slate-600`}>
      {/* ── 1. Hero (light, so the fixed header's dark text stays readable) ── */}
      <section
        className="relative overflow-hidden pt-32 pb-16 sm:pt-40 lg:pt-44 lg:pb-20"
        style={{ background: CREAM }}
      >
        <svg
          viewBox="0 0 400 160"
          className="pointer-events-none absolute right-0 bottom-0 w-[30rem] max-w-[85%]"
          aria-hidden
        >
          <path
            d="M0 160 C120 142 235 92 400 22 L400 160 Z"
            fill="#f4ecdb"
            opacity="0.7"
          />
          <path
            d="M40 160 C175 132 280 82 400 34"
            fill="none"
            stroke={GOLD}
            strokeWidth="2.5"
          />
          <path
            d="M120 160 C225 138 305 104 400 66"
            fill="none"
            stroke={GOLD}
            strokeWidth="1.25"
            opacity="0.8"
          />
        </svg>

        <div
          className={`${container} relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end`}
        >
          <div>
            <p
              className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: GOLD }}
            >
              Our gallery
              <span
                className="h-px w-12"
                style={{ background: GOLD }}
                aria-hidden
              />
            </p>
            <h1
              className="mt-6 text-5xl leading-[1.02] font-semibold sm:text-6xl lg:text-7xl"
              style={{ ...SERIF, color: NAVY }}
            >
              Moments we&apos;ve{" "}
              <em className="font-medium" style={{ color: GOLD }}>
                made.
              </em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed">
              Weddings, summits, race days and celebrations — a look behind the
              scenes and in front of the stage.
            </p>
          </div>

          {images.length > 0 && (
            <p
              className="flex items-center gap-3 self-start rounded-full border bg-white px-5 py-2.5 text-sm font-medium lg:self-end"
              style={{ borderColor: `${GOLD}55`, color: NAVY }}
            >
              <Camera size={16} style={{ color: GOLD }} aria-hidden />
              <span className="lining-nums">{images.length}</span> photos · tap
              any to enlarge
            </p>
          )}
        </div>
      </section>

      {/* ── 2. Photos ──────────────────────────────────────────────── */}
      <section className={`${container} py-16 lg:py-20`}>
        {images.length > 0 ? (
          <Gallery images={images} />
        ) : (
          <div
            className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] border px-8 py-16 text-center"
            style={{ borderColor: `${GOLD}40`, background: CREAM }}
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: NAVY, color: GOLD_LIGHT }}
            >
              <Camera size={24} />
            </span>
            <p
              className="mt-5 text-3xl font-semibold"
              style={{ ...SERIF, color: NAVY }}
            >
              Photos{" "}
              <em className="font-medium" style={{ color: GOLD }}>
                coming soon
              </em>
            </p>
            <p className="mt-2">
              Check back soon for moments from our latest events.
            </p>
          </div>
        )}
      </section>

      {/* ── 3. Videos ──────────────────────────────────────────────── */}
      {videos.length > 0 && <VideoSection videos={videos} />}

      {/* ── 4. Call to action ──────────────────────────────────────── */}
      <section className={`${container} pb-24 lg:pb-32`}>
        <div
          className="relative overflow-hidden rounded-[2rem] px-8 py-14 text-center sm:px-14 lg:py-16"
          style={{ background: NAVY }}
        >
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 h-48 w-[36rem] max-w-full -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: GOLD }}
          />
          <h2
            className="relative text-4xl leading-tight font-semibold text-white sm:text-5xl"
            style={SERIF}
          >
            Want moments{" "}
            <em className="font-medium" style={{ color: GOLD_LIGHT }}>
              like these?
            </em>
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/70">
            Tell us about your occasion — we&apos;ll plan it, run it and make it
            worth remembering.
          </p>
          <Link
            href="/contact"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-wide transition hover:brightness-110"
            style={{ background: GOLD_LIGHT, color: "#0d1840" }}
          >
            Plan your event <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;

/** "Watch our events": cinema-style band — the screen and a playlist (VideoTheater). */
function VideoSection({ videos }: { videos: GalleryVideo[] }) {
  return (
    <section
      className="relative isolate mb-24 overflow-hidden py-20 lg:mb-32 lg:py-28"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #1b2d6b 0%, #0d1840 55%, #080f2b 100%)",
      }}
    >
      {/* Soft gold "projector" glow at the top (decorative) */}
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 h-80 w-[44rem] max-w-full -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: GOLD }}
      />

      <div className={container}>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p
              className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: GOLD_LIGHT }}
            >
              <Play size={11} fill={GOLD_LIGHT} strokeWidth={0} aria-hidden />
              Event films
              <span
                className="h-px w-12"
                style={{ background: GOLD_LIGHT }}
                aria-hidden
              />
            </p>
            <h2
              className="mt-4 text-4xl leading-[1.1] font-semibold text-white sm:text-5xl"
              style={SERIF}
            >
              Watch our{" "}
              <em className="font-medium" style={{ color: GOLD_LIGHT }}>
                events.
              </em>
            </h2>
          </div>
          <p className="max-w-sm text-white/60 sm:text-right">
            The atmosphere, in motion — a few highlights from recent events.
          </p>
        </div>

        <div className="mt-12">
          <VideoTheater videos={videos} />
        </div>
      </div>
    </section>
  );
}
