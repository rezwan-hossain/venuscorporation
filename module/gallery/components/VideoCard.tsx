"use client";

// module/gallery/components/VideoCard.tsx
//
// One video in the gallery's "Watch our events" section: a cover with a gold
// play button. Click → a full-screen player (native <dialog>) opens and plays.
//   - YouTube links play in YouTube's privacy-enhanced player
//   - other links (e.g. "/videos/x.mp4") play in a plain <video>
// The player only loads when opened, and closing it (×, Esc, click outside)
// removes it, so the video always stops.

import { useRef, useState } from "react";
import { Play, X } from "lucide-react";

import { youTubeId } from "@/module/home/components/ShowreelButton";
import type { GalleryVideo } from "../videos";

const SERIF = { fontFamily: "var(--font-gallery-page-serif)" } as const;

export default function VideoCard({ video, featured = false }: { video: GalleryVideo; featured?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState(false);
  const ytId = youTubeId(video.url);
  const cover = video.cover ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : undefined);

  const open = () => {
    setPlaying(true);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={`Play video: ${video.title}`}
        className={`group relative block w-full cursor-pointer overflow-hidden rounded-[1.75rem] bg-[#14245a] text-left outline-none focus-visible:ring-4 focus-visible:ring-[#c49a3c] ${
          featured ? "aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full" : "aspect-[4/3] sm:aspect-video"
        }`}
      >
        {cover && (
          // Plain <img>: covers can come from YouTube or any host.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-105" />
        )}
        <span aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0d1840]/90 via-[#0d1840]/25 to-[#0d1840]/10" />

        {/* Gold play button */}
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span
            className={`flex items-center justify-center rounded-full bg-[#dcb45c] text-[#0d1840] shadow-2xl shadow-black/40 ring-8 ring-white/15 transition duration-300 group-hover:scale-110 group-hover:ring-white/25 ${
              featured ? "h-16 w-16 sm:h-20 sm:w-20" : "h-14 w-14"
            }`}
          >
            <Play size={featured ? 26 : 20} fill="currentColor" strokeWidth={0} className="translate-x-0.5" />
          </span>
        </span>

        {/* Duration */}
        {video.duration && (
          <span className="absolute top-4 right-4 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums backdrop-blur">
            {video.duration}
          </span>
        )}

        {/* Category + title */}
        <span className={`absolute inset-x-0 bottom-0 ${featured ? "p-5 sm:p-9" : "p-5"}`}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#dcb45c]">{video.category}</span>
          <span className={`mt-1.5 block leading-tight font-semibold text-white ${featured ? "text-2xl sm:text-4xl" : "text-xl"}`} style={SERIF}>
            {video.title}
          </span>
        </span>
      </button>

      {/* ── Player ── */}
      <dialog
        ref={dialogRef}
        onClose={() => setPlaying(false)}
        onClick={(e) => e.target === dialogRef.current && close()}
        aria-label={video.title}
        className="m-auto w-[min(92vw,72rem)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-[#0d1840]/90 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <button
            type="button"
            onClick={close}
            aria-label="Close video"
            className="absolute -top-12 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-[#0d1840] sm:top-0 sm:-right-12"
          >
            <X size={18} />
          </button>
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#0d1840] shadow-2xl ring-1 ring-white/10">
            {playing &&
              (ytId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`}
                  title={video.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full"
                />
              ) : (
                <video src={video.url} controls autoPlay playsInline className="h-full w-full" />
              ))}
          </div>
          <p className="mt-4 text-center text-xl text-white/85 italic" style={SERIF}>
            {video.title}
          </p>
        </div>
      </dialog>
    </>
  );
}
