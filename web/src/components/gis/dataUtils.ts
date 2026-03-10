// ── Zone Layout Utilities ──
// Computes zone positions (offsetX/offsetY) for canvas rendering
// from backend ZoneDto data (which has no offset info)

import type { Zone, Plot, PlotStatus, FeeStatus } from "./types";
import { CELL_W, CELL_H, CELL_GAP, PATH_WIDTH, ZONE_PADDING } from "./types";
import type { ZoneDto, PlotDto } from "@/lib/api";

// ── Helpers ──

function zoneW(cols: number) {
  return cols * CELL_W + (cols - 1) * CELL_GAP;
}

function zoneH(rows: number) {
  return rows * CELL_H + (rows - 1) * CELL_GAP;
}

const LABEL_H = 50;

// ── Convert ZoneDto[] → Zone[] with computed offsets ──
// Layout: row 0 (zones[0], zones[1]) side by side
//         PATH (horizontal)
//         row 1 (zones[2], zones[3]) side by side
// If fewer zones, layout is linear

export function buildZones(dtos: ZoneDto[]): Zone[] {
  if (dtos.length === 0) return [];

  const topY = ZONE_PADDING + LABEL_H;

  if (dtos.length === 1) {
    return [{ ...dtos[0], offsetX: ZONE_PADDING, offsetY: topY }];
  }

  if (dtos.length === 2) {
    const aX = ZONE_PADDING;
    const bX = ZONE_PADDING + zoneW(dtos[0].cols) + PATH_WIDTH;
    return [
      { ...dtos[0], offsetX: aX, offsetY: topY },
      { ...dtos[1], offsetX: bX, offsetY: topY },
    ];
  }

  if (dtos.length === 3) {
    const aX = ZONE_PADDING;
    const bX = ZONE_PADDING + zoneW(dtos[0].cols) + PATH_WIDTH;
    const bottomY = topY + zoneH(Math.max(dtos[0].rows, dtos[1].rows)) + PATH_WIDTH;
    return [
      { ...dtos[0], offsetX: aX, offsetY: topY },
      { ...dtos[1], offsetX: bX, offsetY: topY },
      { ...dtos[2], offsetX: ZONE_PADDING, offsetY: bottomY },
    ];
  }

  // 4+ zones: 2×N grid layout
  const zones: Zone[] = [];
  let currentY = topY;

  for (let i = 0; i < dtos.length; i += 2) {
    const left = dtos[i];
    const right = dtos[i + 1];

    const leftX = ZONE_PADDING;
    zones.push({ ...left, offsetX: leftX, offsetY: currentY });

    if (right) {
      const rightX = ZONE_PADDING + zoneW(left.cols) + PATH_WIDTH;
      zones.push({ ...right, offsetX: rightX, offsetY: currentY });
      currentY += zoneH(Math.max(left.rows, right.rows)) + PATH_WIDTH;
    } else {
      currentY += zoneH(left.rows) + PATH_WIDTH;
    }
  }

  return zones;
}

// ── Compute total canvas dimensions from zones ──

export function computeCanvasSize(zones: Zone[]) {
  if (zones.length === 0) return { width: 800, height: 600 };

  let maxRight = 0;
  let maxBottom = 0;

  for (const z of zones) {
    const right = z.offsetX + zoneW(z.cols);
    const bottom = z.offsetY + zoneH(z.rows);
    if (right > maxRight) maxRight = right;
    if (bottom > maxBottom) maxBottom = bottom;
  }

  return {
    width: maxRight + ZONE_PADDING,
    height: maxBottom + ZONE_PADDING,
  };
}

// ── Convert PlotDto → Plot (FE type) ──

export function convertPlot(dto: PlotDto): Plot {
  const plot: Plot = {
    id: dto.id,
    zone: dto.zone,
    row: dto.row,
    col: dto.col,
    status: dto.status as PlotStatus,
    width: dto.width,
    height: dto.height,
  };

  if (dto.data) {
    plot.data = {};
    if (dto.data.deceased) {
      plot.data.deceased = {
        name: dto.data.deceased.name,
        birthDate: dto.data.deceased.birthDate,
        deathDate: dto.data.deceased.deathDate,
        quote: dto.data.deceased.quote ?? undefined,
      };
    }
    if (dto.data.nextOfKin) {
      plot.data.nextOfKin = {
        name: dto.data.nextOfKin.name,
        relationship: dto.data.nextOfKin.relationship,
        phone: dto.data.nextOfKin.phone,
        email: dto.data.nextOfKin.email,
      };
    }
    if (dto.data.maintenance) {
      plot.data.maintenance = {
        package: dto.data.maintenance.package,
        price: dto.data.maintenance.price,
        expiryDate: dto.data.maintenance.expiryDate,
        daysLeft: dto.data.maintenance.daysLeft,
        status: dto.data.maintenance.status as FeeStatus,
      };
    }
  }

  return plot;
}

// ── Convert PlotDto[] → Plot[] ──

export function convertPlots(dtos: PlotDto[]): Plot[] {
  return dtos.map(convertPlot);
}
