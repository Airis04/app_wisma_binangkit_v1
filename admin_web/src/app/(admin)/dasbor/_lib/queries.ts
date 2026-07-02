import prisma from "@/lib/prisma";

export type DasborSummary = {
  pemasukan: number;
  pengeluaran: number;
  laba_bersih: number;
};

export type TrenLabaPoint = {
  bulan: string;
  laba: number;
};

export type ReservasiPending = {
  id_reservasi: string;
  nama_tamu: string;
  nama_unit: string;
  tgl_checkin: string;
  tgl_checkout: string;
  total_tagihan: number;
  bukti_bayar: string | null;
};

const NAMA_BULAN_PENDEK = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function startOfNextDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function formatTanggalIndonesia(date: Date): string {
  const day = date.getDate();
  const monthIdx = date.getMonth();
  const year = date.getFullYear();
  return `${day} ${NAMA_BULAN_PENDEK[monthIdx]} ${year}`;
}

export async function getDasborSummary(
  startDate?: Date,
  endDate?: Date
): Promise<DasborSummary> {
  const now = new Date();
  const monthStart = startDate ?? startOfMonth(now);
  const rangeEnd = endDate ? startOfNextDay(endDate) : startOfNextMonth(now);

  const [pemasukanAgg, pengeluaranAgg] = await Promise.all([
    prisma.reservation.aggregate({
      _sum: { total_tagihan: true },
      where: {
        status_pesanan: "Selesai",
        tgl_checkout: { gte: monthStart, lt: rangeEnd },
      },
    }),
    prisma.operationalCost.aggregate({
      _sum: { total_pengeluaran: true },
      where: {
        tanggal_pencatatan: { gte: monthStart, lt: rangeEnd },
      },
    }),
  ]);

  const pemasukan = pemasukanAgg._sum.total_tagihan ?? 0;
  const pengeluaran = pengeluaranAgg._sum.total_pengeluaran ?? 0;

  return {
    pemasukan,
    pengeluaran,
    laba_bersih: pemasukan - pengeluaran,
  };
}

export async function getTrenLaba(): Promise<TrenLabaPoint[]> {
  const now = new Date();
  const result: TrenLabaPoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = startOfMonth(targetMonth);
    const nextMonthStart = startOfNextMonth(targetMonth);

    const [pemasukanAgg, pengeluaranAgg] = await Promise.all([
      prisma.reservation.aggregate({
        _sum: { total_tagihan: true },
        where: {
          status_pesanan: "Selesai",
          tgl_checkout: { gte: monthStart, lt: nextMonthStart },
        },
      }),
      prisma.operationalCost.aggregate({
        _sum: { total_pengeluaran: true },
        where: {
          tanggal_pencatatan: { gte: monthStart, lt: nextMonthStart },
        },
      }),
    ]);

    const pemasukan = pemasukanAgg._sum.total_tagihan ?? 0;
    const pengeluaran = pengeluaranAgg._sum.total_pengeluaran ?? 0;

    result.push({
      bulan: NAMA_BULAN_PENDEK[targetMonth.getMonth()],
      laba: pemasukan - pengeluaran,
    });
  }

  return result;
}

export async function getReservasiPending(): Promise<ReservasiPending[]> {
  const rows = await prisma.reservation.findMany({
    where: { status_pesanan: "Menunggu Konfirmasi" },
    orderBy: { created_at: "asc" },
    include: {
      user: { select: { nama_lengkap: true } },
      unit: { select: { nama_unit: true } },
    },
  });

  return rows.map((r) => ({
    id_reservasi: r.id_reservasi,
    nama_tamu: r.user.nama_lengkap,
    nama_unit: r.unit.nama_unit,
    tgl_checkin: formatTanggalIndonesia(r.tgl_checkin),
    tgl_checkout: formatTanggalIndonesia(r.tgl_checkout),
    total_tagihan: r.total_tagihan,
    bukti_bayar: r.bukti_bayar,
  }));
}
