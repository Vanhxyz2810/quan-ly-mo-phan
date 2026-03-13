"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronRight, AlertTriangle, ShoppingBag, MapPin } from "lucide-react";
import Link from "next/link";
import { plotsApi, serviceOrderApi, type PlotDto, type ServiceOrderDto } from "@/lib/api";

interface AdminNavbarProps {
  title: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  icon: typeof AlertTriangle;
  iconCls: string;
  title: string;
  description: string;
  link: string;
}

function buildNotifications(plots: PlotDto[], orders: ServiceOrderDto[]): Notification[] {
  const notifs: Notification[] = [];

  // Pending service orders
  orders
    .filter(o => o.status === "pending")
    .slice(0, 5)
    .forEach(o => {
      notifs.push({
        id: `order-${o.id}`,
        icon: ShoppingBag,
        iconCls: "text-blue-600 bg-blue-50",
        title: "Đơn dịch vụ mới",
        description: `${o.customerName} — Mộ ${o.plotId}`,
        link: "/admin/orders",
      });
    });

  // Expiring / expired maintenance
  plots
    .filter(p => {
      const s = p.data?.maintenance?.status?.toLowerCase();
      return s === "expiring" || s === "expired";
    })
    .slice(0, 5)
    .forEach(p => {
      const s = p.data!.maintenance!.status.toLowerCase();
      const isExpired = s === "expired";
      notifs.push({
        id: `maint-${p.id}`,
        icon: AlertTriangle,
        iconCls: isExpired ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50",
        title: isExpired ? "Phí đã hết hạn" : "Phí sắp hết hạn",
        description: `${p.data?.deceased?.name ?? p.id} — ${p.data!.maintenance!.daysLeft} ngày`,
        link: "/admin/finance",
      });
    });

  // Reserved plots (recent)
  plots
    .filter(p => p.status === "reserved")
    .slice(0, 3)
    .forEach(p => {
      notifs.push({
        id: `reserve-${p.id}`,
        icon: MapPin,
        iconCls: "text-green-600 bg-green-50",
        title: "Đặt mộ phần mới",
        description: `Mộ ${p.id} — Khu ${p.zone}`,
        link: "/admin/crm",
      });
    });

  return notifs;
}

function formatToday() {
  const d = new Date();
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

export function AdminNavbar({ title, subtitle }: AdminNavbarProps) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadNotifications() {
    if (loaded) return;
    try {
      const [plots, orders] = await Promise.all([
        plotsApi.getAll(),
        serviceOrderApi.getAll(),
      ]);
      setNotifs(buildNotifications(plots, orders));
      setLoaded(true);
    } catch { /* ignore */ }
  }

  function handleToggle() {
    setOpen(prev => !prev);
    loadNotifications();
  }

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
          {formatToday()}
        </span>

        {/* Bell + Dropdown */}
        <div ref={ref} className="relative">
          <button
            onClick={handleToggle}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-(--color-bg) text-(--color-muted) transition-colors"
          >
            <Bell size={18} />
            {(!loaded || notifs.length > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 z-50 w-80 bg-(--color-surface) border border-(--color-border) rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--color-border) flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-(--color-text)">Thông báo</span>
                {notifs.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {notifs.length}
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="py-8 text-center text-sm text-(--color-muted)">
                    Không có thông báo mới
                  </div>
                ) : (
                  notifs.map(n => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-(--color-bg) transition-colors border-b border-(--color-border) last:border-b-0"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.iconCls}`}>
                        <n.icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-(--color-text)">{n.title}</p>
                        <p className="text-xs text-(--color-muted) truncate">{n.description}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-9 h-9 rounded-full bg-(--color-secondary) flex items-center justify-center">
          <span className="text-white text-xs font-bold">AD</span>
        </div>
      </div>
    </header>
  );
}
