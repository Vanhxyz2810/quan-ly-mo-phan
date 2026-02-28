import { MapPin, ChevronRight } from "lucide-react";

interface TaskCardProps {
  id: string;
  type: string;
  plotId: string;
  location: string;
  time: string;
  status: "pending" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
}

const statusConfig = {
  pending: { label: "Chờ thực hiện", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "Đang làm", color: "bg-blue-100 text-blue-600" },
  done: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
};

const priorityConfig = {
  high: { dot: "bg-red-500" },
  medium: { dot: "bg-amber-500" },
  low: { dot: "bg-green-500" },
};

export function TaskCard({ id, type, plotId, location, time, status, priority }: TaskCardProps) {
  const { label, color } = statusConfig[status];
  const { dot } = priorityConfig[priority];

  return (
    <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-(--color-border) active:bg-(--color-bg) transition-colors">
      {/* Priority dot */}
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-(--color-text)">{type}</span>
          <span className="text-xs text-(--color-secondary) font-semibold">{plotId}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-(--color-muted)">
          <MapPin size={11} />
          <span className="truncate">{location}</span>
        </div>
        <div className="text-xs text-(--color-muted) mt-0.5">{time}</div>
      </div>

      {/* Status badge */}
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${color}`}>
        {label}
      </span>

      <ChevronRight size={16} className="text-(--color-muted) shrink-0" />
    </div>
  );
}
