# CemeteryIQ — Hệ thống Quản lý Nghĩa trang Thông minh

Phần mềm quản lý nghĩa trang tích hợp bản đồ GIS, CRM khách hàng, quản lý dịch vụ và tài chính. Xây dựng với Next.js (frontend) và ASP.NET Core (backend).

## Tính năng chính

### Khách hàng (Customer)
- **Trang chủ** — Landing page giới thiệu, tìm kiếm nhanh
- **Tra cứu người đã mất** (`/search`) — Bản đồ GIS tương tác, tìm kiếm theo tên, tự động zoom đến mộ phần
- **Đặt mộ phần** (`/book`) — Duyệt vị trí trống trên bản đồ, chọn ô xanh để đặt
- **Đăng ký mộ phần** (`/reserve/[plotId]`) — Form 3 bước: thông tin người mất → thân nhân → gói bảo trì
- **Trang tưởng niệm** (`/memorial/[id]`) — Thông tin chi tiết về người đã mất
- **Thanh toán** (`/payment`) — Hỗ trợ VNPay và MoMo
- **Đơn dịch vụ** (`/orders`) — Đặt dịch vụ chăm sóc mộ, hoa tươi, dâng hương
- **Đăng nhập / Đăng ký** — Xác thực JWT, phân quyền theo role

### Quản trị (Admin Panel)
- **Tổng quan** (`/admin`) — Dashboard thống kê: tổng mộ phần, tỉ lệ lấp đầy, cảnh báo phí hết hạn, biểu đồ tròn phân bổ, đơn dịch vụ gần đây
- **Bản đồ GIS** (`/admin/gis`) — Bản đồ canvas tương tác với Konva.js
  - Chế độ Xem: zoom/pan, tìm kiếm, lọc theo khu vực/trạng thái, heatmap phí duy tu
  - Chế độ Sửa (Admin): click ô trống để thêm mộ, đổi trạng thái (Trống/Đã lấp/Đã đặt), xóa mộ, sửa thông tin người mất & thân nhân, undo/redo, lưu thay đổi về API
  - Minimap, chú thích trạng thái, phím tắt
- **Hồ sơ CRM** (`/admin/crm`) — Danh sách hồ sơ khách hàng, tìm kiếm, chỉnh sửa thông tin
- **Đơn dịch vụ** (`/admin/orders`) — Quản lý đơn: thống kê, lọc theo trạng thái, đổi status (Chờ → Xác nhận → Hoàn thành / Hủy)
- **Tài chính** (`/admin/finance`) — Quản lý phí duy tu, gia hạn gói bảo trì
- **Lịch dịch vụ** (`/admin/calendar`) — Lịch tháng hiển thị sự kiện bảo trì hết hạn và đơn dịch vụ
- **Thông báo** — Dropdown trên navbar: phí hết hạn, đơn mới, đặt mộ mới
- **Cài đặt** (`/admin/settings`) — Thông tin hệ thống, bảng giá dịch vụ, gói bảo trì

### Bản đồ GIS
- Render canvas bằng **Konva.js** (react-konva), không dùng tile map
- 4 khu vực (A, B, C, D) với grid mộ phần
- Đồ họa: cây cối, đường đi, cổng nghĩa trang, hiệu ứng glassmorphism trên ô mộ
- LOD (Level of Detail): zoom xa → chỉ hiện dot màu, zoom gần → hiện đầy đủ tên, năm, icon cảnh báo
- Heatmap overlay: màu đỏ (hết hạn), cam (sắp hết), vàng (< 90 ngày), xanh (bình thường)

## Công nghệ

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| GIS Canvas | Konva.js + react-konva (client-side only, SSR disabled) |
| Backend | ASP.NET Core 8, C#, Clean Architecture |
| Database | SQL Server + Entity Framework Core |
| Auth | ASP.NET Identity + JWT (HS256) |
| Payment | VNPay, MoMo |
| Upload | Cloudinary |
| Icons | Lucide React |
| Fonts | Playfair Display (headings), Inter (body) |

## Cấu trúc dự án

```
quan-ly-mo-phan/
├── api/                          # Backend ASP.NET Core
│   └── src/
│       ├── CemeteryIQ.Api/       # Controllers, Middleware, Program.cs
│       ├── CemeteryIQ.Core/      # Entities, DTOs, Interfaces
│       └── CemeteryIQ.Infrastructure/  # EF Core, Repositories, Services
│
├── web/                          # Frontend Next.js
│   └── src/
│       ├── app/                  # Pages (App Router)
│       │   ├── admin/            # Admin panel routes
│       │   ├── search/           # Tra cứu
│       │   ├── book/             # Đặt mộ
│       │   ├── reserve/          # Đăng ký mộ phần
│       │   ├── memorial/         # Trang tưởng niệm
│       │   └── payment/          # Thanh toán
│       ├── components/
│       │   ├── gis/              # GIS canvas, PlotRect, hooks, types
│       │   ├── admin/            # AdminSidebar, AdminNavbar
│       │   ├── customer/         # PublicNavbar
│       │   └── ui/               # Button, Badge, ...
│       └── lib/
│           ├── api.ts            # API client (typed fetch + JWT)
│           └── auth-context.tsx  # Auth provider
│
└── CLAUDE.md                     # AI assistant instructions
```

## Cài đặt & Chạy

### Yêu cầu
- **Node.js** >= 18
- **.NET SDK** 8.0
- **SQL Server** (LocalDB hoặc Express)

### 1. Backend

```bash
cd api

# Cấu hình connection string (appsettings.json hoặc user-secrets)
# Mặc định: Server=localhost;Database=CemeteryIQ;Trusted_Connection=True;

# Chạy (sẽ tự migrate database + seed dữ liệu mẫu)
dotnet run --project src/CemeteryIQ.Api
```

API chạy tại: `http://localhost:5154`
Swagger UI: `http://localhost:5154/swagger`

### 2. Frontend

```bash
cd web

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Web chạy tại: `http://localhost:3000`

### 3. Tài khoản mặc định

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| admin@cemeteryiq.vn | admin123 | Admin |

> Tài khoản admin được tạo tự động khi khởi động backend lần đầu.

## API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/login` | Đăng nhập | Public |
| POST | `/api/auth/register` | Đăng ký | Public |
| GET | `/api/zones` | Danh sách khu vực | Public |
| GET | `/api/plots` | Danh sách mộ phần (filter: zone, status) | Public |
| GET | `/api/plots/{id}` | Chi tiết mộ phần | Public |
| POST | `/api/plots` | Tạo mộ phần mới | Admin |
| PUT | `/api/plots/{id}` | Cập nhật mộ phần (status, deceased, nextOfKin, maintenance) | Admin |
| PUT | `/api/plots/{id}/move` | Di chuyển mộ phần | Admin |
| DELETE | `/api/plots/{id}` | Xóa mộ phần | Admin |
| POST | `/api/plots/{id}/reserve` | Đặt mộ phần | Authenticated |
| GET | `/api/search?q=...` | Tìm kiếm toàn văn | Public |
| GET | `/api/dashboard/stats` | Thống kê dashboard | Admin/Staff |
| GET | `/api/maintenance` | Danh sách phí duy tu | Admin/Staff |
| POST | `/api/maintenance/{plotId}/renew` | Gia hạn phí | Admin/Staff |
| GET | `/api/serviceorders` | Danh sách đơn dịch vụ | Admin/Staff |
| POST | `/api/serviceorders` | Tạo đơn dịch vụ | Authenticated |
| PUT | `/api/serviceorders/{id}/status` | Đổi trạng thái đơn | Admin/Staff |
| GET | `/api/serviceorders/catalog` | Bảng giá dịch vụ | Public |
| POST | `/api/payment/vnpay/create` | Tạo thanh toán VNPay | Authenticated |
| POST | `/api/payment/momo/create` | Tạo thanh toán MoMo | Authenticated |

## Dữ liệu mẫu (Seed Data)

Khi khởi động lần đầu, hệ thống tự tạo:
- **4 khu vực**: A (5×6), B (5×6), C (6×8), D (5×8) — tổng 148 ô mộ
- **~55% Occupied** (có người mất, thân nhân, gói bảo trì), **~25% Available**, **~20% Reserved**
- Tên người Việt ngẫu nhiên (seeded random), ngày sinh/mất, số điện thoại, email
- Gói bảo trì: 1 năm (2M), 5 năm (8M), Trọn đời (30M)

## Design System

- **Primary**: `#1A3C34` (dark green)
- **Secondary**: `#B8860B` (gold)
- **Status colors**: Available `#3EB370`, Occupied `#E04444`, Reserved `#4A90D9`
- **Fonts**: Playfair Display (headings), Inter (body)
- CSS variables định nghĩa trong `web/src/app/globals.css`

## License

Private — Đồ án học tập.
