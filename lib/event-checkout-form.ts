// lib/event-checkout-form.ts
//
// The kinds of event we run (Event.category in prisma/schema.prisma).
//
// One place for everything about a category:
//   - label        what admins and visitors see ("Conference")
//   - description  one line for the admin's category picker
//   - questions    what checkout asks attendees, in order
//
// Two kinds of question:
//   - label only    (Name, Gender, T-shirt size …) — handled by the fixed
//                   contact / race fields in module/checkout/components/BillingForm.tsx
//   - with a `key`  (company, guests …) — an "extra" question. Checkout draws it
//                   automatically (EventQuestions.tsx) and the answer is saved
//                   in Registration.details under that key.
//
// Adding an extra question = adding one line with a key, label and type.
//
// A question can depend on the event's format (Event.eventType):
//   onlyFor: "LIVE"     → asked only for in-person events
//   onlyFor: "VIRTUAL"  → asked only for virtual events
//   (no onlyFor)        → always asked
// Example: a T-shirt is only collected at an in-person marathon, so the
// T-shirt question has onlyFor: "LIVE" — a virtual run never asks for it.
//
// To add a category:
//   1. add it to `enum EventCategory` in prisma/schema.prisma (+ a migration)
//   2. add it to EVENT_CATEGORIES below
// The admin form reads this list, so it updates by itself.

import type { EventCategory, EventType } from "@/lib/generated/prisma/enums";

export type { EventCategory };

/** One checkout question. */
export type CheckoutQuestion = {
  label: string;
  /** Leave out to always ask; "LIVE" = in person only; "VIRTUAL" = virtual only. */
  onlyFor?: EventType;

  // ── Only for extra questions (saved in Registration.details) ──
  /** Name of the answer in `details`, e.g. "company". */
  key?: string;
  /** "text" box, "number" box, "select" (pick one) or "textarea" (long text). */
  type?: "text" | "number" | "select" | "textarea";
  /** Choices for type "select". */
  options?: string[];
  /** Must be answered before paying. */
  required?: boolean;
  /** Grey hint inside the box. */
  placeholder?: string;
};

/** An extra question — always has a key and a type. */
export type ExtraQuestion = CheckoutQuestion & { key: string; type: NonNullable<CheckoutQuestion["type"]> };

/** Answers to the extra questions, by key (what's saved in Registration.details). */
export type ExtraAnswers = Record<string, string>;

export type EventCategoryInfo = {
  value: EventCategory;
  label: string;
  description: string;
  questions: CheckoutQuestion[];
};

// Every category starts with these.
const CONTACT_QUESTIONS: CheckoutQuestion[] = [
  { label: "Name" },
  { label: "Phone" },
  { label: "Email" },
];

export const EVENT_CATEGORIES: EventCategoryInfo[] = [
  {
    value: "MARATHON",
    label: "Marathon / run",
    description: "Marathons, fun runs, races",
    questions: [
      ...CONTACT_QUESTIONS,
      { label: "Gender" },
      { label: "Date of birth" },
      { label: "Blood group" },
      { label: "Runner category" },
      { label: "T-shirt size", onlyFor: "LIVE" }, // no T-shirt for virtual runs
      { label: "Emergency contact" },
    ],
  },
  {
    value: "CONFERENCE",
    label: "Conference / summit",
    description: "Summits, seminars, corporate conferences",
    questions: [
      ...CONTACT_QUESTIONS,
      { key: "company", label: "Company", type: "text", required: true, placeholder: "Company or organisation" },
      { key: "jobTitle", label: "Job title", type: "text", placeholder: "e.g. Head of Marketing" },
      { key: "dietary", label: "Dietary needs", type: "select", options: ["None", "Vegetarian", "Halal", "Other"], onlyFor: "LIVE" },
    ],
  },
  {
    value: "EXHIBITION",
    label: "Exhibition / expo",
    description: "Trade shows, expos, fairs",
    questions: [
      ...CONTACT_QUESTIONS,
      { key: "company", label: "Company", type: "text", required: true, placeholder: "Company or organisation" },
      { key: "visitorType", label: "Visitor type", type: "select", options: ["Buyer", "Exhibitor", "Visitor"], required: true },
    ],
  },
  {
    value: "SOCIAL",
    label: "Social / private",
    description: "Weddings, galas, celebrations",
    questions: [
      ...CONTACT_QUESTIONS,
      { key: "guests", label: "Number of guests", type: "number", required: true, placeholder: "1" },
      { key: "meal", label: "Meal choice", type: "select", options: ["Chicken", "Beef", "Fish", "Vegetarian"], onlyFor: "LIVE" },
      { key: "message", label: "Message", type: "textarea", placeholder: "Anything we should know?" },
    ],
  },
  {
    value: "WORKSHOP",
    label: "Workshop / training",
    description: "Hands-on workshops and trainings",
    questions: [
      ...CONTACT_QUESTIONS,
      { key: "organisation", label: "Organisation", type: "text", placeholder: "Company, university …" },
      { key: "experience", label: "Experience level", type: "select", options: ["Beginner", "Intermediate", "Advanced"], required: true },
    ],
  },
];

/** The category new events start with (matches the schema default). */
export const DEFAULT_EVENT_CATEGORY: EventCategory = "MARATHON";

/** True if `value` is one of our categories (use before saving to the database). */
export function isEventCategory(value: string): value is EventCategory {
  return EVENT_CATEGORIES.some((c) => c.value === value);
}

/** Details for one category, e.g. getEventCategory("CONFERENCE").label → "Conference / summit". */
export function getEventCategory(value: string): EventCategoryInfo {
  return EVENT_CATEGORIES.find((c) => c.value === value) ?? EVENT_CATEGORIES[0];
}

/**
 * The questions checkout asks for an event of this category and format.
 *   getCheckoutQuestions("MARATHON", "LIVE")    → … T-shirt size …
 *   getCheckoutQuestions("MARATHON", "VIRTUAL") → same list without T-shirt size
 */
export function getCheckoutQuestions(
  category: string,
  eventType: string,
): CheckoutQuestion[] {
  return getEventCategory(category).questions.filter(
    (q) => !q.onlyFor || q.onlyFor === eventType,
  );
}

/** True if checkout should ask this question — e.g. asksQuestion("MARATHON", "VIRTUAL", "T-shirt size") → false. */
export function asksQuestion(
  category: string,
  eventType: string,
  label: string,
): boolean {
  return getCheckoutQuestions(category, eventType).some(
    (q) => q.label === label,
  );
}

/** True for marathons — they use the fixed race fields (gender, T-shirt …). */
export function usesRaceFields(category: string): boolean {
  return category === "MARATHON";
}

/**
 * The extra questions for this event (the ones with a `key`), e.g. for a
 * conference: company, job title, dietary needs (in person only).
 */
export function getExtraQuestions(category: string, eventType: string): ExtraQuestion[] {
  return getCheckoutQuestions(category, eventType).filter((q): q is ExtraQuestion => !!q.key && !!q.type);
}

/**
 * Check one answer. Returns an error message, or "" if it's fine.
 * Used by the checkout form (as you type) AND the server (before saving).
 */
export function checkExtraAnswer(question: ExtraQuestion, value: string | undefined): string {
  const answer = (value ?? "").trim();

  if (!answer) return question.required ? `${question.label} is required` : "";

  if (question.type === "number") {
    const n = Number(answer);
    if (!Number.isInteger(n) || n < 1 || n > 20) return `${question.label} must be a whole number from 1 to 20`;
  }
  if (question.type === "select" && !question.options?.includes(answer)) {
    return `Choose a ${question.label.toLowerCase()}`;
  }
  if (answer.length > 500) return `${question.label} is too long`;

  return "";
}
