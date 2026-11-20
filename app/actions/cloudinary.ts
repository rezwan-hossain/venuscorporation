// app/actions/cloudinary.ts
"use server";

// Server side of ImageUploadCloudinary (module/profile/components/admin/).
//
// The browser uploads the file straight to Cloudinary, but Cloudinary only
// accepts it with a signature made from the API secret. The secret must
// never reach the browser, so it lives on the server:
//   getCloudinarySignature — admin asks "may I upload to <folder>?" → signature
//   deleteCloudinaryImage  — removes a replaced / removed photo
//
// Both are admin-only. The Cloudinary details (keys, signing, delete) are in
// lib/cloudinary.ts — setup notes are there too.

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  MISSING_KEYS,
  cloudinaryConfig,
  deleteImageFromCloudinary,
  fullFolder,
  sign,
} from "@/lib/cloudinary";

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

  const target = fullFolder(folder);
  const timestamp = Math.round(Date.now() / 1000); // valid for one hour

  return {
    data: {
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      timestamp,
      folder: target,
      signature: sign({ folder: target, timestamp }, config.apiSecret),
    },
    error: null,
  };
}

// ─── Delete ─────────────────────────────────────────

/** Delete a photo from Cloudinary. Links from other sites are ignored. */
export async function deleteCloudinaryImage(
  url: string,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  return deleteImageFromCloudinary(url);
}
