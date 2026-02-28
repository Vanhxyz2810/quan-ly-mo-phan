import { useEffect } from "react";
import type { GisMode, UserRole } from "../types";

interface KeyboardCallbacks {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  deselectAll: () => void;
  undo: () => void;
  redo: () => void;
  setMode: (m: GisMode) => void;
  mode: GisMode;
  userRole: UserRole;
  searchOpen: boolean;
}

export function useGisKeyboard(cb: KeyboardCallbacks) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Search
      if (ctrl && e.key === "f") {
        e.preventDefault();
        cb.openSearch();
        return;
      }

      // Escape
      if (e.key === "Escape") {
        if (cb.searchOpen) cb.closeSearch();
        else if (cb.mode !== "view") cb.setMode("view");
        else cb.deselectAll();
        return;
      }

      // Don't handle shortcuts while typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Zoom
      if (e.key === "+" || e.key === "=") cb.zoomIn();
      if (e.key === "-") cb.zoomOut();
      if (e.key === "0") cb.resetZoom();

      // Undo / Redo (edit mode only)
      if (cb.mode === "edit" && ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        cb.undo();
      }
      if (cb.mode === "edit" && ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        cb.redo();
      }

      // Mode shortcuts
      if (e.key === "v") cb.setMode("view");
      if (e.key === "e" && cb.userRole === "admin") cb.setMode("edit");
      if (e.key === "m") cb.setMode("measure");
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cb]);
}
