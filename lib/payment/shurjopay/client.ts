// lib/shurjopay.ts
//
// The ShurjoPay client — the ONLY file that talks to the ShurjoPay API.
// (Replaces the old lib/shurjopay2.ts and lib/surjopay/ folder.)
//
// ════════════════════════════════════════════════════════════════════════
//  THE WHOLE PAYMENT FLOW (which file does each step)
// ════════════════════════════════════════════════════════════════════════
//
//  STEP 1  Customer fills the checkout form
//          → placeOrder()              app/actions/checkout.ts
//            creates Order + Registration + Payment(PENDING) and holds a slot
//
//  STEP 2  Get a ShurjoPay authentication token
//          → getShurjoPayToken()       this file
//
//  STEP 3  Initiate the payment transaction (ask ShurjoPay for a checkout page)
//          → createShurjoPayPayment()  this file
//            called by initiateShurjoPayPayment() in app/actions/payment.ts
//
//  STEP 4  Redirect the customer to ShurjoPay's checkout_url — they pay there
//          (bKash / Nagad / card ...). This happens in the browser.
//
//  STEP 5  ShurjoPay sends the customer back to our callback URL
//          → GET /api/payment/shurjopay/callback?order_id=<sp_order_id>
//            app/api/payment/shurjopay/callback/route.ts
//
//  STEP 6  Verify the payment with ShurjoPay (never trust the redirect alone)
//          → verifyPayment()           lib/payment-verify.ts (retries, timeouts)
//            which calls verifyShurjoPayPayment() in this file
//
//  STEP 7  Paid? Mark Payment PAID + Order CONFIRMED (race-safe)
//          → confirmPaidOrder()        lib/slot-hold.ts
//
//  STEP 8  Record coupon usage, send confirmation email + SMS
//          → runPostPaymentSteps()     lib/order-confirmation.ts
//
//  SAFETY NET (if the customer never comes back to STEP 5):
//          → reconcilePendingPayments()  lib/payment-reconcile.ts (every 5 min)
//          → releaseExpiredHolds()       lib/slot-hold.ts (hourly sweep)
//            both started from instrumentation.ts
//
// ════════════════════════════════════════════════════════════════════════
//
// ShurjoPay result codes (sp_code) — the only field that says what happened:
//   1000 = success   1001 = declined by bank   1002 = cancelled by customer
//   anything else (e.g. 1068 "initiated") = not finished / unknown
//
// ⚠️ Server-only: uses the store password. Never import from client components.

import axios from "axios";

// ─── Settings (from .env) ─────────────────────────────

const BASE_URL = process.env.SHURJOPAY_API_URL!; // sandbox or live engine URL
const USERNAME = process.env.SHURJOPAY_USERNAME!;
const PASSWORD = process.env.SHURJOPAY_PASSWORD!;
const CALLBACK_URL = process.env.SHURJOPAY_CALLBACK_URL!; // our STEP 5 route
const PREFIX = process.env.SHURJOPAY_PREFIX || "RRN"; // prefix for sp_order_id

// One HTTP client for every call. The timeout stops a slow or dead gateway
// from hanging the customer's request forever.
const http = axios.create({
  baseURL: BASE_URL,
  timeout: 50_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Result codes ─────────────────────────────────────

export const SP_CODE = {
  SUCCESS: 1000,
  DECLINED_BY_BANK: 1001,
  CANCELLED_BY_CUSTOMER: 1002,
} as const;

// ─── Types (what ShurjoPay sends back) ────────────────

/** STEP 2 answer: the token we must send with every other request. */
export interface ShurjoPayTokenResponse {
  token: string;
  store_id: number;
  execute_url: string;
  token_type: string;
  sp_code: string | number;
  message: string;
}

/** STEP 3 answer: where to send the customer to pay. */
export interface ShurjoPayPaymentResponse {
  checkout_url: string; // ShurjoPay's payment page — redirect the customer here
  amount: number;
  currency: string;
  sp_order_id: string; // ShurjoPay's id for this payment — we save it
  customer_order_id: string;
  sp_code: string | number;
  message: string;
  transactionStatus: string;
}

/** STEP 6 answer: the real status of a payment. */
export interface ShurjoPayVerificationItem {
  id: number;
  order_id: string; // ShurjoPay's payment id (same as sp_order_id)
  currency: string;
  amount: number;
  payable_amount: number;
  discount_amount: number;
  disc_percent: number;
  received_amount: number;
  usd_amt: number;
  usd_rate: number;
  method: string; // bKash, Nagad, card ...
  sp_code: number; // ← the result: see SP_CODE above
  sp_message: string;
  name: string;
  email: string;
  address: string;
  city: string;
  value1: string; // our Order.id (we send it in STEP 3, it comes back here)
  value2: string;
  value3: string;
  value4: string;
  // Not in the official docs, but the sandbox sometimes sends them:
  bank_status?: string;
  transaction_status?: string;
  bank_trx_id?: string;
  invoice_no?: string;
  customer_order_id?: string;
  date_time?: string;
}

/** Turns an axios failure into a short, readable error. */
function gatewayError(step: string, error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? (error.code === "ECONNABORTED" ? "timeout" : "no response");
    return new Error(`ShurjoPay ${step} failed (${status})`);
  }
  return error instanceof Error ? error : new Error(`ShurjoPay ${step} failed`);
}

// ─── STEP 2: Get an authentication token ──────────────

/**
 * Logs in to ShurjoPay with our merchant username/password and returns a
 * token. Every other ShurjoPay request must carry this token.
 *
 * @throws if ShurjoPay can't be reached or doesn't return a token.
 */
export async function getShurjoPayToken(): Promise<ShurjoPayTokenResponse> {
  try {
    // 2.1 Send our merchant credentials
    const { data } = await http.post<ShurjoPayTokenResponse>("/api/get_token", {
      username: USERNAME,
      password: PASSWORD,
    });

    // 2.2 No token = wrong credentials or ShurjoPay problem → stop here
    if (!data.token) {
      throw new Error(`ShurjoPay returned no token: ${data.message || "unknown reason"}`);
    }

    // 2.3 Token + store_id are needed for STEP 3
    console.log("🔑 ShurjoPay token received", { store_id: data.store_id });
    return data;
  } catch (error) {
    throw gatewayError("get token", error);
  }
}

// ─── STEP 3: Initiate the payment transaction ─────────

/**
 * Asks ShurjoPay to open a payment for one of our orders and returns the
 * checkout page URL to send the customer to.
 *
 * We send our Order.id twice — as order_id and as value1 — so that whatever
 * comes back later (STEP 5/6) can always be matched to the right order.
 *
 * @throws if ShurjoPay can't be reached or rejects the request.
 */
export async function createShurjoPayPayment(input: {
  token: string; // from STEP 2
  storeId: number; // from STEP 2
  orderId: string; // our Order.id
  amount: number; // BDT to charge
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  clientIp?: string;
}): Promise<ShurjoPayPaymentResponse> {
  // 3.1 Build the payment request
  const payload = {
    prefix: PREFIX,
    token: input.token,
    store_id: input.storeId,

    // Where ShurjoPay sends the customer afterwards (paid OR cancelled) → STEP 5
    return_url: CALLBACK_URL,
    cancel_url: CALLBACK_URL,

    // What to charge
    amount: input.amount,
    currency: "BDT",
    discount_amount: 0, // our discounts are already in `amount`
    disc_percent: 0,

    // Which order this is (comes back in the verify answer)
    order_id: input.orderId,
    value1: input.orderId,
    value2: "",
    value3: "",
    value4: "",

    // Customer details (required by ShurjoPay)
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail,
    customer_address: input.customerAddress || "Dhaka",
    customer_city: input.customerCity || "Dhaka",
    client_ip: input.clientIp || "127.0.0.1",
  };

  try {
    // 3.2 Send it, signed with the token from STEP 2
    const { data } = await http.post<ShurjoPayPaymentResponse>("/api/secret-pay", payload, {
      headers: { Authorization: `Bearer ${input.token}` },
    });

    // 3.3 The answer holds checkout_url (STEP 4) and sp_order_id (we save it)
    console.log("💳 ShurjoPay payment created", {
      orderId: input.orderId,
      amount: input.amount,
      sp_order_id: data.sp_order_id,
      has_checkout_url: !!data.checkout_url,
    });
    return data;
  } catch (error) {
    throw gatewayError("create payment", error);
  }
}

// ─── STEP 6: Verify the payment ───────────────────────

/**
 * Asks ShurjoPay for the real status of a payment.
 *
 * This is the ONLY trustworthy proof of payment — the browser redirect in
 * STEP 5 could be faked or replayed. Use lib/payment-verify.ts → verifyPayment()
 * rather than calling this directly: it adds retries and picks the right entry.
 *
 * @param spOrderId ShurjoPay's payment id (saved in Payment.paymentId)
 * @returns the payment attempts ShurjoPay knows about (usually one)
 * @throws if ShurjoPay can't be reached.
 */
export async function verifyShurjoPayPayment(
  spOrderId: string,
): Promise<ShurjoPayVerificationItem[]> {
  // 6.1 Every request needs a fresh token (STEP 2)
  const { token } = await getShurjoPayToken();

  try {
    // 6.2 Ask for the payment's status
    const { data } = await http.post(
      "/api/verification",
      { order_id: spOrderId },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    // 6.3 ShurjoPay doesn't always use the same shape — accept all three:
    //     [ {...} ]  or  { data: [ {...} ] }  or  { ... } (a single object)
    let items: ShurjoPayVerificationItem[];
    if (Array.isArray(data)) items = data;
    else if (Array.isArray(data?.data)) items = data.data;
    else if (data && typeof data === "object" && data.order_id) items = [data];
    else items = [];

    // 6.4 Log the outcome only (no customer names/phones in logs)
    console.log("🔍 ShurjoPay verify", {
      spOrderId,
      count: items.length,
      sp_code: items[0]?.sp_code,
      method: items[0]?.method,
      amount: items[0]?.amount,
    });
    return items;
  } catch (error) {
    throw gatewayError("verify payment", error);
  }
}

// ─── Helper: readable status ──────────────────────────

/** Turns an sp_code into a human-readable message (for logs and audits). */
export function getPaymentStatusMessage(item: ShurjoPayVerificationItem): string {
  switch (Number(item.sp_code)) {
    case SP_CODE.SUCCESS:
      return "Payment successful";
    case SP_CODE.DECLINED_BY_BANK:
      return "Transaction declined by bank";
    case SP_CODE.CANCELLED_BY_CUSTOMER:
      return "Transaction cancelled by customer";
    default:
      return item.sp_message || `Unknown status (code: ${item.sp_code})`;
  }
}
