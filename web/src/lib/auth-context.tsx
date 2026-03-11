"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import {
    authApi,
    setToken,
    clearToken,
    ApiError,
    type AuthResponse,
} from "./api";

// ── Types ──

interface User {
    email: string;
    fullName: string;
    role: string;
    token: string;
}

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isStaff: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (
        email: string,
        password: string,
        fullName: string,
        phone?: string,
        role?: string
    ) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── localStorage user persistence ──

const USER_KEY = "cemeteryiq_user";

function saveUser(user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function loadUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

function removeUser() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_KEY);
}

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hydrate from localStorage on mount — kiểm tra JWT expiry
    useEffect(() => {
        const saved = loadUser();
        if (saved?.token) {
            try {
                const payload = JSON.parse(atob(saved.token.split(".")[1]));
                const isExpired = payload.exp && payload.exp * 1000 < Date.now();
                if (isExpired) {
                    clearToken();
                    removeUser();
                } else {
                    setToken(saved.token);
                    setUser(saved);
                }
            } catch {
                // Token không decode được → vẫn restore (server sẽ verify)
                setToken(saved.token);
                setUser(saved);
            }
        }
        setLoading(false);
    }, []);

    const handleAuthResponse = useCallback((res: AuthResponse): User => {
        const u: User = {
            email: res.email,
            fullName: res.fullName,
            role: res.role.toLowerCase(),
            token: res.token,
        };
        setToken(u.token);
        saveUser(u);
        setUser(u);
        setError(null);
        return u;
    }, []);

    const login = useCallback(
        async (email: string, password: string): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const res = await authApi.login(email, password);
                handleAuthResponse(res);
                return true;
            } catch (err) {
                if (err instanceof ApiError) {
                    setError(err.detail || "Đăng nhập thất bại");
                } else {
                    setError("Không thể kết nối đến server");
                }
                return false;
            } finally {
                setLoading(false);
            }
        },
        [handleAuthResponse]
    );

    const register = useCallback(
        async (
            email: string,
            password: string,
            fullName: string,
            phone?: string,
            role?: string
        ): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const res = await authApi.register(email, password, fullName, phone, role);
                handleAuthResponse(res);
                return true;
            } catch (err) {
                if (err instanceof ApiError) {
                    setError(err.detail || "Đăng ký thất bại");
                } else {
                    setError("Không thể kết nối đến server");
                }
                return false;
            } finally {
                setLoading(false);
            }
        },
        [handleAuthResponse]
    );

    const logout = useCallback(() => {
        clearToken();
        removeUser();
        setUser(null);
        setError(null);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const value: AuthContextValue = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStaff: user?.role === "staff",
        login,
        register,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
