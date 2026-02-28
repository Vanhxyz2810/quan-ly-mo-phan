import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QrCode, Wallet, CreditCard, CheckCircle2, ChevronDown } from "lucide-react";

const invoiceItems = [
  { label: "Phí duy tu năm 2025", amount: "1,500,000 ₫" },
  { label: "Dịch vụ chăm sóc tháng 01–06", amount: "600,000 ₫" },
  { label: "Phí vệ sinh khu vực", amount: "200,000 ₫" },
];

export default function PaymentPage() {
  return (
    <div className="flex flex-col h-full">
      <PublicNavbar />

      {/* Hero */}
      <div className="bg-(--color-primary) px-14 py-8 shrink-0">
        <span className="text-(--color-secondary) text-xs font-semibold tracking-widest">✦ THANH TOÁN</span>
        <h1 className="font-heading text-3xl font-bold text-white mt-1">Hóa đơn dịch vụ</h1>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Invoice */}
        <div className="flex-1 overflow-auto px-10 py-8 flex flex-col gap-6 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-(--color-text)">Chi tiết hóa đơn</h2>
            <Badge variant="warning">Chờ thanh toán</Badge>
          </div>

          {/* Invoice header */}
          <div className="rounded-xl bg-(--color-bg) border border-(--color-border) p-6 flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-(--color-muted)">Mã hóa đơn</span>
                <span className="font-semibold text-(--color-text)">#INV-2025-0342</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-(--color-muted)">Ngày lập</span>
                <span className="font-semibold text-(--color-text)">15/01/2025</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-(--color-muted)">Hạn thanh toán</span>
                <span className="font-semibold text-red-500">31/01/2025</span>
              </div>
            </div>

            <div className="h-px bg-(--color-border)" />

            <div className="flex flex-col gap-1 text-sm">
              <span className="text-(--color-muted)">Mộ phần</span>
              <span className="font-semibold text-(--color-text)">Nguyễn Văn An — Khu A, Hàng 03, Số 15</span>
            </div>
          </div>

          {/* Line items */}
          <div className="rounded-xl border border-(--color-border) overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] bg-(--color-bg) px-5 py-3 text-xs font-bold text-(--color-muted) tracking-wider">
              <span>DỊCH VỤ</span>
              <span className="text-right">THÀNH TIỀN</span>
            </div>
            {invoiceItems.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto] px-5 py-4 border-t border-(--color-border) text-sm"
              >
                <span className="text-(--color-text)">{item.label}</span>
                <span className="font-semibold text-(--color-text)">{item.amount}</span>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_auto] px-5 py-4 border-t border-(--color-primary)/20 bg-(--color-primary)/5">
              <span className="font-bold text-(--color-text)">Tổng cộng</span>
              <span className="font-bold text-xl text-(--color-secondary)">2,300,000 ₫</span>
            </div>
          </div>

          {/* Notice */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
            <span className="font-semibold">Lưu ý:</span> Vui lòng thanh toán trước ngày hạn để tránh phí phạt chậm nộp. Liên hệ hotline <span className="font-semibold">1800-xxxx</span> nếu cần hỗ trợ.
          </div>
        </div>

        {/* Right: Payment panel */}
        <aside className="w-[480px] shrink-0 bg-(--color-bg) flex flex-col border-l border-(--color-border) overflow-auto">
          <div className="px-8 py-6 border-b border-(--color-border) bg-white">
            <h2 className="font-heading text-lg font-bold text-(--color-text)">Phương thức thanh toán</h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-(--color-border) bg-white px-8">
            {[
              { icon: <QrCode size={16} />, label: "QR Code" },
              { icon: <Wallet size={16} />, label: "Ví điện tử" },
              { icon: <CreditCard size={16} />, label: "Thẻ ngân hàng" },
            ].map((tab, i) => (
              <button
                key={i}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  i === 0
                    ? "border-(--color-secondary) text-(--color-secondary)"
                    : "border-transparent text-(--color-muted) hover:text-(--color-text)"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* QR Panel (active tab) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-8">
            <p className="text-sm text-(--color-muted) text-center">
              Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán
            </p>

            {/* QR placeholder */}
            <div className="w-[200px] h-[200px] bg-white border-2 border-(--color-border) rounded-2xl flex items-center justify-center shadow-sm">
              <div className="w-[160px] h-[160px] bg-(--color-bg) rounded-lg flex items-center justify-center">
                <QrCode size={80} className="text-(--color-text)" strokeWidth={1} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-xl font-bold text-(--color-secondary)">2,300,000 ₫</p>
              <p className="text-xs text-(--color-muted)">#INV-2025-0342</p>
            </div>

            <div className="w-full rounded-lg bg-white border border-(--color-border) p-4 flex flex-col gap-2 text-sm">
              {[
                ["Ngân hàng thụ hưởng", "Vietcombank"],
                ["Số tài khoản", "0123 4567 8901"],
                ["Chủ tài khoản", "CONG TY QLNT ABC"],
                ["Nội dung CK", "INV-2025-0342 NVA"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-(--color-muted)">{k}</span>
                  <span className="font-semibold text-(--color-text)">{v}</span>
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-(--color-border)" />

            <Button variant="primary" className="w-full gap-2">
              <CheckCircle2 size={16} /> Xác nhận đã thanh toán
            </Button>
            <p className="text-[11px] text-(--color-muted) text-center">
              Sau khi xác nhận, hệ thống sẽ kiểm tra và cập nhật trong vòng 5–10 phút
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
