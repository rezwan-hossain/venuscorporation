// app/events/[slug]/loading.tsx
//
// Shown by Next.js the moment someone opens an event, while the page loads.
// The skeleton itself (shaped like the real page) lives in
// module/event/components/EventDetailSkeleton.tsx — one design, used here
// and by the <Suspense> fallback in ./page.tsx.

import EventDetailSkeleton from "@/module/event/components/EventDetailSkeleton";

export default function Loading() {
  return <EventDetailSkeleton />;
}
