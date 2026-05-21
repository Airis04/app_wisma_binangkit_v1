"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Tidak diizinkan");
  }
}

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function setujuiReservasi(
  idReservasi: string
): Promise<ActionResult> {
  await requireAdmin();

  const reservasi = await prisma.reservation.findUnique({
    where: { id_reservasi: idReservasi },
  });

  if (!reservasi) {
    return { ok: false, message: "Reservasi tidak ditemukan" };
  }

  if (reservasi.status_pesanan !== "Menunggu Konfirmasi") {
    return {
      ok: false,
      message: `Reservasi ini sudah berstatus ${reservasi.status_pesanan} dan tidak bisa disetujui ulang`,
    };
  }

  // Recheck overlap detection (defensive — admin mungkin biarkan tab terbuka
  // berjam-jam, lalu approve setelah ada reservasi lain yang juga overlap).
  const overlap = await prisma.reservation.findFirst({
    where: {
      id_reservasi: { not: idReservasi },
      id_unit: reservasi.id_unit,
      status_pesanan: "Selesai",
      tgl_checkin: { lt: reservasi.tgl_checkout },
      tgl_checkout: { gt: reservasi.tgl_checkin },
    },
  });

  if (overlap) {
    return {
      ok: false,
      message: `Slot tanggal sudah terisi oleh reservasi lain (${overlap.id_reservasi}). Tolak reservasi ini.`,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentlyStaying =
    reservasi.tgl_checkin <= today && reservasi.tgl_checkout > today;

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id_reservasi: idReservasi },
      data: { status_pesanan: "Selesai" },
    });

    if (isCurrentlyStaying) {
      await tx.unit.update({
        where: { id_unit: reservasi.id_unit },
        data: { status_unit: "Terisi" },
      });
    }
  });

  revalidatePath("/dasbor");
  revalidatePath("/pemesanan");
  revalidatePath("/unit");

  return {
    ok: true,
    message: `Reservasi ${idReservasi} disetujui. Slot tanggal terkunci.`,
  };
}

export async function tolakReservasi(
  idReservasi: string
): Promise<ActionResult> {
  await requireAdmin();

  const reservasi = await prisma.reservation.findUnique({
    where: { id_reservasi: idReservasi },
  });

  if (!reservasi) {
    return { ok: false, message: "Reservasi tidak ditemukan" };
  }

  if (reservasi.status_pesanan !== "Menunggu Konfirmasi") {
    return {
      ok: false,
      message: `Reservasi ini sudah berstatus ${reservasi.status_pesanan} dan tidak bisa ditolak ulang`,
    };
  }

  await prisma.reservation.update({
    where: { id_reservasi: idReservasi },
    data: { status_pesanan: "Batal" },
  });

  revalidatePath("/dasbor");
  revalidatePath("/pemesanan");

  return {
    ok: true,
    message: `Reservasi ${idReservasi} ditolak. Slot tanggal kembali tersedia.`,
  };
}
