# GIS Interactive Map - Kế hoạch nâng cấp

> **Dự án:** CemeteryIQ - Quản lý nghĩa trang
> **Stack:** Next.js 16 + React 19 + TypeScript + Tailwind v4 + Konva.js
> **Ngày tạo:** 2026-03-01
> **Trạng thái:** 🔄 Đang thực hiện

---

## Ngữ cảnh

Nâng cấp trang GIS (`/admin/gis`) từ grid HTML/CSS tĩnh sang Canvas tương tác dùng **Konva.js + react-konva**.

### Quy mô & Ràng buộc
- Sơ đồ lưới (grid-based), không có tọa độ GPS
- Hỗ trợ 500–2.000 ngôi mộ
- Tải trang < 2 giây, chỉ online
- Phân quyền: Admin (edit) + Staff (view-only) + Khách hàng (read-only trên /search)
- Team 2–3 người maintain

### Giả định
- A1: "Chế độ vệ tinh" dùng ảnh tĩnh (drone/vệ tinh), không phải tile server
- A2: Heatmap dựa trên dữ liệu phí duy tư (ngày hết hạn)
- A3: Đo đạc theo đơn vị ô hoặc mét (nếu biết kích thước thực 1 ô)
- A4: Khách hàng xem trên `/search`, không cần trang GIS riêng
- A5: Edit Mode có undo/redo cơ bản

---

## Giai đoạn 1: Cài đặt & Cấu trúc cơ sở

- [x] **1.1** Cài đặt dependencies: `konva`, `react-konva`
- [x] **1.2** Tạo cấu trúc thư mục components GIS:
  ```
  src/components/gis/
  ├── GisCanvas.tsx          # Component chính chứa Stage/Layer
  ├── PlotRect.tsx           # Component render 1 ô mộ
  ├── GisToolbar.tsx         # Thanh công cụ (zoom, search, tools)
  ├── GisMinimap.tsx         # Bản đồ thu nhỏ
  ├── GisHeatmap.tsx         # Lớp heatmap overlay
  ├── GisLayers.tsx          # Toggle layers (sơ đồ/vệ tinh)
  ├── GisMeasurement.tsx     # Công cụ đo đạc
  ├── GisEditMode.tsx        # Chế độ chỉnh sửa (add/delete/move)
  ├── GisSearch.tsx          # Tìm kiếm trên bản đồ
  ├── GisSidePanel.tsx       # Panel thông tin chi tiết (đã có, cần refactor)
  └── hooks/
      ├── useGisZoom.ts      # Hook quản lý zoom/pan
      ├── useGisSelection.ts # Hook quản lý selection
      ├── useGisEdit.ts      # Hook quản lý edit mode (undo/redo)
      └── useGisSearch.ts    # Hook quản lý tìm kiếm
  ```
- [x] **1.3** Định nghĩa TypeScript interfaces & types:
  ```typescript
  interface Plot {
    id: string;
    zone: string;           // "A" | "B" | "C"
    row: number;
    col: number;
    status: PlotStatus;
    shape: "rectangle";
    width: number;          // pixel trên canvas
    height: number;
    data?: PlotData;
  }

  interface PlotData {
    deceased?: { name: string; birthDate: string; deathDate: string; };
    nextOfKin?: { name: string; relationship: string; phone: string; email: string; };
    maintenance?: { package: string; expiryDate: string; daysLeft: number; status: FeeStatus; };
  }

  type PlotStatus = "occupied" | "available" | "reserved" | "selected";
  type FeeStatus = "active" | "expiring" | "expired";
  type GisMode = "view" | "edit" | "measure";
  type UserRole = "admin" | "staff" | "customer";
  ```
- [x] **1.4** Tạo mock data cho 500 plots (3 khu A/B/C)

---

## Giai đoạn 2: Canvas Core — Konva.js Stage

- [x] **2.1** `GisCanvas.tsx` — Stage + Layer cơ bản với react-konva
  - Render tất cả plots từ data
  - Zoom in/out bằng mouse wheel (pinch trên mobile)
  - Pan bằng drag chuột
  - Scale giới hạn: min 0.3x — max 3x
- [x] **2.2** `PlotRect.tsx` — Component render 1 ô mộ
  - Màu theo status (occupied: đỏ, available: xanh lá, reserved: xanh dương)
  - Hover tooltip hiện ID + tên người quá cố
  - Click để select → hiện side panel
  - Border highlight khi selected
- [x] **2.3** Vẽ đường đi (paths) giữa các khu
- [x] **2.4** Label hiển thị tên khu (Khu A, Khu B, Khu C) trên canvas

---

## Giai đoạn 3: Toolbar & Điều hướng

- [x] **3.1** `GisToolbar.tsx` — Thanh công cụ phía trên bản đồ
  - Nút Zoom In (+) / Zoom Out (-) / Reset zoom
  - Toggle chế độ: View | Edit | Measure
  - Dropdown lọc: Khu, Trạng thái, Tháng hết hạn
  - Nút fullscreen
- [x] **3.2** `GisSearch.tsx` — Tìm kiếm nhanh trên bản đồ
  - Input search overlay trên bản đồ (Ctrl+F)
  - Tìm theo ID mộ hoặc tên người quá cố
  - Auto-pan + zoom + highlight kết quả
  - Danh sách gợi ý (autocomplete)
- [x] **3.3** Keyboard shortcuts:
  - `+`/`-`: Zoom
  - `Ctrl+F`: Search
  - `Escape`: Deselect / thoát mode
  - `Ctrl+Z`/`Ctrl+Y`: Undo/Redo (trong Edit Mode)

---

## Giai đoạn 4: Tính năng nâng cao

- [x] **4.1** `GisLayers.tsx` — Chuyển đổi lớp bản đồ
  - Layer 1: Sơ đồ phẳng (grid trắng/xám, đường đi)
  - Layer 2: Ảnh vệ tinh/drone (hình nền tĩnh dưới grid)
  - Toggle switch ở góc phải trên
  - Opacity slider cho ảnh vệ tinh
- [x] **4.2** `GisHeatmap.tsx` — Heatmap mật độ
  - Overlay gradient dựa trên dữ liệu phí duy tư
  - Đỏ = quá hạn/sắp hạn, Xanh = còn hạn
  - Toggle bật/tắt heatmap
  - Legend giải thích màu sắc
- [x] **4.3** `GisMinimap.tsx` — Bản đồ thu nhỏ
  - Hiển thị ở góc dưới phải
  - Viewport indicator (hình chữ nhật cho vùng đang xem)
  - Click trên minimap để nhảy đến vị trí
  - Có thể thu gọn/mở rộng
- [ ] **4.4** `GisMeasurement.tsx` — Công cụ đo đạc
  - Click 2 điểm để đo khoảng cách (số ô + mét nếu có config)
  - Vẽ đường thẳng + hiện nhãn khoảng cách
  - Click chọn vùng để đo diện tích (số ô trống trong vùng)
  - Nút xóa tất cả đường đo

---

## Giai đoạn 5: Edit Mode (Admin only)

- [x] **5.1** `GisEditMode.tsx` — Chế độ chỉnh sửa
  - Toggle Edit Mode (chỉ hiện cho role Admin)
  - Banner cảnh báo "Đang ở chế độ chỉnh sửa"
- [x] **5.2** Thêm ô mộ mới
  - Click ô trống → dialog nhập thông tin cơ bản (ID, status)
  - Ô mới highlight khác biệt (dashed border)
- [x] **5.3** Xóa ô mộ
  - Right-click → context menu → "Xóa ô mộ"
  - Confirm dialog trước khi xóa
- [x] **5.4** Di chuyển ô mộ
  - Drag & drop trong Edit Mode
  - Snap to grid
  - Highlight vị trí đích khi kéo
- [x] **5.5** Undo/Redo stack
  - `useGisEdit.ts` — quản lý history stack
  - Hỗ trợ undo/redo cho tất cả thao tác edit
  - Hiển thị số thao tác có thể undo trên toolbar
- [x] **5.6** Nút "Lưu thay đổi" + "Hủy tất cả"
  - Batch save tất cả thay đổi về server
  - Confirm trước khi rời trang nếu có unsaved changes

---

## Giai đoạn 6: Side Panel & Integration

- [x] **6.1** Refactor `GisSidePanel.tsx` hiện tại
  - Giữ layout hiện có nhưng tách logic
  - Responsive: slide-in panel trên mobile
  - Animation mở/đóng
- [x] **6.2** Tích hợp Side Panel với Canvas selection
  - Click plot trên canvas → mở side panel với data tương ứng
  - Nút "Định vị" trên side panel → pan + zoom đến plot
- [ ] **6.3** Customer view trên `/search`
  - Read-only version của GisCanvas
  - Không có toolbar edit/measure
  - Search + click để xem thông tin cơ bản
  - Ẩn thông tin nhạy cảm (phone, email)

---

## Giai đoạn 7: Cập nhật thiết kế (.pen file)

- [ ] **7.1** Cập nhật Screen 2 – GIS Interactive Map trong `qlmp.pen`
  - Redesign layout với toolbar mới
  - Thêm minimap, heatmap toggle, layer toggle
  - Cập nhật side panel
- [ ] **7.2** Tạo component mới trong Component Library
  - CompGisToolbar
  - CompGisMinimap
  - CompGisHeatmapLegend

---

## Decision Log

| # | Quyết định | Phương án khác | Lý do chọn |
|---|-----------|---------------|------------|
| D1 | Konva.js (Canvas 2D) | SVG thuần, PixiJS (WebGL) | Cân bằng hiệu năng + dễ học. react-konva tích hợp tốt với React. 2000 plots OK. |
| D2 | Sơ đồ lưới (không GPS) | Web-GIS (Leaflet) | Dữ liệu thực tế chỉ có grid, không có tọa độ GPS |
| D3 | Ảnh vệ tinh tĩnh | Tile server (Mapbox) | Không có GPS → không cần tile server, ảnh tĩnh đủ dùng |
| D4 | 2 role (Admin/Staff) | 3 role, 1 role | Đủ phân quyền cho nghiệp vụ, không phức tạp quá |
| D5 | Tất cả features trong MVP | Chia phase | Người dùng yêu cầu đầy đủ ngay từ đầu |

---

## Tiến độ tổng thể

| Giai đoạn | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| 1. Cài đặt & Cấu trúc | ✅ Hoàn thành | types, mockData, hooks |
| 2. Canvas Core | ✅ Hoàn thành | GisCanvas + PlotRect (Konva) |
| 3. Toolbar & Điều hướng | ✅ Hoàn thành | GisToolbar + GisSearch + keyboard |
| 4. Tính năng nâng cao | ✅ Hoàn thành | Heatmap + Minimap + Legend (Measurement: chưa có UI đo trên canvas) |
| 5. Edit Mode | ✅ Hoàn thành | GisEditMode + useGisEdit (undo/redo) |
| 6. Side Panel & Integration | ✅ Hoàn thành | GisSidePanel mới + tích hợp page |
| 7. Thiết kế (.pen) | ⬜ Chưa bắt đầu | |
