// lib/email-template.ts
//
// Admin-editable TEXT of the payment-confirmation email. The layout (event,
// BIB, booking details, amount, buttons) stays fixed in lib/email/templates/
// payment-confirmation.tsx; admins edit only the words around it.
//
// Pure functions only (no database), so the admin page uses the same code for
// its live preview. Placeholders and line rules are the SMS ones
// (lib/sms-template.ts): {name}, {event}, … and a line whose placeholders are
// all empty is left out.

import {
  renderSmsTemplate,
  sampleSmsVars,
  SMS_PLACEHOLDERS,
  type SampleEvent,
  type SmsVars,
} from "@/lib/sms-template";
import { getExtraQuestions, usesRaceFields } from "@/lib/event-checkout-form";
import type { PaymentConfirmationEmailProps } from "@/lib/email/templates/payment-confirmation";

export type EmailContent = {
  subject: string;
  heading: string;
  subheading: string;
  /** Optional note from the organiser (kit collection, race-day info…). "" = hidden. */
  message: string;
  /** Checklist box, one item per line. "" = hidden. */
  checklist: string;
};

export type RenderedEmailContent = {
  subject: string;
  heading: string;
  subheading: string;
  message: string;
  checklist: string[];
};

export const EMAIL_FIELDS = [
  "subject",
  "heading",
  "subheading",
  "message",
  "checklist",
] as const;
export type EmailField = (typeof EMAIL_FIELDS)[number];

/** The text used when the admin hasn't written their own. */
export const DEFAULT_CONFIRMATION_EMAIL: EmailContent = {
  subject: "Booking confirmed: {event}",
  heading: "You're all set, {name}!",
  subheading: "Your payment is confirmed and your place is booked.",
  message: "",
  checklist: [
    "Keep this email, it's your booking confirmation",
    "Bring a photo ID on the day",
    "Arrive 30 minutes before the start",
    "See your booking any time in your dashboard",
  ].join("\n"),
};

export const EMAIL_LIMITS: Record<EmailField, number> = {
  subject: 150,
  heading: 80,
  subheading: 200,
  message: 2000,
  checklist: 1000,
};
export const CHECKLIST_MAX_ITEMS = 8;

export const EMAIL_FIELD_LABELS: Record<EmailField, string> = {
  subject: "Subject line",
  heading: "Heading",
  subheading: "Line under the heading",
  message: "Message from the organiser",
  checklist: "Checklist",
};

const TOKEN = /\{([a-zA-Z]+)\}/g;
const normalise = (s: string) => s.replace(/\r\n/g, "\n").trim();

/** Tidy an admin's input (line endings, outer whitespace). */
export function cleanEmailContent(c: EmailContent): EmailContent {
  return {
    subject: normalise(c.subject).replace(/\n+/g, " "),
    heading: normalise(c.heading).replace(/\n+/g, " "),
    subheading: normalise(c.subheading).replace(/\n+/g, " "),
    message: normalise(c.message),
    checklist: normalise(c.checklist)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n"),
  };
}

/** Problems that must be fixed before saving, per field. Empty object = OK. */
export function validateEmailContent(
  c: EmailContent,
): Partial<Record<EmailField, string>> {
  const errors: Partial<Record<EmailField, string>> = {};
  const clean = cleanEmailContent(c);
  for (const f of EMAIL_FIELDS) {
    const v = clean[f];
    if (v.length > EMAIL_LIMITS[f]) {
      errors[f] = `Keep it under ${EMAIL_LIMITS[f]} characters.`;
      continue;
    }
    const unknown = [
      ...new Set(
        [...v.matchAll(TOKEN)]
          .map((m) => m[1])
          .filter((t) => !(t in SMS_PLACEHOLDERS)),
      ),
    ];
    if (unknown.length) {
      errors[f] =
        `Unknown placeholder${unknown.length > 1 ? "s" : ""}: ${unknown.map((u) => `{${u}}`).join(", ")}`;
    }
  }
  if (!errors.subject && !clean.subject)
    errors.subject = "The subject can't be empty.";
  if (!errors.heading && !clean.heading)
    errors.heading = "The heading can't be empty.";
  if (
    !errors.checklist &&
    clean.checklist.split("\n").filter(Boolean).length > CHECKLIST_MAX_ITEMS
  ) {
    errors.checklist = `At most ${CHECKLIST_MAX_ITEMS} items.`;
  }
  return errors;
}

export const isValidEmailContent = (c: EmailContent) =>
  Object.keys(validateEmailContent(c)).length === 0;

/** Read stored content (JSON from the database). Null if it isn't usable. */
export function parseEmailContent(raw: unknown): EmailContent | null {
  let v = raw;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return null;
    }
  }
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (!EMAIL_FIELDS.every((f) => typeof o[f] === "string")) return null;
  const c = cleanEmailContent(o as EmailContent);
  return isValidEmailContent(c) ? c : null;
}

/** Fill in a person's details. Plain text out — the HTML template escapes it. */
export function renderEmailContent(
  c: EmailContent,
  vars: SmsVars,
): RenderedEmailContent {
  const r = (s: string) => renderSmsTemplate(s, vars);
  const subject = r(c.subject).replace(/\n+/g, " ");
  const heading = r(c.heading).replace(/\n+/g, " ");
  return {
    // Never send an empty subject/heading (e.g. "{bib}" alone with no BIB yet).
    subject:
      subject || renderSmsTemplate(DEFAULT_CONFIRMATION_EMAIL.subject, vars),
    heading: heading || DEFAULT_CONFIRMATION_EMAIL.heading,
    subheading: r(c.subheading).replace(/\n+/g, " "),
    message: r(c.message),
    checklist: r(c.checklist)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  };
}

export const sameEmailContent = (a: EmailContent, b: EmailContent) =>
  EMAIL_FIELDS.every((f) => normalise(a[f]) === normalise(b[f]));

// ─── Sample booking (admin preview + test email) ────

// Example answers for the checkout questions (lib/event-checkout-form.ts).
// A question not listed here shows its first option.
const SAMPLE_ANSWERS: Record<string, string> = {
  company: "Square Group",
  organisation: "Square Group",
  jobTitle: "Marketing Manager",
  guests: "2",
};

/**
 * A made-up booking for `event`, shaped like a real one: blood group for
 * marathons, T-shirt for in-person runs, checkout answers for other
 * events. Returns the placeholder values (for the text) and the email's
 * details (for the layout).
 */
export function sampleEmailBooking(
  event: SampleEvent & { address?: string } = {},
): {
  vars: SmsVars;
  details: Omit<PaymentConfirmationEmailProps, "content" | "appUrl">;
} {
  const vars = sampleSmsVars(event);
  const category = event.category ?? "MARATHON";
  const isMarathon = usesRaceFields(category);

  const answers = isMarathon
    ? []
    : getExtraQuestions(category, event.eventType ?? "LIVE")
        .filter((q) => q.type !== "textarea")
        .map((q) => ({
          label: q.label,
          value: SAMPLE_ANSWERS[q.key] ?? q.options?.[0] ?? "—",
        }));

  return {
    vars,
    details: {
      name: vars.name!,
      eventName: vars.event!,
      eventDate: vars.eventDate!,
      eventAddress: event.address ?? "ICCB, Purbachal, Dhaka",
      packageName: vars.package!,
      distance: vars.distance!,
      amount: 1299,
      orderId: "7040d1a6-0000",
      orderDate: "4 Oct 2026, 10:30",
      paymentStatus: "PAID",
      transactionId: "SP6512A0C3F1",
      paymentMethod: "bKash",
      // bibNumber: vars.bib ?? undefined, // BIB isn't sent in real emails
      tshirtSize: vars.tshirt ?? undefined,
      bloodGroup: isMarathon ? "O+" : undefined,
      answers,
    },
  };
}

/**
 * Saved checkout answers (registration.details) → rows for the email, in the
 * order they were asked. Empty answers are skipped.
 */
export function answersForEmail(
  category: string,
  eventType: string,
  details: unknown,
): { label: string; value: string }[] {
  const saved = (details ?? {}) as Record<string, unknown>;
  return getExtraQuestions(category, eventType)
    .filter((q) => q.type !== "textarea" && saved[q.key])
    .map((q) => ({ label: q.label, value: String(saved[q.key]) }));
}
