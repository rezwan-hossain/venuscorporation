// lib/public-upload.ts
//
// Rules for photos uploaded into the project's public/uploads/ folder
// (ImageUploadPublic). Used by:
//   app/api/upload-public/route.ts  — saves and deletes uploads
//   app/uploads/[...path]/route.ts  — serves them
//
// A saved photo lives at   public/uploads/<folder>/<random>.webp
// and its address is       /uploads/<folder>/<random>.webp
//
// ⚠️ Server only (uses the file system).

import path from "node:path";

/** public/uploads on disk. */
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** The address prefix of an uploaded photo. */
export const UPLOAD_URL_PREFIX = "/uploads/";

/** Largest file the server accepts, whatever the form says. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

/** Photos are shrunk so their longest side is at most this. */
export const MAX_DIMENSION = 2000;

/** Folder names: letters, numbers, - and _ only (no "../" tricks). */
export const isValidFolder = (folder: string) =>
  /^[a-z0-9][a-z0-9_-]{0,39}$/i.test(folder);

/** Content type for serving a saved file, from its extension. */
export const MIME_BY_EXT: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

/**
 * "/uploads/hero/abc.webp" (or a full URL to it) → the file on disk, or
 * null when it isn't one of our uploads. Never points outside public/uploads.
 */
export function uploadFilePath(url: string): string | null {
  let pathname: string;
  try {
    pathname = new URL(url, "http://local").pathname;
  } catch {
    return null;
  }
  if (!pathname.startsWith(UPLOAD_URL_PREFIX)) return null;

  const file = path.resolve(
    UPLOAD_DIR,
    decodeURIComponent(pathname.slice(UPLOAD_URL_PREFIX.length)),
  );
  // path.resolve collapses "../": make sure we're still inside public/uploads
  if (!file.startsWith(UPLOAD_DIR + path.sep)) return null;
  return file;
}
