"use client";

import { AlertTriangle, Undo2, Redo2, Save, XCircle } from "lucide-react";

interface Props {
  active: boolean;
  canUndo: boolean;
  canRedo: boolean;
  unsavedCount: number;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function GisEditMode({
  active,
  canUndo,
  canRedo,
  unsavedCount,
  onUndo,
  onRedo,
  onSave,
  onCancel,
}: Props) {
  if (!active) return null;

  return (
    <>
      {/* Top warning banner */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center gap-2 px-4 h-10 bg-amber-50 border-b border-amber-300">
        <AlertTriangle size={16} className="text-amber-600" />
        <span className="text-sm font-medium text-amber-800">
          Chế độ chỉnh sửa
        </span>
        {unsavedCount > 0 && (
          <span className="text-xs text-amber-600">
            — {unsavedCount} thay đổi chưa lưu
          </span>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-3 px-4 h-12 bg-white/95 backdrop-blur border-t border-(--color-border)">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors disabled:opacity-40 text-(--color-muted) hover:bg-(--color-bg)"
        >
          <Undo2 size={14} />
          Hoàn tác
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors disabled:opacity-40 text-(--color-muted) hover:bg-(--color-bg)"
        >
          <Redo2 size={14} />
          Làm lại
        </button>

        <div className="w-px h-6 bg-(--color-border)" />

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 h-8 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <XCircle size={14} />
          Hủy tất cả
        </button>
        <button
          onClick={onSave}
          disabled={unsavedCount === 0}
          className="flex items-center gap-1.5 px-4 h-8 rounded-md text-xs font-semibold bg-(--color-primary) text-white hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Save size={14} />
          Lưu thay đổi
        </button>
      </div>
    </>
  );
}
