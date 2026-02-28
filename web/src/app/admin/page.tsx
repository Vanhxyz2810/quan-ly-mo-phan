import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { StatWidget } from "@/components/admin/StatWidget";
import { AlertRow } from "@/components/admin/AlertRow";
import { Layers, BarChart3, DollarSign, Wrench } from "lucide-react";

const alertData = [
  { plotId: "A-03-15", name: "Nguyễn Văn An", feeType: "Phí duy tu 1 năm", daysLeft: 3, status: "critical" as const },
  { plotId: "B-07-22", name: "Trần Thị Bình", feeType: "Phí chăm sóc Cơ bản", daysLeft: 8, status: "critical" as const },
  { plotId: "C-12-06", name: "Lê Minh Tuấn", feeType: "Phí trọn đời", daysLeft: 15, status: "warning" as const },
  { plotId: "A-09-22", name: "Phạm Thị Lan", feeType: "Phí duy tu 5 năm", daysLeft: 28, status: "warning" as const },
];

export default function DashboardPage() {
  return (
    <>
      <AdminNavbar title="Tổng quan" subtitle="Trang chủ" />
      <div className="flex-1 overflow-auto p-8">
        {/* Stat Widgets */}
        <div className="flex gap-5 mb-8">
          <StatWidget
            icon={Layers}
            value="1,248"
            label="Tổng mộ phần"
            iconBg="bg-(--color-primary)/10"
            iconColor="text-(--color-primary)"
          />
          <StatWidget
            icon={BarChart3}
            value="78.4%"
            label="Tỉ lệ lấp đầy"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatWidget
            icon={DollarSign}
            value="142,500,000 ₫"
            label="Doanh thu tháng 2/2026"
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatWidget
            icon={Wrench}
            value="24"
            label="Dịch vụ sắp tới"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* Alert Section */}
        <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-(--color-text)">
                Cảnh báo phí sắp hết hạn (trong 30 ngày)
              </h2>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {alertData.length}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-(--color-muted)">
              <span>Mã mộ</span>
              <span>Họ tên người mất</span>
              <span>Loại phí</span>
              <span>Ngày còn lại</span>
              <span>Trạng thái</span>
            </div>
          </div>
          {alertData.map((row) => (
            <AlertRow key={row.plotId} {...row} />
          ))}
        </div>
      </div>
    </>
  );
}
