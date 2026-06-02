import type { Reservation, Unit } from "@prisma/client";

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
