"use client";

// components/ui/DatePicker.tsx
//
// Brand-styled date picker (replaces the browser's plain <input type="date">).
// Used by the Contact form (event date) and the profile form (date of birth).
//   - The field shows the chosen date ("Wed, 9 Dec 2026") or a placeholder.
//   - Click it → a calendar pops up: month arrows (or month + year dropdowns
//     with `yearSelect`), blocked days greyed out (`disallow`), today marked
//     with a ring, the chosen day in navy + gold.
//   - Keyboard: arrow keys move by day/week, Enter picks, Esc closes.
//   - Click outside or Esc closes it. "Clear" and "Today" shortcuts.
// Value in / out is a "YYYY-MM-DD" string ("" = no date), like a date input.
// A hidden input carries the value under `name`, for normal form submits.

import { useEffect, useId, useRef, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

// The brand serif for the month title.
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"], display: "swap" });

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ── Date helpers (local dates, no time zones involved) ─────────────────
const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfToday = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

/** The 6 × 7 grid of days shown for a month (Monday first). */
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - offset + i));
}

type Props = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Which days can't be picked: "past" (default — e.g. an event date),
   *  "future" (e.g. a date of birth) or "none". */
  disallow?: "past" | "future" | "none";
  /** Show month + year dropdowns in the header — for dates far from today. */
  yearSelect?: boolean;
  /** Month the calendar opens on when there's no value ("YYYY-MM-DD"). */
  openTo?: string;
};

export default function DatePicker({ name, value, onChange, placeholder = "Choose a date", disallow = "past", yearSelect = false, openTo }: Props) {
  const today = startOfToday();
  const selected = value ? fromKey(value) : null;
  const startDay = selected ?? (openTo ? fromKey(openTo) : today);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => startDay); // month being shown (any day in it)
  const [focusDay, setFocusDay] = useState(() => startDay); // day with keyboard focus

  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const popupId = useId();

  const isDisabled = (d: Date) => (disallow === "past" && d < today) || (disallow === "future" && d > today);

  // 1. Open / close
  const openPicker = () => {
    const start = startDay;
    setView(start);
    setFocusDay(start);
    setOpen(true);
  };
  const pick = (d: Date) => {
    if (isDisabled(d)) return;
    onChange(toKey(d));
    setOpen(false);
  };

  // 2. Close on a click outside or Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // 3. Keep keyboard focus on the focused day
  useEffect(() => {
    if (!open) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${toKey(focusDay)}"]`)?.focus();
  }, [open, focusDay]);

  // 4. Arrow keys move the focused day (and the month along with it)
  const onGridKey = (e: React.KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const next = addDays(focusDay, step);
    setFocusDay(next);
    if (next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear()) setView(next);
  };

  const shiftMonth = (n: number) => setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1));
  const sameOrBefore = view.getFullYear() < today.getFullYear() || (view.getFullYear() === today.getFullYear() && view.getMonth() <= today.getMonth());
  const sameOrAfter = view.getFullYear() > today.getFullYear() || (view.getFullYear() === today.getFullYear() && view.getMonth() >= today.getMonth());
  const canGoBack = disallow !== "past" || !sameOrBefore;
  const canGoForward = disallow !== "future" || !sameOrAfter;

  // Years in the dropdown: 100 back for birthdays, otherwise a few around today.
  const thisYear = today.getFullYear();
  const years =
    disallow === "future"
      ? Array.from({ length: 101 }, (_, i) => thisYear - i)
      : disallow === "past"
        ? Array.from({ length: 6 }, (_, i) => thisYear + i)
        : Array.from({ length: 111 }, (_, i) => thisYear + 10 - i);

  const days = monthGrid(view.getFullYear(), view.getMonth());
  const label = selected?.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />

      {/* ── The field ── */}
      <div
        className={`group/date relative flex w-full items-center rounded-xl border bg-white transition hover:border-slate-300 ${
          open ? "border-[#c49a3c] ring-4 ring-[#c49a3c]/15" : "border-slate-200"
        }`}
      >
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openPicker())}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popupId}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl py-3.5 pr-4 pl-4 text-left text-[15px] outline-none focus-visible:ring-4 focus-visible:ring-[#c49a3c]/15"
        >
          <CalendarDays size={17} className={`shrink-0 transition-colors ${open || selected ? "text-[#c49a3c]" : "text-slate-400"}`} aria-hidden />
          <span className={`truncate ${selected ? "text-slate-800" : "text-slate-400"}`}>{label ?? placeholder}</span>
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear date"
            className="mr-2 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── The calendar ── */}
      {open && (
        <div
          id={popupId}
          role="dialog"
          aria-label="Choose a date"
          className="absolute top-full left-0 z-30 mt-2 w-[19.5rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border bg-white p-4 shadow-2xl shadow-[#14245a]/20"
          style={{ borderColor: `${GOLD}40` }}
        >
          {/* Month + arrows */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              disabled={!canGoBack}
              aria-label="Previous month"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#faf8f3] disabled:cursor-not-allowed disabled:opacity-30"
              style={{ color: NAVY }}
            >
              <ChevronLeft size={18} />
            </button>
            {yearSelect ? (
              // Month + year dropdowns: jump straight to e.g. March 1994.
              <div className="flex items-center gap-1.5">
                <select
                  aria-label="Month"
                  value={view.getMonth()}
                  onChange={(e) => setView(new Date(view.getFullYear(), Number(e.target.value), 1))}
                  className="cursor-pointer rounded-lg border border-[#c49a3c]/30 bg-white py-1 pr-1 pl-2 text-sm font-semibold text-[#14245a] outline-none focus:border-[#c49a3c]"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Year"
                  value={view.getFullYear()}
                  onChange={(e) => setView(new Date(Number(e.target.value), view.getMonth(), 1))}
                  className="cursor-pointer rounded-lg border border-[#c49a3c]/30 bg-white py-1 pr-1 pl-2 text-sm font-semibold text-[#14245a] tabular-nums outline-none focus:border-[#c49a3c]"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className={`${serif.className} text-lg font-semibold`} style={{ color: NAVY }} aria-live="polite">
                {view.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </p>
            )}
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              disabled={!canGoForward}
              aria-label="Next month"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-[#faf8f3] disabled:cursor-not-allowed disabled:opacity-30"
              style={{ color: NAVY }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday names */}
          <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>

          {/* Days */}
          <div ref={gridRef} role="grid" onKeyDown={onGridKey} className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d) => {
              const key = toKey(d);
              const inMonth = d.getMonth() === view.getMonth();
              const disabled = isDisabled(d);
              const isSelected = value === key;
              const isToday = toKey(today) === key;
              return (
                <button
                  key={key}
                  type="button"
                  data-day={key}
                  onClick={() => pick(d)}
                  disabled={disabled}
                  tabIndex={toKey(focusDay) === key ? 0 : -1}
                  aria-pressed={isSelected}
                  aria-label={d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  className={`relative flex h-9 cursor-pointer items-center justify-center rounded-full text-sm lining-nums transition outline-none focus-visible:ring-2 focus-visible:ring-[#c49a3c] ${
                    isSelected
                      ? "font-semibold shadow-md shadow-[#14245a]/25"
                      : disabled
                        ? "cursor-not-allowed text-slate-300"
                        : inMonth
                          ? "text-slate-700 hover:bg-[#faf8f3] hover:text-[#14245a]"
                          : "text-slate-300 hover:bg-[#faf8f3]"
                  } ${isToday && !isSelected ? "ring-1 ring-[#c49a3c]/60" : ""}`}
                  style={isSelected ? { background: NAVY, color: GOLD_LIGHT } : undefined}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Shortcuts */}
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm" style={{ borderColor: `${GOLD}26` }}>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="cursor-pointer font-medium text-slate-500 transition hover:text-slate-800"
            >
              Clear
            </button>
            {!yearSelect && (
              <button type="button" onClick={() => pick(today)} className="cursor-pointer font-semibold transition hover:underline" style={{ color: GOLD }}>
                Today
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
