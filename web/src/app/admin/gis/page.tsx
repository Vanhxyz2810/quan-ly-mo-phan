"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { GisMode, PlotStatus, UserRole, Plot } from "@/components/gis/types";
import { CELL_W, CELL_H, CELL_GAP } from "@/components/gis/types";
import { plots as basePlots, zones, canvasWidth, canvasHeight } from "@/components/gis/mockData";
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

// Konva must be loaded client-side only (no SSR)
const GisCanvas = dynamic(() => import("@/components/gis/GisCanvas"), { ssr: false });

export default function GisPage() {
  // Role — hardcoded as admin for now
  const userRole: UserRole = "admin";

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
  const plots = useMemo(() => edit.applyChanges(basePlots), [edit.applyChanges]);

  // Filter plots
  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      if (filters.zone && p.zone !== filters.zone) return false;
      if (filters.status && p.status !== filters.status) return false;
      // Service expired filter
      if (filters.expiryMonth === "expired") {
        if (!p.data?.maintenance || p.data.maintenance.daysLeft > 0) return false;
      }
      return true;
    });
  }, [plots, filters]);

  // Zoom & pan
  const { zoom, position, setPosition, setPositionAnimated, zoomIn, zoomOut, resetZoom, handleWheel, fitToView } = useGisZoom();

  // Auto-fit on first load
  const hasFitted = useRef(false);
  useEffect(() => {
    if (hasFitted.current) return;
    if (containerSize.width > 100 && containerSize.height > 100) {
      fitToView(canvasWidth, canvasHeight, containerSize.width, containerSize.height);
      hasFitted.current = true;
    }
  }, [containerSize, fitToView]);

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
    [filteredPlots, zoom, containerSize, setPosition, selectPlot]
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
            onSave={() => {
              alert("Đã lưu thay đổi (mock)");
              edit.clearAll();
            }}
            onCancel={edit.clearAll}
          />

          {/* Heatmap legend */}
          <GisHeatmapLegend visible={showHeatmap} />

          {/* Collapsible status legend */}
          {!showHeatmap && <GisLegend />}

          {/* Minimap */}
          {showMinimap && (
            <GisMinimap
              plots={filteredPlots}
              zones={zones}
              totalWidth={canvasWidth}
              totalHeight={canvasHeight}
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
