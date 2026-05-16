import Link from "next/link";
import { Bell, UserCircle, LayoutDashboard, CalendarDays, BedDouble, Wallet, Settings, Building2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      
      {/* SIDEBAR KIRI (Dark Navy Blue) */}
      <aside className="w-64 bg-[#0A2351] text-white flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Building2 size={24} className="text-white" />
            <h1 className="text-xl font-bold tracking-wide">Wisma Binangkit</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1 ml-8">Admin Management</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/dasbor" className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-all">
            <LayoutDashboard size={20} className="mr-3" />
            <span className="font-medium">Dasbor</span>
          </Link>
          <Link href="/pemesanan" className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-all">
            <CalendarDays size={20} className="mr-3" />
            <span className="font-medium">Pemesanan</span>
          </Link>
          <Link href="/unit" className="flex items-center px-4 py-3 bg-white/20 text-white rounded-md transition-all">
            <BedDouble size={20} className="mr-3" />
            <span className="font-medium">Unit</span>
          </Link>
          <Link href="/keuangan" className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-all">
            <Wallet size={20} className="mr-3" />
            <span className="font-medium">Keuangan</span>
          </Link>
          <Link href="/pengaturan" className="flex items-center px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-md transition-all mt-auto">
            <Settings size={20} className="mr-3" />
            <span className="font-medium">Pengaturan</span>
          </Link>
        </nav>
      </aside>

      {/* AREA KONTEN KANAN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-0">
          <h2 className="text-xl font-bold text-gray-800">Manajemen Wisma</h2>
          <div className="flex items-center space-x-6">
            <button className="text-gray-500 hover:text-[#0A2351] transition-colors relative">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="text-gray-500 hover:text-[#0A2351] transition-colors">
              <UserCircle size={28} />
            </button>
          </div>
        </header>

        {/* Area Konten Dinamis */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB]">
          {children}
        </main>
      </div>

    </div>
  );
}