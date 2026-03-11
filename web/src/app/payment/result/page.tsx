"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, Eye, Home } from "lucide-react";
import Image from "next/image";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { paymentApi } from "@/lib/api";

const RESPONSE_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công.",
  "07": "Trừ tiền thành công (giao dịch nghi ngờ, chờ xác minh).",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.",
  "10": "Xác thực thông tin thẻ thất bại quá 3 lần.",
  "11": "Hết hạn chờ thanh toán, vui lòng thử lại.",
  "12": "Thẻ/Tài khoản bị khóa.",
  "13": "Nhập sai mật khẩu OTP.",
  "24": "Giao dịch bị hủy bởi khách hàng.",
  "51": "Tài khoản không đủ số dư.",
  "65": "Vượt hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng đang bảo trì.",
  "79": "Nhập sai mật khẩu thanh toán quá số lần quy định.",
  "99": "Lỗi không xác định, vui lòng liên hệ hỗ trợ.",
};

function ResultContent() {
  const searchParams = useSearchParams();
  const [plotId, setPlotId] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  const responseCode = searchParams.get("vnp_ResponseCode") ?? "";
  const txnRef = searchParams.get("vnp_TxnRef") ?? "";
  const rawAmount = searchParams.get("vnp_Amount");
  const bankCode = searchParams.get("vnp_BankCode");
  const payDate = searchParams.get("vnp_PayDate");
  const transactionNo = searchParams.get("vnp_TransactionNo");
  const secureHash = searchParams.get("vnp_SecureHash") ?? "";

  const isSuccess =
    verified !== null ? verified : responseCode === "00" || responseCode === "07";
  const message =
    RESPONSE_MESSAGES[responseCode] ?? "Kết quả không xác định.";

  useEffect(() => {
    const stored = sessionStorage.getItem("vnpay_pending_plotId");
    const currentPlotId = stored ?? null;
    if (currentPlotId) setPlotId(currentPlotId);

    if (secureHash) {
      const params: Record<string, string> = {};
      searchParams.forEach((v, k) => { params[k] = v; });

      paymentApi
        .verifyVNPay(currentPlotId ?? "", secureHash, params)
        .then((res) => {
          setVerified(res.success);
          if (res.success) sessionStorage.removeItem("vnpay_pending_plotId");
        })
        .catch(() => {
          setVerified(null);
          if (responseCode === "00") sessionStorage.removeItem("vnpay_pending_plotId");
        });
    } else {
      if (responseCode === "00") sessionStorage.removeItem("vnpay_pending_plotId");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedAmount = rawAmount
    ? (parseInt(rawAmount) / 100).toLocaleString("vi-VN") + " ₫"
    : null;

  const formattedDate = payDate
    ? `${payDate.slice(6, 8)}/${payDate.slice(4, 6)}/${payDate.slice(0, 4)} ${payDate.slice(8, 10)}:${payDate.slice(10, 12)}`
    : null;

  const receiptRows = [
    transactionNo ? ["Mã giao dịch VNPay", transactionNo] : null,
    txnRef ? ["Mã tham chiếu", txnRef] : null,
    plotId ? ["Mã mộ phần", `#${plotId}`] : null,
    formattedAmount ? ["Số tiền thanh toán", formattedAmount] : null,
    bankCode ? ["Ngân hàng", bankCode] : null,
    formattedDate ? ["Thời gian giao dịch", formattedDate] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <div className="flex flex-col min-h-screen bg-(--color-bg)">
      <style>{`
        @keyframes ping-ring { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(2.5);opacity:0} }
        @keyframes check-pop { 0%{transform:scale(.25) rotate(-12deg);opacity:0} 60%{transform:scale(1.18) rotate(4deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }
        .ping-ring{animation:ping-ring 1.9s ease-out infinite}
        .ping-ring-2{animation:ping-ring 1.9s .55s ease-out infinite}
        .check-pop{animation:check-pop .6s cubic-bezier(.34,1.56,.64,1) forwards}
        .fade-up-0{animation:fade-up .5s ease-out both}
        .fade-up-1{animation:fade-up .5s .12s ease-out both}
        .fade-up-2{animation:fade-up .5s .26s ease-out both}
        .fade-up-3{animation:fade-up .5s .4s ease-out both}
        .fade-up-4{animation:fade-up .5s .54s ease-out both}
        .shimmer{animation:shimmer 2.2s ease-in-out infinite}
      `}</style>

      <PublicNavbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex flex-col gap-5">

          {/* Animated icon */}
          <div className="flex flex-col items-center gap-3 fade-up-0">
            <div className="relative">
              {isSuccess && (
                <>
                  <div className="absolute inset-0 rounded-full bg-green-400/20 ping-ring" />
                  <div className="absolute inset-0 rounded-full bg-green-400/15 ping-ring-2" />
                </>
              )}
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
                isSuccess ? "bg-green-500 shadow-green-200" : "bg-red-500 shadow-red-200"
              }`}>
                {isSuccess ? (
                  <svg className="w-12 h-12 text-white check-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <XCircle size={48} className="text-white" />
                )}
              </div>
            </div>

            {isSuccess && (
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-yellow-500 shimmer" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Giao dịch hoàn tất</span>
                <svg className="w-3.5 h-3.5 text-yellow-500 shimmer" style={{animationDelay:".7s"}} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center fade-up-1">
            <h1 className="font-heading text-3xl font-bold text-(--color-text)">
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>
            <p className="text-(--color-muted) text-sm mt-1.5">{message}</p>
          </div>

          {/* Receipt card */}
          <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden shadow-sm fade-up-2">
            {/* Brand header */}
            <div className="bg-(--color-primary) px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/55 text-[10px] font-bold tracking-widest uppercase">Hóa đơn điện tử</p>
                <p className="text-white font-bold text-lg mt-0.5">An Nghỉ Viên</p>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <Image src="/images/vnpay.png" alt="VNPay" width={20} height={20} className="rounded object-contain" />
                <span className="text-white/80 text-xs font-semibold">VNPay</span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-200" />

            {/* Receipt rows */}
            <div className="px-6 py-5 flex flex-col gap-3.5">
              {receiptRows.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex justify-between items-center ${
                    i < receiptRows.length - 1 ? "pb-3.5 border-b border-dashed border-gray-100" : ""
                  }`}
                >
                  <span className="text-(--color-muted) text-sm">{k}</span>
                  <span className={`font-semibold text-sm ${
                    k === "Số tiền thanh toán" ? "text-(--color-secondary) text-base" : "text-(--color-text)"
                  }`}>{v}</span>
                </div>
              ))}

              {/* Status */}
              <div className={`mt-1 flex items-center justify-between rounded-xl px-4 py-3 ${
                isSuccess ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
              }`}>
                <span className="text-sm text-(--color-muted)">Trạng thái giao dịch</span>
                <span className={`text-sm font-bold flex items-center gap-1.5 ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                  {isSuccess ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {isSuccess ? "Thành công" : "Thất bại"}
                </span>
              </div>
            </div>

            {/* Scissors divider */}
            <div className="relative border-t-2 border-dashed border-gray-200">
              <div className="absolute -top-3 left-5 bg-white px-1">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"/>
                </svg>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-gray-50 text-center">
              <p className="text-xs text-(--color-muted)">
                Cảm ơn bạn đã tin tưởng <span className="font-semibold text-(--color-primary)">An Nghỉ Viên</span> · Hotline: <span className="font-semibold">1800-0000</span>
              </p>
            </div>
          </div>

          {/* Next steps — chỉ hiện khi thành công */}
          {isSuccess && (
            <div className="bg-white rounded-2xl border border-(--color-border) p-5 fade-up-3">
              <p className="text-sm font-bold text-(--color-text) mb-3">Bước tiếp theo</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Hồ sơ đã xác nhận và lưu vào hệ thống", done: true },
                  { label: "Email xác nhận sẽ được gửi trong vòng 24 giờ", done: false },
                  { label: "Nhân viên sẽ liên hệ để hướng dẫn bàn giao mộ phần", done: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      s.done ? "bg-green-500 text-white" : "bg-gray-100 text-(--color-muted)"
                    }`}>
                      {s.done ? "✓" : i + 1}
                    </div>
                    <span className={s.done ? "text-(--color-text)" : "text-(--color-muted)"}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2.5 fade-up-4">
            {isSuccess && plotId && (
              <Link
                href={`/memorial/${plotId}`}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Eye size={16} />
                Xem trang tưởng niệm
              </Link>
            )}
            {!isSuccess && (
              <button
                onClick={() => window.history.back()}
                className="h-12 rounded-xl bg-(--color-secondary) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Thử lại
              </button>
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

export default function VNPayResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen">
          <PublicNavbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
