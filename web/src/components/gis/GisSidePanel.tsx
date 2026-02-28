"use client";

import { X, MapPin, Phone, Mail, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Plot, UserRole } from "./types";

interface Props {
  plot: Plot | null;
  isOpen: boolean;
  userRole: UserRole;
  onClose: () => void;
  onLocate: (plotId: string) => void;
}

const STATUS_MAP: Record<string, { label: string; variant: "success" | "danger" | "info" }> = {
  occupied: { label: "Đã lấp đầy", variant: "danger" },
  available: { label: "Còn trống", variant: "success" },
  reserved: { label: "Đã đặt trước", variant: "info" },
};

export function GisSidePanel({ plot, isOpen, userRole, onClose, onLocate }: Props) {
  if (!isOpen || !plot) return null;

  const st = STATUS_MAP[plot.status] ?? { label: plot.status, variant: "info" as const };
  const d = plot.data?.deceased;
  const nok = plot.data?.nextOfKin;
  const fee = plot.data?.maintenance;

  return (
    <aside className="w-[340px] shrink-0 bg-(--color-surface) flex flex-col h-full overflow-hidden border-l border-(--color-border) transition-transform duration-200">
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

      {/* Location badge */}
      <div className="flex items-center gap-2 px-5 h-10 bg-[#F0F7F4] border-b border-(--color-border)">
        <MapPin size={14} className="text-(--color-primary)" />
        <span className="text-(--color-primary) text-[13px] font-semibold">
          Khu {plot.zone} – Hàng {String(plot.row + 1).padStart(2, "0")} – Số{" "}
          {String(plot.col + 1).padStart(2, "0")}
        </span>
        <div className="flex-1" />
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      {/* Locate button */}
      <button
        onClick={() => onLocate(plot.id)}
        className="flex items-center justify-center gap-2 mx-5 mt-3 h-9 rounded-md bg-(--color-bg) text-(--color-primary) text-xs font-medium hover:bg-(--color-border) transition-colors"
      >
        <Navigation size={13} />
        Định vị trên bản đồ
      </button>

      {/* Body */}
      <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
        {/* Deceased info */}
        {d && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-(--color-muted) tracking-wider">NGƯỜI ĐÃ MẤT</p>
            <div className="flex flex-col gap-1.5 text-sm">
              <Row label="Họ tên" value={d.name} bold />
              <Row label="Sinh" value={d.birthDate} />
              <Row label="Mất" value={d.deathDate} />
            </div>
          </div>
        )}

        {d && <div className="h-px bg-(--color-border)" />}

        {/* NOK */}
        {nok && userRole !== "customer" && (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-(--color-muted) tracking-wider">THÂN NHÂN</p>
              <div className="flex flex-col gap-1.5 text-sm">
                <p className="font-semibold text-(--color-text)">
                  {nok.name} ({nok.relationship})
                </p>
                <div className="flex items-center gap-1.5 text-(--color-muted)">
                  <Phone size={12} />
                  <span>{nok.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-(--color-muted)">
                  <Mail size={12} />
                  <span>{nok.email}</span>
                </div>
              </div>
            </div>
            <div className="h-px bg-(--color-border)" />
          </>
        )}

        {/* Fee */}
        {fee && (
          <div className="flex flex-col gap-1.5 text-sm">
            <p className="text-xs font-bold text-(--color-muted) tracking-wider mb-1">PHÍ DUY TƯ</p>
            <Row label="Gói" value={fee.package} />
            <Row
              label="Còn lại"
              value={
                fee.daysLeft <= 0
                  ? "Đã quá hạn"
                  : `${fee.daysLeft} ngày`
              }
              valueClass={
                fee.daysLeft <= 0
                  ? "text-red-600 font-bold"
                  : fee.daysLeft <= 30
                  ? "text-amber-600 font-semibold"
                  : "text-green-600 font-medium"
              }
            />
            <Row
              label="Giá"
              value={`${fee.price.toLocaleString("vi-VN")}đ`}
            />
          </div>
        )}

        {/* Empty plot message */}
        {plot.status === "available" && (
          <div className="text-center py-6 text-sm text-(--color-muted)">
            Ô mộ trống — sẵn sàng để đặt chỗ.
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 flex gap-2 border-t border-(--color-border) shrink-0">
        <Button variant="outline" size="sm" className="flex-1">
          Chỉnh sửa
        </Button>
        <Button variant="primary" size="sm" className="flex-1">
          Đặt dịch vụ
        </Button>
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-(--color-muted)">{label}</span>
      <span className={valueClass ?? (bold ? "font-semibold text-(--color-text)" : "font-medium text-(--color-text)")}>
        {value}
      </span>
    </div>
  );
}
