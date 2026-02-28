"use client";

import { ClipboardList, Map, Bell, User } from "lucide-react";

const tabs = [
  { icon: ClipboardList, label: "Nhiệm vụ" },
  { icon: Map, label: "Bản đồ" },
  { icon: Bell, label: "Thông báo" },
  { icon: User, label: "Tôi" },
];

export function BottomTabBar({ activeIndex = 0 }: { activeIndex?: number }) {
  return (
    <nav className="flex bg-white border-t border-(--color-border) shrink-0">
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const active = i === activeIndex;
        return (
          <button
            key={i}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1"
          >
            <Icon
              size={22}
              className={active ? "text-(--color-secondary)" : "text-(--color-muted)"}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span
              className={`text-[10px] font-medium ${
                active ? "text-(--color-secondary)" : "text-(--color-muted)"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
