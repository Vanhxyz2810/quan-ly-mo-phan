import { useState, useCallback, useRef, useEffect } from "react";
import type Konva from "konva";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 1.12;
const TOOLBAR_ANIM_MS = 150;
const NAV_ANIM_MS = 300;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function useGisZoom(initial = 0.75) {
  const [zoom, setZoom] = useState(initial);
  const [position, setPosition] = useState({ x: 20, y: 10 });

  // Refs that mirror state — readable synchronously in callbacks
  const zoomRef = useRef(initial);
  const posRef = useRef({ x: 20, y: 10 });

  // Animation refs
  const animFrameRef = useRef<number>(0);
  const animStartTime = useRef(0);
  const animDuration = useRef(0);
  const animFrom = useRef({ zoom: initial, x: 20, y: 10 });
  const animTo = useRef({ zoom: initial, x: 20, y: 10 });

  const clamp = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));

  /** Apply zoom + position instantly (update refs + state) */
  const apply = useCallback((z: number, pos: { x: number; y: number }) => {
    zoomRef.current = z;
    posRef.current = pos;
    setZoom(z);
    setPosition(pos);
  }, []);

  /** Cancel any running animation */
  const cancelAnim = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, []);

  /** rAF loop — time-based easeOutCubic */
  const tick = useCallback(() => {
    const t = Math.min(
      (performance.now() - animStartTime.current) / animDuration.current,
      1
    );
    const e = easeOutCubic(t);
    const from = animFrom.current;
    const to = animTo.current;

    const z = from.zoom + (to.zoom - from.zoom) * e;
    const x = from.x + (to.x - from.x) * e;
    const y = from.y + (to.y - from.y) * e;

    if (t >= 1) {
      apply(to.zoom, { x: to.x, y: to.y });
      animFrameRef.current = 0;
      return;
    }

    apply(z, { x, y });
    animFrameRef.current = requestAnimationFrame(tick);
  }, [apply]);

  /** Start animated transition from current values to target */
  const animateTo = useCallback(
    (toZoom: number, toPos: { x: number; y: number }, ms: number) => {
      cancelAnim();
      animFrom.current = {
        zoom: zoomRef.current,
        x: posRef.current.x,
        y: posRef.current.y,
      };
      animTo.current = { zoom: toZoom, x: toPos.x, y: toPos.y };
      animStartTime.current = performance.now();
      animDuration.current = ms;
      animFrameRef.current = requestAnimationFrame(tick);
    },
    [cancelAnim, tick]
  );

  useEffect(() => () => cancelAnim(), [cancelAnim]);

  /** Compute position that keeps a pivot point fixed after zoom change */
  const pivotPos = (
    oldZ: number,
    newZ: number,
    oldPos: { x: number; y: number },
    px: number,
    py: number
  ) => ({
    x: px - ((px - oldPos.x) / oldZ) * newZ,
    y: py - ((py - oldPos.y) / oldZ) * newZ,
  });

  // ── Scroll wheel: INSTANT ──────────────────────────────────────────

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      cancelAnim();

      const oldZ = zoomRef.current;
      const newZ = clamp(
        e.evt.deltaY < 0 ? oldZ * ZOOM_STEP : oldZ / ZOOM_STEP
      );
      const newPos = pivotPos(oldZ, newZ, posRef.current, pointer.x, pointer.y);

      apply(newZ, newPos);
    },
    [cancelAnim, apply]
  );

  // ── Toolbar buttons: ANIMATED (150ms) ──────────────────────────────

  const zoomIn = useCallback(() => {
    const newZ = clamp(zoomRef.current * ZOOM_STEP);
    animateTo(newZ, posRef.current, TOOLBAR_ANIM_MS);
  }, [animateTo]);

  const zoomOut = useCallback(() => {
    const newZ = clamp(zoomRef.current / ZOOM_STEP);
    animateTo(newZ, posRef.current, TOOLBAR_ANIM_MS);
  }, [animateTo]);

  // ── Reset: ANIMATED (300ms) ────────────────────────────────────────

  const resetZoom = useCallback(() => {
    animateTo(0.75, { x: 20, y: 10 }, NAV_ANIM_MS);
  }, [animateTo]);

  // ── Position helpers ───────────────────────────────────────────────

  const setPositionDirect = useCallback(
    (pos: { x: number; y: number }) => {
      cancelAnim();
      posRef.current = pos;
      setPosition(pos);
    },
    [cancelAnim]
  );

  const setPositionAnimated = useCallback(
    (pos: { x: number; y: number }) => {
      animateTo(zoomRef.current, pos, NAV_ANIM_MS);
    },
    [animateTo]
  );

  // ── Fit to view: INSTANT (initial load) ────────────────────────────

  const fitToView = useCallback(
    (contentW: number, contentH: number, viewW: number, viewH: number) => {
      const padding = 40;
      const scaleX = (viewW - padding * 2) / contentW;
      const scaleY = (viewH - padding * 2) / contentH;
      const fitZoom = clamp(Math.min(scaleX, scaleY));
      const offsetX = (viewW - contentW * fitZoom) / 2;
      const offsetY = (viewH - contentH * fitZoom) / 2;

      cancelAnim();
      apply(fitZoom, { x: offsetX, y: offsetY });
    },
    [cancelAnim, apply]
  );

  return {
    zoom,
    position,
    setPosition: setPositionDirect,
    setPositionAnimated,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    fitToView,
  };
}
