// app/actions/payment.ts
//
// Starts a ShurjoPay payment for an order that placeOrder() already created.
// Covers STEPS 2–4 of the payment flow (see the map at the top of
// lib/payment/shurjopay/client.ts). Called by the checkout page and the "retry payment" page.
"use server";

import { prisma } from "@/lib/prisma";
import { getShurjoPayToken, createShurjoPayPayment } from "@/lib/payment/shurjopay/client";
import { getClientIp } from "@/lib/get-client-ip";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/utils/requestUtils";
import { newHoldExpiry, reclaimReleasedOrder } from "@/lib/payment/slot-hold";
import { checkPaymentConfig } from "@/lib/payment/shurjopay/config";
import { reconcileOrder } from "@/lib/payment/reconcile";

type InitiateResult = { success: boolean; error: string; checkoutUrl: string };

const fail = (error: string): InitiateResult => ({ success: false, error, checkoutUrl: "" });

/**
 * Opens a ShurjoPay checkout page for one order.
 *
 * Returns `checkoutUrl` — the browser redirects there and the customer pays.
 * Returns an `error` (and no URL) when paying isn't possible or safe right now.
 *
 * Safe to call again for the same order (retry): it never charges twice.
 */
export async function initiateShurjoPayPayment({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<InitiateResult> {
  const requestId = await getRequestId();
  const start = Date.now();
  const log = logger.child({ requestId, action: "initiateShurjoPayPayment", orderId });
  log.info("action:start");

  try {
    // ── 1. Check our ShurjoPay setup ─────────────────────────────
    // Refuse to take money we could never confirm (e.g. live ShurjoPay
    // sending customers back to localhost) — that's how paid orders get
    // stuck as pending.
    const config = checkPaymentConfig();
    if (config.block) {
      log.error({ configProblem: config.block }, "payment:config_invalid — refusing to start payment");
      return fail("Online payment is temporarily unavailable. Please try again later.");
    }

    // ── 2. Load the order and its payment record ─────────────────
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, package: true, event: true },
    });
    if (!order) {
      log.warn("db:not_found");
      return fail("Order not found");
    }
    if (!order.payment) {
      log.error("payment:record_missing");
      return fail("Payment record not found");
    }
    if (order.payment.status === "PAID") {
      log.warn({ paymentId: order.payment.id }, "payment:already_paid — duplicate initiation attempt");
      return fail("Order is already paid");
    }

    // ── 3. Never charge twice ────────────────────────────────────
    // If this order already had a ShurjoPay session (a retry), ask ShurjoPay
    // whether that one was actually paid (its callback may have been lost).
    // If it was, confirm it instead of opening a new payment.
    if (order.payment.paymentId) {
      const previous = await reconcileOrder(order.id, { log });
      log.info({ previous }, "payment:previous_session_checked");

      switch (previous) {
        case "CONFIRMED":
        case "ALREADY_PAID":
          return { success: true, error: "", checkoutUrl: `/payment/success?orderId=${order.id}` };
        case "PAID_NO_SLOT":
        case "NEEDS_REVIEW":
          return fail(
            "We already received a payment for this order and are checking it. Please don't pay again — contact support with your order ID.",
          );
        case "GATEWAY_ERROR":
          return fail(
            "We couldn't check your previous payment attempt just now. Please try again in a minute so you aren't charged twice.",
          );
        // NOT_PAID / NO_SESSION → safe to start a new payment, carry on.
      }
    }

    // ── 4. Make sure the order keeps its slot while the customer pays ──
    //   PENDING   → extend the hold so it can't expire mid-payment
    //   CANCELLED → if the system released it (expired / declined), take the
    //               slot back if one is still free; admin cancels are final.
    // Both updates are conditional on the status, so a background sweep
    // running at the same moment can't slip in between.
    const refreshed = await prisma.order.updateMany({
      where: { id: order.id, status: "PENDING", source: "ONLINE" },
      data: { holdExpiresAt: newHoldExpiry() },
    });

    if (refreshed.count === 0) {
      const current = await prisma.order.findUnique({
        where: { id: order.id },
        select: { status: true },
      });

      if (current?.status === "CANCELLED") {
        const reclaim = await reclaimReleasedOrder(order.id);
        log.info({ reclaim }, "slots:reclaim_attempt");
        if (reclaim === "NO_SLOTS") return fail("Sorry, your reservation expired and this package is now sold out.");
        if (reclaim === "NOT_RECLAIMABLE") return fail("This order was cancelled. Please place a new order.");
      } else if (current?.status === "CONFIRMED") {
        return fail("Order is already paid");
      }
      // PENDING manual orders fall through unchanged (they have no hold).
    }

    // ── 5. Get a ShurjoPay authentication token (flow STEP 2) ────
    let token;
    try {
      token = await getShurjoPayToken();
    } catch (err) {
      log.error({ err }, "external_api:failure — no token");
      return fail("Payment gateway unavailable. Please try again.");
    }

    // ── 6. Initiate the payment transaction (flow STEP 3) ────────
    const clientIp = await getClientIp(); // ShurjoPay asks for the customer's IP
    const payment = await createShurjoPayPayment({
      token: token.token,
      storeId: token.store_id,
      orderId: order.id,
      amount: order.payment.amount,
      customerName,
      customerEmail,
      customerPhone,
      clientIp,
    });

    if (!payment.checkout_url) {
      log.error({ spOrderId: payment.sp_order_id }, "external_api:failure — no checkout_url");
      return fail("Failed to initiate payment. Please try again.");
    }

    // ── 7. Remember ShurjoPay's id for this payment ──────────────
    // The callback, the reconciler and the sweep all find the payment by it.
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        paymentId: String(payment.sp_order_id),
        paymentMethod: "shurjopay",
        paymentGateway: "shurjopay",
      },
    });

    // ── 8. Hand the checkout page to the browser (flow STEP 4) ───
    log.info({ spOrderId: payment.sp_order_id, durationMs: Date.now() - start }, "action:success");
    return { success: true, error: "", checkoutUrl: String(payment.checkout_url) };
  } catch (error) {
    log.error({ err: error, durationMs: Date.now() - start }, "action:error");
    return fail("Failed to initiate payment. Please try again.");
  } finally {
    await log.flush();
  }
}
