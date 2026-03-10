"use client";

import { useEffect, useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { StatWidget } from "@/components/admin/StatWidget";
import { AlertRow } from "@/components/admin/AlertRow";
import { Layers, BarChart3, DollarSign, Wrench } from "lucide-react";
import { dashboardApi, plotsApi, type DashboardStats } from "@/lib/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, allPlots] = await Promise.all([
          dashboardApi.getStats(),
          plotsApi.getAll(),
        ]);
        setStats(statsData);

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

        {/* Alert Section */}
        <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-(--color-text)">
                Cảnh báo phí sắp hết hạn (trong 30 ngày)
              </h2>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {alerts.length}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-(--color-muted)">
              <span>Mã mộ</span>
              <span>Họ tên người mất</span>
              <span>Loại phí</span>
              <span>Ngày còn lại</span>
              <span>Trạng thái</span>
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
      </div>
    </>
  );
}
