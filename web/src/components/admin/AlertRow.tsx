import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AlertRowProps {
  plotId: string;
  name: string;
  feeType: string;
  daysLeft: number;
  status: "critical" | "warning" | "ok";
}

const statusConfig = {
  critical: { variant: "danger" as const, label: "Quá hạn" },
  warning: { variant: "warning" as const, label: "Sắp hạn" },
  ok: { variant: "success" as const, label: "Còn hạn" },
};

export function AlertRow({ plotId, name, feeType, daysLeft, status }: AlertRowProps) {
  const { variant, label } = statusConfig[status];
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-(--color-border) last:border-0 hover:bg-(--color-bg) transition-colors">
      <span className="text-sm font-semibold text-(--color-secondary) w-20 shrink-0">
        {plotId}
      </span>
      <span className="text-sm text-(--color-text) flex-1 min-w-0 truncate">{name}</span>
      <span className="text-sm text-(--color-muted) w-40 shrink-0">{feeType}</span>
      <span className="text-sm font-medium text-(--color-text) w-28 shrink-0">
        {daysLeft > 0 ? `${daysLeft} ngày` : "Đã quá hạn"}
      </span>
      <Badge variant={variant}>{label}</Badge>
      <Button variant="outline" size="sm" className="ml-2 shrink-0">
        Xử lý
      </Button>
    </div>
  );
}
