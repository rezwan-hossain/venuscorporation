// lib/event-partners.ts
//
// Event partners — the logos shown in the "Event partners" card on an event
// page (sponsors, organisers, supporting bodies …). Optional per event.
//
// Saved on the event as JSON (Event.partners in prisma/schema.prisma):
//   [{ name: "Bangladesh Athletics Federation", role: "In association with",
//      logo: "https://res.cloudinary.com/…", short: "BAF" }, …]
//
// Used by:
//   admin  module/profile/components/admin/EventPartnersEditor.tsx (edit the list)
//   server app/actions/admin.ts (cleanPartners before saving)
//   page   module/event/components/EventPartners.tsx (the scrolling card)

export type EventPartner = {
  /** Full name, e.g. "Bangladesh Athletics Federation". */
  name: string;
  /** What they do for the event, e.g. "Kit partner". */
  role: string;
  /** Logo image URL (Cloudinary). Optional. */
  logo?: string;
  /** Short wordmark shown when there's no logo, e.g. "BAF". Optional. */
  short?: string;
};

/** Ideas for the role box (admins can still type anything). */
export const PARTNER_ROLE_SUGGESTIONS = [
  "Organized by",
  "In association with",
  "Initiative by",
  "Title sponsor",
  "Powered by",
  "Kit partner",
  "IT partner",
  "Running partner",
  "Media partner",
  "Hospitality partner",
  "Support",
];

const MAX_PARTNERS = 40;

/** Trim one text value and cut it to `max` characters. */
function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Turn whatever was sent (or stored) into a clean partner list:
 * drops rows without a name, trims text, keeps only http(s) logo links.
 * Safe to call on untrusted input — used on the server before saving
 * and when reading the JSON back from the database.
 */
export function cleanPartners(input: unknown): EventPartner[] {
  if (!Array.isArray(input)) return [];

  const partners: EventPartner[] = [];
  for (const row of input.slice(0, MAX_PARTNERS)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;

    const name = text(r.name, 80);
    if (!name) continue; // a partner needs at least a name

    const logo = text(r.logo, 500);
    const short = text(r.short, 12);
    partners.push({
      name,
      role: text(r.role, 40),
      ...(/^https?:\/\//.test(logo) && { logo }),
      ...(short && { short }),
    });
  }
  return partners;
}

/**
 * The wordmark for a partner without a logo:
 *   `short` if set                         → "BAF"
 *   a one-word name up to 8 letters        → "XFIT"
 *   otherwise the initials (up to 4)       → "Merch Sports" → "MS"
 */
export function partnerWordmark(partner: EventPartner): string {
  if (partner.short) return partner.short;
  const words = partner.name.split(/\s+/);
  if (words.length === 1 && partner.name.length <= 8) return partner.name;
  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}
