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

const fieldClass = "h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#c49a3c]/40";

export function EventQuestions({ title, questions, answers, errors, onChange }: EventQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4 sm:mt-6 sm:p-6 md:p-8">
      <h2 className="mb-4 font-serif text-xl font-bold tracking-wider text-foreground sm:mb-6 sm:text-2xl">{title}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {questions.map((q) => {
          const value = answers[q.key] ?? "";
          const error = errors[q.key];
          const id = `extra-${q.key}`;
          const border = error ? "border-red-400" : "border-gray-200";

          return (
            // Long-text questions take the full width.
            <div key={q.key} className={q.type === "textarea" ? "sm:col-span-2" : ""}>
              <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-neutral-800 sm:mb-2 sm:text-sm">
                {q.label} {q.required && <span className="font-semibold text-red-500">*</span>}
              </label>

              {/* One input per question type */}
              {q.type === "select" ? (
                <select id={id} value={value} onChange={(e) => onChange(q.key, e.target.value)} className={`${fieldClass} ${border}`}>
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
                  className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c49a3c]/40 ${border}`}
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
