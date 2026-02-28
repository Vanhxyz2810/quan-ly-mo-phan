import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Plus, Send } from "lucide-react";

const records = [
  {
    id: "A-03-15",
    name: "Nguyễn Văn An",
    died: "22/08/2018",
    plot: "Khu A, Hàng 3",
    nok: "Nguyễn Thị Hoa · 0812 345 678",
    fee: "1,500,000 ₫ / năm",
    status: "warning" as const,
    statusLabel: "Sắp hạn",
  },
  {
    id: "B-07-22",
    name: "Trần Thị Bình",
    died: "15/06/2020",
    plot: "Khu B, Hàng 7",
    nok: "Trần Văn Nam · 0901 234 567",
    fee: "1,500,000 ₫ / năm",
    status: "danger" as const,
    statusLabel: "Quá hạn",
  },
  {
    id: "C-01-08",
    name: "Lê Minh Tuấn",
    died: "03/01/2015",
    plot: "Khu C, Hàng 1",
    nok: "Lê Thị Thu · 0978 123 456",
    fee: "6,000,000 ₫ / 5 năm",
    status: "success" as const,
    statusLabel: "Còn hạn",
  },
];

export default function CrmPage() {
  return (
    <>
      <AdminNavbar title="Hồ sơ & CRM" subtitle="Quản lý" />
      <div className="flex-1 flex overflow-hidden">
        {/* Table section */}
        <div className="flex-1 overflow-auto p-7">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-md border border-(--color-border) bg-(--color-surface)">
              <Search size={16} className="text-(--color-muted)" />
              <input
                type="text"
                placeholder="Tìm tên, mã mộ..."
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-(--color-muted)"
              />
            </div>
            <select className="h-10 px-3 rounded-md border border-(--color-border) bg-(--color-surface) text-sm text-(--color-muted) outline-none">
              <option>Tất cả trạng thái</option>
            </select>
            <Button variant="primary" size="md" className="gap-1.5">
              <Plus size={16} />
              Thêm hồ sơ
            </Button>
          </div>

          {/* Table */}
          <div className="bg-(--color-surface) rounded-lg border border-(--color-border) overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr_1.5fr_1.5fr_1.2fr_1fr] gap-4 px-4 py-2.5 bg-(--color-bg) border-b border-(--color-border)">
              {["Mã mộ", "Họ tên người mất", "Ngày mất", "Khu / Hàng", "Thân nhân (NOK)", "Phí hiện hành", "Trạng thái"].map(
                (h) => (
                  <span key={h} className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
                    {h}
                  </span>
                )
              )}
            </div>
            {records.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1fr_1.5fr_1fr_1.5fr_1.5fr_1.2fr_1fr] gap-4 px-4 py-3 border-b border-(--color-border) last:border-0 hover:bg-(--color-bg) transition-colors text-sm cursor-pointer"
              >
                <span className="text-(--color-secondary) font-semibold">{r.id}</span>
                <span className="text-(--color-text) font-medium">{r.name}</span>
                <span className="text-(--color-muted)">{r.died}</span>
                <span className="text-(--color-muted)">{r.plot}</span>
                <span className="text-(--color-muted) truncate">{r.nok}</span>
                <span className="text-(--color-text)">{r.fee}</span>
                <Badge variant={r.status}>{r.statusLabel}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-notify drawer */}
        <aside className="w-[400px] shrink-0 bg-(--color-surface) border-l border-(--color-border) flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-(--color-border)">
            <Send size={16} className="text-(--color-primary)" />
            <h3 className="font-semibold text-(--color-text)">Tự động thông báo</h3>
          </div>
          <div className="flex-1 overflow-auto p-5 flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide block mb-2">
                Kênh nhận thông báo
              </label>
              <div className="flex gap-2">
                {["SMS", "Email"].map((c) => (
                  <button
                    key={c}
                    className="px-3 h-8 rounded-md border border-(--color-primary) text-(--color-primary) text-sm font-semibold"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide block mb-2">
                Mẫu thông báo
              </label>
              <textarea
                rows={5}
                className="w-full rounded-md border border-(--color-border) px-3 py-2 text-sm text-(--color-text) resize-none outline-none focus:border-(--color-primary) bg-(--color-bg)"
                defaultValue={`Kính gửi {name},\nPhí duy tu mộ phần {plot_id} sẽ hết hạn vào ngày {due_date}. Số tiền: {amount} VNĐ. Vui lòng thanh toán để tiếp tục dịch vụ.`}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["{name}", "{amount}", "{due_date}", "{plot_id}"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-(--color-primary)/10 text-(--color-primary) text-xs font-mono cursor-pointer hover:bg-(--color-primary)/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide block mb-2">
                Lịch gửi (ngày trước hạn)
              </label>
              <div className="flex gap-2">
                {["30 ngày", "15 ngày", "7 ngày", "1 ngày"].map((d) => (
                  <button
                    key={d}
                    className="flex-1 h-8 rounded-md border border-(--color-border) text-(--color-text) text-xs font-medium hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-(--color-border)">
            <Button variant="primary" className="w-full">
              Kích hoạt tự động nhắc nhở
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
