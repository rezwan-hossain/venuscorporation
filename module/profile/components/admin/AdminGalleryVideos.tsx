// module/profile/components/admin/AdminGalleryVideos.tsx
"use client";

// Admin → Manage Gallery → Event films: the YouTube videos in the gallery
// page's "Event films · Watch our events" section.
//   • Add film / Edit opens the form (YouTube link, title, category, length,
//     order) with a live thumbnail of the link
//   • Each film: show/hide, edit, delete
// Data: app/actions/gallery-videos.ts

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clapperboard,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createGalleryVideo,
  deleteGalleryVideo,
  getAllGalleryVideos,
  setGalleryVideoActive,
  updateGalleryVideo,
  type GalleryVideoInput,
  type GalleryVideoRow,
} from "@/app/actions/gallery-videos";
import { youTubeId } from "@/lib/youtube";

const EMPTY: GalleryVideoInput = {
  url: "",
  title: "",
  category: "",
  duration: "",
  sortOrder: 0,
};

const CATEGORY_SUGGESTIONS = [
  "Corporate",
  "Wedding",
  "Sports",
  "Exhibition",
  "Conference",
  "Social",
];

/** YouTube's own thumbnail for a link (null if it isn't a YouTube link). */
const thumbnailOf = (url: string) => {
  const id = youTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

const labelClass =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.15em] text-[#14245a] uppercase";
const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";

export function AdminGalleryVideos() {
  const [videos, setVideos] = useState<GalleryVideoRow[] | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [editing, setEditing] = useState<GalleryVideoRow | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  async function load() {
    const result = await getAllGalleryVideos();
    setVideos(result.videos);
    if (result.error) setMessage({ ok: false, text: result.error });
  }

  useEffect(() => {
    getAllGalleryVideos().then((result) => {
      setVideos(result.videos);
      if (result.error) setMessage({ ok: false, text: result.error });
    });
  }, []);

  function flash(ok: boolean, text: string) {
    setMessage({ ok, text });
    setTimeout(() => setMessage(null), 3000);
  }

  /** Open the form (new film, or edit one) and bring it into view. */
  function openForm(video: GalleryVideoRow | "new") {
    setEditing(video);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  async function toggle(video: GalleryVideoRow) {
    setBusyId(video.id);
    const result = await setGalleryVideoActive(video.id, !video.isActive);
    setBusyId(null);
    if (!result.success) return flash(false, result.error ?? "Failed");
    await load();
  }

  async function remove(video: GalleryVideoRow) {
    if (!confirm(`Delete "${video.title}"?`)) return;
    setBusyId(video.id);
    const result = await deleteGalleryVideo(video.id);
    setBusyId(null);
    if (!result.success) return flash(false, result.error ?? "Failed");
    flash(true, "Film deleted");
    await load();
  }

  if (videos === null) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
        <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
      </div>
    );
  }

  const shown = videos.filter((v) => v.isActive).length;

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
            Gallery page
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#14245a]">
            Event films
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {videos.length === 0
              ? "The “Watch our events” section shows demo films until you add one."
              : `${videos.length} ${videos.length === 1 ? "film" : "films"} · ${shown} shown on the gallery page`}
          </p>
        </div>
        <button
          onClick={() => openForm("new")}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3274]"
        >
          <Plus size={16} />
          Add film
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
            message.ok
              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
              : "bg-red-50 text-red-700 ring-red-100"
          }`}
        >
          {message.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* ─── Add / edit form ─── */}
      {editing && (
        <div ref={formRef} className="scroll-mt-28">
          <VideoForm
            key={editing === "new" ? "new" : editing.id}
            video={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={async (text) => {
              setEditing(null);
              flash(true, text);
              await load();
            }}
          />
        </div>
      )}

      {/* ─── Films ─── */}
      {videos.length === 0 && !editing ? (
        <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] py-14 text-center">
          <Clapperboard className="mx-auto mb-3 h-10 w-10 text-[#c49a3c]" />
          <p className="text-lg font-semibold text-[#14245a]">No films yet</p>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Paste a YouTube link to add your first event film.
          </p>
          <button
            onClick={() => openForm("new")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d3274]"
          >
            <Plus size={14} />
            Add the first film
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              editing={editing !== "new" && editing?.id === video.id}
              busy={busyId === video.id}
              onEdit={() => openForm(video)}
              onToggle={() => toggle(video)}
              onDelete={() => remove(video)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  One film
// ════════════════════════════════════════════════════════════════════════

function VideoCard({
  video,
  editing,
  busy,
  onEdit,
  onToggle,
  onDelete,
}: {
  video: GalleryVideoRow;
  editing: boolean;
  busy: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const thumbnail = thumbnailOf(video.url);

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white ring-1 transition hover:shadow-lg hover:shadow-[#14245a]/5 ${
        editing ? "ring-2 ring-[#c49a3c]" : "ring-slate-200/70"
      }`}
    >
      {/* Thumbnail — opens the film on YouTube */}
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        title="Watch on YouTube"
        className={`group relative block aspect-video bg-[#0d1840] ${video.isActive ? "" : "opacity-60 grayscale"}`}
      >
        {thumbnail && (
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-[#0d1840]/20 transition group-hover:bg-[#0d1840]/40">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#14245a] shadow-lg transition group-hover:scale-110">
            <Play size={18} fill="currentColor" className="translate-x-px" />
          </span>
        </span>
        {video.duration && (
          <span className="absolute right-2 bottom-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">
            {video.duration}
          </span>
        )}
        <span className="absolute top-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 tabular-nums">
          #{video.sortOrder}
        </span>
      </a>

      {/* Title + buttons */}
      <div className="p-4">
        {video.category && (
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[#a8852f] uppercase">
            {video.category}
          </p>
        )}
        <p className="mt-0.5 line-clamp-2 font-semibold text-[#14245a]">
          {video.title}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            title={
              video.isActive
                ? "Hide from the gallery page"
                : "Show on the gallery page"
            }
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
              video.isActive
                ? "bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-600"
                : "bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-[#c49a3c]"
            }`}
          >
            {busy ? (
              <Loader2 size={13} className="animate-spin" />
            ) : video.isActive ? (
              <Eye size={13} />
            ) : (
              <EyeOff size={13} />
            )}
            {video.isActive ? "Shown on site" : "Hidden"}
          </button>
          <div className="flex items-center">
            <button
              onClick={onEdit}
              title="Edit"
              aria-label="Edit film"
              className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#14245a]"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              disabled={busy}
              title="Delete"
              aria-label="Delete film"
              className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Add / edit form
// ════════════════════════════════════════════════════════════════════════

function VideoForm({
  video,
  onCancel,
  onSaved,
}: {
  video: GalleryVideoRow | null; // null = a new film
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const [form, setForm] = useState<GalleryVideoInput>(
    video
      ? {
          url: video.url,
          title: video.title,
          category: video.category ?? "",
          duration: video.duration ?? "",
          sortOrder: video.sortOrder,
        }
      : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof GalleryVideoInput>(
    field: K,
    value: GalleryVideoInput[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  const thumbnail = thumbnailOf(form.url);
  const linkLooksWrong = form.url.trim() !== "" && !thumbnail;

  async function save() {
    setSaving(true);
    const result = video
      ? await updateGalleryVideo(video.id, form)
      : await createGalleryVideo(form);
    setSaving(false);
    if (!result.success) return setError(result.error ?? "Failed to save");
    onSaved(video ? "Film saved" : "Film added to the gallery page");
  }

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#c49a3c]/40 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-lg font-semibold text-[#14245a]">
          {video ? "Edit film" : "Add a film"}
        </p>
        <button
          onClick={onCancel}
          title="Close"
          aria-label="Close"
          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#14245a]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.1fr]">
        {/* Live thumbnail of the link */}
        <div>
          <p className={labelClass}>Preview</p>
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-[#0d1840]">
            {thumbnail ? (
              <>
                <img
                  src={thumbnail}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#14245a] shadow-lg">
                  <Play
                    size={18}
                    fill="currentColor"
                    className="translate-x-px"
                  />
                </span>
              </>
            ) : (
              <span className="flex flex-col items-center gap-2 px-4 text-center text-sm text-white/60">
                <Clapperboard size={26} className="text-[#dcb45c]" />
                Paste a YouTube link to see the film here
              </span>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>
              YouTube link <span className="text-[#c49a3c]">*</span>
            </span>
            <input
              value={form.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className={`${inputClass} ${linkLooksWrong ? "border-red-300" : ""}`}
            />
            {linkLooksWrong && (
              <span className="mt-1 block text-xs text-red-600">
                That isn&apos;t a YouTube link (youtube.com/watch?v=…,
                youtu.be/… or /shorts/…).
              </span>
            )}
          </label>

          <label className="block">
            <span className={labelClass}>
              Title <span className="text-[#c49a3c]">*</span>
            </span>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={120}
              placeholder="e.g. Narsingdi Business Summit — highlights"
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-3 block sm:col-span-1">
              <span className={labelClass}>Category</span>
              <input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                list="film-categories"
                maxLength={40}
                placeholder="Wedding"
                className={inputClass}
              />
              <datalist id="film-categories">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className={labelClass}>Length</span>
              <input
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                maxLength={10}
                placeholder="3:12"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Order</span>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  update("sortOrder", Number(e.target.value) || 0)
                }
                className={inputClass}
              />
            </label>
          </div>
          <p className="-mt-2 text-xs text-slate-400">
            Lower order numbers are shown first.
          </p>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onCancel}
              disabled={saving}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !thumbnail || !form.title.trim()}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3274] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {video ? "Save changes" : "Add film"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
