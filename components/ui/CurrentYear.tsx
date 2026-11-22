// components/ui/CurrentYear.tsx
//
// "2026" for the footer's copyright line.
//
// A server component with "use cache": the year is worked out once and kept
// for a day, so pages can still be fully cached. (Reading the clock with
// `new Date()` directly during rendering stops Next.js from caching the page,
// so the footer would be built in each visitor's browser instead.)

import { cacheLife } from "next/cache";

export default async function CurrentYear() {
  "use cache";
  cacheLife("days"); // at worst shows last year's number for a day after New Year

  return <>{new Date().getFullYear()}</>;
}
