# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CemeteryIQ** — Hệ thống quản lý nghĩa trang kết hợp bản đồ GIS, CRM và thanh toán. Full-stack app với Next.js frontend và ASP.NET Core backend.

## Commands

### Frontend (web/)
```bash
cd web
npm run dev        # Dev server tại localhost:3000
npm run build      # Production build
npm start          # Production server
```

### Backend (api/)
```bash
cd api
dotnet build
dotnet run --project src/CemeteryIQ.Api    # API tại localhost:5154, Swagger: /swagger
dotnet test                                 # Chạy xUnit tests
dotnet ef migrations add <Name> --project src/CemeteryIQ.Infrastructure
dotnet ef database update --project src/CemeteryIQ.Infrastructure
```

## Architecture

### Frontend: `web/src/`
- **Next.js 16 + React 19 + TypeScript + Tailwind v4**
- **GIS Map**: Canvas-based rendering với Konva.js (`components/gis/`). `GisCanvas.tsx` là component chính, dynamically imported với `ssr: false`. Mỗi plot là `PlotRect.tsx`.
- **GIS Hooks** (`components/gis/hooks/`): `useGisZoom` (zoom/pan), `useGisSelection`, `useGisSearch`, `useGisEdit` (undo/redo stack), `useGisKeyboard` (shortcuts)
- **GIS Modes**: `view` | `edit` | `measure` — edit mode cho phép add/delete/move plots
- **Mock Data** (`mockData.ts`): 4 zones (A/B/C/D), 148 plots với seeded random data
- **Admin routes**: `app/admin/` với layout riêng (navbar + sidebar)
- **Public routes**: Landing page, search, memorial, login/register, payment

### Backend: Clean Architecture (`api/src/`)
- **CemeteryIQ.Core**: Entities (Zone, Plot, Deceased, NextOfKin, MaintenancePlan, AppUser), DTOs, Interfaces
- **CemeteryIQ.Infrastructure**: EF Core + SQL Server, Repositories, TokenService, DataSeeder
- **CemeteryIQ.Api**: Controllers, JWT auth middleware, Swagger

### Key Entity Relationships
- Zone → many Plots (FK: ZoneId)
- Plot → one-to-one: Deceased, NextOfKin, MaintenancePlan
- Unique constraint: (ZoneId, Row, Col) trên Plots
- PlotStatus enum: Available, Occupied, Reserved
- Auth roles: Admin, Staff, Customer

### API Endpoints
- `POST /api/Auth/login|register` — Public
- `GET /api/Zones`, `GET /api/Plots` — Public, có filter
- `POST|PUT|DELETE /api/Plots` — Admin only
- `GET /api/Search?q=...` — Full-text search
- `GET /api/Dashboard/stats`, `GET /api/Maintenance` — Admin/Staff

## Design System
- Colors: Primary `#1A3C34` (dark green), Secondary `#B8860B` (gold), map statuses: green/red/blue
- Fonts: Playfair Display (headings), Inter (body)
- CSS variables defined in `web/src/app/globals.css`

## Infrastructure
- Database: SQL Server (localhost, database CemeteryIQ)
- CORS: localhost:3000, localhost:3001
- JWT: HS256, issuer "CemeteryIQ", audience "CemeteryIQ-Client"
- Design file: `qlmp.pen` (Pencil MCP format — dùng pencil tools để đọc/sửa)
