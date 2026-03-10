"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Users, Shield, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function PublicNavbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between px-10 h-[72px] bg-white border-b border-(--color-border) shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/images/logo.png"
          alt="An Nghỉ Viên"
          width={34}
          height={34}
          className="rounded-lg"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-(--color-text) text-sm font-bold">An Nghỉ Viên</span>
          <span className="text-(--color-muted) text-[10px]">Hệ thống quản lý nghĩa trang</span>
        </div>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-8">
        <Link
          href="/search"
          className="text-sm font-medium text-(--color-text) hover:text-(--color-primary) transition-colors"
        >
          Tìm kiếm
        </Link>
        <Link
          href="/book"
          className="text-sm font-semibold text-(--color-secondary) hover:text-(--color-primary) transition-colors"
        >
          Đặt mộ phần
        </Link>
        <Link
          href="/#dich-vu"
          className="text-sm font-medium text-(--color-text) hover:text-(--color-primary) transition-colors"
        >
          Dịch vụ
        </Link>
        <Link
          href="/#lien-he"
          className="text-sm font-medium text-(--color-text) hover:text-(--color-primary) transition-colors"
        >
          Liên hệ
        </Link>
      </div>

      {/* Auth buttons or User Profile */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-(--color-text)">
              Xin chào, {user?.fullName}
            </span>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-(--color-primary) hover:underline"
              >
                Trang quản trị
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-(--color-border) text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        ) : (
          <>
            <Link
              href="/register"
              className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-(--color-border) text-[13px] font-semibold text-(--color-primary) hover:bg-(--color-bg) transition-colors"
            >
              <Users size={16} />
              Đăng ký
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 h-10 px-4 rounded-md bg-(--color-primary) text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Shield size={16} className="text-(--color-secondary)" />
              Đăng nhập
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
