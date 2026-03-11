"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart, Phone, X, Calendar, FileText, Camera, Download, Flower2, Flame, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { useAuth } from "@/lib/auth-context";
import { plotsApi, serviceOrderApi, uploadApi, type PlotDto } from "@/lib/api";

const SERVICE_MAP: Record<string, { label: string; price: string; icon: typeof Flower2; color: string; bg: string }> = {
  care:    { label: "Chăm sóc mộ phần", price: "500.000 ₫", icon: Sparkles,  color: "text-(--color-primary)", bg: "bg-(--color-primary)" },
  flower:  { label: "Đặt hoa tươi",     price: "200.000 ₫", icon: Flower2,   color: "text-pink-600",          bg: "bg-pink-600" },
  incense: { label: "Dâng hương thay",   price: "100.000 ₫", icon: Flame,     color: "text-(--color-secondary)", bg: "bg-(--color-secondary)" },
};

export default function MemorialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [plot, setPlot] = useState<PlotDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Service modal
  const [serviceModal, setServiceModal] = useState<string | null>(null); // "care" | "flower" | "incense" | null
  const [serviceDate, setServiceDate] = useState("");
  const [serviceNote, setServiceNote] = useState("");
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceSuccess, setServiceSuccess] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Photo upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    plotsApi.getById(id)
      .then(data => {
        if (!data || data.status.toLowerCase() !== "occupied") setNotFound(true);
        else setPlot(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleServiceSubmit = useCallback(async () => {
    if (!serviceModal || !serviceDate) return;
    setServiceSubmitting(true);
    setServiceError(null);
    try {
      await serviceOrderApi.create({
        plotId: id,
        serviceType: serviceModal,
        scheduledDate: serviceDate,
        note: serviceNote || undefined,
      });
      setServiceSuccess(true);
    } catch (e: unknown) {
      setServiceError(e instanceof Error ? e.message : "Đặt dịch vụ thất bại");
    } finally {
      setServiceSubmitting(false);
    }
  }, [serviceModal, serviceDate, serviceNote, id]);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.uploadPhoto(id, file);
      setPlot(prev => {
        if (!prev?.data?.deceased) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            deceased: { ...prev.data.deceased, photoUrl: url },
          },
        };
      });
    } catch {
      alert("Upload ảnh thất bại, vui lòng thử lại.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [id]);

  const downloadQr = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `qr-${id}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(decodeURIComponent(encodeURIComponent(svgData)));
  }, [id]);

  const closeModal = () => {
    setServiceModal(null);
    setServiceDate("");
    setServiceNote("");
    setServiceSuccess(false);
    setServiceError(null);
  };

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
  const memorialUrl = typeof window !== "undefined" ? `${window.location.origin}/memorial/${plot.id}` : `/memorial/${plot.id}`;

  return (
    <div className="flex flex-col min-h-screen bg-(--color-bg)">
      <PublicNavbar />

      {/* Header */}
      <div className="bg-(--color-primary) py-10 px-10">
        <div className="max-w-5xl mx-auto flex items-start gap-6">
          {/* Photo */}
          <div className="relative shrink-0">
            {deceased?.photoUrl ? (
              <Image
                src={deceased.photoUrl}
                alt={deceased.name}
                width={100}
                height={100}
                className="w-[100px] h-[100px] rounded-full object-cover border-3 border-white/30"
              />
            ) : (
              <div className="w-[100px] h-[100px] rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                <span className="text-3xl text-white/60 font-heading font-bold">
                  {deceased?.name?.[0] ?? "?"}
                </span>
              </div>
            )}
            {user && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-50 cursor-pointer"
                  title="Tải ảnh lên"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={14} className="text-(--color-primary)" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
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
              <button className="px-4 py-2 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 cursor-pointer">
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
            {(["care", "flower", "incense"] as const).map(type => {
              const svc = SERVICE_MAP[type];
              const Icon = svc.icon;
              return (
                <button
                  key={type}
                  onClick={() => setServiceModal(type)}
                  className={`flex items-center gap-2 justify-center h-10 rounded-lg border border-(--color-border) text-sm font-medium hover:bg-(--color-bg) cursor-pointer transition-colors ${svc.color}`}
                >
                  <Icon size={16} />
                  {svc.label}
                </button>
              );
            })}
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

          {/* QR Code */}
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-5 flex flex-col items-center gap-3">
            <div ref={qrRef}>
              <QRCodeSVG
                value={memorialUrl}
                size={140}
                bgColor="#ffffff"
                fgColor="#1A3C34"
                level="Q"
                includeMargin={false}
              />
            </div>
            <span className="text-xs font-mono text-(--color-muted)">{plot.id}</span>
            <span className="text-xs text-(--color-muted) text-center">Quét QR để xem trang tưởng nhớ</span>
            <button
              onClick={downloadQr}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--color-border) text-xs text-(--color-text) font-medium hover:bg-(--color-bg) cursor-pointer"
            >
              <Download size={12} />
              Tải QR
            </button>
          </div>
        </div>
      </div>

      {/* Service Order Modal */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {serviceSuccess ? (
              /* Success state */
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold text-(--color-text) mb-2">Đặt dịch vụ thành công!</h3>
                <p className="text-sm text-(--color-muted) mb-6">
                  Đơn {SERVICE_MAP[serviceModal].label.toLowerCase()} đã được ghi nhận. Chúng tôi sẽ thực hiện đúng ngày bạn chọn.
                </p>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            ) : (
              /* Form state */
              <>
                {/* Modal header */}
                <div className={`${SERVICE_MAP[serviceModal].bg} px-6 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-2 text-white">
                    {(() => { const Icon = SERVICE_MAP[serviceModal].icon; return <Icon size={20} />; })()}
                    <h3 className="font-heading text-lg font-bold">{SERVICE_MAP[serviceModal].label}</h3>
                  </div>
                  <button onClick={closeModal} className="text-white/70 hover:text-white cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-5">
                  {/* Plot info summary */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-(--color-bg)">
                    <MapPin size={16} className="text-(--color-primary) shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-(--color-text)">{deceased?.name ?? plot.id}</p>
                      <p className="text-xs text-(--color-muted)">Khu {plot.zone}, Hàng {plot.row + 1}, Số {plot.col + 1}</p>
                    </div>
                    <span className="ml-auto text-sm font-bold text-(--color-secondary)">{SERVICE_MAP[serviceModal].price}</span>
                  </div>

                  {/* Date picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-(--color-text) flex items-center gap-1.5">
                      <Calendar size={14} className="text-(--color-muted)" />
                      Ngày thực hiện *
                    </label>
                    <input
                      type="date"
                      value={serviceDate}
                      onChange={e => setServiceDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:border-(--color-primary)"
                    />
                  </div>

                  {/* Note */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-(--color-text) flex items-center gap-1.5">
                      <FileText size={14} className="text-(--color-muted)" />
                      Ghi chú
                    </label>
                    <textarea
                      value={serviceNote}
                      onChange={e => setServiceNote(e.target.value)}
                      placeholder={serviceModal === "flower" ? "Hoa cúc trắng, hoa ly..." : serviceModal === "incense" ? "Hương trầm, nến..." : "Yêu cầu đặc biệt..."}
                      rows={3}
                      className="px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:border-(--color-primary) resize-none"
                    />
                  </div>

                  {serviceError && (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{serviceError}</p>
                  )}

                  {/* Submit */}
                  <button
                    disabled={!serviceDate || serviceSubmitting}
                    onClick={handleServiceSubmit}
                    className={`w-full py-2.5 rounded-lg text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 cursor-pointer ${SERVICE_MAP[serviceModal].bg}`}
                  >
                    {serviceSubmitting ? "Đang xử lý..." : `Xác nhận — ${SERVICE_MAP[serviceModal].price}`}
                  </button>

                  {!user && (
                    <p className="text-xs text-(--color-muted) text-center">
                      Bạn cần{" "}
                      <Link href={`/login?returnUrl=/memorial/${id}`} className="text-(--color-primary) font-medium underline">
                        đăng nhập
                      </Link>{" "}
                      để đặt dịch vụ.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
