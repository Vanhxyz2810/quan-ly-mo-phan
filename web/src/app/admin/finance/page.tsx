import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const packages = [
  {
    name: "Gói 1 năm",
    price: "1,500,000 VNĐ / năm",
    features: [
      "Duy tu cỏ hàng tháng",
      "Thay hoa mùng 1 & 15",
      "Ảnh báo cáo định kỳ",
    ],
    highlight: false,
    tag: null,
  },
  {
    name: "Gói 5 năm",
    price: "6,000,000 VNĐ / 5 năm",
    features: [
      "Tiết kiệm 17% so với gói năm",
      "Tất cả dịch vụ gói 1 năm",
      "Ưu tiên lịch dịch vụ đặc biệt",
    ],
    highlight: true,
    tag: "Phổ biến",
  },
  {
    name: "Gói Trọn đời",
    price: "15,000,000 VNĐ",
    features: [
      "Tất cả dịch vụ gói 5 năm",
      "Đặt nghi thức hàng năm",
      "Không giới hạn thời gian",
    ],
    highlight: false,
    tag: null,
  },
];

export default function FinancePage() {
  return (
    <>
      <AdminNavbar title="Tài chính & Dịch vụ" subtitle="Quản lý" />
      <div className="flex-1 overflow-auto p-8">
        <h2 className="font-heading text-[22px] font-bold text-(--color-text) mb-8">
          Chọn gói duy tu phù hợp
        </h2>

        <div className="flex gap-5 max-w-4xl">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`flex-1 rounded-xl flex flex-col gap-4 p-7 border relative ${
                pkg.highlight
                  ? "bg-(--color-primary) border-(--color-primary) text-white shadow-xl"
                  : "bg-(--color-surface) border-(--color-border)"
              }`}
            >
              {pkg.tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-(--color-secondary) text-white text-xs font-bold shadow">
                  {pkg.tag}
                </span>
              )}
              <h3
                className={`font-heading text-lg font-bold ${
                  pkg.highlight ? "text-white" : "text-(--color-text)"
                }`}
              >
                {pkg.name}
              </h3>
              <p
                className={`text-xl font-bold ${
                  pkg.highlight ? "text-(--color-secondary)" : "text-red-500"
                }`}
              >
                {pkg.price}
              </p>
              <ul className="flex flex-col gap-2">
                {pkg.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${
                      pkg.highlight ? "text-white/90" : "text-(--color-muted)"
                    }`}
                  >
                    <Check
                      size={14}
                      className={`mt-0.5 shrink-0 ${
                        pkg.highlight ? "text-(--color-secondary)" : "text-green-500"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                {pkg.highlight ? (
                  <Button
                    variant="primary"
                    className="w-full bg-(--color-secondary) border-(--color-secondary)"
                  >
                    Chọn gói này
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    Chọn gói này
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
