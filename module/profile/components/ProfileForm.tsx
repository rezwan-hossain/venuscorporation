// module/profile/components/ProfileForm.tsx
"use client";

import { useState } from "react";
import { updateUserProfile } from "@/app/actions/profile";
import type { UserProfile, ProfileFormData } from "@/types/profile";
import Input from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";

type ProfileFormProps = {
  profile: UserProfile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    userName: profile.userName || "",
    phone: profile.phone || "",
    address: profile.address || "",
    birthDate: profile.birthDate || "",
    gender: profile.gender || "",
  });

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const safeArgs = JSON.parse(JSON.stringify(formData));
    const result = await updateUserProfile(safeArgs);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <div className="relative rounded-[1.75rem] border border-[#c49a3c]/25 bg-white p-6 shadow-xl shadow-[#14245a]/5 md:p-8">
      {/* Gold top line, rounded to the card (no overflow-hidden, so pop-ups like the date picker aren't clipped) */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 rounded-t-[1.75rem] bg-linear-to-r from-[#c49a3c] via-[#dcb45c] to-[#c49a3c]" />
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-[#14245a]" style={{ fontFamily: "var(--font-profile-serif)" }}>Profile Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your personal details and public profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email (Read Only) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={profile.email}
            disabled
            className="h-11 border border-slate-200 bg-slate-50 rounded-xl text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>

        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
              First Name
            </label>
            <Input
              type="text"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              className="h-11 border border-slate-200 bg-white rounded-xl transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
              Last Name
            </label>
            <Input
              type="text"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="h-11 border border-slate-200 bg-white rounded-xl transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 focus:outline-none"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              @
            </span>
            <Input
              type="text"
              placeholder="username"
              value={formData.userName}
              onChange={(e) =>
                updateField(
                  "userName",
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              className="h-11 border border-slate-200 bg-white rounded-xl transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 focus:outline-none pl-8"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Only lowercase letters, numbers, and underscores
          </p>
        </div>

        {/* Phone & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+880 1XXXXXXXXX"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="h-11 border border-slate-200 bg-white rounded-xl transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
              Gender
            </label>
            <Select
              value={formData.gender}
              onValueChange={(val) => updateField("gender", val)}
            >
              <SelectTrigger className="h-11 rounded-xl border border-slate-200 bg-white">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date of Birth — same picker as the Contact form; no future dates,
            month + year dropdowns to jump back quickly. Not a <label>: the
            calendar's buttons sit inside it. */}
        <div>
          <p className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
            Date of Birth
          </p>
          <DatePicker
            name="birthDate"
            value={formData.birthDate}
            onChange={(date) => updateField("birthDate", date)}
            placeholder="Choose your date of birth"
            disallow="future"
            yearSelect
            openTo="2000-01-01"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
            Address
          </label>
          <textarea
            placeholder="Enter your address"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            rows={3}
            className="w-full border border-slate-200 bg-white rounded-xl transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 focus:outline-none px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#c49a3c]/15 focus:border-[#c49a3c] resize-none"
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <p className="text-green-600 text-sm font-medium">
              Profile updated successfully!
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c49a3c]/15">
          <button
            type="button"
            onClick={() => {
              setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                userName: profile.userName || "",
                phone: profile.phone || "",
                address: profile.address || "",
                birthDate: profile.birthDate || "",
                gender: profile.gender || "",
              });
              setSuccess(false);
              setError("");
            }}
            className="px-5 py-2.5 text-sm font-medium text-[#14245a] border border-[#c49a3c]/50 rounded-full hover:bg-[#faf8f3] transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#14245a] rounded-full shadow-lg shadow-[#14245a]/20 hover:bg-[#0d1840] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
