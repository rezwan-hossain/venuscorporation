// module/dashboard/components/MyRegistrations.tsx
//
// The user's registrations as ticket-style cards: photo with a date badge ·
// perforated tear line · details (event, package, name, amount, status).
// "Pay now" on pending orders; days-left countdown on confirmed ones.

import type { DashboardOrder } from "@/types/dashboard";
import Link from "next/link";
import { ChevronRight, CreditCard, MapPin, Ticket, User } from "lucide-react";

type MyRegistrationsProps = {
  orders: DashboardOrder[];
  variant: "upcoming" | "pending" | "all";
};

const SERIF = { fontFamily: "var(--font-dashboard-serif)" } as const;

export function MyRegistrations({ orders, variant }: MyRegistrationsProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <RegistrationCard key={order.id} order={order} variant={variant} />
      ))}
    </div>
  );
}

function RegistrationCard({ order, variant }: { order: DashboardOrder; variant: string }) {
  const eventDate = new Date(order.event.date);
  const now = new Date();
  const isPast = eventDate < now;
  const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const amount = order.payment?.amount ?? order.package.price;

  return (
    <Link
      href={`/events/${order.event.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#c49a3c]/20 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#c49a3c]/40 hover:shadow-xl hover:shadow-[#14245a]/10"
    >
      <div className="flex flex-col sm:flex-row">
        {/* ── Photo + date badge ── */}
        <div className="relative h-40 w-full shrink-0 overflow-hidden bg-[#14245a] sm:h-auto sm:w-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.event.bannerImage}
            alt=""
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${isPast ? "grayscale" : ""}`}
          />
          <span aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0d1840]/60 to-transparent" />
          <span className="absolute top-3 left-3 flex flex-col items-center rounded-xl bg-white/95 px-3 py-1.5 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-widest text-[#a8852f] uppercase">
              {eventDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}
            </span>
            <span className="text-2xl leading-none font-semibold text-[#14245a] lining-nums" style={SERIF}>
              {eventDate.toLocaleDateString("en-US", { day: "2-digit", timeZone: "UTC" })}
            </span>
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-[#0d1840]/60 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.15em] text-white uppercase backdrop-blur">
            {order.event.eventType === "VIRTUAL" ? "Virtual" : "In person"}
          </span>
        </div>

        {/* ── Perforated tear line (desktop) ── */}
        <span aria-hidden className="hidden border-l-2 border-dashed border-[#c49a3c]/30 sm:block" />

        {/* ── Details ── */}
        <div className="min-w-0 flex-1 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-2xl leading-tight font-semibold text-[#14245a]" style={SERIF}>
                {order.event.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#c49a3c]" aria-hidden />
                <span className="truncate">{order.event.address}</span>
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <StatusBadge status={order.status} />
              {order.payment && order.payment.status !== order.status && <StatusBadge status={order.payment.status} payment />}
            </div>
          </div>

          {/* Package · name · amount */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c49a3c]/40 bg-[#faf8f3] px-3 py-1 text-xs font-semibold text-[#14245a]">
              <Ticket className="h-3.5 w-3.5 text-[#c49a3c]" aria-hidden />
              {order.package.name} · {order.package.distance}
            </span>
            {order.registration?.fullName && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <User className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                {order.registration.fullName}
              </span>
            )}
            {order.registration?.tshirtSize && (
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">T-shirt: {order.registration.tshirtSize}</span>
            )}
            {order.registration?.bibNumber && (
              <span className="rounded-full bg-[#14245a] px-3 py-1 text-xs text-[#dcb45c]">
                BIB <span className="font-mono font-semibold">{order.registration.bibNumber}</span>
              </span>
            )}
          </div>

          {/* Bottom row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#c49a3c]/15 pt-4">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <CreditCard className="h-4 w-4 text-[#c49a3c]" aria-hidden />
              <span className="text-xl font-semibold text-[#14245a] lining-nums" style={SERIF}>
                ৳{amount.toLocaleString("en-IN")}
              </span>
              {order.payment?.transactionId && <span className="hidden font-mono text-[11px] text-slate-400 sm:inline">· {order.payment.transactionId}</span>}
            </p>

            <div className="flex items-center gap-3">
              {!isPast && order.status === "CONFIRMED" && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {daysUntil <= 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days to go`}
                </span>
              )}

              {variant === "pending" && order.payment?.status !== "PAID" && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/payment/retry?orderId=${order.id}`;
                  }}
                  className="cursor-pointer rounded-full bg-[#dcb45c] px-5 py-2 text-xs font-semibold tracking-wide text-[#0d1840] shadow-sm transition hover:brightness-105 active:scale-95"
                >
                  Pay now
                </button>
              )}

              <ChevronRight className="h-4 w-4 text-[#c49a3c] transition-transform group-hover:translate-x-0.5" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status, payment = false }: { status: string; payment?: boolean }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    CANCELLED: "bg-red-50 text-red-700 ring-red-200",
    FAILED: "bg-red-50 text-red-700 ring-red-200",
    REFUNDED: "bg-sky-50 text-sky-700 ring-sky-200",
  };
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${styles[status] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}>
      {payment ? `Payment: ${label.toLowerCase()}` : label}
    </span>
  );
}
