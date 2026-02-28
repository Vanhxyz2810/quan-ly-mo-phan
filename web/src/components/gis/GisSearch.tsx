"use client";

import { useRef, useEffect, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import type { Plot, PlotStatus } from "./types";

const STATUS_LABELS: Record<string, string> = {
  occupied: "Đã lấp đầy",
  available: "Còn trống",
  reserved: "Đã đặt trước",
};

const STATUS_COLORS: Record<string, string> = {
  occupied: "bg-red-400/20 text-red-300 border-red-400/30",
  available: "bg-green-400/20 text-green-300 border-green-400/30",
  reserved: "bg-blue-400/20 text-blue-300 border-blue-400/30",
};

interface Filters {
  zone: string | null;
  status: PlotStatus | null;
  expiryMonth: string | null;
}

interface Props {
  isOpen: boolean;
  query: string;
  results: Plot[];
  filters: Filters;
  onQueryChange: (q: string) => void;
  onSelect: (plotId: string) => void;
  onClose: () => void;
  onFilterChange: (f: Partial<Filters>) => void;
}

export function GisSearch({
  isOpen,
  query,
  results,
  filters,
  onQueryChange,
  onSelect,
  onClose,
  onFilterChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 w-[380px]">
      {/* ── Search bar + Filter pills ── */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-1.5 shadow-xl"
        style={{
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <Search size={15} className="text-white/40 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Tìm mã mộ hoặc tên..."
          className="flex-1 h-8 text-[13px] bg-transparent outline-none text-white placeholder:text-white/35"
        />
        {query && (
          <button
            onClick={() => {
              onQueryChange("");
              setShowDropdown(false);
            }}
            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white/70 rounded"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Filter pills row ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Status pill */}
        <FilterPill
          label={filters.status ? STATUS_LABELS[filters.status] : "Trạng thái"}
          active={!!filters.status}
          onClear={() => onFilterChange({ status: null })}
        >
          <select
            value={filters.status ?? ""}
            onChange={(e) => onFilterChange({ status: (e.target.value || null) as PlotStatus | null })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          >
            <option value="">Tất cả</option>
            <option value="occupied">Đã lấp đầy</option>
            <option value="available">Còn trống</option>
            <option value="reserved">Đã đặt trước</option>
          </select>
        </FilterPill>

        {/* Zone pill */}
        <FilterPill
          label={filters.zone ? `Khu ${filters.zone}` : "Khu vực"}
          active={!!filters.zone}
          onClear={() => onFilterChange({ zone: null })}
        >
          <select
            value={filters.zone ?? ""}
            onChange={(e) => onFilterChange({ zone: e.target.value || null })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          >
            <option value="">Tất cả</option>
            <option value="A">Khu A</option>
            <option value="B">Khu B</option>
            <option value="C">Khu C</option>
            <option value="D">Khu D</option>
          </select>
        </FilterPill>

        {/* Service expiry pill */}
        <button
          onClick={() =>
            onFilterChange({
              expiryMonth: filters.expiryMonth ? null : "expired",
            })
          }
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 border ${filters.expiryMonth
            ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
            : "bg-white/8 text-white/50 border-white/10 hover:bg-white/12 hover:text-white/70"
            }`}
        >
          Quá hạn DV
          {filters.expiryMonth && (
            <X
              size={11}
              className="ml-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onFilterChange({ expiryMonth: null });
              }}
            />
          )}
        </button>
      </div>

      {/* ── Results dropdown ── */}
      {showDropdown && query.trim() && (
        <div
          className="rounded-xl shadow-xl max-h-[260px] overflow-auto"
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {results.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-white/40">
              Không tìm thấy kết quả
            </div>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p.id);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/8 transition-colors text-left"
              >
                <span className="font-semibold text-[13px] text-white/90 w-12">
                  {p.id}
                </span>
                <span className="flex-1 text-[13px] text-white/50 truncate">
                  {p.data?.deceased?.name ?? "Trống"}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] ?? "text-white/50"
                    }`}
                >
                  {STATUS_LABELS[p.status]}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Filter Pill component ── */
function FilterPill({
  label,
  active,
  onClear,
  children,
}: {
  label: string;
  active: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 border cursor-pointer ${active
        ? "bg-white/15 text-white/90 border-white/25"
        : "bg-white/8 text-white/50 border-white/10 hover:bg-white/12 hover:text-white/70"
        }`}
    >
      {label}
      <ChevronDown size={11} className="text-white/40" />
      {active && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="ml-0.5"
        >
          <X size={11} className="text-white/40 hover:text-white/70" />
        </button>
      )}
      {children}
    </div>
  );
}
