import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "wb_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const loginSchema = z.object({
  email: z.email("Format email tidak valid").max(30),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Body permintaan tidak valid" },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Email atau kata sandi salah" },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: "Email atau kata sandi salah" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: user.id_user,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Error saat login:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
