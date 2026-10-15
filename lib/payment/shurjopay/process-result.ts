// lib/payment/shurjopay/process-result.ts
//
// What we do once we hear "something happened to ShurjoPay payment X".
// Shared by BOTH ways we hear it:
//
//   - the browser callback   app/api/payment/shurjopay/callback/route.ts
//     (the customer comes back from ShurjoPay)
//   - the IPN                app/api/payment/shurjopay/ipn/route.ts
//     (ShurjoPay's server tells us — even if the customer closed the tab)
//
// It covers flow STEPS 6–8 (see lib/payment/README.md):
//   6. ask ShurjoPay what really happened   (never trust the message itself)
//   7. confirm the order — race-safe, so callback + IPN can't both confirm
//   8. coupon usage + email + SMS            (sent once, in the background)
//
// It returns an OUTCOME instead of a response, so each caller answers in its
// own way: the callback redirects the browser to a page, the IPN replies 200.
//
// ⚠️ Not a "use server" file — called only from our own route handlers.

import { after } from "next/server";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { ChildLogger } from "@/lib/logger";
import { audit, SYSTEM } from "@/lib/audit";
import { getPaymentStatusMessage, SP_CODE, type ShurjoPayVerificationItem } from "./client";
import { verifyPayment } from "./verify";
import { confirmPaidOrder, releaseHold } from "../slot-hold";
import { runPostPaymentSteps } from "../order-confirmation";

// ─── Outcomes ─────────────────────────────────────────

/**
 * What happened to the payment, as far as our order is concerned.
 * The callback turns each one into a page; the IPN just reports it.
 */
export type PaymentOutcome =
  | { kind: "PAID"; orderId: string } // confirmed (now or earlier) → success page
  | { kind: "PAID_NO_SLOT"; orderId: string } // money taken, no slot → refund case
  | { kind: "NEEDS_REVIEW"; orderId: string } // amount/order mismatch, or unclear old session
  | { kind: "NOT_PAID"; orderId: string; reason: "cancelled" | "declined" }
  | { kind: "PENDING"; orderId: string } // not finished / ShurjoPay unsure → keep waiting
  | { kind: "UNVERIFIED" } // ShurjoPay unreachable AND we don't know the order
  | { kind: "NOT_FOUND" }; // ShurjoPay answered, but no order of ours matches

/** Everything the outcome handlers below need. */
type Context = {
  spOrderId: string; // ShurjoPay's payment id we were told about
  item: ShurjoPayVerificationItem; // what ShurjoPay told us in step 1
  payment: NonNullable<Awaited<ReturnType<typeof findPayment>>>; // our record (step 2)
  log: ChildLogger;
};

/** ShurjoPay sends amounts as strings like "1299.0000" — show them nicely. */
const fmtAmount = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("en-IN") : String(v);
};

// ════════════════════════════════════════════════════════════════════════
//  Main entry point
// ════════════════════════════════════════════════════════════════════════

/**
 * Verifies ShurjoPay payment `spOrderId` and updates our order to match.
 *
 * Safe to call any number of times for the same payment (browser refresh,
 * callback + IPN arriving together, IPN retries): only the first call that
 * confirms the payment sends the email/SMS.
 */
export async function processShurjoPayResult(spOrderId: string, log: ChildLogger): Promise<PaymentOutcome> {
  // ── 1. Ask ShurjoPay what really happened (flow STEP 6) ─────
  // verifyPayment() retries a failed/empty answer and picks the success
  // entry if ShurjoPay returns several.
  const verifyStart = Date.now();
  const verified = await verifyPayment(spOrderId, {
    attempts: 3,
    timeoutMs: 10_000,
    onRetry: (n, why) => log.warn({ attempt: n, why, spOrderId }, "external_api:verify_retry"),
  });
  log.info(
    {
      externalApi: { service: "shurjopay", operation: "verify", durationMs: Date.now() - verifyStart },
      state: verified.state,
      reason: verified.state === "UNSURE" ? verified.reason : undefined,
    },
    "external_api:verify_done",
  );

  // No clear answer (ShurjoPay down / empty reply). The customer may well
  // have paid, so NEVER call it failed: keep the order pending with its slot
  // and let the "confirming" page + background reconciler settle it.
  if (verified.state === "UNSURE" && verified.reason !== "unknown_code") {
    const pending = await prisma.payment.findFirst({
      where: { paymentId: spOrderId },
      select: { orderId: true },
    });
    log.warn({ orderId: pending?.orderId, reason: verified.reason }, "payment:unconfirmed — kept pending");
    return pending ? { kind: "PENDING", orderId: pending.orderId } : { kind: "UNVERIFIED" };
  }

  const item = verified.item!;
  log.info(
    {
      sp_code: item.sp_code,
      status: getPaymentStatusMessage(item),
      method: item.method,
      amount: item.amount,
      value1: item.value1,
    },
    "payment:verification_result",
  );

  // ── 2. Find our payment record ─────────────────────────────
  const payment = await findPayment(spOrderId, item);
  if (!payment) {
    log.error({ spOrderId, value1: item.value1 }, "db:not_found");
    return { kind: "NOT_FOUND" };
  }

  const ctx: Context = { spOrderId, item, payment, log };
  const spCode = Number(item.sp_code);

  // ── 3. Already paid? (refresh, callback + IPN, second payment) ──
  if (payment.status === "PAID") return handleAlreadyPaid(ctx, spCode);

  // ── 4. Act on ShurjoPay's result code ──────────────────────
  if (spCode === SP_CODE.SUCCESS) return handlePaid(ctx); // flow STEPS 7–8
  if (spCode === SP_CODE.CANCELLED_BY_CUSTOMER) return handleNotPaid(ctx, "cancelled");
  if (spCode === SP_CODE.DECLINED_BY_BANK) return handleNotPaid(ctx, "declined");
  return handleUnknownCode(ctx, spCode); // e.g. 1068 "initiated"
}

// ════════════════════════════════════════════════════════════════════════
//  Step 2 helpers
// ════════════════════════════════════════════════════════════════════════

/**
 * Finds our Payment row. Tries, in order:
 *   - the ShurjoPay id we saved when the payment started
 *   - value1 / customer_order_id — our Order.id, which ShurjoPay echoes back
 *     (this still finds the order if the customer paid an OLDER session)
 */
function findPayment(spOrderId: string, item: ShurjoPayVerificationItem) {
  return prisma.payment.findFirst({
    where: {
      OR: [
        { paymentId: spOrderId },
        { orderId: item.value1 },
        ...(item.customer_order_id ? [{ orderId: item.customer_order_id }] : []),
      ],
    },
    include: { order: true },
  });
}

/**
 * True when this is about an OLDER ShurjoPay session than the one we saved
 * (the customer retried and got a new session). A failure from an old session
 * must not cancel the order while the new one may still be paid.
 */
const isStaleSession = (ctx: Context) => !!ctx.payment.paymentId && ctx.payment.paymentId !== ctx.spOrderId;

// ════════════════════════════════════════════════════════════════════════
//  Outcome: the payment was already marked PAID
// ════════════════════════════════════════════════════════════════════════

/**
 * Already paid. Usually a harmless repeat (refresh, or the callback and the
 * IPN both arriving). But if a DIFFERENT session also succeeded, the customer
 * was charged twice — flag it for a refund.
 */
async function handleAlreadyPaid(ctx: Context, spCode: number): Promise<PaymentOutcome> {
  const { payment, spOrderId, item, log } = ctx;

  // 1. Second successful payment from another session → refund needed
  if (spCode === SP_CODE.SUCCESS && isStaleSession(ctx)) {
    log.error(
      {
        paymentId: payment.id,
        orderId: payment.orderId,
        keptSpOrderId: payment.paymentId,
        duplicateSpOrderId: spOrderId,
        amount: item.amount,
      },
      "payment:REFUND_REQUIRED — second successful payment for a paid order",
    );
    await audit({
      actor: SYSTEM.shurjopay,
      action: "payment.duplicate",
      entityType: "payment",
      entityId: payment.orderId,
      eventId: payment.order.eventId,
      summary: `REFUND NEEDED: second payment ${spOrderId} (৳${fmtAmount(item.amount)}) succeeded for an order already paid via ${payment.paymentId}`,
    });
  } else {
    log.warn({ paymentId: payment.id, orderId: payment.orderId }, "payment:duplicate — already PAID");
  }

  // 2. Paid but the order holds no slot (expired + sold out, or admin
  //    cancelled) → refund case
  if (payment.order.status !== "CONFIRMED") return { kind: "PAID_NO_SLOT", orderId: payment.orderId };

  // 3. Normal repeat → nothing to do, it's paid
  return { kind: "PAID", orderId: payment.orderId };
}

// ════════════════════════════════════════════════════════════════════════
//  Outcome: PAID (sp_code 1000)
// ════════════════════════════════════════════════════════════════════════

/**
 * ShurjoPay says the payment succeeded: check it matches the order, confirm
 * the order (flow STEP 7), then send email/SMS in the background (STEP 8).
 */
async function handlePaid(ctx: Context): Promise<PaymentOutcome> {
  const { payment, spOrderId, item, log } = ctx;
  log.info({ orderId: payment.orderId }, "payment:success");

  // 1. Never confirm a payment that doesn't match what we charged
  const paidAmount = Number(item.amount);
  const amountShort = Number.isFinite(paidAmount) && paidAmount < payment.amount;
  const wrongOrder = !!item.value1 && item.value1 !== payment.orderId;
  if (!Number.isFinite(paidAmount)) log.warn({ amount: item.amount }, "payment:amount_missing");

  if (amountShort || wrongOrder) {
    log.error(
      {
        paymentId: payment.id,
        orderId: payment.orderId,
        spOrderId,
        expectedAmount: payment.amount,
        paidAmount: item.amount,
        value1: item.value1,
      },
      "payment:REVIEW_REQUIRED — amount/order mismatch, not confirming",
    );
    await audit({
      actor: SYSTEM.shurjopay,
      action: "payment.amount_mismatch",
      entityType: "payment",
      entityId: payment.orderId,
      eventId: payment.order.eventId,
      summary: `NEEDS REVIEW: ${spOrderId} reported ৳${fmtAmount(item.amount)}, expected ৳${payment.amount}${wrongOrder ? ` (for order ${item.value1})` : ""}. Not confirmed.`,
      changes: { amount: [payment.amount, item.amount] },
    });
    // Keep the slot held for an admin to review; the payment stays unpaid.
    await prisma.order.updateMany({
      where: { id: payment.orderId, status: "PENDING" },
      data: { holdExpiresAt: null },
    });
    return { kind: "NEEDS_REVIEW", orderId: payment.orderId };
  }

  // 2. Mark Payment PAID + Order CONFIRMED (flow STEP 7).
  //    Race-safe: if the callback and the IPN arrive together, only one "wins".
  const transactionId = item.order_id || spOrderId;
  const outcome = await confirmPaidOrder({
    paymentId: payment.id,
    orderId: payment.orderId,
    paymentData: {
      transactionId,
      paymentMethod: item.method || "shurjopay",
      paymentGateway: "shurjopay",
      paymentId: spOrderId,
    },
  });
  log.info({ orderId: payment.orderId, outcome }, "db:confirm_paid_order");

  // 3. The other path (callback or IPN) already confirmed it → nothing more to do
  if (outcome === "ALREADY_PAID") {
    log.warn({ orderId: payment.orderId }, "payment:duplicate — lost the race, skipping notifications");
    return { kind: "PAID", orderId: payment.orderId };
  }

  // 4. Money taken but the order has no slot any more → refund needed
  if (outcome === "PAID_BUT_SOLD_OUT" || outcome === "PAID_BUT_CANCELLED") {
    log.error(
      { paymentId: payment.id, orderId: payment.orderId, spOrderId, amount: item.amount, outcome },
      "payment:REFUND_REQUIRED — paid for an order with no slot",
    );
    await audit({
      actor: SYSTEM.shurjopay,
      action: "payment.paid_no_slot",
      entityType: "payment",
      entityId: payment.orderId,
      eventId: payment.order.eventId,
      summary: `REFUND NEEDED: ${spOrderId} paid ৳${fmtAmount(item.amount)} but the order has no slot (${outcome === "PAID_BUT_SOLD_OUT" ? "hold expired and package sold out" : "order cancelled by an admin"})`,
    });
    return { kind: "PAID_NO_SLOT", orderId: payment.orderId };
  }

  // 5. Confirmed! Coupon usage + email + SMS run AFTER we've answered
  //    (Next's after()), so the customer / ShurjoPay don't wait on the
  //    SMS/email APIs (flow STEP 8).
  after(async () => {
    try {
      await runPostPaymentSteps({
        orderId: payment.orderId,
        transactionId,
        paymentMethod: item.method || undefined,
        log,
      });
    } finally {
      await log.flush();
    }
  });

  await audit({
    actor: SYSTEM.shurjopay,
    action: "payment.confirmed",
    entityType: "payment",
    entityId: payment.orderId,
    eventId: payment.order.eventId,
    summary: `Payment ${spOrderId} confirmed · ৳${fmtAmount(item.amount)}${item.method ? ` via ${item.method}` : ""}`,
    changes: { status: [payment.status, "PAID"], order: [payment.order.status, "CONFIRMED"] },
  });

  // 6. Done
  return { kind: "PAID", orderId: payment.orderId };
}

// ════════════════════════════════════════════════════════════════════════
//  Outcome: NOT PAID — cancelled (1002) or declined by the bank (1001)
// ════════════════════════════════════════════════════════════════════════

/**
 * The customer cancelled, or the bank declined. Mark the payment FAILED and
 * give the slot back right away (the customer can still retry later).
 */
async function handleNotPaid(ctx: Context, reason: "cancelled" | "declined"): Promise<PaymentOutcome> {
  const { payment, spOrderId, item, log } = ctx;

  if (reason === "declined") log.error({ orderId: payment.orderId }, "payment:declined — bank declined");
  else log.warn({ orderId: payment.orderId }, "payment:cancelled");

  // 1. A failure from an OLDER session must not touch the newer one
  if (isStaleSession(ctx)) {
    log.warn(
      { orderId: payment.orderId, spOrderId, currentSpOrderId: payment.paymentId },
      "payment:stale_session — ignoring, newer session in progress",
    );
    return { kind: "NOT_PAID", orderId: payment.orderId, reason };
  }

  // 2. Mark our payment record as FAILED
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      paymentMethod: item.method || "shurjopay",
      paymentGateway: "shurjopay",
    },
  });

  await audit({
    actor: SYSTEM.shurjopay,
    action: reason === "cancelled" ? "payment.cancelled" : "payment.declined",
    entityType: "payment",
    entityId: payment.orderId,
    eventId: payment.order.eventId,
    summary:
      reason === "cancelled"
        ? `Customer cancelled payment ${spOrderId}; slot released`
        : `Bank declined payment ${spOrderId}; slot released`,
  });

  // 3. Give the slot back now instead of waiting for the hold to expire.
  //    The order stays reclaimable if the customer retries.
  try {
    const releasedSlug = await releaseHold(payment.orderId);
    if (releasedSlug) {
      revalidateTag(`event-${releasedSlug}`, "max");
      log.info({ orderId: payment.orderId }, "slots:hold_released");
    }
  } catch (err) {
    log.error({ err, orderId: payment.orderId }, "slots:release_failed");
  }

  return { kind: "NOT_PAID", orderId: payment.orderId, reason };
}

// ════════════════════════════════════════════════════════════════════════
//  Outcome: any other code (e.g. 1068 "initiated" — not finished yet)
// ════════════════════════════════════════════════════════════════════════

/**
 * ShurjoPay returned a code we don't treat as final. Keep the order pending;
 * the IPN or the background reconciler confirms it once it's paid.
 */
async function handleUnknownCode(ctx: Context, spCode: number): Promise<PaymentOutcome> {
  const { payment, spOrderId, item, log } = ctx;
  log.error(
    { spCode, spMessage: item.sp_message, orderId: payment.orderId },
    "payment:unknown_sp_code — keeping PENDING",
  );

  // 1. Unknown answer for an OLDER session → don't touch the newer one
  if (isStaleSession(ctx)) {
    log.warn(
      { orderId: payment.orderId, spOrderId, currentSpOrderId: payment.paymentId },
      "payment:stale_session — unknown code, not touching newer session",
    );
    return { kind: "NEEDS_REVIEW", orderId: payment.orderId };
  }

  // 2. Record it and keep the payment PENDING
  await audit({
    actor: SYSTEM.shurjopay,
    action: "payment.unknown_status",
    entityType: "payment",
    entityId: payment.orderId,
    eventId: payment.order.eventId,
    summary: `ShurjoPay ${spOrderId} returned status ${spCode} (${item.sp_message || "no message"}); order kept pending and re-checked automatically`,
  });
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PENDING", paymentId: spOrderId },
  });

  return { kind: "PENDING", orderId: payment.orderId };
}

// ════════════════════════════════════════════════════════════════════════
//  Reading the ShurjoPay id from a request (callback POST + IPN)
// ════════════════════════════════════════════════════════════════════════

/**
 * ShurjoPay may send the payment id in the query string, as JSON, or as a
 * form — and calls it `sp_order_id` or `order_id`. Looks in all of them.
 *
 * Returns null if there's no id anywhere.
 */
export async function readSpOrderId(request: Request): Promise<string | null> {
  // 1. Query string: ?sp_order_id=… or ?order_id=… (ShurjoPay's IPN example)
  const query = new URL(request.url).searchParams;
  const fromQuery = query.get("sp_order_id") || query.get("order_id");
  if (fromQuery) return fromQuery;

  // 2. Body: JSON or form
  try {
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("application/json")) {
      const body = await request.json();
      return body?.sp_order_id || body?.order_id || null;
    }
    if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
      const form = await request.formData();
      const v = form.get("sp_order_id") ?? form.get("order_id");
      return typeof v === "string" && v ? v : null;
    }
  } catch {
    // Unreadable body → treat as "no id"
  }
  return null;
}
