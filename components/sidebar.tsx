"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  Users,
  LogOut,
  Store,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { useState } from "react";
import { InstallPrompt } from "@/components/install-prompt";
import { useInstallPrompt } from "@/components/pwa-provider";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "kasir"] },
  { href: "/products", label: "Produk", icon: Package, roles: ["admin"] },
  { href: "/cashier", label: "Kasir", icon: ShoppingCart, roles: ["admin", "kasir"] },
  { href: "/transactions", label: "Transaksi", icon: Receipt, roles: ["admin"] },
  { href: "/reports", label: "Laporan", icon: BarChart3, roles: ["admin"] },
  { href: "/users", label: "Users", icon: Users, roles: ["admin"] },
];

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-zinc-200 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-zinc-200">
        <Store className="h-6 w-6 text-blue-600" />
        <span className="font-bold text-lg text-zinc-900">Toko Riswati</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-200 space-y-2">
        <InstallPrompt />
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}

interface MobileNavProps {
  role: string;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-40">
      <div className="flex items-center justify-evenly h-16 overflow-x-auto px-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                active ? "text-blue-600" : "text-zinc-500",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <InstallPromptMobile />
        <form action={logout} className="flex flex-col items-center">
          <button
            type="submit"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium text-zinc-500 whitespace-nowrap transition-colors hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </form>
      </div>
    </nav>
  );
}

function InstallPromptMobile() {
  const { deferredPrompt, showInstall } = useInstallPrompt();
  const [installing, setInstalling] = useState(false);

  if (!showInstall || !deferredPrompt) return null;

  const prompt = deferredPrompt;

  async function handleInstall() {
    setInstalling(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setInstalling(false);
    }
    setInstalling(false);
  }

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium text-blue-600 whitespace-nowrap transition-colors hover:text-blue-800"
    >
      <Download className="h-5 w-5" />
      Install
    </button>
  );
}

