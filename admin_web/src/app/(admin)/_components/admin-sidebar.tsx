"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Wallet,
  CreditCard,
  Building2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dasbor", label: "Dasbor", icon: LayoutDashboard },
  { href: "/pemesanan", label: "Pemesanan", icon: CalendarDays },
  { href: "/unit", label: "Unit", icon: BedDouble },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/pembayaran", label: "Pembayaran", icon: CreditCard },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="z-10 flex h-screen w-72 flex-col bg-[#1E3A8A] text-white shadow-lg">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/15">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Wisma Binangkit</h1>
            <p className="text-xs font-medium text-white">Manajemen Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center rounded-md px-4 py-3 font-semibold text-white transition-all",
                isActive
                  ? "bg-white text-[#1E3A8A] shadow-sm"
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
