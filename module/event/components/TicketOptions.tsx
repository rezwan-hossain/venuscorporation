// module/event/components/TicketOptions.tsx
//
// One ticket-shaped card per package, each linking straight to checkout.
// Replaces the dropdown in TicketSelector. Server component: no client JS.
// Styled to sit between the dark CountdownTimer and the bordered EventInfoCard.

import Link from "next/link";
import type { EventPackage } from "@/types/event";
import styles from "./TicketOptions.module.css";
import PlayWhenVisible from "./PlayWhenVisible";

type TicketOptionsProps = {
  packages: EventPackage[];
  eventId: string;
  eventStatus: string;
};

// Width of the price stub; the notches sit on the line between the two parts.
const STUB = "8.25rem";
const NOTCH = "0.75rem";

// Cuts two half-circle notches out of the ticket (top and bottom of the tear
// line). A mask keeps them see-through, so the card behind shows through.
const notchMask = [
  `radial-gradient(circle ${NOTCH} at calc(100% - ${STUB}) 0, transparent 98%, #000) top / 100% 51% no-repeat`,
  `radial-gradient(circle ${NOTCH} at calc(100% - ${STUB}) 100%, transparent 98%, #000) bottom / 100% 51% no-repeat`,
].join(", ");

const LOW_STOCK = 10;

const formatPrice = (price: number) => `৳${price.toLocaleString("en-IN")}`;

// The big label is usually a short race distance ("5K"), but can be a longer
// pass name ("Day + networking"). Shrink it as it gets longer so it always fits.
const labelSize = (label: string) =>
  label.length <= 5
    ? "text-[3.25rem] leading-none"
    : label.length <= 10
      ? "text-[2.25rem] leading-none"
      : "text-[1.75rem] leading-[1.05] line-clamp-2 text-balance";

export default function TicketOptions({
  packages,
  eventId,
  eventStatus,
}: TicketOptionsProps) {
  const tickets = packages.filter((p) => !p.isArchived);
  const isClosed = eventStatus === "COMPLETED" || eventStatus === "CANCELLED";
  const fromPrice = tickets.length
    ? Math.min(...tickets.map((p) => p.price))
    : null;

  return (
    <section
      aria-labelledby="tickets-heading"
      className="border border-gray-200 rounded-lg p-4 lg:p-6"
    >
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-neutral-900 pb-4">
        <h3
          id="tickets-heading"
          className="text-2xl lg:text-3xl tracking-wide uppercase"
        >
          Tickets
        </h3>
        {fromPrice !== null && !isClosed && tickets.length > 1 && (
          <p className="text-xs text-gray-500 pb-1">
            From{" "}
            <span className="font-semibold text-neutral-900">
              {formatPrice(fromPrice)}
            </span>
          </p>
        )}
      </div>

      {tickets.length === 0 ? (
        <p className="text-sm text-gray-500">
          Tickets for this event aren&apos;t on sale yet.
        </p>
      ) : (
        <PlayWhenVisible playClassName={styles.play}>
          <ul className="space-y-3">
            {tickets.map((pkg, i) => (
              <li key={pkg.id}>
                <TicketCard
                  pkg={pkg}
                  eventId={eventId}
                  closed={isClosed}
                  index={i}
                />
              </li>
            ))}
          </ul>
        </PlayWhenVisible>
      )}

      {tickets.length > 0 && (
        <p className="text-center text-xs text-gray-500 mt-5">
          {isClosed
            ? "Registration for this event is closed."
            : "1 ticket per transaction · Tap a ticket to register"}
        </p>
      )}
    </section>
  );
}

function TicketCard({
  pkg,
  eventId,
  closed,
  index,
}: {
  pkg: EventPackage;
  eventId: string;
  closed: boolean;
  index: number;
}) {
  const slotsLeft = Math.max(0, pkg.availableSlots - pkg.usedSlots);
  const soldOut = slotsLeft === 0;
  const unavailable = soldOut || closed;
  const lowStock = !unavailable && slotsLeft <= LOW_STOCK;

  const href = `/checkout?${new URLSearchParams({
    package: String(pkg.id),
    event: eventId,
    qty: "1",
  })}`;

  const body = (
    <div
      className={`relative flex min-h-[7.5rem] overflow-hidden rounded-xl ${
        unavailable ? "bg-neutral-200" : "bg-[#1a1a1a]"
      }`}
      style={{ mask: notchMask, WebkitMask: notchMask }}
    >
      {/* Main part: distance and package name */}
      <div className="flex-1 min-w-0 pl-5 pr-4 py-4 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span
            className={`min-w-0 [font-family:var(--font-heading)] tracking-wide ${labelSize(pkg.distance)} ${
              unavailable ? "text-neutral-400" : "text-white"
            }`}
          >
            {pkg.distance}
          </span>
          {lowStock && (
            <span className="rounded-full bg-[#f5a623]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#f5a623]">
              Few left
            </span>
          )}
        </div>
        <p
          className={`mt-2 truncate text-base font-medium ${
            unavailable ? "text-neutral-500" : "text-[#bbbbbb]"
          }`}
        >
          {pkg.name}
        </p>
      </div>

      {/* Tear line */}
      <div
        aria-hidden
        className={`my-4 border-l-2 border-dashed ${
          unavailable ? "border-neutral-300" : "border-white/20"
        }`}
      />

      {/* Stub: price */}
      <div
        className={`flex flex-col items-center justify-center gap-1.5 px-3 transition-colors duration-200 ${
          unavailable
            ? "text-neutral-500"
            : "text-[#0d1840] group-hover:brightness-110"
        }`}
        // Brand gold, set directly so it doesn't depend on the theme stylesheet.
        style={{ width: STUB, background: unavailable ? undefined : "linear-gradient(135deg, #dcb45c 0%, #c49a3c 100%)" }}
      >
        <span className="whitespace-nowrap [font-family:var(--font-heading)] text-[2.1rem] leading-none tracking-wide">
          {formatPrice(pkg.price)}
        </span>
        {unavailable && (
          <span className="text-[11px] font-semibold uppercase tracking-widest">
            {soldOut ? "Sold out" : "Closed"}
          </span>
        )}
      </div>

      {/* Light catching the whole ticket, three times once in view, one ticket after another. */}
      {!unavailable && (
        <span
          aria-hidden
          className={styles.shine}
          style={{ animationDelay: `${0.8 + index * 0.25}s` }}
        />
      )}
    </div>
  );

  if (unavailable) {
    return (
      <div aria-disabled="true">
        <span className="sr-only">
          {pkg.name} ({pkg.distance}), {formatPrice(pkg.price)},{" "}
          {soldOut ? "sold out" : "registration closed"}
        </span>
        <div aria-hidden>{body}</div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={`Register for ${pkg.name} (${pkg.distance}), ${formatPrice(pkg.price)}${lowStock ? ", few places left" : ""}`}
      // drop-shadow (not box-shadow) so the shadow follows the notched outline.
      className="group block rounded-xl transition duration-200 hover:-translate-y-0.5 hover:drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 active:translate-y-0"
    >
      {body}
    </Link>
  );
}
