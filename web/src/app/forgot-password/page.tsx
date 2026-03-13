"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate sending — no real backend endpoint yet
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[520px] shrink-0 bg-(--color-primary) flex-col justify-between px-14 py-12 relative overflow-hidden">
        <Image src="/images/login-bg.png" alt="" fill className="object-cover opacity-30" />
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
            Khôi phục<br />mật khẩu
          </h1>
          <p className="text-(--color-sidebar-muted) text-base leading-relaxed max-w-sm">
            Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.
          </p>
        </div>

        <p className="relative text-(--color-sidebar-muted)/60 text-xs">
          © 2026 An Nghỉ Viên. Bảo lưu mọi quyền.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-(--color-bg) px-6 py-12">
        <div className="w-full max-w-[420px] flex flex-col gap-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-(--color-primary) flex items-center justify-center">
              <span className="text-white font-bold">✦</span>
            </div>
            <span className="font-heading text-(--color-text) text-xl font-bold">An Nghỉ Viên</span>
          </div>

          {sent ? (
            /* Success state */
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-(--color-text)">Đã gửi email!</h2>
              <p className="text-(--color-muted) text-sm leading-relaxed max-w-sm">
                Nếu email <strong>{email}</strong> đã được đăng ký trong hệ thống,
                bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút.
              </p>
              <p className="text-(--color-muted) text-xs">
                Không nhận được email? Kiểm tra thư mục Spam hoặc thử lại sau.
              </p>
              <Link
                href="/login"
                className="flex items-center gap-2 h-12 px-8 rounded-xl bg-(--color-primary) text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <ArrowLeft size={16} />
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="flex flex-col gap-2">
                <h2 className="font-heading text-3xl font-bold text-(--color-text)">Quên mật khẩu</h2>
                <p className="text-(--color-muted) text-sm">
                  Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
                </p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-(--color-secondary) text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi link đặt lại mật khẩu"
                  )}
                </button>
              </form>

              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-(--color-muted) hover:text-(--color-text) transition-colors self-center"
              >
                <ArrowLeft size={14} />
                Quay lại đăng nhập
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
