import Link from "next/link";
import { PublicNavbar } from "@/components/customer/PublicNavbar";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-(--color-bg)">
      <PublicNavbar />
      <div className="flex-1 max-w-3xl mx-auto w-full py-10 px-6">
        <div className="flex items-center gap-2 text-sm text-(--color-muted) mb-6">
          <Link href="/" className="hover:text-(--color-text)">Trang chủ</Link>
          <span>/</span>
          <span className="text-(--color-text) font-medium">Chính sách bảo mật</span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-(--color-text) mb-8">Chính sách bảo mật</h1>

        <div className="bg-(--color-surface) rounded-xl border border-(--color-border) p-8 flex flex-col gap-6 text-sm text-(--color-text) leading-relaxed">
          <section>
            <h2 className="font-heading text-lg font-bold mb-2">1. Thu thập thông tin</h2>
            <p>Chúng tôi thu thập các thông tin cần thiết khi bạn đăng ký tài khoản: họ tên, email, số điện thoại. Khi sử dụng dịch vụ, chúng tôi cũng thu thập thông tin giao dịch và lịch sử đặt hàng.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">2. Sử dụng thông tin</h2>
            <p>Thông tin cá nhân được sử dụng để: cung cấp dịch vụ đã đặt, liên hệ về trạng thái đơn hàng, gửi thông báo ngày giỗ (nếu đăng ký), và cải thiện chất lượng dịch vụ.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">3. Bảo mật dữ liệu</h2>
            <p>Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành bao gồm mã hóa JWT cho xác thực, HTTPS cho truyền tải dữ liệu, và mã hóa mật khẩu. Dữ liệu thanh toán được xử lý hoàn toàn qua cổng VNPay/MoMo, chúng tôi không lưu trữ thông tin thẻ.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">4. Chia sẻ thông tin</h2>
            <p>Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Thông tin chỉ được chia sẻ khi: có yêu cầu từ cơ quan pháp luật, hoặc cần thiết để thực hiện dịch vụ (ví dụ: đối tác cung cấp hoa tươi).</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">5. Lưu trữ hình ảnh</h2>
            <p>Ảnh người mất được tải lên và lưu trữ trên dịch vụ Cloudinary với bảo mật cấp doanh nghiệp. Bạn có quyền yêu cầu xóa ảnh bất kỳ lúc nào.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">6. Quyền của bạn</h2>
            <p>Bạn có quyền: xem, chỉnh sửa hoặc xóa thông tin cá nhân; hủy tài khoản; và yêu cầu xuất dữ liệu cá nhân. Liên hệ với chúng tôi để thực hiện các yêu cầu này.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold mb-2">7. Liên hệ</h2>
            <p>Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ: <strong>info@cemeteryiq.vn</strong></p>
          </section>

          <p className="text-xs text-(--color-muted) mt-4">Cập nhật lần cuối: Tháng 3, 2026</p>
        </div>
      </div>
    </div>
  );
}
