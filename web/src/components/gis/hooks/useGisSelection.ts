import { useState, useMemo, useCallback } from "react";
import type { Plot } from "../types";

export function useGisSelection(plots: Plot[]) {
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  const selectPlot = useCallback((id: string) => setSelectedPlotId(id), []);
  const deselectAll = useCallback(() => setSelectedPlotId(null), []);

  const selectedPlot = useMemo(
    () => plots.find((p) => p.id === selectedPlotId) ?? null,
    [plots, selectedPlotId]
  );

  return { selectedPlotId, selectedPlot, selectPlot, deselectAll };
}
