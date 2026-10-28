// lib/orders-csv.ts
//
// Builds the "Export CSV" file for an event's orders (admin → Manage Events →
// Orders → CSV).
//
// The columns depend on the event's category:
//   - every event:   order, buyer, package and payment columns
//   - marathons:     + BIB, gender, age category, T-shirt size, …
//   - every event:   + one column per extra checkout question
//                      (e.g. Company, Job title for a conference)
//
// Extra questions come from lib/event-checkout-form.ts, so a new question
// there gets its own column here automatically. Don't rename a question's
// `key` once orders exist: old answers are saved under the old key.
//
// To add a column for every event, add it to COMMON_COLUMNS below.

import type { EventOrder } from "@/types/profile";
import { getExtraQuestions, usesRaceFields } from "@/lib/event-checkout-form";

type Column = {
  header: string;
  value: (order: EventOrder) => unknown;
};

/** dd-mm-yyyy, read in UTC so the date doesn't shift by timezone. */
function formatBirthDate(date: string): string {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getUTCFullYear()}`;
}

/** Order time in Bangladesh time, e.g. "2026-09-07 03:20". */
function formatOrderDate(date: string): string {
  return new Date(date)
    .toLocaleString("sv-SE", { timeZone: "Asia/Dhaka" })
    .slice(0, 16);
}

/**
 * One CSV cell.
 *
 * 1. Text starting with = + - @ is run as a formula by Excel, so a buyer
 *    could type a "name" like =HYPERLINK(...). We put a ' in front to keep it
 *    plain text. Phone numbers and amounts (+880…, -50) are left alone.
 * 2. RFC-4180: quote only when needed, double any inner quotes.
 */
function escapeCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);

  const looksLikeFormula = /^[=+\-@\t\r]/.test(s);
  const isPhoneOrNumber = /^[+-]?[\d\s().-]+$/.test(s);
  if (looksLikeFormula && !isPhoneOrNumber) s = `'${s}`;

  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Columns every event gets, before the category-specific ones.
const COMMON_COLUMNS: Column[] = [
  { header: "Order ID", value: (o) => o.id },
  { header: "Order Date", value: (o) => formatOrderDate(o.createdAt) },
  { header: "Source", value: (o) => o.source },
  { header: "Order Status", value: (o) => o.status },
  { header: "Name", value: (o) => o.registration?.fullName },
  {
    header: "Email",
    value: (o) => o.registration?.email || (o.user.isGuest ? "" : o.user.email),
  },
  { header: "Phone", value: (o) => o.registration?.phone || o.user.phone },
  // Guests have a placeholder account email, so leave it blank for them.
  {
    header: "Account Email",
    value: (o) => (o.user.isGuest ? "" : o.user.email),
  },
];

// Marathon-only columns.
const RACE_COLUMNS: Column[] = [
  { header: "BIB Number", value: (o) => o.registration?.bibNumber },
  { header: "Gender", value: (o) => o.registration?.gender },
  { header: "Age Category", value: (o) => o.registration?.ageCategory },
  {
    header: "Birth Date",
    value: (o) =>
      o.registration?.birthDate
        ? formatBirthDate(o.registration.birthDate)
        : "",
  },
  { header: "Blood Group", value: (o) => o.registration?.bloodGroup },
  { header: "T-Shirt Size", value: (o) => o.registration?.tshirtSize },
  { header: "Runner Category", value: (o) => o.registration?.runnerCategory },
  { header: "Community", value: (o) => o.registration?.communityName },
  {
    header: "Emergency Contact",
    value: (o) => o.registration?.emergencyContactName,
  },
  {
    header: "Emergency Phone",
    value: (o) => o.registration?.emergencyContactNumber,
  },
];

// Package and payment columns, after the category-specific ones.
const PAYMENT_COLUMNS: Column[] = [
  { header: "Package", value: (o) => o.package.name },
  { header: "Distance / Duration", value: (o) => o.package.distance },
  { header: "Qty", value: (o) => o.qty },
  { header: "Package Price", value: (o) => o.package.price },
  { header: "Payment Amount", value: (o) => o.payment?.amount },
  { header: "Payment Status", value: (o) => o.payment?.status || "N/A" },
  { header: "Payment Method", value: (o) => o.payment?.paymentMethod },
  { header: "Transaction ID", value: (o) => o.payment?.transactionId },
  { header: "Admin Note", value: (o) => o.adminNote },
];

/** The CSV text for these orders. `event` decides which columns are included. */
export function buildOrdersCsv(
  orders: EventOrder[],
  event: { category: string; eventType: string },
): string {
  // One column per extra checkout question, read from registration.details.
  const questionColumns: Column[] = getExtraQuestions(
    event.category,
    event.eventType,
  ).map((q) => ({
    header: q.label,
    value: (o) => o.registration?.details?.[q.key],
  }));

  const columns = [
    ...COMMON_COLUMNS,
    ...(usesRaceFields(event.category) ? RACE_COLUMNS : []),
    ...questionColumns,
    ...PAYMENT_COLUMNS,
  ];

  const lines = [
    columns.map((c) => escapeCell(c.header)).join(","),
    ...orders.map((order) =>
      columns.map((c) => escapeCell(c.value(order))).join(","),
    ),
  ];

  return lines.join("\r\n");
}

/** Make the browser save `csv` as a file called `filename`. */
export function downloadCsv(filename: string, csv: string): void {
  const BOM = "﻿"; // makes Excel read it as UTF-8 (needed for ৳ and Bangla names)
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Firefox only follows a download link that is on the page.
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Free the file a moment later. Doing it right away can cancel the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
