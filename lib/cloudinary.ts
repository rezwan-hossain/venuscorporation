// lib/cloudinary.ts
//
// Talking to Cloudinary from the SERVER. Used by:
//   app/actions/cloudinary.ts          — admin photo uploads (signature + delete)
//   app/actions/registration-photo.ts  — passport photo at checkout (upload)
//   lib/registration-photo-cleanup.ts  — deletes photos of unpaid orders
//
// Setup: put these three in .env (Cloudinary dashboard → Settings → API Keys):
//   CLOUDINARY_CLOUD_NAME=…
//   CLOUDINARY_API_KEY=…
//   CLOUDINARY_API_SECRET=…
// Optional: CLOUDINARY_FOLDER=venuscorporation (top folder for every upload)
//
// ⚠️ Server only: it reads the API secret. Never import this from a
// "use client" file. (Not a "use server" file either — these functions take
// trusted input and must not become public actions.)
//
// No Cloudinary package needed: a signature is just a SHA-1 hash.

import { createHash } from "node:crypto";

export const MISSING_KEYS =
  "Cloudinary isn't set up. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.";

/** The three keys from .env, or null when one is missing. */
export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

/** "hero" → "venuscorporation/hero" (everything lives under one top folder). */
export function fullFolder(folder: string) {
  const topFolder = process.env.CLOUDINARY_FOLDER || "venuscorporation";
  return `${topFolder}/${folder}`;
}

/**
 * Cloudinary's signature: the parameters sorted by name, joined as
 * "a=1&b=2", with the API secret on the end, hashed with SHA-1.
 */
export function sign(params: Record<string, string | number>, apiSecret: string) {
  const text = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(text + apiSecret)
    .digest("hex");
}

/**
 * A Cloudinary URL → its public id, or null if it isn't one of ours.
 *   https://res.cloudinary.com/<cloud>/image/upload/v1712345678/venuscorporation/hero/abc.jpg
 *   → "venuscorporation/hero/abc"
 */
export function publicIdFromUrl(url: string, cloudName: string): string | null {
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

/**
 * Upload one image file from the server into `folder` (e.g. "registrations").
 * Returns the photo's web address (https://res.cloudinary.com/…).
 */
export async function uploadImageToCloudinary(
  file: Blob,
  folder: string,
): Promise<{ url: string | null; error: string | null }> {
  const config = cloudinaryConfig();
  if (!config) return { url: null, error: MISSING_KEYS };

  const target = fullFolder(folder);
  const timestamp = Math.round(Date.now() / 1000);

  // Same form Cloudinary expects from a browser, signed with our secret
  const body = new FormData();
  body.append("file", file);
  body.append("folder", target);
  body.append("timestamp", String(timestamp));
  body.append("api_key", config.apiKey);
  body.append("signature", sign({ folder: target, timestamp }, config.apiSecret));

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: "POST", body },
    );
    const result = (await response.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };
    if (!response.ok || !result.secure_url) {
      console.error("Cloudinary upload error:", result.error?.message);
      return { url: null, error: "Couldn't upload the photo. Please try again." };
    }
    return { url: result.secure_url, error: null };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return { url: null, error: "Couldn't reach the photo server. Please try again." };
  }
}

/** Delete a photo from Cloudinary. Links from other sites are ignored. */
export async function deleteImageFromCloudinary(
  url: string,
): Promise<{ success: boolean; error: string | null }> {
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
