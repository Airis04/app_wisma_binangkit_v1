import { CalendarDays, CheckCircle2, Clock3, Home } from "lucide-react";

import prisma from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import PemesananView from "./_components/pemesanan-view";

export default async function PemesananPage() {
  const [units, reservations] = await Promise.all([
    prisma.unit.findMany({
      orderBy: { id_unit: "asc" },
      select: { id_unit: true, nama_unit: true, kategori: true },
    }),
    prisma.reservation.findMany({
      where: { status_pesanan: "Selesai" },
      orderBy: { tgl_checkin: "asc" },
      include: {
        user: { select: { nama_lengkap: true, no_telepon: true } },
        unit: { select: { nama_unit: true } },
      },
    }),
  ]);

  const events = reservations.map((r) => ({
    id_reservasi: r.id_reservasi,
    id_unit: r.id_unit,
    nama_unit: r.unit.nama_unit,
    nama_tamu: r.user.nama_lengkap,
    no_telepon: r.user.no_telepon,
    tgl_checkin: r.tgl_checkin,
    tgl_checkout: r.tgl_checkout,
    total_tagihan: r.total_tagihan,
    status_pesanan: r.status_pesanan,
  }));

  const totalPendapatan = reservations.reduce(
    (sum, reservation) => sum + reservation.total_tagihan,
    0
  );
  const unitTerpakai = new Set(reservations.map((r) => r.id_unit)).size;

  const summaryItems = [
    {
      label: "Reservasi Selesai",
      value: reservations.length,
      icon: CheckCircle2,
      helper: "Masuk kalender",
      className: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    },
    {
      label: "Unit Terpakai",
      value: unitTerpakai,
      icon: Home,
      helper: `Dari ${units.length} unit`,
      className: "bg-[#1E3A8A]/5 text-[#1E3A8A] border-[#1E3A8A]/20",
    },
    {
      label: "Pendapatan Terkunci",
      value: formatRupiah(totalPendapatan),
      icon: CalendarDays,
      helper: "Status Selesai",
      className: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1E3A8A]">
              <Clock3 size={14} />
              Kalender Operasional
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Pemesanan
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-gray-500">
              Pantau ketersediaan unit dalam tampilan kalender bulanan. Pita
              merah menunjukkan tanggal yang sudah terisi reservasi dengan
              status Selesai.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-4"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg border ${item.className}`}
                >
                  <Icon size={18} />
                </div>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-xs text-gray-500">{item.helper}</p>
              </div>
            );
          })}
        </div>
      </div>

      <PemesananView units={units} events={events} />
    </div>
  );
}
