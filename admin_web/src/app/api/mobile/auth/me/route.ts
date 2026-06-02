import bcrypt from "bcrypt";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { requireMobileUser } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  nama_lengkap: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(30, "Nama lengkap maksimal 30 karakter"),
  no_telepon: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .max(15, "Nomor telepon maksimal 15 karakter"),
  password_lama: z.string().optional(),
  password_baru: z
    .string()
    .min(8, "Kata sandi baru minimal 8 karakter")
    .max(72, "Kata sandi baru maksimal 72 karakter")
    .optional(),
});

export async function GET(request: Request) {
  const auth = await requireMobileUser(request);
  if (!auth.ok) return auth.response;

  return jsonOk({
    user: auth.user,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireMobileUser(request);
  if (!auth.ok) return auth.response;

  let parsed;
  try {
    parsed = updateProfileSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(err.issues[0]?.message ?? "Data akun tidak valid");
    }
    return jsonError("Body JSON tidak valid");
  }

  const willUpdatePassword = Boolean(parsed.password_baru);
  if (willUpdatePassword && !parsed.password_lama) {
    return jsonError("Kata sandi lama wajib diisi");
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id_user: auth.user.id_user },
      select: { password: true },
    });

    if (!currentUser) {
      return jsonError("Akun tamu tidak ditemukan", 404);
    }

    let hashedPassword: string | undefined;
    if (willUpdatePassword) {
      const passwordValid = await bcrypt.compare(
        parsed.password_lama ?? "",
        currentUser.password
      );
      if (!passwordValid) {
        return jsonError("Kata sandi lama tidak sesuai");
      }
      hashedPassword = await bcrypt.hash(parsed.password_baru!, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id_user: auth.user.id_user },
      data: {
        nama_lengkap: parsed.nama_lengkap,
        no_telepon: parsed.no_telepon,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      },
      select: {
        id_user: true,
        nama_lengkap: true,
        email: true,
        no_telepon: true,
        foto_profil: true,
        role: true,
      },
    });

    return jsonOk({
      message: "Akun berhasil diperbarui",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Gagal memperbarui akun tamu:", err);
    return jsonError("Gagal memperbarui akun", 500);
  }
}
