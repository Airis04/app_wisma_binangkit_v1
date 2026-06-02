import bcrypt from "bcrypt";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { signMobileToken } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ID_PREFIX = "USR-";
const ID_PAD = 6;

const registerSchema = z.object({
  nama_lengkap: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(30, "Nama lengkap maksimal 30 karakter"),
  email: z.email("Email tidak valid").max(30, "Email maksimal 30 karakter"),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(72, "Kata sandi maksimal 72 karakter"),
  no_telepon: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .max(15, "Nomor telepon maksimal 15 karakter"),
});

async function generateNextIdUser(
  tx: { user: { findFirst: typeof prisma.user.findFirst } }
) {
  const last = await tx.user.findFirst({
    where: { id_user: { startsWith: ID_PREFIX } },
    orderBy: { id_user: "desc" },
    select: { id_user: true },
  });

  let nextNum = 1;
  if (last?.id_user) {
    const parsed = Number.parseInt(last.id_user.replace(ID_PREFIX, ""), 10);
    if (Number.isFinite(parsed)) nextNum = parsed + 1;
  }

  return ID_PREFIX + String(nextNum).padStart(ID_PAD, "0");
}

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = registerSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(err.issues[0]?.message ?? "Data registrasi tidak valid");
    }
    return jsonError("Body JSON tidak valid");
  }

  const email = parsed.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return jsonError("Email sudah terdaftar", 409);
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const idUser = await generateNextIdUser(tx);
      const hashedPassword = await bcrypt.hash(parsed.password, 10);

      return tx.user.create({
        data: {
          id_user: idUser,
          nama_lengkap: parsed.nama_lengkap,
          email,
          password: hashedPassword,
          no_telepon: parsed.no_telepon,
          role: "tamu",
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
    });

    const token = signMobileToken({
      id_user: user.id_user,
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      role: "tamu",
    });

    return jsonOk(
      {
        token,
        user: {
          id_user: user.id_user,
          nama_lengkap: user.nama_lengkap,
          email: user.email,
          no_telepon: user.no_telepon,
          foto_profil: user.foto_profil,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Gagal registrasi tamu:", err);
    return jsonError("Gagal membuat akun tamu", 500);
  }
}
