"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import type { Plot, Zone } from "./types";
import { CELL_W, CELL_H, CELL_GAP } from "./types";

interface Props {
  plots: Plot[];
  zones: Zone[];
  totalWidth: number;
  totalHeight: number;
  viewportX: number;
  viewportY: number;
  containerWidth: number;
  containerHeight: number;
  zoom: number;
  collapsed: boolean;
  onPanTo: (x: number, y: number) => void;
  onToggle: () => void;
}

const MINIMAP_W = 200;
const MINIMAP_H = 140;

const STATUS_COLORS: Record<string, string> = {
  occupied: "#E88B8B",
  available: "#7ED4A6",
  reserved: "#7EB8E0",
};

export function GisMinimap({
  plots,
  zones,
  totalWidth,
  totalHeight,
  viewportX,
  viewportY,
  containerWidth,
  containerHeight,
  zoom,
  collapsed,
  onPanTo,
  onToggle,
}: Props) {
  const scaleX = MINIMAP_W / totalWidth;
  const scaleY = MINIMAP_H / totalHeight;
  const scale = Math.min(scaleX, scaleY);

  // Viewport rect in minimap coordinates
  const vpW = (containerWidth / zoom) * scale;
  const vpH = (containerHeight / zoom) * scale;
  const vpX = (-viewportX / zoom) * scale;
  const vpY = (-viewportY / zoom) * scale;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Convert minimap coords to canvas coords
    const canvasX = mx / scale;
    const canvasY = my / scale;
    onPanTo(-canvasX * zoom + containerWidth / 2, -canvasY * zoom + containerHeight / 2);
  };

  return (
    <div className="absolute bottom-16 right-3 z-20 flex items-end gap-1">
      <button
        onClick={onToggle}
        className="w-7 h-7 rounded-lg shadow flex items-center justify-center transition-all duration-150"
        style={{
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {!collapsed && (
        <div
          className="relative rounded-xl shadow-xl overflow-hidden cursor-crosshair"
          style={{
            width: MINIMAP_W,
            height: MINIMAP_H,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
          onClick={handleClick}
        >
          {/* Zone backgrounds */}
          {zones.map((z) => (
            <div
              key={z.id}
              className="absolute rounded-sm"
              style={{
                left: z.offsetX * scale,
                top: z.offsetY * scale,
                width: z.cols * (CELL_W + CELL_GAP) * scale,
                height: z.rows * (CELL_H + CELL_GAP) * scale,
                backgroundColor: "#2A4F3A",
                opacity: 0.4,
              }}
            />
          ))}

          {/* Plot dots */}
          {plots.map((p) => {
            const zone = zones.find((z) => z.id === p.zone);
            if (!zone) return null;
            const px = (zone.offsetX + p.col * (CELL_W + CELL_GAP)) * scale;
            const py = (zone.offsetY + p.row * (CELL_H + CELL_GAP)) * scale;
            return (
              <div
                key={p.id}
                className="absolute rounded-[1px]"
                style={{
                  left: px,
                  top: py,
                  width: Math.max(2, CELL_W * scale),
                  height: Math.max(2, CELL_H * scale),
                  backgroundColor: STATUS_COLORS[p.status] ?? "#888",
                  opacity: 0.85,
                }}
              />
            );
          })}

          {/* Viewport indicator — bright white box */}
          <div
            className="absolute rounded-sm"
            style={{
              left: Math.max(0, vpX),
              top: Math.max(0, vpY),
              width: Math.min(vpW, MINIMAP_W),
              height: Math.min(vpH, MINIMAP_H),
              border: "2px solid rgba(255,255,255,0.8)",
              backgroundColor: "rgba(255,255,255,0.08)",
              boxShadow: "0 0 8px rgba(255,255,255,0.15)",
            }}
          />
        </div>
      )}
    </div>
  );
}
