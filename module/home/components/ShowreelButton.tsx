"use client";

// module/home/components/ShowreelButton.tsx
//
// The hero's "Watch our events" button. Click → a full-screen player
// (native <dialog>) opens and the showreel plays.
//   • a YouTube link (watch?v=, youtu.be/, /shorts/, /live/, /embed/) →
//     YouTube's player (privacy-enhanced youtube-nocookie.com)
//   • any other link (e.g. "/videos/showreel.mp4") → a plain <video>
// Close with the × button, Esc, or a click outside the video. The player is
// only mounted while the dialog is open, so closing always stops the video.
//
// Used by SummitHero; the link comes from data-v5.ts (`summitHero.showreel`).

import { useRef, useState } from "react";
import { Play, X } from "lucide-react";

const NAVY_DEEP = "#0d1840";
const GOLD_LIGHT = "#dcb45c";

type Props = {
  label: string;
  video: { url: string; title: string };
};

/** Pull the 11-character video id out of any common YouTube link (null if it isn't one). */
export function youTubeId(url: string): string | null {
  const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export default function ShowreelButton({ label, video }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState(false);
  const ytId = youTubeId(video.url);

  // 1. Open the player — the iframe/video mounts and starts playing
  function open() {
    setPlaying(true);
    dialogRef.current?.showModal();
  }

  // 2. Closing (any way: ×, Esc, backdrop) → unmount the player = stop
  function handleClose() {
    setPlaying(false);
  }

  // 3. A click on the dark backdrop (outside the video box) closes it
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" onClick={open} className="group inline-flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition group-hover:bg-white/10"
          style={{ borderColor: GOLD_LIGHT }}
          aria-hidden
        >
          {/* Soft pulse ring — hints that this plays a video */}
          <span className="absolute inset-0 animate-ping rounded-full border opacity-40 motion-reduce:hidden" style={{ borderColor: GOLD_LIGHT, animationDuration: "2.4s" }} />
          <Play size={14} fill="#fff" strokeWidth={0} className="translate-x-px" />
        </span>
        {label}
      </button>

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={handleBackdropClick}
        aria-label={video.title}
        className="m-auto w-[min(92vw,72rem)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-[#0d1840]/90 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close video"
            className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-[#0d1840] sm:top-0 sm:-right-12"
          >
            <X size={18} />
          </button>

          <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10" style={{ background: NAVY_DEEP }}>
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
                <video src={video.url} controls autoPlay playsInline className="h-full w-full">
                  Your browser can&apos;t play this video.
                </video>
              ))}
          </div>
        </div>
      </dialog>
    </>
  );
}
