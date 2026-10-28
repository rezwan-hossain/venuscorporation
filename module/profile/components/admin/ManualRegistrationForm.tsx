// module/profile/components/admin/ManualRegistrationForm.tsx
"use client";

// Admin → Orders → "Add manual": register someone without the payment gateway.
//
// The form follows the event's category (lib/event-checkout-form.ts), like
// checkout does:
//   1. Package       — every event
//   2. Contact       — every event (name, phone, email)
//   3. Race details  — marathons only (T-shirt only for in-person runs)
//      Event details — other events: their extra questions (company …)
//   4. Order         — status, BIB (marathons only), admin note
//
// The server (app/actions/manual-registration.ts) checks everything again.

import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, Info, Loader2, PackageX } from "lucide-react";

import {
  createManualRegistration,
  getEventPackages,
} from "@/app/actions/manual-registration";
import { tshirtSizes } from "@/module/checkout/data/tshirtSizes";
import {
  AGE_CATEGORIES,
  BLOOD_GROUPS,
  GENDERS,
  RUNNER_CATEGORIES,
  isValidBDPhone,
  isValidEmail,
} from "@/lib/registration-options";
import {
  asksQuestion,
  checkExtraAnswer,
  getEventCategory,
  getExtraQuestions,
  usesRaceFields,
  type ExtraQuestion,
} from "@/lib/event-checkout-form";
import type {
  AdminEvent,
  ManualPackage,
  ManualRegistrationInput,
} from "@/types/profile";

type Props = {
  event: AdminEvent;
  onCancel: () => void;
  onSuccess: () => void;
};

/**
 * No CANCELLED option: an admin never enters a registration that's already
 * cancelled. They cancel it afterwards from the order list.
 */
const STATUS_CHOICES = [
  {
    value: "CONFIRMED" as const,
    label: "Confirmed",
    hint: "Treated as paid — counts toward revenue",
  },
  {
    value: "PENDING" as const,
    label: "Pending",
    hint: "Holds the slot, not yet paid",
  },
];

const EMPTY_FORM: Omit<ManualRegistrationInput, "eventId"> = {
  packageId: 0,
  qty: 1,
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  birthDate: "",
  ageCategory: "",
  bloodGroup: "",
  tshirtSize: "",
  runnerCategory: "Amateur",
  communityName: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  bibNumber: "",
  details: {},
  discount: 0,
  orderStatus: "CONFIRMED",
  adminNote: "",
};

// Shared styles
const inputCls =
  "w-full h-10 sm:h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";
const selectCls = `${inputCls} cursor-pointer`;

export function ManualRegistrationForm({ event, onCancel, onSuccess }: Props) {
  const [packages, setPackages] = useState<ManualPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ManualRegistrationInput>({
    ...EMPTY_FORM,
    eventId: event.id,
  });

  // What this event asks (same rules as checkout)
  const isMarathon = usesRaceFields(event.category);
  const asksTshirt = asksQuestion(
    event.category,
    event.eventType,
    "T-shirt size",
  );
  const extraQuestions = getExtraQuestions(event.category, event.eventType);
  const categoryName = getEventCategory(event.category).label.split(" /")[0];

  /** Change one field of the form. */
  function set<K extends keyof ManualRegistrationInput>(
    key: K,
    value: ManualRegistrationInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /** Change one extra-question answer. */
  function setAnswer(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      details: { ...prev.details, [key]: value },
    }));
  }

  // Load live slot counts — the packages on `event` go stale the moment
  // anyone registers. Pre-select the first package with space left.
  useEffect(() => {
    let cancelled = false;
    getEventPackages(event.id).then(({ packages: data, error: err }) => {
      if (cancelled) return;
      if (err) setError(err);
      setPackages(data);
      const firstOpen = data.find(
        (p) => p.isActive && p.availableSlots - p.usedSlots > 0,
      );
      if (firstOpen) setForm((prev) => ({ ...prev, packageId: firstOpen.id }));
      setLoadingPackages(false);
    });
    return () => {
      cancelled = true;
    };
  }, [event.id]);

  // ─── Price ───
  const selected = packages.find((p) => p.id === form.packageId) ?? null;
  const slotsLeft = selected ? selected.availableSlots - selected.usedSlots : 0;
  const subtotal = selected ? selected.price * form.qty : 0;
  const discount = Math.min(
    Math.max(0, Math.round(form.discount || 0)),
    subtotal,
  );
  const total = subtotal - discount;

  // ─── Can it be saved? ───
  function isComplete() {
    // Every event
    if (!selected || form.qty < 1 || slotsLeft < form.qty) return false;
    if (form.fullName.trim().length < 2) return false;
    if (!isValidBDPhone(form.phone)) return false;
    if (form.email.trim() && !isValidEmail(form.email)) return false;

    // Marathons: race fields
    if (isMarathon) {
      if (!form.gender || !form.ageCategory || !form.bloodGroup) return false;
      if (!form.runnerCategory) return false;
      if (asksTshirt && !form.tshirtSize) return false;
      if (!form.birthDate || new Date(form.birthDate) >= new Date())
        return false;
      const emergency = form.emergencyContactNumber.trim();
      if (emergency && !isValidBDPhone(emergency)) return false;
    }

    // Extra questions (required ones answered, answers valid)
    return extraQuestions.every(
      (q) => checkExtraAnswer(q, form.details[q.key]) === "",
    );
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    const result = await createManualRegistration(form);
    if (!result.success) {
      setError(result.error ?? "Couldn't save the registration");
      setSaving(false);
      return;
    }
    onSuccess();
  }

  // ─── Loading / no packages ───
  if (loadingPackages) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#c49a3c]" />
        <p className="text-sm text-slate-400">Loading packages…</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white ring-1 ring-[#c49a3c]/30">
          <PackageX className="h-7 w-7 text-[#c49a3c]" />
        </div>
        <p className="text-lg font-semibold text-[#14245a]">No packages yet</p>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Add a package to this event before registering anyone.
        </p>
      </div>
    );
  }

  let step = 0; // section numbers, so they stay in order when one is hidden

  return (
    <div className="space-y-4 pb-2">
      {/* Title */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
          Manual registration · {categoryName}
        </p>
        <p className="mt-0.5 text-lg font-semibold text-[#14245a]">
          {event.name}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 ring-1 ring-red-100">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-xs font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* ─── Package ─── */}
      <Section step={++step} title="Package">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {packages.map((pkg) => (
            <PackageOption
              key={pkg.id}
              pkg={pkg}
              selected={form.packageId === pkg.id}
              onSelect={() => set("packageId", pkg.id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">
          <Field label="Quantity" required>
            <input
              type="number"
              min={1}
              max={Math.max(1, slotsLeft)}
              value={form.qty}
              onChange={(e) =>
                set("qty", Math.max(1, Number(e.target.value) || 1))
              }
              className={inputCls}
            />
          </Field>
          <Field label="Discount ৳" hint="Flat amount">
            <input
              type="number"
              min={0}
              value={form.discount}
              onChange={(e) => set("discount", Number(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>
          <div className="col-span-2 rounded-xl bg-[#faf8f3] p-3 ring-1 ring-[#c49a3c]/20">
            <PriceLine
              label="Subtotal"
              value={`৳${subtotal.toLocaleString()}`}
            />
            {discount > 0 && (
              <PriceLine
                label="Discount"
                value={`−৳${discount.toLocaleString()}`}
              />
            )}
            <div className="mt-2 flex justify-between border-t border-[#c49a3c]/20 pt-2 text-sm font-semibold text-[#14245a]">
              <span>Total</span>
              <span className="tabular-nums">৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {selected && slotsLeft < form.qty && (
          <p className="text-xs font-medium text-red-600">
            Only {slotsLeft} slot{slotsLeft === 1 ? "" : "s"} left in{" "}
            {selected.name}. Lower the quantity or pick another package.
          </p>
        )}
      </Section>

      {/* ─── Contact (every event) ─── */}
      <Section step={++step} title="Contact">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Rafiul Karim"
              className={inputCls}
            />
          </Field>
          <Field label="Contact number" required>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="01712345678"
              className={inputCls}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Email"
              hint="Optional — links to an existing account if one matches"
            >
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="name@example.com"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* ─── Race details (marathons only) ─── */}
      {isMarathon && (
        <Section step={++step} title="Race details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Gender" required>
              <OptionSelect
                value={form.gender}
                onChange={(v) => set("gender", v)}
                options={GENDERS}
                placeholder="Select gender"
              />
            </Field>
            <Field label="Date of birth" required>
              <input
                type="date"
                value={form.birthDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("birthDate", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Age category" required>
              <OptionSelect
                value={form.ageCategory}
                onChange={(v) => set("ageCategory", v)}
                options={AGE_CATEGORIES}
                placeholder="Select category"
              />
            </Field>
            <Field label="Blood group" required>
              <OptionSelect
                value={form.bloodGroup}
                onChange={(v) => set("bloodGroup", v)}
                options={BLOOD_GROUPS}
                placeholder="Select blood group"
              />
            </Field>
            {asksTshirt && (
              <Field label="T-shirt size" required>
                <select
                  value={form.tshirtSize}
                  onChange={(e) => set("tshirtSize", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select size</option>
                  {tshirtSizes.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.chest && s.length
                        ? `${s.value} (Chest ${s.chest}", Length ${s.length}")`
                        : s.value}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Runner category" required>
              <OptionSelect
                value={form.runnerCategory}
                onChange={(v) => set("runnerCategory", v)}
                options={RUNNER_CATEGORIES}
                placeholder="Select category"
              />
            </Field>
            <Field label="Community">
              <input
                value={form.communityName}
                onChange={(e) => set("communityName", e.target.value)}
                placeholder="Running club or team"
                className={inputCls}
              />
            </Field>
            <Field label="Emergency contact name">
              <input
                value={form.emergencyContactName}
                onChange={(e) => set("emergencyContactName", e.target.value)}
                placeholder="Who to call"
                className={inputCls}
              />
            </Field>
            <Field label="Emergency contact number">
              <input
                value={form.emergencyContactNumber}
                onChange={(e) => set("emergencyContactNumber", e.target.value)}
                placeholder="01712345678"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>
      )}

      {/* ─── Event details (other events: their extra questions) ─── */}
      {extraQuestions.length > 0 && (
        <Section step={++step} title={`${categoryName} details`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {extraQuestions.map((q) => (
              <div
                key={q.key}
                className={q.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <Field label={q.label} required={q.required}>
                  <QuestionInput
                    question={q}
                    value={form.details[q.key] ?? ""}
                    onChange={(v) => setAnswer(q.key, v)}
                  />
                </Field>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ─── Order ─── */}
      <Section step={++step} title="Order">
        {/* Not a <Field>: a label around buttons would press the first one */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-[#14245a] uppercase">
            Order status <span className="text-[#c49a3c]">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => set("orderStatus", choice.value)}
                className={`cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold ring-1 transition ${
                  form.orderStatus === choice.value
                    ? "bg-[#14245a] text-white ring-[#14245a]"
                    : "bg-white text-slate-500 ring-slate-200 hover:ring-[#c49a3c]"
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {STATUS_CHOICES.find((c) => c.value === form.orderStatus)?.hint}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isMarathon && (
            <Field label="BIB number" hint="Leave blank to assign later">
              <input
                value={form.bibNumber}
                onChange={(e) => set("bibNumber", e.target.value)}
                placeholder="e.g. 10K-042"
                className={inputCls}
              />
            </Field>
          )}
          <div className={isMarathon ? "" : "sm:col-span-2"}>
            <Field label="Note" hint="Only visible to admins">
              <input
                value={form.adminNote}
                onChange={(e) => set("adminNote", e.target.value)}
                placeholder="Cash at booth, sponsor comp…"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-[#faf8f3] p-3 ring-1 ring-[#c49a3c]/20">
          <Info size={14} className="mt-0.5 shrink-0 text-[#c49a3c]" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            Manual entries skip the payment gateway. The payment is recorded as{" "}
            <span className="font-semibold text-[#14245a]">MANUAL</span> and its
            status follows the order status above. To cancel, save the
            registration first, then change its status from the order list.
          </p>
        </div>
      </Section>

      {/* ─── Actions ─── */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isComplete() || saving}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d3274] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Saving…" : "Register participant"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Small pieces
// ════════════════════════════════════════════════════════════════════════

/** A white card with a numbered title. */
function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
      <header className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#c49a3c] text-[11px] font-semibold text-[#a8852f]">
          {step}
        </span>
        <h4 className="text-sm font-semibold text-[#14245a]">{title}</h4>
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

/** A label above an input, with an optional hint below. */
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-semibold tracking-wider text-[#14245a] uppercase">
        {label}
        {required && <span className="ml-0.5 text-[#c49a3c]">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>
      )}
    </label>
  );
}

/** A dropdown from a plain list of options. */
function OptionSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectCls}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/** The input for one extra question: dropdown, long text, number or text. */
function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: ExtraQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  if (question.type === "select") {
    return (
      <OptionSelect
        value={value}
        onChange={onChange}
        options={question.options ?? []}
        placeholder={`Select ${question.label.toLowerCase()}`}
      />
    );
  }
  if (question.type === "textarea") {
    return (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        className={`${inputCls} h-auto resize-none py-2`}
      />
    );
  }
  return (
    <input
      type={question.type === "number" ? "number" : "text"}
      min={question.type === "number" ? 1 : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      className={inputCls}
    />
  );
}

/** One package card: name, price, distance, slots left. */
function PackageOption({
  pkg,
  selected,
  onSelect,
}: {
  pkg: ManualPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const left = pkg.availableSlots - pkg.usedSlots;
  const soldOut = left < 1;
  const disabled = !pkg.isActive || soldOut;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`rounded-xl p-3 text-left ring-1 transition ${
        selected
          ? "bg-[#faf8f3] ring-2 ring-[#c49a3c]"
          : disabled
            ? "cursor-not-allowed bg-slate-50 opacity-60 ring-slate-100"
            : "cursor-pointer bg-white ring-slate-200 hover:ring-slate-300"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-semibold text-[#14245a]">
          {pkg.name}
        </span>
        <span className="shrink-0 text-sm font-semibold text-[#14245a] tabular-nums">
          ৳{pkg.price.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
        <span>{pkg.distance}</span>
        <span className="text-slate-300">·</span>
        <span className={soldOut ? "font-semibold text-red-500" : ""}>
          {soldOut ? "Sold out" : `${left} left`}
        </span>
        {!pkg.isActive && (
          <span className="font-semibold text-red-500">Inactive</span>
        )}
      </div>
    </button>
  );
}

/** "Subtotal ……… ৳1,000" */
function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11px] text-slate-500">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
