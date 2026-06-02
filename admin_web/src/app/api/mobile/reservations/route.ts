import { z } from "zod";

import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { requireMobileUser } from "@/lib/mobile/auth";
import {
  formatReservasiMobile,
  STATUS_AKTIF_OVERLAP,
  validasiInputTanggalReservasi,
} from "@/lib/mobile/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ID_PREFIX = "RES-";
const ID_PAD = 6;

const reservationSchema = z.object({
  id_unit: z.string().trim().max(10, "ID unit maksimal 10 karakter"),
  tgl_checkin: z.string().trim(),
  tgl_checkout: z.string().trim(),
});

async function generateNextIdReservasi(
  tx: { reservation: { findFirst: typeof prisma.reservation.findFirst } }
) {
  const last = await tx.reservation.findFirst({
    where: { id_reservasi: { startsWith: ID_PREFIX } },
    orderBy: { id_reservasi: "desc" },
    select: { id_reservasi: true },
  });

  let nextNum = 1;
  if (last?.id_reservasi) {
    const parsed = Number.parseInt(last.id_reservasi.replace(ID_PREFIX, ""), 10);
    if (Number.isFinite(parsed)) nextNum = parsed + 1;
  }

  return ID_PREFIX + String(nextNum).padStart(ID_PAD, "0");
}

export async function POST(request: Request) {
  const auth = await requireMobileUser(request);
  if (!auth.ok) return auth.response;

  let parsed;
  try {
    parsed = reservationSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(err.issues[0]?.message ?? "Data reservasi tidak valid");
    }
    return jsonError("Body JSON tidak valid");
  }

  const tanggal = validasiInputTanggalReservasi(parsed);
  if (!tanggal.ok) {
    return jsonError(tanggal.message);
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({
        where: { id_unit: parsed.id_unit },
        select: {
          id_unit: true,
          nama_unit: true,
          kategori: true,
          harga_per_malam: true,
          kapasitas: true,
          foto_unit: true,
          status_unit: true,
        },
      });

      if (!unit) {
        throw new Error("UNIT_NOT_FOUND");
      }

      if (unit.status_unit === "Perawatan") {
        throw new Error("UNIT_PERAWATAN");
      }

      const overlap = await tx.reservation.findFirst({
        where: {
          id_unit: parsed.id_unit,
          status_pesanan: { in: [...STATUS_AKTIF_OVERLAP] },
          tgl_checkin: { lt: tanggal.checkout },
          tgl_checkout: { gt: tanggal.checkin },
        },
        select: { id_reservasi: true },
      });

      if (overlap) {
        throw new Error("SLOT_TERISI");
      }

      const idReservasi = await generateNextIdReservasi(tx);
      const reservasi = await tx.reservation.create({
        data: {
          id_reservasi: idReservasi,
          id_user: auth.user.id_user,
          id_unit: parsed.id_unit,
          tgl_checkin: tanggal.checkin,
          tgl_checkout: tanggal.checkout,
          total_tagihan: unit.harga_per_malam * tanggal.jumlah_malam,
          bukti_bayar: null,
          status_pesanan: "Menunggu Pembayaran",
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

      return reservasi;
    });

    return jsonOk(formatReservasiMobile(created), { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNIT_NOT_FOUND") {
        return jsonError("Unit tidak ditemukan", 404);
      }
      if (err.message === "UNIT_PERAWATAN") {
        return jsonError("Unit sedang dalam perawatan");
      }
      if (err.message === "SLOT_TERISI") {
        return jsonError("Slot tanggal sudah terisi", 409);
      }
    }

    console.error("Gagal membuat reservasi:", err);
    return jsonError("Gagal membuat reservasi", 500);
  }
}
