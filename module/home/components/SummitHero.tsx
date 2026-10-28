// module/home/components/SummitHero.tsx
//
// Homepage hero. Three steps:
//   1. Load the active hero (admin → Manage Homepage) and the next event.
//   2. Work out what to show: buildHeroContent() in ../hero-content.ts.
//   3. Draw it: HeroView.tsx.
//
// Large screens: header space + panel + bar fit in one screen (max 50rem),
// so the bar is visible on load.

import { getActiveHero } from "@/app/actions/homepage";
import { getNextEvents } from "@/app/actions/event";
import { buildHeroContent } from "../hero-content";
import HeroView from "./HeroView";

export default async function SummitHero() {
  // 1. Load (both are cached)
  const { hero } = await getActiveHero();
  const { events } = await getNextEvents(1);

  // 2. Work out what to show
  const content = buildHeroContent({
    hero,
    event: hero?.event?.isActive ? hero.event : null, // a hidden event isn't shown
    nextEvent: events[0] ?? null,
  });

  // 3. Draw it
  return (
    // pt-*: start below the fixed header (its dark text needs a light background).
    <section className="pt-20 md:pt-24 lg:flex lg:h-[min(100svh,50rem)] lg:min-h-[34rem] lg:flex-col lg:pt-24">
      <HeroView content={content} />
    </section>
  );
}
