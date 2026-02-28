import { Search, MapPin, Calendar } from "lucide-react";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import Link from "next/link";

const results = [
  {
    id: "A-03-15",
    name: "Nguyễn Văn An",
    born: "15/03/1945",
    died: "22/08/2018",
    plot: "Khu A, Hàng 3, Số 15",
    highlight: true,
  },
  {
    id: "B-12-04",
    name: "Nguyễn Thị An",
    born: "07/11/1952",
    died: "14/03/2022",
    plot: "Khu B, Hàng 12, Số 4",
    highlight: false,
  },
];

export default function SearchPage() {
  return (
    <div className="flex flex-col h-full">
      <PublicNavbar />

      {/* Search bar row */}
      <div className="flex items-center gap-4 px-8 h-[68px] bg-white border-b border-(--color-border) shrink-0">
        <div className="flex items-center gap-2 h-[42px] px-4 rounded-[21px] bg-[#F3F4F6] w-[420px]">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            defaultValue="Nguyễn Văn An"
            className="flex-1 text-sm outline-none bg-transparent text-(--color-text)"
          />
        </div>
        <button className="flex items-center justify-center px-5 h-[42px] rounded-[21px] bg-(--color-secondary) text-white text-sm font-bold hover:opacity-90 transition-opacity">
          Tìm
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Results list */}
        <div className="w-[400px] shrink-0 flex flex-col overflow-hidden border-r border-(--color-border)">
          {/* Header */}
          <div className="flex items-center px-5 h-[52px] bg-(--color-bg) border-b border-(--color-border)">
            <span className="text-sm font-semibold text-(--color-text)">
              Kết quả: 2 hồ sơ
            </span>
          </div>

          {/* Result cards */}
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/memorial/${r.id}`}
              className={`flex flex-col gap-2 px-5 py-4 border-b border-(--color-border) hover:bg-(--color-bg) transition-colors cursor-pointer ${r.highlight ? "bg-[#EFF7F4]" : "bg-white"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-(--color-text)">{r.name}</span>
                <span className="text-xs font-semibold text-(--color-secondary) bg-(--color-secondary)/10 px-2 py-0.5 rounded-full">
                  {r.id}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-(--color-muted)">
                <Calendar size={11} />
                <span>{r.born} — {r.died}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-(--color-muted)">
                <MapPin size={11} />
                <span>{r.plot}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Map panel */}
        <div className="flex-1 relative bg-[#2D5A27] overflow-hidden">
          {/* Map label */}
          <div className="absolute top-5 left-5 z-10">
            <span className="text-white/50 text-xs font-bold tracking-widest">NGHĨA TRANG</span>
          </div>

          {/* Main road H */}
          <div className="absolute bg-[#8B7355] h-4" style={{ top: 400, left: 0, right: 0 }} />
          {/* Main road V */}
          <div className="absolute bg-[#8B7355] w-4" style={{ left: 300, top: 0, bottom: 0 }} />

          {/* Entrance */}
          <div className="absolute flex items-center justify-center w-14 h-8 bg-(--color-primary) rounded text-white text-[10px] font-bold"
            style={{ left: 280, bottom: 10 }}>
            Lối vào
          </div>

          {/* Destination marker */}
          <div
            className="absolute w-8 h-8 rounded-full bg-(--color-secondary) border-2 border-white flex items-center justify-center shadow-lg"
            style={{ left: 200, top: 120 }}
          >
            <MapPin size={14} className="text-white" />
          </div>

          {/* Path line (simulated) */}
          <div className="absolute border-l-2 border-dashed border-white/60" style={{ left: 308, top: 128, height: 280 }} />
          <div className="absolute border-t-2 border-dashed border-white/60" style={{ left: 208, top: 408, width: 100 }} />

          {/* Distance overlay */}
          <div className="absolute top-4 right-4 bg-black/60 rounded-lg px-3 py-2">
            <p className="text-white text-xs font-semibold">📍 Khu A · Hàng 3 · Số 15</p>
            <p className="text-white/70 text-xs">~120m từ lối vào</p>
          </div>
        </div>
      </div>
    </div>
  );
}
