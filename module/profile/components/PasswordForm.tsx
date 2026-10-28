// module/profile/components/PasswordForm.tsx
"use client";

import { useState } from "react";
import { updateUserPassword } from "@/app/actions/profile";
import type { PasswordFormData } from "@/types/profile";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";

export function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateField = (field: keyof PasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError("");
  };

  const toggleShow = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.currentPassword) {
      setError("Current password is required");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);

    const safeArgs = JSON.parse(JSON.stringify(formData));
    const result = await updateUserPassword(safeArgs);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }

    setLoading(false);
  };

  return (
    <div className="relative rounded-[1.75rem] border border-[#c49a3c]/25 bg-white p-6 shadow-xl shadow-[#14245a]/5 md:p-8">
      {/* Gold top line, rounded to the card (no overflow-hidden, so pop-ups like the date picker aren't clipped) */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 rounded-t-[1.75rem] bg-linear-to-r from-[#c49a3c] via-[#dcb45c] to-[#c49a3c]" />
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-[#14245a]" style={{ fontFamily: "var(--font-profile-serif)" }}>Change Password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ensure your account uses a strong password for security
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={(e) => updateField("currentPassword", e.target.value)}
              className="w-full h-11 border border-slate-200 bg-white rounded-xl transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 focus:outline-none px-3 pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => toggleShow("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={(e) => updateField("newPassword", e.target.value)}
              className="w-full h-11 border border-slate-200 bg-white rounded-xl transition hover:border-slate-300 focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 focus:outline-none px-3 pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => toggleShow("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Password Strength */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      formData.newPassword.length >= i * 3
                        ? formData.newPassword.length >= 12
                          ? "bg-green-500"
                          : formData.newPassword.length >= 8
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formData.newPassword.length < 6
                  ? "Too short"
                  : formData.newPassword.length < 8
                    ? "Weak"
                    : formData.newPassword.length < 12
                      ? "Good"
                      : "Strong"}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className={`w-full h-11 border rounded-xl px-3 pr-10 text-sm transition focus:outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 ${
                formData.confirmPassword &&
                formData.confirmPassword !== formData.newPassword
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-background"
              }`}
            />
            <button
              type="button"
              onClick={() => toggleShow("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.confirmPassword !== formData.newPassword && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
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
              Password updated successfully!
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-[#c49a3c]/15">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#14245a] rounded-full shadow-lg shadow-[#14245a]/20 hover:bg-[#0d1840] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
