// module/register/components/Register.tsx — register form (shared look: login/components/AuthLayout.tsx)
"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser, signInWithGoogle } from "@/app/(auth)/register/actions";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { AuthCard, AuthHeader, AuthShell, GoogleButton } from "@/module/login/components/AuthLayout";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("firstName", fullName);

    const result = await registerUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell>
        <AuthHeader label="Join us" title="Create your" italic="account." subtitle="Book tickets faster and keep all your events in one place." />

        <AuthCard>
          {/* Google Sign Up */}
          <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />

          {/* Divider */}
          {/* <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div> */}

          {/* Form */}

          {/* Form */}
          {false && (
            //tempory disable form submit to  google sign in
            // <fieldset disabled={true} className="space-y-4 opacity-60 cursor-not-allowed">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError("");
                  }}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                    className="w-full h-12 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            password.length >= i * 3
                              ? password.length >= 12
                                ? "bg-green-500"
                                : password.length >= 8
                                  ? "bg-yellow-500"
                                  : "bg-red-400"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    required
                    className={`w-full h-12 px-4 pr-11 rounded-lg border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15 transition-all ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 h-13 bg-[#14245a] text-white font-semibold uppercase tracking-[0.15em] text-sm rounded-xl shadow-lg shadow-[#14245a]/20 hover:bg-[#0d1840] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <div className="w-7 h-7 rounded-md bg-[#dcb45c] text-[#0d1840] flex items-center justify-center">
                      <ArrowRight size={14} />
                    </div>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Terms */}
          <p className="text-xs text-slate-400 text-center mt-5 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms-and-conditions"
              className="text-[#14245a] underline decoration-[#c49a3c]/60 hover:decoration-[#c49a3c]"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="text-[#14245a] underline decoration-[#c49a3c]/60 hover:decoration-[#c49a3c]"
            >
              Privacy Policy
            </Link>
          </p>
        </AuthCard>

        {/* Login Link */}
        <p className="text-center text-sm text-slate-500 mt-7">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#14245a] underline decoration-[#c49a3c] underline-offset-4 hover:decoration-2"
          >
            Sign In
          </Link>
        </p>
    </AuthShell>
  );
}
