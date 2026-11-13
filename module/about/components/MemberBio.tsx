// module/about/components/MemberBio.tsx
//
// A team member's bio on the About page.
// Shows the first few lines; "Read more" opens the full text, "Show less"
// folds it back. Short bios that fit are shown as-is, without the button.

"use client";

import { useState } from "react";

// Bios longer than this are likely cut off by the line clamp, so they get a button.
const SHORT_BIO = 90;

export default function MemberBio({ bio }: { bio: string }) {
  const [open, setOpen] = useState(false);
  const isLong = bio.length > SHORT_BIO;

  return (
    <div className="mt-2 sm:mt-3">
      {/* Smaller text on phones (two cards per row there) */}
      <p className={`text-xs leading-relaxed sm:text-sm ${open ? "" : "line-clamp-3"}`}>{bio}</p>

      {isLong && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="mt-1.5 cursor-pointer text-[11px] font-semibold uppercase tracking-[0.15em] text-[#a8852f] transition hover:text-[#14245a]"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
