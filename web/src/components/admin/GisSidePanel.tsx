"use client";

import { X, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface GisSidePanelProps {
  onClose: () => void;
}

export function GisSidePanel({ onClose }: GisSidePanelProps) {
  return (
    <aside className="w-[320px] shrink-0 bg-(--color-surface) flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 bg-(--color-primary) shrink-0">
        <span className="font-heading text-white text-[15px] font-bold">Thông tin Mộ phần</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Coord badge */}
      <div className="flex items-center gap-2 px-5 h-10 bg-[#F0F7F4] border-b border-(--color-border)">
        <MapPin size={14} className="text-(--color-primary)" />
        <span className="text-(--color-primary) text-[13px] font-semibold">
          Khu A – Hàng 03 – Số 15
        </span>
        <div className="flex-1" />
        <Badge variant="danger">Đã lấp đầy</Badge>
      </div>

      {/* Photo placeholder */}
      <div className="h-40 bg-[#E8F0EC] flex items-center justify-center shrink-0">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-(--color-sidebar-muted)/30 flex items-center justify-center mx-auto mb-2">
            <span className="text-(--color-sidebar-muted) text-xl">🪦</span>
          </div>
          <p className="text-(--color-sidebar-muted) text-xs">Ảnh mộ phần</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
        {/* Deceased info */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-(--color-muted) tracking-wider">NGƯỜI ĐÃ MẤT</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-(--color-muted)">Họ tên</span>
              <span className="font-semibold text-(--color-text)">Nguyễn Văn An</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-muted)">Sinh</span>
              <span className="font-medium text-(--color-text)">15/03/1945</span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-muted)">Mất</span>
              <span className="font-medium text-(--color-text)">22/08/2018</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-(--color-border)" />

        {/* NOK */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-(--color-muted) tracking-wider">THÂN NHÂN (NOK)</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <p className="font-semibold text-(--color-text)">Nguyễn Thị Hoa (Con gái)</p>
            <div className="flex items-center gap-1.5 text-(--color-muted)">
              <Phone size={12} />
              <span>0812 345 678</span>
            </div>
            <div className="flex items-center gap-1.5 text-(--color-muted)">
              <Mail size={12} />
              <span>hoa.nguyen@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-(--color-border)" />

        {/* Fee */}
        <div className="flex flex-col gap-1.5 text-sm">
          <p className="text-xs font-bold text-(--color-muted) tracking-wider mb-1">PHÍ DUY TU</p>
          <div className="flex justify-between">
            <span className="text-(--color-muted)">Gói hiện hành</span>
            <span className="font-semibold text-(--color-text)">1 năm (2025–2026)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--color-muted)">Còn lại</span>
            <span className="font-semibold text-red-600">3 ngày</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-4 flex gap-2 border-t border-(--color-border) shrink-0">
        <Button variant="outline" size="sm" className="flex-1">Chỉnh sửa</Button>
        <Button variant="primary" size="sm" className="flex-1">Đặt dịch vụ</Button>
      </div>
    </aside>
  );
}
