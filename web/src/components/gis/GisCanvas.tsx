"use client";

import React, { useMemo, useRef } from "react";
import { Stage, Layer, Rect, Text, Line, Circle, Group } from "react-konva";
import { PlotRect } from "./PlotRect";
import type { Plot, Zone, GisMode } from "./types";
import { CELL_W, CELL_H, CELL_GAP, PATH_WIDTH } from "./types";

interface Props {
  plots: Plot[];
  zones: Zone[];
  width: number;
  height: number;
  zoom: number;
  position: { x: number; y: number };
  selectedPlotId: string | null;
  mode: GisMode;
  showHeatmap: boolean;
  onPlotSelect: (plot: Plot) => void;
  onWheel: (e: any) => void;
  onDragEnd: (pos: { x: number; y: number }) => void;
  onEmptyCellClick?: (zone: string, row: number, col: number) => void;
}

function plotPosition(plot: Plot, zone: Zone) {
  return {
    x: zone.offsetX + plot.col * (CELL_W + CELL_GAP),
    y: zone.offsetY + plot.row * (CELL_H + CELL_GAP),
  };
}

function zoneW(cols: number) {
  return cols * CELL_W + (cols - 1) * CELL_GAP;
}
function zoneH(rows: number) {
  return rows * CELL_H + (rows - 1) * CELL_GAP;
}

/* ── Seeded RNG ── */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s & 0x7fffffff) / 2147483647;
  };
}

/* ── Vector Tree (top-down canopy) ── */
function TreeShape({ x, y, size, rng }: { x: number; y: number; size: number; rng: () => number }) {
  const r = size / 2;
  const darkGreen = `hsl(${145 + rng() * 15}, ${40 + rng() * 15}%, ${18 + rng() * 8}%)`;
  const midGreen = `hsl(${148 + rng() * 12}, ${38 + rng() * 15}%, ${25 + rng() * 8}%)`;
  const lightSpot = `hsl(${150 + rng() * 10}, ${35 + rng() * 10}%, ${35 + rng() * 8}%)`;
  return (
    <Group x={x} y={y}>
      {/* Shadow */}
      <Circle x={3} y={4} radius={r} fill="#0D1F0D" opacity={0.2} />
      {/* Main canopy */}
      <Circle radius={r} fill={darkGreen} opacity={0.75} />
      {/* Mid tone ring */}
      <Circle radius={r * 0.72} fill={midGreen} opacity={0.5} />
      {/* Light highlight */}
      <Circle x={-r * 0.2} y={-r * 0.2} radius={r * 0.35} fill={lightSpot} opacity={0.4} />
      {/* Trunk dot (center) */}
      <Circle radius={r * 0.12} fill="#3D2B1F" opacity={0.5} />
    </Group>
  );
}

/* ── Vector Bush (smaller, denser) ── */
function BushShape({ x, y, size, rng }: { x: number; y: number; size: number; rng: () => number }) {
  const r = size / 2;
  const green1 = `hsl(${140 + rng() * 20}, ${35 + rng() * 15}%, ${22 + rng() * 10}%)`;
  const green2 = `hsl(${145 + rng() * 15}, ${40 + rng() * 10}%, ${30 + rng() * 8}%)`;
  return (
    <Group x={x} y={y}>
      <Circle x={2} y={3} radius={r} fill="#0D1F0D" opacity={0.15} />
      <Circle radius={r} fill={green1} opacity={0.6} />
      {/* Small cluster bumps */}
      <Circle x={-r * 0.3} y={-r * 0.2} radius={r * 0.45} fill={green2} opacity={0.4} />
      <Circle x={r * 0.25} y={r * 0.15} radius={r * 0.35} fill={green2} opacity={0.35} />
    </Group>
  );
}

/* ── Generate decoration positions ── */
function generateDecorations(zones: Zone[]) {
  const items: { type: "tree" | "bush"; x: number; y: number; size: number; seed: number }[] = [];
  const rng = makeRng(42);

  const topZones = zones.filter(z => z.id === "A" || z.id === "B");
  const bottomZones = zones.filter(z => z.id === "C" || z.id === "D");

  // Horizontal walkway edges
  if (topZones.length > 0 && bottomZones.length > 0) {
    const roadY = topZones[0].offsetY + zoneH(topZones[0].rows);
    const roadBottom = bottomZones[0].offsetY;
    const leftX = Math.min(...zones.map(z => z.offsetX)) - 50;
    const rightX = Math.max(...zones.map(z => z.offsetX + zoneW(z.cols))) + 50;

    for (let x = leftX; x < rightX; x += 45 + rng() * 35) {
      // Above road (below top zones)
      if (rng() > 0.3) {
        items.push({
          type: rng() > 0.45 ? "tree" : "bush",
          x, y: roadY + 8 + rng() * 14,
          size: 22 + rng() * 14, seed: Math.floor(rng() * 10000),
        });
      }
      // Below road (above bottom zones)
      if (rng() > 0.3) {
        items.push({
          type: rng() > 0.45 ? "tree" : "bush",
          x, y: roadBottom - 8 - rng() * 14,
          size: 22 + rng() * 14, seed: Math.floor(rng() * 10000),
        });
      }
    }
  }

  // Vertical walkway edges
  const processVerticalGap = (leftZones: Zone[], rightZones: Zone[]) => {
    if (leftZones.length === 0 || rightZones.length === 0) return;
    const left = leftZones.sort((a, b) => a.offsetX - b.offsetX)[0];
    const right = rightZones.sort((a, b) => a.offsetX - b.offsetX)[0];
    const gapLeft = left.offsetX + zoneW(left.cols);
    const gapRight = right.offsetX;
    const top = Math.min(left.offsetY, right.offsetY) - 30;
    const bot = Math.max(left.offsetY + zoneH(left.rows), right.offsetY + zoneH(right.rows)) + 30;

    for (let y = top; y < bot; y += 40 + rng() * 30) {
      if (rng() > 0.35) {
        items.push({
          type: rng() > 0.5 ? "tree" : "bush",
          x: gapLeft + 8 + rng() * 12, y,
          size: 20 + rng() * 12, seed: Math.floor(rng() * 10000),
        });
      }
      if (rng() > 0.35) {
        items.push({
          type: rng() > 0.5 ? "tree" : "bush",
          x: gapRight - 8 - rng() * 12, y,
          size: 20 + rng() * 12, seed: Math.floor(rng() * 10000),
        });
      }
    }
  };

  // Top row gap (A-B)
  const aZone = zones.filter(z => z.id === "A");
  const bZone = zones.filter(z => z.id === "B");
  processVerticalGap(aZone, bZone);

  // Bottom row gap (C-D)
  const cZone = zones.filter(z => z.id === "C");
  const dZone = zones.filter(z => z.id === "D");
  processVerticalGap(cZone, dZone);

  // Outer border trees (around the whole cemetery)
  const allLeft = Math.min(...zones.map(z => z.offsetX)) - 60;
  const allRight = Math.max(...zones.map(z => z.offsetX + zoneW(z.cols))) + 60;
  const allTop = Math.min(...zones.map(z => z.offsetY)) - 60;
  const allBottom = Math.max(...zones.map(z => z.offsetY + zoneH(z.rows))) + 60;

  // Top & bottom borders
  for (let x = allLeft; x < allRight; x += 50 + rng() * 40) {
    if (rng() > 0.3) items.push({ type: "tree", x, y: allTop - 10 - rng() * 20, size: 26 + rng() * 16, seed: Math.floor(rng() * 10000) });
    if (rng() > 0.3) items.push({ type: "tree", x, y: allBottom + 10 + rng() * 20, size: 26 + rng() * 16, seed: Math.floor(rng() * 10000) });
  }
  // Left & right borders
  for (let y = allTop; y < allBottom; y += 50 + rng() * 40) {
    if (rng() > 0.3) items.push({ type: "tree", x: allLeft - 10 - rng() * 20, y, size: 26 + rng() * 16, seed: Math.floor(rng() * 10000) });
    if (rng() > 0.3) items.push({ type: "tree", x: allRight + 10 + rng() * 20, y, size: 26 + rng() * 16, seed: Math.floor(rng() * 10000) });
  }

  return items;
}

/* ── Realistic Cemetery Gate (top-down architectural view) ── */
function GateDecoration({ x, y, roadH }: { x: number; y: number; roadH: number }) {
  const gateW = 70;       // total gate width (matching road)
  const pillarW = 14;     // pillar thickness
  const pillarD = roadH;  // pillar depth matches road height
  const openingW = gateW - pillarW * 2;
  const halfW = gateW / 2;

  return (
    <Group x={x} y={y}>
      {/* ── Ground shadow ── */}
      <Rect x={-halfW - 2} y={-pillarD / 2 + 3} width={gateW + 4} height={pillarD + 4} fill="#111" opacity={0.1} cornerRadius={3} />

      {/* ── Left pillar ── */}
      {/* Base (wide stone) */}
      <Rect x={-halfW - 2} y={-pillarD / 2 - 2} width={pillarW + 4} height={pillarD + 4} fill="#7A6E5D" cornerRadius={2} />
      {/* Pillar shaft */}
      <Rect x={-halfW} y={-pillarD / 2} width={pillarW} height={pillarD} fill="#9C8E7A" cornerRadius={1} />
      {/* Stone texture lines */}
      <Line points={[-halfW + 2, -pillarD / 2 + pillarD * 0.25, -halfW + pillarW - 2, -pillarD / 2 + pillarD * 0.25]} stroke="#8A7D6A" strokeWidth={0.5} opacity={0.5} />
      <Line points={[-halfW + 2, -pillarD / 2 + pillarD * 0.5, -halfW + pillarW - 2, -pillarD / 2 + pillarD * 0.5]} stroke="#8A7D6A" strokeWidth={0.5} opacity={0.5} />
      <Line points={[-halfW + 2, -pillarD / 2 + pillarD * 0.75, -halfW + pillarW - 2, -pillarD / 2 + pillarD * 0.75]} stroke="#8A7D6A" strokeWidth={0.5} opacity={0.5} />
      {/* Pillar cap (decorative top) */}
      <Rect x={-halfW - 1} y={-pillarD / 2 - 4} width={pillarW + 2} height={3} fill="#B0A393" cornerRadius={1} />
      {/* Pillar finial (point/sphere on top) */}
      <Circle x={-halfW + pillarW / 2} y={-pillarD / 2 - 7} radius={3} fill="#A89880" />
      <Circle x={-halfW + pillarW / 2} y={-pillarD / 2 - 7} radius={1.5} fill="#C0B5A5" opacity={0.6} />

      {/* ── Right pillar ── */}
      <Rect x={halfW - pillarW - 2} y={-pillarD / 2 - 2} width={pillarW + 4} height={pillarD + 4} fill="#7A6E5D" cornerRadius={2} />
      <Rect x={halfW - pillarW} y={-pillarD / 2} width={pillarW} height={pillarD} fill="#9C8E7A" cornerRadius={1} />
      <Line points={[halfW - pillarW + 2, -pillarD / 2 + pillarD * 0.25, halfW - 2, -pillarD / 2 + pillarD * 0.25]} stroke="#8A7D6A" strokeWidth={0.5} opacity={0.5} />
      <Line points={[halfW - pillarW + 2, -pillarD / 2 + pillarD * 0.5, halfW - 2, -pillarD / 2 + pillarD * 0.5]} stroke="#8A7D6A" strokeWidth={0.5} opacity={0.5} />
      <Line points={[halfW - pillarW + 2, -pillarD / 2 + pillarD * 0.75, halfW - 2, -pillarD / 2 + pillarD * 0.75]} stroke="#8A7D6A" strokeWidth={0.5} opacity={0.5} />
      <Rect x={halfW - pillarW - 1} y={-pillarD / 2 - 4} width={pillarW + 2} height={3} fill="#B0A393" cornerRadius={1} />
      <Circle x={halfW - pillarW / 2} y={-pillarD / 2 - 7} radius={3} fill="#A89880" />
      <Circle x={halfW - pillarW / 2} y={-pillarD / 2 - 7} radius={1.5} fill="#C0B5A5" opacity={0.6} />

      {/* ── Iron gate bars (vertical) ── */}
      {Array.from({ length: Math.floor(openingW / 5) }).map((_, i) => {
        const barX = -halfW + pillarW + 2 + i * 5;
        return (
          <Line
            key={`bar-${i}`}
            points={[barX, -pillarD / 2 + 2, barX, pillarD / 2 - 2]}
            stroke="#4A4A4A" strokeWidth={1} opacity={0.45}
          />
        );
      })}
      {/* Horizontal iron rails */}
      <Line points={[-halfW + pillarW, -pillarD / 2 + pillarD * 0.25, halfW - pillarW, -pillarD / 2 + pillarD * 0.25]} stroke="#4A4A4A" strokeWidth={1.2} opacity={0.5} />
      <Line points={[-halfW + pillarW, -pillarD / 2 + pillarD * 0.75, halfW - pillarW, -pillarD / 2 + pillarD * 0.75]} stroke="#4A4A4A" strokeWidth={1.2} opacity={0.5} />

      {/* ── Arch overhead beam ── */}
      <Rect x={-halfW - 1} y={-pillarD / 2 - 12} width={gateW + 2} height={5} fill="#8C7E6E" cornerRadius={2} />
      <Rect x={-halfW} y={-pillarD / 2 - 11} width={gateW} height={3} fill="#A59888" cornerRadius={1} />

      {/* ── Cross (centered on arch) ── */}
      <Rect x={-1.2} y={-pillarD / 2 - 22} width={2.4} height={12} fill="#9E8E7E" cornerRadius={1} />
      <Rect x={-5} y={-pillarD / 2 - 19} width={10} height={2.2} fill="#9E8E7E" cornerRadius={1} />
      {/* Cross highlight */}
      <Rect x={-0.5} y={-pillarD / 2 - 21} width={1} height={10} fill="#B8AA9A" opacity={0.4} cornerRadius={0.5} />

      {/* ── Cemetery name plate ── */}
      <Rect x={-22} y={-pillarD / 2 - 12} width={44} height={5} fill="#6B5E4E" cornerRadius={1} />
      <Text
        x={-22} y={-pillarD / 2 - 12} width={44} height={5}
        text="NGHĨA TRANG" fontSize={3.5}
        fontFamily="Georgia, serif" fontStyle="bold"
        fill="#D4C8B8" align="center" verticalAlign="middle"
        letterSpacing={1}
      />

      {/* ── Outer fence extensions ── */}
      {/* Top fence (extending up) */}
      <Line points={[-halfW - 2, -pillarD / 2, -halfW - 40, -pillarD / 2]} stroke="#5A5A5A" strokeWidth={1.5} opacity={0.35} />
      <Line points={[halfW + 2, -pillarD / 2, halfW + 40, -pillarD / 2]} stroke="#5A5A5A" strokeWidth={1.5} opacity={0.35} />
      {/* Bottom fence */}
      <Line points={[-halfW - 2, pillarD / 2, -halfW - 40, pillarD / 2]} stroke="#5A5A5A" strokeWidth={1.5} opacity={0.35} />
      <Line points={[halfW + 2, pillarD / 2, halfW + 40, pillarD / 2]} stroke="#5A5A5A" strokeWidth={1.5} opacity={0.35} />
      {/* Fence vertical bars (extensions) */}
      {[-30, -20, -10].map(offset => (
        <React.Fragment key={`fl-${offset}`}>
          <Line points={[-halfW + offset, -pillarD / 2, -halfW + offset, pillarD / 2]} stroke="#5A5A5A" strokeWidth={0.8} opacity={0.25} />
          <Line points={[halfW - offset, -pillarD / 2, halfW - offset, pillarD / 2]} stroke="#5A5A5A" strokeWidth={0.8} opacity={0.25} />
        </React.Fragment>
      ))}
    </Group>
  );
}

function GisCanvasInner({
  plots,
  zones,
  width,
  height,
  zoom,
  position,
  selectedPlotId,
  mode,
  showHeatmap,
  onPlotSelect,
  onWheel,
  onDragEnd,
  onEmptyCellClick,
}: Props) {
  const stageRef = useRef<any>(null);

  const plotsByZone = useMemo(() => {
    const map: Record<string, Plot[]> = {};
    for (const z of zones) map[z.id] = [];
    for (const p of plots) {
      if (map[p.zone]) map[p.zone].push(p);
    }
    return map;
  }, [plots, zones]);

  const decorations = useMemo(() => generateDecorations(zones), [zones]);

  const BG = 4000;
  const showZoneLabels = zoom >= 0.5;

  const topZones = zones.filter(z => z.id === "A" || z.id === "B");
  const bottomZones = zones.filter(z => z.id === "C" || z.id === "D");

  // Walkway geometry
  const allZoneLeft = Math.min(...zones.map(z => z.offsetX));
  const allZoneRight = Math.max(...zones.map(z => z.offsetX + zoneW(z.cols)));

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={zoom}
      scaleY={zoom}
      x={position.x}
      y={position.y}
      draggable
      onWheel={onWheel}
      onDragEnd={(e) => onDragEnd({ x: e.target.x(), y: e.target.y() })}
      onClick={(e) => {
        if (e.target === e.target.getStage()) {
          onPlotSelect(null as unknown as Plot);
        }
      }}
    >
      {/* ══════ BACKGROUND ══════ */}
      <Layer listening={false}>
        <Rect x={-500} y={-500} width={BG} height={BG} fill="#2D4A3E" />
        {Array.from({ length: 300 }).map((_, i) => (
          <Circle
            key={`g${i}`}
            x={((i * 173 + 37) % (BG - 200)) - 300}
            y={((i * 131 + 19) % (BG - 200)) - 300}
            radius={i % 4 === 0 ? 2.5 : 1.5}
            fill={i % 3 === 0 ? "#3A5E4A" : "#264639"}
            opacity={0.25}
          />
        ))}
      </Layer>

      {/* ══════ WALKWAYS ══════ */}
      <Layer listening={false}>
        {/* Horizontal main road */}
        {topZones.length > 0 && bottomZones.length > 0 && (() => {
          const roadTop = topZones[0].offsetY + zoneH(topZones[0].rows);
          const roadBottom = bottomZones[0].offsetY;
          const roadY = roadTop + 55;
          const roadH = roadBottom - roadTop - 110;
          const leftEdge = allZoneLeft - 80;
          const rightEdge = allZoneRight + 80;
          const roadW = rightEdge - leftEdge;
          return (
            <>
              <Rect x={leftEdge} y={roadY + 3} width={roadW} height={roadH} fill="#1A2E1A" opacity={0.12} cornerRadius={6} />
              <Rect x={leftEdge} y={roadY} width={roadW} height={roadH} fill="#C5C0B6" cornerRadius={6} />
              {/* Stone pattern */}
              <Rect x={leftEdge} y={roadY + roadH * 0.3} width={roadW} height={1} fill="#B0ACA3" opacity={0.4} />
              <Rect x={leftEdge} y={roadY + roadH * 0.7} width={roadW} height={1} fill="#B0ACA3" opacity={0.4} />
              {/* Edges */}
              <Rect x={leftEdge} y={roadY} width={roadW} height={2} fill="#9E9990" opacity={0.4} />
              <Rect x={leftEdge} y={roadY + roadH - 2} width={roadW} height={2} fill="#9E9990" opacity={0.4} />
              {/* Center dashes */}
              <Line
                points={[leftEdge, roadY + roadH / 2, rightEdge, roadY + roadH / 2]}
                stroke="#D8D4CC" strokeWidth={1.5} dash={[14, 10]} opacity={0.35}
              />
              <Text
                x={leftEdge + roadW / 2 - 60}
                y={roadY + roadH / 2 - 5}
                text="ĐƯỜNG ĐI CHÍNH"
                fontSize={9} fill="#7A756B" letterSpacing={3}
              />
            </>
          );
        })()}

        {/* Vertical roads */}
        {[
          { left: topZones.filter(z => z.id === "A"), right: topZones.filter(z => z.id === "B") },
          { left: bottomZones.filter(z => z.id === "C"), right: bottomZones.filter(z => z.id === "D") },
        ].map(({ left, right }, ri) => {
          if (left.length === 0 || right.length === 0) return null;
          const lz = left[0];
          const rz = right[0];
          const gapLeft = lz.offsetX + zoneW(lz.cols);
          const gapRight = rz.offsetX;
          const roadX = gapLeft + 55;
          const roadW = gapRight - gapLeft - 110;
          const top = Math.min(lz.offsetY, rz.offsetY) - 50;
          const bot = Math.max(lz.offsetY + zoneH(lz.rows), rz.offsetY + zoneH(rz.rows)) + 50;
          return (
            <React.Fragment key={`vroad-${ri}`}>
              <Rect x={roadX + 3} y={top} width={roadW} height={bot - top} fill="#1A2E1A" opacity={0.12} cornerRadius={6} />
              <Rect x={roadX} y={top} width={roadW} height={bot - top} fill="#C5C0B6" cornerRadius={6} />
              <Rect x={roadX + roadW * 0.3} y={top} width={1} height={bot - top} fill="#B0ACA3" opacity={0.4} />
              <Rect x={roadX + roadW * 0.7} y={top} width={1} height={bot - top} fill="#B0ACA3" opacity={0.4} />
              <Rect x={roadX} y={top} width={2} height={bot - top} fill="#9E9990" opacity={0.4} />
              <Rect x={roadX + roadW - 2} y={top} width={2} height={bot - top} fill="#9E9990" opacity={0.4} />
              <Line
                points={[roadX + roadW / 2, top, roadX + roadW / 2, bot]}
                stroke="#D8D4CC" strokeWidth={1.5} dash={[14, 10]} opacity={0.35}
              />
            </React.Fragment>
          );
        })}

        {/* Gate decoration */}
        {topZones.length > 0 && bottomZones.length > 0 && (() => {
          const roadTop = topZones[0].offsetY + zoneH(topZones[0].rows);
          const roadBottom = bottomZones[0].offsetY;
          const roadCenterY = (roadTop + roadBottom) / 2;
          const roadH = roadBottom - roadTop - 110;
          return <GateDecoration x={allZoneLeft - 50} y={roadCenterY} roadH={roadH} />;
        })()}
      </Layer>

      {/* ══════ TREE & BUSH DECORATIONS (vector) ══════ */}
      <Layer listening={false}>
        {decorations.map((d, i) => {
          const itemRng = makeRng(d.seed);
          return d.type === "tree" ? (
            <TreeShape key={`d${i}`} x={d.x} y={d.y} size={d.size} rng={itemRng} />
          ) : (
            <BushShape key={`d${i}`} x={d.x} y={d.y} size={d.size} rng={itemRng} />
          );
        })}
      </Layer>

      {/* ══════ ZONES ══════ */}
      <Layer listening={false}>
        {zones.map((z) => {
          const w = zoneW(z.cols);
          const h = zoneH(z.rows);
          const pad = 20;
          return (
            <React.Fragment key={z.id}>
              {/* Zone shadow */}
              <Rect
                x={z.offsetX - pad + 4} y={z.offsetY - pad + 4}
                width={w + pad * 2} height={h + pad * 2}
                fill="#1A2E1A" opacity={0.3} cornerRadius={12}
              />
              {/* Zone background */}
              <Rect
                x={z.offsetX - pad} y={z.offsetY - pad}
                width={w + pad * 2} height={h + pad * 2}
                fill="#2A4F3A" cornerRadius={10}
                stroke="#4A8A5F" strokeWidth={1.5}
              />
              {/* Inner dashed border */}
              <Rect
                x={z.offsetX - 6} y={z.offsetY - 6}
                width={w + 12} height={h + 12}
                fill="transparent" stroke="#5B9B6F" strokeWidth={0.5}
                cornerRadius={6} dash={[4, 4]} opacity={0.4}
              />

              {/* Large watermark */}
              <Text
                x={z.offsetX} y={z.offsetY + h / 2 - 22} width={w}
                text={z.label} fontSize={44}
                fontFamily="Georgia, 'Times New Roman', serif" fontStyle="bold"
                fill="#FFFFFF" opacity={0.08} align="center" letterSpacing={6}
              />

              {/* Zone label badge */}
              <Rect
                x={z.offsetX - pad} y={z.offsetY - pad - 32}
                width={90} height={28} fill="#1A3C34" cornerRadius={6}
                shadowColor="#000" shadowBlur={4} shadowOpacity={0.2} shadowOffsetY={2}
              />
              <Rect
                x={z.offsetX - pad} y={z.offsetY - pad - 32}
                width={4} height={28} fill="#7ED4A6" cornerRadius={[6, 0, 0, 6]}
              />
              <Text
                x={z.offsetX - pad + 10} y={z.offsetY - pad - 32}
                width={76} height={28} text={z.label}
                fontSize={13} fontStyle="bold" fill="#FFFFFF" verticalAlign="middle"
              />

              {/* Column numbers */}
              {showZoneLabels && Array.from({ length: z.cols }).map((_, c) => (
                <Text
                  key={`col-${z.id}-${c}`}
                  x={z.offsetX + c * (CELL_W + CELL_GAP)} y={z.offsetY - 14}
                  width={CELL_W} text={String(c + 1)}
                  fontSize={9} fill="#7BAF8E" align="center" opacity={0.7}
                />
              ))}

              {/* Row numbers */}
              {showZoneLabels && Array.from({ length: z.rows }).map((_, r) => (
                <Text
                  key={`row-${z.id}-${r}`}
                  x={z.offsetX - 18}
                  y={z.offsetY + r * (CELL_H + CELL_GAP) + CELL_H / 2 - 5}
                  text={String(r + 1)}
                  fontSize={9} fill="#7BAF8E" opacity={0.7}
                />
              ))}
            </React.Fragment>
          );
        })}
      </Layer>

      {/* ══════ PLOTS ══════ */}
      <Layer>
        {zones.map((zone) =>
          (plotsByZone[zone.id] || []).map((plot) => {
            const pos = plotPosition(plot, zone);
            return (
              <PlotRect
                key={plot.id}
                plot={plot}
                x={pos.x}
                y={pos.y}
                isSelected={plot.id === selectedPlotId}
                zoom={zoom}
                onClick={onPlotSelect}
              />
            );
          })
        )}
      </Layer>

      {/* ══════ EDIT MODE — empty cell grid ══════ */}
      {mode === "edit" && onEmptyCellClick && (
        <Layer>
          {zones.map((zone) => {
            const occupied = new Set((plotsByZone[zone.id] || []).map(p => `${p.row}-${p.col}`));
            return Array.from({ length: zone.rows }).flatMap((_, r) =>
              Array.from({ length: zone.cols }).map((_, c) => {
                if (occupied.has(`${r}-${c}`)) return null;
                const x = zone.offsetX + c * (CELL_W + CELL_GAP);
                const y = zone.offsetY + r * (CELL_H + CELL_GAP);
                return (
                  <Group key={`empty-${zone.id}-${r}-${c}`}>
                    <Rect
                      x={x} y={y} width={CELL_W} height={CELL_H}
                      fill="#FFFFFF" opacity={0.08}
                      stroke="#7ED4A6" strokeWidth={1.5}
                      cornerRadius={6} dash={[6, 4]}
                      onClick={() => onEmptyCellClick(zone.id, r, c)}
                      onTap={() => onEmptyCellClick(zone.id, r, c)}
                    />
                    <Text
                      x={x} y={y} width={CELL_W} height={CELL_H}
                      text="+" fontSize={20} fill="#7ED4A6"
                      align="center" verticalAlign="middle"
                      listening={false}
                    />
                  </Group>
                );
              })
            );
          })}
        </Layer>
      )}

      {/* ══════ HEATMAP OVERLAY ══════ */}
      {showHeatmap && (
        <Layer listening={false}>
          {plots.map((plot) => {
            if (!plot.data?.maintenance) return null;
            const zone = zones.find((z) => z.id === plot.zone);
            if (!zone) return null;
            const pos = plotPosition(plot, zone);
            const days = plot.data.maintenance.daysLeft;
            let color = "#22C55E";
            let opacity = 0.06;
            if (days <= 0) { color = "#FF0000"; opacity = 0.35; }
            else if (days <= 30) { color = "#FF8C00"; opacity = 0.25; }
            else if (days <= 90) { color = "#FFD700"; opacity = 0.15; }
            return (
              <Rect
                key={`heat-${plot.id}`}
                x={pos.x} y={pos.y}
                width={plot.width} height={plot.height}
                fill={color} opacity={opacity} cornerRadius={5}
              />
            );
          })}
        </Layer>
      )}
    </Stage>
  );
}

export default React.memo(GisCanvasInner);
