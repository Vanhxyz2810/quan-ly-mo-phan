"use client";

import { useEffect, useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useAuth } from "@/lib/auth-context";
import { User, Mail, Phone, Shield, Save, Building2, Wrench } from "lucide-react";
import { serviceOrderApi, type ServiceCatalogItem } from "@/lib/api";

const MAINTENANCE_PACKAGES = [
  { key: "1 năm", price: 1_500_000, desc: "Bảo trì cơ bản 1 năm" },
  { key: "5 năm", price: 6_000_000, desc: "Bảo trì trung hạn 5 năm" },
  { key: "Trọn đời", price: 20_000_000, desc: "Bảo trì trọn đời (50 năm)" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState("");
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>([]);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    serviceOrderApi.getCatalog().then(setCatalog).catch(() => {});
  }, []);

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

          {/* System Info (Admin only) */}
          {isAdmin && (
            <>
              <div className="h-px bg-(--color-border) my-2" />

              <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6">
                <h2 className="font-heading text-base font-bold text-(--color-text) mb-5 flex items-center gap-2">
                  <Building2 size={18} className="text-(--color-primary)" />
                  Thông tin nghĩa trang
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Tên", "Nghĩa trang Nhân dân TP"],
                    ["Địa chỉ", "123 Đường Hòa Bình, Quận 1, TP.HCM"],
                    ["Điện thoại", "(028) 1234 5678"],
                    ["Email", "info@cemeteryiq.vn"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">{label}</span>
                      <p className="text-(--color-text) font-medium mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Catalog */}
              <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6">
                <h2 className="font-heading text-base font-bold text-(--color-text) mb-5 flex items-center gap-2">
                  <Wrench size={18} className="text-(--color-primary)" />
                  Bảng giá dịch vụ
                </h2>
                {catalog.length > 0 && (
                  <div className="flex flex-col gap-2 mb-6">
                    {catalog.map(c => (
                      <div key={c.type} className="flex items-center justify-between py-2 px-3 rounded-lg bg-(--color-bg)">
                        <span className="text-sm font-medium text-(--color-text)">{c.label}</span>
                        <span className="text-sm font-bold text-(--color-secondary)">{c.price.toLocaleString("vi-VN")} ₫</span>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="text-sm font-semibold text-(--color-text) mb-2">Gói bảo trì</h3>
                <div className="flex flex-col gap-2">
                  {MAINTENANCE_PACKAGES.map(pkg => (
                    <div key={pkg.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-(--color-bg)">
                      <div>
                        <span className="text-sm font-medium text-(--color-text)">{pkg.key}</span>
                        <span className="text-xs text-(--color-muted) ml-2">{pkg.desc}</span>
                      </div>
                      <span className="text-sm font-bold text-(--color-secondary)">{pkg.price.toLocaleString("vi-VN")} ₫</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
