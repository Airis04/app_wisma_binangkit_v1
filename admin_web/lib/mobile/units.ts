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
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return toDateOnly(new Date());
  return `${year}-${month}-${day}`;
}

export function getMobileStatusUnit(
  unit: MobileUnit,
  options: { hitungStatusHariIni?: boolean } = {}
) {
  if (unit.status_unit === "Perawatan") return "Perawatan";
  if (!options.hitungStatusHariIni) return unit.status_unit;

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

export function formatUnitMobile(
  unit: MobileUnit,
  options: { hitungStatusHariIni?: boolean } = {}
) {
  return {
    id_unit: unit.id_unit,
    nama_unit: unit.nama_unit,
    kategori: unit.kategori,
    harga_per_malam: unit.harga_per_malam,
    kapasitas: unit.kapasitas,
    fasilitas: pecahFasilitas(unit.fasilitas),
    foto_unit: unit.foto_unit,
    status_unit: getMobileStatusUnit(unit, options),
    fotos: unit.fotos,
  };
}
