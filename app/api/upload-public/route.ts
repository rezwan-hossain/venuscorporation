// app/api/upload-public/route.ts
//
// Admin photo uploads into the project's public/uploads/ folder
// (used by ImageUploadPublic).
//   POST   form data { file, folder } → { url: "/uploads/<folder>/<name>.webp" }
//   DELETE json { url }                → deletes that upload
//
// Like app/api/upload (the VPS uploader), every photo is checked with sharp,
// turned upright, stripped of EXIF (GPS!), shrunk to MAX_DIMENSION and saved
// as WEBP. Anything that isn't a real image is refused.
//
// A route (not a server action) because server actions only accept 1 MB by
// default, and so the browser can show real upload progress.
// Rules (folders, sizes, paths): lib/public-upload.ts

import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  MAX_DIMENSION,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX,
  isValidFolder,
  uploadFilePath,
} from "@/lib/public-upload";

const ALLOWED_FORMATS = ["jpeg", "png", "webp", "avif", "gif"];

const fail = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

// ─── Upload ─────────────────────────────────────────
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return fail(error, 401);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "");

  if (!(file instanceof File)) return fail("No file was sent");
  if (!isValidFolder(folder)) return fail("Invalid upload folder");
  if (file.size > MAX_UPLOAD_BYTES)
    return fail("File too large (max 10 MB)", 413);

  try {
    // 1. Is it really an image? sharp reads the file's contents, not its name.
    const input = Buffer.from(await file.arrayBuffer());
    const info = await sharp(input)
      .metadata()
      .catch(() => null);
    if (!info?.format || !ALLOWED_FORMATS.includes(info.format)) {
      return fail("Only JPG, PNG, WEBP or GIF photos can be uploaded");
    }

    // 2. Upright, no EXIF, at most MAX_DIMENSION, as WEBP.
    //    Animated GIF/WEBP keep their frames (and skip rotate, which flattens).
    const animated = (info.pages ?? 1) > 1;
    let image = sharp(input, { animated });
    if (!animated) image = image.rotate();
    const output = await image
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    // 3. Save as public/uploads/<folder>/<random>.webp (write, then rename,
    //    so nobody ever gets a half-written file)
    const name = `${randomBytes(16).toString("hex")}.webp`;
    const target = path.join(UPLOAD_DIR, folder, name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(`${target}.tmp`, output);
    await rename(`${target}.tmp`, target);

    return NextResponse.json({ url: `${UPLOAD_URL_PREFIX}${folder}/${name}` });
  } catch (err) {
    console.error("[upload-public] failed:", err);
    return fail("Upload failed", 500);
  }
}

// ─── Delete ─────────────────────────────────────────
export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return fail(error, 401);

  const { url } = (await request.json().catch(() => ({}))) as { url?: string };
  const file = url ? uploadFilePath(url) : null;
  if (!file) return NextResponse.json({ ok: true }); // not one of ours — nothing to do

  try {
    await unlink(file);
  } catch {
    // Already gone — that's fine
  }
  return NextResponse.json({ ok: true });
}
