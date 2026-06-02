import bcrypt from "bcrypt";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { signMobileToken } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.email("Email tidak valid").max(30, "Email maksimal 30 karakter"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = loginSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(err.issues[0]?.message ?? "Data login tidak valid");
    }
    return jsonError("Body JSON tidak valid");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.email.trim().toLowerCase() },
  });

  if (!user || user.role !== "tamu") {
    return jsonError("Email atau kata sandi salah", 401);
  }

  const passwordValid = await bcrypt.compare(parsed.password, user.password);
  if (!passwordValid) {
    return jsonError("Email atau kata sandi salah", 401);
  }

  const token = signMobileToken({
    id_user: user.id_user,
    email: user.email,
    nama_lengkap: user.nama_lengkap,
    role: "tamu",
  });

  return jsonOk({
    token,
    user: {
      id_user: user.id_user,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      no_telepon: user.no_telepon,
      foto_profil: user.foto_profil,
      role: user.role,
    },
  });
}
