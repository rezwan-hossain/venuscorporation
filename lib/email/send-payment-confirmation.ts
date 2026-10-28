// lib/email/send-payment-confirmation.ts
//
// Sends the "booking confirmed" email through Resend. The HTML comes from
// templates/payment-confirmation.tsx; this file formats the dates and sends.

import { Resend } from "resend";
import {
  getPaymentConfirmationEmailHTML,
  type PaymentConfirmationEmailProps,
} from "./templates/payment-confirmation";

type SendProps = Omit<
  PaymentConfirmationEmailProps,
  "eventDate" | "orderDate" | "appUrl"
> & {
  to: string;
  eventDate: string | Date;
  orderDate: string | Date;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentConfirmationEmail({
  to,
  eventDate,
  orderDate,
  ...details
}: SendProps) {
  try {
    const html = getPaymentConfirmationEmailHTML({
      ...details,
      // "Saturday, 22 November 2026". Event dates are stored as UTC midnight.
      eventDate: new Date(eventDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      // "4 Oct 2026, 10:30" in Bangladesh time
      orderDate: new Date(orderDate).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Dhaka",
      }),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    });

    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_ORDER_CONFIRMATION_FROM_EMAIL ||
        "Venus Corporation <info@venuscorporation.org>",
      to: [to],
      subject:
        details.content?.subject || `Booking confirmed: ${details.eventName}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Confirmation email sent:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
