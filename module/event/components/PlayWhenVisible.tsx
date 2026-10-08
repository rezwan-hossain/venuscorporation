"use client";

// Adds `playClassName` to its wrapper the first time the wrapper scrolls into
// view, so CSS animations inside it start when the user actually sees them.
// Used by TicketOptions for the ticket shine.

import { useEffect, useRef, useState, type ReactNode } from "react";

type PlayWhenVisibleProps = {
  className?: string;
  playClassName: string;
  children: ReactNode;
};

export default function PlayWhenVisible({
  className = "",
  playClassName,
  children,
}: PlayWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // once only
        }
      },
      // Fire when the top of the list is a quarter of the way up the screen,
      // not the moment its first pixel peeks in.
      { rootMargin: "0px 0px -25% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} ${visible ? playClassName : ""}`}>
      {children}
    </div>
  );
}
