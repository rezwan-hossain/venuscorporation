// app/events/[slug]/page.tsx
import type { Metadata } from "next";
import { getEventBySlug } from "@/app/actions/event";
import EventDetailPage from "@/module/event/pages/EventDetailPage";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EventDetailSkeleton from "@/module/event/components/EventDetailSkeleton";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
};

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
export default async function Page({ params, searchParams }: Props) {
  // Move data fetching into a suspended component
  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventPageContent paramsPromise={params} searchParams={searchParams} />
    </Suspense>
  );
}

// This component handles the data fetching and will be suspended
async function EventPageContent({
  paramsPromise,
  searchParams,
}: {
  paramsPromise: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { slug } = await paramsPromise;
  const { event, error } = await getEventBySlug(slug);
  const resolvedSearchParams = await searchParams;

  if (!event || error) {
    notFound();
  }

  return <EventDetailPage event={event} searchParams={resolvedSearchParams} />;
}
