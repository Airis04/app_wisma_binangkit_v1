import { Bell, UserCircle } from "lucide-react";
import AdminSidebar from "./_components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-0">
          <h2 className="text-xl font-bold text-gray-800">Manajemen Wisma</h2>
          <div className="flex items-center space-x-6">
            <button
              className="text-gray-500 hover:text-[#1E3A8A] transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              className="text-gray-500 hover:text-[#1E3A8A] transition-colors"
              aria-label="Akun pengguna"
            >
              <UserCircle size={28} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB]">
          {children}
        </main>
      </div>
    </div>
  );
}
