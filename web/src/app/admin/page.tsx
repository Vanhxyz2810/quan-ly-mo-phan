"use client";

import { useEffect, useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { StatWidget } from "@/components/admin/StatWidget";
import { AlertRow } from "@/components/admin/AlertRow";
import { Layers, BarChart3, DollarSign, Wrench, Map, ClipboardList, CreditCard } from "lucide-react";
import Link from "next/link";
import { dashboardApi, plotsApi, serviceOrderApi, type DashboardStats, type ServiceOrderDto } from "@/lib/api";

const SERVICE_LABELS: Record<string, string> = {
  care: "Chăm sóc mộ",
  flower: "Hoa tươi",
  incense: "Dâng hương",
};

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Chờ xử lý", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
};

interface MaintenanceAlert {
  plotId: string;
  name: string;
  feeType: string;
  daysLeft: number;
  status: "critical" | "warning";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [recentOrders, setRecentOrders] = useState<ServiceOrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, allPlots, orders] = await Promise.all([
          dashboardApi.getStats(),
          plotsApi.getAll(),
          serviceOrderApi.getAll(),
        ]);
        setStats(statsData);
        setRecentOrders(orders.slice(0, 5));

        // Build alerts from plots that have expiring or expired maintenance
        const allAlerts: MaintenanceAlert[] = allPlots
          .filter((p) => {
            const mStatus = p.data?.maintenance?.status?.toLowerCase();
            return mStatus === "expiring" || mStatus === "expired";
          })
          .map((p) => {
            const m = p.data!.maintenance!;
            const mStatus = m.status.toLowerCase();
            return {
              plotId: p.id,
              name: p.data?.deceased?.name || "—",
              feeType: m.package,
              daysLeft: m.daysLeft,
              status: mStatus === "expired" || m.daysLeft <= 10
                ? ("critical" as const)
                : ("warning" as const),
            };
          });

        setAlerts(allAlerts.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fillRate = stats
    ? stats.totalPlots > 0
      ? ((stats.occupiedPlots / stats.totalPlots) * 100).toFixed(1)
      : "0"
    : "—";

  return (
    <>
      <AdminNavbar title="Tổng quan" subtitle="Trang chủ" />
      <div className="flex-1 overflow-auto p-8">
        {/* Stat Widgets */}
        <div className="flex gap-5 mb-8">
          <StatWidget
            icon={Layers}
            value={loading ? "..." : stats?.totalPlots.toLocaleString("vi-VN") ?? "0"}
            label="Tổng mộ phần"
            iconBg="bg-(--color-primary)/10"
            iconColor="text-(--color-primary)"
          />
          <StatWidget
            icon={BarChart3}
            value={loading ? "..." : `${fillRate}%`}
            label="Tỉ lệ lấp đầy"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatWidget
            icon={DollarSign}
            value={loading ? "..." : `${stats?.availablePlots ?? 0}`}
            label="Ô trống còn lại"
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatWidget
            icon={Wrench}
            value={loading ? "..." : `${(stats?.expiringMaintenance ?? 0) + (stats?.expiredMaintenance ?? 0)}`}
            label="Dịch vụ cần gia hạn"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          {[
            { href: "/admin/gis", icon: Map, label: "Bản đồ GIS", color: "text-(--color-primary)" },
            { href: "/admin/orders", icon: ClipboardList, label: "Đơn dịch vụ", color: "text-blue-600" },
            { href: "/admin/finance", icon: CreditCard, label: "Quản lý tài chính", color: "text-amber-600" },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-(--color-surface) border border-(--color-border) text-sm font-medium text-(--color-text) hover:border-(--color-primary)/40 transition-colors"
            >
              <a.icon size={16} className={a.color} />
              {a.label}
            </Link>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-[1fr_360px] gap-6">
          {/* Left: Alerts */}
          <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-(--color-text)">
                  Cảnh báo phí sắp hết hạn
                </h2>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {alerts.length}
                </span>
              </div>
            </div>
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-(--color-muted)">
                <div className="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Đang tải dữ liệu...
              </div>
            ) : alerts.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-(--color-muted)">
                Không có cảnh báo nào
              </div>
            ) : (
              alerts.map((row, i) => (
                <AlertRow key={i} {...row} />
              ))
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Pie Chart */}
            <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
              <h3 className="font-semibold text-(--color-text) text-sm mb-4">Phân bố mộ phần</h3>
              {stats && stats.totalPlots > 0 ? (
                <div className="flex items-center gap-4">
                  <PieChart
                    available={stats.availablePlots}
                    occupied={stats.occupiedPlots}
                    reserved={stats.totalPlots - stats.availablePlots - stats.occupiedPlots}
                  />
                  <div className="flex flex-col gap-2 text-xs">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#22C55E]" /> Trống ({stats.availablePlots})</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#EF4444]" /> Đang dùng ({stats.occupiedPlots})</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#3B82F6]" /> Đã đặt ({stats.totalPlots - stats.availablePlots - stats.occupiedPlots})</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-(--color-muted)">—</p>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
                <h3 className="font-semibold text-(--color-text) text-sm">Đơn dịch vụ gần đây</h3>
                <Link href="/admin/orders" className="text-xs text-(--color-primary) font-medium hover:underline">
                  Xem tất cả
                </Link>
              </div>
              {loading ? (
                <div className="px-4 py-6 text-center text-sm text-(--color-muted)">Đang tải...</div>
              ) : recentOrders.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-(--color-muted)">Chưa có đơn nào</div>
              ) : (
                recentOrders.map(o => {
                  const sc = ORDER_STATUS[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-600" };
                  return (
                    <div key={o.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-(--color-border) last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-(--color-text) truncate">{o.customerName}</p>
                        <p className="text-xs text-(--color-muted)">{SERVICE_LABELS[o.serviceType] ?? o.serviceType} — Mộ {o.plotId}</p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Simple SVG Pie Chart */
function PieChart({ available, occupied, reserved }: { available: number; occupied: number; reserved: number }) {
  const total = available + occupied + reserved;
  if (total === 0) return null;
  const r = 50;
  const cx = 60;
  const cy = 60;

  function arc(startAngle: number, endAngle: number): string {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const slices = [
    { value: available, color: "#22C55E" },
    { value: occupied, color: "#EF4444" },
    { value: reserved, color: "#3B82F6" },
  ].filter(s => s.value > 0);

  let currentAngle = 0;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {slices.map((s, i) => {
        const angle = (s.value / total) * 360;
        // Handle full circle case
        if (slices.length === 1) {
          return <circle key={i} cx={cx} cy={cy} r={r} fill={s.color} />;
        }
        const d = arc(currentAngle, currentAngle + angle);
        currentAngle += angle;
        return <path key={i} d={d} fill={s.color} />;
      })}
    </svg>
  );
}
