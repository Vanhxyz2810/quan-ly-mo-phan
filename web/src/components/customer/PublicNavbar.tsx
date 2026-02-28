import Link from "next/link";
import { ChevronDown, Users, Shield } from "lucide-react";

export function PublicNavbar() {
  return (
    <nav className="flex items-center justify-between px-10 h-[72px] bg-white border-b border-(--color-border) shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-lg bg-(--color-primary) flex items-center justify-center">
          <span className="text-white text-xs font-bold">CQ</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-(--color-text) text-sm font-bold">CemeteryIQ</span>
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
        <button className="flex items-center gap-1 text-sm font-medium text-(--color-text) hover:text-(--color-primary) transition-colors">
          Dịch vụ
          <ChevronDown size={14} className="text-(--color-muted)" />
        </button>
        <Link
          href="#lien-he"
          className="text-sm font-medium text-(--color-text) hover:text-(--color-primary) transition-colors"
        >
          Liên hệ
        </Link>
      </div>

      {/* Auth buttons */}
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="flex items-center gap-1.5 h-10 px-4 rounded-md border border-(--color-border) text-[13px] font-semibold text-(--color-primary) hover:bg-(--color-bg) transition-colors"
        >
          <Users size={16} />
          Gia đình
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-1.5 h-10 px-4 rounded-md bg-(--color-primary) text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Shield size={16} className="text-(--color-secondary)" />
          Quản trị
        </Link>
      </div>
    </nav>
  );
}
