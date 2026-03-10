"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Heart, QrCode, Phone } from "lucide-react";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { plotsApi, type PlotDto } from "@/lib/api";

export default function MemorialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plot, setPlot] = useState<PlotDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    plotsApi.getById(id)
      .then(data => {
        if (!data || data.status.toLowerCase() !== "occupied") setNotFound(true);
        else setPlot(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (notFound || !plot) return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-5xl">🪦</div>
        <h1 className="font-heading text-2xl font-bold text-(--color-text)">Không tìm thấy mộ phần</h1>
        <p className="text-(--color-muted)">Mã mộ <strong>{id}</strong> không tồn tại hoặc chưa có thông tin.</p>
        <Link href="/search" className="px-6 py-2.5 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90">
          Quay lại tìm kiếm
        </Link>
      </div>
    </div>
  );

  const deceased = plot.data?.deceased;
  const nok = plot.data?.nextOfKin;
  const maintenance = plot.data?.maintenance;

  return (
    <div className="flex flex-col min-h-screen bg-(--color-bg)">
      <PublicNavbar />

      {/* Header */}
      <div className="bg-(--color-primary) py-10 px-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-(--color-sidebar-muted) text-sm mb-3">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-white">Tìm kiếm</Link>
            <span>/</span>
            <span className="text-white">{plot.id}</span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-white mb-2">{deceased?.name ?? plot.id}</h1>
          <div className="flex items-center gap-4 text-(--color-sidebar-muted) text-sm">
            {deceased && <span>{deceased.birthDate} — {deceased.deathDate}</span>}
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-(--color-secondary)" />
              Khu {plot.zone}, Hàng {plot.row + 1}, Số {plot.col + 1}
            </div>
          </div>
          {deceased?.quote && (
            <p className="mt-4 text-(--color-sidebar-muted) italic text-base max-w-2xl">&ldquo;{deceased.quote}&rdquo;</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full py-10 px-10 flex gap-8">
        {/* Left */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Family message section */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6">
            <h2 className="font-heading text-lg font-bold text-(--color-text) mb-4 flex items-center gap-2">
              <Heart size={18} className="text-red-400" />
              Lời tưởng nhớ
            </h2>
            {nok && (
              <div className="flex items-start gap-3 pb-4 border-b border-(--color-border) mb-4">
                <div className="w-9 h-9 rounded-full bg-(--color-primary)/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-(--color-primary)">{nok.name[0]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-(--color-text)">{nok.name}</span>
                    <span className="text-xs text-(--color-muted)">{nok.relationship}</span>
                  </div>
                  <p className="text-sm text-(--color-muted) italic">
                    Mãi nhớ về người thân yêu của chúng tôi.
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Viết lời tưởng nhớ..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none"
              />
              <button className="px-4 py-2 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90">
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-[280px] flex flex-col gap-4 shrink-0">
          {/* Services */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-(--color-text) text-sm">Dịch vụ chăm sóc</h3>
            <Link
              href={`/payment?plotId=${plot.id}`}
              className="flex items-center justify-center h-10 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90"
            >
              Đặt dịch vụ chăm sóc
            </Link>
            <button className="flex items-center justify-center h-10 rounded-lg border border-(--color-border) text-(--color-text) text-sm font-medium hover:bg-(--color-bg)">
              🌸 Đặt hoa tươi
            </button>
            <button className="flex items-center justify-center h-10 rounded-lg bg-(--color-secondary)/10 text-(--color-secondary) text-sm font-semibold hover:bg-(--color-secondary)/20">
              🪔 Dâng hương thay
            </button>
          </div>

          {/* Plot info */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-(--color-text) text-sm">Thông tin mộ phần</h3>
            {[
              ["Mã mộ", plot.id],
              ["Vị trí", `Khu ${plot.zone}, Hàng ${plot.row + 1}, Số ${plot.col + 1}`],
              ["Gói duy tu", maintenance?.package ?? "Chưa đăng ký"],
              ["Hạn đến", maintenance?.expiryDate ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-(--color-muted)">{k}</span>
                <span className="font-medium text-(--color-text)">{v}</span>
              </div>
            ))}

            {nok?.phone && (
              <div className="flex items-center gap-2 pt-2 border-t border-(--color-border)">
                <Phone size={14} className="text-(--color-muted)" />
                <span className="text-sm text-(--color-muted)">{nok.phone}</span>
              </div>
            )}
          </div>

          {/* Pay CTA */}
          {maintenance?.status?.toLowerCase() !== "active" && (
            <Link
              href={`/payment?plotId=${plot.id}`}
              className="flex items-center justify-center h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:opacity-90"
            >
              Thanh toán phí duy tu
            </Link>
          )}

          {/* QR */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-5 flex flex-col items-center gap-3">
            <QrCode size={48} className="text-(--color-muted)" />
            <span className="text-xs font-mono text-(--color-muted)">{plot.id}</span>
            <span className="text-xs text-(--color-muted) text-center">Quét QR để xem trang này</span>
          </div>
        </div>
      </div>
    </div>
  );
}
