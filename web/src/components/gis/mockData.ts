import {
  Plot,
  Zone,
  PlotStatus,
  FeeStatus,
  CELL_W,
  CELL_H,
  CELL_GAP,
  PATH_WIDTH,
  ZONE_PADDING,
} from "./types";

// Deterministic pseudo-random based on seed
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

const SURNAMES = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ",
  "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý",
];
const MIDDLE = ["Văn", "Thị", "Đức", "Minh", "Thanh", "Hồng", "Quốc", "Ngọc"];
const FIRST = [
  "An", "Bình", "Cường", "Dũng", "Hà", "Hải", "Hương", "Lan", "Long", "Mai",
  "Nam", "Phúc", "Quân", "Sơn", "Tâm", "Thảo", "Tùng", "Uyên", "Vinh", "Yến",
];
const RELATIONSHIPS = ["Con trai", "Con gái", "Vợ", "Chồng", "Cháu", "Em"];
const PACKAGES = ["1 năm", "5 năm", "Trọn đời"];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function genName(seed: number) {
  return `${pick(SURNAMES, seed)} ${pick(MIDDLE, seed + 1)} ${pick(FIRST, seed + 2)}`;
}

function genDate(yearMin: number, yearMax: number, seed: number) {
  const y = yearMin + Math.floor(seededRandom(seed) * (yearMax - yearMin));
  const m = 1 + Math.floor(seededRandom(seed + 1) * 12);
  const d = 1 + Math.floor(seededRandom(seed + 2) * 28);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function genPhone(seed: number) {
  let p = "08";
  for (let i = 0; i < 8; i++) p += Math.floor(seededRandom(seed + i) * 10);
  return p;
}

// Helper: tính chiều rộng pixel của 1 zone
function zoneW(cols: number) {
  return cols * CELL_W + (cols - 1) * CELL_GAP;
}
function zoneH(rows: number) {
  return rows * CELL_H + (rows - 1) * CELL_GAP;
}

// --- Balanced Zone sizes ---
// A: 5 hàng x 6 cột = 30 plots
// B: 5 hàng x 6 cột = 30 plots (balanced with A)
// C: 6 hàng x 8 cột = 48 plots
// D: 5 hàng x 8 cột = 40 plots
// Tổng: 148 plots — balanced layout

const ZONE_A_ROWS = 5;
const ZONE_A_COLS = 6;
const ZONE_B_ROWS = 5;
const ZONE_B_COLS = 6;
const ZONE_C_ROWS = 6;
const ZONE_C_COLS = 8;
const ZONE_D_ROWS = 5;
const ZONE_D_COLS = 8;

const LABEL_H = 50; // space for zone label above

// Layout: A | PATH | B  (top row)
//         --- PATH ---
//         C | PATH | D  (bottom row)

const topY = ZONE_PADDING + LABEL_H;
const aX = ZONE_PADDING;
const bX = ZONE_PADDING + zoneW(ZONE_A_COLS) + PATH_WIDTH;

const bottomY = topY + zoneH(Math.max(ZONE_A_ROWS, ZONE_B_ROWS)) + PATH_WIDTH;
const cX = ZONE_PADDING;
const dX = ZONE_PADDING + zoneW(ZONE_C_COLS) + PATH_WIDTH;

export const zones: Zone[] = [
  {
    id: "A",
    name: "A",
    label: "KHU A",
    rows: ZONE_A_ROWS,
    cols: ZONE_A_COLS,
    offsetX: aX,
    offsetY: topY,
    color: "#1B4332",
  },
  {
    id: "B",
    name: "B",
    label: "KHU B",
    rows: ZONE_B_ROWS,
    cols: ZONE_B_COLS,
    offsetX: bX,
    offsetY: topY,
    color: "#14532D",
  },
  {
    id: "C",
    name: "C",
    label: "KHU C",
    rows: ZONE_C_ROWS,
    cols: ZONE_C_COLS,
    offsetX: cX,
    offsetY: bottomY,
    color: "#1A3C34",
  },
  {
    id: "D",
    name: "D",
    label: "KHU D",
    rows: ZONE_D_ROWS,
    cols: ZONE_D_COLS,
    offsetX: dX,
    offsetY: bottomY,
    color: "#1B4332",
  },
];

// --- Generate plots ---
function generatePlots(): Plot[] {
  const result: Plot[] = [];
  let idx = 0;

  for (const zone of zones) {
    for (let r = 0; r < zone.rows; r++) {
      for (let c = 0; c < zone.cols; c++) {
        idx++;
        const rand = seededRandom(idx);
        let status: PlotStatus;
        if (rand < 0.55) status = "occupied";
        else if (rand < 0.8) status = "available";
        else status = "reserved";

        const plot: Plot = {
          id: `${zone.name}-${String(r * zone.cols + c + 1).padStart(2, "0")}`,
          zone: zone.name,
          row: r,
          col: c,
          status,
          width: CELL_W,
          height: CELL_H,
        };

        if (status === "occupied") {
          const daysLeft = Math.floor(seededRandom(idx + 100) * 400) - 30;
          let feeStatus: FeeStatus = "active";
          if (daysLeft <= 0) feeStatus = "expired";
          else if (daysLeft <= 30) feeStatus = "expiring";

          plot.data = {
            deceased: {
              name: genName(idx),
              birthDate: genDate(1930, 1970, idx + 10),
              deathDate: genDate(2010, 2025, idx + 20),
            },
            nextOfKin: {
              name: genName(idx + 50),
              relationship: pick(RELATIONSHIPS, idx + 60),
              phone: genPhone(idx + 70),
              email: `${pick(FIRST, idx + 80).toLowerCase()}@gmail.com`,
            },
            maintenance: {
              package: pick(PACKAGES, idx + 90),
              price: [2_000_000, 8_000_000, 30_000_000][
                Math.floor(seededRandom(idx + 91) * 3)
              ],
              expiryDate: genDate(2025, 2028, idx + 95),
              daysLeft,
              status: feeStatus,
            },
          };
        }

        result.push(plot);
      }
    }
  }

  return result;
}

export const plots: Plot[] = generatePlots();

// Total canvas content bounds
const topRowW = zoneW(ZONE_A_COLS) + PATH_WIDTH + zoneW(ZONE_B_COLS);
const bottomRowW = zoneW(ZONE_C_COLS) + PATH_WIDTH + zoneW(ZONE_D_COLS);

export const canvasWidth = ZONE_PADDING * 2 + Math.max(topRowW, bottomRowW);

export const canvasHeight =
  ZONE_PADDING * 2 +
  LABEL_H +
  zoneH(Math.max(ZONE_A_ROWS, ZONE_B_ROWS)) +
  PATH_WIDTH +
  zoneH(Math.max(ZONE_C_ROWS, ZONE_D_ROWS));
