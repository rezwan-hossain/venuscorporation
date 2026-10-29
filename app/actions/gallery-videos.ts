// app/actions/gallery-videos.ts
"use server";

// "Event films" on the gallery page.
//   getGalleryVideos — public: the shown videos, cached for days
//   the rest         — admin → Manage Gallery → Event films
// Every change refreshes the cached list (updateTag), so it shows at once.

import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { audit } from "@/lib/audit";
import { youTubeId } from "@/lib/youtube";

export type GalleryVideoRow = {
  id: string;
  url: string;
  title: string;
  category: string | null;
  duration: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type GalleryVideoInput = {
  url: string;
  title: string;
  category: string;
  duration: string;
  sortOrder: number;
};

const SELECT = {
  id: true,
  url: true,
  title: true,
  category: true,
  duration: true,
  sortOrder: true,
  isActive: true,
} as const;

const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

/** After any change: refresh the gallery page and the cached list. */
function refresh() {
  revalidatePath("/gallery");
  updateTag("gallery-videos");
}

/** The first problem with the form, or "" if it's fine. */
function checkVideo(input: GalleryVideoInput): string {
  if (!youTubeId(input.url.trim()))
    return "Paste a YouTube link (youtube.com/watch?v=…, youtu.be/… or /shorts/…)";
  if (!input.title.trim()) return "Give the film a title";
  if (input.title.length > 120) return "Keep the title under 120 characters";
  if (input.category.length > 40)
    return "Keep the category under 40 characters";
  if (input.duration.length > 10) return "Length looks too long — e.g. 3:12";
  return "";
}

/** Form values → database row. Empty text is saved as null. */
const toData = (input: GalleryVideoInput) => ({
  url: input.url.trim(),
  title: input.title.trim(),
  category: input.category.trim() || null,
  duration: input.duration.trim() || null,
  sortOrder: Number.isFinite(input.sortOrder) ? Math.round(input.sortOrder) : 0,
});

// ─── Public ─────────────────────────────────────────

/**
 * The videos shown on the gallery page, in order. Cached for days.
 * `null` means the table is still empty (the page then shows its demo films).
 */
export async function getGalleryVideos(): Promise<GalleryVideoRow[] | null> {
  "use cache";
  cacheLife("days");
  cacheTag("gallery-videos");

  try {
    const rows = await prisma.galleryVideo.findMany({
      select: SELECT,
      orderBy: ORDER,
    });
    if (rows.length === 0) return null; // none added yet
    return rows.filter((row) => row.isActive);
  } catch (err) {
    console.error("getGalleryVideos error:", err);
    return null;
  }
}

// ─── Admin ──────────────────────────────────────────

export async function getAllGalleryVideos(): Promise<{
  videos: GalleryVideoRow[];
  error: string | null;
}> {
  const { error } = await requireAdmin();
  if (error) return { videos: [], error };

  try {
    const videos = await prisma.galleryVideo.findMany({
      select: SELECT,
      orderBy: ORDER,
    });
    return { videos, error: null };
  } catch (err) {
    console.error("getAllGalleryVideos error:", err);
    return { videos: [], error: "Failed to load the films" };
  }
}

export async function createGalleryVideo(
  input: GalleryVideoInput,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  const problem = checkVideo(input);
  if (problem) return { success: false, error: problem };

  try {
    const video = await prisma.galleryVideo.create({ data: toData(input) });
    await audit({
      action: "gallery.video_added",
      entityType: "gallery",
      entityId: video.id,
      summary: `Added the event film "${video.title}"`,
    });
    refresh();
    return { success: true, error: null };
  } catch (err) {
    console.error("createGalleryVideo error:", err);
    return { success: false, error: "Failed to add the film" };
  }
}

export async function updateGalleryVideo(
  id: string,
  input: GalleryVideoInput,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  const problem = checkVideo(input);
  if (problem) return { success: false, error: problem };

  try {
    const video = await prisma.galleryVideo.update({
      where: { id },
      data: toData(input),
    });
    await audit({
      action: "gallery.video_updated",
      entityType: "gallery",
      entityId: id,
      summary: `Updated the event film "${video.title}"`,
    });
    refresh();
    return { success: true, error: null };
  } catch (err) {
    console.error("updateGalleryVideo error:", err);
    return { success: false, error: "Failed to save the film" };
  }
}

/** Show or hide a film on the gallery page. */
export async function setGalleryVideoActive(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    await prisma.galleryVideo.update({ where: { id }, data: { isActive } });
    refresh();
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to update the film" };
  }
}

export async function deleteGalleryVideo(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    const video = await prisma.galleryVideo.delete({ where: { id } });
    await audit({
      action: "gallery.video_deleted",
      entityType: "gallery",
      entityId: id,
      summary: `Deleted the event film "${video.title}"`,
    });
    refresh();
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to delete the film" };
  }
}
