// lib/gallery-services.ts
//
// The services a gallery photo can be tagged with. Admins pick one from this
// list (Manage Gallery); the Gallery page shows them as filter chips.
//
// The slugs match the section anchors on the Services page
// (/services#weddings), so a filter can link to its service.
// Adding a service here is all it takes — no database change needed.

export const GALLERY_SERVICES = [
  { slug: "corporate-events", label: "Corporate Events" },
  { slug: "sports-events", label: "Sports Events" },
  { slug: "weddings", label: "Weddings" },
  { slug: "conferences-seminars", label: "Conferences & Seminars" },
  { slug: "exhibitions-trade-shows", label: "Exhibitions & Trade Shows" },
  { slug: "private-social-events", label: "Private & Social Events" },
] as const;

export type GalleryService = (typeof GALLERY_SERVICES)[number]["slug"];

/** True if `value` is one of the slugs above. */
export function isGalleryService(value: unknown): value is GalleryService {
  return GALLERY_SERVICES.some((s) => s.slug === value);
}

/** "weddings" → "Weddings". Unknown or empty → null. */
export function serviceLabel(slug: string | null | undefined): string | null {
  return GALLERY_SERVICES.find((s) => s.slug === slug)?.label ?? null;
}
