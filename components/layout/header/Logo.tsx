// components/layout/header/Logo.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  scrolled: boolean;
}

// Wide wordmark (719×347, transparent background). Sized by height so it
// keeps its proportions; width follows automatically.
export default function Logo({ scrolled }: LogoProps) {
  return (
    <Link
      href="/"
      className="relative z-10 group shrink-0"
      prefetch={true} // Prefetch homepage
      aria-label="Venus Corporation home"
    >
      <Image
        src="/venuscorporation-logo.png"
        alt="Venus Corporation"
        width={719}
        height={347}
        className={`w-auto object-contain transition-all duration-300 ${
          scrolled ? "h-12 md:h-16" : "h-14 md:h-22"
        }`}
        priority
        sizes="(min-width: 768px) 190px, 140px"
      />
    </Link>
  );
}
