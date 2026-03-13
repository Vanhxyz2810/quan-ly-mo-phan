// ── Centralized API Client ──
// Typed functions for all CemeteryIQ API endpoints with JWT token handling

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5154";

// ── Types ──

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface DashboardStats {
  totalPlots: number;
  occupiedPlots: number;
  availablePlots: number;
  reservedPlots: number;
  expiringMaintenance: number;
  expiredMaintenance: number;
}

export interface PlotDto {
  id: string;
  zone: string;
  row: number;
  col: number;
  status: string;
  width: number;
  height: number;
  data: PlotDataDto | null;
}

export interface PlotDataDto {
  deceased: DeceasedDto | null;
  nextOfKin: NextOfKinDto | null;
  maintenance: MaintenanceDto | null;
}

export interface DeceasedDto {
  name: string;
  birthDate: string;
  deathDate: string;
  quote: string | null;
  photoUrl?: string | null;
}

export interface NextOfKinDto {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface MaintenanceDto {
  package: string;
  price: number;
  expiryDate: string;
  daysLeft: number;
  status: string;
}

export interface ZoneDto {
  id: string;
  name: string;
  label: string;
  rows: number;
  cols: number;
  color: string;
}

export interface SearchResultDto {
  plotId: string;
  zone: string;
  row: number;
  col: number;
  deceasedName: string | null;
  status: string;
}

export interface CreatePlotRequest {
  zone: string;
  row: number;
  col: number;
  status: string;
}

export interface UpdatePlotRequest {
  status?: string;
  deceased?: DeceasedDto;
  nextOfKin?: NextOfKinDto;
  maintenance?: MaintenanceDto;
}

export interface MovePlotRequest {
  toRow: number;
  toCol: number;
}

// ── API Error ──

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public detail?: string
  ) {
    super(detail || `API Error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

// ── Token Management ──

const TOKEN_KEY = "cemeteryiq_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// ── Core Fetch Wrapper ──

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Token hết hạn hoặc không hợp lệ → clear auth
    if (response.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        localStorage.removeItem("cemeteryiq_user");
      }
      throw new ApiError(401, "Unauthorized", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    const errorMsg = data?.error || data?.title || response.statusText;
    throw new ApiError(response.status, response.statusText, errorMsg);
  }

  return data as T;
}

// ── Auth API ──

export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, fullName: string, phone?: string, role?: string) =>
    fetchApi<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName, phone, role }),
    }),
};

// ── Plots API ──

export const plotsApi = {
  getAll: (zone?: string, status?: string) => {
    const params = new URLSearchParams();
    if (zone) params.set("zone", zone);
    if (status) params.set("status", status);
    const qs = params.toString();
    return fetchApi<PlotDto[]>(`/api/plots${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) =>
    fetchApi<PlotDto>(`/api/plots/${encodeURIComponent(id)}`),

  create: (data: CreatePlotRequest) =>
    fetchApi<PlotDto>("/api/plots", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePlotRequest) =>
    fetchApi<PlotDto>(`/api/plots/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  move: (id: string, toRow: number, toCol: number) =>
    fetchApi<PlotDto>(`/api/plots/${encodeURIComponent(id)}/move`, {
      method: "PUT",
      body: JSON.stringify({ toRow, toCol } as MovePlotRequest),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/api/plots/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

// ── Zones API ──

export const zonesApi = {
  getAll: () => fetchApi<ZoneDto[]>("/api/zones"),

  getById: (id: string) =>
    fetchApi<ZoneDto>(`/api/zones/${encodeURIComponent(id)}`),
};

// ── Search API ──

export const searchApi = {
  search: (q: string) =>
    fetchApi<SearchResultDto[]>(`/api/search?q=${encodeURIComponent(q)}`),
};

// ── Dashboard API ──

export const dashboardApi = {
  getStats: () => fetchApi<DashboardStats>("/api/dashboard/stats"),
};

// ── Maintenance API ──

export const maintenanceApi = {
  getAll: (status?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return fetchApi<MaintenanceDto[]>(`/api/maintenance${qs}`);
  },
};

// ── Reserve API ──

export interface ReserveRequest {
  deceased: DeceasedDto;
  nextOfKin: NextOfKinDto;
  package: string;
}

export const reserveApi = {
  reserve: (plotId: string, data: ReserveRequest) =>
    fetchApi<PlotDto>(`/api/plots/${encodeURIComponent(plotId)}/reserve`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Payment API ──
export const paymentApi = {
  createVNPay: (plotId: string, amount: number, orderInfo: string) =>
    fetchApi<{ payUrl: string; txnRef: string }>("/api/payment/vnpay/create", {
      method: "POST",
      body: JSON.stringify({ plotId, amount, orderInfo }),
    }),

  /** Xác thực chữ ký VNPay phía server và cập nhật trạng thái ô mộ → Occupied */
  verifyVNPay: (
    plotId: string,
    secureHash: string,
    params: Record<string, string>
  ) =>
    fetchApi<{ success: boolean; message: string }>("/api/payment/vnpay/verify", {
      method: "POST",
      body: JSON.stringify({ plotId, secureHash, params }),
    }),

  /** Tạo URL thanh toán MoMo */
  createMoMo: (plotId: string, amount: number, orderInfo: string) =>
    fetchApi<{ payUrl: string; orderId: string }>("/api/payment/momo/create", {
      method: "POST",
      body: JSON.stringify({ plotId, amount, orderInfo }),
    }),

  /** Xác thực chữ ký MoMo sau redirect và cập nhật trạng thái ô mộ → Occupied */
  verifyMoMo: (plotId: string, params: Record<string, string>) =>
    fetchApi<{ success: boolean; message: string }>("/api/payment/momo/verify", {
      method: "POST",
      body: JSON.stringify({ plotId, params }),
    }),
};

// ── Service Orders API ──

export interface ServiceOrderDto {
  id: number;
  plotId: string;
  customerName: string;
  serviceType: string;
  scheduledDate: string;
  note: string | null;
  price: number;
  status: string;
  createdAt: string;
}

export interface ServiceCatalogItem {
  type: string;
  label: string;
  price: number;
}

export const serviceOrderApi = {
  getAll: () =>
    fetchApi<ServiceOrderDto[]>("/api/serviceorders"),

  getByPlot: (plotId: string) =>
    fetchApi<ServiceOrderDto[]>(`/api/serviceorders?plotId=${encodeURIComponent(plotId)}`),

  create: (data: { plotId: string; serviceType: string; scheduledDate: string; note?: string }) =>
    fetchApi<ServiceOrderDto>("/api/serviceorders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string) =>
    fetchApi<ServiceOrderDto>(`/api/serviceorders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  getCatalog: () =>
    fetchApi<ServiceCatalogItem[]>("/api/serviceorders/catalog"),
};

// ── Upload API ──

export const uploadApi = {
  uploadPhoto: async (plotId: string, file: File): Promise<{ url: string }> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE}/api/uploads/plots/${encodeURIComponent(plotId)}/photo`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new ApiError(response.status, response.statusText, data?.error || "Upload thất bại");
    }

    return response.json();
  },
};

// ── Renewal API ──
export const renewalApi = {
  renew: (plotId: string, pkg: string) =>
    fetchApi<{ message: string; expiryDate: string; daysLeft: number }>(
      `/api/maintenance/${encodeURIComponent(plotId)}/renew`,
      {
        method: "POST",
        body: JSON.stringify({ package: pkg }),
      }
    ),
};
