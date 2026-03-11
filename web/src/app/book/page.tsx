"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, PlusCircle, Info, ArrowLeft, XCircle, Clock } from "lucide-react";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { zonesApi, plotsApi } from "@/lib/api";
import {
  buildZones,
  convertPlots,
  computeCanvasSize,
} from "@/components/gis/dataUtils";
import type { Plot, Zone } from "@/components/gis/types";
import { CELL_W, CELL_H, CELL_GAP } from "@/components/gis/types";

const GisCanvas = dynamic(() => import("@/components/gis/GisCanvas"), {
  ssr: false,
});

const STATUS_LEGEND = [
  { color: "#3EB370", label: "Còn trống — có thể đặt" },
  { color: "#E04444", label: "Đã sử dụng" },
  { color: "#4A90D9", label: "Đã được đặt trước" },
];

export default function BookPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [zoom, setZoom] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });

  // Container resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load GIS data
  useEffect(() => {
    async function load() {
      try {
        const [zoneDtos, plotDtos] = await Promise.all([
          zonesApi.getAll(),
          plotsApi.getAll(),
        ]);
        setZones(buildZones(zoneDtos));
        setPlots(convertPlots(plotDtos));
      } catch {
        // silent
      }
    }
    load();
  }, []);

  // Fit to view on initial load
  useEffect(() => {
    if (!zones.length || !containerSize.w) return;
    const size = computeCanvasSize(zones);
    const z = Math.min(containerSize.w / size.width, containerSize.h / size.height) * 0.85;
    setZoom(z);
    setPosition({
      x: (containerSize.w - size.width * z) / 2,
      y: (containerSize.h - size.height * z) / 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones.length, containerSize.w]);

  const zoomToPlot = useCallback(
    (plotId: string) => {
      const plot = plots.find((p) => p.id === plotId);
      const zone = zones.find((z) => z.id === plot?.zone);
      if (!plot || !zone) return;
      const cw = containerSize.w || 800;
      const ch = containerSize.h || 600;
      const targetZoom = 1.6;
      const px = zone.offsetX + plot.col * (CELL_W + CELL_GAP) + CELL_W / 2;
      const py = zone.offsetY + plot.row * (CELL_H + CELL_GAP) + CELL_H / 2;
      setZoom(targetZoom);
      setPosition({ x: cw / 2 - px * targetZoom, y: ch / 2 - py * targetZoom });
      setSelectedPlotId(plotId);
    },
    [plots, zones, containerSize]
  );

  const handleWheel = useCallback(
    (e: any) => {
      e.evt.preventDefault();
      const scaleBy = 1.08;
      const stage = e.target.getStage();
      const oldScale = zoom;
      const pointer = stage.getPointerPosition();
      const newScale = Math.max(
        0.15,
        Math.min(5, e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy)
      );
      setZoom(newScale);
      setPosition({
        x: pointer.x - ((pointer.x - position.x) / oldScale) * newScale,
        y: pointer.y - ((pointer.y - position.y) / oldScale) * newScale,
      });
    },
    [zoom, position]
  );

  const [zoneFilter, setZoneFilter] = useState("all");

  // Sidebar: list of available plots (filtered by zone)
  const available = plots.filter(
    (p) => p.status === "available" && (zoneFilter === "all" || p.zone === zoneFilter)
  );
  const selectedPlot = plots.find((p) => p.id === selectedPlotId);
  const zoneIds = Array.from(new Set(zones.map((z) => z.id))).sort();

  return (
    <div className="flex flex-col h-full">
      <PublicNavbar />

      {/* Header */}
      <div className="flex items-center gap-4 px-8 h-[68px] bg-white border-b border-(--color-border) shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-lg font-bold text-(--color-text)">Chọn vị trí mộ phần</h1>
          <p className="text-xs text-(--color-muted)">
            Nhấp vào ô <span className="text-[#3EB370] font-semibold">xanh lá</span> trên bản đồ để xem thông tin và đặt mộ
          </p>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          {STATUS_LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
              <span className="text-xs text-(--color-muted)">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[300px] shrink-0 flex flex-col overflow-hidden border-r border-(--color-border)">
          {selectedPlot ? (
            /* ── Detail panel khi đã chọn ô ── */
            <div className="flex flex-col h-full">
              {/* Back button */}
              <button
                onClick={() => setSelectedPlotId(null)}
                className="flex items-center gap-1.5 px-4 py-3 border-b border-(--color-border) text-sm text-(--color-muted) hover:text-(--color-text) transition-colors bg-(--color-bg)"
              >
                <ArrowLeft size={14} />
                Quay lại danh sách
              </button>

              <div className="flex-1 flex flex-col gap-0 overflow-auto">
                {/* Plot header */}
                <div className="px-5 py-5 border-b border-(--color-border)">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        selectedPlot.status === "available"
                          ? "bg-[#3EB370]"
                          : selectedPlot.status === "occupied"
                          ? "bg-[#E04444]"
                          : "bg-[#4A90D9]"
                      }`}
                    />
                    <span className="font-mono text-xl font-bold text-(--color-text)">{selectedPlot.id}</span>
                  </div>
                  <p className="text-sm text-(--color-muted)">
                    {(() => {
                      const z = zones.find((z) => z.id === selectedPlot.zone);
                      return z
                        ? `${z.label} — Hàng ${selectedPlot.row + 1}, Số ${selectedPlot.col + 1}`
                        : `Hàng ${selectedPlot.row + 1}, Số ${selectedPlot.col + 1}`;
                    })()}
                  </p>
                </div>

                {/* Status info */}
                <div className="px-5 py-5 flex flex-col gap-4">
                  {selectedPlot.status === "available" ? (
                    <>
                      <div className="rounded-xl bg-[#3EB370]/10 border border-[#3EB370]/25 px-4 py-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#3EB370] shrink-0" />
                        <span className="text-sm font-semibold text-[#2A8050]">Còn trống — có thể đặt</span>
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-(--color-muted)">
                        {[
                          ["Kích thước", `${selectedPlot.width || 110} × ${selectedPlot.height || 70} cm`],
                          ["Khu vực", zones.find((z) => z.id === selectedPlot.zone)?.label ?? selectedPlot.zone],
                          ["Vị trí", `Hàng ${selectedPlot.row + 1}, Ô số ${selectedPlot.col + 1}`],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between items-center py-1.5 border-b border-(--color-border) last:border-0">
                            <span>{k}</span>
                            <span className="font-semibold text-(--color-text)">{v}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : selectedPlot.status === "occupied" ? (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2">
                      <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">Đã có người sử dụng</p>
                        <p className="text-xs text-red-500 mt-0.5">Vị trí này không còn trống</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-2">
                      <Clock size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-700">Đã được đặt trước</p>
                        <p className="text-xs text-blue-500 mt-0.5">Vị trí này đang chờ xác nhận</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              {selectedPlot.status === "available" && (
                <div className="p-4 border-t border-(--color-border) bg-white">
                  <Link
                    href={`/reserve/${selectedPlot.id}`}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-(--color-secondary) text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <PlusCircle size={16} />
                    Đặt mộ phần này
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* ── Danh sách ô trống ── */
            <>
              <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-(--color-border) flex-wrap bg-(--color-bg)">
                {["all", ...zoneIds].map((zid) => (
                  <button
                    key={zid}
                    onClick={() => setZoneFilter(zid)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      zoneFilter === zid
                        ? "bg-(--color-primary) text-white"
                        : "bg-(--color-border) text-(--color-muted) hover:bg-(--color-primary)/10"
                    }`}
                  >
                    {zid === "all" ? "Tất cả" : `Khu ${zid}`}
                  </button>
                ))}
              </div>
              <div className="flex items-center px-4 h-[40px] bg-(--color-bg) border-b border-(--color-border)">
                <span className="text-sm font-semibold text-(--color-text)">
                  {available.length} vị trí còn trống
                </span>
              </div>

              {available.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-sm text-(--color-muted) p-4 text-center">
                  Đang tải dữ liệu...
                </div>
              )}

              <div className="flex-1 overflow-auto">
                {available.map((p) => {
                  const zone = zones.find((z) => z.id === p.zone);
                  return (
                    <div
                      key={p.id}
                      onClick={() => zoomToPlot(p.id)}
                      className="flex items-center gap-3 px-4 py-3 border-b border-(--color-border) cursor-pointer hover:bg-(--color-bg) transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#3EB370]/15 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-[#3EB370]" />
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="font-mono text-sm font-bold text-(--color-text)">{p.id}</span>
                        <span className="text-xs text-(--color-muted)">
                          {zone ? `${zone.label} — Hàng ${p.row + 1}, Số ${p.col + 1}` : `Hàng ${p.row + 1}, Số ${p.col + 1}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* GIS Canvas */}
        <div ref={containerRef} className="flex-1 relative bg-[#1C2B1C] overflow-hidden">
          {zones.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : (
            <GisCanvas
              plots={plots}
              zones={zones}
              width={containerSize.w || 800}
              height={containerSize.h || 600}
              zoom={zoom}
              position={position}
              selectedPlotId={selectedPlotId}
              mode="view"
              showHeatmap={false}
              onPlotSelect={(plot) => plot && zoomToPlot(plot.id)}
              onWheel={handleWheel}
              onDragEnd={setPosition}
            />
          )}

          {/* Hướng dẫn ban đầu */}
          {!selectedPlotId && zones.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-sm text-white text-xs px-5 py-2.5 rounded-full flex items-center gap-2 pointer-events-none">
              <Info size={12} />
              Nhấp vào ô xanh để xem thông tin và đặt mộ
            </div>
          )}

          {/* Label nhỏ trên map khi đã chọn */}
          {selectedPlot && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  selectedPlot.status === "available"
                    ? "bg-[#3EB370]"
                    : selectedPlot.status === "occupied"
                    ? "bg-[#E04444]"
                    : "bg-[#4A90D9]"
                }`}
              />
              {selectedPlot.id} — xem chi tiết ở thanh bên
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
