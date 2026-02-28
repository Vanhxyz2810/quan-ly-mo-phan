"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, User, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const steps = ["Tài khoản", "Cá nhân", "Xác nhận"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex w-[520px] shrink-0 bg-(--color-primary) flex-col justify-between px-14 py-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--color-secondary) flex items-center justify-center">
            <span className="text-white font-bold text-lg">✦</span>
          </div>
          <span className="font-heading text-white text-xl font-bold tracking-wide">An Nghỉ Viên</span>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-16 h-1 bg-(--color-secondary)" />
          <h1 className="font-heading text-4xl font-bold text-white leading-snug">
            Tạo tài khoản<br />trong vài bước
          </h1>
          <p className="text-(--color-sidebar-muted) text-base leading-relaxed max-w-sm">
            Đăng ký để tra cứu thông tin mộ phần, đặt dịch vụ chăm sóc và thanh toán phí duy tu online.
          </p>

          {/* Step list */}
          <div className="flex flex-col gap-4 mt-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    i < step
                      ? "bg-(--color-secondary) border-(--color-secondary) text-white"
                      : i === step
                      ? "bg-white border-white text-(--color-primary)"
                      : "border-white/30 text-white/40"
                  }`}
                >
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    i <= step ? "text-white" : "text-white/40"
                  }`}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-(--color-sidebar-muted)/60 text-xs">
          © 2025 An Nghỉ Viên. Bảo lưu mọi quyền.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-(--color-bg) px-6 py-12">
        <div className="w-full max-w-[460px] flex flex-col gap-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-(--color-primary) flex items-center justify-center">
              <span className="text-white font-bold">✦</span>
            </div>
            <span className="font-heading text-(--color-text) text-xl font-bold">An Nghỉ Viên</span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-3xl font-bold text-(--color-text)">Đăng ký tài khoản</h2>
            <p className="text-(--color-muted) text-sm">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-(--color-secondary) font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>

          {/* Mobile step indicator */}
          <div className="flex lg:hidden items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i < step
                      ? "bg-(--color-secondary) border-(--color-secondary) text-white"
                      : i === step
                      ? "bg-(--color-primary) border-(--color-primary) text-white"
                      : "border-(--color-border) text-(--color-muted)"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-px ${i < step ? "bg-(--color-secondary)" : "bg-(--color-border)"}`} />
                )}
              </div>
            ))}
            <span className="ml-2 text-sm text-(--color-muted)">{steps[step]}</span>
          </div>

          {/* Step 0: Tài khoản */}
          {step === 0 && (
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => { e.preventDefault(); setStep(1); }}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-4 text-sm text-(--color-text) placeholder-[color:var(--color-muted)] focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-12 text-sm text-(--color-text) placeholder-[color:var(--color-muted)] focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-muted)"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength */}
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? "bg-(--color-secondary)" : "bg-(--color-border)"}`} />
                  ))}
                  <span className="text-xs text-(--color-secondary) ml-1 font-semibold">Trung bình</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-12 text-sm text-(--color-text) placeholder-[color:var(--color-muted)] focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-muted)"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-(--color-primary) text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-(--color-primary-dark) active:scale-[0.98] transition-all mt-1"
              >
                Tiếp theo <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Step 1: Cá nhân */}
          {step === 1 && (
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => { e.preventDefault(); setStep(2); }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-(--color-text)">Họ</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                    <input
                      type="text"
                      placeholder="Nguyễn"
                      className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-4 text-sm text-(--color-text) placeholder-[color:var(--color-muted)] focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-(--color-text)">Tên</label>
                  <input
                    type="text"
                    placeholder="Văn An"
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white px-4 text-sm text-(--color-text) placeholder-[color:var(--color-muted)] focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Số điện thoại</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-4 text-sm text-(--color-text) placeholder-[color:var(--color-muted)] focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Địa chỉ</label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
                  className="w-full h-12 rounded-xl border border-(--color-border) bg-white px-4 text-sm text-(--color-text) placeholder-[color:var(--color-muted)] focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Mối quan hệ với người mất</label>
                <select className="w-full h-12 rounded-xl border border-(--color-border) bg-white px-4 text-sm text-(--color-text) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all appearance-none">
                  <option value="">Chọn mối quan hệ...</option>
                  <option>Con cái</option>
                  <option>Vợ / Chồng</option>
                  <option>Anh / Chị / Em</option>
                  <option>Cháu</option>
                  <option>Khác</option>
                </select>
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="h-12 px-6 rounded-xl border border-(--color-border) text-sm font-semibold text-(--color-text) hover:bg-(--color-bg) transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-(--color-primary) text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-(--color-primary-dark) active:scale-[0.98] transition-all"
                >
                  Tiếp theo <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Xác nhận */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl bg-white border border-(--color-border) p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-(--color-muted) tracking-wider">XÁC NHẬN THÔNG TIN</h3>
                {[
                  { label: "Email", value: "nguyenvanan@gmail.com" },
                  { label: "Họ và tên", value: "Nguyễn Văn An" },
                  { label: "Số điện thoại", value: "0912 345 678" },
                  { label: "Quan hệ", value: "Con cái" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center text-sm border-b border-(--color-border) pb-3 last:border-0 last:pb-0">
                    <span className="text-(--color-muted)">{r.label}</span>
                    <span className="font-semibold text-(--color-text)">{r.value}</span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-[color:var(--color-primary)]" />
                <span className="text-sm text-(--color-muted) leading-relaxed">
                  Tôi đồng ý với{" "}
                  <span className="text-(--color-secondary) font-semibold">Điều khoản dịch vụ</span> và{" "}
                  <span className="text-(--color-secondary) font-semibold">Chính sách bảo mật</span> của An Nghỉ Viên.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 px-6 rounded-xl border border-(--color-border) text-sm font-semibold text-(--color-text) hover:bg-(--color-bg) transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  className="flex-1 h-12 rounded-xl bg-(--color-secondary) text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 size={18} /> Hoàn tất đăng ký
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
