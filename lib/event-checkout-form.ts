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
//                   contact / race fields in module/checkout/components/BillingForm.tsx.
//                   ⚠ Those race fields only show for MARATHON. In any other
//                   category a label-only line shows nothing — give it a key
//                   and a type instead (see TSHIRT_QUESTION below).
//   - with a `key`  (company, guests …) — an "extra" question. Checkout draws it
//                   automatically (EventQuestions.tsx) and the answer is saved
//                   in Registration.details under that key.
//
// Adding an extra question = adding one line with a key, label and type.
//
// Question types:
//   "text" · "number" · "textarea" · "select" (needs `options`)
//   "date"   — a date picker; the answer is saved as "2001-05-31"
//   "image"  — a photo (e.g. passport-size). Different from the others: the
//              photo is uploaded AFTER the order is created, and its web
//              address is saved under the key. See PHOTO_QUESTION below.
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
import { tshirtSizes } from "@/module/checkout/data/tshirtSizes";

export type { EventCategory };

/** One checkout question. */
export type CheckoutQuestion = {
  label: string;
  /** Leave out to always ask; "LIVE" = in person only; "VIRTUAL" = virtual only. */
  onlyFor?: EventType;

  // ── Only for extra questions (saved in Registration.details) ──
  /** Name of the answer in `details`, e.g. "company". */
  key?: string;
  /** "text" box, "number" box, "select" (pick one), "textarea" (long text),
   *  "date" (date picker) or "image" (photo upload — see PHOTO_QUESTION). */
  type?: "text" | "number" | "select" | "textarea" | "date" | "image";
  /** Choices for type "select". */
  options?: string[];
  /** Must be answered before paying. */
  required?: boolean;
  /** Grey hint inside the box. */
  placeholder?: string;
};

/** An extra question — always has a key and a type. */
export type ExtraQuestion = CheckoutQuestion & {
  key: string;
  type: NonNullable<CheckoutQuestion["type"]>;
};

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

// T-shirt size as an extra question, for categories other than marathon.
// (Marathons use the fixed race field instead.) Adult sizes only — the
// children's sizes ("3-4 Years" …) are for family fun runs.
const TSHIRT_QUESTION: CheckoutQuestion = {
  key: "tshirtSize",
  label: "T-shirt size",
  type: "select",
  options: tshirtSizes
    .map((size) => size.value)
    .filter((size) => !size.includes("Years")),
  required: true,
  onlyFor: "LIVE", // no T-shirt for virtual events
};

// ── Personal details asked at a conference / summit ──
// (Full name, mobile number and email are already asked by the fixed contact
// fields at the top of checkout, so they aren't repeated here.)

export const GENDERS = ["Male", "Female", "Other"];
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// The photo question. Its key ("photo") is also used by the clean-up job that
// deletes photos of orders that were never paid (lib/registration-photo-cleanup.ts),
// so every category that wants a photo should use this same question.
export const PHOTO_QUESTION_KEY = "photo";
const PHOTO_QUESTION: CheckoutQuestion = {
  key: PHOTO_QUESTION_KEY,
  label: "Recent passport-size photo",
  type: "image",
  required: true,
};

const PERSONAL_DETAILS_QUESTIONS: CheckoutQuestion[] = [
  {
    key: "fatherName",
    label: "Father's name",
    type: "text",
    required: true,
    placeholder: "Father's full name",
  },
  {
    key: "motherName",
    label: "Mother's name",
    type: "text",
    required: true,
    placeholder: "Mother's full name",
  },
  { key: "dateOfBirth", label: "Date of birth", type: "date", required: true },
  {
    key: "gender",
    label: "Gender",
    type: "select",
    options: GENDERS,
    required: true,
  },
  {
    key: "bloodGroup",
    label: "Blood group",
    type: "select",
    options: BLOOD_GROUPS,
    required: true,
  },
  {
    key: "nationality",
    label: "Nationality",
    type: "text",
    required: true,
    placeholder: "e.g. Bangladeshi",
  },
  // PHOTO_QUESTION,
  {
    key: "presentAddress",
    label: "Present address",
    type: "textarea",
    required: true,
    placeholder: "House, road, area, city",
  },
  {
    key: "permanentAddress",
    label: "Permanent address",
    type: "textarea",
    required: true,
    placeholder: "Village / house, upazila, district",
  },
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
      ...PERSONAL_DETAILS_QUESTIONS, // father's name … photo … addresses
      {
        key: "company",
        label: "Company",
        type: "text",
        required: true,
        placeholder: "Company or organisation",
      },
      {
        key: "jobTitle",
        label: "Job title",
        type: "text",
        required: true,
        placeholder: "e.g. Head of Marketing",
      },
      TSHIRT_QUESTION,
      // {
      //   key: "dietary",
      //   label: "Dietary needs",
      //   type: "select",
      //   options: ["None", "Vegetarian", "Halal", "Other"],
      //   onlyFor: "LIVE",
      // },
    ],
  },
  {
    value: "EXHIBITION",
    label: "Exhibition / expo",
    description: "Trade shows, expos, fairs",
    questions: [
      ...CONTACT_QUESTIONS,
      {
        key: "company",
        label: "Company",
        type: "text",
        required: true,
        placeholder: "Company or organisation",
      },
      {
        key: "visitorType",
        label: "Visitor type",
        type: "select",
        options: ["Buyer", "Exhibitor", "Visitor"],
        required: true,
      },
    ],
  },
  {
    value: "SOCIAL",
    label: "Social / private",
    description: "Weddings, galas, celebrations",
    questions: [
      ...CONTACT_QUESTIONS,
      {
        key: "guests",
        label: "Number of guests",
        type: "number",
        required: true,
        placeholder: "1",
      },
      {
        key: "meal",
        label: "Meal choice",
        type: "select",
        options: ["Chicken", "Beef", "Fish", "Vegetarian"],
        onlyFor: "LIVE",
      },
      {
        key: "message",
        label: "Message",
        type: "textarea",
        placeholder: "Anything we should know?",
      },
    ],
  },
  {
    value: "WORKSHOP",
    label: "Workshop / training",
    description: "Hands-on workshops and trainings",
    questions: [
      ...CONTACT_QUESTIONS,
      {
        key: "organisation",
        label: "Organisation",
        type: "text",
        placeholder: "Company, university …",
      },
      {
        key: "experience",
        label: "Experience level",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced"],
        required: true,
      },
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
export function getExtraQuestions(
  category: string,
  eventType: string,
): ExtraQuestion[] {
  return getCheckoutQuestions(category, eventType).filter(
    (q): q is ExtraQuestion => !!q.key && !!q.type,
  );
}

/** True for a photo question (type "image"). Photos are uploaded separately,
 *  after the order exists — so the order form and the admin's manual
 *  registration skip them. */
export function isPhotoQuestion(question: CheckoutQuestion): boolean {
  return question.type === "image";
}

/**
 * Check one answer. Returns an error message, or "" if it's fine.
 * Used by the checkout form (as you type) AND the server (before saving).
 */
export function checkExtraAnswer(
  question: ExtraQuestion,
  value: string | undefined,
): string {
  const answer = (value ?? "").trim();

  if (!answer) return question.required ? `${question.label} is required` : "";

  if (question.type === "number") {
    const n = Number(answer);
    if (!Number.isInteger(n) || n < 1 || n > 20)
      return `${question.label} must be a whole number from 1 to 20`;
  }
  if (question.type === "select" && !question.options?.includes(answer)) {
    return `Choose a ${question.label.toLowerCase()}`;
  }
  if (question.type === "date") {
    // Must look like "2001-05-31" and be a real day in the past
    const day = new Date(answer);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(answer) || Number.isNaN(day.getTime()))
      return `Enter a valid ${question.label.toLowerCase()}`;
    if (day >= new Date()) return `${question.label} must be in the past`;
  }
  if (answer.length > 500) return `${question.label} is too long`;

  return "";
}

// The label to show for a saved answer key, e.g. "jobTitle" → "Job title".
// Used by the admin order list, which only has the stored keys.
export function getAnswerLabel(key: string): string {
  for (const category of EVENT_CATEGORIES) {
    const question = category.questions.find((q) => q.key === key);
    if (question) return question.label;
  }
  return key;
}
