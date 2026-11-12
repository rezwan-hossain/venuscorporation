// module/gallery/components/Gallery.tsx
"use client";

// Photo grid + lightbox for /gallery.
//   Filters: chips per service (Weddings, Sports Events …) with photo counts.
//   Only services that have photos get a chip; untagged photos show under
//   "All". The choice goes in the link (/gallery?service=weddings) so it can
//   be shared — read once on load, then kept in sync without a page reload.
//   Grid: CSS columns (masonry). Each tile gets a shape from a repeating
//   pattern (tall / square / wide …) so the columns look varied but tidy.
//   Hover: slow zoom, navy fade, number + caption.
//   Lightbox: click a photo → full-screen viewer with prev / next (inside the
//   chosen filter), a "Weddings · 3 / 11" counter, caption and a thumbnail strip.
//   Keyboard: ← → to move, Esc to close. Page scroll is locked while open.

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { GalleryImage } from "@/types/gallery";
import { GALLERY_SERVICES, serviceLabel } from "@/lib/gallery-services";

interface GalleryProps {
  images: GalleryImage[];
}

const GOLD_LIGHT = "#dcb45c";
const SERIF = { fontFamily: "var(--font-gallery-page-serif)" } as const;

// Repeating tile shapes (index % length) — mixes tall, square and wide.
const SHAPES = ["aspect-[4/5]", "aspect-square", "aspect-[4/3]", "aspect-[3/4]", "aspect-[5/4]", "aspect-[2/3]"];

/** 0 → "01" */
const num = (i: number) => String(i + 1).padStart(2, "0");

const ALL = "all";

/** Put the chosen filter in the address bar (no reload, no new history entry). */
function writeFilterToUrl(service: string) {
  const url = new URL(window.location.href);
  if (service === ALL) url.searchParams.delete("service");
  else url.searchParams.set("service", service);
  window.history.replaceState(null, "", url);
}

const Gallery = ({ images: allImages }: GalleryProps) => {
  const [filter, setFilter] = useState(ALL); // "all" or a service slug
  const [open, setOpen] = useState<number | null>(null); // index of the photo in the lightbox

  // Chips: only services that have photos, in the fixed order, with counts
  const chips = GALLERY_SERVICES.map((s) => ({
    ...s,
    count: allImages.filter((img) => img.service === s.slug).length,
  })).filter((chip) => chip.count > 0);

  // A shared link like /gallery?service=weddings opens on that filter.
  // Read after the first render: the page itself is cached for everyone.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("service");
    if (fromUrl && allImages.some((img) => img.service === fromUrl)) {
      setFilter(fromUrl); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [allImages]);

  const choose = (service: string) => {
    setFilter(service);
    setOpen(null);
    writeFilterToUrl(service);
  };

  const images =
    filter === ALL ? allImages : allImages.filter((img) => img.service === filter);
  const total = images.length;
  const filterLabel = serviceLabel(filter);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + total) % total)), [total]);
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % total)), [total]);

  // Keyboard + scroll lock while the lightbox is open
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  const current = open === null ? null : images[open];

  return (
    <>
      {/* ── Filter chips (only when at least one photo has a service) ── */}
      {chips.length > 0 && (
        <div
          role="group"
          aria-label="Filter photos by service"
          className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <Chip active={filter === ALL} onClick={() => choose(ALL)} label="All" count={allImages.length} />
          {chips.map((chip) => (
            <Chip
              key={chip.slug}
              active={filter === chip.slug}
              onClick={() => choose(chip.slug)}
              label={chip.label}
              count={chip.count}
            />
          ))}
        </div>
      )}

      {/* ── Grid (key → fades in again when the filter changes) ──────── */}
      <ul key={filter} className="animate-fade-in columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
        {images.map((img, i) => (
          <li key={img.id} className="mb-3 break-inside-avoid sm:mb-4">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1}${img.alt ? `: ${img.alt}` : ""}`}
              className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#14245a] outline-none focus-visible:ring-4 focus-visible:ring-[#c49a3c] ${SHAPES[i % SHAPES.length]}`}
            >
              <Image
                src={img.src}
                alt={img.alt || `Gallery photo ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw"
                className="object-cover transition duration-[1200ms] ease-out group-hover:scale-110"
              />
              <span aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0d1840]/85 via-[#0d1840]/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
              <span className="absolute inset-x-4 bottom-3.5 flex translate-y-2 items-end justify-between gap-3 text-left opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <span className="min-w-0">
                  <span className="block text-sm lining-nums" style={{ ...SERIF, color: GOLD_LIGHT }}>
                    {num(i)}
                    {serviceLabel(img.service) && (
                      <span className="ml-2 font-sans text-[10px] font-semibold tracking-[0.18em] uppercase">
                        {serviceLabel(img.service)}
                      </span>
                    )}
                  </span>
                  {img.alt && (
                    <span className="block truncate text-lg text-white italic" style={SERIF}>
                      {img.alt}
                    </span>
                  )}
                </span>
                <Expand size={16} className="mb-1 shrink-0 text-white/80" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {current && open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex flex-col bg-[#0b1433]/95 backdrop-blur-sm"
          onClick={close}
        >
          {/* Top bar: counter + close */}
          <div className="flex items-center justify-between px-5 py-4 text-white sm:px-8" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg lining-nums" style={SERIF}>
              {filterLabel && <span className="text-white/70">{filterLabel} · </span>}
              <span style={{ color: GOLD_LIGHT }}>{num(open)}</span>
              <span className="text-white/40"> / {String(total).padStart(2, "0")}</span>
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition hover:bg-white hover:text-[#0b1433]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Photo + arrows */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
            <div className="relative h-full w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <Image key={current.id} src={current.src} alt={current.alt || `Gallery photo ${open + 1}`} fill sizes="100vw" className="object-contain" priority />
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[#0b1433]/60 text-white transition hover:bg-[#dcb45c] hover:text-[#0b1433] sm:left-6"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[#0b1433]/60 text-white transition hover:bg-[#dcb45c] hover:text-[#0b1433] sm:right-6"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* Caption + thumbnails */}
          <div className="px-5 pt-4 pb-5 sm:px-8" onClick={(e) => e.stopPropagation()}>
            {current.alt && (
              <p className="mb-4 text-center text-xl text-white/85 italic" style={SERIF}>
                {current.alt}
              </p>
            )}
            <div className="mx-auto flex max-w-4xl justify-center gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === open || undefined}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${i === open ? "opacity-100 ring-2 ring-[#dcb45c]" : "opacity-45 hover:opacity-80"}`}
                >
                  <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/** One filter button: "Weddings 14". Navy when chosen. */
function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
        active
          ? "border-[#14245a] bg-[#14245a] text-white"
          : "border-[#c49a3c]/35 bg-white text-[#14245a] hover:border-[#c49a3c]"
      }`}
    >
      {label}
      <span className={`text-xs tabular-nums ${active ? "text-[#dcb45c]" : "text-slate-400"}`}>{count}</span>
    </button>
  );
}

export default Gallery;
