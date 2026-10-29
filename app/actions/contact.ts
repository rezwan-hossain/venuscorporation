// app/actions/contact.ts
"use server";

// Contact page enquiries.
//   sendContactMessage — public: the form on /contact saves an enquiry
//   everything else    — admin → Contact Messages: list, status, note, delete

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { audit } from "@/lib/audit";
import { checkContactForm, type ContactInput } from "@/lib/contact-form";
import type { ContactStatus } from "@/lib/generated/prisma/enums";

const MAX_PER_HOUR = 5; // enquiries from one IP address
const HOUR = 60 * 60 * 1000;

export type ContactMessageRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  eventType: string;
  eventDate: string | null;
  guests: string | null;
  message: string;
  status: ContactStatus;
  adminNote: string | null;
  createdAt: string;
};

// ════════════════════════════════════════════════════════════════════════
//  Public: send an enquiry
// ════════════════════════════════════════════════════════════════════════

/** The sender's IP address (behind a proxy, the first one in the list). */
async function senderIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || null;
}

export async function sendContactMessage(
  input: ContactInput & { website?: string },
): Promise<{ success: boolean; error: string | null }> {
  // Honeypot: "website" is a hidden field people never see. Bots fill in
  // every field, so pretend it worked and save nothing.
  if (input.website) return { success: true, error: null };

  // Only the known fields, as text
  const form: ContactInput = {
    name: String(input.name ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    email: String(input.email ?? "").trim(),
    eventType: String(input.eventType ?? "").trim(),
    date: String(input.date ?? "").trim(),
    guests: String(input.guests ?? "").trim(),
    message: String(input.message ?? "").trim(),
  };

  const problems = Object.values(checkContactForm(form));
  if (problems.length > 0) return { success: false, error: problems[0]! };

  try {
    // Spam limit: at most MAX_PER_HOUR enquiries per IP address per hour
    const ip = await senderIp();
    if (ip) {
      const recent = await prisma.contactMessage.count({
        where: { ip, createdAt: { gte: new Date(Date.now() - HOUR) } },
      });
      if (recent >= MAX_PER_HOUR) {
        return {
          success: false,
          error:
            "You've sent a few enquiries already — please call us instead, or try again later.",
        };
      }
    }

    await prisma.contactMessage.create({
      data: {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        eventType: form.eventType,
        eventDate: form.date ? new Date(`${form.date}T00:00:00Z`) : null,
        guests: form.guests || null,
        message: form.message,
        ip,
      },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("sendContactMessage error:", err);
    return {
      success: false,
      error: "Sorry, we couldn't send that. Please try again or call us.",
    };
  }
}

// ════════════════════════════════════════════════════════════════════════
//  Admin: the inbox
// ════════════════════════════════════════════════════════════════════════

/** Every enquiry, newest first (up to 1,000). */
export async function getContactMessages(): Promise<{
  messages: ContactMessageRow[];
  error: string | null;
}> {
  const { error } = await requireAdmin();
  if (error) return { messages: [], error };

  try {
    const rows = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        eventType: true,
        eventDate: true,
        guests: true,
        message: true,
        status: true,
        adminNote: true,
        createdAt: true,
      },
    });
    return { messages: JSON.parse(JSON.stringify(rows)), error: null };
  } catch (err) {
    console.error("getContactMessages error:", err);
    return { messages: [], error: "Failed to load messages" };
  }
}

const STATUSES: ContactStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED"];

/** Move an enquiry to New / Read / Replied / Archived. */
export async function setContactStatus(
  id: string,
  status: ContactStatus,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };
  if (!STATUSES.includes(status))
    return { success: false, error: "Unknown status" };

  try {
    await prisma.contactMessage.update({ where: { id }, data: { status } });
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to update the message" };
  }
}

/** Save the admin's private note on an enquiry. */
export async function saveContactNote(
  id: string,
  note: string,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };
  if (note.length > 2000)
    return { success: false, error: "Keep the note under 2000 characters" };

  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { adminNote: note.trim() || null },
    });
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to save the note" };
  }
}

/** Delete an enquiry for good (logged in the audit log). */
export async function deleteContactMessage(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    const message = await prisma.contactMessage.delete({ where: { id } });
    await audit({
      action: "contact.deleted",
      entityType: "contact",
      entityId: id,
      summary: `Deleted the enquiry from ${message.name} (${message.eventType})`,
    });
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to delete the message" };
  }
}
