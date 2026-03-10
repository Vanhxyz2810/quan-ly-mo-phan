"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    // Only admin and staff can access /admin
    const role = user?.role?.toLowerCase();
    if (role !== "admin" && role !== "staff") {
      router.replace("/search");
    }
  }, [loading, isAuthenticated, user, router]);

  // Show nothing while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-(--color-muted)">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
