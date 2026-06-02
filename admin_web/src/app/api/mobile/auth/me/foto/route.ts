import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { requireMobileUser } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "profiles");
const PUBLIC_PATH_PREFIX = "/uploads/profiles";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

export async function POST(request: Request) {
  const auth = await requireMobileUser(request);
  if (!auth.ok) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Form data tidak valid");
  }

  const file = formData.get("foto_profil");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Foto profil wajib diunggah");
  }

  let newPath: string;
  try {
    newPath = await saveFotoProfil(file, auth.user.id_user);
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_TYPE") {
      return jsonError("Foto profil harus berupa JPG, PNG, atau WEBP");
    }
    if (err instanceof Error && err.message === "FILE_TOO_LARGE") {
      return jsonError("Ukuran foto profil maksimal 5 MB");
    }

    console.error("Gagal menyimpan foto profil:", err);
    return jsonError("Gagal menyimpan foto profil", 500);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id_user: auth.user.id_user },
      data: { foto_profil: newPath },
      select: {
        id_user: true,
        nama_lengkap: true,
        email: true,
        no_telepon: true,
        foto_profil: true,
        role: true,
      },
    });

    await unlinkPublicFile(auth.user.foto_profil);

    return jsonOk({
      message: "Foto profil berhasil diperbarui",
      user: updatedUser,
    });
  } catch (err) {
    await unlinkPublicFile(newPath);
    console.error("Gagal memperbarui foto profil:", err);
    return jsonError("Gagal memperbarui foto profil", 500);
  }
}
