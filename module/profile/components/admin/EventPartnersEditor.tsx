// module/profile/components/admin/EventPartnersEditor.tsx
//
// The "Event partners" list in the admin event form (optional).
// Each partner is one card:
//
//   ┌ PARTNER 1 ─────────────────────────────── ↑  ↓  🗑 ┐
//   │ ┌──────┐  Name *            [Bangladesh Athletics…] │
//   │ │ logo │  Role [Kit partner     ]  Text if no logo [BAF] │
//   │ └──────┘                                          │
//   │ Upload · Link · Remove                            │
//   └───────────────────────────────────────────────────┘
//   [+ Add partner]
//
// The logo tile doubles as a preview: it shows the logo, or the text the
// event page will show instead (e.g. "BAF").
//
// The list is saved with the event (see createEvent / updateEvent) and shown
// on the event page by module/event/components/EventPartners.tsx.

"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImageUp, Link2, Loader2, Plus, Trash2, X } from "lucide-react";

import { sendToCloudinary } from "./ImageUploadCloudinary";
import { getCloudinarySignature } from "@/app/actions/cloudinary";
import { PARTNER_ROLE_SUGGESTIONS, partnerWordmark, type EventPartner } from "@/lib/event-partners";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";
const smallLabel = "mb-1 block text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase";
const iconButton =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#14245a] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";
const tileLink =
  "inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-slate-500 transition hover:text-[#14245a]";

const LOGO_TYPES = ["image/png", "image/svg+xml", "image/webp", "image/jpeg"];
const LOGO_MAX_MB = 1;

type Props = {
  partners: EventPartner[];
  onChange: (partners: EventPartner[]) => void;
};

export function EventPartnersEditor({ partners, onChange }: Props) {
  /** Change one field of one partner. */
  const update = (index: number, field: keyof EventPartner, value: string) => {
    onChange(partners.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  /** Move a partner up (-1) or down (+1) — the event page shows them in this order. */
  const move = (index: number, step: -1 | 1) => {
    const next = [...partners];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  };

  const remove = (index: number) => onChange(partners.filter((_, i) => i !== index));

  const add = () => onChange([...partners, { name: "", role: "", logo: "", short: "" }]);

  return (
    <div className="space-y-3">
      {/* Role ideas for every "Role" box */}
      <datalist id="partner-roles">
        {PARTNER_ROLE_SUGGESTIONS.map((role) => (
          <option key={role} value={role} />
        ))}
      </datalist>

      {partners.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center">
          <p className="text-sm font-medium text-[#14245a]">No partners yet</p>
          <p className="mt-0.5 text-xs text-slate-500">The &ldquo;Event partners&rdquo; card stays hidden until you add one.</p>
        </div>
      )}

      {partners.map((partner, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Top bar: number + order / remove */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 py-1.5 pr-1.5 pl-4">
            <p className="min-w-0 truncate text-[10px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
              Partner {i + 1}
              {/* The name too, on wider screens (handy when reordering) */}
              {partner.name.trim() && (
                <span className="ml-2 hidden tracking-normal text-slate-400 normal-case sm:inline">· {partner.name.trim()}</span>
              )}
            </p>
            <div className="flex items-center">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={iconButton} title="Move up" aria-label="Move up">
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === partners.length - 1}
                className={iconButton}
                title="Move down"
                aria-label="Move down"
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className={`${iconButton} hover:bg-red-50 hover:text-red-600`}
                title="Remove partner"
                aria-label="Remove partner"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Body: logo tile + text fields */}
          <div className="grid grid-cols-[5.5rem_1fr] gap-4 p-4 sm:grid-cols-[6.5rem_1fr]">
            <LogoTile partner={partner} onChange={(url) => update(i, "logo", url)} />

            <div className="min-w-0 space-y-3">
              <label className="block">
                <span className={smallLabel}>
                  Name <span className="text-[#c49a3c]">*</span>
                </span>
                <input
                  value={partner.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                  placeholder="e.g. Bangladesh Athletics Federation"
                  maxLength={80}
                  className={inputClass}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                <label className="block">
                  <span className={smallLabel}>Role</span>
                  <input
                    value={partner.role}
                    onChange={(e) => update(i, "role", e.target.value)}
                    list="partner-roles"
                    placeholder="e.g. Kit partner"
                    maxLength={40}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={smallLabel}>Text if no logo</span>
                  <input
                    value={partner.short ?? ""}
                    onChange={(e) => update(i, "short", e.target.value)}
                    placeholder="e.g. BAF"
                    maxLength={12}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#c49a3c]/60 px-4 py-3 text-sm font-semibold text-[#a8852f] transition hover:border-[#c49a3c] hover:bg-[#faf8f3]"
      >
        <Plus size={16} /> Add partner
      </button>
    </div>
  );
}

/**
 * Small square logo tile: click (or drop a file) to upload to Cloudinary,
 * "Link" to paste a logo URL instead. With no logo it previews the text the
 * event page will show (e.g. "BAF").
 */
function LogoTile({ partner, onChange }: { partner: EventPartner; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null); // null = not uploading
  const [error, setError] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const logo = partner.logo ?? "";
  const wordmark = partner.name.trim() || partner.short ? partnerWordmark(partner) : "";

  async function upload(file: File) {
    setError("");
    if (!LOGO_TYPES.includes(file.type)) return setError("Use PNG, SVG, WEBP or JPG");
    if (file.size > LOGO_MAX_MB * 1024 * 1024) return setError(`Max ${LOGO_MAX_MB} MB`);

    setProgress(0);
    try {
      // 1. Permission from the server (admins only)  2. Straight to Cloudinary
      const { data: auth, error: authError } = await getCloudinarySignature("partners");
      if (!auth) throw new Error(authError ?? "Upload not allowed");
      onChange(await sendToCloudinary(file, auth, setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void upload(file);
        }}
        disabled={progress !== null}
        title={logo ? "Change logo" : "Upload logo"}
        className={`group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border p-2 transition ${
          dragOver
            ? "border-[#c49a3c] bg-[#faf8f3] ring-4 ring-[#c49a3c]/15"
            : logo
              ? "border-slate-200 bg-white hover:border-[#c49a3c]"
              : "border-dashed border-[#c49a3c]/50 bg-[#faf8f3] hover:border-[#c49a3c]"
        }`}
      >
        {progress !== null ? (
          <span className="flex flex-col items-center gap-1 text-[11px] font-semibold text-[#a8852f]">
            <Loader2 size={18} className="animate-spin" />
            {progress}%
          </span>
        ) : logo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of any pasted link */}
            <img src={logo} alt="" className="max-h-full max-w-full object-contain" />
            <span className="absolute inset-0 flex items-center justify-center bg-[#14245a]/70 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
              Change
            </span>
          </>
        ) : wordmark ? (
          // Preview of the text shown instead of a logo, plus an upload hint
          <span className="flex flex-col items-center gap-1">
            <span className="max-w-full truncate text-lg leading-none font-extrabold tracking-tight text-[#14245a]">{wordmark}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
              <ImageUp size={11} /> Logo
            </span>
          </span>
        ) : (
          <span className="flex flex-col items-center gap-1 text-[11px] font-semibold text-[#a8852f]">
            <ImageUp size={20} />
            Logo
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={LOGO_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = ""; // so the same file can be picked again
        }}
      />

      {/* Small actions under the tile */}
      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        <button type="button" onClick={() => setShowLink(!showLink)} className={tileLink}>
          <Link2 size={11} /> Link
        </button>
        {logo && (
          <button type="button" onClick={() => onChange("")} className={`${tileLink} hover:text-red-600`}>
            <X size={11} /> Remove
          </button>
        )}
      </div>

      {showLink && (
        <input
          value={logo}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="https://…"
          aria-label="Logo link"
          autoFocus
          className="mt-1.5 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[11px] outline-none focus:border-[#c49a3c]"
        />
      )}

      {error && <p className="mt-1 text-center text-[10px] leading-tight text-red-600">{error}</p>}
    </div>
  );
}
