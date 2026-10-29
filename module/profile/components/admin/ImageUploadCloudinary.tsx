// module/profile/components/admin/ImageUploadCloudinary.tsx
"use client";

// Photo upload box that stores photos on Cloudinary.
//
// Same props, look and behaviour as ImageUpload (Supabase), so you can swap
// one for the other:
//   <ImageUpload ... />  →  <ImageUploadCloudinary ... />
// onChange gets the photo's Cloudinary URL (https://res.cloudinary.com/…).
//
// How an upload works:
//   1. Ask the server for a signature (getCloudinarySignature). The API
//      secret stays on the server; only admins get one.
//   2. Send the file straight from the browser to Cloudinary, with real
//      upload progress.
//   3. Replacing or removing a photo deletes the old one from Cloudinary.
//
// Setup: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
// in .env — see app/actions/cloudinary.ts.

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import {
  deleteCloudinaryImage,
  getCloudinarySignature,
  type CloudinarySignature,
} from "@/app/actions/cloudinary";

type Props = {
  value: string;
  onChange: (url: string) => void;
  /** Not used — only here so ImageUpload's props work unchanged. */
  bucket?: string;
  /** Folder inside CLOUDINARY_FOLDER, e.g. "hero" or "banners". */
  folder?: string;
  label?: string;
  aspectRatio?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
};

type UploadState = "idle" | "uploading" | "success" | "error";

/**
 * Send one file to Cloudinary. Resolves with the photo's URL.
 * Uses XMLHttpRequest (not fetch) because only it reports upload progress.
 */
function sendToCloudinary(
  file: File,
  auth: CloudinarySignature,
  onProgress: (percent: number) => void,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", auth.apiKey);
  form.append("timestamp", String(auth.timestamp));
  form.append("folder", auth.folder);
  form.append("signature", auth.signature);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${auth.cloudName}/image/upload`,
    );
    request.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    request.onload = () => {
      const result = JSON.parse(request.responseText || "{}");
      if (request.status === 200 && result.secure_url)
        resolve(result.secure_url);
      else reject(new Error(result.error?.message || "Upload failed"));
    };
    request.onerror = () => reject(new Error("Couldn't reach Cloudinary"));
    request.send(form);
  });
}

export function ImageUploadCloudinary({
  value,
  onChange,
  folder = "banners",
  label = "Upload Image",
  aspectRatio = "aspect-[16/9]",
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: Props) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Validate File ────────────────────────────────
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes
        .map((t) => t.split("/")[1].toUpperCase())
        .join(", ")}`;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  // ─── Delete Old Image from Cloudinary ─────────────
  const deleteOldImage = useCallback(async (oldUrl: string) => {
    if (!oldUrl) return;
    // Links that aren't on our Cloudinary account are skipped on the server.
    const result = await deleteCloudinaryImage(oldUrl);
    // Not critical: the new photo is already saved
    if (!result.success)
      console.warn("Failed to delete old image:", result.error);
  }, []);

  // ─── Upload File ──────────────────────────────────
  const uploadFile = async (file: File) => {
    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setErrorMsg("");
    setProgress(0);

    try {
      // 1. Permission from the server
      const { data: auth, error } = await getCloudinarySignature(folder);
      if (!auth) throw new Error(error ?? "Upload not allowed");

      // 2. Straight to Cloudinary, with real progress
      const publicUrl = await sendToCloudinary(file, auth, setProgress);

      // Delete old image if replacing
      if (value) {
        await deleteOldImage(value);
      }

      setProgress(100);
      setUploadState("success");
      onChange(publicUrl);

      // Reset state after brief success indication
      setTimeout(() => {
        setUploadState("idle");
        setProgress(0);
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg(
        err instanceof Error && err.message
          ? err.message
          : "Upload failed. Please try again.",
      );
      setUploadState("error");
      setProgress(0);
    }
  };

  // ─── Handle Remove ───────────────────────────────
  const handleRemove = async () => {
    if (value) {
      await deleteOldImage(value);
    }
    onChange("");
    setUploadState("idle");
    setErrorMsg("");

    // Reset file input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ─── Drag & Drop ─────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setErrorMsg("");

    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  // ─── File Input Change ────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (file) uploadFile(file);

    // Reset input so same file can be re-selected
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };


  return (
    <div className="space-y-2">
      {/* ─── Preview State ─── */}
      {value ? (
        <div
          className={`relative ${aspectRatio} group overflow-hidden rounded-xl ring-1 ring-slate-200`}
        >
          {/* Image */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "";
              setErrorMsg("Failed to load image preview");
            }}
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#14245a] transition-colors hover:bg-[#faf8f3]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 bg-white/20 text-white rounded-lg hover:bg-red-500/80 cursor-pointer transition-colors"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>

          {/* Success Indicator */}
          {uploadState === "success" && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg">
              <CheckCircle size={14} />
              Uploaded
            </div>
          )}

          {/* Uploading Overlay (for replace) */}
          {uploadState === "uploading" && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
              <p className="text-white text-sm font-medium">Uploading...</p>
              <div className="w-32 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─── Upload State ─── */
        <div
          onClick={() => {
            if (uploadState !== "uploading") {
              inputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${aspectRatio} flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 ${
            uploadState === "uploading"
              ? "cursor-wait border-[#c49a3c]/40 bg-[#faf8f3]"
              : dragOver
                ? "scale-[1.01] border-[#c49a3c] bg-[#faf8f3]"
                : uploadState === "error"
                  ? "cursor-pointer border-red-300 bg-red-50/40 hover:border-red-400"
                  : "cursor-pointer border-[#c49a3c]/35 bg-[#faf8f3]/60 hover:border-[#c49a3c] hover:bg-[#faf8f3]"
          }`}
        >
          {uploadState === "uploading" ? (
            <div className="flex w-full flex-col items-center">
              <Loader2 className="mb-2 h-7 w-7 animate-spin text-[#c49a3c]" />
              <p className="text-sm font-medium text-[#14245a]">Uploading…</p>
              <div className="mt-2 h-1.5 w-full max-w-32 overflow-hidden rounded-full bg-[#c49a3c]/15">
                <div
                  className="h-full rounded-full bg-[#c49a3c] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">{progress}%</p>
            </div>
          ) : (
            <>
              <span
                className={`mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  uploadState === "error"
                    ? "bg-red-100 text-red-500"
                    : "bg-white text-[#c49a3c] ring-1 ring-[#c49a3c]/30"
                }`}
              >
                <Upload className="h-4 w-4" />
              </span>
              <p
                className={`text-sm font-semibold ${
                  uploadState === "error" ? "text-red-600" : "text-[#14245a]"
                }`}
              >
                {uploadState === "error" ? "Try again" : label}
              </p>
              <p className="mt-1 text-xs text-balance text-slate-500">
                Click or drop a photo
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {acceptedTypes
                  .map((t) =>
                    t.split("/")[1].toUpperCase().replace("JPEG", "JPG"),
                  )
                  .join(", ")}
                <br />
                Up to {maxSizeMB} MB
              </p>
            </>
          )}
        </div>
      )}

      {/* ─── Error Message ─── */}
      {errorMsg && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle
            size={14}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div className="min-w-0">
            <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg("");
                setUploadState("idle");
              }}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold mt-0.5 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ─── URL Fallback Input ─── */}
      {!value && uploadState === "idle" && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            or paste a link
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      )}

      {!value && uploadState === "idle" && (
        <input
          type="text"
          placeholder="https://…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = e.target as HTMLInputElement;
              const url = input.value.trim();
              if (url) {
                onChange(url);
                input.value = "";
              }
            }
          }}
          onBlur={(e) => {
            const url = e.target.value.trim();
            if (url) {
              onChange(url);
              e.target.value = "";
            }
          }}
        />
      )}

      {/* ─── Hidden File Input ─── */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
