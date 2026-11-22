// module/event/components/EventDetailSkeleton.tsx
//
// What the event page shows while it loads: grey-cream blocks in the SAME
// places as the real page (module/event/pages/EventDetailPage.tsx), so
// nothing jumps when the content arrives.
//
//   cream title band   breadcrumb · title · date / time / place chips
//   banner photo
//   ┌ left ──────────────────────┐ ┌ right (sticky) ─┐
//   │ At a glance card           │ │ countdown (navy)│
//   │ About the event + text     │ │ Registration    │
//   │ Share row                  │ └─────────────────┘
//   └────────────────────────────┘
// Phones: countdown first, then the left column, then registration
// (same order as the real page).
//
// Used by app/events/[slug]/loading.tsx and the <Suspense> in
// app/events/[slug]/page.tsx. If you change the page layout, change this too.

const GOLD = "#c49a3c";
const CREAM = "#faf8f3";

/** One grey-cream placeholder block. Give it a size with `className`. */
function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#ece6d8] ${className}`} aria-hidden />;
}

export default function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white" role="status" aria-label="Loading event">
      <span className="sr-only">Loading event…</span>

      {/* ── Title band ── */}
      <section className="pt-28 pb-10 sm:pt-36 lg:pt-40 lg:pb-12" style={{ background: CREAM }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Bone className="h-4 w-48" /> {/* breadcrumb */}
          <Bone className="mt-5 h-10 w-4/5 max-w-3xl sm:h-12 lg:h-14" /> {/* title */}
          <Bone className="mt-3 h-10 w-1/2 max-w-md sm:h-12 lg:h-14" />
          {/* date · time · place chips */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Bone className="h-9 w-40 rounded-full" />
            <Bone className="h-9 w-28 rounded-full" />
            <Bone className="h-9 w-56 rounded-full" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        {/* ── Banner photo ── */}
        <Bone className="mt-8 h-60 rounded-2xl sm:h-90 lg:mt-10 lg:h-130" />

        {/* ── Two columns (one on phones) — same grid as the real page ── */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[auto_1fr] lg:gap-x-14">
          {/* Left: At a glance + About the event */}
          <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-1">
            {/* At a glance card */}
            <div className="rounded-2xl border" style={{ borderColor: `${GOLD}40` }}>
              <div className="border-b px-5 py-4 sm:px-6" style={{ borderColor: `${GOLD}33` }}>
                <Bone className="h-7 w-40" />
              </div>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="flex flex-col gap-2 border-b px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-6 sm:px-6"
                  style={{ borderColor: `${GOLD}1a` }}
                >
                  <Bone className="h-3.5 w-28" />
                  <Bone className="h-4 w-40" />
                </div>
              ))}
            </div>

            {/* About the event: heading, paragraphs, a list card */}
            <div>
              <Bone className="h-9 w-64" />
              <div className="mt-5 space-y-3">
                <Bone className="h-5 w-full" />
                <Bone className="h-5 w-full" />
                <Bone className="h-5 w-2/3" />
              </div>
              <div className="mt-6 space-y-2.5">
                <Bone className="h-4 w-full" />
                <Bone className="h-4 w-11/12" />
                <Bone className="h-4 w-4/5" />
              </div>
              <Bone className="mt-8 h-3 w-36" /> {/* small gold label */}
              <div className="mt-4 space-y-3 rounded-2xl p-5" style={{ background: CREAM }}>
                <Bone className="h-4 w-5/6" />
                <Bone className="h-4 w-3/4" />
                <Bone className="h-4 w-4/5" />
                <Bone className="h-4 w-2/3" />
              </div>
            </div>
          </div>

          {/* Right: countdown + registration (phones: countdown goes first) */}
          <aside className="contents lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:space-y-6 lg:self-start">
            {/* Countdown — navy like the real one */}
            <div className="order-first animate-pulse rounded-2xl bg-[#14245a] p-6 lg:order-none" aria-hidden>
              <div className="mx-auto h-3 w-28 rounded bg-white/15" />
              <div className="mx-auto mt-3 h-6 w-40 rounded bg-white/15" />
              <div className="mt-5 grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((box) => (
                  <div key={box} className="h-16 rounded-lg bg-white/10" />
                ))}
              </div>
            </div>

            {/* Registration card */}
            <div className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: `${GOLD}40` }}>
              <Bone className="h-8 w-52" />
              <div className="mt-5 h-24 animate-pulse rounded-xl bg-[#14245a]/85" aria-hidden />
              <Bone className="mx-auto mt-4 h-3 w-56" />
            </div>
          </aside>

          {/* Share row (left column, under the text on large screens) */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <Bone className="h-7 w-40" />
            <Bone className="mt-2 h-4 w-64" />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((button) => (
                <Bone key={button} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
