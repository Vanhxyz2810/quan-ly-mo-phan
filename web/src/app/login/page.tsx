"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "admin">("customer");

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex w-[520px] shrink-0 bg-(--color-primary) flex-col justify-between px-14 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--color-secondary) flex items-center justify-center">
            <span className="text-white font-bold text-lg">✦</span>
          </div>
          <span className="font-heading text-white text-xl font-bold tracking-wide">An Nghỉ Viên</span>
        </div>

        {/* Middle illustration area */}
        <div className="flex flex-col gap-6">
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
        <p className="text-(--color-sidebar-muted)/60 text-xs">
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
          <div className="flex flex-col gap-1">
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
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  role === r
                    ? "bg-(--color-primary) text-white shadow-sm"
                    : "text-(--color-muted) hover:text-(--color-text)"
                }`}
              >
                {r === "customer" ? "Khách hàng" : "Quản trị viên"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5">
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
                  placeholder={role === "admin" ? "admin@nghitrang.vn" : "email@example.com"}
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
                  placeholder="••••••••"
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
              className="w-full h-12 rounded-xl bg-(--color-primary) text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-(--color-primary-dark) active:scale-[0.98] transition-all mt-1"
            >
              Đăng nhập <ArrowRight size={16} />
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
                className="h-11 rounded-xl border border-(--color-border) bg-white flex items-center justify-center gap-2 text-sm font-semibold text-(--color-text) hover:bg-(--color-bg) transition-colors"
              >
                <span className="font-bold">{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
