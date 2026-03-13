"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, User, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const steps = ["Tài khoản", "Cá nhân", "Xác nhận"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState<string | null>(null);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [relationship, setRelationship] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

  const { register, loading, error, clearError } = useAuth();
  const router = useRouter();

  const fullName = `${lastName} ${firstName}`.trim();

  const handleRegister = async () => {
    clearError();
    const success = await register(email, password, fullName, phone, "Customer");
    if (success) {
      router.push("/");
    }
  };

  // Password strength
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    return score;
  };
  const strength = getPasswordStrength();
  const strengthLabel = ["Yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"][strength];
  const strengthColor = strength <= 1 ? "bg-red-400" : strength === 2 ? "bg-(--color-secondary)" : "bg-green-500";

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex w-[520px] shrink-0 bg-(--color-primary) flex-col justify-between px-14 py-12 relative overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/register-bg.png"
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--color-primary) via-(--color-primary)/70 to-(--color-primary)/40" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--color-secondary) flex items-center justify-center">
            <span className="text-white font-bold text-lg">✦</span>
          </div>
          <span className="font-heading text-white text-xl font-bold tracking-wide">An Nghỉ Viên</span>
        </div>

        <div className="relative flex flex-col gap-6">
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i < step
                    ? "bg-(--color-secondary) border-(--color-secondary) text-white"
                    : i === step
                      ? "bg-white border-white text-(--color-primary)"
                      : "border-white/30 text-white/40"
                    }`}
                >
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span
                  className={`text-sm font-semibold ${i <= step ? "text-white" : "text-white/40"
                    }`}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-(--color-sidebar-muted)/60 text-xs">
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
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < step
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

          {/* Error message */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Step 0: Tài khoản */}
          {step === 0 && (
            <form
              className="flex flex-col gap-5"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                if (password !== confirmPassword) {
                  setPasswordMatchError("Mật khẩu không khớp.");
                  return;
                }
                setPasswordMatchError(null);
                setStep(1);
              }}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-4 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    minLength={6}
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-12 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
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
                {password.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : "bg-(--color-border)"}`} />
                    ))}
                    <span className={`text-xs ml-1 font-semibold ${strength <= 1 ? "text-red-400" : strength === 2 ? "text-(--color-secondary)" : "text-green-500"}`}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordMatchError) setPasswordMatchError(null);
                    }}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className={`w-full h-12 rounded-xl border bg-white pl-11 pr-12 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:ring-2 transition-all ${
                      passwordMatchError
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/10"
                        : "border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-muted)"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordMatchError && (
                  <p className="text-xs text-red-500 font-medium mt-0.5">{passwordMatchError}</p>
                )}
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
              onSubmit={(e: FormEvent) => { e.preventDefault(); setStep(2); }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-(--color-text)">Họ</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nguyễn"
                      required
                      className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-4 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-(--color-text)">Tên</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Văn An"
                    required
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white px-4 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Số điện thoại</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full h-12 rounded-xl border border-(--color-border) bg-white pl-11 pr-4 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Địa chỉ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
                  className="w-full h-12 rounded-xl border border-(--color-border) bg-white px-4 text-sm text-(--color-text) placeholder-(--color-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text)">Mối quan hệ với người mất</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full h-12 rounded-xl border border-(--color-border) bg-white px-4 text-sm text-(--color-text) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all appearance-none"
                >
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
                  { label: "Email", value: email },
                  { label: "Họ và tên", value: fullName },
                  { label: "Số điện thoại", value: phone || "—" },
                  { label: "Quan hệ", value: relationship || "—" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center text-sm border-b border-(--color-border) pb-3 last:border-0 last:pb-0">
                    <span className="text-(--color-muted)">{r.label}</span>
                    <span className="font-semibold text-(--color-text)">{r.value}</span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[color:var(--color-primary)]"
                />
                <span className="text-sm text-(--color-muted) leading-relaxed">
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="text-(--color-secondary) font-semibold hover:underline">Điều khoản dịch vụ</Link> và{" "}
                  <Link href="/privacy" className="text-(--color-secondary) font-semibold hover:underline">Chính sách bảo mật</Link> của An Nghỉ Viên.
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
                  disabled={!agreedTerms || loading}
                  onClick={handleRegister}
                  className="flex-1 h-12 rounded-xl bg-(--color-secondary) text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Hoàn tất đăng ký
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
