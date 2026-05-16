"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Wallet,
  Settings,
  Building2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dasbor", label: "Dasbor", icon: LayoutDashboard },
  { href: "/pemesanan", label: "Pemesanan", icon: CalendarDays },
  { href: "/unit", label: "Unit", icon: BedDouble },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1E3A8A] text-white flex flex-col shadow-lg z-10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Building2 size={24} className="text-white" />
          <h1 className="text-xl font-bold tracking-wide">Wisma Binangkit</h1>
        </div>
        <p className="text-xs text-white/70 mt-1 ml-8">Admin Management</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center px-4 py-3 rounded-md transition-all font-medium text-white",
                isActive
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              )}
            >
              <Icon size={20} className="mr-3" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
