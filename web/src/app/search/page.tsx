"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  Suspense,
} from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { searchApi, zonesApi, plotsApi, type SearchResultDto } from "@/lib/api";
import {
  buildZones,
  convertPlots,
  computeCanvasSize,
} from "@/components/gis/dataUtils";
import type { Plot, Zone } from "@/components/gis/types";
import { CELL_W, CELL_H, CELL_GAP } from "@/components/gis/types";

// Konva must be client-side only
const GisCanvas = dynamic(() => import("@/components/gis/GisCanvas"), {
  ssr: false,
});

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResultDto[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── GIS state ──
  const [zones, setZones] = useState<Zone[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [zoom, setZoom] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });

  // Track container resize
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

  // Load GIS data once
  useEffect(() => {
    async function load() {
      try {
        const [zoneDtos, plotDtos] = await Promise.all([
          zonesApi.getAll(),
          plotsApi.getAll(),
        ]);
        const builtZones = buildZones(zoneDtos);
        const convertedPlots = convertPlots(plotDtos);
        setZones(builtZones);
        setPlots(convertedPlots);
      } catch {
        // silent — map won't show if backend is offline
      }
    }
    load();
  }, []);

  // Fit map to view when zones + container are ready
  useEffect(() => {
    if (!zones.length || !containerSize.w) return;
    const size = computeCanvasSize(zones);
    const z =
      Math.min(containerSize.w / size.width, containerSize.h / size.height) *
      0.85;
    setZoom(z);
    setPosition({
      x: (containerSize.w - size.width * z) / 2,
      y: (containerSize.h - size.height * z) / 2,
    });
    // only on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones.length, containerSize.w]);

  // Zoom + pan to a specific plot
  const zoomToPlot = useCallback(
    (plotId: string) => {
      const plot = plots.find((p) => p.id === plotId);
      const zone = zones.find((z) => z.id === plot?.zone);
      if (!plot || !zone) return;

      const cw = containerSize.w || 800;
      const ch = containerSize.h || 600;
      const targetZoom = 1.4;
      const px = zone.offsetX + plot.col * (CELL_W + CELL_GAP) + CELL_W / 2;
      const py = zone.offsetY + plot.row * (CELL_H + CELL_GAP) + CELL_H / 2;

      setZoom(targetZoom);
      setPosition({
        x: cw / 2 - px * targetZoom,
        y: ch / 2 - py * targetZoom,
      });
      setSelectedPlotId(plotId);
    },
    [plots, zones, containerSize]
  );

  const handleSearch = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!query || query.length < 2) return;
      setLoading(true);
      setSearched(true);
      try {
        const data = await searchApi.search(query);
        setResults(data);
        // Auto-zoom to first occupied result
        const first = data.find((r) => r.status === "occupied") ?? data[0];
        if (first) zoomToPlot(first.plotId);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, zoomToPlot]
  );

  // Auto-search if ?q= param is present and GIS data is loaded
  const autoSearchedRef = useRef(false);
  useEffect(() => {
    if (autoSearchedRef.current || !query || query.length < 2 || !plots.length) return;
    autoSearchedRef.current = true;
    handleSearch();
  }, [query, plots.length, handleSearch]);

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

  const formatLocation = (r: SearchResultDto) =>
    `Khu ${r.zone}, Hàng ${r.row + 1}, Số ${r.col + 1}`;

  return (
    <div className="flex flex-col h-full">
      <PublicNavbar />

      {/* ── Search bar ── */}
      <div className="flex items-center gap-4 px-8 h-[68px] bg-white border-b border-(--color-border) shrink-0">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="flex items-center gap-2 h-[42px] px-4 rounded-[21px] bg-[#F3F4F6] w-[420px]">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tên người mất hoặc mã mộ..."
              className="flex-1 text-sm outline-none bg-transparent text-(--color-text)"
            />
          </div>
          <button
            type="submit"
            disabled={loading || query.length < 2}
            className="flex items-center justify-center px-5 h-[42px] rounded-[21px] bg-(--color-secondary) text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Đang tìm..." : "Tìm"}
          </button>
        </form>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Results list */}
        <div className="w-[380px] shrink-0 flex flex-col overflow-hidden border-r border-(--color-border)">
          <div className="flex items-center px-5 h-[52px] bg-(--color-bg) border-b border-(--color-border)">
            <span className="text-sm font-semibold text-(--color-text)">
              {searched
                ? `Kết quả: ${results.length} hồ sơ`
                : "Nhập từ khóa để tìm kiếm"}
            </span>
          </div>

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-sm text-(--color-muted)">
              Không tìm thấy kết quả
            </div>
          )}

          <div className="flex-1 overflow-auto">
            {!loading &&
              results.map((r, i) => (
                <div
                  key={r.plotId}
                  onClick={() => zoomToPlot(r.plotId)}
                  className={`flex flex-col gap-2 px-5 py-4 border-b border-(--color-border) cursor-pointer transition-colors ${
                    selectedPlotId === r.plotId
                      ? "bg-(--color-primary)/8 border-l-[3px] border-l-(--color-primary)"
                      : i === 0
                      ? "bg-[#EFF7F4] hover:bg-[#E5F3EE]"
                      : "bg-white hover:bg-(--color-bg)"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-(--color-text)">
                      {r.deceasedName || "Chưa có thông tin"}
                    </span>
                    <span className="text-xs font-semibold text-(--color-secondary) bg-(--color-secondary)/10 px-2 py-0.5 rounded-full">
                      {r.plotId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-(--color-muted)">
                    <MapPin size={11} />
                    <span>{formatLocation(r)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-(--color-muted)">
                    <Calendar size={11} />
                    <span>
                      {r.status === "occupied"
                        ? "Đã sử dụng"
                        : r.status === "available"
                        ? "Còn trống"
                        : "Đã đặt"}
                    </span>
                  </div>
                  {r.status === "occupied" && (
                    <Link
                      href={`/memorial/${r.plotId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="self-start mt-1 text-xs font-semibold text-(--color-primary) hover:underline"
                    >
                      Xem trang tưởng niệm →
                    </Link>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* ── GIS Canvas panel ── */}
        <div
          ref={containerRef}
          className="flex-1 relative bg-[#1C2B1C] overflow-hidden"
        >
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
              onPlotSelect={(plot) => zoomToPlot(plot.id)}
              onWheel={handleWheel}
              onDragEnd={setPosition}
            />
          )}

          {/* Hint chưa tìm */}
          {!searched && zones.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full pointer-events-none">
              Tìm kiếm để định vị mộ phần trên bản đồ
            </div>
          )}

          {/* Overlay info khi đã chọn */}
          {selectedPlotId &&
            (() => {
              const sr = results.find((r) => r.plotId === selectedPlotId);
              const mp = plots.find((p) => p.id === selectedPlotId);
              const status = sr?.status ?? mp?.status ?? "";
              const name = sr?.deceasedName ?? mp?.data?.deceased?.name ?? null;
              const loc = sr
                ? formatLocation(sr)
                : mp
                ? `Khu ${mp.zone}, Hàng ${mp.row + 1}, Số ${mp.col + 1}`
                : selectedPlotId;
              return (
                <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-sm rounded-xl px-4 py-3 flex flex-col gap-1">
                  <p className="text-white text-sm font-bold">
                    📍 {name || selectedPlotId}
                  </p>
                  <p className="text-white/70 text-xs">{loc}</p>
                  <p className="text-white/50 text-xs">Mã mộ: {selectedPlotId}</p>
                  {status === "occupied" && (
                    <Link
                      href={`/memorial/${selectedPlotId}`}
                      className="mt-2 text-xs font-semibold text-white/80 hover:text-white text-center"
                    >
                      Xem trang tưởng niệm →
                    </Link>
                  )}
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
