// app/actions/gallery.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import { audit, diff } from "@/lib/audit";
import { isAdminRole } from "@/lib/auth/roles";
import { isGalleryService, serviceLabel } from "@/lib/gallery-services";
import type {
  CreateGalleryImageInput,
  UpdateGalleryImageInput,
  DeleteGalleryImageInput,
  GalleryImage,
} from "@/types/gallery";

// ─── Helpers ────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { id: true, role: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  if (!isAdminRole(dbUser.role)) {
    throw new Error("Forbidden: Admin only");
  }

  return dbUser.id;
}

/** A known service slug, or null (anything else is dropped). */
const toService = (value: unknown) => (isGalleryService(value) ? value : null);

/** After any photo change: refresh the pages and the cached photo list. */
function refreshGallery() {
  revalidatePath("/gallery");
  revalidatePath("/profile");
  updateTag("gallery");
}

type ActionResult<T = unknown> =
  { success: true; data: T } | { success: false; error: string };

// ─── Get All Gallery Images ─────────────────────────
// Cached for days: the gallery rarely changes. Adding, editing or deleting a
// photo (below) clears the "gallery" tag, so changes still show at once.
export async function getGalleryImages(): Promise<GalleryImage[]> {
  "use cache";
  cacheLife("days");
  cacheTag("gallery");

  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });

  // ⭐ Serialize dates for client components
  return images.map((img) => ({
    ...img,
    createdAt: img.createdAt.toISOString(),
    updatedAt: img.updatedAt.toISOString(),
  }));
}

// ─── Get All Gallery Images for Admin ───────────────
export async function getAllGalleryImages(): Promise<{
  images: GalleryImage[];
}> {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    images: images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
      updatedAt: img.updatedAt.toISOString(),
    })),
  };
}

// ─── Create ─────────────────────────────────────────
export async function createGalleryImage(
  input: CreateGalleryImageInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!input.src?.trim()) {
      return { success: false, error: "Image URL is required" };
    }

    const image = await prisma.galleryImage.create({
      data: {
        src: input.src.trim(),
        alt: input.alt?.trim() || null,
        service: toService(input.service),
      },
    });

    await audit({
      action: "gallery.created",
      entityType: "gallery",
      entityId: image.id,
      summary: `Added gallery photo${image.alt ? ` "${image.alt}"` : ""}`,
    });

    refreshGallery();

    return { success: true, data: { id: image.id } };
  } catch (err) {
    console.error("createGalleryImage error:", err);
    return {
      success: false,
      error:
        err instanceof Error && err.message
          ? err.message
          : "Failed to create image",
    };
  }
}

// ─── Update ─────────────────────────────────────────
export async function updateGalleryImage(
  input: UpdateGalleryImageInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!input.id?.trim()) {
      return { success: false, error: "Image ID is required" };
    }

    if (!input.src?.trim()) {
      return { success: false, error: "Image URL is required" };
    }

    const existing = await prisma.galleryImage.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return { success: false, error: "Image not found" };
    }

    const image = await prisma.galleryImage.update({
      where: { id: input.id },
      data: {
        src: input.src.trim(),
        alt: input.alt?.trim() || null,
        service: toService(input.service),
      },
    });

    const changes = diff(existing, image, ["src", "alt", "service"]);
    if (Object.keys(changes).length > 0) {
      await audit({
        action: "gallery.updated",
        entityType: "gallery",
        entityId: image.id,
        summary: `Updated gallery photo: ${Object.keys(changes).join(", ")}`,
        changes,
      });
    }

    refreshGallery();

    return { success: true, data: { id: image.id } };
  } catch (err) {
    console.error("updateGalleryImage error:", err);
    return {
      success: false,
      error:
        err instanceof Error && err.message
          ? err.message
          : "Failed to update image",
    };
  }
}

// ─── Delete ─────────────────────────────────────────
export async function deleteGalleryImage(
  input: DeleteGalleryImageInput,
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    if (!input.id?.trim()) {
      return { success: false, error: "Image ID is required" };
    }

    const existing = await prisma.galleryImage.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return { success: false, error: "Image not found" };
    }

    await prisma.galleryImage.delete({
      where: { id: input.id },
    });

    await audit({
      action: "gallery.deleted",
      entityType: "gallery",
      entityId: input.id,
      summary: `Deleted gallery photo${existing.alt ? ` "${existing.alt}"` : ""}`,
      changes: { src: [existing.src, null] },
    });

    refreshGallery();

    return { success: true, data: null };
  } catch (err) {
    console.error("deleteGalleryImage error:", err);
    return {
      success: false,
      error:
        err instanceof Error && err.message
          ? err.message
          : "Failed to delete image",
    };
  }
}

// ─── Change only the service tag ────────────────────
// Used by the dropdown on each photo card in Manage Gallery.
export async function setGalleryImageService(
  id: string,
  service: string | null,
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Image not found" };

    const next = toService(service);
    if (existing.service === next) return { success: true, data: null };

    await prisma.galleryImage.update({ where: { id }, data: { service: next } });
    await audit({
      action: "gallery.updated",
      entityType: "gallery",
      entityId: id,
      summary: `Tagged gallery photo${existing.alt ? ` "${existing.alt}"` : ""} as ${serviceLabel(next) ?? "no service"}`,
      changes: { service: [existing.service, next] },
    });

    refreshGallery();
    return { success: true, data: null };
  } catch (err) {
    console.error("setGalleryImageService error:", err);
    return { success: false, error: "Failed to change the service" };
  }
}
