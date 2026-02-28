"use client";

import React, { useState } from "react";
import { Rect, Group, Text, Label, Tag, Circle, Line } from "react-konva";
import type { Plot, PlotStatus } from "./types";

/* ════════════════════════════════════════════════
   Glassmorphism-inspired status colors
   ════════════════════════════════════════════════ */
const STATUS_FILL: Record<PlotStatus, string> = {
  occupied: "#E88B8B",   // soft coral-red
  available: "#7ED4A6",  // mint-green
  reserved: "#7EB8E0",   // sky-blue
  selected: "#E8D5A8",   // warm gold
};

const STATUS_FILL_HOVER: Record<PlotStatus, string> = {
  occupied: "#F0A0A0",
  available: "#95DFB8",
  reserved: "#96C8EA",
  selected: "#F0DFB5",
};

const STATUS_FILL_DARK: Record<PlotStatus, string> = {
  occupied: "#D4706E",
  available: "#5DC08A",
  reserved: "#5AA0D0",
  selected: "#D4C090",
};

const DOT_COLOR: Record<PlotStatus, string> = {
  occupied: "#DC2626",
  available: "#16A34A",
  reserved: "#2563EB",
  selected: "#D97706",
};

const STATUS_LABEL: Record<PlotStatus, string> = {
  occupied: "Đã lấp đầy",
  available: "Còn trống",
  reserved: "Đã đặt trước",
  selected: "",
};

/* ════════════════════════════════════════════════
   LOD thresholds
   ════════════════════════════════════════════════ */
const LOD_MIN = 0.5;   // below: dots only
const LOD_MID = 0.9;   // below: ID + dot only

interface Props {
  plot: Plot;
  x: number;
  y: number;
  isSelected: boolean;
  zoom: number;
  onClick: (plot: Plot) => void;
}

function PlotRectInner({ plot, x, y, isSelected, zoom, onClick }: Props) {
  const [hovered, setHovered] = useState(false);

  const status = isSelected ? "selected" : plot.status;
  const fill = hovered ? STATUS_FILL_HOVER[status] : STATUS_FILL[status];
  const fillDark = STATUS_FILL_DARK[status];
  const dotColor = DOT_COLOR[status];

  // LOD levels
  const showText = zoom >= LOD_MIN;
  const showFullDetail = zoom >= LOD_MID;

  /* ── LOD: Dots-only mode (zoomed far out) ── */
  if (!showText) {
    return (
      <Group
        x={x}
        y={y}
        onClick={() => onClick(plot)}
        onTap={() => onClick(plot)}
        onMouseEnter={(e) => {
          const c = e.target.getStage()?.container();
          if (c) c.style.cursor = "pointer";
        }}
        onMouseLeave={(e) => {
          const c = e.target.getStage()?.container();
          if (c) c.style.cursor = "default";
        }}
      >
        <Rect
          width={plot.width}
          height={plot.height}
          fill={fill}
          opacity={0.9}
          cornerRadius={3}
          stroke={isSelected ? "#FFFFFF" : fillDark}
          strokeWidth={isSelected ? 2 : 0.5}
        />
        {isSelected && (
          <Rect
            x={-2}
            y={-2}
            width={plot.width + 4}
            height={plot.height + 4}
            fill="transparent"
            stroke="#FFFFFF"
            strokeWidth={2}
            cornerRadius={5}
            shadowColor="#FFFFFF"
            shadowBlur={10}
            shadowOpacity={0.6}
          />
        )}
      </Group>
    );
  }

  /* ── Tooltip content ── */
  const tooltipLines: string[] = [];
  if (plot.data?.deceased) {
    tooltipLines.push(plot.id);
    tooltipLines.push(plot.data.deceased.name);
    tooltipLines.push(`✝ ${plot.data.deceased.deathDate}`);
  } else {
    tooltipLines.push(plot.id);
    tooltipLines.push(STATUS_LABEL[plot.status]);
  }
  const tooltipText = tooltipLines.join("\n");

  return (
    <Group
      x={x}
      y={y}
      onMouseEnter={(e) => {
        setHovered(true);
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        const c = e.target.getStage()?.container();
        if (c) c.style.cursor = "default";
      }}
      onClick={() => onClick(plot)}
      onTap={() => onClick(plot)}
    >
      {/* Drop shadow */}
      <Rect
        x={1.5}
        y={2}
        width={plot.width}
        height={plot.height}
        fill="#2A1F1A"
        opacity={0.15}
        cornerRadius={5}
      />

      {/* Selected glow ring — white */}
      {isSelected && (
        <Rect
          x={-3}
          y={-3}
          width={plot.width + 6}
          height={plot.height + 6}
          fill="transparent"
          stroke="#FFFFFF"
          strokeWidth={2.5}
          cornerRadius={7}
          shadowColor="#FFFFFF"
          shadowBlur={14}
          shadowOpacity={0.7}
        />
      )}

      {/* Main body — glassmorphism gradient simulation */}
      <Rect
        width={plot.width}
        height={plot.height}
        fill={fill}
        opacity={0.88}
        cornerRadius={5}
        stroke={isSelected ? "#FFFFFF" : hovered ? "#FFFFFFAA" : fillDark}
        strokeWidth={isSelected ? 1.5 : 0.8}
      />

      {/* Inner stone/tile stroke (1px inset) */}
      <Rect
        x={2}
        y={2}
        width={plot.width - 4}
        height={plot.height - 4}
        fill="transparent"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={1}
        cornerRadius={3}
      />

      {/* Top edge highlight (glass sheen) */}
      <Rect
        x={4}
        y={2}
        width={plot.width - 8}
        height={3}
        fill="#FFFFFF"
        opacity={0.45}
        cornerRadius={1}
      />

      {/* Bottom darker edge */}
      <Rect
        x={4}
        y={plot.height - 4}
        width={plot.width - 8}
        height={2}
        fill={fillDark}
        opacity={0.3}
        cornerRadius={1}
      />

      {/* Status dot (top-left) */}
      <Circle
        x={12}
        y={12}
        radius={5}
        fill={dotColor}
        stroke="#FFFFFF"
        strokeWidth={1.5}
      />

      {/* Plot ID — always visible at LOD_MIN+ */}
      <Text
        text={plot.id}
        x={22}
        y={5}
        fontSize={12}
        fontStyle="bold"
        fill="#1A1A2E"
      />

      {/* ──── Full-detail elements (zoom >= LOD_MID) ──── */}
      {showFullDetail && (
        <>
          {/* Deceased name or status text */}
          {plot.data?.deceased ? (
            <Text
              text={plot.data.deceased.name}
              x={6}
              y={28}
              width={plot.width - 12}
              fontSize={10}
              fill="#2D2D3D"
              ellipsis
              wrap="none"
            />
          ) : (
            <Text
              text={STATUS_LABEL[plot.status]}
              x={6}
              y={28}
              width={plot.width - 12}
              fontSize={9}
              fill="#4A4A5A"
              fontStyle="italic"
            />
          )}

          {/* Fee warning icon (bottom-right) */}
          {plot.data?.maintenance?.status === "expired" && (
            <>
              <Circle x={plot.width - 12} y={plot.height - 12} radius={7} fill="#FEE2E2" />
              <Text
                x={plot.width - 16}
                y={plot.height - 18}
                text="!"
                fontSize={11}
                fontStyle="bold"
                fill="#DC2626"
              />
            </>
          )}
          {plot.data?.maintenance?.status === "expiring" && (
            <>
              <Circle x={plot.width - 12} y={plot.height - 12} radius={7} fill="#FEF3C7" />
              <Text
                x={plot.width - 16}
                y={plot.height - 18}
                text="!"
                fontSize={11}
                fontStyle="bold"
                fill="#D97706"
              />
            </>
          )}

          {/* Grave marker line (decorative) */}
          <Rect
            x={6}
            y={plot.height - 22}
            width={plot.width - 12}
            height={1}
            fill="#FFFFFF"
            opacity={0.2}
          />

          {/* Death year (for occupied) */}
          {plot.data?.deceased && (
            <Text
              text={`${plot.data.deceased.deathDate.split("/")[2]}`}
              x={6}
              y={plot.height - 18}
              width={plot.width - 12}
              fontSize={9}
              fill="#3D3D50"
            />
          )}
        </>
      )}

      {/* Enhanced tooltip on hover */}
      {hovered && showText && (
        <Label x={plot.width / 2 - 80} y={-52}>
          <Tag
            fill="rgba(15, 23, 42, 0.95)"
            cornerRadius={8}
            pointerDirection="down"
            pointerWidth={10}
            pointerHeight={6}
            shadowColor="#000"
            shadowBlur={12}
            shadowOpacity={0.35}
          />
          <Text
            text={tooltipText}
            fill="#F1F5F9"
            fontSize={11}
            lineHeight={1.5}
            padding={10}
            width={160}
          />
        </Label>
      )}
    </Group>
  );
}

export const PlotRect = React.memo(PlotRectInner);
