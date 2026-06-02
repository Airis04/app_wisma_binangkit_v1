import type { Reservation, Unit } from "@prisma/client";

import prisma from "@/lib/prisma";

export const STATUS_AKTIF_OVERLAP = ["Menunggu Konfirmasi", "Selesai"];

export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000+07:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function hitungMalam(checkin: Date, checkout: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((checkout.getTime() - checkin.getTime()) / msPerDay);
}

export function validasiInputTanggalReservasi(input: {
  tgl_checkin: string;
  tgl_checkout: string;
}) {
  const checkin = parseDateOnly(input.tgl_checkin);
  const checkout = parseDateOnly(input.tgl_checkout);

  if (!checkin || !checkout) {
    return {
      ok: false as const,
      message: "Tanggal wajib memakai format YYYY-MM-DD",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkin < today) {
    return {
      ok: false as const,
      message: "Tanggal check-in tidak boleh sebelum hari ini",
    };
  }

  if (checkout <= checkin) {
    return {
      ok: false as const,
      message: "Tanggal check-out harus setelah check-in",
    };
  }

  const jumlahMalam = hitungMalam(checkin, checkout);
  if (jumlahMalam <= 0) {
    return { ok: false as const, message: "Durasi reservasi tidak valid" };
  }

  return {
    ok: true as const,
    checkin,
    checkout,
    jumlah_malam: jumlahMalam,
  };
}

export async function cekKetersediaanUnit(input: {
  id_unit: string;
  checkin: Date;
  checkout: Date;
}) {
  const unit = await prisma.unit.findUnique({
    where: { id_unit: input.id_unit },
    select: {
      id_unit: true,
      nama_unit: true,
      kategori: true,
      harga_per_malam: true,
      status_unit: true,
    },
  });

  if (!unit) {
    return {
      ok: false as const,
      status: 404,
      message: "Unit tidak ditemukan",
    };
  }

  if (unit.status_unit === "Perawatan") {
    return {
      ok: true as const,
      available: false,
      reason: "UNIT_PERAWATAN",
      message: "Unit sedang dalam perawatan",
      unit,
    };
  }

  const overlap = await prisma.reservation.findFirst({
    where: {
      id_unit: input.id_unit,
      status_pesanan: { in: [...STATUS_AKTIF_OVERLAP] },
      tgl_checkin: { lt: input.checkout },
      tgl_checkout: { gt: input.checkin },
    },
    select: {
      id_reservasi: true,
      tgl_checkin: true,
      tgl_checkout: true,
      status_pesanan: true,
    },
  });

  if (overlap) {
    return {
      ok: true as const,
      available: false,
      reason: "SLOT_TERISI",
      message: "Tanggal ini sudah terisi untuk unit ini",
      unit,
      overlap: {
        id_reservasi: overlap.id_reservasi,
        tgl_checkin: toDateOnly(overlap.tgl_checkin),
        tgl_checkout: toDateOnly(overlap.tgl_checkout),
        status_pesanan: overlap.status_pesanan,
      },
    };
  }

  return {
    ok: true as const,
    available: true,
    reason: null,
    message: "Tanggal tersedia",
    unit,
  };
}

export function formatReservasiMobile(
  reservasi: Reservation & {
    unit: Pick<
      Unit,
      | "id_unit"
      | "nama_unit"
      | "kategori"
      | "harga_per_malam"
      | "kapasitas"
      | "foto_unit"
      | "status_unit"
    >;
  }
) {
  return {
    id_reservasi: reservasi.id_reservasi,
    id_user: reservasi.id_user,
    id_unit: reservasi.id_unit,
    tgl_checkin: toDateOnly(reservasi.tgl_checkin),
    tgl_checkout: toDateOnly(reservasi.tgl_checkout),
    total_tagihan: reservasi.total_tagihan,
    bukti_bayar: reservasi.bukti_bayar,
    status_pesanan: reservasi.status_pesanan,
    created_at: reservasi.created_at.toISOString(),
    unit: reservasi.unit,
  };
}
