import { redirect } from "next/navigation";
import { ShieldCheck, UserRound } from "lucide-react";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import AccountSettingsForm from "./_components/account-settings-form";

export default async function AkunPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id_user: session.user.id_user },
    select: {
      nama_lengkap: true,
      email: true,
      no_telepon: true,
      foto_profil: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1E3A8A]">
            <UserRound size={14} />
            Akun Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Pengaturan Akun
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            Kelola identitas admin, foto profil, nomor telepon, dan keamanan
            kata sandi.
          </p>
        </div>

        <div className="mt-5 rounded-lg border border-[#1E3A8A]/10 bg-[#1E3A8A]/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#1E3A8A] ring-1 ring-[#1E3A8A]/10">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Profil ini dipakai di panel admin
              </p>
              <p className="text-sm text-gray-500">
                Email tetap menjadi identitas login, sedangkan nama, nomor
                telepon, foto profil, dan kata sandi dapat diperbarui.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AccountSettingsForm
        defaultValues={{
          nama_lengkap: user.nama_lengkap,
          no_telepon: user.no_telepon,
        }}
        email={user.email}
        fotoProfil={user.foto_profil}
      />
    </div>
  );
}
