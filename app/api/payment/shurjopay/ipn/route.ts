// app/api/payment/shurjopay/ipn/route.ts
//
// IPN — Instant Payment Notification.
//
// ShurjoPay's SERVER calls this when a payment's status changes — even when
// the customer closed the tab or lost their connection after paying, so the
// browser callback never arrived. Without it, those orders wait for the
// background reconciler (3–8 minutes). See lib/payment/README.md for the
// full flow ("Flow with IPN").
//
//   POST /api/payment/shurjopay/ipn?sp_order_id=<id>
//   (the id may also come as order_id, or in a JSON / form body)
//
// Setup: give ShurjoPay this URL (https://<your-domain>/api/payment/shurjopay/ipn)
// and ask them to enable IPN for the merchant account. It must be public
// HTTPS — IPN can't reach localhost.
//
// Security: ShurjoPay doesn't sign IPN requests, so anyone could call this
// URL. That's fine: we never trust the request itself — processShurjoPayResult()
// asks ShurjoPay's verification API before changing anything, exactly like
// the browser callback. A fake id is simply not found / not paid.
//
// Callback + IPN for the same payment are safe together: confirmPaidOrder()
// lets only one of them confirm the order and send the email/SMS.

import { NextRequest, NextResponse } from "next/server";

import { processShurjoPayResult, readSpOrderId } from "@/lib/payment/shurjopay/process-result";
import { getRequestId } from "@/utils/requestUtils";
import { logger } from "@/lib/logger";

/**
 * Receives a ShurjoPay IPN, verifies the payment and updates the order.
 *
 * Replies (to ShurjoPay's server, not a browser — so no redirects):
 *   200 { ok: true,  status }  handled (whatever the payment's status is)
 *   400 { ok: false, error }   no payment id in the request
 *   500 { ok: false, error }   something broke on our side — ShurjoPay may
 *                              retry, and the reconciler catches it anyway
 */
async function handleIpn(request: NextRequest) {
  const start = Date.now();
  const log = logger.child({ requestId: await getRequestId(), action: "shurjopay:ipn" });

  try {
    // ── 1. Read ShurjoPay's payment id ───────────────────────────
    // Query string (?sp_order_id=… — ShurjoPay's own example), JSON or form.
    const spOrderId = await readSpOrderId(request);
    log.info({ spOrderId }, "payment:ipn_received");

    if (!spOrderId) {
      log.warn("payment:ipn — missing sp_order_id");
      return NextResponse.json({ ok: false, error: "missing sp_order_id" }, { status: 400 });
    }

    // ── 2. Verify with ShurjoPay + update the order (flow STEPS 6–8) ──
    // Same code as the browser callback. If the callback already handled
    // this payment, this just sees "already paid" and does nothing.
    const outcome = await processShurjoPayResult(spOrderId, log.child({ spOrderId }));
    log.info({ spOrderId, outcome, durationMs: Date.now() - start }, "payment:ipn_done");

    // ── 3. Tell ShurjoPay we got it ──────────────────────────────
    // Only the status word — no order id or customer details, since anyone
    // can call this URL.
    return NextResponse.json({ ok: true, status: outcome.kind });
  } catch (error) {
    log.error({ err: error, durationMs: Date.now() - start }, "payment:ipn_error");
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  } finally {
    await log.flush();
  }
}

// ShurjoPay's example posts the id; accept GET too in case it's sent as a
// plain URL hit. Both do exactly the same.
export const POST = handleIpn;
export const GET = handleIpn;
