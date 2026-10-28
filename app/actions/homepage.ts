// app/actions/homepage.ts
"use server";

// Homepage hero: read it (homepage), and create / edit / switch / delete it
// (admin → Manage Homepage). What the hero shows is worked out in
// module/home/hero-content.ts.

import { prisma } from "@/lib/prisma";
import { revalidatePath, updateTag, cacheLife, cacheTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { audit, diff } from "@/lib/audit";
import { youTubeId } from "@/lib/youtube";
import type { HeroFormData } from "@/types/homepage";

// The event fields the hero needs (see HeroEvent in types/homepage.ts).
const HERO_EVENT_SELECT = {
  id: true,
  name: true,
  slug: true,
  date: true,
  time: true,
  address: true,
  shortDesc: true,
  bannerImage: true,
  isActive: true,
} as const;

// ─── Get Active Hero (Public) ───────────────────────
export async function getActiveHero() {
  "use cache";
  cacheLife("days");
  cacheTag("hero-section", "active-hero", "events");

  try {
    const hero = await prisma.heroSection.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
      include: { event: { select: HERO_EVENT_SELECT } },
    });

    return { hero: hero ? JSON.parse(JSON.stringify(hero)) : null };
  } catch {
    return { hero: null };
  }
}

// ─── Get All Heroes (Admin) ─────────────────────────
export async function getAllHeroes() {
  const { error } = await requireAdmin();
  if (error) return { heroes: [], error };

  try {
    const heroes = await prisma.heroSection.findMany({
      orderBy: { updatedAt: "desc" },
      include: { event: { select: { id: true, name: true, slug: true } } },
    });

    return { heroes: JSON.parse(JSON.stringify(heroes)), error: null };
  } catch {
    return { heroes: [], error: "Failed to fetch heroes" };
  }
}

// ─── Events the hero can feature (Admin) ────────────
// Active, upcoming events for the dropdown in the hero form.
export async function getHeroEvents() {
  const { error } = await requireAdmin();
  if (error) return { events: [], error };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // event dates are stored as UTC midnight

  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      isArchived: false,
      status: "ACTIVE",
      date: { gte: today },
    },
    select: HERO_EVENT_SELECT,
    orderBy: { date: "asc" },
  });

  return { events: JSON.parse(JSON.stringify(events)), error: null };
}

// ─── Form helpers (used by create and update) ───────

/** The first problem with the form, or "" if it's fine. */
function checkHeroForm(form: HeroFormData): string {
  if (form.source === "CUSTOM" && !form.title.trim()) {
    return "Title is required";
  }
  if (form.buttonLabel.trim() && !form.slug.trim()) {
    return "Add a link for the button";
  }
  if (form.youtubeUrl.trim() && !youTubeId(form.youtubeUrl)) {
    return "That doesn't look like a YouTube link";
  }
  return "";
}

/** Form values → database row. Empty text is saved as null. */
function toHeroData(form: HeroFormData) {
  const orNull = (value: string) => value.trim() || null;
  const isEvent = form.source === "EVENT";

  return {
    source: form.source,
    eventId: isEvent ? orNull(form.eventId) : null,
    title: form.title.trim(),
    subtitle: orNull(form.subtitle),
    buttonLabel: orNull(form.buttonLabel),
    slug: orNull(form.slug),
    desktopImage: orNull(form.desktopImage),
    mobileImage: orNull(form.mobileImage),
    youtubeUrl: orNull(form.youtubeUrl),
    eventDate: form.eventDate ? new Date(form.eventDate) : null,
    showCountdown: form.showCountdown,
    showSlugButton: form.showSlugButton,
  };
}

/** Show the change on the homepage and in admin. */
function refreshHero() {
  revalidatePath("/");
  revalidatePath("/profile");
  updateTag("hero-section");
}

/** The hero's name in the audit log. */
function heroName(hero: { source: string; title: string }) {
  return hero.source === "CUSTOM" ? hero.title : "Featured event";
}

// ─── Create Hero ────────────────────────────────────
// The new hero becomes the active one.
export async function createHero(form: HeroFormData) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  const problem = checkHeroForm(form);
  if (problem) return { success: false, error: problem };

  try {
    await prisma.heroSection.updateMany({ data: { isActive: false } });
    const hero = await prisma.heroSection.create({
      data: { ...toHeroData(form), isActive: true },
    });

    await audit({
      action: "hero.created",
      entityType: "hero",
      entityId: hero.id,
      summary: `Created homepage hero "${heroName(hero)}" and made it active`,
    });

    refreshHero();
    return { success: true, error: null };
  } catch (err) {
    console.error("Create hero error:", err);
    return { success: false, error: "Failed to create hero" };
  }
}

// ─── Update Hero ────────────────────────────────────
export async function updateHero(heroId: string, form: HeroFormData) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  const problem = checkHeroForm(form);
  if (problem) return { success: false, error: problem };

  try {
    const data = toHeroData(form);
    const before = await prisma.heroSection.findUnique({
      where: { id: heroId },
    });
    const hero = await prisma.heroSection.update({
      where: { id: heroId },
      data,
    });

    // Log only the fields that changed
    const changes = diff<Record<string, unknown>>(
      before,
      hero,
      Object.keys(data),
    );
    if (Object.keys(changes).length > 0) {
      await audit({
        action: "hero.updated",
        entityType: "hero",
        entityId: heroId,
        summary: `Updated homepage hero "${heroName(hero)}": ${Object.keys(changes).join(", ")}`,
        changes,
      });
    }

    refreshHero();
    return { success: true, error: null };
  } catch (err) {
    console.error("Update hero error:", err);
    return { success: false, error: "Failed to update hero" };
  }
}

// ─── Turn a hero on / off ───────────────────────────
// On:  this hero shows on the homepage (any other hero is turned off).
// Off: no hero is active, so the homepage shows the next upcoming event.
export async function setHeroActive(heroId: string, isActive: boolean) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    // Only one hero can be on at a time
    if (isActive) {
      await prisma.heroSection.updateMany({ data: { isActive: false } });
    }
    const hero = await prisma.heroSection.update({
      where: { id: heroId },
      data: { isActive },
    });

    await audit({
      action: isActive ? "hero.activated" : "hero.deactivated",
      entityType: "hero",
      entityId: heroId,
      summary: isActive
        ? `Made "${heroName(hero)}" the active homepage hero`
        : `Turned off homepage hero "${heroName(hero)}" (homepage shows the next event)`,
    });

    refreshHero();
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to set active hero" };
  }
}

// ─── Delete Hero ────────────────────────────────────
export async function deleteHero(heroId: string) {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    const hero = await prisma.heroSection.delete({ where: { id: heroId } });

    await audit({
      action: "hero.deleted",
      entityType: "hero",
      entityId: heroId,
      summary: `Deleted homepage hero "${heroName(hero)}"`,
    });

    refreshHero();
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to delete hero" };
  }
}
