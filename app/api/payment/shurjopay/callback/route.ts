// app/api/payment/shurjopay/callback/route.ts
//
// BROWSER CALLBACK — ShurjoPay sends the CUSTOMER back here after they pay
// (or cancel). Flow STEP 5 (see lib/payment/README.md).
//
//   GET  /api/payment/shurjopay/callback?order_id=<sp_order_id>
//   POST /api/payment/shurjopay/callback   (same, as a form / JSON post)
//
// The actual work (verify with ShurjoPay, confirm the order, email/SMS) lives
// in processShurjoPayResult() — shared with the IPN route. This file only
// decides which PAGE to show the customer.
//
// The URL alone proves nothing — anyone can open it. processShurjoPayResult()
// always asks ShurjoPay directly before changing any order.

import { NextRequest, NextResponse } from "next/server";

import { publicOrigin } from "@/lib/payment/shurjopay/config";
import {
  processShurjoPayResult,
  readSpOrderId,
  type PaymentOutcome,
} from "@/lib/payment/shurjopay/process-result";
import { getRequestId } from "@/utils/requestUtils";
import { logger } from "@/lib/logger";

// ════════════════════════════════════════════════════════════════════════
//  GET — the customer's browser arrives here from ShurjoPay
// ════════════════════════════════════════════════════════════════════════

/**
 * Handles the customer coming back from ShurjoPay and sends them on to the
 * success, failed or "still confirming" page.
 */
export async function GET(request: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);

  // Public site address, not request.url — behind a proxy request.url can be
  // http://localhost:3000, which would strand the customer after paying.
  const origin = publicOrigin(request.url);

  // ── 1. Read ShurjoPay's payment id from the URL ─────────────
  // ShurjoPay has used different names for it, so accept all of them.
  const spOrderId =
    searchParams.get("order_id") || searchParams.get("sp_order_id") || searchParams.get("orderId");

  const log = logger.child({ requestId: await getRequestId(), action: "shurjopay:callback", spOrderId });
  log.info(
    { params: { order_id: searchParams.get("order_id"), sp_order_id: searchParams.get("sp_order_id") } },
    "payment:callback_received",
  );

  if (!spOrderId) {
    log.error("payment:callback — missing order_id param");
    return NextResponse.redirect(`${origin}/payment/failed?reason=missing_order`);
  }

  try {
    // ── 2. Verify with ShurjoPay + update the order (flow STEPS 6–8) ──
    const outcome = await processShurjoPayResult(spOrderId, log);
    log.info({ outcome, durationMs: Date.now() - start }, "action:done");

    // ── 3. Send the customer to the matching page ────────────────
    return NextResponse.redirect(pageFor(outcome, origin));
  } catch (error) {
    log.error({ err: error, durationMs: Date.now() - start }, "action:error — unhandled");
    return NextResponse.redirect(`${origin}/payment/failed?reason=server_error`);
  } finally {
    await log.flush();
  }
}

/** Which page the customer should land on for each outcome. */
function pageFor(outcome: PaymentOutcome, origin: string): string {
  switch (outcome.kind) {
    case "PAID":
      return `${origin}/payment/success?orderId=${outcome.orderId}`;
    case "PAID_NO_SLOT":
      return `${origin}/payment/failed?orderId=${outcome.orderId}&reason=paid_no_slot`;
    case "NEEDS_REVIEW":
      return `${origin}/payment/failed?orderId=${outcome.orderId}&reason=unknown_status`;
    case "NOT_PAID":
      return `${origin}/payment/failed?orderId=${outcome.orderId}&reason=${outcome.reason}`;
    case "PENDING": // "Confirming your payment…" — polls until it's settled
      return `${origin}/payment/processing?orderId=${outcome.orderId}`;
    case "UNVERIFIED":
      return `${origin}/payment/failed?reason=verification_error`;
    case "NOT_FOUND":
      return `${origin}/payment/failed?reason=payment_not_found`;
  }
}

// ════════════════════════════════════════════════════════════════════════
//  POST — the same callback, sent as a form or JSON post
// ════════════════════════════════════════════════════════════════════════

/**
 * Some ShurjoPay flows post the payment id instead of putting it in the URL.
 * Read it from wherever it is, then handle it exactly like GET.
 *
 * (ShurjoPay's server-to-server notifications go to the separate IPN route:
 * app/api/payment/shurjopay/ipn/route.ts.)
 */
export async function POST(request: NextRequest) {
  // 1. Find the payment id (query string, JSON or form body)
  const spOrderId = await readSpOrderId(request);

  // 2. Put it in the URL and run the normal GET handler
  const url = new URL(request.url);
  if (spOrderId) url.searchParams.set("order_id", spOrderId);
  return GET(new NextRequest(url, { method: "GET", headers: request.headers }));
}
