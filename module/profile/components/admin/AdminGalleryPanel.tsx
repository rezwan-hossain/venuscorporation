// module/profile/components/admin/AdminGalleryPanel.tsx
"use client";

// Admin → Manage Gallery, in two parts (switch at the top):
//   Photos      — the photos on the Gallery page (and the homepage), below
//   Event films — the YouTube films (AdminGalleryVideos.tsx)
//
// Photos:
//   • Add photo / Edit opens the form at the top (and scrolls to it)
//   • Each photo: click it or the pencil to edit, the bin to delete
//     (asks first). Buttons are always visible — phones can't hover.
// Data: app/actions/gallery.ts

import { useRef, useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Clapperboard,
  ImageIcon,
  ImageOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { AdminGalleryVideos } from "./AdminGalleryVideos";

import type { GalleryImage } from "@/types/gallery";
import {
  createGalleryImage,
  deleteGalleryImage,
  updateGalleryImage,
} from "@/app/actions/gallery";

type Props = {
  initialImages: GalleryImage[];
};

type FormData = {
  src: string;
  alt: string;
};

const emptyForm: FormData = { src: "", alt: "" };

// ════════════════════════════════════════════════════════════════════════
//  Photos | Event films switch
// ════════════════════════════════════════════════════════════════════════

export function AdminGalleryPanel({ initialImages }: Props) {
  const [tab, setTab] = useState<"photos" | "films">("photos");

  return (
    <div className="space-y-5">
      <div className="flex w-fit rounded-xl bg-white p-1 ring-1 ring-slate-200/70">
        {(
          [
            { value: "photos", label: "Photos", icon: ImageIcon },
            { value: "films", label: "Event films", icon: Clapperboard },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            aria-pressed={tab === option.value}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              tab === option.value
                ? "bg-[#14245a] text-white"
                : "text-slate-500 hover:text-[#14245a]"
            }`}
          >
            <option.icon
              size={15}
              className={
                tab === option.value ? "text-[#dcb45c]" : "text-[#c49a3c]"
              }
            />
            {option.label}
          </button>
        ))}
      </div>

      {tab === "photos" ? (
        <GalleryPhotos initialImages={initialImages} />
      ) : (
        <AdminGalleryVideos />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Photos
// ════════════════════════════════════════════════════════════════════════

function GalleryPhotos({ initialImages }: Props) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ─── Toast Helper ─────────────────────────────────
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  /** Bring the form into view (it sits above the photos). */
  const scrollToForm = () =>
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );

  // ─── Open Create Form ─────────────────────────────
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
    scrollToForm();
  };

  // ─── Open Edit Form ───────────────────────────────
  const handleOpenEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setFormData({
      src: image.src,
      alt: image.alt ?? "",
    });
    setShowForm(true);
    scrollToForm();
  };

  // ─── Close Form ───────────────────────────────────
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // ─── Submit (Create or Update) ────────────────────
  const handleSubmit = () => {
    if (!formData.src) {
      showToast("error", "Upload a photo or paste its link first");
      return;
    }

    startTransition(async () => {
      if (editingId) {
        const result = await updateGalleryImage({
          id: editingId,
          src: formData.src,
          alt: formData.alt || undefined,
        });

        if (result.success) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === editingId
                ? {
                    ...img,
                    src: formData.src,
                    alt: formData.alt.trim() || null,
                  }
                : img,
            ),
          );
          showToast("success", "Photo updated");
          handleCloseForm();
        } else {
          showToast("error", result.error);
        }
      } else {
        const result = await createGalleryImage({
          src: formData.src,
          alt: formData.alt || undefined,
        });

        if (result.success) {
          const newImage: GalleryImage = {
            id: result.data.id,
            src: formData.src,
            alt: formData.alt.trim() || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setImages((prev) => [newImage, ...prev]);
          showToast("success", "Photo added to the gallery");
          handleCloseForm();
        } else {
          showToast("error", result.error);
        }
      }
    });
  };

  // ─── Delete ───────────────────────────────────────
  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteGalleryImage({ id });

      if (result.success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        showToast("success", "Photo deleted");
        setDeletingId(null);
      } else {
        showToast("error", result.error);
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
            Website
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#14245a]">Gallery</p>
          <p className="mt-1 text-sm text-slate-500">
            {images.length} {images.length === 1 ? "photo" : "photos"} on the
            Gallery page and the homepage.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3274]"
        >
          <Plus size={16} />
          Add photo
        </button>
      </div>

      {/* ─── Message after saving / deleting ─── */}
      {toast && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
              : "bg-red-50 text-red-700 ring-red-100"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* ─── Add / edit form ─── */}
      {showForm && (
        <div
          ref={formRef}
          className="scroll-mt-28 rounded-2xl bg-white p-5 ring-1 ring-[#c49a3c]/40 sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="text-lg font-semibold text-[#14245a]">
              {editingId ? "Edit photo" : "Add a photo"}
            </p>
            <button
              onClick={handleCloseForm}
              title="Close"
              aria-label="Close"
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#14245a]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.2fr_1fr]">
            {/* Photo */}
            <div>
              <p className={labelClass}>
                Photo <span className="text-[#c49a3c]">*</span>
              </p>
              <ImageUpload
                value={formData.src}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, src: url }))
                }
                bucket="gallery-images"
                folder="gallery"
                label="Upload photo"
                aspectRatio="aspect-[4/3]"
                maxSizeMB={10}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <div className="mb-1.5 flex items-center justify-between">
                <p className={labelClass.replace("mb-1.5 ", "")}>Description</p>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {formData.alt.length}/200
                </span>
              </div>
              <textarea
                value={formData.alt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, alt: e.target.value }))
                }
                rows={4}
                maxLength={200}
                placeholder="e.g. Guests at the Narsingdi Business Summit 2026"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15"
              />
              <p className="mt-2 rounded-xl bg-[#faf8f3] p-3 text-xs leading-relaxed text-slate-500 ring-1 ring-[#c49a3c]/20">
                A short description helps people using screen readers, and helps
                Google show the photo in search.
              </p>

              {/* Save */}
              <div className="mt-auto flex items-center justify-end gap-2 pt-5">
                <button
                  onClick={handleCloseForm}
                  disabled={isPending}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isPending || !formData.src}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3274] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  {editingId ? "Save changes" : "Add to gallery"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── No photos yet ─── */}
      {images.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] py-14 text-center">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 text-[#c49a3c]" />
          <p className="text-lg font-semibold text-[#14245a]">No photos yet</p>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Add photos from your events to fill the gallery.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d3274]"
          >
            <Plus size={14} />
            Add the first photo
          </button>
        </div>
      )}

      {/* ─── Photos ─── */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {images.map((image) => (
            <PhotoCard
              key={image.id}
              image={image}
              editing={editingId === image.id}
              confirmingDelete={deletingId === image.id}
              busy={isPending}
              onEdit={() => handleOpenEdit(image)}
              onAskDelete={() => setDeletingId(image.id)}
              onCancelDelete={() => setDeletingId(null)}
              onDelete={() => handleDelete(image.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  One photo
// ════════════════════════════════════════════════════════════════════════

const labelClass =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.15em] text-[#14245a] uppercase";

function PhotoCard({
  image,
  editing,
  confirmingDelete,
  busy,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  image: GalleryImage;
  editing: boolean;
  confirmingDelete: boolean;
  busy: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  // The photo's link doesn't load (moved or deleted somewhere else)
  const [broken, setBroken] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white ring-1 transition hover:shadow-lg hover:shadow-[#14245a]/5 ${
        editing ? "ring-2 ring-[#c49a3c]" : "ring-slate-200/70"
      }`}
    >
      {/* Photo — click to edit */}
      <button
        type="button"
        onClick={onEdit}
        className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-slate-100"
        title="Edit photo"
      >
        {broken ? (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
            <ImageOff size={22} />
            <span className="text-xs">Photo couldn&apos;t load</span>
          </span>
        ) : (
          <img
            src={image.src}
            alt={image.alt ?? "Gallery photo"}
            onError={() => setBroken(true)}
            // The photo can fail before React is listening for onError
            // (it starts loading with the page), so check once it's on screen.
            ref={(img) => {
              if (img?.complete && img.naturalWidth === 0) setBroken(true);
            }}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {editing && (
          <span className="absolute top-2 left-2 rounded-full bg-[#c49a3c] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase">
            Editing
          </span>
        )}
      </button>

      {/* Description, date, and the buttons (always visible — phones can't hover) */}
      <div className="flex items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          {image.alt ? (
            <p className="line-clamp-2 text-sm font-medium text-[#14245a]">
              {image.alt}
            </p>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="cursor-pointer text-sm font-medium text-amber-700 hover:underline"
            >
              + Add a description
            </button>
          )}
          <p className="mt-0.5 text-[11px] text-slate-400">
            Added{" "}
            {new Date(image.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            onClick={onEdit}
            title="Edit"
            aria-label="Edit photo"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#14245a]"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onAskDelete}
            title="Delete"
            aria-label="Delete photo"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Delete: ask first */}
      {confirmingDelete && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 p-4 text-center backdrop-blur-sm">
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <Trash2 className="h-5 w-5 text-red-500" />
          </span>
          <p className="text-sm font-semibold text-[#14245a]">
            Delete this photo?
          </p>
          <p className="mt-0.5 mb-4 text-xs text-slate-500">
            It can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancelDelete}
              disabled={busy}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              disabled={busy}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy && <Loader2 size={12} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
