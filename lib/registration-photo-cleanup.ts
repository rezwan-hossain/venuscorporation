// lib/registration-photo-cleanup.ts
//
// Clean-up for checkout photos (passport-size photo at a conference).
//
// A photo is uploaded right after the order is created, BEFORE payment
// (app/actions/registration-photo.ts). If the attendee never pays, the order
// is cancelled after its 24-hour hold (lib/payment/slot-hold.ts) — but the
// photo would stay in Cloudinary forever and eat into the free storage.
//
// deleteUnpaidRegistrationPhotos() finds those photos and deletes them.
// It runs with the hourly background sweep (instrumentation.ts).
//
// Which photos are deleted?
//   ✔ the order is CANCELLED            (never paid, or cancelled by an admin)
//   ✔ the order is older than 3 days    (a cancelled order can still be
//                                        re-opened by retrying payment for a
//                                        little while — give it time)
//   ✘ never if the payment is PAID       (just to be safe)
//
// ⚠️ Server only. Not a "use server" file — must not become a public action.

import { deleteImageFromCloudinary } from "@/lib/cloudinary";
import { PHOTO_QUESTION_KEY } from "@/lib/event-checkout-form";
import { prisma } from "@/lib/prisma";

/** How long a cancelled order keeps its photo. */
const KEEP_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Delete photos of unpaid, cancelled orders. Returns how many were deleted. */
export async function deleteUnpaidRegistrationPhotos(limit = 50): Promise<number> {
  const cutoff = new Date(Date.now() - KEEP_DAYS * DAY_MS);

  // Registrations that still have a photo, on old cancelled orders
  const registrations = await prisma.registration.findMany({
    where: {
      details: { path: [PHOTO_QUESTION_KEY], string_starts_with: "https://" },
      order: {
        status: "CANCELLED",
        createdAt: { lt: cutoff },
        NOT: { payment: { is: { status: "PAID" } } },
      },
    },
    select: { id: true, details: true },
    take: limit, // a few at a time; the rest go next hour
  });

  let deleted = 0;

  for (const registration of registrations) {
    const details = { ...(registration.details as Record<string, string>) };
    const photoUrl = details[PHOTO_QUESTION_KEY];

    // 1. Delete the file from Cloudinary first…
    const { success } = await deleteImageFromCloudinary(photoUrl);
    if (!success) continue; // Cloudinary didn't answer — try again next hour

    // 2. …then forget its address, so we don't try again.
    delete details[PHOTO_QUESTION_KEY];
    await prisma.registration.update({
      where: { id: registration.id },
      data: { details },
    });
    deleted++;
  }

  return deleted;
}
