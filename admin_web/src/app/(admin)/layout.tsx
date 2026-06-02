import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AdminSidebar from "./_components/admin-sidebar";
import UserMenu from "./_components/user-menu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-0">
          <h2 className="text-xl font-bold text-gray-800">Manajemen Wisma</h2>
          <div className="flex items-center">
            <UserMenu
              namaLengkap={session.user.nama_lengkap}
              email={session.user.email ?? ""}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB]">
          {children}
        </main>
      </div>
    </div>
  );
}
