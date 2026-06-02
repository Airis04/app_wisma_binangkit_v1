import type { Reservation, Unit, UnitFoto } from "@prisma/client";

import { STATUS_AKTIF_OVERLAP, parseDateOnly, toDateOnly } from "./reservations";

type MobileUnit = Unit & {
  fotos: Pick<UnitFoto, "id_foto" | "file_path" | "urutan">[];
  reservations?: Pick<
    Reservation,
    "id_reservasi" | "tgl_checkin" | "tgl_checkout" | "status_pesanan"
  >[];
};

export function pecahFasilitas(fasilitas: string) {
  return fasilitas
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function todayDateOnly() {
  return toDateOnly(new Date());
}

export function getMobileStatusUnit(unit: MobileUnit) {
  if (unit.status_unit === "Perawatan") return "Perawatan";

  const today = parseDateOnly(todayDateOnly());
  if (!today) return "Tersedia";

  const isTerisiHariIni = unit.reservations?.some((reservasi) => {
    return (
      STATUS_AKTIF_OVERLAP.includes(reservasi.status_pesanan) &&
      reservasi.tgl_checkin <= today &&
      reservasi.tgl_checkout > today
    );
  });

  return isTerisiHariIni ? "Terisi" : "Tersedia";
}

export function formatUnitMobile(unit: MobileUnit) {
  return {
    id_unit: unit.id_unit,
    nama_unit: unit.nama_unit,
    kategori: unit.kategori,
    harga_per_malam: unit.harga_per_malam,
    kapasitas: unit.kapasitas,
    fasilitas: pecahFasilitas(unit.fasilitas),
    foto_unit: unit.foto_unit,
    status_unit: getMobileStatusUnit(unit),
    fotos: unit.fotos,
  };
}
