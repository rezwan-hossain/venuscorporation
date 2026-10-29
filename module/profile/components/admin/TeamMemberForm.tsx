// module/profile/components/admin/TeamMemberForm.tsx
"use client";

import { useState } from "react";
import type {
  TeamMember,
  TeamMemberFormData,
  TeamCategory,
} from "@/types/team";
import {
  createTeamMember,
  updateTeamMember,
  getAllTeamMembers,
} from "@/app/actions/team";
import { ImageUpload } from "./ImageUpload";
import Input from "@/components/ui/input";
import {
  Check,
  Loader2,
  Save,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Facebook,
} from "lucide-react";
import { ImageUploadCloudinary } from "./ImageUploadCloudinary";

type Props = {
  member: TeamMember | null;
  onSuccess: (members: TeamMember[]) => void;
  onCancel: () => void;
};

const CATEGORY_OPTIONS: {
  value: TeamCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "MANAGEMENT",
    label: "Management",
    description: "Business leadership — CEO, MD, directors, department heads",
  },
  {
    value: "ADMIN",
    label: "Leadership",
    description: "Core team leaders and founders",
  },
  {
    value: "ADVISOR",
    label: "Advisor",
    description: "Strategic advisors and mentors",
  },
  {
    value: "ORGANIZER",
    label: "Organizer",
    description: "Event organizers and coordinators",
  },
];

// Common business titles, suggested in the Role field (any text is still allowed).
const ROLE_SUGGESTIONS = [
  "Chairman",
  "Chief Executive Officer (CEO)",
  "Managing Director (MD)",
  "Deputy Managing Director",
  "Director",
  "Chief Operating Officer (COO)",
  "Chief Financial Officer (CFO)",
  "Chief Marketing Officer (CMO)",
  "Head of Marketing",
  "Head of Sales",
  "Head of Operations",
  "Head of Finance",
  "Head of HR",
  "General Manager",
  "Marketing Manager",
  "Project Manager",
];

// The social link inputs, in order
const SOCIAL_FIELDS = [
  {
    field: "linkedinUrl",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "linkedin.com/in/username",
  },
  {
    field: "facebookUrl",
    label: "Facebook",
    icon: Facebook,
    placeholder: "facebook.com/username",
  },
  {
    field: "instagramUrl",
    label: "Instagram",
    icon: Instagram,
    placeholder: "instagram.com/username",
  },
  {
    field: "twitterUrl",
    label: "X / Twitter",
    icon: Twitter,
    placeholder: "x.com/username",
  },
  {
    field: "githubUrl",
    label: "GitHub",
    icon: Github,
    placeholder: "github.com/username",
  },
] as const;

export function TeamMemberForm({ member, onSuccess, onCancel }: Props) {
  const isEditing = !!member;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<TeamMemberFormData>({
    name: member?.name || "",
    role: member?.role || "",
    bio: member?.bio || "",
    image: member?.image || "",
    category: member?.category || "ADVISOR",
    sortOrder: member?.sortOrder?.toString() || "0",
    linkedinUrl: member?.linkedinUrl || "",
    twitterUrl: member?.twitterUrl || "",
    githubUrl: member?.githubUrl || "",
    instagramUrl: member?.instagramUrl || "",
    facebookUrl: member?.facebookUrl || "",
  });

  const updateField = (field: keyof TeamMemberFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim() || undefined,
        bio: form.bio.trim() || undefined,
        image: form.image || undefined,
        category: form.category as TeamCategory,
        sortOrder: parseInt(form.sortOrder) || 0,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        twitterUrl: form.twitterUrl.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        instagramUrl: form.instagramUrl.trim() || undefined,
        facebookUrl: form.facebookUrl.trim() || undefined,
      };

      let result;
      if (isEditing && member) {
        result = await updateTeamMember(member.id, {
          ...payload,
          role: payload.role || null,
          bio: payload.bio || null,
          image: payload.image || null,
          linkedinUrl: payload.linkedinUrl || null,
          twitterUrl: payload.twitterUrl || null,
          githubUrl: payload.githubUrl || null,
          instagramUrl: payload.instagramUrl || null,
          facebookUrl: payload.facebookUrl || null,
        });
      } else {
        result = await createTeamMember(payload);
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      const { members } = await getAllTeamMembers();
      onSuccess(members as TeamMember[]);
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ─── Header ─── */}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
          Team
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#14245a]">
          {isEditing ? `Edit ${member.name}` : "Add team member"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Shown on the About page, in the group you choose.
        </p>
      </div>

      {/* ─── 1. Who they are ─── */}
      <FormSection number={1} title="Who they are">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Sarah Rahman"
              className={inputClass}
            />
          </FormField>
          <FormField label="Role" hint="Start typing for suggestions">
            <Input
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
              placeholder="e.g. Managing Director (MD)"
              list="team-role-suggestions"
              className={inputClass}
            />
            {/* Suggestions while typing (CEO, MD, Head of Marketing…) */}
            <datalist id="team-role-suggestions">
              {ROLE_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </FormField>
        </div>

        <div>
          <p className={labelClass}>Group on the About page</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("category", option.value)}
                aria-pressed={form.category === option.value}
                className={`cursor-pointer rounded-xl p-3 text-left ring-1 transition ${
                  form.category === option.value
                    ? "bg-[#faf8f3] ring-2 ring-[#c49a3c]"
                    : "bg-white ring-slate-200 hover:ring-slate-300"
                }`}
              >
                <span className="block text-sm font-semibold text-[#14245a]">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </FormSection>

      {/* ─── 2. Photo and bio ─── */}
      <FormSection number={2} title="Photo and bio">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[12rem_1fr]">
          <div>
            <p className={labelClass}>Photo</p>
            {/* <ImageUpload
            value={form.image}
            onChange={(url) => updateField("image", url)}
            bucket="team-images"
            folder="profiles"
            label="Upload Profile Image"
            aspectRatio="aspect-square"
            maxSizeMB={2}
          /> */}

            <ImageUploadCloudinary
              value={form.image}
              onChange={(url) => updateField("image", url)}
              bucket="team-images"
              folder="profiles"
              label="Upload photo"
              aspectRatio="aspect-square"
              maxSizeMB={1}
            />
            <p className="mt-1 text-xs text-slate-400">Square, a clear face.</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className={labelClass.replace("mb-1.5 ", "")}>Bio</p>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {form.bio.length} characters
              </span>
            </div>
            <textarea
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              rows={7}
              placeholder="Two or three sentences: their experience and what they look after."
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15"
            />
          </div>
        </div>
      </FormSection>

      {/* ─── 3. Social links ─── */}
      <FormSection number={3} title="Social links">
        <p className="-mt-2 text-xs text-slate-500">
          All optional. Empty ones aren&apos;t shown.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOCIAL_FIELDS.map((social) => (
            <label
              key={social.field}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white pl-2 transition focus-within:border-[#c49a3c] focus-within:ring-4 focus-within:ring-[#c49a3c]/15"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#c49a3c]/10 text-[#a8852f]">
                <social.icon size={14} />
              </span>
              <span className="sr-only">{social.label}</span>
              <input
                value={form[social.field]}
                onChange={(e) => updateField(social.field, e.target.value)}
                placeholder={social.placeholder}
                className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none placeholder:text-slate-400"
              />
            </label>
          ))}
        </div>
      </FormSection>

      {/* ─── 4. Order ─── */}
      <FormSection number={4} title="Order">
        <div className="max-w-xs">
          <FormField
            label="Sort order"
            hint="Lower numbers are listed first in their group"
          >
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => updateField("sortOrder", e.target.value)}
              placeholder="0"
              className={inputClass}
              min="0"
            />
          </FormField>
        </div>
      </FormSection>

      {/* ─── Save ─── */}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
          <Check className="h-4 w-4" />
          Team member {isEditing ? "updated" : "added"}.
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
          {isEditing ? "Save changes" : "Add member"}
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
const inputClass =
  "h-11 rounded-xl border border-slate-200 bg-white focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";

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
