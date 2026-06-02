import bcrypt from "bcrypt";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const forgotPasswordSchema = z.object({
  email: z.email("Email tidak valid").max(30, "Email maksimal 30 karakter"),
  no_telepon: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .max(15, "Nomor telepon maksimal 15 karakter"),
  password_baru: z
    .string()
    .min(8, "Kata sandi baru minimal 8 karakter")
    .max(72, "Kata sandi baru maksimal 72 karakter"),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = forgotPasswordSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(
        err.issues[0]?.message ?? "Data lupa password tidak valid"
      );
    }
    return jsonError("Body JSON tidak valid");
  }

  const email = parsed.email.trim().toLowerCase();
  const noTelepon = parsed.no_telepon.trim();

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        no_telepon: noTelepon,
        role: "tamu",
      },
      select: { id_user: true },
    });

    if (!user) {
      return jsonError("Email dan nomor telepon tidak cocok");
    }

    const hashedPassword = await bcrypt.hash(parsed.password_baru, 10);
    await prisma.user.update({
      where: { id_user: user.id_user },
      data: { password: hashedPassword },
    });

    return jsonOk({
      message: "Kata sandi berhasil diperbarui. Silakan masuk kembali.",
    });
  } catch (err) {
    console.error("Gagal reset password tamu:", err);
    return jsonError("Gagal memperbarui kata sandi", 500);
  }
}
