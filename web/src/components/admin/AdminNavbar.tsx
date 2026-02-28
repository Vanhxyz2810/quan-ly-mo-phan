import { Bell, ChevronRight } from "lucide-react";

interface AdminNavbarProps {
  title: string;
  subtitle?: string;
}

export function AdminNavbar({ title, subtitle }: AdminNavbarProps) {
  return (
    <header className="h-16 bg-(--color-surface) border-b border-(--color-border) flex items-center px-8 gap-4 shrink-0">
      {/* Breadcrumb */}
      <div className="flex-1 flex flex-col gap-0.5">
        {subtitle && (
          <div className="flex items-center gap-1 text-xs text-(--color-muted)">
            <span>{subtitle}</span>
            <ChevronRight size={12} />
            <span className="text-(--color-text) font-medium">{title}</span>
          </div>
        )}
        <h1 className="font-heading text-lg font-bold text-(--color-text) leading-tight">
          {title}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <span className="text-(--color-muted) text-sm">
          Thứ Sáu, 28/02/2026
        </span>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-(--color-bg) text-(--color-muted) transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-full bg-(--color-secondary) flex items-center justify-center">
          <span className="text-white text-xs font-bold">AD</span>
        </div>
      </div>
    </header>
  );
}
