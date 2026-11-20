// lib/shrink-photo.ts
//
// Makes a photo small BEFORE it's uploaded — runs in the browser, for free.
//
// A phone photo is often 3–5 MB. A passport-size photo only needs to be
// about 800 px tall, so we redraw it smaller on a <canvas> and save it as a
// JPEG. Result: ~50–150 KB, so each upload uses ~30× less Cloudinary space.
//
//   const small = await shrinkPhoto(file);   // File → smaller File (JPEG)
//
// Browser only (uses document / canvas).

/** The longest side of the photo after shrinking, in pixels. */
const MAX_SIDE = 800;
/** JPEG quality: 0 (worst) … 1 (best). 0.85 looks the same and is much smaller. */
const QUALITY = 0.85;

export async function shrinkPhoto(file: File): Promise<File> {
  // 1. Read the picture (also turns phone photos the right way up)
  const bitmap = await createImageBitmap(file);

  // 2. Work out the new size — never make a small photo bigger
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  // 3. Draw it onto a canvas of that size
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser can't prepare this photo");
  context.fillStyle = "#ffffff"; // transparent PNG parts → white, not black
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // 4. Save the canvas as a JPEG file
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) throw new Error("Your browser can't prepare this photo");

  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}
