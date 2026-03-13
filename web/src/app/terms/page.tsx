import Link from "next/link";
import { PublicNavbar } from "@/components/customer/PublicNavbar";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-(--color-bg)">
      <PublicNavbar />
      <div className="flex-1 max-w-3xl mx-auto w-full py-10 px-6">
        <div className="flex items-center gap-2 text-sm text-(--color-muted) mb-6">
          <Link href="/" className="hover:text-(--color-text)">Trang chủ</Link>
          <span>/</span>
          <span className="text-(--color-text) font-medium">Điều khoản dịch vụ</span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-(--color-text) mb-8">Điều khoản dịch vụ</h1>

        <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-8 flex flex-col gap-6 text-sm text-(--color-text) leading-relaxed">
          <section>
            <h2 className="font-heading text-lg font-bold mb-2">1. Giới thiệu</h2>
            <p>Chào mừng bạn đến với An Nghỉ Viên — hệ thống quản lý nghĩa trang thông minh. Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản dưới đây.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">2. Tài khoản người dùng</h2>
            <p>Bạn có trách nhiệm bảo mật thông tin tài khoản, bao gồm email và mật khẩu. Mọi hoạt động dưới tài khoản của bạn là trách nhiệm của bạn. Nếu phát hiện truy cập trái phép, vui lòng liên hệ ngay với chúng tôi.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">3. Dịch vụ</h2>
            <p>An Nghỉ Viên cung cấp các dịch vụ bao gồm: tra cứu vị trí mộ phần, đặt chỗ mộ phần, dịch vụ chăm sóc mộ phần, đặt hoa tươi, dâng hương thay. Giá dịch vụ có thể thay đổi và sẽ được thông báo trước khi xác nhận đặt hàng.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">4. Thanh toán</h2>
            <p>Chúng tôi hỗ trợ thanh toán qua VNPay và MoMo. Mọi giao dịch được xử lý qua cổng thanh toán an toàn của bên thứ ba. Phí dịch vụ không hoàn lại sau khi dịch vụ đã được thực hiện.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">5. Quyền sở hữu trí tuệ</h2>
            <p>Tất cả nội dung trên nền tảng An Nghỉ Viên, bao gồm thiết kế, mã nguồn, hình ảnh và logo, thuộc sở hữu của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">6. Giới hạn trách nhiệm</h2>
            <p>An Nghỉ Viên không chịu trách nhiệm về các thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ. Chúng tôi cam kết bảo trì hệ thống ổn định nhưng không đảm bảo dịch vụ hoạt động liên tục 100%.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">7. Liên hệ</h2>
            <p>Nếu có thắc mắc về điều khoản dịch vụ, vui lòng liên hệ qua email: <strong>info@cemeteryiq.vn</strong> hoặc hotline: <strong>1900-xxxx</strong>.</p>
          </section>

          <p className="text-xs text-(--color-muted) mt-4">Cập nhật lần cuối: Tháng 3, 2026</p>
        </div>
      </div>
    </div>
  );
}
