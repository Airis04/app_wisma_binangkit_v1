import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { requireMobileUser } from "@/lib/mobile/auth";
import { formatReservasiMobile } from "@/lib/mobile/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "payments");
const PUBLIC_PATH_PREFIX = "/uploads/payments";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function saveBuktiBayar(file: File, idReservasi: string) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("INVALID_TYPE");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(buffer)
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const fileName = `${idReservasi}-${Date.now()}.webp`;
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

export async function POST(
  request: Request,
  context: { params: Promise<{ id_reservasi: string }> }
) {
  const auth = await requireMobileUser(request);
  if (!auth.ok) return auth.response;

  const { id_reservasi } = await context.params;
  if (id_reservasi.length > 10) {
    return jsonError("ID reservasi tidak valid");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Form data tidak valid");
  }

  const file = formData.get("bukti_bayar");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Bukti bayar wajib diunggah");
  }

  let newPath: string;
  try {
    newPath = await saveBuktiBayar(file, id_reservasi);
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_TYPE") {
      return jsonError("Bukti bayar harus berupa JPG, PNG, atau WEBP");
    }
    if (err instanceof Error && err.message === "FILE_TOO_LARGE") {
      return jsonError("Ukuran bukti bayar maksimal 5 MB");
    }

    console.error("Gagal menyimpan bukti bayar:", err);
    return jsonError("Gagal menyimpan bukti bayar", 500);
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const reservasi = await tx.reservation.findUnique({
        where: { id_reservasi },
        include: {
          unit: {
            select: {
              id_unit: true,
              nama_unit: true,
              kategori: true,
              harga_per_malam: true,
              kapasitas: true,
              foto_unit: true,
              status_unit: true,
            },
          },
        },
      });

      if (!reservasi || reservasi.id_user !== auth.user.id_user) {
        throw new Error("RESERVASI_NOT_FOUND");
      }

      if (reservasi.status_pesanan !== "Menunggu Pembayaran") {
        throw new Error("STATUS_INVALID");
      }

      const updatedReservasi = await tx.reservation.update({
        where: { id_reservasi },
        data: {
          bukti_bayar: newPath,
          status_pesanan: "Menunggu Konfirmasi",
        },
        include: {
          unit: {
            select: {
              id_unit: true,
              nama_unit: true,
              kategori: true,
              harga_per_malam: true,
              kapasitas: true,
              foto_unit: true,
              status_unit: true,
            },
          },
        },
      });

      return {
        oldBuktiBayar: reservasi.bukti_bayar,
        reservasi: updatedReservasi,
      };
    });

    await unlinkPublicFile(updated.oldBuktiBayar);

    return jsonOk(formatReservasiMobile(updated.reservasi));
  } catch (err) {
    await unlinkPublicFile(newPath);

    if (err instanceof Error) {
      if (err.message === "RESERVASI_NOT_FOUND") {
        return jsonError("Reservasi tidak ditemukan", 404);
      }
      if (err.message === "STATUS_INVALID") {
        return jsonError(
          "Bukti bayar hanya bisa diunggah untuk reservasi Menunggu Pembayaran"
        );
      }
    }

    console.error("Gagal memperbarui bukti bayar:", err);
    return jsonError("Gagal memperbarui bukti bayar", 500);
  }
}
