// module/home/hero-content.ts
//
// Decides WHAT the homepage hero shows (HeroView.tsx decides how it looks).
// Used by the homepage (SummitHero.tsx) and by the admin preview
// (HeroForm.tsx), so both always match.
//
// Rules:
//   EVENT hero   → the event the admin picked, or the next upcoming event
//   CUSTOM hero  → the admin's own text
//   no hero yet  → the next upcoming event
//   no event     → the default text in business/data-v5.ts
//
//   Photo:  admin's photo → the event's banner → default photo
//   "Watch our events" button: only when there is a YouTube link

import type { HeroEvent, HeroSource } from "@/types/homepage";
import { summitHero } from "./business/data-v5";

/** The admin's hero settings (a saved hero, or the form while editing). */
export type HeroSettings = {
  source: HeroSource;
  title: string;
  subtitle: string | null;
  buttonLabel: string | null;
  slug: string | null;
  desktopImage: string | null;
  mobileImage: string | null;
  youtubeUrl: string | null;
  eventDate: string | Date | null;
  showCountdown: boolean;
  showSlugButton: boolean;
};

type Button = { label: string; href: string };

/** Everything the hero shows. */
export type HeroContent = {
  label: string; // small gold line above the title
  title: string;
  text: string;
  button: Button | null; // gold button
  countdownTo: string | null; // date for "Starts in 45 days"
  image: string;
  mobileImage: string | null;
  showreel: { url: string; title: string } | null; // "Watch our events"
  bar: { name: string; address: string; date: string; href: string } | null; // white bar
};

// The text part of HeroContent
type HeroText = Pick<
  HeroContent,
  "label" | "title" | "text" | "button" | "countdownTo"
>;

// ════════════════════════════════════════════════════════════════════════
//  Where the text comes from
// ════════════════════════════════════════════════════════════════════════

/** From an event: its date, name and description, and a "Get tickets" button. */
function textFromEvent(event: HeroEvent): HeroText {
  return {
    label: formatDate(event.date),
    title: event.name,
    text: event.shortDesc || summitHero.text,
    button: { label: "Get tickets", href: `/events/${event.slug}` },
    countdownTo: eventStartsAt(event),
  };
}

/** From the admin's own text. The button needs both a label and a link. */
function textFromCustomHero(hero: HeroSettings): HeroText {
  const hasButton = hero.buttonLabel && hero.slug;
  return {
    label: "", // no small gold line for custom text
    title: hero.title,
    text: hero.subtitle || "",
    button: hasButton ? { label: hero.buttonLabel!, href: hero.slug! } : null,
    countdownTo: hero.eventDate ? new Date(hero.eventDate).toISOString() : null,
  };
}

/** The default text (no hero and no upcoming event). */
function defaultText(): HeroText {
  return {
    label: summitHero.label,
    title: summitHero.title,
    text: summitHero.text,
    button: summitHero.primaryCta,
    countdownTo: null,
  };
}

// ════════════════════════════════════════════════════════════════════════
//  The hero
// ════════════════════════════════════════════════════════════════════════

export function buildHeroContent({
  hero, // the active hero from admin, or null
  event, // the event the admin picked, or null
  nextEvent, // the next upcoming event, or null
}: {
  hero: HeroSettings | null;
  event: HeroEvent | null;
  nextEvent: HeroEvent | null;
}): HeroContent {
  // 1. Which event is the hero about? (none for a custom hero)
  const isCustom = hero?.source === "CUSTOM";
  const heroEvent = isCustom ? null : event || nextEvent;

  // 2. The text
  let content: HeroText;
  if (heroEvent) content = textFromEvent(heroEvent);
  else if (hero && isCustom) content = textFromCustomHero(hero);
  else content = defaultText();

  // The admin can switch off the button and the countdown
  if (hero && !hero.showSlugButton) content.button = null;
  if (hero && !hero.showCountdown) content.countdownTo = null;

  // 3. The photo (before a hero is saved, always the default photo)
  let image = summitHero.poster;
  if (hero && heroEvent) image = heroEvent.bannerImage;
  if (hero?.desktopImage) image = hero.desktopImage;

  // 4. The "Watch our events" video (before a hero is saved, the demo video)
  let showreel = summitHero.showreel;
  if (hero) {
    showreel = hero.youtubeUrl
      ? { url: hero.youtubeUrl, title: "Venus Corporation showreel" }
      : null;
  }

  // 5. The white bar: the hero's event, or the next one
  const barEvent = heroEvent || nextEvent;
  const bar = barEvent
    ? {
        name: barEvent.name,
        address: barEvent.address,
        date: formatDate(barEvent.date),
        href: `/events/${barEvent.slug}`,
      }
    : null;

  return {
    ...content,
    image,
    mobileImage: hero?.mobileImage || null,
    showreel,
    bar,
  };
}

// ════════════════════════════════════════════════════════════════════════
//  Date helpers
// ════════════════════════════════════════════════════════════════════════

/** "22 Nov 2026". Event dates are stored as UTC midnight, so format in UTC. */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** When the event starts: its day + start time, in Dhaka time (UTC+6). */
function eventStartsAt(event: HeroEvent) {
  const day = new Date(event.date);
  const time = new Date(event.time);
  const asIfUtc = Date.UTC(
    day.getUTCFullYear(),
    day.getUTCMonth(),
    day.getUTCDate(),
    time.getUTCHours(),
    time.getUTCMinutes(),
  );
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  return new Date(asIfUtc - SIX_HOURS).toISOString();
}
