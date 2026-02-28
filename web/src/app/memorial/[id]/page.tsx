import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, Mail, Flower, Flame, CreditCard } from "lucide-react";

export default async function MemorialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-col h-full">
      <PublicNavbar />

      {/* Hero */}
      <div className="bg-(--color-primary) flex flex-col gap-2 px-14 py-10 shrink-0">
        <span className="text-(--color-secondary) text-xs font-semibold tracking-widest">✦ TƯỞNG NHỚ</span>
        <h1 className="font-heading text-4xl font-bold text-white">Nguyễn Văn An</h1>
        <div className="flex items-center gap-3 text-(--color-sidebar-muted) text-sm">
          <span>15/03/1945</span>
          <span>·</span>
          <span>22/08/2018</span>
          <div className="flex items-center gap-1.5 ml-2">
            <MapPin size={13} />
            <span>Khu A · Hàng 03 · Số 15</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: gallery + eulogy */}
        <div className="flex-1 overflow-auto px-9 py-8 flex flex-col gap-6 bg-white">
          <h2 className="font-heading text-lg font-bold text-(--color-text)">Hình ảnh kỷ niệm</h2>
          <div className="flex gap-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[120px] h-[80px] rounded-lg bg-(--color-bg) border border-(--color-border) flex items-center justify-center"
              >
                <span className="text-2xl">🪦</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-(--color-border)" />

          <h2 className="font-heading text-lg font-bold text-(--color-text)">Lời tưởng nhớ từ gia đình</h2>
          <div className="rounded-lg bg-[#F9F6EF] p-5 flex flex-col gap-3">
            <p className="text-sm text-(--color-text) leading-relaxed italic">
              "Cha là ngọn đèn soi sáng cả gia đình. Dù cha đã ra đi nhưng những gì cha để lại trong lòng chúng con sẽ mãi mãi còn đó. Chúng con luôn nhớ đến cha."
            </p>
            <p className="text-xs text-(--color-muted) font-semibold">— Nguyễn Thị Hoa, Con gái</p>
          </div>

          <div className="flex items-center gap-3 h-[60px] px-4 rounded-lg bg-(--color-bg) border border-(--color-border)">
            <input
              type="text"
              placeholder="Viết lời tưởng nhớ..."
              className="flex-1 text-sm outline-none bg-transparent text-(--color-text) placeholder:text-(--color-muted)"
            />
            <Button variant="primary" size="sm">Gửi</Button>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-[360px] shrink-0 bg-(--color-bg) flex flex-col gap-5 p-7 overflow-auto border-l border-(--color-border)">
          <p className="text-[10px] font-bold text-(--color-muted) tracking-widest">DỊCH VỤ CHĂM SÓC</p>

          <Button variant="primary" className="w-full gap-2">
            <Flower size={16} /> Đặt dịch vụ chăm sóc
          </Button>
          <button className="w-full h-12 rounded-lg border border-(--color-border) bg-white flex items-center justify-center gap-2 text-sm font-semibold text-(--color-text) hover:bg-white/80 transition-colors">
            <span>🌸</span> Đặt hoa tươi
          </button>
          <button className="w-full h-12 rounded-lg bg-(--color-secondary) flex items-center justify-center gap-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            <Flame size={16} /> Dâng hương thay
          </button>

          <div className="h-px bg-(--color-border)" />

          <p className="text-[10px] font-bold text-(--color-muted) tracking-widest">THÔNG TIN MỘ PHẦN</p>

          <div className="rounded-lg bg-white border border-(--color-border) p-4 flex flex-col gap-3 text-sm">
            {[
              ["Mã mộ", id],
              ["Vị trí", "Khu A, Hàng 3, Số 15"],
              ["Tình trạng", "Đã lấp đầy"],
              ["Gói duy tu", "1 năm (2025–2026)"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-(--color-muted)">{label}</span>
                <span className="font-semibold text-(--color-text)">{val}</span>
              </div>
            ))}
          </div>

          <Button variant="danger" className="w-full gap-2">
            <CreditCard size={16} /> Thanh toán phí duy tu
          </Button>

          <div className="rounded-lg bg-white border border-(--color-border) p-4 flex flex-col items-center gap-2">
            <p className="text-xs font-semibold text-(--color-muted)">QR Mã mộ phần</p>
            <div className="w-20 h-20 bg-(--color-bg) rounded-lg border border-(--color-border) flex items-center justify-center text-2xl">
              ▦
            </div>
            <p className="text-[10px] text-(--color-muted)">{id}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
