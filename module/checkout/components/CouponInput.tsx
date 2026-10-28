// module/checkout/components/CouponInput.tsx
"use client";

import { useState } from "react";
import { validateCoupon } from "@/app/actions/coupon";
import { AppliedCoupon } from "@/types/checkout";
import { Loader2, Tag, X, Check } from "lucide-react";

type CouponInputProps = {
  eventId: string;
  packageId: number;
  orderAmount: number;
  appliedCoupon: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon, finalPrice: number) => void;
  onRemove: () => void;
};

export function CouponInput({
  eventId,
  orderAmount,
  appliedCoupon,
  packageId,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await validateCoupon(
        code,
        eventId,
        packageId,
        orderAmount,
      );

      if (!result.valid || !result.coupon) {
        setError(result.error || "Invalid coupon");
        setLoading(false);
        return;
      }

      onApply(
        {
          code: result.coupon.code,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
          discountAmount: result.discountAmount!,
        },
        result.finalPrice!,
      );

      setSuccess(`Coupon applied! You save ৳${result.discountAmount}`);
      setCode("");
    } catch {
      setError("Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setSuccess("");
    setError("");
  };

  // ── Applied state ──
  if (appliedCoupon) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-3 sm:p-4">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Tag className="h-4 w-4 text-green-600 shrink-0" />
            <span className="font-medium text-green-800 text-sm sm:text-base">
              {appliedCoupon.code}
            </span>
            <span className="text-xs sm:text-sm text-green-600">
              {appliedCoupon.discountType === "PERCENTAGE"
                ? `${appliedCoupon.discountValue}% off`
                : `৳${appliedCoupon.discountValue} off`}
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="text-green-600 hover:text-green-800 p-1 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-green-600 mt-1">
          You save ৳{appliedCoupon.discountAmount}
        </p>
      </div>
    );
  }

  // ── Input state ──
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#14245a] sm:text-xs">
        Have a coupon code?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="Enter coupon code"
          className="h-11 min-w-0 flex-1 px-3 border border-slate-200 rounded-xl outline-none transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 uppercase text-sm placeholder:normal-case"
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="h-11 px-5 bg-[#14245a] text-white font-semibold rounded-xl cursor-pointer hover:bg-[#0d1840] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </p>
      )}
    </div>
  );
}
