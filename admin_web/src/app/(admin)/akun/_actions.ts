"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { accountPasswordSchema, accountProfileSchema } from "./_lib/schema";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "profiles");
const PUBLIC_PATH_PREFIX = "/uploads/profiles";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Tidak diizinkan");
  }
  return session.user;
}

async function saveFotoProfil(file: File, idUser: string) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("INVALID_TYPE");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(buffer)
    .resize({ width: 512, height: 512, fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();

  const fileName = `${idUser}-${Date.now()}.webp`;
  await writeFile(path.join(UPLOAD_DIR, fileName), compressed);
  return `${PUBLIC_PATH_PREFIX}/${fileName}`;
}

async function unlinkPublicFile(publicPath: string | null) {
  if (!publicPath) return;

  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(publicPath)));
  } catch {
    // file lama mungkin sudah tidak ada, abaikan
  }
}

export async function updateAdminProfile(
  formData: FormData
): Promise<ActionResult> {
  const user = await requireAdmin();

  let parsed;
  try {
    parsed = accountProfileSchema.parse({
      nama_lengkap: String(formData.get("nama_lengkap") ?? "").trim(),
      no_telepon: String(formData.get("no_telepon") ?? "").trim(),
    });
  } catch (err) {
    if (err instanceof Error) return { ok: false, message: err.message };
    return { ok: false, message: "Data profil tidak valid" };
  }

  await prisma.user.update({
    where: { id_user: user.id_user },
    data: parsed,
  });

  revalidatePath("/akun");
  revalidatePath("/dasbor");

  return { ok: true, message: "Profil admin berhasil diperbarui" };
}

export async function updateAdminPassword(
  formData: FormData
): Promise<ActionResult> {
  const user = await requireAdmin();

  let parsed;
  try {
    parsed = accountPasswordSchema.parse({
      password_lama: String(formData.get("password_lama") ?? ""),
      password_baru: String(formData.get("password_baru") ?? ""),
    });
  } catch (err) {
    if (err instanceof Error) return { ok: false, message: err.message };
    return { ok: false, message: "Data kata sandi tidak valid" };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id_user: user.id_user },
    select: { password: true },
  });

  if (!currentUser) {
    return { ok: false, message: "Akun admin tidak ditemukan" };
  }

  const passwordValid = await bcrypt.compare(
    parsed.password_lama,
    currentUser.password
  );
  if (!passwordValid) {
    return { ok: false, message: "Kata sandi lama tidak sesuai" };
  }

  const hashedPassword = await bcrypt.hash(parsed.password_baru, 10);
  await prisma.user.update({
    where: { id_user: user.id_user },
    data: { password: hashedPassword },
  });

  return { ok: true, message: "Kata sandi berhasil diperbarui" };
}

export async function updateAdminPhoto(
  formData: FormData
): Promise<ActionResult> {
  const user = await requireAdmin();

  const file = formData.get("foto_profil");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Foto profil wajib dipilih" };
  }

  let newPath: string;
  try {
    newPath = await saveFotoProfil(file, user.id_user);
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_TYPE") {
      return { ok: false, message: "Foto profil harus berupa JPG, PNG, atau WEBP" };
    }
    if (err instanceof Error && err.message === "FILE_TOO_LARGE") {
      return { ok: false, message: "Ukuran foto profil maksimal 5 MB" };
    }

    console.error("Gagal menyimpan foto profil admin:", err);
    return { ok: false, message: "Gagal menyimpan foto profil" };
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id_user: user.id_user },
      select: { foto_profil: true },
    });

    await prisma.user.update({
      where: { id_user: user.id_user },
      data: { foto_profil: newPath },
    });

    await unlinkPublicFile(currentUser?.foto_profil ?? null);

    revalidatePath("/akun");
    revalidatePath("/dasbor");

    return { ok: true, message: "Foto profil berhasil diperbarui" };
  } catch (err) {
    await unlinkPublicFile(newPath);
    console.error("Gagal memperbarui foto profil admin:", err);
    return { ok: false, message: "Gagal memperbarui foto profil" };
  }
}
