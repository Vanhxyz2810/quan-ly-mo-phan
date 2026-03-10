"use client";

import { useEffect, useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { maintenanceApi, plotsApi, renewalApi, type MaintenanceDto, type PlotDto } from "@/lib/api";
import { DollarSign, RefreshCw, X } from "lucide-react";

const PACKAGES = [
  { key: "1 năm", label: "1 năm", price: 1_500_000, years: 1 },
  { key: "5 năm", label: "5 năm", price: 6_000_000, years: 5 },
  { key: "Trọn đời", label: "Trọn đời", price: 20_000_000, years: 50 },
];

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    expiring: "bg-amber-100 text-amber-700",
    expired: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    active: "Còn hạn", expiring: "Sắp hết hạn", expired: "Hết hạn",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${map[s] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[s] ?? status}
    </span>
  );
}

interface EnrichedMaintenance {
  plotId: string;
  zone: string;
  row: number;
  col: number;
  deceasedName: string;
  maintenance: MaintenanceDto;
}

export default function FinancePage() {
  const [items, setItems] = useState<EnrichedMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [renewTarget, setRenewTarget] = useState<EnrichedMaintenance | null>(null);
  const [selectedPkg, setSelectedPkg] = useState("1 năm");
  const [renewing, setRenewing] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const plots = await plotsApi.getAll(undefined, "occupied");
      const enriched: EnrichedMaintenance[] = plots
        .filter(p => p.data?.maintenance)
        .map(p => ({
          plotId: p.id,
          zone: p.zone,
          row: p.row,
          col: p.col,
          deceasedName: p.data?.deceased?.name ?? "—",
          maintenance: p.data!.maintenance!,
        }))
        .sort((a, b) => a.maintenance.daysLeft - b.maintenance.daysLeft);
      setItems(enriched);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  const filtered = filter === "all"
    ? items
    : items.filter(i => i.maintenance.status.toLowerCase() === filter.toLowerCase());

  const stats = {
    active: items.filter(i => i.maintenance.status.toLowerCase() === "active").length,
    expiring: items.filter(i => i.maintenance.status.toLowerCase() === "expiring").length,
    expired: items.filter(i => i.maintenance.status.toLowerCase() === "expired").length,
  };

  async function handleRenew() {
    if (!renewTarget) return;
    setRenewing(true);
    try {
      await renewalApi.renew(renewTarget.plotId, selectedPkg);
      setRenewTarget(null);
      showToast("Gia hạn thành công!");
      await loadData();
    } catch {
      showToast("Gia hạn thất bại, vui lòng thử lại.");
    } finally {
      setRenewing(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <>
      <AdminNavbar title="Quản lý phí duy tu" subtitle="Tài chính" />
      <div className="flex-1 overflow-auto p-8">

        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-(--color-primary) text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
            {toast}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          {[
            { label: "Còn hạn", value: stats.active, color: "text-green-600", bg: "bg-green-50" },
            { label: "Sắp hết hạn", value: stats.expiring, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Đã hết hạn", value: stats.expired, color: "text-red-600", bg: "bg-red-50" },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-(--color-surface) rounded-lg border border-(--color-border) p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <DollarSign size={20} className={s.color} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{loading ? "..." : s.value}</div>
                <div className="text-xs text-(--color-muted)">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          {[["all", "Tất cả"], ["expiring", "Sắp hết hạn"], ["expired", "Hết hạn"], ["active", "Còn hạn"]].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === v
                  ? "bg-(--color-primary) text-white"
                  : "bg-(--color-bg) text-(--color-muted) hover:text-(--color-text)"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-[90px_1fr_140px_120px_110px_110px_120px] gap-2 px-4 py-2.5 bg-(--color-bg) border-b border-(--color-border) text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
            <span>Mã mộ</span>
            <span>Người mất</span>
            <span>Vị trí</span>
            <span>Gói phí</span>
            <span>Ngày hết hạn</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-(--color-muted)">
              <div className="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Đang tải...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-(--color-muted)">Không có dữ liệu</div>
          ) : (
            filtered.map(item => (
              <div key={item.plotId} className="grid grid-cols-[90px_1fr_140px_120px_110px_110px_120px] gap-2 px-4 py-3 border-b border-(--color-border) items-center text-sm">
                <span className="font-mono text-xs font-semibold text-(--color-primary)">{item.plotId}</span>
                <span className="font-medium text-(--color-text) truncate">{item.deceasedName}</span>
                <span className="text-(--color-muted)">Khu {item.zone}, H{item.row + 1} S{item.col + 1}</span>
                <span className="text-(--color-muted)">{item.maintenance.package}</span>
                <span className="text-(--color-muted)">{item.maintenance.expiryDate}</span>
                <StatusBadge status={item.maintenance.status} />
                <button
                  onClick={() => { setRenewTarget(item); setSelectedPkg("1 năm"); }}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-(--color-primary)/10 text-(--color-primary) text-xs font-semibold hover:bg-(--color-primary)/20 transition-colors"
                >
                  <RefreshCw size={12} /> Gia hạn
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Renewal Modal */}
      {renewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setRenewTarget(null)} />
          <div className="relative bg-(--color-surface) rounded-xl shadow-2xl p-6 w-[420px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-(--color-text)">Gia hạn dịch vụ</h3>
              <button onClick={() => setRenewTarget(null)}><X size={18} className="text-(--color-muted)" /></button>
            </div>
            <p className="text-sm text-(--color-muted) mb-4">
              Mộ phần <strong className="text-(--color-text)">{renewTarget.plotId}</strong> — {renewTarget.deceasedName}
            </p>
            <div className="flex flex-col gap-2 mb-5">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.key}
                  onClick={() => setSelectedPkg(pkg.key)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors ${
                    selectedPkg === pkg.key
                      ? "border-(--color-primary) bg-(--color-primary)/5"
                      : "border-(--color-border) hover:border-(--color-primary)/40"
                  }`}
                >
                  <span className="font-semibold text-(--color-text)">{pkg.label}</span>
                  <span className="text-(--color-secondary) font-bold">{pkg.price.toLocaleString("vi-VN")} ₫</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleRenew}
              disabled={renewing}
              className="w-full h-11 rounded-lg bg-(--color-primary) text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {renewing ? "Đang xử lý..." : "Xác nhận gia hạn"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
