import { TaskCard } from "@/components/mobile/TaskCard";
import { BottomTabBar } from "@/components/mobile/BottomTabBar";
import { Filter, Search } from "lucide-react";

const tasks = [
  {
    id: "T001",
    type: "Chăm sóc cỏ",
    plotId: "#A-03-15",
    location: "Khu A, Hàng 3, Số 15",
    time: "08:00 – 09:00",
    status: "in_progress" as const,
    priority: "high" as const,
  },
  {
    id: "T002",
    type: "Thay hoa tươi",
    plotId: "#B-01-08",
    location: "Khu B, Hàng 1, Số 8",
    time: "09:30 – 10:00",
    status: "pending" as const,
    priority: "medium" as const,
  },
  {
    id: "T003",
    type: "Vệ sinh mộ",
    plotId: "#A-05-22",
    location: "Khu A, Hàng 5, Số 22",
    time: "10:30 – 11:30",
    status: "pending" as const,
    priority: "medium" as const,
  },
  {
    id: "T004",
    type: "Chụp ảnh báo cáo",
    plotId: "#C-02-07",
    location: "Khu C, Hàng 2, Số 7",
    time: "14:00 – 14:30",
    status: "done" as const,
    priority: "low" as const,
  },
];

export default function MobileTaskListPage() {
  return (
    <>
      {/* Status bar placeholder */}
      <div className="h-11 bg-(--color-primary) shrink-0" />

      {/* Header */}
      <div className="bg-(--color-primary) px-5 pb-5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-(--color-sidebar-muted) text-xs">Xin chào,</p>
            <h1 className="font-heading text-xl font-bold text-white">Trần Văn Bình</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-(--color-secondary) flex items-center justify-center">
            <span className="text-white text-sm font-bold">TB</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white/10 rounded-xl px-4 h-11">
          <Search size={16} className="text-(--color-sidebar-muted)" />
          <span className="text-(--color-sidebar-muted) text-sm">Tìm nhiệm vụ...</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 px-5 py-4 shrink-0">
        {[
          { label: "Hôm nay", value: "4", color: "text-(--color-text)" },
          { label: "Đang làm", value: "1", color: "text-blue-500" },
          { label: "Hoàn thành", value: "1", color: "text-green-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-(--color-border) flex flex-col items-center py-3 gap-0.5"
          >
            <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
            <span className="text-[11px] text-(--color-muted)">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between px-5 mb-2 shrink-0">
        <span className="text-xs font-bold text-(--color-muted) tracking-wider">DANH SÁCH NHIỆM VỤ</span>
        <button className="flex items-center gap-1 text-xs text-(--color-secondary) font-semibold">
          <Filter size={12} /> Lọc
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-auto bg-white rounded-t-2xl border-t border-(--color-border)">
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </div>

      <BottomTabBar activeIndex={0} />
    </>
  );
}
