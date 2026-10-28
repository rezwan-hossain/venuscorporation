// module/checkout/components/EventQuestions.tsx
"use client";

// The extra checkout questions for non-marathon events — e.g. company and job
// title for a conference, number of guests for a gala.
//
// The questions come from lib/event-checkout-form.ts (the ones with a `key`), so
// to add or change a question you edit that file, not this one.
//
// Props:
//   questions  — getExtraQuestions(category, eventType)
//   answers    — current answers, by question key
//   errors     — error message per key ("" = no error)
//   onChange   — called with (key, value) when an answer changes

import Input from "@/components/ui/input";
import type { ExtraAnswers, ExtraQuestion } from "@/lib/event-checkout-form";

type EventQuestionsProps = {
  title: string;
  questions: ExtraQuestion[];
  answers: ExtraAnswers;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

const fieldClass =
  "h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";

export function EventQuestions({
  title,
  questions,
  answers,
  errors,
  onChange,
}: EventQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-8 sm:mt-6">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c49a3c] text-sm font-semibold text-[#a8852f]">
          2
        </span>
        <h2
          className="text-2xl font-semibold text-[#14245a]"
          style={{ fontFamily: "var(--font-checkout-serif)" }}
        >
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {questions.map((q) => {
          const value = answers[q.key] ?? "";
          const error = errors[q.key];
          const id = `extra-${q.key}`;
          const border = error ? "border-red-400" : "border-slate-200";

          return (
            // Long-text questions take the full width.
            <div
              key={q.key}
              className={q.type === "textarea" ? "sm:col-span-2" : ""}
            >
              <label
                htmlFor={id}
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#14245a] sm:mb-2 sm:text-xs"
              >
                {q.label}{" "}
                {q.required && (
                  <span className="font-semibold text-[#c49a3c]">*</span>
                )}
              </label>

              {/* One input per question type */}
              {q.type === "select" ? (
                <select
                  id={id}
                  value={value}
                  onChange={(e) => onChange(q.key, e.target.value)}
                  className={`${fieldClass} ${border}`}
                >
                  <option value="">Select {q.label.toLowerCase()}</option>
                  {q.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : q.type === "textarea" ? (
                <textarea
                  id={id}
                  rows={3}
                  value={value}
                  placeholder={q.placeholder}
                  onChange={(e) => onChange(q.key, e.target.value)}
                  className={`w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 ${border}`}
                />
              ) : (
                <Input
                  id={id}
                  type={q.type === "number" ? "number" : "text"}
                  min={q.type === "number" ? 1 : undefined}
                  value={value}
                  placeholder={q.placeholder}
                  onChange={(e) => onChange(q.key, e.target.value)}
                  className={`${fieldClass} ${border}`}
                />
              )}

              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
