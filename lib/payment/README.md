# Payment flow (ShurjoPay)

How a ticket payment works, step by step, and which file does each step.

## Files

| File | What it does |
|---|---|
| `app/actions/checkout.ts` | **STEP 1** — `placeOrder()`: creates the order, holds the slot |
| `app/actions/payment.ts` | **STEPS 2–4** — `initiateShurjoPayPayment()`: starts the ShurjoPay payment |
| `lib/payment/shurjopay/client.ts` | Talks to the ShurjoPay API: token, create payment, verify |
| `lib/payment/shurjopay/verify.ts` | `verifyPayment()` — verify with retries + timeouts |
| `lib/payment/shurjopay/process-result.ts` | **STEPS 6–8** — `processShurjoPayResult()`: verify → confirm → notify (shared by callback + IPN) |
| `lib/payment/shurjopay/config.ts` | Checks the `SHURJOPAY_*` settings in `.env` |
| `app/api/payment/shurjopay/callback/route.ts` | **STEP 5 (browser)** — customer comes back from ShurjoPay → shows a page |
| `app/api/payment/shurjopay/ipn/route.ts` | **STEP 5 (server)** — ShurjoPay's server notifies us (IPN) → replies 200 |
| `lib/payment/slot-hold.ts` | **STEP 7** — `confirmPaidOrder()` (race-safe) + slot holds |
| `lib/payment/order-confirmation.ts` | **STEP 8** — `runPostPaymentSteps()`: coupon usage, email, SMS |
| `lib/payment/reconcile.ts` | **SAFETY NET** — finds paid orders nobody told us about |
| `instrumentation.ts` | Starts the reconciler (every 5 min) and the hold sweep (hourly) |

---

## Current flow (without IPN)

How it worked before IPN: we only learn about a payment when the **customer's
browser** comes back, or when the reconciler checks.

```
STEP 1  Customer submits checkout
        placeOrder()  ──────────────────────────  app/actions/checkout.ts
        → Order PENDING + Payment PENDING + slot held

STEP 2  Get token          getShurjoPayToken()       lib/payment/shurjopay/client.ts
STEP 3  Create payment     createShurjoPayPayment()  lib/payment/shurjopay/client.ts
        (both called by initiateShurjoPayPayment()   app/actions/payment.ts)
        → save sp_order_id on Payment

STEP 4  Browser → ShurjoPay checkout page → customer pays (bKash / card …)

        ┌──────────────── what happens next? ────────────────┐
        │                                                    │
   (A) Browser comes back                         (B) Browser never comes back
        │                                          (tab closed / internet lost)
        ▼                                                    │
STEP 5  GET /api/payment/shurjopay/callback                  │   …nothing happens…
        ?order_id=sp…                                        │   Order stays PENDING
        app/api/payment/shurjopay/callback/route.ts          │   No email, no SMS
        │                                                    │
STEP 6  verifyPayment() — ask ShurjoPay                      │   3–8 minutes later:
        lib/payment/shurjopay/verify.ts                      │
        │                                                    ▼
        │                                     SAFETY NET  reconcilePendingPayments()
        │                                     every 5 min lib/payment/reconcile.ts
        │                                     (from instrumentation.ts)
        │                                                    │
        │                                     STEP 6  verifyPayment() — ask ShurjoPay
        ▼                                                    ▼
STEP 7  confirmPaidOrder()  →  Payment PAID + Order CONFIRMED
        lib/payment/slot-hold.ts
        │
STEP 8  runPostPaymentSteps()  →  coupon usage + email + SMS
        lib/payment/order-confirmation.ts
        │
        ▼
(A) Customer sees /payment/success         (B) Customer gets email 3–8 min later
```

**The weak spot:** path **(B)** — anyone who closes the tab waits 3–8 minutes
for confirmation, and payments older than 3 days are never picked up
automatically.

---

## Flow with IPN

STEPS 1–4 don't change. After the customer pays, ShurjoPay's **server** also
notifies us — **in parallel** with the browser.

```
STEP 4  Customer pays on ShurjoPay
        │
        ├─────────────────────────────┬────────────────────────────────┐
        │                             │                                │
   (A) Browser comes back       (C) ShurjoPay's SERVER           (D) Neither arrived
        (if it does)                sends an IPN                     (your server was down,
        │                           (always, tab or no tab)           IPN lost …)
        ▼                             ▼                                │
STEP 5  GET /callback           POST /api/payment/shurjopay/ipn         │
        ?order_id=sp…           ?sp_order_id=sp…                        │
        callback/route.ts       ipn/route.ts                            │
        │                             │                                ▼
        │                             │                  SAFETY NET  reconciler
        │                             │                  (still there, can run less often)
        ▼                             ▼                                ▼
        └──────────── processShurjoPayResult()  (shared) ──────────────┘
                      lib/payment/shurjopay/process-result.ts
                      │
STEP 6                verifyPayment() — ask ShurjoPay (never trust the message)
                      │
STEP 7                confirmPaidOrder()  — only ONE caller wins
                      │                    the others get "ALREADY_PAID"
STEP 8                runPostPaymentSteps() — email + SMS sent ONCE
                      │
        ┌─────────────┴───────────────┐
        ▼                             ▼
(A) redirect to /payment/success   (C) reply 200 {ok:true} to ShurjoPay
```

### What changes

| | Without IPN | With IPN |
|---|---|---|
| Ways we learn about a payment | 2 — browser callback + reconciler | **3** — browser callback + **IPN** + reconciler |
| Customer closes tab after paying | Confirmed in **3–8 min** (reconciler) | Confirmed in **seconds** (IPN) |
| Payment settles days later | Missed after 3 days | IPN reports it whenever it settles |
| Duplicate emails | Prevented by `confirmPaidOrder` | Still prevented — same way |

### Why we still keep the reconciler

IPN is ShurjoPay **pushing** to us, with no documented retry. If our server is
restarting, overloaded, or the IPN URL is misconfigured, that notification is
lost. The reconciler **pulls** from ShurjoPay on our schedule, so it catches
anything IPN missed. Once IPN is proven in production, the reconciler can run
less often (every 15–30 min instead of 5).

---

## IPN setup checklist

1. Deploy (the IPN route does nothing until ShurjoPay calls it).
2. Ask ShurjoPay support to enable IPN for the merchant account, with the URL
   `https://<your-domain>/api/payment/shurjopay/ipn`
3. Test: pay in the sandbox, close the tab on the success screen → the order
   should become CONFIRMED within seconds (look for `payment:ipn_received` /
   `payment:ipn_done` in the logs).
4. Must be public **HTTPS** — IPN can't reach `localhost` (use a tunnel such as
   `cloudflared` or `ngrok` to test locally).
