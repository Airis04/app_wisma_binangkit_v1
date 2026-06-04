"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Settings, UserCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  namaLengkap: string;
  email: string;
  fotoProfil?: string | null;
};

export default function UserMenu({ namaLengkap, email, fotoProfil }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:text-[#1E3A8A]"
          aria-label="Menu pengguna"
        >
          {fotoProfil ? (
            <span className="relative block h-8 w-8 overflow-hidden rounded-full bg-white">
              <Image
                src={fotoProfil}
                alt={namaLengkap}
                fill
                sizes="32px"
                className="object-contain p-1"
              />
            </span>
          ) : (
            <UserCircle size={28} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">
              {namaLengkap}
            </span>
            <span className="text-xs text-gray-500 font-normal">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/akun" className="cursor-pointer">
            <Settings size={16} className="mr-2" />
            Pengaturan Akun
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => signOut({ callbackUrl: "/login" })}
          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
        >
          <LogOut size={16} className="mr-2" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
