// app/payment/success/page.tsx
//
// "You're in!" — shown after a paid checkout. Looks like a ticket:
//   navy top (event)  →  details  →  dashed tear line  →  total paid.
//
// Only shown for orders that are really paid + confirmed. Anything else is
// sent to the right page (processing / failed) instead of a false "success".
//
// Works for every event category: marathons show T-shirt / blood group / BIB,
// other events show their checkout answers (company, dietary needs …).

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Receipt,
  User,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { answersForEmail } from "@/lib/email-template";
import { getEventCategory, usesRaceFields } from "@/lib/event-checkout-form";
import { PurchaseTracker } from "@/components/tracking/PurchaseTracker";
import ShareButtons from "@/module/event/components/ShareButtons";

type SearchParams = Promise<{ orderId?: string }>;

const taka = (n: number) => `৳${Math.round(n).toLocaleString("en-IN")}`;

// ─── Page ───────────────────────────────────────────────

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<SuccessSkeleton />}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SuccessContent({ searchParams }: { searchParams: SearchParams }) {
  const { orderId } = await searchParams;
  if (!orderId) redirect("/events");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { event: true, package: true, registration: true, payment: true },
  });
  if (!order) redirect("/events");

  // Not actually paid + confirmed? Don't show a success page.
  const paid = order.payment?.status === "PAID";
  if (!paid && order.payment?.status === "FAILED")
    redirect(`/payment/failed?orderId=${orderId}`);
  if (!paid) redirect(`/payment/processing?orderId=${orderId}`);
  if (order.status !== "CONFIRMED")
    redirect(`/payment/failed?orderId=${orderId}&reason=paid_no_slot`);

  const { event, registration, payment } = order;
  const amount = payment?.amount ?? order.total;
  const isRace = usesRaceFields(event.category);

  // ── Rows for the details grid (empty ones are skipped) ──
  const details: Detail[] = [
    {
      icon: User,
      label: isRace ? "Runner" : "Attendee",
      value: registration?.fullName,
    },
    {
      icon: Package,
      label: "Package",
      value: order.package.name,
      sub: order.package.distance,
    },
    {
      icon: Receipt,
      label: "Order ID",
      value: order.id.slice(0, 8).toUpperCase(),
      mono: true,
    },
    {
      icon: CreditCard,
      label: "Paid with",
      value: payment?.paymentMethod,
      sub: payment?.transactionId ? `Txn ${payment.transactionId}` : null,
    },
  ];

  // Marathon fields, or the other categories' checkout answers.
  const extras = isRace
    ? [
        { label: "T-shirt size", value: registration?.tshirtSize },
        { label: "Blood group", value: registration?.bloodGroup },
        { label: "Category", value: registration?.runnerCategory },
      ]
    : answersForEmail(event.category, event.eventType, registration?.details);
  const shownExtras = extras.filter((x) => x.value);

  const showShare =
    event.status !== "COMPLETED" && event.status !== "CANCELLED";

  // For the ad / analytics pixels.
  const purchaseData = {
    orderId: order.id,
    value: amount,
    product: {
      id: String(order.package.id),
      name: event.name,
      price: amount,
      packageName: order.package.name,
      distance: order.package.distance,
    },
  };

  return (
    <Shell>
      <PurchaseTracker data={purchaseData} />

      {/* ── Big tick + heading ── */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-6 h-20 w-20">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#c49a3c]/25 [animation-iteration-count:2]" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#14245a] shadow-lg ring-4 shadow-[#14245a]/20 ring-[#c49a3c]/30">
            <Check className="h-9 w-9 text-[#dcb45c]" strokeWidth={3} />
          </span>
        </div>
        <p className="text-[11px] font-semibold tracking-[0.25em] text-[#a8852f] uppercase">
          Payment confirmed
        </p>
        <p className="mt-2 text-3xl font-semibold text-[#14245a] sm:text-4xl">
          You&apos;re in, {firstName(registration?.fullName)}!
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Your spot at <span className="font-medium text-slate-700">{event.name}</span>{" "}
          is booked.
        </p>
      </div>

      {/* ── Ticket ── */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 shadow-[#14245a]/10 ring-slate-200/70">
        {/* Navy top: event */}
        <div className="relative overflow-hidden bg-[#14245a] px-6 py-6 text-white sm:px-8">
          <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#c49a3c]/15" />
          <span className="inline-block rounded-full bg-[#c49a3c]/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#dcb45c] uppercase">
            {getEventCategory(event.category).label}
          </span>
          <p className="relative mt-3 text-xl leading-snug font-semibold sm:text-2xl">
            {event.name}
          </p>
          <div className="relative mt-3 flex flex-col gap-1.5 text-sm text-white/75 sm:flex-row sm:flex-wrap sm:gap-x-5">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0 text-[#dcb45c]" />
              {formatDate(event.date)}
            </span>
            {event.address && (
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-[#dcb45c]" />
                <span className="truncate">{event.address}</span>
              </span>
            )}
          </div>

          {/* BIB — only once one has been given out */}
          {registration?.bibNumber && (
            <div className="relative mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                Your BIB
              </span>
              <span className="font-mono text-3xl font-bold tracking-widest text-[#dcb45c]">
                {registration.bibNumber}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
          {details
            .filter((d) => d.value)
            .map((d) => (
              <DetailItem key={d.label} {...d} />
            ))}
        </div>

        {shownExtras.length > 0 && (
          <div className="mx-6 mb-6 rounded-2xl bg-[#faf8f3] px-5 py-4 sm:mx-8">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a8852f] uppercase">
              Your details
            </p>
            <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {shownExtras.map((x) => (
                <div key={x.label} className="flex justify-between gap-3 text-sm">
                  <dt className="text-slate-500">{x.label}</dt>
                  <dd className="truncate font-medium text-[#14245a]">{x.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Tear line (the half-circles look like a ticket stub) */}
        <div className="relative h-0">
          <span className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-[#faf8f3]" />
          <span className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-[#faf8f3]" />
          <div className="mx-6 border-t-2 border-dashed border-slate-200" />
        </div>

        {/* Total */}
        <div className="flex items-end justify-between gap-4 px-6 py-5 sm:px-8">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Total paid
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {order.qty > 1 ? `${order.qty} tickets · ` : ""}
              {formatDateTime(order.createdAt)}
              {order.discount > 0 && ` · ${taka(order.discount)} off`}
            </p>
          </div>
          <p className="text-3xl font-bold text-[#14245a] tabular-nums">
            {taka(amount)}
          </p>
        </div>
      </div>

      {/* ── Email note ── */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-200/70">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faf8f3] text-[#c49a3c]">
          <Mail className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#14245a]">
            Confirmation sent to {registration?.email || "your email"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Can&apos;t see it in a few minutes? Check your spam or promotions
            folder.
          </p>
        </div>
      </div>

      {/* ── Bring a friend (tracked as shares after paying) ── */}
      {showShare && (
        <ShareButtons
          slug={event.slug}
          eventName={event.name}
          place="paid"
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL}
          variant="compact"
          title={isRace ? "Bring your running buddies 🏃" : "Bring a friend"}
          subtitle="Tell your friends you're going — it's better together."
          className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70"
        />
      )}

      {/* ── Buttons ── */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14245a] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#14245a]/15 transition hover:bg-[#1c3175]"
        >
          Go to my dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/events"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-[#14245a] transition hover:border-[#c49a3c]"
        >
          Browse more events
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Questions about your booking?{" "}
        <Link
          href="/contact"
          className="font-medium text-[#a8852f] underline underline-offset-2 hover:text-[#14245a]"
        >
          Contact us
        </Link>{" "}
        with order ID{" "}
        <span className="font-mono text-slate-500">
          {order.id.slice(0, 8).toUpperCase()}
        </span>
      </p>
    </Shell>
  );
}

// ─── Small pieces ───────────────────────────────────────

type Detail = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  sub?: string | null;
  mono?: boolean;
};

function DetailItem({ icon: Icon, label, value, sub, mono }: Detail) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faf8f3] text-[#c49a3c]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-sm font-semibold text-[#14245a] capitalize ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
        {sub && <p className="truncate text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

/** Page background + centred column, shared by the page and its skeleton. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf8f3] px-4 pt-32 pb-16 sm:pt-36">
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </div>
  );
}

function SuccessSkeleton() {
  return (
    <Shell>
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-6 h-20 w-20 animate-pulse rounded-full bg-[#14245a]/15" />
        <div className="h-3 w-32 animate-pulse rounded bg-[#c49a3c]/20" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70">
        <div className="h-36 animate-pulse bg-[#14245a]/80" />
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-[#faf8f3]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t-2 border-dashed border-slate-100 p-6">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-28 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </Shell>
  );
}

// ─── Helpers ────────────────────────────────────────────

function firstName(fullName?: string | null) {
  return fullName?.trim().split(/\s+/)[0] || "friend";
}

// Dates are shown in Dhaka time so the server's timezone doesn't matter.
function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });
}
