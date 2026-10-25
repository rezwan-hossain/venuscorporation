// module/event/pages/EventDetailPage.tsx
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { Building2, CalendarDays, ChevronRight, Clock, Globe, MapPin, Ticket, type LucideIcon } from "lucide-react";

import type { EventData } from "@/types/event";
import EventDescription3 from "../components/EventDescription3";
import ShareButtons from "../components/ShareButtons";
import TicketOptions from "../components/TicketOptions";
import { ViewContentTracker } from "@/components/tracking/ViewContentTracker";

const CountdownTimer = dynamic(() => import("../components/CountdownTimer"), {
  loading: () => <div className="h-44 rounded-2xl bg-gray-100 animate-pulse" />,
});

// The business card's elegant serif — loaded for this page only. The
// countdown and ticket components use it too (var(--font-event-serif)).
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-event-serif",
});
const SERIF = { fontFamily: "var(--font-event-serif)" } as const;
const NAVY = "#14245a";
const GOLD = "#c49a3c";

type EventDetailPageProps = {
  event: EventData;
  searchParams?: { view?: string };
};

// Event dates are stored as UTC midnight and times as the Dhaka wall-clock
// time written in UTC (see app/actions/admin.ts), so both format in UTC.
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const formatTime = (time: Date) =>
  new Date(time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

/** The real start instant: event day + start time, Dhaka (UTC+6). */
function startsAt(date: Date, time: Date): Date {
  const d = new Date(date);
  const t = new Date(time);
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      t.getUTCHours(),
      t.getUTCMinutes(),
    ) -
      6 * 60 * 60 * 1000,
  );
}

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDBAURAAYhEiIxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8Aw+3bdu9ru1BXQ26eSGnqIpZFRVZmVXBIAHknGmG/rjPuC4Uu4J6SajgqIPTjp8qV7Y0H3A5Azk8f2mms0Bui5NdXe//Z";

const EventDetailPage = ({ event, searchParams }: EventDetailPageProps) => {
  // ?view=styled switches the description renderer (kept for previewing).
  const styledDescription = searchParams?.view === "styled";
  const isOpen = event.status === "ACTIVE";
  const packages = event.packages.filter((p) => !p.isArchived);

  const formattedDate = formatDate(event.date);
  const formattedTime = formatTime(event.time);

  // InitiateCheckout fires with the exact package on the checkout page.
  const firstPackage = packages[0];

  return (
    <div className={`${serif.variable} min-h-screen bg-white`}>
      {firstPackage && (
        <ViewContentTracker
          product={{
            id: String(firstPackage.id),
            name: event.name,
            price: Number(firstPackage.price),
            packageName: firstPackage.name,
            distance: firstPackage.distance,
          }}
        />
      )}

      {/* Title band (light, so the fixed header's dark text stays readable) */}
      <section className="pt-28 pb-10 sm:pt-36 lg:pt-40 lg:pb-12" style={{ background: "#faf8f3" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            <Link href="/events" className="font-medium hover:underline" style={{ color: "#a8852f" }}>
              Events
            </Link>
            <ChevronRight size={14} className="text-slate-400" aria-hidden />
            <span className="truncate text-slate-500">{event.name}</span>
          </nav>
          <h1 className="mt-5 max-w-4xl text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl" style={{ ...SERIF, color: NAVY }}>
            {event.name}
          </h1>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {[
              { icon: CalendarDays, text: formattedDate },
              { icon: Clock, text: formattedTime },
              { icon: MapPin, text: event.address },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium" style={{ borderColor: `${GOLD}40`, color: NAVY }}>
                <Icon size={15} className="shrink-0" style={{ color: GOLD }} aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        {/* Banner (LCP element) */}
        <div className="relative mt-8 overflow-hidden rounded-2xl shadow-xl shadow-[#14245a]/10 lg:mt-10">
          <Image
            src={event.bannerImage}
            alt={event.name}
            width={1400}
            height={620}
            className={`h-60 w-full object-cover sm:h-90 lg:h-130 ${
              isOpen ? "" : "grayscale-[60%]"
            }`}
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            placeholder="blur"
            blurDataURL={BLUR}
          />
          <StatusPill status={event.status} />
        </div>

        {/* Phones: countdown, race info, tickets, share (the buy column is
            display:contents there, so the countdown can move to the top on
            its own). Large screens: buy column on the right, spanning both
            rows so it stays sticky beside everything on the left. */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[auto_1fr] lg:gap-x-14">
          {/* Event info: quick facts first, then the full description */}
          <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-1">
            <AtAGlance event={event} packages={packages} />

            <section>
              <h2 className="text-3xl font-semibold lg:text-4xl" style={{ ...SERIF, color: NAVY }}>
                About the <em className="font-medium" style={{ color: GOLD }}>event</em>
              </h2>
              <div className="mt-5">
                {styledDescription ? (
                  <EventDescription3 description={event.description} />
                ) : (
                  <div
                    className="prose prose-slate max-w-none [&>h2]:mt-10 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm/7 [&>h2]:font-medium [&>h2]:text-slate-900 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-neon-lime [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                )}
              </div>
            </section>
          </div>

          {/* Buy column */}
          <aside className="contents lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:space-y-6 lg:self-start">
            {isOpen && (
              <div className="order-first lg:order-none">
                <Suspense
                  fallback={
                    <div className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
                  }
                >
                  <CountdownTimer
                    targetDate={startsAt(event.date, event.time)}
                  />
                </Suspense>
              </div>
            )}

            <TicketOptions
              packages={event.packages}
              eventId={event.id}
              eventStatus={event.status}
            />
          </aside>

          {isOpen && (
            <div className="min-w-0 lg:col-start-1 lg:row-start-2">
              <ShareButtons
                slug={event.slug}
                eventName={event.name}
                place="event"
                siteUrl={process.env.NEXT_PUBLIC_SITE_URL}
                subtitle="Coming with friends? Send them this event."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Facts the hero line doesn't already show: format, distances, organizer. */
function AtAGlance({
  event,
  packages,
}: {
  event: EventData;
  packages: EventData["packages"];
}) {
  const rows: { icon: LucideIcon; label: string; value: React.ReactNode }[] = [
    {
      icon: Globe,
      label: "Format",
      value:
        event.eventType === "VIRTUAL" ? "Virtual — join from anywhere" : "In person",
    },
  ];

  if (packages.length > 0) {
    rows.push({
      icon: Ticket,
      label: "Options",
      value: (
        <ul className="flex flex-wrap gap-2">
          {packages.map((p) => (
            <li
              key={p.id}
              className="rounded-full border border-[#c49a3c]/40 bg-[#faf8f3] px-3 py-0.5 text-xs font-semibold text-[#14245a]"
            >
              {p.distance}
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (event.organizer) {
    rows.push({
      icon: Building2,
      label: "Organizer",
      value: (
        <span className="flex items-center gap-2.5">
          {event.organizer.logo && (
            // Plain <img>: organizer logos can come from any host.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.organizer.logo}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          )}
          {event.organizer.name}
        </span>
      ),
    });
  }

  return (
    <section className="rounded-2xl border border-[#c49a3c]/25">
      <h2 className="border-b border-[#c49a3c]/20 px-5 py-4 text-2xl font-semibold sm:px-6" style={{ ...SERIF, color: NAVY }}>
        At a <em className="font-medium" style={{ color: GOLD }}>glance</em>
      </h2>
      <dl className="divide-y divide-[#c49a3c]/10">
        {rows.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-1.5 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6"
          >
            <dt className="flex w-36 shrink-0 items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
              <Icon className="h-4 w-4 text-[#c49a3c]" aria-hidden />
              {label}
            </dt>
            <dd className="text-sm font-medium text-[#14245a]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const STATUS_STYLE: Record<string, { label: string; dot: string }> = {
  ACTIVE: { label: "Upcoming", dot: "bg-green-500" },
  COMPLETED: { label: "Completed", dot: "bg-gray-400" },
  CANCELLED: { label: "Cancelled", dot: "bg-red-500" },
  INACTIVE: { label: "Not open yet", dot: "bg-amber-400" },
};

const StatusPill = ({ status }: { status: string }) => {
  const s = STATUS_STYLE[status] ?? { label: status, dot: "bg-gray-400" };
  return (
    <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-900 shadow-sm backdrop-blur">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
};

export default EventDetailPage;
