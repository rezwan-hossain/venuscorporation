// app/actions/sms-settings.ts
"use server";

// Admin editing of the payment-confirmation SMS. Every export is a public
// endpoint, so every one starts with requireAdmin().

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { audit } from "@/lib/audit";
import { formatBDPhone, sendSMS } from "@/lib/sms";
import { isValidBDPhone } from "@/lib/registration-options";
import {
  DEFAULT_CONFIRMATION_SMS,
  renderSmsTemplate,
  sampleSmsVars,
  validateSmsTemplate,
} from "@/lib/sms-template";
import { SMS_SETTING_KEY } from "@/lib/sms-template-server";

export async function getSmsSettings(): Promise<{
  builtin: string;
  defaultTemplate: string | null; // null = using the built-in text
  defaultUpdatedAt: string | null;
  events: {
    id: string;
    name: string;
    date: string;
    category: string;
    eventType: string;
    template: string | null;
  }[];
  error: string | null;
}> {
  const empty = {
    builtin: DEFAULT_CONFIRMATION_SMS,
    defaultTemplate: null,
    defaultUpdatedAt: null,
    events: [],
  };
  const { error } = await requireAdmin();
  if (error) return { ...empty, error };

  try {
    const [setting, events] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: SMS_SETTING_KEY } }),
      prisma.event.findMany({
        where: { isArchived: false },
        select: {
          id: true,
          name: true,
          date: true,
          category: true,
          eventType: true,
          confirmationSmsTemplate: true,
        },
        orderBy: { date: "desc" },
      }),
    ]);
    return {
      builtin: DEFAULT_CONFIRMATION_SMS,
      defaultTemplate: setting?.value ?? null,
      defaultUpdatedAt: setting?.updatedAt.toISOString() ?? null,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        date: e.date.toISOString(),
        category: e.category,
        eventType: e.eventType,
        template: e.confirmationSmsTemplate,
      })),
      error: null,
    };
  } catch (err) {
    console.error("getSmsSettings error:", err);
    return { ...empty, error: "Failed to load SMS settings" };
  }
}

/** Save the default template. Pass null to go back to the built-in text. */
export async function saveDefaultSmsTemplate(
  template: string | null,
): Promise<{ success: boolean; error: string | null }> {
  const { error, dbUser } = await requireAdmin();
  if (error || !dbUser)
    return { success: false, error: error ?? "Unauthorized" };

  try {
    const before = await prisma.siteSetting.findUnique({
      where: { key: SMS_SETTING_KEY },
    });

    if (template === null) {
      await prisma.siteSetting.deleteMany({ where: { key: SMS_SETTING_KEY } });
      await audit({
        action: "sms.default_reset",
        entityType: "event",
        entityId: SMS_SETTING_KEY,
        summary: "Reset the default confirmation SMS to the built-in text",
        changes: { template: [before?.value ?? null, null] },
      });
      return { success: true, error: null };
    }

    const text = template.replace(/\r\n/g, "\n").trim();
    const problems = validateSmsTemplate(text);
    if (problems.length > 0)
      return { success: false, error: problems.join(" ") };

    await prisma.siteSetting.upsert({
      where: { key: SMS_SETTING_KEY },
      create: { key: SMS_SETTING_KEY, value: text, updatedById: dbUser.id },
      update: { value: text, updatedById: dbUser.id },
    });
    await audit({
      action: "sms.default_updated",
      entityType: "event",
      entityId: SMS_SETTING_KEY,
      summary: "Changed the default confirmation SMS",
      changes: { template: [before?.value ?? DEFAULT_CONFIRMATION_SMS, text] },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("saveDefaultSmsTemplate error:", err);
    return { success: false, error: "Failed to save the SMS template" };
  }
}

/** Save one event's own template. Pass null to use the default again. */
export async function saveEventSmsTemplate(
  eventId: string,
  template: string | null,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { success: false, error };

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { name: true, confirmationSmsTemplate: true },
    });
    if (!event) return { success: false, error: "Event not found" };

    let text: string | null = null;
    if (template !== null) {
      text = template.replace(/\r\n/g, "\n").trim();
      const problems = validateSmsTemplate(text);
      if (problems.length > 0)
        return { success: false, error: problems.join(" ") };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { confirmationSmsTemplate: text },
    });
    await audit({
      action: text === null ? "sms.event_reset" : "sms.event_updated",
      entityType: "event",
      entityId: eventId,
      eventId,
      summary:
        text === null
          ? `"${event.name}" now uses the default confirmation SMS`
          : `Set a custom confirmation SMS for "${event.name}"`,
      changes: { template: [event.confirmationSmsTemplate, text] },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("saveEventSmsTemplate error:", err);
    return { success: false, error: "Failed to save the SMS template" };
  }
}

/** Send the rendered template to one number, with sample details for the event. */
export async function sendTestSms(
  template: string,
  phone: string,
  eventId: string | null,
): Promise<{ success: boolean; error: string | null; message?: string }> {
  const { error, dbUser } = await requireAdmin();
  if (error || !dbUser)
    return { success: false, error: error ?? "Unauthorized" };

  const problems = validateSmsTemplate(template);
  if (problems.length > 0) return { success: false, error: problems.join(" ") };
  if (!isValidBDPhone(phone)) {
    return {
      success: false,
      error: "Enter a Bangladeshi mobile number, e.g. 01712345678.",
    };
  }

  const event = eventId
    ? await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          name: true,
          date: true,
          category: true,
          eventType: true,
          packages: { select: { name: true, distance: true }, take: 1 },
        },
      })
    : null;
  const vars = sampleSmsVars({
    name: event?.name,
    category: event?.category,
    eventType: event?.eventType,
    date: event?.date,
    packageName: event?.packages[0]?.name,
    distance: event?.packages[0]?.distance,
  });
  const message = renderSmsTemplate(template, vars);

  const result = await sendSMS({ number: formatBDPhone(phone), message });
  await audit({
    action: "sms.test_sent",
    entityType: "event",
    entityId: eventId ?? SMS_SETTING_KEY,
    eventId,
    summary: `Sent a test confirmation SMS to ${phone}${result.success ? "" : " (failed)"}`,
  });
  if (!result.success) {
    return {
      success: false,
      error: `The SMS gateway rejected it: ${result.error ?? "unknown error"}`,
    };
  }
  return { success: true, error: null, message };
}
