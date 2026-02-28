"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Users,
  CreditCard,
  Calendar,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/gis", label: "Bản đồ GIS", icon: Map },
  { href: "/admin/crm", label: "Hồ sơ (CRM)", icon: Users },
  { href: "/admin/finance", label: "Tài chính", icon: CreditCard },
  { href: "/admin/calendar", label: "Lịch dịch vụ", icon: Calendar },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 bg-(--color-primary) flex flex-col h-full px-4 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-[72px]">
        <div className="w-[34px] h-[34px] rounded-lg bg-(--color-secondary) flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">CQ</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-white text-sm font-bold leading-tight">
            CemeteryIQ
          </span>
          <span className="text-(--color-sidebar-muted) text-[11px] leading-tight">
            Quản lý nghĩa trang
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-3" />

      {/* Nav label */}
      <p className="text-(--color-sidebar-muted) text-[11px] font-bold tracking-widest mb-1 px-3">
        ĐIỀU HƯỚNG
      </p>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 h-11 px-3 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-(--color-sidebar-muted) hover:bg-white/5 hover:text-white font-medium"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <Link
        href="/admin/settings"
        className="flex items-center gap-2.5 h-11 px-3 rounded-md text-sm text-(--color-sidebar-muted) hover:bg-white/5 hover:text-white font-medium transition-colors"
      >
        <Settings size={18} />
        Cài đặt
      </Link>

      {/* User area */}
      <div className="flex items-center gap-2.5 mt-2 p-3 rounded-lg bg-white/5">
        <div className="w-8 h-8 rounded-full bg-(--color-secondary) flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">AD</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">Admin Quản lý</p>
          <p className="text-(--color-sidebar-muted) text-xs truncate">
            admin@cemeteryiq.vn
          </p>
        </div>
      </div>
    </aside>
  );
}
