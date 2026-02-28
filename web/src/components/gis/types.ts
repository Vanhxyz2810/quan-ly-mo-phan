export type PlotStatus = "occupied" | "available" | "reserved" | "selected";
export type FeeStatus = "active" | "expiring" | "expired";
export type GisMode = "view" | "edit" | "measure";
export type UserRole = "admin" | "staff" | "customer";

export interface DeceasedInfo {
  name: string;
  birthDate: string;
  deathDate: string;
  quote?: string;
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface MaintenanceInfo {
  package: string;
  price: number;
  expiryDate: string;
  daysLeft: number;
  status: FeeStatus;
}

export interface PlotData {
  deceased?: DeceasedInfo;
  nextOfKin?: NextOfKin;
  maintenance?: MaintenanceInfo;
}

export interface Plot {
  id: string;
  zone: string;
  row: number;
  col: number;
  status: PlotStatus;
  width: number;
  height: number;
  data?: PlotData;
}

export interface Zone {
  id: string;
  name: string;
  label: string;
  rows: number;
  cols: number;
  offsetX: number;
  offsetY: number;
  color: string;
}

export interface GisState {
  mode: GisMode;
  zoom: number;
  panX: number;
  panY: number;
  selectedPlotId: string | null;
  searchQuery: string;
  activeLayer: "schema" | "satellite";
  showHeatmap: boolean;
  showMinimap: boolean;
  filters: {
    zone: string | null;
    status: PlotStatus | null;
    expiryMonth: string | null;
  };
}

export type EditAction =
  | { type: "add"; plot: Plot }
  | { type: "delete"; plot: Plot }
  | { type: "move"; plotId: string; from: { row: number; col: number }; to: { row: number; col: number } }
  | { type: "update"; plotId: string; before: Partial<Plot>; after: Partial<Plot> };

export interface Measurement {
  id: string;
  kind: "distance" | "area";
  points: { x: number; y: number }[];
  result: number;
}

// Canvas constants — kích thước lớn hơn, dễ nhìn
export const CELL_W = 110;
export const CELL_H = 70;
export const CELL_GAP = 10;
export const PATH_WIDTH = 200;
export const ZONE_PADDING = 100;
export const CELL_SIZE_METERS = 2.5;
