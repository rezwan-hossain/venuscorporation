// app/uploads/[...path]/route.ts
//
// Serves photos uploaded with ImageUploadPublic (public/uploads/…).
//
// Why this exists: in production (`next build` + `next start`) Next.js only
// serves the files that were in public/ when it started. A photo uploaded
// after that would 404 until a restart; this route serves it straight away.
// (Files that were there at start-up are served by Next.js directly.)

import { readFile } from "node:fs/promises";
import path from "node:path";

import { MIME_BY_EXT, uploadFilePath } from "@/lib/public-upload";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const parts = (await params).path;
  const file = uploadFilePath(`/uploads/${parts.join("/")}`);
  const mime = file
    ? MIME_BY_EXT[path.extname(file).slice(1).toLowerCase()]
    : null;
  if (!file || !mime) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(file);
    return new Response(data, {
      headers: {
        "Content-Type": mime,
        // File names are unique, so a photo never changes: cache for a year
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
