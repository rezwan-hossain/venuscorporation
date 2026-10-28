// module/profile/components/admin/CouponForm.tsx
"use client";

import { useState, useEffect } from "react";
import type { Coupon, CouponEvent } from "./AdminCouponsPanel";
import { DiscountStub } from "./CouponDiscountStub";
import {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  getPackagesForEvent,
} from "@/app/actions/coupon";
import Input from "@/components/ui/input";
import { Check, Loader2, Save } from "lucide-react";

type CouponFormProps = {
  coupon: Coupon | null;
  events: CouponEvent[];
  onSuccess: (coupons: Coupon[]) => void;
  onCancel: () => void;
};

type EventPackage = {
  id: number;
  name: string;
  distance: string;
  price: number;
};

type FormData = {
  code: string;
  eventId: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  maxUses: string;
  maxUsesPerUser: string;
  minOrderAmount: string;
  maxDiscount: string;
  validFrom: string;
  validUntil: string;
  scopeType: "EVENT" | "PACKAGE";
  packageIds: number[];
};

export function CouponForm({
  coupon,
  events,
  onSuccess,
  onCancel,
}: CouponFormProps) {
  const isEditing = !!coupon;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Package state
  const [eventPackages, setEventPackages] = useState<EventPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  const [form, setForm] = useState<FormData>({
    code: coupon?.code || "",
    eventId: coupon?.event.id || "",
    discountType: coupon?.discountType || "PERCENTAGE",
    discountValue: coupon?.discountValue?.toString() || "",
    maxUses: coupon?.maxUses?.toString() || "",
    maxUsesPerUser: coupon?.maxUsesPerUser?.toString() || "1",
    minOrderAmount: coupon?.minOrderAmount?.toString() || "",
    maxDiscount: coupon?.maxDiscount?.toString() || "",
    validFrom: coupon?.validFrom
      ? new Date(coupon.validFrom).toISOString().slice(0, 16)
      : "",
    validUntil: coupon?.validUntil
      ? new Date(coupon.validUntil).toISOString().slice(0, 16)
      : "",
    scopeType: coupon?.scopeType || "EVENT",
    packageIds: coupon?.packages?.map((p) => p.id) || [],
  });

  // Load packages when event changes
  useEffect(() => {
    const loadPackages = async () => {
      if (!form.eventId) {
        setEventPackages([]);
        return;
      }

      setLoadingPackages(true);
      const { packages } = await getPackagesForEvent(form.eventId);
      setEventPackages(packages as EventPackage[]);
      setLoadingPackages(false);
    };

    loadPackages();
  }, [form.eventId]);

  const updateField = (field: keyof FormData, value: string | number[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  };

  const handleEventChange = (eventId: string) => {
    updateField("eventId", eventId);
    // Reset package selection when event changes
    updateField("packageIds", []);
  };

  const togglePackage = (packageId: number) => {
    const current = form.packageIds;
    const updated = current.includes(packageId)
      ? current.filter((id) => id !== packageId)
      : [...current, packageId];
    updateField("packageIds", updated);
  };

  const selectAllPackages = () => {
    updateField(
      "packageIds",
      eventPackages.map((p) => p.id),
    );
  };

  const clearAllPackages = () => {
    updateField("packageIds", []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!form.code) {
      setError("Coupon code is required");
      return;
    }
    if (!form.eventId) {
      setError("Event is required");
      return;
    }
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) {
      setError("Discount value is required");
      return;
    }
    if (!form.validFrom) {
      setError("Valid from date is required");
      return;
    }
    if (!form.validUntil) {
      setError("Valid until date is required");
      return;
    }
    if (new Date(form.validFrom) >= new Date(form.validUntil)) {
      setError("Valid until must be after valid from");
      return;
    }

    // Package scope validation
    if (form.scopeType === "PACKAGE" && form.packageIds.length === 0) {
      setError(
        "Please select at least one package for package-specific coupon",
      );
      return;
    }

    setLoading(true);

    try {
      let result;

      if (isEditing && coupon) {
        result = await updateCoupon(coupon.id, {
          code: form.code,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          maxUsesPerUser: parseInt(form.maxUsesPerUser) || 1,
          minOrderAmount: form.minOrderAmount
            ? parseFloat(form.minOrderAmount)
            : null,
          maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
          validFrom: new Date(form.validFrom),
          validUntil: new Date(form.validUntil),
          scopeType: form.scopeType,
          packageIds: form.scopeType === "PACKAGE" ? form.packageIds : [],
        });
      } else {
        result = await createCoupon({
          code: form.code,
          eventId: form.eventId,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          maxUsesPerUser: parseInt(form.maxUsesPerUser) || 1,
          minOrderAmount: form.minOrderAmount
            ? parseFloat(form.minOrderAmount)
            : undefined,
          maxDiscount: form.maxDiscount
            ? parseFloat(form.maxDiscount)
            : undefined,
          validFrom: new Date(form.validFrom),
          validUntil: new Date(form.validUntil),
          scopeType: form.scopeType,
          packageIds: form.scopeType === "PACKAGE" ? form.packageIds : [],
        });
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      const { coupons } = await getAllCoupons();
      onSuccess(coupons as Coupon[]);
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  // Live preview of the coupon card
  const previewValue = parseFloat(form.discountValue) || 0;
  const previewEvent = events.find((e) => e.id === form.eventId)?.name;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ─── Header + live preview ─── */}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
          Promotions
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#14245a]">
          {isEditing ? "Edit coupon" : "New coupon"}
        </p>
      </div>

      <div className="flex overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
        <DiscountStub type={form.discountType} value={previewValue} />
        <div className="w-0 border-l-2 border-dashed border-slate-200" />
        <div className="min-w-0 p-4">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Preview
          </p>
          <p className="mt-1 font-mono text-lg font-bold tracking-wider text-[#14245a]">
            {form.code || "YOURCODE"}
          </p>
          <p className="truncate text-sm text-slate-500">
            {previewEvent ?? "Choose an event"}
            {" · "}
            {form.scopeType === "EVENT"
              ? "all packages"
              : `${form.packageIds.length} package${form.packageIds.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {/* ─── 1. Code and event ─── */}
      <FormSection number={1} title="Code and event">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Coupon code" required>
            <Input
              value={form.code}
              onChange={(e) =>
                updateField("code", e.target.value.toUpperCase())
              }
              placeholder="e.g. SUMMER20"
              className={`${inputClass} font-mono tracking-wider uppercase`}
            />
          </FormField>
          <FormField
            label="Event"
            required
            hint={isEditing ? "Can't be changed after creating" : undefined}
          >
            <select
              value={form.eventId}
              onChange={(e) => handleEventChange(e.target.value)}
              disabled={isEditing}
              className={`${inputClass} w-full cursor-pointer px-3 disabled:cursor-not-allowed disabled:bg-slate-50`}
            >
              <option value="">Select event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* ─── 2. Discount ─── */}
      <FormSection number={2} title="Discount">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                value: "PERCENTAGE",
                label: "Percentage",
                hint: "e.g. 20% off",
              },
              { value: "FIXED", label: "Fixed amount", hint: "e.g. ৳500 off" },
            ] as const
          ).map((option) => (
            <ChoiceCard
              key={option.value}
              selected={form.discountType === option.value}
              onClick={() => updateField("discountType", option.value)}
              title={option.label}
              text={option.hint}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            label={
              form.discountType === "PERCENTAGE" ? "Discount %" : "Discount ৳"
            }
            required
          >
            <Input
              type="number"
              value={form.discountValue}
              onChange={(e) => updateField("discountValue", e.target.value)}
              placeholder={form.discountType === "PERCENTAGE" ? "20" : "500"}
              className={inputClass}
              min="0"
            />
          </FormField>
          <FormField label="Max discount ৳" hint="Cap for % coupons">
            <Input
              type="number"
              value={form.maxDiscount}
              onChange={(e) => updateField("maxDiscount", e.target.value)}
              placeholder="No cap"
              className={inputClass}
              min="0"
            />
          </FormField>
          <FormField label="Min order ৳">
            <Input
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => updateField("minOrderAmount", e.target.value)}
              placeholder="No minimum"
              className={inputClass}
              min="0"
            />
          </FormField>
        </div>
      </FormSection>

      {/* ─── 3. Which packages ─── */}
      <FormSection number={3} title="Which packages">
        <div className="grid grid-cols-2 gap-2">
          <ChoiceCard
            selected={form.scopeType === "EVENT"}
            onClick={() => updateField("scopeType", "EVENT")}
            title="All packages"
            text="Works for the whole event"
          />
          <ChoiceCard
            selected={form.scopeType === "PACKAGE"}
            onClick={() => updateField("scopeType", "PACKAGE")}
            title="Some packages"
            text="Pick them below"
          />
        </div>

        {form.scopeType === "PACKAGE" && (
          <div>
            {!form.eventId ? (
              <p className="text-sm text-slate-500">Choose an event first.</p>
            ) : loadingPackages ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading packages…
              </p>
            ) : eventPackages.length === 0 ? (
              <p className="text-sm text-slate-500">
                This event has no packages.
              </p>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {form.packageIds.length} of {eventPackages.length} selected
                  </span>
                  <span className="flex gap-3">
                    <button
                      type="button"
                      onClick={selectAllPackages}
                      className="cursor-pointer font-semibold text-[#14245a] hover:underline"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={clearAllPackages}
                      className="cursor-pointer text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {eventPackages.map((pkg) => {
                    const isSelected = form.packageIds.includes(pkg.id);
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => togglePackage(pkg.id)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 text-left ring-1 transition ${
                          isSelected
                            ? "bg-[#faf8f3] ring-2 ring-[#c49a3c]"
                            : "bg-white ring-slate-200 hover:ring-slate-300"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                            isSelected
                              ? "bg-[#14245a] text-[#dcb45c]"
                              : "border border-slate-300"
                          }`}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#14245a]">
                            {pkg.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {pkg.distance} · ৳{pkg.price.toLocaleString()}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </FormSection>

      {/* ─── 4. Limits and dates ─── */}
      <FormSection number={4} title="Limits and dates">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Total uses" hint="Empty = unlimited">
            <Input
              type="number"
              value={form.maxUses}
              onChange={(e) => updateField("maxUses", e.target.value)}
              placeholder="Unlimited"
              className={inputClass}
              min="1"
            />
          </FormField>
          <FormField label="Uses per person">
            <Input
              type="number"
              value={form.maxUsesPerUser}
              onChange={(e) => updateField("maxUsesPerUser", e.target.value)}
              placeholder="1"
              className={inputClass}
              min="1"
            />
          </FormField>
          <FormField label="Starts" required>
            <Input
              type="datetime-local"
              value={form.validFrom}
              onChange={(e) => updateField("validFrom", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Ends" required>
            <Input
              type="datetime-local"
              value={form.validUntil}
              onChange={(e) => updateField("validUntil", e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      </FormSection>

      {/* ─── Save ─── */}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
          <Check className="h-4 w-4" />
          Coupon {isEditing ? "updated" : "created"}.
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1d3274] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEditing ? "Save changes" : "Create coupon"}
        </button>
      </div>
    </form>
  );
}

// ─── Small pieces ────────────────────────────────────

const inputClass =
  "h-11 rounded-xl border border-slate-200 bg-white focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";

/** A white card with a numbered title. */
function FormSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c49a3c] text-xs font-semibold text-[#a8852f]">
          {number}
        </span>
        <p className="text-lg font-semibold text-[#14245a]">{title}</p>
      </div>
      {children}
    </section>
  );
}

/** A label above an input, with an optional hint below. */
function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] text-[#14245a] uppercase">
        {label}
        {required && <span className="ml-0.5 text-[#c49a3c]">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      )}
    </label>
  );
}

/** One of two side-by-side choices (discount type, which packages). */
function ChoiceCard({
  selected,
  onClick,
  title,
  text,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-3 text-left ring-1 transition ${
        selected
          ? "bg-[#faf8f3] ring-2 ring-[#c49a3c]"
          : "bg-white ring-slate-200 hover:ring-slate-300"
      }`}
    >
      <span className="block text-sm font-semibold text-[#14245a]">
        {title}
      </span>
      <span className="mt-0.5 block text-xs text-slate-500">{text}</span>
    </button>
  );
}
