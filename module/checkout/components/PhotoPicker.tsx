// module/checkout/components/PhotoPicker.tsx
"use client";

// The "Recent passport-size photo" field at checkout.
//
// It does NOT upload anything. It only:
//   1. lets the attendee pick a photo,
//   2. shrinks it in the browser (lib/shrink-photo.ts),
//   3. shows a preview, and hands the small file to the checkout page.
// The checkout page uploads it after the order is created
// (app/actions/registration-photo.ts).
//
// Props:
//   id        — for the <label htmlFor>
//   file      — the chosen (already shrunk) photo, or null
//   error     — message from the form check, e.g. "… is required"
//   onChange  — called with the new photo, or null when removed

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, UserRound, X } from "lucide-react";

import { shrinkPhoto } from "@/lib/shrink-photo";

type PhotoPickerProps = {
  id: string;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
};

/** The largest photo the attendee may choose. Shown on the page too.
 *  (We still shrink it before uploading, to ~100 KB.) */
const MAX_PHOTO_MB = 1;
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;

export function PhotoPicker({ id, file, error, onChange }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);
  const [problem, setProblem] = useState(""); // e.g. "That file isn't a photo"
  // Show the chosen file as a picture: the browser makes a temporary
  // address ("blob:…") for it…
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  // …which we free again when the photo changes or the form closes.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = async (picked: File | undefined) => {
    if (!picked) return;
    setProblem("");

    if (!picked.type.startsWith("image/")) {
      setProblem("That file isn't a photo. Choose a JPG or PNG.");
      return;
    }
    if (picked.size > MAX_PHOTO_BYTES) {
      setProblem(`That photo is too large. Choose one under ${MAX_PHOTO_MB} MB.`);
      return;
    }

    setPreparing(true);
    try {
      onChange(await shrinkPhoto(picked));
    } catch {
      setProblem("We couldn't read that photo. Try a JPG or PNG.");
    } finally {
      setPreparing(false);
    }
  };

  const remove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = ""; // allow picking the same file again
  };

  const message = problem || error;

  return (
    <div>
      <div className="flex items-start gap-4">
        {/* Passport-shaped box (3:4): the preview, or a placeholder */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`relative flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-[#faf8f3] transition hover:border-[#c49a3c] ${
            message ? "border-red-400" : "border-slate-200"
          }`}
          aria-label={file ? "Change photo" : "Choose photo"}
        >
          {preparing ? (
            <Loader2 size={22} className="animate-spin text-[#c49a3c]" aria-hidden />
          ) : previewUrl ? (
            // A temporary browser address (blob:) — next/image can't load those
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Your photo" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={34} className="text-slate-300" aria-hidden />
          )}
        </button>

        <div className="min-w-0 pt-1 text-sm">
          <p className="text-slate-600">
            A clear, recent photo of your face on a plain background, like a
            passport photo.
          </p>
          <p className="mt-1 text-xs text-slate-400">JPG or PNG · max {MAX_PHOTO_MB} MB</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={preparing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#14245a] transition hover:border-[#c49a3c] disabled:opacity-50"
            >
              <ImagePlus size={14} aria-hidden />
              {file ? "Change photo" : "Choose photo"}
            </button>
            {file && !preparing && (
              <button
                type="button"
                onClick={remove}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:text-red-500"
              >
                <X size={14} aria-hidden /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* The real file input — hidden, opened by the buttons above */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {message && <p className="mt-1.5 text-xs text-red-500">{message}</p>}
    </div>
  );
}
