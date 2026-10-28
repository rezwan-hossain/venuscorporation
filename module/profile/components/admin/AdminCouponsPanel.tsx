// module/profile/components/admin/AdminCouponsPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
} from "@/app/actions/coupon";
import { CouponForm } from "./CouponForm";
import { DiscountStub } from "./CouponDiscountStub";
import {
  Plus,
  ArrowLeft,
  Tag,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  Package,
} from "lucide-react";

// Updated types
export type CouponPackage = {
  id: number;
  name: string;
  distance: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  scopeType: "EVENT" | "PACKAGE";
  event: { id: string; name: string };
  packages: CouponPackage[];
  _count: { usages: number };
};

export type CouponEvent = { id: string; name: string };

type Props = {
  initialCoupons: Coupon[];
  events: CouponEvent[];
};

type View = "list" | "create" | "edit";

// ─── Status ──────────────────────────────────────────

type CouponStatus = "active" | "scheduled" | "expired" | "used-up" | "off";

/** Where a coupon is in its life, as one word for the badge and filters. */
export function couponStatus(coupon: Coupon): CouponStatus {
  const now = new Date();
  if (new Date(coupon.validUntil) < now) return "expired";
  if (coupon.maxUses && coupon._count.usages >= coupon.maxUses)
    return "used-up";
  if (!coupon.isActive) return "off";
  if (new Date(coupon.validFrom) > now) return "scheduled";
  return "active";
}

const STATUS_BADGE: Record<CouponStatus, { label: string; className: string }> =
  {
    active: { label: "Active", className: "bg-emerald-50 text-emerald-700" },
    scheduled: { label: "Scheduled", className: "bg-amber-50 text-amber-700" },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-500" },
    "used-up": { label: "Used up", className: "bg-slate-100 text-slate-500" },
    off: { label: "Turned off", className: "bg-red-50 text-red-600" },
  };

const FILTERS: { value: "all" | CouponStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "off", label: "Turned off" },
  { value: "expired", label: "Expired" },
];

const shortDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── Panel ───────────────────────────────────────────

export function AdminCouponsPanel({ initialCoupons, events }: Props) {
  const [view, setView] = useState<View>("list");
  const [coupons, setCoupons] = useState(initialCoupons);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [filter, setFilter] = useState<"all" | CouponStatus>("all");

  // Numbers for the stat tiles and filter tabs
  const countOf = (status: CouponStatus) =>
    coupons.filter((c) => couponStatus(c) === status).length;
  const totalUsages = coupons.reduce((sum, c) => sum + c._count.usages, 0);
  const shown =
    filter === "all"
      ? coupons
      : coupons.filter((c) => couponStatus(c) === filter);

  const refreshCoupons = async () => {
    const { coupons: updated } = await getAllCoupons();
    setCoupons(updated as Coupon[]);
    return updated as Coupon[];
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setView("create");
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setEditingCoupon(null);
  };

  const handleSuccess = (updatedCoupons: Coupon[]) => {
    setCoupons(updatedCoupons);
    setView("list");
    setEditingCoupon(null);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setLoadingId(coupon.id);
    await updateCoupon(coupon.id, { isActive: !coupon.isActive });
    await refreshCoupons();
    setLoadingId(null);
  };

  const handleDelete = async (coupon: Coupon) => {
    setConfirmDelete(null);
    setFlash(null);
    setLoadingId(coupon.id);
    const result = await deleteCoupon(coupon.id);
    if (result.success) {
      await refreshCoupons();
      setFlash({ ok: true, text: result.message ?? `${coupon.code} deleted.` });
    } else {
      setFlash({ ok: false, text: result.error ?? "Failed to delete coupon." });
    }
    setLoadingId(null);
  };

  return (
    <div>
      {confirmDelete && (
        <DeleteCouponDialog
          coupon={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}
      {flash && (
        <div
          className={`mb-4 flex items-start justify-between gap-2 rounded-xl p-3 text-sm font-medium ring-1 ${
            flash.ok
              ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
              : "bg-red-50 text-red-700 ring-red-100"
          }`}
          role="status"
        >
          <span>{flash.text}</span>
          <button
            onClick={() => setFlash(null)}
            className="cursor-pointer opacity-60 hover:opacity-100"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="mb-6 flex items-end justify-between gap-4">
        {view === "list" ? (
          <>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
                Promotions
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#14245a]">
                Coupons
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Discount codes people enter at checkout.
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3274]"
            >
              <Plus size={16} />
              New coupon
            </button>
          </>
        ) : (
          <button
            onClick={handleBack}
            className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#14245a]"
          >
            <ArrowLeft size={16} />
            Back to coupons
          </button>
        )}
      </div>

      {view === "list" && (
        <>
          {/* ─── Stat tiles ─── */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Coupons", value: coupons.length, icon: Tag },
              {
                label: "Active now",
                value: countOf("active"),
                icon: ToggleRight,
              },
              { label: "Expired", value: countOf("expired"), icon: Calendar },
              { label: "Times used", value: totalUsages, icon: Users },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70"
              >
                <div className="flex items-center gap-1.5">
                  <stat.icon size={14} className="text-[#c49a3c]" />
                  <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-1 text-2xl font-semibold text-[#14245a] tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* ─── Filter tabs ─── */}
          {coupons.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const count =
                  f.value === "all" ? coupons.length : countOf(f.value);
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                      filter === f.value
                        ? "bg-[#14245a] text-white"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#c49a3c]"
                    }`}
                  >
                    {f.label}{" "}
                    <span
                      className={
                        filter === f.value ? "text-[#dcb45c]" : "text-slate-400"
                      }
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── Coupons ─── */}
          {coupons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] p-12 text-center">
              <Tag className="mx-auto mb-4 h-10 w-10 text-[#c49a3c]" />
              <p className="text-lg font-semibold text-[#14245a]">
                No coupons yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Create a code to give people a discount at checkout.
              </p>
            </div>
          ) : shown.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200/70">
              No coupons here.
            </p>
          ) : (
            <div className="space-y-3">
              {shown.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  busy={loadingId === coupon.id}
                  onToggle={() => handleToggleActive(coupon)}
                  onEdit={() => handleEdit(coupon)}
                  onDelete={() => setConfirmDelete(coupon)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {(view === "create" || view === "edit") && (
        <CouponForm
          coupon={editingCoupon}
          events={events}
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// ─── One coupon, styled like a ticket ────────────────

function CouponCard({
  coupon,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: {
  coupon: Coupon;
  busy: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = couponStatus(coupon);
  const badge = STATUS_BADGE[status];
  const finished = status === "expired" || status === "used-up";
  const used = coupon._count.usages;

  // Rules under the code: "Max ৳500 · Min order ৳1,000 · 1 per person"
  const rules = [
    coupon.maxDiscount ? `Max ৳${coupon.maxDiscount.toLocaleString()}` : null,
    coupon.minOrderAmount
      ? `Min order ৳${coupon.minOrderAmount.toLocaleString()}`
      : null,
    `${coupon.maxUsesPerUser} per person`,
  ].filter(Boolean);

  return (
    <div
      className={`flex overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 transition hover:shadow-lg hover:shadow-[#14245a]/5 ${
        finished ? "opacity-70" : ""
      }`}
    >
      <DiscountStub
        type={coupon.discountType}
        value={coupon.discountValue}
        muted={finished}
      />

      {/* Perforation between the stub and the details */}
      <div className="relative w-0 border-l-2 border-dashed border-slate-200">
        <span className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-[#faf8f3]" />
        <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-[#faf8f3]" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-start">
        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#faf8f3] px-2 py-0.5 font-mono text-base font-bold tracking-wider text-[#14245a] ring-1 ring-[#c49a3c]/30">
              {coupon.code}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>

          <p className="mt-2 truncate text-sm font-medium text-[#14245a]">
            {coupon.event.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{rules.join(" · ")}</p>

          {/* Which packages */}
          <div className="mt-2 flex flex-wrap gap-1">
            {coupon.scopeType === "PACKAGE" ? (
              coupon.packages.map((pkg) => (
                <span
                  key={pkg.id}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600"
                >
                  <Package size={10} className="text-slate-400" />
                  {pkg.name} · {pkg.distance}
                </span>
              ))
            ) : (
              <span className="rounded-md bg-[#c49a3c]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#a8852f]">
                All packages
              </span>
            )}
          </div>

          {/* Dates and usage */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-[#c49a3c]" />
              {shortDate(coupon.validFrom)} – {shortDate(coupon.validUntil)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={12} className="text-[#c49a3c]" />
              {used}
              {coupon.maxUses ? ` / ${coupon.maxUses}` : ""} used
            </span>
            {coupon.maxUses ? (
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-[#c49a3c]"
                  style={{
                    width: `${Math.min(100, (used / coupon.maxUses) * 100)}%`,
                  }}
                />
              </span>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <>
              <button
                type="button"
                onClick={onToggle}
                className={`cursor-pointer rounded-lg p-2 transition ${
                  coupon.isActive
                    ? "text-emerald-600 hover:bg-red-50 hover:text-red-600"
                    : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                }`}
                title={coupon.isActive ? "Turn off" : "Turn on"}
              >
                {coupon.isActive ? (
                  <ToggleRight size={18} />
                ) : (
                  <ToggleLeft size={18} />
                )}
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#14245a]"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirmation ─────────────────────────────
function DeleteCouponDialog({
  coupon,
  onCancel,
  onConfirm,
}: {
  coupon: Coupon;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const used = coupon._count.usages;

  useEffect(() => {
    cancelRef.current?.focus(); // a stray Enter shouldn't delete
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-coupon-title"
    >
      <div
        className="absolute inset-0 bg-[#0d1840]/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div className="min-w-0">
            <p
              id="delete-coupon-title"
              className="text-base font-semibold text-[#14245a]"
            >
              Delete coupon <span className="font-mono">{coupon.code}</span>?
            </p>
            <p className="text-sm text-gray-600 mt-1.5">
              {used > 0
                ? `It has been used ${used} time${used === 1 ? "" : "s"}, so it will be removed from this list and can't be used again. Orders that used it keep it in their history.`
                : "It has never been used and will be permanently deleted."}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
          >
            Delete coupon
          </button>
        </div>
      </div>
    </div>
  );
}
