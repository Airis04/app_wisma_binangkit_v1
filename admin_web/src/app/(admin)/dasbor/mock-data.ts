import type { TrenLabaPoint } from "./_components/tren-laba-chart";
import type { ReservasiPending } from "./_components/tabel-verifikasi-pembayaran";

export type DasborSummary = {
  pemasukan: number;
  pengeluaran: number;
  laba_bersih: number;
  jumlah_reservasi_aktif: number;
};

export const mockSummary: DasborSummary = {
  pemasukan: 24750000,
  pengeluaran: 8900000,
  laba_bersih: 15850000,
  jumlah_reservasi_aktif: 12,
};

export const mockTrenLaba: TrenLabaPoint[] = [
  { bulan: "Jun", laba: 7800000 },
  { bulan: "Jul", laba: 11200000 },
  { bulan: "Agu", laba: 14500000 },
  { bulan: "Sep", laba: 9650000 },
  { bulan: "Okt", laba: 10300000 },
  { bulan: "Nov", laba: 8400000 },
  { bulan: "Des", laba: 16800000 },
  { bulan: "Jan", laba: 18750000 },
  { bulan: "Feb", laba: 12100000 },
  { bulan: "Mar", laba: 13900000 },
  { bulan: "Apr", laba: 11650000 },
  { bulan: "Mei", laba: 15850000 },
];

export const mockReservasiPending: ReservasiPending[] = [
  {
    id_reservasi: "RES-000012",
    nama_tamu: "Rahmat Hidayat",
    nama_unit: "Rumah Utama",
    tgl_checkin: "20 Mei 2026",
    tgl_checkout: "23 Mei 2026",
    total_tagihan: 2400000,
    bukti_bayar: null,
  },
  {
    id_reservasi: "RES-000013",
    nama_tamu: "Sarah Wijaya",
    nama_unit: "Kamar Luar 4",
    tgl_checkin: "22 Mei 2026",
    tgl_checkout: "24 Mei 2026",
    total_tagihan: 700000,
    bukti_bayar: null,
  },
  {
    id_reservasi: "RES-000014",
    nama_tamu: "Bambang Setiawan",
    nama_unit: "Kamar Luar 5",
    tgl_checkin: "25 Mei 2026",
    tgl_checkout: "27 Mei 2026",
    total_tagihan: 800000,
    bukti_bayar: null,
  },
];
