# Công việc đang làm dở — 12/03/2026

## VNPay — ĐÃ SỬA
- HashSecret cũ sai (`OMXNCOZ42X96UEQNMOCWY07ODNM68PXZ`), đã đổi sang `RHHYKTH578AMLLW9Z98YJ7LOHIPF7993` trong `appsettings.json`
- Code hash trong `PaymentController.cs` dùng VNPay C# lib approach: `encode(key)=encode(value)` → HMAC-SHA512
- **Cần test lại** thanh toán VNPay với HashSecret mới

## MoMo — ĐÃ THÊM
- `PaymentController.cs`: thêm `CreateMoMo`, `VerifyMoMo`, `MoMoIPN`
- Config MoMo đã thêm vào `appsettings.json`
- Frontend payment page chưa có MoMo tab logic (chỉ có VNPay redirect)

## 5 tính năng mới — ĐANG LÀM DỞ

### ✅ Đã xong
1. **Backend entities + migration**: `ServiceOrder.cs`, `Deceased.PhotoUrl`, `Plot.ServiceOrders`, DbContext configured, migration created (`AddServiceOrdersAndPhotos`)
2. **Backend controllers**: `ServiceOrdersController.cs` (CRUD đơn dịch vụ), `UploadsController.cs` (Cloudinary upload), QR endpoint trong `PlotsController`
3. **Frontend api.ts**: Thêm `serviceOrderApi`, `uploadApi`, types `ServiceOrderDto`, `CreateServiceOrderRequest`
4. **Frontend memorial page** (`web/src/app/memorial/[id]/page.tsx`): QR thật (qrcode.react), modal đặt dịch vụ, hiển thị + upload ảnh Cloudinary
5. **NuGet packages**: `CloudinaryDotNet`, `QRCoder` đã install
6. **npm packages**: `qrcode.react` đã install

### ❌ Chưa làm
1. **Frontend reserve page** (`web/src/app/reserve/[plotId]/page.tsx`): Thêm input upload ảnh (optional) trong step thông tin người mất
2. **EF migration chưa chạy `database update`**: Cần chạy `dotnet ef database update --project src/CemeteryIQ.Infrastructure --startup-project src/CemeteryIQ.Api`
3. **Verification**: Test toàn bộ flow (đặt dịch vụ, upload ảnh, QR scan, VNPay với secret mới)
4. **MoMo frontend**: Tab MoMo trong payment page chưa có logic redirect

## Files đã thay đổi
- `api/src/CemeteryIQ.Core/Entities/ServiceOrder.cs` (NEW)
- `api/src/CemeteryIQ.Core/Entities/Deceased.cs` (thêm PhotoUrl)
- `api/src/CemeteryIQ.Core/Entities/Plot.cs` (thêm ServiceOrders navigation)
- `api/src/CemeteryIQ.Core/DTOs/Dtos.cs` (thêm ServiceOrderDto, CreateServiceOrderRequest, UploadPhotoResponse)
- `api/src/CemeteryIQ.Infrastructure/Data/AppDbContext.cs` (thêm ServiceOrder config)
- `api/src/CemeteryIQ.Api/Controllers/ServiceOrdersController.cs` (NEW)
- `api/src/CemeteryIQ.Api/Controllers/UploadsController.cs` (NEW)
- `api/src/CemeteryIQ.Api/Controllers/PlotsController.cs` (thêm QR endpoint)
- `api/src/CemeteryIQ.Api/Controllers/PaymentController.cs` (sửa VNPay hash, thêm MoMo)
- `api/src/CemeteryIQ.Api/appsettings.json` (VNPay secret mới, MoMo config, Cloudinary config)
- `web/src/lib/api.ts` (thêm serviceOrderApi, uploadApi)
- `web/src/app/memorial/[id]/page.tsx` (rewrite: QR, dịch vụ, ảnh)
- `web/src/app/payment/result/page.tsx` (user tạo mới)
