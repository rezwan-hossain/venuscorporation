import { Suspense } from "react";
import dynamic from "next/dynamic";

import SiteHeader from "./header/SiteHeader";

const SiteFooter = dynamic(() => import("./SiteFooter"), {
  ssr: true,
});

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-black" />}>
        <SiteHeader />
      </Suspense>

      <main className="min-h-screen">
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

      <Suspense fallback={<div className="h-48 bg-[#0b1433]" />}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
