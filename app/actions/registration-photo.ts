// app/actions/registration-photo.ts
"use server";

// Uploads the attendee's passport-size photo (conference checkout).
//
// When does this run? AFTER the order is created — never before:
//
//   1. Attendee picks a photo   → it stays in the browser (only a preview)
//   2. "Proceed to payment"     → placeOrder() creates the order (PENDING)
//   3. uploadRegistrationPhoto  → THIS: photo → Cloudinary, address saved
//                                 in registration.details.photo
//   4. Off to the payment page
//
// Why after? Someone who picks a photo and then leaves never uploads
// anything, so it costs no Cloudinary space. Photos of orders that were
// created but never paid are deleted later by the hourly clean-up
// (lib/registration-photo-cleanup.ts).
//
// Why so many checks below? Checkout works without logging in, so anyone
// can call this action. The checks make sure a photo can only be added to a
// brand-new, unpaid order that asks for one — and only once.

import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";
import { PHOTO_QUESTION_KEY, getExtraQuestions } from "@/lib/event-checkout-form";
import { prisma } from "@/lib/prisma";

/** The browser shrinks photos to ~100 KB, so 1 MB is plenty.
 *  (Server actions also refuse bodies over 1 MB by default.) */
const MAX_PHOTO_BYTES = 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** A photo can only be added in the first hour after the order is made. */
const UPLOAD_WINDOW_MS = 60 * 60 * 1000;

/** The Cloudinary folder for these photos (under the top folder). */
const PHOTO_FOLDER = "registrations";

/**
 * Upload the photo for one order.
 * Send a FormData with:
 *   orderId — the order placeOrder() just created
 *   photo   — the image file
 */
export async function uploadRegistrationPhoto(
  formData: FormData,
): Promise<{ url: string | null; error: string | null }> {
  const orderId = String(formData.get("orderId") ?? "");
  const photo = formData.get("photo");

  // ── 1. Is the file OK? ──
  if (!(photo instanceof File) || photo.size === 0) {
    return { url: null, error: "Please choose a photo" };
  }
  if (!ALLOWED_TYPES.includes(photo.type)) {
    return { url: null, error: "The photo must be a JPG, PNG or WEBP image" };
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return { url: null, error: "The photo is too large (max 1 MB)" };
  }

  // ── 2. Is the order one that may get a photo? ──
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      source: true,
      createdAt: true,
      event: { select: { category: true, eventType: true } },
      registration: { select: { id: true, details: true } },
    },
  });

  const isNew = order && Date.now() - order.createdAt.getTime() < UPLOAD_WINDOW_MS;
  if (!order || !order.registration || !isNew) {
    return { url: null, error: "This order can't take a photo" };
  }
  if (order.status !== "PENDING" || order.source !== "ONLINE") {
    return { url: null, error: "This order can't take a photo" };
  }

  // Does this event actually ask for a photo?
  const asksPhoto = getExtraQuestions(order.event.category, order.event.eventType).some(
    (q) => q.key === PHOTO_QUESTION_KEY,
  );
  if (!asksPhoto) {
    return { url: null, error: "This event doesn't ask for a photo" };
  }

  // Already has one? (e.g. the payment step failed and the attendee clicked
  // again) → keep the first photo, don't upload a second one.
  const details = (order.registration.details ?? {}) as Record<string, string>;
  if (details[PHOTO_QUESTION_KEY]) {
    return { url: details[PHOTO_QUESTION_KEY], error: null };
  }

  // ── 3. Upload to Cloudinary ──
  const { url, error } = await uploadImageToCloudinary(photo, PHOTO_FOLDER);
  if (!url) return { url: null, error };

  // ── 4. Save the photo's address with the registration ──
  try {
    await prisma.registration.update({
      where: { id: order.registration.id },
      data: { details: { ...details, [PHOTO_QUESTION_KEY]: url } },
    });
  } catch (err) {
    // Couldn't save → remove the upload again, so it doesn't sit there unused
    console.error("Saving registration photo failed:", err);
    await deleteImageFromCloudinary(url);
    return { url: null, error: "Couldn't save the photo. Please try again." };
  }

  return { url, error: null };
}
