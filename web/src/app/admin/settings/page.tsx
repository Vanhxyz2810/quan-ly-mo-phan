"use client";

import { useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAuth } from "@/lib/auth-context";
import { User, Mail, Phone, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleSave() {
    // Mock save — trong thực tế gọi PATCH /api/auth/profile
    showToast("Đã lưu thay đổi thành công!");
  }

  const roleLabel: Record<string, string> = {
    Admin: "Quản trị viên",
    Staff: "Nhân viên",
    Customer: "Khách hàng",
    admin: "Quản trị viên",
    staff: "Nhân viên",
    customer: "Khách hàng",
  };

  return (
    <>
      <AdminNavbar title="Cài đặt tài khoản" subtitle="Settings" />
      <div className="flex-1 overflow-auto p-8">
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-(--color-primary) text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
            {toast}
          </div>
        )}

        <div className="max-w-2xl flex flex-col gap-6">
          {/* Profile */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6">
            <h2 className="font-heading text-base font-bold text-(--color-text) mb-5 flex items-center gap-2">
              <User size={18} className="text-(--color-primary)" />
              Thông tin cá nhân
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">Họ và tên</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:ring-2 focus:ring-(--color-primary)/20 text-(--color-text)"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide flex items-center gap-1.5">
                  <Mail size={12} /> Email
                </label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg)/50 text-(--color-muted) cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide flex items-center gap-1.5">
                  <Phone size={12} /> Số điện thoại
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:ring-2 focus:ring-(--color-primary)/20 text-(--color-text)"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--color-primary)/10">
                  <Shield size={14} className="text-(--color-primary)" />
                  <span className="text-sm font-semibold text-(--color-primary)">
                    {roleLabel[user?.role ?? ""] ?? user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6">
            <h2 className="font-heading text-base font-bold text-(--color-text) mb-5">Đổi mật khẩu</h2>
            <div className="flex flex-col gap-4">
              {[
                ["currentPassword", "Mật khẩu hiện tại"],
                ["newPassword", "Mật khẩu mới"],
                ["confirmPassword", "Xác nhận mật khẩu mới"],
              ].map(([key, label]) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">{label}</label>
                  <input
                    type="password"
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:ring-2 focus:ring-(--color-primary)/20 text-(--color-text)"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 self-start h-11 px-7 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90"
          >
            <Save size={16} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </>
  );
}
