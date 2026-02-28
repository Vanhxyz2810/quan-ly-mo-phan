import { LucideIcon } from "lucide-react";

interface StatWidgetProps {
  icon: LucideIcon;
  value: string;
  label: string;
  iconColor?: string;
  iconBg?: string;
}

export function StatWidget({
  icon: Icon,
  value,
  label,
  iconColor = "text-(--color-secondary)",
  iconBg = "bg-(--color-secondary)/10",
}: StatWidgetProps) {
  return (
    <div className="flex-1 bg-(--color-surface) rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-(--color-border)">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-4`}>
        <Icon size={20} className={iconColor} />
      </div>
      <p className="font-heading text-2xl font-bold text-(--color-text) leading-tight">
        {value}
      </p>
      <p className="text-(--color-muted) text-sm mt-1">{label}</p>
    </div>
  );
}
