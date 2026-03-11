"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, User, Users, Package, ChevronRight } from "lucide-react";
import { PublicNavbar } from "@/components/customer/PublicNavbar";
import { useAuth } from "@/lib/auth-context";
import { plotsApi, reserveApi, ApiError, type PlotDto, type DeceasedDto, type NextOfKinDto } from "@/lib/api";

const PACKAGES = [
  { id: "1 năm", label: "Gói 1 năm", price: "1.500.000 ₫", desc: "Chăm sóc cơ bản, vệ sinh 2 lần/tháng" },
  { id: "5 năm", label: "Gói 5 năm", price: "6.000.000 ₫", desc: "Chăm sóc nâng cao, vệ sinh 4 lần/tháng + cắm hoa" },
  { id: "Trọn đời", label: "Gói trọn đời", price: "20.000.000 ₫", desc: "Chăm sóc vĩnh viễn, dịch vụ ưu tiên" },
];

export default function ReservePage({ params }: { params: Promise<{ plotId: string }> }) {
  const { plotId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [plot, setPlot] = useState<PlotDto | null>(null);
  const [loadingPlot, setLoadingPlot] = useState(true);
  const [step, setStep] = useState(1); // 1=Người mất, 2=Thân nhân, 3=Gói + xác nhận
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [deceased, setDeceased] = useState<DeceasedDto>({ name: "", birthDate: "", deathDate: "", quote: null });
  const [nok, setNok] = useState<NextOfKinDto>({ name: "", relationship: "", phone: "", email: "" });
  const [pkg, setPkg] = useState("1 năm");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(`/reserve/${plotId}`)}`);
    }
  }, [authLoading, user, router, plotId]);

  // Load plot info
  useEffect(() => {
    plotsApi.getById(plotId)
      .then(data => {
        if (data.status !== "available") {
          setError("Ô mộ này hiện không còn trống.");
          setPlot(data);
        } else {
          setPlot(data);
        }
      })
      .catch(() => setError("Không tìm thấy ô mộ này."))
      .finally(() => setLoadingPlot(false));
  }, [plotId]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await reserveApi.reserve(plotId, { deceased, nextOfKin: nok, package: pkg });
      router.push(`/payment?plotId=${encodeURIComponent(plotId)}`);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/reserve/${plotId}`)}`);
        return;
      }
      setError(e instanceof Error ? e.message : "Đặt mộ thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loadingPlot) {
    return (
      <div className="flex flex-col min-h-screen">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const zone = plot ? `Khu ${plot.zone}, Hàng ${plot.row + 1}, Số ${plot.col + 1}` : plotId;

  return (
    <div className="flex flex-col min-h-screen bg-(--color-bg)">
      <PublicNavbar />

      {/* Header */}
      <div className="bg-(--color-primary) py-8 px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-(--color-sidebar-muted) text-sm mb-2">
            <Link href="/search" className="hover:text-white">Tìm kiếm</Link>
            <span>/</span>
            <span className="text-white">Đặt mộ phần</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">Đặt mộ phần</h1>
          <div className="flex items-center gap-1.5 text-(--color-sidebar-muted) text-sm mt-1">
            <MapPin size={14} className="text-(--color-secondary)" />
            <span>{zone}</span>
            <span className="ml-2 font-mono text-(--color-secondary)">{plotId}</span>
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="bg-white border-b border-(--color-border)">
        <div className="max-w-2xl mx-auto flex items-center gap-0 px-8 py-4">
          {[
            { n: 1, label: "Người mất" },
            { n: 2, label: "Thân nhân" },
            { n: 3, label: "Gói & Xác nhận" },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > n
                      ? "bg-(--color-secondary) text-white"
                      : step === n
                      ? "bg-(--color-primary) text-white"
                      : "bg-(--color-bg) text-(--color-muted) border border-(--color-border)"
                  }`}
                >
                  {step > n ? "✓" : n}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    step === n ? "text-(--color-text)" : "text-(--color-muted)"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < 2 && <ChevronRight size={16} className="text-(--color-border) mx-3" />}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-8 py-8">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Người mất */}
        {step === 1 && (
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6 flex flex-col gap-5">
            <h2 className="font-heading text-lg font-bold text-(--color-text) flex items-center gap-2">
              <User size={18} className="text-(--color-primary)" />
              Thông tin người mất
            </h2>
            <div className="flex flex-col gap-4">
              <Field label="Họ và tên *" value={deceased.name} onChange={v => setDeceased(d => ({ ...d, name: v }))} placeholder="Nguyễn Văn A" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày sinh" value={deceased.birthDate} onChange={v => setDeceased(d => ({ ...d, birthDate: v }))} placeholder="01/01/1940" />
                <Field label="Ngày mất *" value={deceased.deathDate} onChange={v => setDeceased(d => ({ ...d, deathDate: v }))} placeholder="15/06/2023" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-(--color-text)">Câu trích dẫn / Lời nhắn</label>
                <textarea
                  value={deceased.quote ?? ""}
                  onChange={e => setDeceased(d => ({ ...d, quote: e.target.value || null }))}
                  placeholder="Mãi trong tim gia đình..."
                  rows={3}
                  className="px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:border-(--color-primary) resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                disabled={!deceased.name || !deceased.deathDate}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Thân nhân */}
        {step === 2 && (
          <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6 flex flex-col gap-5">
            <h2 className="font-heading text-lg font-bold text-(--color-text) flex items-center gap-2">
              <Users size={18} className="text-(--color-primary)" />
              Thông tin thân nhân liên hệ
            </h2>
            <div className="flex flex-col gap-4">
              <Field label="Họ và tên *" value={nok.name} onChange={v => setNok(n => ({ ...n, name: v }))} placeholder="Nguyễn Thị B" />
              <Field label="Mối quan hệ *" value={nok.relationship} onChange={v => setNok(n => ({ ...n, relationship: v }))} placeholder="Con gái" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Số điện thoại *" value={nok.phone} onChange={v => setNok(n => ({ ...n, phone: v }))} placeholder="0901234567" type="tel" />
                <Field label="Email" value={nok.email} onChange={v => setNok(n => ({ ...n, email: v }))} placeholder="example@email.com" type="email" />
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg border border-(--color-border) text-(--color-text) text-sm font-medium hover:bg-(--color-bg)">
                Quay lại
              </button>
              <button
                disabled={!nok.name || !nok.relationship || !nok.phone}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-lg bg-(--color-primary) text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Gói + xác nhận */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            {/* Package selection */}
            <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6 flex flex-col gap-4">
              <h2 className="font-heading text-lg font-bold text-(--color-text) flex items-center gap-2">
                <Package size={18} className="text-(--color-primary)" />
                Chọn gói bảo trì
              </h2>
              {PACKAGES.map(p => (
                <label
                  key={p.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    pkg === p.id
                      ? "border-(--color-primary) bg-(--color-primary)/5"
                      : "border-(--color-border) hover:border-(--color-primary)/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    value={p.id}
                    checked={pkg === p.id}
                    onChange={() => setPkg(p.id)}
                    className="mt-0.5 accent-(--color-primary)"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-(--color-text) text-sm">{p.label}</span>
                      <span className="font-bold text-(--color-secondary) text-sm">{p.price}</span>
                    </div>
                    <p className="text-xs text-(--color-muted) mt-0.5">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-6 flex flex-col gap-3">
              <h3 className="font-semibold text-(--color-text) text-sm">Xác nhận thông tin</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ["Ô mộ", `${plotId} — ${zone}`],
                  ["Người mất", deceased.name],
                  ["Ngày mất", deceased.deathDate],
                  ["Thân nhân", `${nok.name} (${nok.relationship})`],
                  ["Liên hệ", nok.phone],
                  ["Gói bảo trì", PACKAGES.find(p => p.id === pkg)?.label ?? pkg],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <span className="text-(--color-muted) text-xs">{k}</span>
                    <span className="font-medium text-(--color-text)">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg border border-(--color-border) text-(--color-text) text-sm font-medium hover:bg-(--color-bg)">
                Quay lại
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="px-8 py-2.5 rounded-lg bg-(--color-secondary) text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận đặt mộ"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-(--color-text)">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) outline-none focus:border-(--color-primary)"
      />
    </div>
  );
}
