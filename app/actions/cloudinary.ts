// app/actions/cloudinary.ts
"use server";

// Server side of ImageUploadCloudinary (module/profile/components/admin/).
//
// The browser uploads the file straight to Cloudinary, but Cloudinary only
// accepts it with a signature made from the API secret. The secret must
// never reach the browser, so it lives here:
//   getCloudinarySignature — admin asks "may I upload to <folder>?" → signature
//   deleteCloudinaryImage  — removes a replaced / removed photo
//
// Setup: put these three in .env (Cloudinary dashboard → Settings → API Keys):
//   CLOUDINARY_CLOUD_NAME=…
//   CLOUDINARY_API_KEY=…
//   CLOUDINARY_API_SECRET=…
// Optional: CLOUDINARY_FOLDER=venuscorporation (top folder for every upload)
//
// No Cloudinary package needed: a signature is just a SHA-1 hash.

import { createHash } from "node:crypto";
import { requireAdmin } from "@/lib/auth/require-admin";

/** The three keys from .env, or null when one is missing. */
function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

/**
 * Cloudinary's signature: the parameters sorted by name, joined as
 * "a=1&b=2", with the API secret on the end, hashed with SHA-1.
 */
function sign(params: Record<string, string | number>, apiSecret: string) {
  const text = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(text + apiSecret)
    .digest("hex");
}

const MISSING_KEYS =
  "Cloudinary isn't set up. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.";

// ─── Upload ─────────────────────────────────────────

export type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/** Permission to upload one file into `folder` (e.g. "hero", "banners"). */
export async function getCloudinarySignature(
  folder: string,
): Promise<{ data: CloudinarySignature | null; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { data: null, error };

  const config = cloudinaryConfig();
  if (!config) return { data: null, error: MISSING_KEYS };

  // Only simple folder names: letters, numbers, - and _
  if (!/^[a-z0-9_-]+$/i.test(folder)) {
    return { data: null, error: "Invalid upload folder" };
  }

  const topFolder = process.env.CLOUDINARY_FOLDER || "venuscorporation";
  const fullFolder = `${topFolder}/${folder}`;
  const timestamp = Math.round(Date.now() / 1000); // valid for one hour

  return {
    data: {
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      timestamp,
      folder: fullFolder,
      signature: sign({ folder: fullFolder, timestamp }, config.apiSecret),
    },
    error: null,
  };
}

// ─── Delete ─────────────────────────────────────────

/**
 * A Cloudinary URL → its public id, or null if it isn't one of ours.
 *   https://res.cloudinary.com/<cloud>/image/upload/v1712345678/venuscorporation/hero/abc.jpg
 *   → "venuscorporation/hero/abc"
 */
function publicIdFromUrl(url: string, cloudName: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== "res.cloudinary.com") return null;

    const prefix = `/${cloudName}/image/upload/`;
    if (!pathname.startsWith(prefix)) return null;

    return decodeURIComponent(pathname.slice(prefix.length))
      .replace(/^v\d+\//, "") // version, e.g. "v1712345678/"
      .replace(/\.[a-z0-9]+$/i, ""); // file extension
  } catch {
    return null;
  }
}

/** Delete a photo from Cloudinary. Links from other sites are ignored. */
export async function deleteCloudinaryImage(
  url: string,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  const config = cloudinaryConfig();
  if (!config) return { success: false, error: MISSING_KEYS };

  const publicId = publicIdFromUrl(url, config.cloudName);
  if (!publicId) return { success: true, error: null }; // not ours — nothing to delete

  const timestamp = Math.round(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature: sign({ public_id: publicId, timestamp }, config.apiSecret),
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      { method: "POST", body },
    );
    const result = (await response.json()) as { result?: string };
    // "ok", or "not found" when it was already gone
    if (result.result === "ok" || result.result === "not found") {
      return { success: true, error: null };
    }
    return { success: false, error: "Cloudinary didn't delete the photo" };
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return { success: false, error: "Couldn't reach Cloudinary" };
  }
}
