"use client";

import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Edit3,
  Ruler,
  Flame,
  Map,
} from "lucide-react";
import type { GisMode, UserRole } from "./types";

interface Props {
  zoom: number;
  mode: GisMode;
  userRole: UserRole;
  showHeatmap: boolean;
  showMinimap: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onModeChange: (m: GisMode) => void;
  onToggleHeatmap: () => void;
  onToggleMinimap: () => void;
}

const modeButtons: { mode: GisMode; label: string; icon: typeof Eye; adminOnly?: boolean }[] = [
  { mode: "view", label: "Xem", icon: Eye },
  { mode: "edit", label: "Sửa", icon: Edit3, adminOnly: true },
  { mode: "measure", label: "Đo", icon: Ruler },
];

export function GisToolbar({
  zoom,
  mode,
  userRole,
  showHeatmap,
  showMinimap,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onModeChange,
  onToggleHeatmap,
  onToggleMinimap,
}: Props) {
  return (
    <div
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-2xl"
      style={{
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      {/* Zoom controls */}
      <div className="flex items-center gap-0.5">
        <DockBtn onClick={onZoomOut} title="Thu nhỏ (-)">
          <ZoomOut size={15} />
        </DockBtn>
        <span className="w-11 text-center text-[11px] font-semibold text-white/80 tabular-nums select-none">
          {Math.round(zoom * 100)}%
        </span>
        <DockBtn onClick={onZoomIn} title="Phóng to (+)">
          <ZoomIn size={15} />
        </DockBtn>
        <DockBtn onClick={onResetZoom} title="Reset (0)">
          <RotateCcw size={13} />
        </DockBtn>
      </div>

      <Divider />

      {/* Mode toggle */}
      <div className="flex items-center gap-0.5">
        {modeButtons
          .filter((b) => !b.adminOnly || userRole === "admin")
          .map((b) => {
            const Icon = b.icon;
            const active = mode === b.mode;
            return (
              <button
                key={b.mode}
                onClick={() => onModeChange(b.mode)}
                className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-[11px] font-medium transition-all duration-150 ${active
                    ? "bg-white/20 text-white shadow-inner"
                    : "text-white/50 hover:text-white/80 hover:bg-white/10"
                  }`}
              >
                <Icon size={14} />
                {b.label}
              </button>
            );
          })}
      </div>

      <Divider />

      {/* Toggle buttons */}
      <DockBtn
        onClick={onToggleHeatmap}
        title="Heatmap phí duy tu"
        active={showHeatmap}
      >
        <Flame size={14} />
      </DockBtn>

      <DockBtn
        onClick={onToggleMinimap}
        title="Bản đồ thu nhỏ"
        active={showMinimap}
      >
        <Map size={14} />
      </DockBtn>
    </div>
  );
}

/* ── Helper components ── */

function Divider() {
  return <div className="w-px h-5 bg-white/15 mx-1" />;
}

function DockBtn({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 ${active
          ? "bg-white/20 text-white"
          : "text-white/50 hover:text-white/80 hover:bg-white/10"
        }`}
    >
      {children}
    </button>
  );
}
