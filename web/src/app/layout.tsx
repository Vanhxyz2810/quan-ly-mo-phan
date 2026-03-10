import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "CemeteryIQ — Quản lý Nghĩa trang Thông minh",
  description: "Hệ thống quản lý nghĩa trang tích hợp GIS, CRM và Billing",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="font-body h-full bg-(--color-bg) text-(--color-text) antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
