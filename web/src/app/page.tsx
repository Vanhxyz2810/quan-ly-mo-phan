import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  MapPin,
  Layers,
  Navigation,
  ScanLine,
  Map,
  Compass,
  Heart,
  Building2,
  Landmark,
  Trees,
  ShieldCheck,
  Smartphone,
  Bell,
  Camera,
  QrCode,
  Apple,
  Play,
  Phone,
  Facebook,
  Youtube,
  Mail,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { PublicNavbar } from "@/components/customer/PublicNavbar";

/* ───── Data ───── */

const services = [
  {
    icon: "🌿",
    title: "Chăm sóc phần mộ",
    desc: "Dịch vụ dọn dẹp, trồng hoa và bảo quản mộ phần theo định kỳ bởi đội ngũ chuyên nghiệp.",
    highlight: false,
  },
  {
    icon: "🪔",
    title: "Dâng hương thay",
    desc: "Chúng tôi thắp hương, dâng hoa thay mặt gia đình vào mùng 1, rằm và các ngày lễ đặc biệt.",
    highlight: true,
  },
  {
    icon: "⚱️",
    title: "Dời cát / Cải táng",
    desc: "Dịch vụ dời cát, cải táng trang trọng với đội ngũ có kinh nghiệm, đảm bảo phong tục truyền thống.",
    highlight: false,
  },
];

const stats = [
  { value: "10,000+", label: "Ngôi mộ đã số hóa" },
  { value: "5,000+", label: "Gia đình tin dùng" },
  { value: "50,000+", label: "Lượt viếng thăm trực tuyến" },
  { value: "24/7", label: "Hỗ trợ trực tuyến" },
];

const steps = [
  {
    num: "1",
    icon: Search,
    title: "Tìm kiếm người thân",
    desc: "Nhập tên hoặc thông tin người đã mất để tìm kiếm nhanh chóng trong hệ thống.",
  },
  {
    num: "2",
    icon: MapPin,
    title: "Định vị vị trí mộ",
    desc: "Xem vị trí chính xác trên bản đồ GIS tương tác và nhận chỉ đường tới nơi.",
  },
  {
    num: "3",
    icon: Heart,
    title: "Đăng ký chăm sóc",
    desc: "Đăng ký dịch vụ chăm sóc mộ phần hoặc thắp hương từ xa cho người thân yêu.",
  },
];

const memorials = [
  {
    name: "Nguyễn Văn An",
    dates: "1942 — 2020",
    quote: "Một người cha tận tụy, người thầy đáng kính và tấm gương sáng cho cả gia đình.",
    img: "/images/memorial-1.png",
  },
  {
    name: "Trần Thị Hoa",
    dates: "1938 — 2019",
    quote: "Người mẹ hiền với trái tim ấm áp, luôn dành trọn tình yêu cho con cháu.",
    img: "/images/memorial-2.png",
  },
  {
    name: "Lê Minh Đức",
    dates: "1935 — 2021",
    quote: "Chiến sĩ kiên cường, người cống hiến cả đời cho quê hương đất nước.",
    img: "/images/memorial-3.png",
  },
];

const partners = [
  { icon: Building2, name: "Ban QLNT Tp.HCM" },
  { icon: Landmark, name: "Quỹ Đền ơn Đáp nghĩa" },
  { icon: Trees, name: "Nghĩa trang Bình An" },
  { icon: ShieldCheck, name: "Hội Cựu chiến binh" },
];

const testimonials = [
  {
    stars: 5,
    quote:
      "Nhờ CemeteryIQ, gia đình tôi dễ dàng tìm được vị trí mộ ông bà dù ở xa hàng trăm km. Dịch vụ thắp hương từ xa rất tận tâm.",
    name: "Nguyễn Thị Mai",
    role: "Gia đình tại Hà Nội",
    initials: "NT",
    color: "bg-(--color-primary)",
  },
  {
    stars: 5,
    quote:
      "Bản đồ GIS giúp chúng tôi quản lý hơn 3,000 ngôi mộ một cách chuyên nghiệp và tiết kiệm rất nhiều thời gian.",
    name: "Phạm Văn Hùng",
    role: "Quản lý Nghĩa trang Bình An",
    initials: "PV",
    color: "bg-(--color-secondary)",
  },
];

/* ───── Page ───── */

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PublicNavbar />

      {/* ── Hero ── */}
      <section className="bg-(--color-primary) flex flex-col items-center justify-center gap-6 py-24 px-10">
        <h1 className="font-heading text-5xl font-bold text-white text-center leading-tight max-w-2xl">
          Tìm kiếm người thân yêu
        </h1>
        <p className="text-(--color-sidebar-muted) text-lg text-center max-w-xl">
          Hệ thống tra cứu vị trí mộ phần trực tuyến — nhanh chóng, chính xác,
          tận tâm
        </p>

        {/* Search bar */}
        <div className="flex items-center gap-3 w-[680px] h-[60px] bg-white rounded-full px-5 shadow-lg">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Nhập tên người mất để tìm kiếm..."
            className="flex-1 text-base outline-none placeholder:text-gray-400 text-(--color-text)"
          />
          <Link
            href="/search"
            className="flex items-center gap-2 px-5 h-11 rounded-full bg-(--color-secondary) text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Tìm kiếm <ArrowRight size={16} />
          </Link>
        </div>

        {/* Inline stats */}
        <div className="flex items-center gap-12">
          {[
            "1,248+ mộ phần",
            "98% tra cứu thành công",
            "Miễn phí tra cứu",
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <div className="w-px h-4 bg-white/30" />}
              <span className="text-(--color-sidebar-muted) text-sm font-medium">
                {s}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-(--color-primary-dark) flex items-center justify-around py-8 px-20">
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center gap-8">
            {i > 0 && (
              <div className="w-px h-12 bg-white/15" />
            )}
            <div className="flex flex-col items-center gap-1">
              <span className="font-heading text-4xl font-bold text-(--color-secondary)">
                {s.value}
              </span>
              <span className="text-(--color-sidebar-muted) text-sm font-medium">
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── GIS Preview ── */}
      <section className="bg-white flex items-center gap-16 py-16 px-20">
        {/* Left – text */}
        <div className="flex-1 flex flex-col gap-5">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#F0F7F4] px-4 py-1.5 text-xs font-semibold text-(--color-primary)">
            <MapPin size={14} /> Công nghệ GIS
          </span>

          <h2 className="font-heading text-4xl font-bold text-(--color-text) leading-snug">
            Trải nghiệm Nghĩa trang Số
          </h2>

          <p className="text-(--color-muted) text-base leading-relaxed">
            Hệ thống bản đồ GIS tương tác cho phép bạn xem toàn bộ sơ đồ nghĩa
            trang, định vị chính xác từng vị trí mộ phần và điều hướng dễ dàng
            từ bất kỳ đâu.
          </p>

          <ul className="flex flex-col gap-3 mt-2">
            {[
              { icon: Layers, text: "Bản đồ vệ tinh & sơ đồ 2D chi tiết" },
              {
                icon: Navigation,
                text: "Điều hướng real-time đến vị trí mộ phần",
              },
              {
                icon: ScanLine,
                text: "Mã QR gắn tại bia mộ — quét để xem tiểu sử",
              },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#F0F7F4] flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-(--color-primary)" />
                </span>
                <span className="text-sm font-medium text-(--color-text)">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right – map preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-[560px] h-[340px] rounded-xl overflow-hidden bg-[#2D5A27]">
            <Image
              src="/images/cemetery-aerial.png"
              alt="Bản đồ GIS nghĩa trang"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-(--color-primary)/25" />
            {/* Map pins */}
            <div className="absolute top-[120px] left-[180px] w-6 h-6 rounded-full bg-(--color-map-available) shadow-lg" />
            <div className="absolute top-[200px] left-[300px] w-6 h-6 rounded-full bg-(--color-map-occupied) shadow-lg" />
            <div className="absolute top-[150px] left-[400px] w-6 h-6 rounded-full bg-(--color-map-reserved) shadow-lg" />
          </div>

          <Link
            href="/admin/gis"
            className="flex items-center gap-2 h-12 px-7 rounded-lg bg-(--color-primary) text-white text-[15px] font-semibold hover:opacity-90 transition-opacity"
          >
            <Map size={18} className="text-(--color-secondary)" />
            Xem sơ đồ tổng thể
          </Link>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="flex flex-col items-center gap-8 py-16 px-16 bg-white">
        <h2 className="font-heading text-3xl font-bold text-(--color-text)">
          Dịch vụ của chúng tôi
        </h2>
        <div className="flex gap-6 w-full max-w-5xl">
          {services.map((svc) => (
            <div
              key={svc.title}
              className={`flex-1 rounded-xl p-7 flex flex-col gap-4 ${
                svc.highlight
                  ? "bg-(--color-primary)"
                  : "bg-(--color-bg)"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  svc.highlight
                    ? "bg-white/12"
                    : "bg-[#F0F7F4]"
                }`}
              >
                {svc.icon}
              </div>
              <h3
                className={`font-heading text-lg font-bold ${
                  svc.highlight ? "text-white" : "text-(--color-text)"
                }`}
              >
                {svc.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  svc.highlight
                    ? "text-(--color-sidebar-muted)"
                    : "text-(--color-muted)"
                }`}
              >
                {svc.desc}
              </p>
              <button
                className={`mt-auto self-start flex items-center gap-2 h-10 px-5 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 ${
                  svc.highlight
                    ? "bg-(--color-secondary) text-white"
                    : "bg-(--color-primary) text-white"
                }`}
              >
                {svc.highlight ? "Đặt dịch vụ" : "Xem dịch vụ"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#F0F7F4] flex flex-col items-center gap-12 py-16 px-20">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary) px-4 py-1.5 text-xs font-semibold text-white">
            <Compass size={14} className="text-(--color-secondary)" />
            Đơn giản &amp; Nhanh chóng
          </span>
          <h2 className="font-heading text-4xl font-bold text-(--color-text) text-center">
            Quy trình 3 bước
          </h2>
          <p className="text-(--color-muted) text-base text-center">
            Chỉ cần vài thao tác đơn giản để tìm và chăm sóc phần mộ người thân
          </p>
        </div>

        {/* Steps */}
        <div className="flex gap-8 w-full max-w-5xl">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="flex-1 bg-white rounded-xl p-8 flex flex-col items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-(--color-primary) flex items-center justify-center">
                  <span className="font-heading text-2xl font-bold text-(--color-secondary)">
                    {step.num}
                  </span>
                </div>
                <Icon size={32} className="text-(--color-primary)" />
                <h3 className="font-heading text-lg font-bold text-(--color-text) text-center">
                  {step.title}
                </h3>
                <p className="text-sm text-(--color-muted) text-center leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Memorial Showcase ── */}
      <section className="bg-(--color-primary) flex flex-col items-center gap-10 py-16 px-20">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-secondary)/20 px-4 py-1.5 text-xs font-semibold text-(--color-secondary)">
            <Sparkles size={14} />
            Không gian Tưởng niệm
          </span>
          <h2 className="font-heading text-4xl font-bold text-white text-center">
            Những câu chuyện bất tử
          </h2>
          <p className="text-(--color-sidebar-muted) text-base text-center">
            Lưu giữ ký ức và tôn vinh cuộc đời người đã khuất qua trang tưởng
            niệm số
          </p>
        </div>

        {/* Cards */}
        <div className="flex gap-6 w-full max-w-5xl">
          {memorials.map((m) => (
            <div
              key={m.name}
              className="flex-1 rounded-xl overflow-hidden bg-white/6"
            >
              {/* Photo */}
              <div className="w-full h-[180px] relative">
                <Image
                  src={m.img}
                  alt={m.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <h3 className="font-heading text-lg font-bold text-white">
                  {m.name}
                </h3>
                <span className="text-(--color-sidebar-muted) text-[13px]">
                  {m.dates}
                </span>
                <p className="text-(--color-sidebar-muted) text-[13px] italic leading-relaxed">
                  &ldquo;{m.quote}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust & Social Proof ── */}
      <section className="bg-white flex flex-col items-center gap-12 py-16 px-20">
        <div className="flex flex-col items-center gap-3">
          <h2 className="font-heading text-4xl font-bold text-(--color-text) text-center">
            Được tin tưởng bởi hàng nghìn gia đình
          </h2>
          <p className="text-(--color-muted) text-base text-center">
            Các đơn vị quản lý nghĩa trang và gia đình trên cả nước đã tin dùng
            hệ thống
          </p>
        </div>

        {/* Partners */}
        <div className="flex items-center justify-center gap-12">
          {partners.map(({ icon: Icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-[#F0F7F4] flex items-center justify-center">
                <Icon size={28} className="text-(--color-primary)" />
              </div>
              <span className="text-xs font-medium text-(--color-muted) text-center">
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="flex gap-6 w-full max-w-5xl">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex-1 bg-(--color-bg) rounded-xl p-7 flex flex-col gap-4"
            >
              <span className="text-(--color-secondary) text-base">
                {"★".repeat(t.stars)}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center`}
                >
                  <span className="text-white text-sm font-bold">
                    {t.initials}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-(--color-text)">
                    {t.name}
                  </span>
                  <span className="text-xs text-(--color-muted)">
                    {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mobile App Promo ── */}
      <section className="bg-(--color-primary-dark) flex items-center gap-16 py-16 px-20">
        {/* Left – text */}
        <div className="flex-1 flex flex-col gap-6">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-(--color-secondary)/20 px-4 py-1.5 text-xs font-semibold text-(--color-secondary)">
            <Smartphone size={14} />
            Ứng dụng di động
          </span>

          <h2 className="font-heading text-[32px] font-bold text-white leading-snug">
            Quản lý mộ phần ngay trên điện thoại
          </h2>

          <p className="text-(--color-sidebar-muted) text-base leading-relaxed">
            Tải ứng dụng CemeteryIQ để nhận thông báo ngày giỗ, theo dõi quá
            trình chăm sóc mộ phần qua hình ảnh, và đặt dịch vụ mọi lúc mọi
            nơi.
          </p>

          <ul className="flex flex-col gap-3">
            {[
              { icon: Bell, text: "Nhận thông báo ngày giỗ tự động" },
              { icon: Camera, text: "Theo dõi chăm sóc qua hình ảnh" },
              { icon: QrCode, text: "Quét QR tại bia mộ để xem tiểu sử" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon size={18} className="text-(--color-secondary)" />
                <span className="text-sm font-medium text-white">{text}</span>
              </li>
            ))}
          </ul>

          {/* Download buttons */}
          <div className="flex gap-4 mt-2">
            <button className="flex items-center gap-2 h-12 px-5 rounded-lg bg-white text-(--color-primary) text-sm font-semibold hover:opacity-90 transition-opacity">
              <Apple size={20} />
              App Store
            </button>
            <button className="flex items-center gap-2 h-12 px-5 rounded-lg bg-white/12 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
              <Play size={20} />
              Google Play
            </button>
          </div>
        </div>

        {/* Right – phone mockup */}
        <div className="w-[340px] h-[400px] flex items-center justify-center">
          <div className="w-[220px] h-[380px] rounded-[28px] bg-white overflow-hidden shadow-2xl flex flex-col">
            <div className="h-12 bg-(--color-primary) flex items-center justify-center">
              <span className="font-heading text-sm font-bold text-white">
                CemeteryIQ
              </span>
            </div>
            <div className="flex-1 bg-(--color-bg) flex flex-col gap-3 p-4">
              <span className="text-[13px] font-bold text-(--color-text)">
                Nhiệm vụ hôm nay
              </span>
              {[
                { t: "Chăm sóc mộ A-03", d: "Khu A · Hàng 3 · Vị trí 15" },
                { t: "Thắp hương mùng 1", d: "Khu B · 5 mộ phần" },
                { t: "Cập nhật ảnh mộ C-12", d: "Khu C · Hàng 1 · Vị trí 12" },
              ].map((c) => (
                <div
                  key={c.t}
                  className="bg-white rounded-lg p-3 flex flex-col gap-1"
                >
                  <span className="text-xs font-semibold text-(--color-text)">
                    {c.t}
                  </span>
                  <span className="text-[10px] text-(--color-muted)">
                    {c.d}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        id="lien-he"
        className="bg-(--color-primary) flex flex-col gap-10 py-12 px-20"
      >
        <div className="flex gap-16">
          {/* Brand column */}
          <div className="w-[320px] flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-lg bg-(--color-secondary) flex items-center justify-center">
                <span className="text-white text-sm font-bold">✦</span>
              </div>
              <span className="font-heading text-xl font-bold text-white">
                CemeteryIQ
              </span>
            </div>
            <p className="text-sm text-(--color-sidebar-muted) leading-relaxed">
              Hệ thống quản lý nghĩa trang thông minh — kết nối tâm linh với
              công nghệ hiện đại.
            </p>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-(--color-secondary)" />
              <span className="text-sm font-semibold text-white">
                Hotline 24/7: 1900-xxxx
              </span>
            </div>
            <div className="flex gap-3">
              {[Facebook, Youtube, Mail].map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Icon size={18} className="text-(--color-sidebar-muted)" />
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="flex-1 flex gap-16">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white">Dịch vụ</h4>
              {[
                "Chăm sóc mộ phần",
                "Dâng hương thay",
                "Cải táng / Dời cát",
                "Cúng giỗ định kỳ",
              ].map((l) => (
                <Link
                  key={l}
                  href="#"
                  className="text-sm text-(--color-sidebar-muted) hover:text-white transition-colors"
                >
                  {l}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white">Hỗ trợ</h4>
              {[
                "Hướng dẫn sử dụng",
                "Câu hỏi thường gặp",
                "Liên hệ hỗ trợ",
                "Chính sách bảo mật",
              ].map((l) => (
                <Link
                  key={l}
                  href="#"
                  className="text-sm text-(--color-sidebar-muted) hover:text-white transition-colors"
                >
                  {l}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white">Liên hệ</h4>
              {[
                { icon: MapPin, text: "123 Đường ABC, Q.1, TP.HCM" },
                { icon: Clock, text: "Thứ 2 – Chủ nhật: 7:00 – 17:00" },
                { icon: Mail, text: "info@cemeteryiq.vn" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon
                    size={14}
                    className="text-(--color-secondary) shrink-0"
                  />
                  <span className="text-[13px] text-(--color-sidebar-muted)">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-[13px] text-(--color-neutral) text-center">
            © 2026 CemeteryIQ. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
}
