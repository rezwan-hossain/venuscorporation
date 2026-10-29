"use client";

// module/contact/components/ContactForm.tsx
//
// Event enquiry form on /contact, in three numbered groups:
//   1. About you   — name, phone, email (icons inside the fields)
//   2. Your event  — type (pill buttons), date, number of guests (pills)
//   3. Details     — message with a character counter
// Validation on submit (errors clear while typing), then a thank-you card.
//
// Sending: sendContactMessage (app/actions/contact.ts) saves the enquiry to
// the database; admins read it under admin → Contact Messages. The checks
// live in lib/contact-form.ts, shared with the server.

import { useState } from "react";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Heart,
  Loader2,
  Mail,
  Mic,
  PartyPopper,
  Phone,
  Sparkles,
  Store,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";

import { services } from "@/module/home/business/data-v3";
import { sendContactMessage } from "@/app/actions/contact";
import { checkContactForm, MESSAGE_MAX } from "@/lib/contact-form";
import DatePicker from "@/components/ui/DatePicker";

type FormType = {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  guests: string;
  message: string;
};

const EMPTY: FormType = {
  name: "",
  phone: "",
  email: "",
  eventType: "",
  date: "",
  guests: "",
  message: "",
};

const NAVY = "#14245a";
const GOLD = "#c49a3c";
const SERIF = { fontFamily: "var(--font-contact-serif)" } as const;

// Icon for each service (by name in data-v3.ts); anything else gets Sparkles.
const EVENT_ICONS: Record<string, LucideIcon> = {
  "Corporate Events": Briefcase,
  "Sports Events": Trophy,
  Weddings: Heart,
  "Conferences & Seminars": Mic,
  "Exhibitions & Trade Shows": Store,
  "Private & Social Events": PartyPopper,
};
const EVENT_TYPES = [...services.map((s) => s.name), "Something else"];
const GUEST_SIZES = ["Under 50", "50 – 150", "150 – 500", "500+"];

// ════════════════════════════════════════════════════════════════════════
//  Small pieces
// ════════════════════════════════════════════════════════════════════════

/** Numbered group heading: gold number circle · title · hairline. */
function Group({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-5 flex w-full items-center gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm italic lining-nums"
          style={{ ...SERIF, background: NAVY, color: "#dcb45c" }}
        >
          {step}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: NAVY }}
        >
          {title}
        </span>
        <span
          className="h-px flex-1"
          style={{ background: `${GOLD}33` }}
          aria-hidden
        />
      </legend>
      {children}
    </fieldset>
  );
}

/** Label + (optional) hint + field + error. */
function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-semibold" style={{ color: NAVY }}>
        {label}{" "}
        {optional ? (
          <span className="font-normal text-slate-400">(optional)</span>
        ) : (
          <span style={{ color: GOLD }}>*</span>
        )}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

/** Input with an icon inside on the left. */
function IconInput({
  icon: Icon,
  invalid,
  ...props
}: {
  icon: LucideIcon;
  invalid?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className="group/input relative block">
      <Icon
        size={17}
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-[#c49a3c]"
        aria-hidden
      />
      <input
        {...props}
        aria-invalid={invalid || undefined}
        className={`w-full rounded-xl border bg-white py-3.5 pr-4 pl-11 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 ${
          invalid ? "border-red-400" : "border-slate-200"
        }`}
      />
    </span>
  );
}

/** A pill-shaped radio button. */
function Pill({
  name,
  value,
  checked,
  onChange,
  icon: Icon,
  className = "",
  children,
}: {
  className?: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`${className} inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition select-none has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#c49a3c]/25 ${
        checked
          ? "border-transparent text-white shadow-md shadow-[#14245a]/20"
          : "border-slate-200 bg-white text-slate-600 hover:border-[#c49a3c]/60 hover:text-[#14245a]"
      }`}
      style={checked ? { background: NAVY } : undefined}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {Icon && (
        <Icon
          size={15}
          style={{ color: checked ? "#dcb45c" : GOLD }}
          aria-hidden
        />
      )}
      {children}
    </label>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  The form
// ════════════════════════════════════════════════════════════════════════

const ContactForm = () => {
  const [form, setForm] = useState<FormType>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormType>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, see below

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // remove error while typing
  };

  const validate = () => {
    const newErrors = checkContactForm(form);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError("");
    if (!validate()) return;

    setSending(true);
    const result = await sendContactMessage({ ...form, website });
    setSending(false);

    if (!result.success) {
      setSendError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  };

  // ── Sent: thank-you card ───────────────────────────────────────────
  if (sent) {
    return (
      <div
        className="relative flex flex-col items-center overflow-hidden rounded-[2rem] border bg-white p-10 text-center shadow-xl shadow-[#14245a]/10 sm:p-14"
        style={{ borderColor: `${GOLD}33` }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#c49a3c] via-[#dcb45c] to-[#c49a3c]"
        />
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: `${GOLD}1f` }}
        >
          <CheckCircle2 size={34} style={{ color: GOLD }} aria-hidden />
        </span>
        <h2
          className="mt-6 text-4xl font-semibold"
          style={{ ...SERIF, color: NAVY }}
        >
          Thank you,{" "}
          <em className="font-medium" style={{ color: GOLD }}>
            {form.name.trim().split(" ")[0]}.
          </em>
        </h2>
        <p className="mt-3 max-w-md leading-relaxed">
          We&apos;ve got your enquiry
          {form.eventType && form.eventType !== "Something else"
            ? ` about ${form.eventType.toLowerCase()}`
            : ""}{" "}
          and will get back to you within one working day.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY);
            setSent(false);
          }}
          className="mt-8 text-sm font-semibold underline underline-offset-4"
          style={{ color: NAVY, textDecorationColor: GOLD }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  // ── The form ────────────────────────────────────────────────────────
  return (
    <div
      className="relative rounded-[2rem] border bg-white p-7 shadow-xl shadow-[#14245a]/10 sm:p-10"
      style={{ borderColor: `${GOLD}33` }}
    >
      {/* Gold accent along the top (rounded to the card; no overflow-hidden, so the date picker isn't clipped) */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 rounded-t-[2rem] bg-linear-to-r from-[#c49a3c] via-[#dcb45c] to-[#c49a3c]"
      />

      <h2
        className="text-3xl leading-tight font-semibold sm:text-4xl"
        style={{ ...SERIF, color: NAVY }}
      >
        Plan your{" "}
        <em className="font-medium" style={{ color: GOLD }}>
          event
        </em>
      </h2>
      <p className="mt-2 text-sm">
        A few details help us prepare ideas before we call. It takes about a
        minute.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-9 flex flex-col gap-10"
      >
        {/* Honeypot: hidden from people, but bots fill it in — the server
            then quietly ignores the enquiry. */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        {/* 1. About you */}
        <Group step={1} title="About you">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Your name" error={errors.name}>
                <IconInput
                  icon={User}
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  invalid={!!errors.name}
                />
              </Field>
            </div>
            <Field label="Phone" error={errors.phone}>
              <IconInput
                icon={Phone}
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="+880 1XXX XXXXXX"
                value={form.phone}
                onChange={handleChange}
                invalid={!!errors.phone}
              />
            </Field>
            <Field label="Email" optional error={errors.email}>
              <IconInput
                icon={Mail}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                invalid={!!errors.email}
              />
            </Field>
          </div>
        </Group>

        {/* 2. Your event */}
        <Group step={2} title="Your event">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold" style={{ color: NAVY }}>
                Type of event <span style={{ color: GOLD }}>*</span>
              </p>
              <div
                role="radiogroup"
                aria-label="Type of event"
                className="flex flex-wrap gap-2.5"
              >
                {EVENT_TYPES.map((t) => (
                  <Pill
                    key={t}
                    name="eventType"
                    value={t}
                    checked={form.eventType === t}
                    onChange={handleChange}
                    icon={EVENT_ICONS[t] ?? Sparkles}
                  >
                    {t}
                  </Pill>
                ))}
              </div>
              {errors.eventType && (
                <p className="mt-2 text-xs text-red-600">{errors.eventType}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.5fr]">
              {/* Not a <label>: the calendar's buttons sit inside it */}
              <div className="flex min-w-0 flex-col gap-2">
                <p className="text-sm font-semibold" style={{ color: NAVY }}>
                  Event date{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </p>
                <DatePicker
                  name="date"
                  value={form.date}
                  onChange={(date) => setForm((prev) => ({ ...prev, date }))}
                />
              </div>
              <div>
                <p
                  className="mb-2 text-sm font-semibold"
                  style={{ color: NAVY }}
                >
                  Number of guests{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </p>
                <div
                  role="radiogroup"
                  aria-label="Number of guests"
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  {GUEST_SIZES.map((g) => (
                    <Pill
                      key={g}
                      name="guests"
                      value={g}
                      checked={form.guests === g}
                      onChange={handleChange}
                      className="justify-center !px-2 whitespace-nowrap"
                    >
                      {g}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Group>

        {/* 3. Details */}
        <Group step={3} title="Details">
          <Field label="Tell us about it" error={errors.message}>
            <span className="relative block">
              <textarea
                name="message"
                rows={5}
                maxLength={MESSAGE_MAX}
                placeholder="The occasion, the venue you have in mind, your budget — anything that helps."
                value={form.message}
                onChange={handleChange}
                aria-invalid={!!errors.message || undefined}
                className={`w-full resize-none rounded-xl border bg-white px-4 py-3.5 pb-8 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 ${
                  errors.message ? "border-red-400" : "border-slate-200"
                }`}
              />
              <span className="pointer-events-none absolute right-4 bottom-3 text-xs text-slate-400 tabular-nums">
                {form.message.length}/{MESSAGE_MAX}
              </span>
            </span>
          </Field>
        </Group>

        {/* Couldn't send (server problem or too many enquiries) */}
        {sendError && (
          <p
            role="alert"
            className="-mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100"
          >
            {sendError}
          </p>
        )}

        {/* Submit */}
        <div
          className="flex flex-col-reverse gap-4 border-t pt-7 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: `${GOLD}26` }}
        >
          <p className="text-xs leading-relaxed text-slate-400">
            We reply within one working day.
            <br className="hidden sm:block" /> Your details stay with us.
          </p>
          <button
            type="submit"
            disabled={sending}
            className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-9 py-4 text-sm font-semibold tracking-wide text-white shadow-lg shadow-[#14245a]/20 transition hover:shadow-xl hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            style={{ background: NAVY }}
          >
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send enquiry
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
