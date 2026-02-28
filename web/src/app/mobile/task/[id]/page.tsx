import { ArrowLeft, Camera, CheckCircle2, MapPin, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TaskExecutionPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-full">
      {/* Status bar placeholder */}
      <div className="h-11 bg-[#2D5016] shrink-0" />

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#2D5016] shrink-0">
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <p className="text-white/60 text-[11px]">Nhiệm vụ {params.id}</p>
          <h1 className="text-white font-bold text-base leading-tight">Chăm sóc cỏ</h1>
        </div>
        <div className="px-2.5 py-1 bg-blue-500 rounded-lg">
          <span className="text-white text-[11px] font-bold">Đang làm</span>
        </div>
      </div>

      {/* Map view */}
      <div className="relative h-[260px] bg-[#2D5016] shrink-0 overflow-hidden">
        {/* Roads */}
        <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-1 bg-[#3A6B1A]" />
        <div className="absolute top-1/2 -translate-y-0.5 left-0 right-0 h-1 bg-[#3A6B1A]" />
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-[#3A6B1A]/60" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-[#3A6B1A]/60" />
        <div className="absolute top-1/4 left-0 right-0 h-px bg-[#3A6B1A]/60" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-[#3A6B1A]/60" />

        {/* Plot grid mock */}
        {[
          [22, 18], [35, 18], [48, 18],
          [22, 32], [35, 32], [48, 32],
          [22, 46], [35, 46], [48, 46],
          [62, 25], [75, 25], [62, 40], [75, 40],
        ].map(([x, y], i) => (
          <div
            key={i}
            className="absolute w-7 h-5 rounded-sm opacity-80"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              background: i % 3 === 0 ? "#EF4444" : i % 3 === 1 ? "#22C55E" : "#3B82F6",
            }}
          />
        ))}

        {/* Destination marker */}
        <div
          className="absolute w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-lg"
          style={{ left: "35%", top: "32%", transform: "translate(-50%,-50%)" }}
        />

        {/* User dot */}
        <div
          className="absolute w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"
          style={{ left: "50%", top: "65%", transform: "translate(-50%,-50%)" }}
        />

        {/* Distance overlay */}
        <div className="absolute top-3 left-3 bg-black/60 rounded-lg px-3 py-2">
          <p className="text-white text-xs font-semibold">~ 45m</p>
          <p className="text-white/70 text-[10px]">đến điểm đến</p>
        </div>

        {/* Legend overlay */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          {[
            { color: "bg-red-500", label: "Đã lấp" },
            { color: "bg-green-500", label: "Trống" },
            { color: "bg-blue-500", label: "Đặt cọc" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 bg-black/50 rounded px-2 py-0.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
              <span className="text-white text-[10px]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info panel */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="px-5 py-5 flex flex-col gap-4">
          <h2 className="font-heading text-base font-bold text-(--color-text)">Chi tiết nhiệm vụ</h2>

          <div className="flex flex-col gap-3">
            {[
              { icon: <MapPin size={15} />, label: "Vị trí", value: "Khu A, Hàng 3, Số 15" },
              { icon: <Clock size={15} />, label: "Thời gian", value: "08:00 – 09:00 (hôm nay)" },
              { icon: <User size={15} />, label: "Người yêu cầu", value: "Ban quản lý" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-(--color-bg) flex items-center justify-center text-(--color-secondary) shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[11px] text-(--color-muted)">{item.label}</p>
                  <p className="text-sm font-semibold text-(--color-text)">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-(--color-border)" />

          <div>
            <p className="text-xs font-bold text-(--color-muted) tracking-wider mb-2">GHI CHÚ</p>
            <p className="text-sm text-(--color-text) leading-relaxed bg-(--color-bg) rounded-lg p-3">
              Cắt cỏ gọn gàng, nhặt cành lá khô, dọn sạch khu vực xung quanh. Chụp ảnh trước và sau khi hoàn thành.
            </p>
          </div>
        </div>
      </div>

      {/* Action area */}
      <div className="px-5 py-4 bg-white border-t border-(--color-border) flex flex-col gap-3 shrink-0">
        <button className="w-full h-12 rounded-xl border-2 border-dashed border-(--color-border) flex items-center justify-center gap-2 text-sm font-semibold text-(--color-muted)">
          <Camera size={18} /> Chụp ảnh xác nhận
        </button>
        <Button
          variant="primary"
          className="w-full h-12 gap-2 bg-(--color-secondary) border-(--color-secondary)"
        >
          <CheckCircle2 size={18} /> Hoàn thành nhiệm vụ
        </Button>
      </div>
    </div>
  );
}
