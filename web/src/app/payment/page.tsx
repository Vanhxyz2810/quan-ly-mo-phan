"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { Badge } from "@/components/ui/Badge";
import { CreditCard, Lock, Copy, Eye, Home, MapPin, Package } from "lucide-react";
import { plotsApi, paymentApi, type PlotDto } from "@/lib/api";

type Tab = "vnpay" | "momo" | "visa";

function PaymentContent() {
  const searchParams = useSearchParams();
  const plotId = searchParams.get("plotId");

  const [plot, setPlot] = useState<PlotDto | null>(null);
  const [loadingPlot, setLoadingPlot] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("vnpay");
  const [paid, setPaid] = useState(false);

  // VNPay redirect state
  const [redirecting, setRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // MoMo redirect state
  const [momoRedirecting, setMomoRedirecting] = useState(false);
  const [momoRedirectError, setMomoRedirectError] = useState<string | null>(null);

  // Visa form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!plotId) return;
    setLoadingPlot(true);
    plotsApi
      .getById(plotId)
      .then(setPlot)
      .catch(() => setPlot(null))
      .finally(() => setLoadingPlot(false));
  }, [plotId]);

  const deceasedName = plot?.data?.deceased?.name ?? "—";
  const location = plot
    ? `Khu ${plot.zone}, Hàng ${plot.row + 1}, Số ${plot.col + 1}`
    : "—";
  const pkg = plot?.data?.maintenance?.package ?? "Gói dịch vụ";
  const price = plot?.data?.maintenance?.price
    ? plot.data.maintenance.price.toLocaleString("vi-VN")
    : "1.500.000";
  const total = `${price} ₫`;
  const invoiceId = plot ? `#INV-${plot.id}` : "#INV-2025-0001";
  const transferContent = plot
    ? `${plot.id} ${(deceasedName.split(" ").pop() ?? "KH").toUpperCase()}`
    : "THANHTOAN";

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  function handleConfirm() {
    setPaying(true);
    setTimeout(() => { setPaying(false); setPaid(true); }, 1800);
  }

  async function handleMoMoRedirect() {
    if (!plotId) return;
    setMomoRedirecting(true);
    setMomoRedirectError(null);
    try {
      const amount = plot?.data?.maintenance?.price ?? 1500000;
      const orderInfo = `Thanh toan mo phan ${plotId}`;
      const { payUrl } = await paymentApi.createMoMo(plotId, amount, orderInfo);
      sessionStorage.setItem("momo_pending_plotId", plotId);
      window.location.href = payUrl;
    } catch {
      setMomoRedirectError("Không thể kết nối MoMo, vui lòng thử lại.");
      setMomoRedirecting(false);
    }
  }

  async function handleVNPayRedirect() {
    if (!plotId) return;
    setRedirecting(true);
    setRedirectError(null);
    try {
      const amount = plot?.data?.maintenance?.price ?? 1500000;
      const orderInfo = `Thanh toan mo phan ${plotId}`;
      const { payUrl } = await paymentApi.createVNPay(plotId, amount, orderInfo);
      // Lưu plotId để dùng khi VNPay redirect về /payment/result
      sessionStorage.setItem("vnpay_pending_plotId", plotId);
      window.location.href = payUrl;
    } catch {
      setRedirectError("Không thể kết nối VNPay, vui lòng thử lại.");
      setRedirecting(false);
    }
  }

  // ── Success screen ──
  if (paid) {
    return (
      <div className="flex flex-col min-h-screen bg-(--color-bg)">
        <style>{`
          @keyframes ping-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.4);opacity:0} }
          @keyframes check-pop { 0%{transform:scale(.3) rotate(-10deg);opacity:0} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          @keyframes fade-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
          @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.45} }
          .ping-ring{animation:ping-ring 1.8s ease-out infinite}
          .ping-ring-2{animation:ping-ring 1.8s .5s ease-out infinite}
          .check-pop{animation:check-pop .55s cubic-bezier(.34,1.56,.64,1) forwards}
          .fade-up-0{animation:fade-up .5s ease-out both}
          .fade-up-1{animation:fade-up .5s .12s ease-out both}
          .fade-up-2{animation:fade-up .5s .25s ease-out both}
          .fade-up-3{animation:fade-up .5s .38s ease-out both}
          .fade-up-4{animation:fade-up .5s .5s ease-out both}
          .shimmer{animation:shimmer 2.2s ease-in-out infinite}
        `}</style>

        <PublicNavbar />

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md flex flex-col gap-5">

            {/* Animated icon */}
            <div className="flex flex-col items-center gap-3 fade-up-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-green-400/25 ping-ring" />
                <div className="absolute inset-0 rounded-full bg-green-400/15 ping-ring-2" />
                <div className="relative w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                  <svg className="w-12 h-12 text-white check-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-yellow-500 shimmer" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Đặt mộ thành công</span>
                <svg className="w-3.5 h-3.5 text-yellow-500 shimmer" style={{animationDelay:".6s"}} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center fade-up-1">
              <h1 className="font-heading text-3xl font-bold text-(--color-text)">Thanh toán thành công!</h1>
              <p className="text-(--color-muted) text-sm mt-1.5">Cảm ơn bạn đã tin tưởng dịch vụ An Nghỉ Viên.</p>
            </div>

            {/* Receipt card */}
            <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden shadow-sm fade-up-2">
              {/* Header */}
              <div className="bg-(--color-primary) px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase">Hóa đơn điện tử</p>
                  <p className="text-white font-bold text-lg mt-0.5">An Nghỉ Viên</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">Mã HĐ</p>
                  <p className="text-(--color-secondary) font-mono font-bold text-sm">{invoiceId}</p>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-gray-200" />

              {/* Plot summary */}
              <div className="px-6 pt-5 pb-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-(--color-muted) font-bold uppercase tracking-wider flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      Người mất
                    </span>
                    <span className="font-semibold text-(--color-text) text-sm">{deceasedName}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-(--color-muted) font-bold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Vị trí mộ
                    </span>
                    <span className="font-semibold text-(--color-text) text-sm">{location}</span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[10px] text-(--color-muted) font-bold uppercase tracking-wider flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Gói dịch vụ
                    </span>
                    <span className="font-semibold text-(--color-text) text-sm">{pkg}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200" />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-(--color-text)">Tổng thanh toán</span>
                  <span className="font-bold text-xl text-(--color-secondary)">{total}</span>
                </div>

                <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-(--color-muted)">Trạng thái</span>
                  <span className="text-sm font-bold text-green-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    Đã thanh toán
                  </span>
                </div>
              </div>

              <div className="relative border-t-2 border-dashed border-gray-200">
                <div className="absolute -top-3 left-5 bg-white px-1">
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"/></svg>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-gray-50 text-center">
                <p className="text-xs text-(--color-muted)">Hotline hỗ trợ: <span className="font-semibold text-(--color-primary)">1800-0000</span></p>
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-white rounded-2xl border border-(--color-border) p-5 fade-up-3">
              <p className="text-sm font-bold text-(--color-text) mb-3">Bước tiếp theo</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Hồ sơ đã xác nhận và lưu vào hệ thống", done: true },
                  { label: "Email xác nhận sẽ được gửi trong vòng 24 giờ", done: false },
                  { label: "Nhân viên sẽ liên hệ để hướng dẫn bàn giao", done: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${s.done ? "bg-green-500 text-white" : "bg-gray-100 text-(--color-muted)"}`}>
                      {s.done ? "✓" : i + 1}
                    </div>
                    <span className={s.done ? "text-(--color-text)" : "text-(--color-muted)"}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 fade-up-4">
              {plot && (
                <Link
                  href={`/memorial/${plot.id}`}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Eye size={16} />
                  Xem trang tưởng niệm
                </Link>
              )}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 h-12 rounded-xl border border-(--color-border) text-(--color-text) text-sm font-medium hover:bg-(--color-bg) transition-colors"
              >
                <Home size={16} />
                Về trang chủ
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "vnpay", label: "VNPay", icon: <Image src="/images/vnpay.png" alt="VNPay" width={18} height={18} className="rounded object-contain" /> },
    { id: "momo", label: "MoMo", icon: <Image src="/images/momo.png" alt="MoMo" width={18} height={18} className="rounded object-contain" /> },
    { id: "visa", label: "Visa / Thẻ", icon: <CreditCard size={15} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <PublicNavbar />

      {/* Hero */}
      <div className="bg-(--color-primary) px-14 py-8 shrink-0">
        <span className="text-(--color-secondary) text-xs font-semibold tracking-widest">✦ THANH TOÁN</span>
        <h1 className="font-heading text-3xl font-bold text-white mt-1">Hóa đơn dịch vụ</h1>
        {plotId && <p className="text-white/60 text-sm mt-0.5">Mã mộ: <span className="font-mono text-white/90">{plotId}</span></p>}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Invoice */}
        <div className="flex-1 overflow-auto px-10 py-8 flex flex-col gap-6 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-(--color-text)">Chi tiết hóa đơn</h2>
            <Badge variant="warning">Chờ thanh toán</Badge>
          </div>

          <div className="rounded-xl bg-(--color-bg) border border-(--color-border) p-6 flex flex-col gap-4">
            {loadingPlot ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-(--color-muted)">Mã hóa đơn</span>
                    <span className="font-semibold text-(--color-text)">{invoiceId}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-(--color-muted)">Ngày lập</span>
                    <span className="font-semibold text-(--color-text)">{new Date().toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="h-px bg-(--color-border)" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Người mất", deceasedName],
                    ["Vị trí mộ", location],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-0.5">
                      <span className="text-(--color-muted) text-xs">{k}</span>
                      <span className="font-semibold text-(--color-text)">{v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Line items */}
          <div className="rounded-xl border border-(--color-border) overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] bg-(--color-bg) px-5 py-3 text-xs font-bold text-(--color-muted) tracking-wider">
              <span>DỊCH VỤ</span>
              <span>THÀNH TIỀN</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] px-5 py-4 border-t border-(--color-border) text-sm">
              <span className="text-(--color-text)">{pkg}</span>
              <span className="font-semibold text-(--color-text)">{total}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] px-5 py-4 border-t border-(--color-primary)/20 bg-(--color-primary)/5">
              <span className="font-bold text-(--color-text)">Tổng cộng</span>
              <span className="font-bold text-xl text-(--color-secondary)">{total}</span>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
            <span className="font-semibold">Lưu ý:</span> Vui lòng hoàn tất thanh toán để xác nhận đặt mộ. Liên hệ hotline <span className="font-semibold">1800-0000</span> nếu cần hỗ trợ.
          </div>
        </div>

        {/* Right: Payment panel */}
        <aside className="w-[460px] shrink-0 bg-(--color-bg) flex flex-col border-l border-(--color-border) overflow-auto">
          <div className="px-6 py-5 border-b border-(--color-border) bg-white">
            <h2 className="font-heading text-lg font-bold text-(--color-text)">Phương thức thanh toán</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-3 bg-white border-b border-(--color-border)">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? tab.id === "vnpay"
                      ? "bg-blue-600 text-white shadow-sm"
                      : tab.id === "momo"
                      ? "bg-[#A50064] text-white shadow-sm"
                      : "bg-(--color-primary) text-white shadow-sm"
                    : "text-(--color-muted) hover:bg-(--color-bg)"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── VNPay Tab ── */}
          {activeTab === "vnpay" && (
            <div className="flex-1 flex flex-col items-center gap-5 px-6 py-6">
              {/* VNPay branding */}
              <div className="flex items-center gap-2">
                <Image src="/images/vnpay.png" alt="VNPay" width={36} height={36} className="rounded-lg object-contain" />
                <span className="font-bold text-blue-700 text-lg">VNPay</span>
              </div>

              <p className="text-sm text-(--color-muted) text-center">
                Mở ứng dụng ngân hàng hoặc VNPay và quét mã QR
              </p>

              {/* Thông tin hóa đơn */}
              <div className="w-full rounded-xl bg-white border border-(--color-border) p-4 flex flex-col gap-2 text-sm">
                {[
                  ["Mã hóa đơn", invoiceId],
                  ["Số tiền", total],
                  ["Nội dung TT", transferContent],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-(--color-muted)">{k}</span>
                    <span className="font-semibold text-(--color-text)">{v}</span>
                  </div>
                ))}
              </div>

              {redirectError && (
                <p className="text-sm text-red-500 text-center">{redirectError}</p>
              )}

              <button
                onClick={handleVNPayRedirect}
                disabled={redirecting || !plotId}
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {redirecting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang chuyển đến VNPay...</>
                ) : (
                  <>
                    <Image src="/images/vnpay.png" alt="VNPay" width={20} height={20} className="rounded object-contain shrink-0" />
                    Thanh toán qua VNPay
                  </>
                )}
              </button>

              <p className="text-[11px] text-(--color-muted) text-center">
                Bạn sẽ được chuyển sang cổng thanh toán VNPay (sandbox). Sau khi hoàn tất sẽ tự quay về.
              </p>
            </div>
          )}

          {/* ── MoMo Tab ── */}
          {activeTab === "momo" && (
            <div className="flex-1 flex flex-col items-center gap-5 px-6 py-6">
              {/* MoMo branding */}
              <div className="flex items-center gap-2">
                <Image src="/images/momo.png" alt="MoMo" width={36} height={36} className="rounded-full object-contain" />
                <span className="font-bold text-[#A50064] text-lg">MoMo</span>
              </div>

              <p className="text-sm text-(--color-muted) text-center">
                Thanh toán an toàn qua cổng MoMo. Hỗ trợ ví MoMo và các ngân hàng liên kết.
              </p>

              {/* Thông tin hóa đơn */}
              <div className="w-full rounded-xl bg-white border border-(--color-border) p-4 flex flex-col gap-2 text-sm">
                {[
                  ["Mã hóa đơn", invoiceId],
                  ["Số tiền", total],
                  ["Nội dung TT", transferContent],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-(--color-muted)">{k}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-(--color-text)">{v}</span>
                      {k === "Nội dung TT" && (
                        <button
                          onClick={() => navigator.clipboard?.writeText(v)}
                          className="text-(--color-muted) hover:text-[#A50064] cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {momoRedirectError && (
                <p className="text-sm text-red-500 text-center">{momoRedirectError}</p>
              )}

              <button
                onClick={handleMoMoRedirect}
                disabled={momoRedirecting || !plotId}
                className="w-full h-12 rounded-xl bg-[#A50064] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#8a0054] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {momoRedirecting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang chuyển đến MoMo...</>
                ) : (
                  <>
                    <Image src="/images/momo.png" alt="MoMo" width={20} height={20} className="rounded object-contain shrink-0" />
                    Thanh toán qua MoMo
                  </>
                )}
              </button>

              <p className="text-[11px] text-(--color-muted) text-center">
                Bạn sẽ được chuyển sang cổng thanh toán MoMo (sandbox). Sau khi hoàn tất sẽ tự quay về.
              </p>
            </div>
          )}

          {/* ── Visa / Card Tab ── */}
          {activeTab === "visa" && (
            <div className="flex-1 flex flex-col gap-5 px-6 py-6">
              {/* Card visual */}
              <div className="w-full h-[160px] rounded-2xl bg-linear-to-br from-(--color-primary) to-[#2D6A5A] p-5 flex flex-col justify-between shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-7 rounded bg-yellow-300/80 flex items-center justify-center">
                    <div className="w-6 h-4 rounded-sm bg-yellow-400/60 border border-yellow-200/60" />
                  </div>
                  <span className="text-white/70 text-xs font-semibold tracking-widest">VISA</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-white text-lg tracking-widest">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </span>
                  <div className="flex justify-between text-white/70 text-xs">
                    <span>{cardName || "TÊN CHỦ THẺ"}</span>
                    <span>{expiry || "MM/YY"}</span>
                  </div>
                </div>
              </div>

              {/* Card form */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-(--color-muted) tracking-wide">SỐ THẺ</label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className="h-11 px-4 rounded-xl border border-(--color-border) bg-white text-sm font-mono focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-(--color-muted) tracking-wide">TÊN CHỦ THẺ</label>
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="NGUYEN VAN AN"
                    className="h-11 px-4 rounded-xl border border-(--color-border) bg-white text-sm uppercase focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-(--color-muted) tracking-wide">NGÀY HẾT HẠN</label>
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className="h-11 px-4 rounded-xl border border-(--color-border) bg-white text-sm font-mono focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-(--color-muted) tracking-wide">CVV</label>
                    <input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="•••"
                      type="password"
                      className="h-11 px-4 rounded-xl border border-(--color-border) bg-white text-sm font-mono focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-(--color-muted)">
                <Lock size={11} />
                <span>Thông tin thẻ được mã hóa và bảo mật tuyệt đối (demo)</span>
              </div>

              <button
                onClick={handleConfirm}
                disabled={paying || !cardNumber || !cardName || !expiry || !cvv}
                className="w-full h-12 rounded-xl bg-(--color-secondary) text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
              >
                {paying ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang xử lý...</>
                ) : (
                  <><Lock size={14} /> Thanh toán {total}</>
                )}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-full">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
