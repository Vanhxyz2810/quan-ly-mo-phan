import { useReducer, useCallback, useEffect } from "react";
import type { Plot, EditAction } from "../types";

interface EditState {
  history: EditAction[];
  redoStack: EditAction[];
}

type Action =
  | { type: "PUSH"; action: EditAction }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR" };

function reducer(state: EditState, action: Action): EditState {
  switch (action.type) {
    case "PUSH":
      return {
        history: [...state.history, action.action],
        redoStack: [],
      };
    case "UNDO": {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      return {
        history: state.history.slice(0, -1),
        redoStack: [...state.redoStack, last],
      };
    }
    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const last = state.redoStack[state.redoStack.length - 1];
      return {
        history: [...state.history, last],
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case "CLEAR":
      return { history: [], redoStack: [] };
  }
}

export function useGisEdit() {
  const [state, dispatch] = useReducer(reducer, { history: [], redoStack: [] });

  const addPlot = useCallback(
    (plot: Plot) => dispatch({ type: "PUSH", action: { type: "add", plot } }),
    []
  );

  const deletePlot = useCallback(
    (plot: Plot) => dispatch({ type: "PUSH", action: { type: "delete", plot } }),
    []
  );

  const movePlot = useCallback(
    (plotId: string, fromRow: number, fromCol: number, toRow: number, toCol: number) =>
      dispatch({
        type: "PUSH",
        action: {
          type: "move",
          plotId,
          from: { row: fromRow, col: fromCol },
          to: { row: toRow, col: toCol },
        },
      }),
    []
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const clearAll = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const canUndo = state.history.length > 0;
  const canRedo = state.redoStack.length > 0;
  const unsavedCount = state.history.length;

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (unsavedCount === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [unsavedCount]);

  // Apply pending edits onto base plots
  const applyChanges = useCallback(
    (basePlots: Plot[]): Plot[] => {
      let result = [...basePlots];
      for (const action of state.history) {
        switch (action.type) {
          case "add":
            result.push(action.plot);
            break;
          case "delete":
            result = result.filter((p) => p.id !== action.plot.id);
            break;
          case "move":
            result = result.map((p) =>
              p.id === action.plotId ? { ...p, row: action.to.row, col: action.to.col } : p
            );
            break;
          case "update":
            result = result.map((p) =>
              p.id === action.plotId ? { ...p, ...action.after } : p
            );
            break;
        }
      }
      return result;
    },
    [state.history]
  );

  return {
    addPlot,
    deletePlot,
    movePlot,
    undo,
    redo,
    clearAll,
    canUndo,
    canRedo,
    unsavedCount,
    applyChanges,
    getActions: () => state.history,
  };
}
