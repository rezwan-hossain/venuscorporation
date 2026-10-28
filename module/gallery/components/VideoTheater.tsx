"use client";

// module/gallery/components/VideoTheater.tsx
//
// Gallery "Watch our events" — a cinema-style section on deep navy:
//   - the screen: the selected film, large. Press play → it plays right there
//     (YouTube's privacy-enhanced player, or a plain <video> for files).
//   - the playlist: the films with thumbnail, category, title and length.
//     Click one to put it on the screen (it starts playing).
//   Large screens: screen left, playlist right. Phones: screen, then a
//   swipeable row of thumbnails.
//
// Videos: module/gallery/videos.ts.

import { useState } from "react";
import { ArrowRight, Clock, Play } from "lucide-react";

import { youTubeId } from "@/lib/youtube";
import type { GalleryVideo } from "../videos";

const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c";
const SERIF = { fontFamily: "var(--font-gallery-page-serif)" } as const;

const coverOf = (v: GalleryVideo) => {
  const id = youTubeId(v.url);
  return v.cover ?? (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined);
};

export default function VideoTheater({ videos }: { videos: GalleryVideo[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = videos[active];
  const ytId = youTubeId(video.url);
  const cover = coverOf(video);

  const choose = (i: number) => {
    setActive(i);
    setPlaying(true);
  };
  const next = (active + 1) % videos.length;
  const num = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
      {/* ── The screen ── */}
      <div>
        <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(220,180,92,0.35)]">
          {playing ? (
            ytId ? (
              <iframe
                key={video.url}
                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video key={video.url} src={video.url} controls autoPlay playsInline className="absolute inset-0 h-full w-full" />
            )
          ) : (
            <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${video.title}`} className="group absolute inset-0 cursor-pointer outline-none">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-105" />
              )}
              <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/20" />
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:border-transparent group-hover:bg-[#dcb45c] group-hover:text-[#0d1840] sm:h-20 sm:w-20">
                  <Play size={26} fill="currentColor" strokeWidth={0} className="translate-x-0.5" />
                </span>
              </span>
              {video.duration && (
                <span className="absolute right-4 bottom-4 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums backdrop-blur">{video.duration}</span>
              )}
            </button>
          )}
        </div>

        {/* Caption under the screen */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.3em]">
              <span style={{ color: GOLD_LIGHT }}>{playing ? "Now showing" : video.category}</span>
              {video.duration && (
                <span className="flex items-center gap-1.5 text-white/45 tabular-nums">
                  <Clock size={11} aria-hidden /> {video.duration}
                </span>
              )}
            </p>
            <h3 className="mt-2 text-2xl leading-tight font-semibold text-white sm:text-3xl" style={SERIF}>
              {video.title}
            </h3>
          </div>
          {videos.length > 1 && (
            <button
              type="button"
              onClick={() => choose(next)}
              className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-[#dcb45c]/60 hover:text-white"
            >
              <span className="text-white/45">Up next:</span>
              <span className="max-w-[12rem] truncate">{videos[next].title}</span>
              <ArrowRight size={14} className="text-[#dcb45c] transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* ── The playlist ── */}
      {videos.length > 1 && (
        <div className="min-w-0">
          <p className="mb-4 hidden items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45 lg:flex">
            Playlist <span className="h-px flex-1 bg-white/10" aria-hidden /> {videos.length} films
          </p>
          <ol className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {videos.map((v, i) => {
              const isActive = i === active;
              const c = coverOf(v);
              return (
                <li key={v.url} className="w-[70%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    aria-current={isActive || undefined}
                    className={`group relative flex w-full cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border p-3 text-left transition duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#dcb45c] lg:flex-row lg:items-center lg:gap-4 ${
                      isActive ? "border-[#dcb45c]/50 bg-white/[0.08]" : "border-white/10 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]"
                    }`}
                  >
                    {/* Gold bar on the film that's showing */}
                    <span aria-hidden className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-[#dcb45c] transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
                    <span
                      className={`hidden w-6 shrink-0 text-xl italic lining-nums lg:block ${isActive ? "text-[#dcb45c]" : "text-white/35"}`}
                      style={SERIF}
                      aria-hidden
                    >
                      {num(i)}
                    </span>
                    <span className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/10 lg:w-28">
                      {c && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30" aria-hidden>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full transition ${isActive ? "bg-[#dcb45c] text-[#0d1840]" : "bg-white/15 text-white backdrop-blur group-hover:bg-[#dcb45c] group-hover:text-[#0d1840]"}`}>
                          <Play size={12} fill="currentColor" strokeWidth={0} className="translate-x-px" />
                        </span>
                      </span>
                      {v.duration && <span className="absolute right-1.5 bottom-1.5 rounded bg-black/60 px-1.5 text-[10px] font-semibold text-white tabular-nums">{v.duration}</span>}
                    </span>
                    <span className="min-w-0 px-1 pb-1 lg:px-0 lg:pb-0">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: isActive ? GOLD_LIGHT : GOLD }}>
                        {isActive ? "Now showing" : v.category}
                      </span>
                      <span className={`mt-1 line-clamp-2 block text-[1.05rem] leading-snug font-semibold transition-colors ${isActive ? "text-white" : "text-white/70 group-hover:text-white"}`} style={SERIF}>
                        {v.title}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
