"use client";

import { useEffect, useState, useRef } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { serviceOrderApi, type ServiceOrderDto } from "@/lib/api";
import { ClipboardList, ChevronDown } from "lucide-react";

const SERVICE_LABELS: Record<string, string> = {
  care: "Chăm sóc mộ",
  flower: "Hoa tươi",
  incense: "Dâng hương",
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Chờ xử lý", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
};

const STAT_CARDS = [
  { key: "total",     label: "Tổng đơn",      color: "text-(--color-primary)", bg: "bg-(--color-primary)/10" },
  { key: "pending",   label: "Chờ xử lý",     color: "text-amber-600",        bg: "bg-amber-50" },
  { key: "confirmed", label: "Đã xác nhận",    color: "text-blue-600",         bg: "bg-blue-50" },
  { key: "completed", label: "Hoàn thành",     color: "text-green-600",        bg: "bg-green-50" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function StatusDropdown({ order, onUpdate }: { order: ServiceOrderDto; onUpdate: (id: number, status: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const transitions: Record<string, string[]> = {
    pending:   ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };
  const options = transitions[order.status] ?? [];
  if (options.length === 0) return <span className="text-xs text-(--color-muted)">—</span>;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 h-8 rounded-lg bg-(--color-primary)/10 text-(--color-primary) text-xs font-semibold hover:bg-(--color-primary)/20 transition-colors"
      >
        Cập nhật <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 bg-(--color-surface) border border-(--color-border) rounded-lg shadow-lg py-1 min-w-[140px]">
          {options.map(s => (
            <button
              key={s}
              onClick={() => { onUpdate(order.id, s); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-(--color-bg) transition-colors flex items-center gap-2"
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ServiceOrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await serviceOrderApi.getAll();
      setOrders(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleUpdateStatus(id: number, status: string) {
    try {
      await serviceOrderApi.updateStatus(id, status);
      showToast("Cập nhật trạng thái thành công!");
      await loadData();
    } catch {
      showToast("Cập nhật thất bại, vui lòng thử lại.");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!o.plotId.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  return (
    <>
      <AdminNavbar title="Đơn dịch vụ" subtitle="Quản lý" />
      <div className="flex-1 overflow-auto p-8">

        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-(--color-primary) text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
            {toast}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          {STAT_CARDS.map(s => (
            <div key={s.key} className="flex-1 bg-(--color-surface) rounded-lg border border-(--color-border) p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <ClipboardList size={20} className={s.color} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>
                  {loading ? "..." : stats[s.key as keyof typeof stats]}
                </div>
                <div className="text-xs text-(--color-muted)">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            {[["all", "Tất cả"], ["pending", "Chờ xử lý"], ["confirmed", "Đã xác nhận"], ["completed", "Hoàn thành"], ["cancelled", "Đã hủy"]].map(([v, label]) => (
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
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Tìm mã mộ hoặc tên khách..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 px-3 rounded-lg border border-(--color-border) text-sm bg-(--color-surface) w-64 focus:outline-none focus:border-(--color-primary)"
          />
        </div>

        {/* Table */}
        <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-[50px_90px_1fr_130px_110px_100px_100px_100px] gap-2 px-4 py-2.5 bg-(--color-bg) border-b border-(--color-border) text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
            <span>#</span>
            <span>Mã mộ</span>
            <span>Khách hàng</span>
            <span>Loại dịch vụ</span>
            <span>Ngày hẹn</span>
            <span>Giá</span>
            <span>Trạng thái</span>
            <span>Hành động</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-(--color-muted)">
              <div className="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Đang tải...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-(--color-muted)">Không có đơn dịch vụ nào</div>
          ) : (
            filtered.map(order => (
              <div key={order.id} className="grid grid-cols-[50px_90px_1fr_130px_110px_100px_100px_100px] gap-2 px-4 py-3 border-b border-(--color-border) items-center text-sm">
                <span className="text-(--color-muted) text-xs">{order.id}</span>
                <span className="font-mono text-xs font-semibold text-(--color-primary)">{order.plotId}</span>
                <span className="font-medium text-(--color-text) truncate">{order.customerName}</span>
                <span className="text-(--color-muted)">{SERVICE_LABELS[order.serviceType] ?? order.serviceType}</span>
                <span className="text-(--color-muted)">{order.scheduledDate}</span>
                <span className="text-(--color-text) font-medium">{order.price.toLocaleString("vi-VN")} ₫</span>
                <StatusBadge status={order.status} />
                <StatusDropdown order={order} onUpdate={handleUpdateStatus} />
              </div>
            ))
          )}
        </div>

        {/* Footer count */}
        {!loading && (
          <div className="mt-3 text-xs text-(--color-muted)">
            Hiển thị {filtered.length} / {orders.length} đơn
          </div>
        )}
      </div>
    </>
  );
}
