"use client";

import { useEffect, useState } from "react";
import { plotsApi, type PlotDto, type UpdatePlotRequest } from "@/lib/api";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Search, X, ChevronRight, User, Phone, Wrench, Save, Send } from "lucide-react";

// Badge trạng thái hợp đồng bảo trì
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    expiring: "bg-amber-100 text-amber-700",
    expired: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    active: "Còn hạn",
    expiring: "Sắp hết hạn",
    expired: "Hết hạn",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
        map[s] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[s] ?? status}
    </span>
  );
}

export default function CrmPage() {
  const [plots, setPlots] = useState<PlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<PlotDto | null>(null);
  const [tab, setTab] = useState<"deceased" | "nok" | "maintenance">("deceased");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Form state cho chỉnh sửa hồ sơ
  const [form, setForm] = useState({
    deceasedName: "",
    birthDate: "",
    deathDate: "",
    quote: "",
    nokName: "",
    relationship: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    plotsApi
      .getAll(undefined, "occupied")
      .then(setPlots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Lọc danh sách hồ sơ theo từ khóa và trạng thái
  const filtered = plots.filter((p) => {
    const matchName =
      !query ||
      p.data?.deceased?.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase());
    const matchStatus =
      statusFilter === "all" || p.data?.maintenance?.status === statusFilter;
    return matchName && matchStatus;
  });

  function openDrawer(plot: PlotDto) {
    setSelected(plot);
    setTab("deceased");
    setForm({
      deceasedName: plot.data?.deceased?.name ?? "",
      birthDate: plot.data?.deceased?.birthDate ?? "",
      deathDate: plot.data?.deceased?.deathDate ?? "",
      quote: plot.data?.deceased?.quote ?? "",
      nokName: plot.data?.nextOfKin?.name ?? "",
      relationship: plot.data?.nextOfKin?.relationship ?? "",
      phone: plot.data?.nextOfKin?.phone ?? "",
      email: plot.data?.nextOfKin?.email ?? "",
    });
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const req: UpdatePlotRequest = {
        deceased: {
          name: form.deceasedName,
          birthDate: form.birthDate,
          deathDate: form.deathDate,
          quote: form.quote || null,
        },
        nextOfKin: {
          name: form.nokName,
          relationship: form.relationship,
          phone: form.phone,
          email: form.email,
        },
      };
      const updated = await plotsApi.update(selected.id, req);
      setPlots((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelected(updated);
      showToast("Lưu thay đổi thành công!");
    } catch {
      showToast("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  function handleSendNotification() {
    console.log("[NOTIFY] Send email to", selected?.data?.nextOfKin?.email);
    showToast("Đã gửi email thông báo đến gia đình!");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <>
      <AdminNavbar title="Quản lý hồ sơ" subtitle="CRM" />
      <div className="flex-1 overflow-auto p-8">

        {/* Toast notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-(--color-primary) text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
            {toast}
          </div>
        )}

        {/* Toolbar: search + filter */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)"
            />
            <input
              type="text"
              placeholder="Tìm tên người mất hoặc mã mộ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-9 text-sm rounded-lg border border-(--color-border) bg-(--color-surface) outline-none focus:ring-2 focus:ring-(--color-primary)/20 text-(--color-text)"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-sm rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-text) outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Còn hạn</option>
            <option value="expiring">Sắp hết hạn</option>
            <option value="expired">Hết hạn</option>
          </select>
          <span className="text-sm text-(--color-muted)">{filtered.length} hồ sơ</span>
        </div>

        {/* Bảng danh sách hồ sơ */}
        <div className="bg-(--color-surface) rounded-lg border border-(--color-border) shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[80px_1fr_110px_140px_1fr_120px_110px_40px] gap-2 px-4 py-2.5 bg-(--color-bg) border-b border-(--color-border) text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
            <span>Mã mộ</span>
            <span>Họ tên người mất</span>
            <span>Ngày mất</span>
            <span>Vị trí</span>
            <span>Thân nhân</span>
            <span>Gói phí</span>
            <span>Trạng thái</span>
            <span />
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-(--color-muted)">
              <div className="w-6 h-6 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Đang tải...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-(--color-muted)">
              Không có hồ sơ nào
            </div>
          ) : (
            filtered.map((plot) => (
              <div
                key={plot.id}
                onClick={() => openDrawer(plot)}
                className="grid grid-cols-[80px_1fr_110px_140px_1fr_120px_110px_40px] gap-2 px-4 py-3 border-b border-(--color-border) hover:bg-(--color-bg) cursor-pointer items-center text-sm transition-colors"
              >
                <span className="font-mono text-xs font-semibold text-(--color-primary)">
                  {plot.id}
                </span>
                <span className="font-medium text-(--color-text) truncate">
                  {plot.data?.deceased?.name ?? "—"}
                </span>
                <span className="text-(--color-muted)">
                  {plot.data?.deceased?.deathDate ?? "—"}
                </span>
                <span className="text-(--color-muted)">
                  Khu {plot.zone}, H{plot.row + 1} S{plot.col + 1}
                </span>
                <div>
                  <div className="font-medium text-(--color-text) truncate">
                    {plot.data?.nextOfKin?.name ?? "—"}
                  </div>
                  <div className="text-xs text-(--color-muted)">
                    {plot.data?.nextOfKin?.relationship ?? ""}
                  </div>
                </div>
                <span className="text-(--color-muted) text-xs">
                  {plot.data?.maintenance?.package ?? "—"}
                </span>
                <StatusBadge status={plot.data?.maintenance?.status ?? ""} />
                <ChevronRight size={14} className="text-(--color-muted)" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Side Drawer chỉnh sửa hồ sơ */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setSelected(null)}
          />

          {/* Drawer panel */}
          <div className="relative w-[420px] h-full bg-(--color-surface) shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
              <div>
                <div className="font-semibold text-(--color-text)">{selected.id}</div>
                <div className="text-xs text-(--color-muted)">
                  Khu {selected.zone}, Hàng {selected.row + 1}, Số {selected.col + 1}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-(--color-bg)"
              >
                <X size={18} className="text-(--color-muted)" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-(--color-border)">
              {(
                [
                  ["deceased", "Người mất", User],
                  ["nok", "Thân nhân", Phone],
                  ["maintenance", "Bảo trì", Wrench],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === key
                      ? "border-(--color-primary) text-(--color-primary)"
                      : "border-transparent text-(--color-muted) hover:text-(--color-text)"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto p-5">
              {tab === "deceased" && (
                <div className="flex flex-col gap-4">
                  <Field
                    label="Họ và tên"
                    value={form.deceasedName}
                    onChange={(v) => setForm((f) => ({ ...f, deceasedName: v }))}
                  />
                  <Field
                    label="Ngày sinh"
                    value={form.birthDate}
                    onChange={(v) => setForm((f) => ({ ...f, birthDate: v }))}
                    placeholder="DD/MM/YYYY"
                  />
                  <Field
                    label="Ngày mất"
                    value={form.deathDate}
                    onChange={(v) => setForm((f) => ({ ...f, deathDate: v }))}
                    placeholder="DD/MM/YYYY"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
                      Lời tưởng nhớ
                    </label>
                    <textarea
                      rows={3}
                      value={form.quote}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quote: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:ring-2 focus:ring-(--color-primary)/20 resize-none text-(--color-text)"
                    />
                  </div>
                </div>
              )}

              {tab === "nok" && (
                <div className="flex flex-col gap-4">
                  <Field
                    label="Họ và tên thân nhân"
                    value={form.nokName}
                    onChange={(v) => setForm((f) => ({ ...f, nokName: v }))}
                  />
                  <Field
                    label="Mối quan hệ"
                    value={form.relationship}
                    onChange={(v) => setForm((f) => ({ ...f, relationship: v }))}
                  />
                  <Field
                    label="Số điện thoại"
                    value={form.phone}
                    onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  />
                  <Field
                    label="Email"
                    value={form.email}
                    onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    type="email"
                  />
                </div>
              )}

              {tab === "maintenance" && selected.data?.maintenance && (
                <div className="flex flex-col gap-4">
                  <InfoRow
                    label="Gói dịch vụ"
                    value={selected.data.maintenance.package}
                  />
                  <InfoRow
                    label="Giá"
                    value={
                      selected.data.maintenance.price.toLocaleString("vi-VN") + " ₫"
                    }
                  />
                  <InfoRow
                    label="Ngày hết hạn"
                    value={selected.data.maintenance.expiryDate}
                  />
                  <InfoRow
                    label="Còn lại"
                    value={`${selected.data.maintenance.daysLeft} ngày`}
                  />
                  <InfoRow
                    label="Trạng thái"
                    value={<StatusBadge status={selected.data.maintenance.status} />}
                  />
                </div>
              )}

              {tab === "maintenance" && !selected.data?.maintenance && (
                <div className="py-8 text-center text-sm text-(--color-muted)">
                  Chưa có thông tin bảo trì
                </div>
              )}
            </div>

            {/* Drawer footer */}
            <div className="p-5 border-t border-(--color-border) flex flex-col gap-2">
              {tab !== "maintenance" && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  <Save size={16} />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              )}
              <button
                onClick={handleSendNotification}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-(--color-border) text-(--color-text) text-sm font-medium hover:bg-(--color-bg) transition-colors"
              >
                <Send size={16} />
                Gửi thông báo email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Trường nhập liệu dùng chung
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-(--color-muted) uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:ring-2 focus:ring-(--color-primary)/20 text-(--color-text)"
      />
    </div>
  );
}

// Hàng thông tin chỉ đọc dùng trong tab bảo trì
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-(--color-border) last:border-0">
      <span className="text-sm text-(--color-muted)">{label}</span>
      <span className="text-sm font-medium text-(--color-text)">{value}</span>
    </div>
  );
}
