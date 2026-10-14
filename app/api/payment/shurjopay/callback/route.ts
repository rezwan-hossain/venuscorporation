// app/api/payment/shurjopay/callback/route.ts
//
// ShurjoPay sends the customer back here after they pay (or cancel).
// This is STEP 5–8 of the payment flow (see the map at the top of
// lib/payment/shurjopay/client.ts):
//
//   GET  /api/payment/shurjopay/callback?order_id=<sp_order_id>
//   POST /api/payment/shurjopay/callback   (server notification / form post)
//
// The URL alone proves nothing — anyone can open it. So we always ask
// ShurjoPay directly what happened before changing any order.

import { NextRequest, NextResponse, after } from "next/server";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getPaymentStatusMessage, SP_CODE, type ShurjoPayVerificationItem } from "@/lib/payment/shurjopay/client";
import { verifyPayment } from "@/lib/payment/shurjopay/verify";
import { publicOrigin } from "@/lib/payment/shurjopay/config";
import { confirmPaidOrder, releaseHold } from "@/lib/payment/slot-hold";
import { runPostPaymentSteps } from "@/lib/payment/order-confirmation";
import { getRequestId } from "@/utils/requestUtils";
import { logger, type ChildLogger } from "@/lib/logger";
import { audit, SYSTEM } from "@/lib/audit";

/** ShurjoPay sends amounts as strings like "1299.0000" — show them nicely. */
const fmtAmount = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("en-IN") : String(v);
};

/** Everything the outcome handlers below need about this callback. */
type CallbackContext = {
  spOrderId: string; // ShurjoPay's payment id from the URL
  item: ShurjoPayVerificationItem; // what ShurjoPay told us in step 2
  payment: NonNullable<Awaited<ReturnType<typeof findPayment>>>; // our record (step 3)
  origin: string; // our public site address, for redirects
  log: ChildLogger;
};

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
    // ── 2. Ask ShurjoPay what really happened (flow STEP 6) ───────
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
    // have paid, so NEVER show "failed": keep the order pending with its slot
    // and let the "confirming" page + background reconciler settle it.
    if (verified.state === "UNSURE" && verified.reason !== "unknown_code") {
      const pending = await prisma.payment.findFirst({
        where: { paymentId: spOrderId },
        select: { orderId: true },
      });
      log.warn({ orderId: pending?.orderId, reason: verified.reason }, "payment:unconfirmed — sent to processing page");
      return NextResponse.redirect(
        pending
          ? `${origin}/payment/processing?orderId=${pending.orderId}`
          : `${origin}/payment/failed?reason=verification_error`,
      );
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

    // ── 3. Find our payment record ───────────────────────────────
    const payment = await findPayment(spOrderId, item);
    if (!payment) {
      log.error({ spOrderId, value1: item.value1 }, "db:not_found");
      return NextResponse.redirect(`${origin}/payment/failed?reason=payment_not_found`);
    }

    const ctx: CallbackContext = { spOrderId, item, payment, origin, log };
    const spCode = Number(item.sp_code);

    // ── 4. Already paid? (refresh, double callback, second payment) ──
    if (payment.status === "PAID") return await handleAlreadyPaid(ctx, spCode);

    // ── 5. Act on ShurjoPay's result code ────────────────────────
    let response: NextResponse;
    if (spCode === SP_CODE.SUCCESS) response = await handlePaid(ctx);
    else if (spCode === SP_CODE.CANCELLED_BY_CUSTOMER) response = await handleNotPaid(ctx, "cancelled");
    else if (spCode === SP_CODE.DECLINED_BY_BANK) response = await handleNotPaid(ctx, "declined");
    else response = await handleUnknownCode(ctx, spCode);

    log.info({ orderId: payment.orderId, durationMs: Date.now() - start }, "action:done");
    return response;
  } catch (error) {
    log.error({ err: error, durationMs: Date.now() - start }, "action:error — unhandled");
    return NextResponse.redirect(`${origin}/payment/failed?reason=server_error`);
  } finally {
    await log.flush();
  }
}

// ════════════════════════════════════════════════════════════════════════
//  Step 3 helper
// ════════════════════════════════════════════════════════════════════════

/**
 * Finds our Payment row for this callback. Tries, in order:
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
 * True when this callback is for an OLDER ShurjoPay session than the one we
 * saved (the customer retried and got a new session). A failure from an old
 * session must not cancel the order while the new one may still be paid.
 */
const isStaleSession = (ctx: CallbackContext) =>
  !!ctx.payment.paymentId && ctx.payment.paymentId !== ctx.spOrderId;

// ════════════════════════════════════════════════════════════════════════
//  Outcome: the payment was already marked PAID before this callback
// ════════════════════════════════════════════════════════════════════════

/**
 * The order was already paid. Usually a harmless repeat (page refresh, second
 * notification). But if a DIFFERENT session also succeeded, the customer was
 * charged twice — flag it for a refund.
 */
async function handleAlreadyPaid(ctx: CallbackContext, spCode: number) {
  const { payment, spOrderId, item, origin, log } = ctx;

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
    log.warn({ paymentId: payment.id, orderId: payment.orderId }, "payment:duplicate_callback — already PAID");
  }

  // 2. Paid but the order holds no slot (expired + sold out, or admin
  //    cancelled) → refund case, never the success page
  if (payment.order.status !== "CONFIRMED") {
    return NextResponse.redirect(`${origin}/payment/failed?orderId=${payment.orderId}&reason=paid_no_slot`);
  }

  // 3. Normal repeat → success page
  return NextResponse.redirect(`${origin}/payment/success?orderId=${payment.orderId}`);
}

// ════════════════════════════════════════════════════════════════════════
//  Outcome: PAID (sp_code 1000)
// ════════════════════════════════════════════════════════════════════════

/**
 * ShurjoPay says the payment succeeded: check it matches the order, confirm
 * the order (flow STEP 7), then send email/SMS in the background (STEP 8).
 */
async function handlePaid(ctx: CallbackContext) {
  const { payment, spOrderId, item, origin, log } = ctx;
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
    return NextResponse.redirect(`${origin}/payment/failed?orderId=${payment.orderId}&reason=unknown_status`);
  }

  // 2. Mark Payment PAID + Order CONFIRMED (flow STEP 7).
  //    Race-safe: if two callbacks arrive together, only one "wins".
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

  // 3. Another callback already confirmed it → just show success
  if (outcome === "ALREADY_PAID") {
    log.warn({ orderId: payment.orderId }, "payment:duplicate_callback — lost the race, skipping notifications");
    return NextResponse.redirect(`${origin}/payment/success?orderId=${payment.orderId}`);
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
    return NextResponse.redirect(`${origin}/payment/failed?orderId=${payment.orderId}&reason=paid_no_slot`);
  }

  // 5. Confirmed! Coupon usage + email + SMS run AFTER the customer has been
  //    redirected (Next's after()), so they don't wait on the SMS/email APIs
  //    (flow STEP 8).
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

  // 6. Off to the success page
  return NextResponse.redirect(`${origin}/payment/success?orderId=${payment.orderId}`);
}

// ════════════════════════════════════════════════════════════════════════
//  Outcome: NOT PAID — cancelled (1002) or declined by the bank (1001)
// ════════════════════════════════════════════════════════════════════════

/**
 * The customer cancelled, or the bank declined. Mark the payment FAILED and
 * give the slot back right away (the customer can still retry later).
 */
async function handleNotPaid(ctx: CallbackContext, kind: "cancelled" | "declined") {
  const { payment, spOrderId, item, origin, log } = ctx;
  const failedPage = `${origin}/payment/failed?orderId=${payment.orderId}&reason=${kind}`;

  if (kind === "declined") log.error({ orderId: payment.orderId }, "payment:declined — bank declined");
  else log.warn({ orderId: payment.orderId }, "payment:cancelled");

  // 1. A failure from an OLDER session must not touch the newer one
  if (isStaleSession(ctx)) {
    log.warn(
      { orderId: payment.orderId, spOrderId, currentSpOrderId: payment.paymentId },
      "payment:stale_session_callback — ignoring, newer session in progress",
    );
    return NextResponse.redirect(failedPage);
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
    action: kind === "cancelled" ? "payment.cancelled" : "payment.declined",
    entityType: "payment",
    entityId: payment.orderId,
    eventId: payment.order.eventId,
    summary:
      kind === "cancelled"
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

  // 4. Off to the "payment failed" page
  return NextResponse.redirect(failedPage);
}

// ════════════════════════════════════════════════════════════════════════
//  Outcome: any other code (e.g. 1068 "initiated" — not finished yet)
// ════════════════════════════════════════════════════════════════════════

/**
 * ShurjoPay returned a code we don't treat as final. Keep the order pending;
 * the background reconciler keeps asking and confirms it once it's paid.
 */
async function handleUnknownCode(ctx: CallbackContext, spCode: number) {
  const { payment, spOrderId, item, origin, log } = ctx;
  log.error(
    { spCode, spMessage: item.sp_message, orderId: payment.orderId },
    "payment:unknown_sp_code — keeping PENDING for manual review",
  );

  // 1. Unknown answer for an OLDER session → don't touch the newer one
  if (isStaleSession(ctx)) {
    log.warn(
      { orderId: payment.orderId, spOrderId, currentSpOrderId: payment.paymentId },
      "payment:stale_session_callback — unknown code, not touching newer session",
    );
    return NextResponse.redirect(`${origin}/payment/failed?orderId=${payment.orderId}&reason=unknown_status`);
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

  // 3. "Confirming your payment…" page — it polls until the reconciler
  //    settles the order
  return NextResponse.redirect(`${origin}/payment/processing?orderId=${payment.orderId}`);
}

// ════════════════════════════════════════════════════════════════════════
//  POST — server-to-server notification (IPN) or a form-post redirect
// ════════════════════════════════════════════════════════════════════════

/**
 * ShurjoPay may send the payment id as JSON, as a form, or only in the query
 * string. Read it from wherever it is, then handle it exactly like GET.
 */
export async function POST(request: NextRequest) {
  const log = logger.child({ requestId: await getRequestId(), action: "shurjopay:callback:post" });

  // 1. Try to read the payment id from the body
  let bodyOrderId: string | null = null;
  try {
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("application/json")) {
      const body = await request.json();
      bodyOrderId = body?.order_id || body?.sp_order_id || null;
    } else if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
      const form = await request.formData();
      const v = form.get("order_id") ?? form.get("sp_order_id");
      bodyOrderId = typeof v === "string" && v ? v : null;
    }
  } catch (err) {
    log.warn({ err }, "payment:post_callback_body_unreadable");
  }
  log.info({ hasBodyOrderId: !!bodyOrderId }, "payment:post_callback_received");
  await log.flush();

  // 2. Put it in the URL and run the normal GET handler
  const url = new URL(request.url);
  if (bodyOrderId) url.searchParams.set("order_id", bodyOrderId);
  return GET(new NextRequest(url, { method: "GET", headers: request.headers }));
}
