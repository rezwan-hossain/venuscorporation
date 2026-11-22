// app/events/[slug]/page.tsx
import type { Metadata } from "next";
import { getEventBySlug, getPublicEventSlugs } from "@/app/actions/event";
import EventDetailPage from "@/module/event/pages/EventDetailPage";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EventDetailSkeleton from "@/module/event/components/EventDetailSkeleton";

// ⚠️ Caching: this page is built ahead of time for every public event and
// served from cache (refreshed when an admin edits an event, or slots change
// — see the cache tags in app/actions/event.ts). Don't read `searchParams`,
// cookies() or headers() here: any of them makes the page render again on
// every visit instead.

type Props = {
  params: Promise<{ slug: string }>;
};

// ── Which event pages to build ahead of time ─────────────
// Every public event. An event created after the last deploy still works:
// it's rendered when first visited (just not prebuilt).
export async function generateStaticParams() {
  const slugs = await getPublicEventSlugs();
  // Next.js needs at least one entry. With no events yet, a placeholder
  // slug is used — it isn't a real event, so it simply shows "not found".
  if (slugs.length === 0) return [{ slug: "__no-events-yet__" }];
  return slugs.map((slug) => ({ slug }));
}

// ── Dynamic Metadata ─────────────────────────
// What Facebook, WhatsApp, LinkedIn, X … show when someone shares the link:
//   title        → event name
//   description  → "Sun, 13 Dec 2026 · Narsingdi — <short description>"
//   image        → NOT set here on purpose. ./opengraph-image.tsx draws a
//                  branded card (photo + name + date + place) and Next.js
//                  adds it automatically. Setting `images` here would replace
//                  it with the plain thumbnail.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { event } = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  const date = new Date(event.date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
  const place = event.address?.split(",")[0]?.trim(); // "Narsingdi Sadar"
  const facts = [date, place].filter(Boolean).join(" · ");
  const about = event.shortDesc?.trim() || `Join us for ${event.name}.`;
  const description = shorten(`${facts} — ${about}`, 200);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/events/${slug}`;

  return {
    title: event.name,
    description,
    openGraph: {
      title: event.name,
      description,
      type: "website",
      url,
      siteName: "Venus Corporation",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

/** Cut long text at a word boundary and add "…". */
function shorten(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max - 1)) + "…";
}

// ── Page Component ───────────────────────────
// The event is loaded inside <Suspense>: listed events come fully built from
// the cache; a brand-new event shows the skeleton while it's rendered.
export default async function Page({ params }: Props) {
  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventPageContent paramsPromise={params} />
    </Suspense>
  );
}

/** Loads the event (cached in getEventBySlug) and shows it, or "not found". */
async function EventPageContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  const { slug } = await paramsPromise;
  const { event, error } = await getEventBySlug(slug);

  if (!event || error) {
    notFound();
  }

  return <EventDetailPage event={event} />;
}
