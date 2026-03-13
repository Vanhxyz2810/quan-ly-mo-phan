"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Shield, Clock, ArrowLeft, Save } from "lucide-react";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnUrl=/profile");
    }
  }, [isAuthenticated, router]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-(--color-bg)">
      <PublicNavbar />

      <div className="flex-1 max-w-3xl mx-auto w-full py-10 px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-(--color-muted) mb-8">
          <Link href="/" className="hover:text-(--color-text)">Trang chủ</Link>
          <span>/</span>
          <span className="text-(--color-text) font-medium">Tài khoản</span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-(--color-text) mb-8">Tài khoản của tôi</h1>

        <div className="flex flex-col gap-6">
          {/* Profile card */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center">
                <span className="text-2xl font-bold text-white font-heading">
                  {user.fullName?.[0] ?? "?"}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-(--color-text)">{user.fullName}</h2>
                <div className="flex items-center gap-2 text-sm text-(--color-muted)">
                  <Shield size={14} className="text-(--color-secondary)" />
                  {user.role === "admin" ? "Quản trị viên" : user.role === "staff" ? "Nhân viên" : "Khách hàng"}
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text) flex items-center gap-1.5">
                  <Mail size={14} className="text-(--color-muted)" />
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="h-11 rounded-lg border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-muted) cursor-not-allowed"
                />
                <span className="text-xs text-(--color-muted)">Email không thể thay đổi</span>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text) flex items-center gap-1.5">
                  <User size={14} className="text-(--color-muted)" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  defaultValue={user.fullName}
                  className="h-11 rounded-lg border border-(--color-border) bg-white px-3 text-sm text-(--color-text) focus:outline-none focus:border-(--color-primary)"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-(--color-text) flex items-center gap-1.5">
                  <Phone size={14} className="text-(--color-muted)" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="0912 345 678"
                  className="h-11 rounded-lg border border-(--color-border) bg-white px-3 text-sm text-(--color-text) focus:outline-none focus:border-(--color-primary)"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 h-11 px-6 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Save size={16} />
                Lưu thay đổi
              </button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">Đã lưu thành công!</span>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6">
            <h3 className="font-semibold text-(--color-text) text-sm mb-4">Liên kết nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/orders"
                className="flex items-center gap-3 p-4 rounded-lg border border-(--color-border) hover:bg-(--color-bg) transition-colors"
              >
                <Clock size={20} className="text-(--color-primary)" />
                <div>
                  <p className="text-sm font-semibold text-(--color-text)">Lịch sử đơn hàng</p>
                  <p className="text-xs text-(--color-muted)">Xem các đơn dịch vụ đã đặt</p>
                </div>
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-3 p-4 rounded-lg border border-(--color-border) hover:bg-(--color-bg) transition-colors"
              >
                <MapPin size={20} className="text-(--color-secondary)" />
                <div>
                  <p className="text-sm font-semibold text-(--color-text)">Tra cứu mộ phần</p>
                  <p className="text-xs text-(--color-muted)">Tìm kiếm người thân</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
