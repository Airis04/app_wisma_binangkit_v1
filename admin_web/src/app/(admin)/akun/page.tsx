import { redirect } from "next/navigation";

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola profil admin, foto profil, dan kata sandi.
        </p>
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
