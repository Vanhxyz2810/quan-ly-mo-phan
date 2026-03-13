"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Sparkles, Flower2, Flame, Package, ArrowLeft } from "lucide-react";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { useAuth } from "@/lib/auth-context";
import { serviceOrderApi, type ServiceOrderDto } from "@/lib/api";

const SERVICE_ICON: Record<string, typeof Sparkles> = {
  care: Sparkles,
  flower: Flower2,
  incense: Flame,
};

const SERVICE_LABEL: Record<string, string> = {
  care: "Chăm sóc mộ phần",
  flower: "Đặt hoa tươi",
  incense: "Dâng hương thay",
};

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xử lý",  color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành",  color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy",      color: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnUrl=/orders");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Fetch all service orders for the current customer
    serviceOrderApi.getAll()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-(--color-bg)">
      <PublicNavbar />

      <div className="flex-1 max-w-3xl mx-auto w-full py-10 px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-(--color-muted) mb-6">
          <Link href="/" className="hover:text-(--color-text)">Trang chủ</Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-(--color-text)">Tài khoản</Link>
          <span>/</span>
          <span className="text-(--color-text) font-medium">Đơn hàng</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold text-(--color-text)">Lịch sử đơn hàng</h1>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-(--color-muted) hover:text-(--color-text)"
          >
            <ArrowLeft size={14} />
            Tài khoản
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-(--color-muted) mb-4" />
            <h2 className="font-heading text-xl font-bold text-(--color-text) mb-2">Chưa có đơn hàng</h2>
            <p className="text-sm text-(--color-muted) mb-6">
              Bạn chưa đặt dịch vụ nào. Hãy tìm mộ phần và đặt dịch vụ chăm sóc.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90"
            >
              Tìm mộ phần
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const Icon = SERVICE_ICON[order.serviceType] ?? Sparkles;
              const label = SERVICE_LABEL[order.serviceType] ?? order.serviceType;
              const statusInfo = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;

              return (
                <div
                  key={order.id}
                  className="bg-(--color-surface) rounded-xl border border-(--color-border) p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-(--color-bg) flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-(--color-primary)" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-(--color-text)">{label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-(--color-muted)">
                      <span>Mộ {order.plotId}</span>
                      <span>Ngày: {order.scheduledDate}</span>
                      {order.note && <span className="truncate max-w-[200px]">{order.note}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-(--color-text)">
                      {order.price.toLocaleString("vi-VN")} ₫
                    </p>
                    <p className="text-xs text-(--color-muted)">
                      <Clock size={10} className="inline mr-1" />
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
