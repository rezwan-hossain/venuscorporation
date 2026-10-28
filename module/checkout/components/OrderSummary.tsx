// module/checkout/components/OrderSummary.tsx
"use client";

import { CheckoutItem, AppliedCoupon } from "@/types/checkout";
import { CouponInput } from "./CouponInput";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";

interface OrderSummaryProps {
  item: CheckoutItem;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onPlaceOrder: () => void;
  loading: boolean;
  isFormValid: boolean; // Added prop

  // Coupon props
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon, finalPrice: number) => void;
  onRemoveCoupon: () => void;
  finalPrice: number;
}

const paymentMethods = [
  {
    id: "shurjopay",
    label: "SurjoPay",
    image: "/icons/shurjopay.png",
    description:
      "Pay securely via ShurjoPay. Supports bKash, Nagad, Rocket, Visa, Mastercard, and more. You will be redirected to complete your payment.",
  },
];

export const OrderSummary = ({
  item,
  paymentMethod,
  onPaymentMethodChange,
  onPlaceOrder,
  loading,
  isFormValid,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  finalPrice,
}: OrderSummaryProps) => {
  const subtotal = item.price * item.qty;
  const discount = appliedCoupon?.discountAmount || 0;
  const hasDiscount = discount > 0;

  const isButtonDisabled = loading || !isFormValid;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      {/* ── Event photo with the event name on top ── */}
      <div className="relative h-36 bg-[#14245a] sm:h-40">
        {item.eventImage && (
          <img
            src={item.eventImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1840]/90 via-[#0d1840]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2
            className="text-2xl leading-tight font-semibold text-white"
            style={{ fontFamily: "var(--font-checkout-serif)" }}
          >
            {item.eventName}
          </h2>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Ticket line */}
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-sm font-semibold text-[#14245a]">
              {item.packageName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {item.distance} · {item.qty} × ৳
              {item.price.toLocaleString("en-IN")}
            </p>
          </div>
          <p className="text-sm font-semibold whitespace-nowrap text-[#14245a]">
            ৳{subtotal.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Coupon Section */}
        <div className="mb-5 pb-5 border-b border-slate-100">
          <CouponInput
            eventId={item.eventId}
            orderAmount={subtotal}
            appliedCoupon={appliedCoupon}
            onApply={onApplyCoupon}
            onRemove={onRemoveCoupon}
            packageId={item.packageId}
          />
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 sm:space-y-3 pb-5 sm:pb-6 border-b border-slate-100">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              ৳{subtotal.toLocaleString()}
            </span>
          </div>

          {hasDiscount && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-green-600 font-medium">Discount</span>
              <span className="text-green-600 font-medium">
                −৳{discount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-end justify-between !mt-3 sm:!mt-4 pt-3 sm:pt-4 border-t border-slate-100">
            <span className="text-sm sm:text-base font-semibold text-[#14245a]">
              Total
            </span>
            <span
              className="text-3xl sm:text-4xl font-semibold text-[#14245a] leading-none lining-nums"
              style={{ fontFamily: "var(--font-checkout-serif)" }}
            >
              ৳{finalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          {hasDiscount && (
            <p className="text-xs text-green-600 text-right mt-1">
              You saved ৳{discount.toLocaleString()} 🎉
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="mb-6 sm:mb-8">
          <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#14245a] sm:mb-3 sm:text-xs">
            Payment method
          </p>
          <div className="space-y-2 sm:space-y-3">
            {paymentMethods.map((method) => {
              const isSelected = paymentMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onPaymentMethodChange(method.id)}
                  className={`w-full cursor-pointer text-left rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-[#c49a3c] bg-[#faf8f3] shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {/* Main row: radio indicator + image + label */}
                  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5">
                    {/* Custom radio indicator */}
                    <div
                      className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-[#14245a] bg-[#14245a]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#dcb45c]"
                          strokeWidth={3}
                        />
                      )}
                    </div>

                    {/* Payment logo */}
                    <div className="flex h-8 w-12 sm:h-10 sm:w-14 shrink-0 items-center justify-center rounded-md bg-gray-50 p-1">
                      <img
                        src={method.image}
                        alt={method.label}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {method.label}
                    </span>
                  </div>

                  {/* Expandable description */}
                  {isSelected && method.description && (
                    <div className="px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5 pt-0">
                      <div className="rounded-lg bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 text-xs leading-relaxed text-gray-500">
                        {method.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy Notice */}
        <p className="mb-6 sm:mb-8 text-xs leading-relaxed text-muted-foreground">
          Your personal data will be used to process your order. By clicking
          below you agree to our{" "}
          <Link
            href="/privacy-policy"
            className="underline decoration-[#c49a3c] text-[#14245a]"
          >
            privacy policy
          </Link>
          .
        </p>

        {/* Validation hint when form is invalid */}
        {!isFormValid && (
          <p className="mb-3 text-xs text-amber-600 text-center">
            Please fill in all required fields to continue
          </p>
        )}

        {/* Place Order Button */}
        <button
          onClick={onPlaceOrder}
          disabled={isButtonDisabled}
          className={`h-12 sm:h-13 w-full rounded-xl font-semibold text-sm sm:text-base tracking-wide transition-all flex items-center justify-center gap-2 ${
            isButtonDisabled
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "cursor-pointer bg-[#14245a] text-white hover:bg-[#1d3274] shadow-lg shadow-[#14245a]/20"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span className="text-xs sm:text-base">Processing...</span>
            </>
          ) : paymentMethod === "shurjopay" ? (
            `Pay ৳${finalPrice.toLocaleString()} with ShurjoPay`
          ) : (
            `Place Order – ৳${finalPrice.toLocaleString()}`
          )}
        </button>

        {/* Reassurance */}
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span aria-hidden>🔒</span> Secure payment via ShurjoPay
        </p>
      </div>
    </div>
  );
};
