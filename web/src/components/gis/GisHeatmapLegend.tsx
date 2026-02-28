"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  visible: boolean;
}

const items = [
  { color: "#E88B8B", label: "Đã lấp đầy" },
  { color: "#7EB8E0", label: "Đã đặt trước" },
  { color: "#7ED4A6", label: "Còn trống" },
];

export function GisHeatmapLegend({ visible }: Props) {
  if (!visible) return null;

  return (
    <div
      className="absolute bottom-3 left-3 z-20 p-3 rounded-xl shadow-xl"
      style={{
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      <p className="text-[10px] font-bold text-white/40 tracking-wider mb-2">
        HEATMAP — PHÍ DUY TƯ
      </p>
      <div className="flex flex-col gap-1.5">
        {[
          { color: "#FF0000", label: "Quá hạn" },
          { color: "#FF8C00", label: "Sắp hạn (< 30 ngày)" },
          { color: "#FFD700", label: "Sắp hạn (< 90 ngày)" },
          { color: "#22C55E", label: "Còn hạn" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color, opacity: 0.8 }}
            />
            <span className="text-xs text-white/70">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Collapsible Status Legend ── */
export function GisLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="absolute bottom-3 left-3 z-10 rounded-xl shadow-xl overflow-hidden"
      style={{
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold text-white/40 tracking-wider hover:text-white/60 transition-colors"
      >
        CHÚ THÍCH
        {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {!collapsed && (
        <div className="px-3 pb-2.5 flex flex-col gap-1.5">
          {items.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="relative w-6 h-4 rounded" style={{ backgroundColor: color, opacity: 0.85 }}>
                <div
                  className="absolute inset-0.5 rounded-sm border border-white/30"
                />
              </div>
              <span className="text-xs text-white/70">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
