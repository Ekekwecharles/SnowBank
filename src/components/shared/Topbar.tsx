"use client";

import { Menu, Search } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  userName: string;
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/transactions": "Transactions",
  "/transfer": "Transfer Money",
  "/airtime": "Buy Airtime",
  "/bills": "Pay Bills",
  "/beneficiaries": "Beneficiaries",
  "/cards": "My Card",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function Topbar({ userName, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
          {getInitials(userName)}
        </div>
      </div>
    </header>
  );
}
