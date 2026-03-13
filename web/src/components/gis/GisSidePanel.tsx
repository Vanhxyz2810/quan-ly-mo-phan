"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Phone, Mail, Navigation, Trash2, Pencil, Save, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Plot, PlotStatus, UserRole, GisMode } from "./types";

interface Props {
  plot: Plot | null;
  isOpen: boolean;
  userRole: UserRole;
  mode: GisMode;
  onClose: () => void;
  onLocate: (plotId: string) => void;
  onDeletePlot?: (plot: Plot) => void;
  onChangeStatus?: (plotId: string, status: PlotStatus) => void;
  onSavePlotInfo?: (plotId: string, data: {
    status?: string;
    deceased?: { name: string; birthDate: string; deathDate: string };
    nextOfKin?: { name: string; relationship: string; phone: string; email: string };
  }) => Promise<void>;
}

const STATUS_MAP: Record<string, { label: string; variant: "success" | "danger" | "info" }> = {
  occupied: { label: "Đã lấp đầy", variant: "danger" },
  available: { label: "Còn trống", variant: "success" },
  reserved: { label: "Đã đặt trước", variant: "info" },
};

const STATUS_OPTIONS: { value: PlotStatus; label: string }[] = [
  { value: "available", label: "Còn trống" },
  { value: "occupied", label: "Đã lấp đầy" },
  { value: "reserved", label: "Đã đặt trước" },
];

export function GisSidePanel({ plot, isOpen, userRole, mode, onClose, onLocate, onDeletePlot, onChangeStatus, onSavePlotInfo }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusWarning, setStatusWarning] = useState<PlotStatus | null>(null);

  // Edit form state
  const [deceasedName, setDeceasedName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokEmail, setNokEmail] = useState("");

  // Reset form when plot changes
  useEffect(() => {
    if (!plot) return;
    setEditing(false);
    setConfirmDelete(false);
    setStatusWarning(null);
    const d = plot.data?.deceased;
    const nok = plot.data?.nextOfKin;
    setDeceasedName(d?.name ?? "");
    setBirthDate(d?.birthDate ?? "");
    setDeathDate(d?.deathDate ?? "");
    setNokName(nok?.name ?? "");
    setNokRelationship(nok?.relationship ?? "");
    setNokPhone(nok?.phone ?? "");
    setNokEmail(nok?.email ?? "");
  }, [plot?.id]);

  if (!isOpen || !plot) return null;

  const isEditMode = mode === "edit" && userRole === "admin";
  const st = STATUS_MAP[plot.status] ?? { label: plot.status, variant: "info" as const };
  const d = plot.data?.deceased;
  const nok = plot.data?.nextOfKin;
  const fee = plot.data?.maintenance;

  const handleStatusChange = (newStatus: PlotStatus) => {
    if (newStatus === plot.status) return;
    // Warn if changing occupied → available (will lose data)
    if (plot.status === "occupied" && newStatus === "available" && d) {
      setStatusWarning(newStatus);
      return;
    }
    onChangeStatus?.(plot.id, newStatus);
  };

  const confirmStatusChange = () => {
    if (statusWarning) {
      onChangeStatus?.(plot.id, statusWarning);
      setStatusWarning(null);
    }
  };

  const handleSaveInfo = async () => {
    if (!onSavePlotInfo) return;
    setSaving(true);
    try {
      await onSavePlotInfo(plot.id, {
        deceased: deceasedName ? { name: deceasedName, birthDate, deathDate } : undefined,
        nextOfKin: nokName ? { name: nokName, relationship: nokRelationship, phone: nokPhone, email: nokEmail } : undefined,
      });
      setEditing(false);
    } catch {
      alert("Lỗi khi lưu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="w-[340px] shrink-0 bg-(--color-surface) flex flex-col h-full overflow-hidden border-l border-(--color-border)">
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
        {/* ── Edit mode: Status changer ── */}
        {isEditMode && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-(--color-muted) tracking-wider">ĐỔI TRẠNG THÁI</p>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    opt.value === plot.status
                      ? "bg-(--color-primary) text-white"
                      : "bg-(--color-bg) text-(--color-muted) hover:bg-(--color-border)"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Status change warning */}
            {statusWarning && (
              <div className="mt-1 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-amber-800">
                      Ô này đang có người mất ({d?.name}). Đổi sang &quot;Còn trống&quot; sẽ cần xóa dữ liệu người mất và thân nhân ở backend.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={confirmStatusChange}
                        className="px-3 py-1 rounded text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700"
                      >
                        Xác nhận đổi
                      </button>
                      <button
                        onClick={() => setStatusWarning(null)}
                        className="px-3 py-1 rounded text-xs font-medium text-amber-700 hover:bg-amber-100"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isEditMode && <div className="h-px bg-(--color-border)" />}

        {/* ── Deceased info ── */}
        {(d || editing) && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-(--color-muted) tracking-wider">NGƯỜI ĐÃ MẤT</p>
              {isEditMode && !editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-(--color-primary) hover:underline">
                  <Pencil size={11} /> Sửa
                </button>
              )}
            </div>
            {editing ? (
              <div className="flex flex-col gap-2">
                <FormField label="Họ tên" value={deceasedName} onChange={setDeceasedName} />
                <FormField label="Ngày sinh" value={birthDate} onChange={setBirthDate} placeholder="dd/MM/yyyy" />
                <FormField label="Ngày mất" value={deathDate} onChange={setDeathDate} placeholder="dd/MM/yyyy" />
              </div>
            ) : d ? (
              <div className="flex flex-col gap-1.5 text-sm">
                <Row label="Họ tên" value={d.name} bold />
                <Row label="Sinh" value={d.birthDate} />
                <Row label="Mất" value={d.deathDate} />
              </div>
            ) : null}
          </div>
        )}

        {(d || editing) && <div className="h-px bg-(--color-border)" />}

        {/* ── NOK ── */}
        {(nok || editing) && userRole !== "customer" && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-(--color-muted) tracking-wider">THÂN NHÂN</p>
                {isEditMode && !editing && (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-(--color-primary) hover:underline">
                    <Pencil size={11} /> Sửa
                  </button>
                )}
              </div>
              {editing ? (
                <div className="flex flex-col gap-2">
                  <FormField label="Họ tên" value={nokName} onChange={setNokName} />
                  <FormField label="Quan hệ" value={nokRelationship} onChange={setNokRelationship} />
                  <FormField label="Điện thoại" value={nokPhone} onChange={setNokPhone} />
                  <FormField label="Email" value={nokEmail} onChange={setNokEmail} />
                </div>
              ) : nok ? (
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
              ) : null}
            </div>
            <div className="h-px bg-(--color-border)" />
          </>
        )}

        {/* ── Fee ── */}
        {fee && (
          <div className="flex flex-col gap-1.5 text-sm">
            <p className="text-xs font-bold text-(--color-muted) tracking-wider mb-1">PHÍ DUY TƯ</p>
            <Row label="Gói" value={fee.package} />
            <Row
              label="Còn lại"
              value={fee.daysLeft <= 0 ? "Đã quá hạn" : `${fee.daysLeft} ngày`}
              valueClass={
                fee.daysLeft <= 0
                  ? "text-red-600 font-bold"
                  : fee.daysLeft <= 30
                  ? "text-amber-600 font-semibold"
                  : "text-green-600 font-medium"
              }
            />
            <Row label="Giá" value={`${fee.price.toLocaleString("vi-VN")}đ`} />
          </div>
        )}

        {/* Empty plot message */}
        {plot.status === "available" && !editing && (
          <div className="text-center py-6 text-sm text-(--color-muted)">
            Ô mộ trống — sẵn sàng để đặt chỗ.
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 flex flex-col gap-2 border-t border-(--color-border) shrink-0">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSaveInfo}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-md text-xs font-semibold bg-(--color-primary) text-white hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                // Reset form to original values
                const dd = plot.data?.deceased;
                const nn = plot.data?.nextOfKin;
                setDeceasedName(dd?.name ?? "");
                setBirthDate(dd?.birthDate ?? "");
                setDeathDate(dd?.deathDate ?? "");
                setNokName(nn?.name ?? "");
                setNokRelationship(nn?.relationship ?? "");
                setNokPhone(nn?.phone ?? "");
                setNokEmail(nn?.email ?? "");
              }}
              className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-md text-xs font-medium text-(--color-muted) bg-(--color-bg) hover:bg-(--color-border) transition"
            >
              <XCircle size={13} />
              Hủy
            </button>
          </div>
        ) : isEditMode ? (
          <>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-2 w-full h-9 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
                Xóa mộ phần này
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onDeletePlot?.(plot);
                    setConfirmDelete(false);
                    onClose();
                  }}
                  className="flex-1 h-9 rounded-md text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Xác nhận xóa
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-9 rounded-md text-xs font-medium text-(--color-muted) bg-(--color-bg) hover:bg-(--color-border) transition-colors"
                >
                  Hủy
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Chi tiết
            </Button>
            <Button variant="primary" size="sm" className="flex-1">
              Đặt dịch vụ
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

function FormField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-(--color-muted)">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 px-3 rounded-md border border-(--color-border) text-sm bg-white focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
      />
    </div>
  );
}

function Row({ label, value, bold, valueClass }: {
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
