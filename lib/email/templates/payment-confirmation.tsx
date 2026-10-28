// lib/email/templates/payment-confirmation.tsx
//
// The "booking confirmed" email, in the Venus Corporation navy and gold.
// Returns a plain HTML string (emails can't use React or CSS files).
//
// Top to bottom:
//   1. Logo
//   2. Navy banner: heading + line under it        (admin-editable text)
//   3. Ticket card: event, BIB (marathons), booking details, the person's
//      checkout answers (other events), total paid
//   4. Message from the organiser + checklist       (admin-editable text)
//   5. Buttons, then the footer with contact details
//
// Email rules followed here: tables for layout, inline styles only, no web
// fonts (Georgia for headings), solid colours (no gradients).
//
// The admin-editable words live in lib/email-template.ts. Everything a
// person typed is escaped before it goes into the HTML.

import {
  DEFAULT_CONFIRMATION_EMAIL,
  type RenderedEmailContent,
} from "@/lib/email-template";
import { contactDetails } from "@/config/contact";

export interface PaymentConfirmationEmailProps {
  name: string;
  eventName: string;
  eventDate: string;
  eventAddress: string;
  packageName: string;
  distance: string;
  amount: number;
  orderId: string;
  orderDate: string;
  paymentStatus: string;
  transactionId?: string;
  paymentMethod?: string;
  bibNumber?: string; // marathons
  tshirtSize?: string; // in-person runs
  bloodGroup?: string; // marathons
  /** Checkout answers for other events, e.g. { label: "Company", value: "…" }. */
  answers?: { label: string; value: string }[];
  appUrl?: string;
  /** Admin-editable words, already filled in. Omit = built-in text. */
  content?: RenderedEmailContent;
}

// ─── Colours and fonts ───────────────────────────────
const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c";
const CREAM = "#faf8f3";
const TEXT = "#334155";
const MUTED = "#64748b";
const LINE = "#ece7db";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const MONO = "'SF Mono', Menlo, Consolas, monospace";

// ─── Helpers ─────────────────────────────────────────

/** Escape text for HTML: names, addresses and answers are typed by people. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain text → HTML: escaped, line breaks kept, web links clickable. */
function textToHtml(text: string): string {
  const URL_RE = /\bhttps?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]]/g;
  let html = "";
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const url = escapeHtml(match[0]);
    html += escapeHtml(text.slice(last, match.index));
    html += `<a href="${url}" style="color: ${NAVY}; text-decoration: underline; word-break: break-all;">${url}</a>`;
    last = match.index + match[0].length;
  }
  html += escapeHtml(text.slice(last));
  return html.replace(/\n/g, "<br>");
}

/** Small gold capitals, used above each section. */
function sectionLabel(text: string): string {
  return `<p style="margin: 0 0 10px 0; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${GOLD};">${text}</p>`;
}

/** One "label ……… value" line in the booking details. Skipped when empty. */
function detailLine(label: string, value?: string, mono = false): string {
  if (!value) return "";
  const font = mono ? MONO : SANS;
  return `
    <tr>
      <td style="padding: 9px 0; border-bottom: 1px solid ${LINE}; font-family: ${SANS}; font-size: 13px; color: ${MUTED};">${escapeHtml(label)}</td>
      <td align="right" style="padding: 9px 0; border-bottom: 1px solid ${LINE}; font-family: ${font}; font-size: 13px; font-weight: 600; color: ${NAVY};">${escapeHtml(value)}</td>
    </tr>`;
}

const BUILTIN_CONTENT: RenderedEmailContent = {
  subject: DEFAULT_CONFIRMATION_EMAIL.subject,
  heading: DEFAULT_CONFIRMATION_EMAIL.heading,
  subheading: DEFAULT_CONFIRMATION_EMAIL.subheading,
  message: "",
  checklist: DEFAULT_CONFIRMATION_EMAIL.checklist.split("\n"),
};

// ─── The email ───────────────────────────────────────

export function getPaymentConfirmationEmailHTML({
  name,
  eventName,
  eventDate,
  eventAddress,
  packageName,
  distance,
  amount,
  orderId,
  orderDate,
  paymentStatus,
  transactionId,
  paymentMethod,
  bibNumber,
  tshirtSize,
  bloodGroup,
  answers = [],
  appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  content = BUILTIN_CONTENT,
}: PaymentConfirmationEmailProps): string {
  const isPaid = paymentStatus === "PAID";
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  const mainPhone = contactDetails.phones[0];

  // ── 3. Ticket card pieces ──

  const bibBlock = bibNumber
    ? `
      <tr>
        <td style="padding: 0 28px 24px 28px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${CREAM}; border: 1px solid ${GOLD}; border-radius: 12px;">
            <tr>
              <td align="center" style="padding: 18px;">
                <p style="margin: 0; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${GOLD};">Your BIB number</p>
                <p style="margin: 6px 0 0 0; font-family: ${MONO}; font-size: 40px; font-weight: 700; letter-spacing: 4px; color: ${NAVY};">${escapeHtml(bibNumber)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const packageText = distance ? `${packageName} · ${distance}` : packageName;
  const bookingDetails = [
    detailLine("Name", name),
    detailLine("Package", packageText),
    detailLine("T-shirt size", tshirtSize),
    detailLine("Blood group", bloodGroup),
    detailLine("Order ID", shortOrderId, true),
    detailLine("Paid with", paymentMethod),
    detailLine("Transaction ID", transactionId, true),
    detailLine("Booked on", orderDate),
  ].join("");

  const answersBlock =
    answers.length > 0
      ? `
      <tr>
        <td style="padding: 0 28px 24px 28px;">
          ${sectionLabel("Your details")}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${answers.map((a) => detailLine(a.label, a.value)).join("")}
          </table>
        </td>
      </tr>`
      : "";

  const paidPill = isPaid
    ? `<span style="display: inline-block; margin-left: 8px; padding: 3px 10px; border-radius: 20px; background-color: #1f7a4d; font-family: ${SANS}; font-size: 11px; font-weight: 700; color: #ffffff; vertical-align: middle;">PAID</span>`
    : "";

  // ── 4. Organiser's message and checklist (admin-editable) ──

  const messageBlock = content.message
    ? `
      <tr>
        <td style="padding-top: 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-left: 4px solid ${GOLD}; border-radius: 8px;">
            <tr>
              <td style="padding: 18px 22px; font-family: ${SANS}; font-size: 14px; line-height: 1.65; color: ${TEXT};">
                ${sectionLabel("A note from the organiser")}
                ${textToHtml(content.message)}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const checklistBlock =
    content.checklist.length > 0
      ? `
      <tr>
        <td style="padding-top: 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px;">
            <tr>
              <td style="padding: 18px 22px;">
                ${sectionLabel("Before the event")}
                <table role="presentation" cellspacing="0" cellpadding="0">
                  ${content.checklist
                    .map(
                      (item) => `
                  <tr>
                    <td style="width: 22px; padding: 5px 0; vertical-align: top; font-family: ${SANS}; font-size: 14px; font-weight: 700; color: ${GOLD};">&#10003;</td>
                    <td style="padding: 5px 0; font-family: ${SANS}; font-size: 14px; line-height: 1.5; color: ${TEXT};">${escapeHtml(item)}</td>
                  </tr>`,
                    )
                    .join("")}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
      : "";

  // ── The whole email ──

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(content.subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${CREAM}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${CREAM};">
    <tr>
      <td align="center" style="padding: 32px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px;">

          <!-- 1. Logo -->
          <tr>
            <td align="center" style="padding-bottom: 22px;">
              <a href="${appUrl}" style="text-decoration: none;">
                <img src="${appUrl}/venuscorporation-logo.png" width="150" alt="Venus Corporation" style="display: block; width: 150px; height: auto; border: 0; font-family: ${SERIF}; font-size: 20px; color: ${NAVY};">
              </a>
            </td>
          </tr>

          <!-- 2. Navy banner -->
          <tr>
            <td style="background-color: ${NAVY}; border-radius: 16px 16px 0 0; border-bottom: 3px solid ${GOLD}; padding: 34px 28px 30px 28px;" align="center">
              <p style="margin: 0; font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: ${GOLD_LIGHT};">Booking confirmed</p>
              <h1 style="margin: 12px 0 0 0; font-family: ${SERIF}; font-size: 30px; font-weight: normal; line-height: 1.25; color: #ffffff;">${escapeHtml(content.heading)}</h1>
              ${
                content.subheading
                  ? `<p style="margin: 10px 0 0 0; font-family: ${SANS}; font-size: 15px; line-height: 1.55; color: #cbd2e4;">${escapeHtml(content.subheading)}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- 3. Ticket card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 0 0 16px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">

                <!-- Event -->
                <tr>
                  <td style="padding: 26px 28px 22px 28px;">
                    ${sectionLabel("Your event")}
                    <p style="margin: 0; font-family: ${SERIF}; font-size: 22px; line-height: 1.3; color: ${NAVY};">${escapeHtml(eventName)}</p>
                    <p style="margin: 10px 0 0 0; font-family: ${SANS}; font-size: 14px; line-height: 1.6; color: ${TEXT};">
                      ${escapeHtml(eventDate)}<br>
                      <span style="color: ${MUTED};">${escapeHtml(eventAddress)}</span>
                    </p>
                  </td>
                </tr>

                ${bibBlock}

                <!-- Booking details -->
                <tr>
                  <td style="padding: 0 28px 24px 28px;">
                    ${sectionLabel("Booking details")}
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${bookingDetails}
                    </table>
                  </td>
                </tr>

                ${answersBlock}

                <!-- Total: navy strip, closes the card like the banner opens it -->
                <tr>
                  <td style="background-color: ${NAVY}; border-top: 3px solid ${GOLD}; border-radius: 0 0 16px 16px; padding: 18px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-family: ${SANS}; font-size: 14px; font-weight: 600; color: #ffffff;">
                          Total paid ${paidPill}
                        </td>
                        <td align="right" style="font-family: ${SERIF}; font-size: 28px; color: ${GOLD_LIGHT};">
                          ৳${amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- 4. Message and checklist -->
          ${messageBlock}
          ${checklistBlock}

          <!-- 5. Buttons -->
          <tr>
            <td align="center" style="padding: 26px 0 34px 0;">
              <a href="${appUrl}/profile" style="display: inline-block; padding: 14px 30px; background-color: ${NAVY}; border-radius: 10px; font-family: ${SANS}; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none;">View my booking</a>
              <p style="margin: 14px 0 0 0; font-family: ${SANS}; font-size: 13px;">
                <a href="${appUrl}/events" style="color: ${NAVY}; text-decoration: underline;">Browse more events</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 34px; border-top: 1px solid ${LINE};">
              <p style="margin: 0; font-family: ${SERIF}; font-size: 16px; font-style: italic; color: ${NAVY};">
                Your Vision <span style="color: ${GOLD};">|</span> Our Expertise
              </p>
              <p style="margin: 12px 0 0 0; font-family: ${SANS}; font-size: 12px; line-height: 1.7; color: ${MUTED};">
                Questions? Call <a href="${mainPhone.href}" style="color: ${NAVY}; text-decoration: none;">${mainPhone.label}</a>
                or email <a href="mailto:${contactDetails.email}" style="color: ${NAVY}; text-decoration: none;">${contactDetails.email}</a><br>
                ${escapeHtml(contactDetails.address)}
              </p>
              <p style="margin: 14px 0 0 0; font-family: ${SANS}; font-size: 11px; color: #94a3b8;">
                Venus Corporation · This email was sent automatically, please don't reply to it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
