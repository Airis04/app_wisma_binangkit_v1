import prisma from "@/lib/prisma";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pemesanan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau ketersediaan unit dalam tampilan kalender bulanan. Pita merah
          menunjukkan tanggal yang sudah terisi reservasi (status Selesai).
        </p>
      </div>

      <PemesananView units={units} events={events} />
    </div>
  );
}
