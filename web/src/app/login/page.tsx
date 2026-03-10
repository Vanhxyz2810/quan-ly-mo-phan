"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, loading, error, clearError, user } = useAuth();
  const router = useRouter();
  // Track whether we're waiting to redirect after a successful login
  const pendingRedirect = useRef(false);

  // Once user state updates after login, perform the role-aware redirect
  useEffect(() => {
    if (pendingRedirect.current && user) {
      pendingRedirect.current = false;
      const isAdminOrStaff = user.role === "admin" || user.role === "staff";
      router.push(isAdminOrStaff ? "/admin" : "/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Email không đúng định dạng.");
      return;
    }
    if (password.length < 6) {
      setValidationError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    const success = await login(email, password);
    if (success) {
      // user state updates asynchronously; the useEffect above handles the redirect
      pendingRedirect.current = true;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex w-[520px] shrink-0 bg-(--color-primary) flex-col justify-between px-14 py-12 relative overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/login-bg.png"
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--color-primary) via-(--color-primary)/70 to-(--color-primary)/40" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--color-secondary) flex items-center justify-center">
            <span className="text-white font-bold text-lg">✦</span>
          </div>
          <span className="font-heading text-white text-xl font-bold tracking-wide">An Nghỉ Viên</span>
        </div>

        {/* Middle illustration area */}
        <div className="relative flex flex-col gap-6">
          <div className="w-16 h-1 bg-(--color-secondary)" />
          <h1 className="font-heading text-4xl font-bold text-white leading-snug">
            Hệ thống quản lý<br />nghĩa trang thông minh
          </h1>
          <p className="text-(--color-sidebar-muted) text-base leading-relaxed max-w-sm">
            Quản lý mộ phần, chăm sóc khách hàng và vận hành toàn diện trong một nền tảng duy nhất.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { value: "2,400+", label: "Mộ phần" },
              { value: "98%", label: "Hài lòng" },
              { value: "24/7", label: "Hỗ trợ" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="text-(--color-secondary) text-2xl font-bold font-heading">{s.value}</span>
                <span className="text-(--color-sidebar-muted) text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-(--color-sidebar-muted)/60 text-xs">
          © 2025 An Nghỉ Viên. Bảo lưu mọi quyền.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-(--color-bg) px-6 py-12">
        <div className="w-full max-w-[420px] flex flex-col gap-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-(--color-primary) flex items-center justify-center">
              <span className="text-white font-bold">✦</span>
            </div>
            <span className="font-heading text-(--color-text) text-xl font-bold">An Nghỉ Viên</span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-3xl font-bold text-(--color-text)">Đăng nhập</h2>
            <p className="text-(--color-muted) text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-(--color-secondary) font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-xl overflow-hidden border border-(--color-border) bg-white p-1 gap-1">
            {(["customer", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === r
                  ? "bg-(--color-primary) text-white shadow-sm"
                  : "text-(--color-muted) hover:text-(--color-text)"
                  }`}
              >
                {r === "customer" ? "Khách hàng" : "Quản trị viên"}
              </button>
            ))}
          </div>

          {/* Validation / API error messages */}
          {(validationError || error) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{validationError ?? error}</span>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-(--color-text)">
                {role === "admin" ? "Tên đăng nhập" : "Email"}
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)"
                />
                <input
                  type={role === "admin" ? "text" : "email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@nghitrang.vn" : "email@example.com"}
                  required
                  className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-4 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-(--color-text)">Mật khẩu</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-(--color-secondary) font-semibold hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-12 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-text)"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-(--color-border) accent-(--color-primary)"
              />
              <span className="text-sm text-(--color-muted)">Ghi nhớ đăng nhập</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-(--color-primary) text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-(--color-primary-dark) active:scale-[0.98] transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-(--color-border)" />
            <span className="text-xs text-(--color-muted)">hoặc tiếp tục với</span>
            <div className="flex-1 h-px bg-(--color-border)" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Google", icon: "G" },
              { label: "Facebook", icon: "f" },
            ].map((s) => (
              <button
                key={s.label}
                disabled
                title="Sắp ra mắt"
                className="h-11 rounded-xl border border-(--color-border) bg-white flex items-center justify-center gap-2 text-sm font-semibold text-(--color-muted) opacity-50 cursor-not-allowed transition-colors"
              >
                <span className="font-bold">{s.icon}</span> {s.label}
              </button>
            ))}
          </div>

          {/* Register CTA */}
          <div className="rounded-xl bg-[#F0F7F4] border border-(--color-primary)/15 p-4 text-center">
            <p className="text-sm text-(--color-text)">
              Bạn chưa có tài khoản?{" "}
              <Link href="/register" className="text-(--color-secondary) font-bold hover:underline">
                Đăng ký miễn phí →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
