// components/layout/AppLayout.tsx
//
// The frame around every page: header, the page itself, footer, WhatsApp button.
//
// ⚠️ Performance note. Next.js caches each page's finished HTML — unless
// something inside a <Suspense> can't be cached (e.g. a client component
// that reads the clock with `new Date()` while rendering). Then that whole
// <Suspense> is left out of the HTML and visitors see the fallback (the
// spinner below) until their browser builds the page — slow on phones.
// So: anything that reads the current time gets its OWN small <Suspense>
// (see ContactForm's date picker) or "use cache" (see ui/CurrentYear).
//
// The footer is a plain import with no <Suspense>: it's the same on every
// page and must always come ready-made in the HTML.

import { Suspense } from "react";

import SiteHeader from "./header/SiteHeader";
import SiteFooter from "./SiteFooter";
import WhatsAppButton from "./WhatsAppButton";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      {/* The real header is `fixed` (takes no space), so its placeholder is
          fixed too — otherwise the page would jump up 64px when it swaps in. */}
      <Suspense fallback={<div className="fixed inset-x-0 top-0 z-50 h-16" aria-hidden />}>
        <SiteHeader />
      </Suspense>

      <main className="min-h-screen">
        {/* Logged-in pages (dashboard, checkout …) load per request and
            show this spinner while they do. Public pages are cached and
            never show it. */}
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      <SiteFooter />

      {/* Floating "Chat on WhatsApp" button, every page */}
      <WhatsAppButton />
    </>
  );
}
