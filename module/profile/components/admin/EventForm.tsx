// module/profile/components/admin/EventForm.tsx
"use client";

import { useState } from "react";
import type {
  AdminEvent,
  AdminOrganizer,
  EventFormData,
  PackageFormData,
} from "@/types/profile";
import {
  createEvent,
  updateEvent,
  addPackage,
  getAdminEvents,
  createOrganizer,
} from "@/app/actions/admin";
import { EditablePackageRow } from "./EditablePackageRow";
import Input from "@/components/ui/input";
import { Check, Loader2, Plus, Save, X } from "lucide-react";
import dynamic from "next/dynamic";
import { ImageVpsUpload } from "./ImageVpsUpload";
import {
  DEFAULT_EVENT_CATEGORY,
  EVENT_CATEGORIES,
  getCheckoutQuestions,
} from "@/lib/event-checkout-form";
import { ImageUploadCloudinary } from "./ImageUploadCloudinary";

const RichTextEditor = dynamic(
  () =>
    import("./RichTextEditor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="h-11 animate-pulse border-b border-slate-200 bg-slate-50" />
        <div className="h-[220px] animate-pulse bg-white" />
      </div>
    ),
  },
);

// Names shown in "… is required" messages
const FIELD_LABELS: Partial<Record<keyof EventFormData, string>> = {
  name: "Event name",
  slug: "Page link",
  date: "Date",
  time: "Start time",
  address: "Venue / address",
  description: "Description",
  bannerImage: "Banner image",
  organizerId: "Organizer",
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active", hint: "On sale" },
  { value: "INACTIVE", label: "Inactive", hint: "Hidden from sale" },
  { value: "COMPLETED", label: "Completed", hint: "Shown as a past event" },
  { value: "CANCELLED", label: "Cancelled", hint: "Called off" },
];

// Shared styles
const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";

type EventFormProps = {
  event: AdminEvent | null;
  organizers: AdminOrganizer[];
  onSuccess: (events: AdminEvent[]) => void;
  onCancel: () => void;
};

export function EventForm({
  event,
  organizers,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const isEditing = !!event;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Event form
  const [form, setForm] = useState<EventFormData>({
    name: event?.name || "",
    slug: event?.slug || "",
    date: event?.date ? new Date(event.date).toISOString().split("T")[0] : "",
    // time: event?.time
    //   ? new Date(event.time).toLocaleTimeString("en-GB", {
    //       hour: "2-digit",
    //       minute: "2-digit",
    //     })
    //   : "",
    // <input type="time"> needs 24h "HH:mm"; event times are stored as UTC
    // wall-clock time (see formatEventTimeUTC), so read the UTC hours/minutes.
    time: event?.time ? new Date(event.time).toISOString().slice(11, 16) : "",
    address: event?.address || "",
    eventType: event?.eventType || "LIVE",
    category: event?.category || DEFAULT_EVENT_CATEGORY,
    description: event?.description || "",
    shortDesc: event?.shortDesc || "",
    bannerImage: event?.bannerImage || "",
    thumbImage: event?.thumbImage || "",
    minPackagePrice: event?.minPackagePrice?.toString() || "",
    organizerId: event?.organizerId?.toString() || "",
    status: event?.status || "ACTIVE",
  });

  // Packages
  const [packages, setPackages] = useState(event?.packages || []);
  const [newPackage, setNewPackage] = useState<PackageFormData>({
    name: "",
    distance: "",
    price: "",
    availableSlots: "",
  });
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [pkgLoading, setPkgLoading] = useState<number | null>(null);

  // New organizer
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: "",
    email: "",
    phone: "",
    logo: "",
  });
  const [orgList, setOrgList] = useState(organizers);

  const updateField = (field: keyof EventFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);

    if (field === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  // ─── Refresh packages from server ─────────────────
  const refreshPackages = async () => {
    if (!event) return;
    const { events } = await getAdminEvents();
    const updated = events.find((e: AdminEvent) => e.id === event.id);
    if (updated) {
      setPackages(updated.packages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const required: (keyof EventFormData)[] = [
      "name",
      "slug",
      "date",
      "time",
      "address",
      "description",
      "bannerImage",
      "organizerId",
    ];
    for (const field of required) {
      if (!form[field]) {
        setError(`${FIELD_LABELS[field] ?? field} is required`);
        return;
      }
    }

    setLoading(true);

    const safeForm = JSON.parse(JSON.stringify(form));

    let result;
    if (isEditing && event) {
      result = await updateEvent(event.id, safeForm);
    } else {
      result = await createEvent(safeForm);
    }

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    const { events } = await getAdminEvents();
    onSuccess(events);
  };

  const handleAddPackage = async () => {
    if (!event) return;
    if (
      !newPackage.name ||
      !newPackage.distance ||
      !newPackage.price ||
      !newPackage.availableSlots
    ) {
      setError("All package fields are required");
      return;
    }

    setPkgLoading(-1);
    setError("");
    const safeArgs = JSON.parse(JSON.stringify(newPackage));
    const result = await addPackage(event.id, safeArgs);

    if (result.error) {
      setError(result.error);
    } else {
      await refreshPackages();
      setNewPackage({ name: "", distance: "", price: "", availableSlots: "" });
      setShowAddPackage(false);
    }
    setPkgLoading(null);
  };

  const handleCreateOrganizer = async () => {
    if (!newOrg.name) return;
    const safeArgs = JSON.parse(JSON.stringify(newOrg));
    const result = await createOrganizer(safeArgs);
    if (result.error) {
      setError(result.error);
    } else {
      setOrgList((prev) => [
        ...prev,
        {
          id: result.organizerId!,
          name: newOrg.name,
          email: newOrg.email,
          phone: newOrg.phone,
          logo: newOrg.logo,
        },
      ]);
      setForm((prev) => ({
        ...prev,
        organizerId: String(result.organizerId),
      }));
      setShowNewOrg(false);
      setNewOrg({ name: "", email: "", phone: "", logo: "" });
    }
  };

  const checkoutQuestions = getCheckoutQuestions(form.category, form.eventType);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ─── Header ─── */}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
          Events
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#14245a]">
          {isEditing ? `Edit ${event.name}` : "New event"}
        </p>
        {!isEditing && (
          <p className="mt-1 text-sm text-slate-500">
            Fill in the details, create the event, then add its packages.
          </p>
        )}
      </div>

      {/* ─── 1. Kind of event ───
          Category + format decide which questions checkout asks
          (lib/event-checkout-form.ts). */}
      <FormSection number={1} title="Kind of event">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_CATEGORIES.map((category) => (
            <ChoiceCard
              key={category.value}
              selected={form.category === category.value}
              onClick={() => updateField("category", category.value)}
              title={category.label}
              text={category.description}
            />
          ))}
        </div>

        <div>
          <p className={labelClass}>Format</p>
          <div className="grid grid-cols-2 gap-2.5">
            <ChoiceCard
              selected={form.eventType === "LIVE"}
              onClick={() => updateField("eventType", "LIVE")}
              title="In person"
              text="At a venue"
            />
            <ChoiceCard
              selected={form.eventType === "VIRTUAL"}
              onClick={() => updateField("eventType", "VIRTUAL")}
              title="Virtual"
              text="Online / from anywhere"
            />
          </div>
        </div>

        {/* What ticket buyers will be asked */}
        <div className="rounded-xl bg-[#faf8f3] p-3 ring-1 ring-[#c49a3c]/20">
          <p className="text-xs font-semibold text-[#14245a]">
            Checkout will ask
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {checkoutQuestions.map((q) => (
              <span
                key={q.label}
                className="rounded-full bg-white px-2.5 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200"
              >
                {q.label}
              </span>
            ))}
          </div>
        </div>
      </FormSection>

      {/* ─── 2. Basics ─── */}
      <FormSection number={2} title="Basics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Event name" required>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Narsingdi Business Summit 2026"
              className={inputClass}
            />
          </FormField>
          <FormField label="Page link" required hint="Filled in from the name">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-[#c49a3c] focus-within:ring-4 focus-within:ring-[#c49a3c]/15">
              <span className="pl-3 text-sm text-slate-400">/events/</span>
              <input
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="narsingdi-business-summit-2026"
                className="h-11 min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none"
              />
            </div>
          </FormField>
          <FormField label="Date" required>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Start time" required>
            <Input
              type="time"
              value={form.time}
              onChange={(e) => updateField("time", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField
              label={
                form.eventType === "VIRTUAL"
                  ? "Where (e.g. Zoom)"
                  : "Venue / address"
              }
              required
            >
              <Input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder={
                  form.eventType === "VIRTUAL"
                    ? "Online — Zoom"
                    : "ICCB, Purbachal, Dhaka"
                }
                className={inputClass}
              />
            </FormField>
          </div>
        </div>

        {/* Organizer: pick one, or add a new one */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className={labelClass.replace("mb-1.5 ", "")}>
              Organizer <span className="text-[#c49a3c]">*</span>
            </p>
            <button
              type="button"
              onClick={() => setShowNewOrg(!showNewOrg)}
              className="cursor-pointer text-xs font-semibold text-[#a8852f] hover:underline"
            >
              {showNewOrg ? "Cancel" : "+ New organizer"}
            </button>
          </div>

          {showNewOrg ? (
            <div className="space-y-3 rounded-xl bg-[#faf8f3] p-4 ring-1 ring-[#c49a3c]/20">
              <Input
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                placeholder="Organizer name"
                className={inputClass}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  value={newOrg.email}
                  onChange={(e) =>
                    setNewOrg({ ...newOrg, email: e.target.value })
                  }
                  placeholder="Email (optional)"
                  className={inputClass}
                />
                <Input
                  value={newOrg.phone}
                  onChange={(e) =>
                    setNewOrg({ ...newOrg, phone: e.target.value })
                  }
                  placeholder="Phone (optional)"
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleCreateOrganizer}
                className="cursor-pointer rounded-xl bg-[#14245a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d3274]"
              >
                Create organizer
              </button>
            </div>
          ) : (
            <select
              value={form.organizerId}
              onChange={(e) => updateField("organizerId", e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select organizer</option>
              {orgList.map((org) => (
                <option key={org.id} value={String(org.id)}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </FormSection>

      {/* ─── 3. Description ─── */}
      <FormSection number={3} title="Description">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className={labelClass.replace("mb-1.5 ", "")}>
              Short description
            </p>
            <span
              className={`text-[11px] tabular-nums ${
                form.shortDesc.length > 200
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {form.shortDesc.length}/255
            </span>
          </div>
          <input
            value={form.shortDesc}
            onChange={(e) => {
              if (e.target.value.length <= 255) {
                updateField("shortDesc", e.target.value);
              }
            }}
            placeholder="One line for event cards and the homepage hero"
            className={inputClass}
          />
        </div>
        <div>
          <p className={labelClass}>
            Full description <span className="text-[#c49a3c]">*</span>
          </p>
          <RichTextEditor
            value={form.description}
            onChange={(html) => updateField("description", html)}
            placeholder="Write your full event description..."
          />
        </div>
      </FormSection>

      {/* ─── 4. Images ─── */}
      <FormSection number={4} title="Images">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_13rem]">
          <div>
            <p className={labelClass}>
              Banner <span className="text-[#c49a3c]">*</span>
            </p>
            {/* <ImageVpsUpload
              value={form.bannerImage}
              onChange={(url) => updateField("bannerImage", url)}
              folder="banners"
              label="Upload banner"
              aspectRatio="aspect-[16/7]"
              maxSizeMB={5}
            /> */}
            <ImageUploadCloudinary
              value={form.bannerImage}
              onChange={(url) => updateField("bannerImage", url)}
              folder="banners"
              label="Upload banner"
              aspectRatio="aspect-[16/7]"
              maxSizeMB={2}
            />
            <p className="mt-1 text-xs text-slate-400">
              Wide photo for the event page and homepage.
            </p>
          </div>
          <div>
            <p className={labelClass}>Thumbnail</p>
            {/* <ImageVpsUpload
              value={form.thumbImage}
              onChange={(url) => updateField("thumbImage", url)}
              folder="thumbnails"
              label="Upload thumbnail"
              aspectRatio="aspect-square"
              maxSizeMB={2}
            /> */}

            <ImageUploadCloudinary
              value={form.thumbImage}
              onChange={(url) => updateField("thumbImage", url)}
              folder="thumbnails"
              label="Upload thumbnail"
              aspectRatio="aspect-square"
              maxSizeMB={1}
            />
            <p className="mt-1 text-xs text-slate-400">Optional, square.</p>
          </div>
        </div>
      </FormSection>

      {/* ─── 5. Publishing ─── */}
      <FormSection number={5} title="Publishing">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {STATUS_OPTIONS.map((option) => (
            <ChoiceCard
              key={option.value}
              selected={form.status === option.value}
              onClick={() => updateField("status", option.value)}
              title={option.label}
              text={option.hint}
            />
          ))}
        </div>
        <div className="max-w-xs">
          <FormField
            label="“From” price ৳"
            hint="Shown as “From ৳…” on event cards"
          >
            <Input
              type="number"
              value={form.minPackagePrice}
              onChange={(e) => updateField("minPackagePrice", e.target.value)}
              placeholder="500"
              className={inputClass}
            />
          </FormField>
        </div>
      </FormSection>

      {/* ─── 6. Packages (after the event exists) ─── */}
      {!isEditing ? (
        <p className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] p-5 text-center text-sm text-slate-500">
          Packages (tickets, prices, slots) are added after the event is
          created.
        </p>
      ) : (
        <FormSection number={6} title={`Packages (${packages.length})`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              The tickets people can buy. Edit a row with the pencil.
            </p>
            <button
              type="button"
              onClick={() => setShowAddPackage(!showAddPackage)}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-[#14245a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d3274]"
            >
              {showAddPackage ? (
                <>
                  <X size={13} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={13} /> Add package
                </>
              )}
            </button>
          </div>

          {/* New package */}
          {showAddPackage && (
            <div className="rounded-xl bg-[#faf8f3] p-4 ring-1 ring-[#c49a3c]/20">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FormField label="Name">
                  <Input
                    value={newPackage.name}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, name: e.target.value })
                    }
                    placeholder="General Pass"
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Distance / duration">
                  <Input
                    value={newPackage.distance}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, distance: e.target.value })
                    }
                    placeholder="Day pass / 5K"
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Price ৳">
                  <Input
                    type="number"
                    value={newPackage.price}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, price: e.target.value })
                    }
                    placeholder="1500"
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Slots">
                  <Input
                    type="number"
                    value={newPackage.availableSlots}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        availableSlots: e.target.value,
                      })
                    }
                    placeholder="200"
                    className={inputClass}
                  />
                </FormField>
              </div>
              <button
                type="button"
                onClick={handleAddPackage}
                disabled={pkgLoading === -1}
                className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d3274] disabled:opacity-50"
              >
                {pkgLoading === -1 && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Save package
              </button>
            </div>
          )}

          {/* Package rows */}
          {packages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No packages yet — add the first one.
            </p>
          ) : (
            <div className="space-y-2">
              {packages.map((pkg) => (
                <EditablePackageRow
                  key={pkg.id}
                  pkg={pkg}
                  onUpdate={refreshPackages}
                  onDelete={() =>
                    setPackages((prev) => prev.filter((p) => p.id !== pkg.id))
                  }
                />
              ))}
            </div>
          )}

          {/* Totals */}
          {packages.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#faf8f3] px-4 py-3 text-xs text-slate-500 ring-1 ring-[#c49a3c]/20">
              <span>
                <b className="text-[#14245a]">
                  {packages.reduce((sum, p) => sum + p.usedSlots, 0)}
                </b>{" "}
                of{" "}
                <b className="text-[#14245a]">
                  {packages.reduce((sum, p) => sum + p.availableSlots, 0)}
                </b>{" "}
                slots sold
              </span>
              <span>
                Prices{" "}
                <b className="text-[#14245a]">
                  ৳
                  {Math.min(
                    ...packages.map((p) => Number(p.price)),
                  ).toLocaleString()}
                  {" – "}৳
                  {Math.max(
                    ...packages.map((p) => Number(p.price)),
                  ).toLocaleString()}
                </b>
              </span>
            </div>
          )}
        </FormSection>
      )}

      {/* ─── Save ─── */}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
          <Check className="h-4 w-4" />
          Event {isEditing ? "updated" : "created"}.
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
          {isEditing ? "Save changes" : "Create event"}
        </button>
      </div>
    </form>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Small pieces
// ════════════════════════════════════════════════════════════════════════

const labelClass =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.15em] text-[#14245a] uppercase";

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
    <label className="block min-w-0">
      <span className={labelClass}>
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

/** A clickable card for choosing one option (category, format, status). */
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
      aria-pressed={selected}
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
