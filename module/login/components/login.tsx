// module/login/components/login.tsx — login form (shared look: AuthLayout.tsx)
"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser } from "@/app/(auth)/login/actions";
import { signInWithGoogle } from "@/app/(auth)/register/actions";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { AuthCard, AuthHeader, AuthShell, GoogleButton, OrDivider } from "./AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginUser(formData);

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
        <AuthHeader label="Welcome back" title="Sign in to" italic="your account." subtitle="Manage your tickets and registrations in one place." />

        <AuthCard>
          {/* Google Sign In */}
          <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />

          <OrDivider />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#14245a]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#a8852f] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <div className="w-7 h-7 rounded-md bg-[#dcb45c] text-[#0d1840] flex items-center justify-center">
                    <ArrowRight size={14} />
                  </div>
                </>
              )}
            </button>
          </form>
        </AuthCard>

        {/* Register Link */}
        <p className="text-center text-sm text-slate-500 mt-7">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#14245a] underline decoration-[#c49a3c] underline-offset-4 hover:decoration-2"
          >
            Create Account
          </Link>
        </p>
    </AuthShell>
  );
}
