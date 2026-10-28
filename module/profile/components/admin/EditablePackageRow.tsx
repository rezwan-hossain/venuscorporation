// module/profile/components/admin/EditablePackageRow.tsx
"use client";

import { useState } from "react";
import type { AdminPackage } from "@/types/profile";
import { updatePackage, deletePackage } from "@/app/actions/admin";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Props = {
  pkg: AdminPackage;
  onUpdate: () => void;
  onDelete: () => void;
};

export function EditablePackageRow({ pkg, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: pkg.name,
    distance: pkg.distance,
    price: String(pkg.price),
    availableSlots: String(pkg.availableSlots),
  });

  const handleSave = async () => {
    setLoading(true);
    const safeForm = JSON.parse(JSON.stringify(form));
    const result = await updatePackage(pkg.id, safeForm);
    if (!result.error) {
      onUpdate();
      setEditing(false);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${pkg.name}"?`)) return;
    setLoading(true);
    await deletePackage(pkg.id);
    onDelete();
    setLoading(false);
  };

  const inputClass =
    "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";

  // ─── Editing: four inputs + Save / Cancel ───
  if (editing) {
    return (
      <div className="space-y-3 rounded-xl bg-[#faf8f3] p-3 ring-2 ring-[#c49a3c]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className={inputClass}
          />
          <input
            value={form.distance}
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
            placeholder="Distance / duration"
            className={inputClass}
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Price"
            className={inputClass}
          />
          <input
            type="number"
            value={form.availableSlots}
            onChange={(e) =>
              setForm({ ...form, availableSlots: e.target.value })
            }
            placeholder="Slots"
            className={inputClass}
          />
        </div>
        <div className="flex gap-2">
          {/* type="button" so these don't submit the event form */}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-[#14245a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d3274] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              // Reset form to original values on cancel
              setForm({
                name: pkg.name,
                distance: pkg.distance,
                price: String(pkg.price),
                availableSlots: String(pkg.availableSlots),
              });
            }}
            className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
          >
            <X size={12} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── Normal row ───
  const filled =
    pkg.availableSlots > 0 ? pkg.usedSlots / pkg.availableSlots : 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200/70">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="rounded-full bg-[#c49a3c]/10 px-2 py-0.5 text-xs font-semibold text-[#a8852f]">
          {pkg.distance}
        </span>
        <span className="text-sm font-semibold text-[#14245a]">{pkg.name}</span>
        <span className="text-sm text-slate-500 tabular-nums">
          ৳{Number(pkg.price).toLocaleString()}
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-400 tabular-nums">
          {pkg.usedSlots}/{pkg.availableSlots} sold
          {/* Fill bar: gold, red when nearly full */}
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
            <span
              className={`block h-full rounded-full ${filled > 0.9 ? "bg-red-500" : "bg-[#c49a3c]"}`}
              style={{ width: `${Math.min(filled * 100, 100)}%` }}
            />
          </span>
        </span>
      </div>

      {/* Always visible (hover-only buttons can't be reached on phones) */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#14245a]"
          title="Edit package"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          title="Delete package"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
