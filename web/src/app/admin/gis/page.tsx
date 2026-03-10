"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { GisMode, PlotStatus, UserRole, Plot, Zone } from "@/components/gis/types";
import { CELL_W, CELL_H, CELL_GAP } from "@/components/gis/types";
import { GisToolbar } from "@/components/gis/GisToolbar";
import { GisSearch } from "@/components/gis/GisSearch";
import { GisSidePanel } from "@/components/gis/GisSidePanel";
import { GisMinimap } from "@/components/gis/GisMinimap";
import { GisHeatmapLegend, GisLegend } from "@/components/gis/GisHeatmapLegend";
import { GisEditMode } from "@/components/gis/GisEditMode";
import { useGisZoom } from "@/components/gis/hooks/useGisZoom";
import { useGisSelection } from "@/components/gis/hooks/useGisSelection";
import { useGisSearch } from "@/components/gis/hooks/useGisSearch";
import { useGisEdit } from "@/components/gis/hooks/useGisEdit";
import { useGisKeyboard } from "@/components/gis/hooks/useGisKeyboard";
import { useAuth } from "@/lib/auth-context";
import { plotsApi, zonesApi } from "@/lib/api";
import { buildZones, computeCanvasSize, convertPlots } from "@/components/gis/dataUtils";

// Konva must be loaded client-side only (no SSR)
const GisCanvas = dynamic(() => import("@/components/gis/GisCanvas"), { ssr: false });

export default function GisPage() {
  const { user } = useAuth();
  const userRole: UserRole = (user?.role?.toLowerCase() as UserRole) || "staff";

  // ── API Data State ──
  const [zones, setZones] = useState<Zone[]>([]);
  const [basePlots, setBasePlots] = useState<Plot[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [canvasW, setCanvasW] = useState(800);
  const [canvasH, setCanvasH] = useState(600);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      setDataLoading(true);
      setDataError(null);
      try {
        const [zoneDtos, plotDtos] = await Promise.all([
          zonesApi.getAll(),
          plotsApi.getAll(),
        ]);
        const builtZones = buildZones(zoneDtos);
        const convertedPlots = convertPlots(plotDtos);
        const size = computeCanvasSize(builtZones);

        setZones(builtZones);
        setBasePlots(convertedPlots);
        setCanvasW(size.width);
        setCanvasH(size.height);
      } catch (err) {
        console.error("Failed to fetch GIS data:", err);
        setDataError("Không thể tải dữ liệu bản đồ. Kiểm tra kết nối backend.");
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, []);

  // Mode
  const [mode, setMode] = useState<GisMode>("view");

  // Filters
  const [filters, setFilters] = useState<{
    zone: string | null;
    status: PlotStatus | null;
    expiryMonth: string | null;
  }>({ zone: null, status: null, expiryMonth: null });

  // Toggles
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [minimapCollapsed, setMinimapCollapsed] = useState(false);

  // Canvas container size
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Edit hook
  const edit = useGisEdit();

  // Apply edit changes to base plots
  const plots = useMemo(() => edit.applyChanges(basePlots), [edit.applyChanges, basePlots]);

  // Filter plots
  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      if (filters.zone && p.zone !== filters.zone) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.expiryMonth === "expired") {
        if (!p.data?.maintenance || p.data.maintenance.daysLeft > 0) return false;
      }
      return true;
    });
  }, [plots, filters]);

  // Zoom & pan
  const { zoom, position, setPosition, setPositionAnimated, zoomIn, zoomOut, resetZoom, handleWheel, fitToView } = useGisZoom();

  // Auto-fit on first load (after data loaded)
  const hasFitted = useRef(false);
  useEffect(() => {
    if (hasFitted.current || dataLoading || zones.length === 0) return;
    if (containerSize.width > 100 && containerSize.height > 100) {
      fitToView(canvasW, canvasH, containerSize.width, containerSize.height);
      hasFitted.current = true;
    }
  }, [containerSize, fitToView, dataLoading, zones, canvasW, canvasH]);

  // Selection
  const { selectedPlotId, selectedPlot, selectPlot, deselectAll } = useGisSelection(filteredPlots);

  // Search
  const search = useGisSearch(filteredPlots);

  // Pan to a specific plot
  const panToPlot = useCallback(
    (plotId: string) => {
      const plot = filteredPlots.find((p) => p.id === plotId);
      if (!plot) return;
      const zone = zones.find((z) => z.id === plot.zone);
      if (!zone) return;
      const px = zone.offsetX + plot.col * (CELL_W + CELL_GAP) + CELL_W / 2;
      const py = zone.offsetY + plot.row * (CELL_H + CELL_GAP) + CELL_H / 2;
      setPositionAnimated({
        x: containerSize.width / 2 - px * zoom,
        y: containerSize.height / 2 - py * zoom,
      });
      selectPlot(plotId);
    },
    [filteredPlots, zones, zoom, containerSize, setPositionAnimated, selectPlot]
  );

  // Keyboard shortcuts
  useGisKeyboard({
    zoomIn,
    zoomOut,
    resetZoom,
    openSearch: search.openSearch,
    closeSearch: search.closeSearch,
    deselectAll,
    undo: edit.undo,
    redo: edit.redo,
    setMode,
    mode,
    userRole,
    searchOpen: search.isOpen,
  });

  const handlePlotSelect = useCallback(
    (plot: Plot | null) => {
      if (plot) selectPlot(plot.id);
      else deselectAll();
    },
    [selectPlot, deselectAll]
  );

  // ── Save edits to API ──
  const [saving, setSaving] = useState(false);

  const handleSaveEdits = useCallback(async () => {
    setSaving(true);
    try {
      const actions = edit.getActions();
      for (const action of actions) {
        switch (action.type) {
          case "add":
            await plotsApi.create({
              zone: action.plot.zone,
              row: action.plot.row,
              col: action.plot.col,
              status: action.plot.status,
            });
            break;
          case "delete":
            await plotsApi.delete(action.plot.id);
            break;
          case "move":
            await plotsApi.move(action.plotId, action.to.row, action.to.col);
            break;
          case "update":
            await plotsApi.update(action.plotId, {
              status: action.after.status,
            });
            break;
        }
      }
      // Refresh data from API
      const [plotDtos] = await Promise.all([plotsApi.getAll()]);
      setBasePlots(convertPlots(plotDtos));
      edit.clearAll();
      alert("Đã lưu thay đổi thành công!");
    } catch (err) {
      console.error("Failed to save edits:", err);
      alert("Lỗi khi lưu thay đổi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }, [edit]);

  // ── Loading / Error states ──
  if (dataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#2D4A3E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-white/80 text-sm font-medium">Đang tải bản đồ...</span>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#2D4A3E]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-white text-sm">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Map area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas container — no top toolbar, everything is overlay */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#2D4A3E]">
          {/* Konva canvas */}
          <GisCanvas
            plots={filteredPlots}
            zones={zones}
            width={containerSize.width}
            height={containerSize.height}
            zoom={zoom}
            position={position}
            selectedPlotId={selectedPlotId}
            mode={mode}
            showHeatmap={showHeatmap}
            onPlotSelect={handlePlotSelect}
            onWheel={handleWheel}
            onDragEnd={setPosition}
          />

          {/* Search + Filter pills overlay (top-left) */}
          <GisSearch
            isOpen={true}
            query={search.query}
            results={search.results}
            filters={filters}
            onQueryChange={search.setQuery}
            onSelect={panToPlot}
            onClose={search.closeSearch}
            onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
          />

          {/* Floating toolbar dock (bottom-center) */}
          <GisToolbar
            zoom={zoom}
            mode={mode}
            userRole={userRole}
            showHeatmap={showHeatmap}
            showMinimap={showMinimap}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            onModeChange={setMode}
            onToggleHeatmap={() => setShowHeatmap((v) => !v)}
            onToggleMinimap={() => setShowMinimap((v) => !v)}
          />

          {/* Edit mode overlays */}
          <GisEditMode
            active={mode === "edit" && userRole === "admin"}
            canUndo={edit.canUndo}
            canRedo={edit.canRedo}
            unsavedCount={edit.unsavedCount}
            onUndo={edit.undo}
            onRedo={edit.redo}
            onSave={handleSaveEdits}
            onCancel={edit.clearAll}
          />

          {/* Saving overlay */}
          {saving && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-lg">
                <div className="w-5 h-5 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Đang lưu thay đổi...</span>
              </div>
            </div>
          )}

          {/* Heatmap legend */}
          <GisHeatmapLegend visible={showHeatmap} />

          {/* Collapsible status legend */}
          {!showHeatmap && <GisLegend />}

          {/* Minimap */}
          {showMinimap && (
            <GisMinimap
              plots={filteredPlots}
              zones={zones}
              totalWidth={canvasW}
              totalHeight={canvasH}
              viewportX={position.x}
              viewportY={position.y}
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
              zoom={zoom}
              collapsed={minimapCollapsed}
              onPanTo={(x, y) => setPosition({ x, y })}
              onToggle={() => setMinimapCollapsed((v) => !v)}
            />
          )}
        </div>
      </div>

      {/* Side panel */}
      <GisSidePanel
        plot={selectedPlot}
        isOpen={!!selectedPlot}
        userRole={userRole}
        onClose={deselectAll}
        onLocate={panToPlot}
      />
    </div>
  );
}
