// lib/youtube.ts
//
// YouTube link helper. A plain file (not a client component), so both the
// browser and server code (e.g. the hero form check) can use it.

/** Pull the 11-character video id out of any common YouTube link (null if it isn't one). */
export function youTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}
