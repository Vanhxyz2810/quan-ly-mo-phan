"use client";

import { useEffect, useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { plotsApi, serviceOrderApi, type PlotDto, type ServiceOrderDto } from "@/lib/api";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Wrench, Flower2, Flame, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface CalendarEvent {
  type: "expired" | "expiring" | "service";
  title: string;
  plotId: string;
  date: string; // dd/MM/yyyy
  serviceType?: string;
  link: string;
}

const SERVICE_ICONS: Record<string, typeof Wrench> = {
  care: Wrench,
  flower: Flower2,
  incense: Flame,
};

const SERVICE_LABELS: Record<string, string> = {
  care: "Chăm sóc mộ",
  flower: "Hoa tươi",
  incense: "Dâng hương",
};

const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function parseDateDMY(str: string): Date | null {
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d);
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  // Monday = 0, Sunday = 6
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function dateKey(year: number, month: number, day: number) {
  return `${day.toString().padStart(2, "0")}/${(month + 1).toString().padStart(2, "0")}/${year}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [plots, orders] = await Promise.all([
        plotsApi.getAll(),
        serviceOrderApi.getAll(),
      ]);
      const evts: CalendarEvent[] = [];

      // Maintenance events
      plots.forEach((p: PlotDto) => {
        const m = p.data?.maintenance;
        if (!m) return;
        const s = m.status?.toLowerCase();
        if (s === "expiring" || s === "expired") {
          evts.push({
            type: s as "expiring" | "expired",
            title: `${p.data?.deceased?.name ?? p.id} — ${s === "expired" ? "Hết hạn" : "Sắp hết hạn"}`,
            plotId: p.id,
            date: m.expiryDate,
            link: "/admin/finance",
          });
        }
      });

      // Service order events
      orders.forEach((o: ServiceOrderDto) => {
        evts.push({
          type: "service",
          title: `${o.customerName} — ${SERVICE_LABELS[o.serviceType] ?? o.serviceType}`,
          plotId: o.plotId,
          date: o.scheduledDate,
          serviceType: o.serviceType,
          link: "/admin/orders",
        });
      });

      setEvents(evts);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  const days = getCalendarDays(year, month);

  // Group events by date string
  const eventsByDate = new Map<string, CalendarEvent[]>();
  events.forEach(e => {
    const list = eventsByDate.get(e.date) ?? [];
    list.push(e);
    eventsByDate.set(e.date, list);
  });

  const selectedDateKey = selectedDay ? dateKey(year, month, selectedDay) : null;
  const selectedEvents = selectedDateKey ? (eventsByDate.get(selectedDateKey) ?? []) : [];

  function goPrev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }

  function goNext() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today.getDate());
  }

  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  return (
    <>
      <AdminNavbar title="Lịch dịch vụ" subtitle="Quản lý" />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex gap-6">
          {/* Calendar Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-xl font-bold text-(--color-text)">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button onClick={goToday} className="px-3 py-1 rounded-lg bg-(--color-primary)/10 text-(--color-primary) text-xs font-semibold hover:bg-(--color-primary)/20 transition-colors">
                  Hôm nay
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={goPrev} className="w-8 h-8 rounded-lg hover:bg-(--color-bg) flex items-center justify-center transition-colors">
                  <ChevronLeft size={18} className="text-(--color-muted)" />
                </button>
                <button onClick={goNext} className="w-8 h-8 rounded-lg hover:bg-(--color-bg) flex items-center justify-center transition-colors">
                  <ChevronRight size={18} className="text-(--color-muted)" />
                </button>
              </div>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-(--color-muted) py-2">{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-px bg-(--color-border) rounded-lg overflow-hidden border border-(--color-border)">
              {days.map((day, i) => {
                if (day === null) return <div key={i} className="bg-(--color-bg) h-24" />;
                const dk = dateKey(year, month, day);
                const dayEvents = eventsByDate.get(dk) ?? [];
                const hasExpired = dayEvents.some(e => e.type === "expired");
                const hasExpiring = dayEvents.some(e => e.type === "expiring");
                const hasService = dayEvents.some(e => e.type === "service");
                const isSelected = day === selectedDay;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(day)}
                    className={`h-24 bg-(--color-surface) p-2 text-left flex flex-col transition-colors hover:bg-(--color-primary)/5 ${
                      isSelected ? "ring-2 ring-(--color-primary) ring-inset" : ""
                    }`}
                  >
                    <span className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday(day) ? "bg-(--color-primary) text-white" : "text-(--color-text)"
                    }`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {hasExpired && <span className="w-2 h-2 rounded-full bg-red-500" />}
                        {hasExpiring && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                        {hasService && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        {dayEvents.length > 1 && (
                          <span className="text-[10px] text-(--color-muted)">+{dayEvents.length}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-3 text-xs text-(--color-muted)">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Hết hạn</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Sắp hết hạn</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Đơn dịch vụ</span>
            </div>
          </div>

          {/* Sidebar: Selected day events */}
          <div className="w-[320px] shrink-0">
            <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 sticky top-0">
              <h3 className="font-heading font-bold text-(--color-text) mb-3 flex items-center gap-2">
                <CalendarIcon size={16} className="text-(--color-primary)" />
                {selectedDay ? `Ngày ${selectedDay}/${month + 1}/${year}` : "Chọn một ngày"}
              </h3>

              {loading ? (
                <div className="py-8 text-center text-sm text-(--color-muted)">
                  <div className="w-5 h-5 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Đang tải...
                </div>
              ) : !selectedDay ? (
                <p className="text-sm text-(--color-muted) py-4">Nhấn vào một ngày để xem sự kiện.</p>
              ) : selectedEvents.length === 0 ? (
                <p className="text-sm text-(--color-muted) py-4">Không có sự kiện nào trong ngày này.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                  {selectedEvents.map((evt, idx) => {
                    const IconComp = evt.type === "service"
                      ? (SERVICE_ICONS[evt.serviceType ?? "care"] ?? Wrench)
                      : AlertTriangle;
                    const colorCls = evt.type === "expired"
                      ? "text-red-600 bg-red-50"
                      : evt.type === "expiring"
                        ? "text-amber-600 bg-amber-50"
                        : "text-blue-600 bg-blue-50";

                    return (
                      <Link
                        key={idx}
                        href={evt.link}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-(--color-bg) transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorCls}`}>
                          <IconComp size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-(--color-text) truncate">{evt.title}</p>
                          <p className="text-xs text-(--color-muted)">Mộ {evt.plotId}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
