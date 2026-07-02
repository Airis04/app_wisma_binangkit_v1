import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import AdminSidebar from "./_components/admin-sidebar";
import UserMenu from "./_components/user-menu";
import LockBodyScroll from "./_components/lock-body-scroll";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id_user: session.user.id_user },
    select: {
      nama_lengkap: true,
      email: true,
      foto_profil: true,
    },
  });

  return (
    <div className="fixed inset-0 flex w-full overflow-hidden bg-[#F9FAFB]">
      <LockBodyScroll />
      <AdminSidebar />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="z-0 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1E3A8A]">
              Panel Admin
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              Manajemen Wisma Binangkit
            </h2>
          </div>
          <div className="flex items-center">
            <UserMenu
              namaLengkap={currentUser?.nama_lengkap ?? session.user.nama_lengkap}
              email={currentUser?.email ?? session.user.email ?? ""}
              fotoProfil={currentUser?.foto_profil ?? null}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
