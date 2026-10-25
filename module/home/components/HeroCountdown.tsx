"use client";

// module/home/components/HeroCountdown.tsx
//
// "Starts in 45 days" under the hero's "Get tickets" button.
// Worked out in the visitor's browser (the hero itself is cached), so it's
// always right for today. Renders nothing on the server and nothing once the
// event has started.

import { useSyncExternalStore } from "react";
import { Clock } from "lucide-react";

const DAY = 24 * 60 * 60 * 1000;
const noop = () => () => {};

/** "Starts in 45 days" / "Starts tomorrow" / "Starts today" / null (started). */
function countdownText(startsAt: string) {
  const ms = new Date(startsAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const days = Math.floor(ms / DAY);
  if (days === 0) return "Starts today";
  if (days === 1) return "Starts tomorrow";
  return `Starts in ${days} days`;
}

export default function HeroCountdown({ startsAt }: { startsAt: string }) {
  // Client: the text for now. Server: null (no flash of a wrong number).
  const text = useSyncExternalStore(
    noop,
    () => countdownText(startsAt),
    () => null,
  );
  if (!text) return null;

  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.19em] text-white/80">
      {/* <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inset-0 animate-ping rounded-full bg-[#dcb45c] opacity-60 motion-reduce:hidden" />
        <span className="relative h-2 w-2 rounded-full bg-[#dcb45c]" />
      </span> */}
      <Clock size={13} className="text-[#dcb45c]" aria-hidden />
      {text}
    </p>
  );
}
