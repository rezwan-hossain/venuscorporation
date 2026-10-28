// module/profile/components/admin/CouponDiscountStub.tsx
//
// The navy left part of a coupon card ("20% OFF"). Used by the coupon list
// (AdminCouponsPanel) and the live preview in CouponForm.

/** "20%" or "৳500" */
export const discountText = (type: "PERCENTAGE" | "FIXED", value: number) =>
  type === "PERCENTAGE" ? `${value}%` : `৳${value.toLocaleString()}`;

/** The navy left part of a coupon: the discount in big gold type. */
export function DiscountStub({
  type,
  value,
  muted = false,
}: {
  type: "PERCENTAGE" | "FIXED";
  value: number;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex w-24 shrink-0 flex-col items-center justify-center px-2 py-4 text-center sm:w-28 ${
        muted ? "bg-slate-400" : "bg-[#14245a]"
      }`}
    >
      <span className="text-2xl leading-none font-semibold text-[#dcb45c] tabular-nums sm:text-3xl">
        {discountText(type, value)}
      </span>
      <span className="mt-1 text-[10px] font-semibold tracking-[0.25em] text-white/70 uppercase">
        Off
      </span>
    </div>
  );
}
