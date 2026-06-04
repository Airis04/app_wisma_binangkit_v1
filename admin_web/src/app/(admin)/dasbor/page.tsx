import { Clock3, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import DasborAutoRefresh from "./_components/dasbor-auto-refresh";
import SummaryCard from "./_components/summary-card";
import TrenLabaChart from "./_components/tren-laba-chart";
import TabelVerifikasiPembayaran from "./_components/tabel-verifikasi-pembayaran";
import {
  getDasborSummary,
  getTrenLaba,
  getReservasiPending,
} from "./_lib/queries";

export default async function DasborPage() {
  const [summary, trenLaba, reservasiPending] = await Promise.all([
    getDasborSummary(),
    getTrenLaba(),
    getReservasiPending(),
  ]);

  return (
    <div className="space-y-6">
      <DasborAutoRefresh />

      <div className="rounded-md border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1E3A8A]">
              Ringkasan Operasional
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">Dasbor</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Pantau performa keuangan, tren laba bersih, dan antrean verifikasi
              pembayaran Wisma Binangkit dari satu tempat.
            </p>
          </div>
          <div className="rounded-md border border-[#1E3A8A]/15 bg-[#1E3A8A]/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1E3A8A]">
              Auto-refresh
            </p>
            <p className="mt-1 text-sm font-medium text-gray-700">
              Data verifikasi diperbarui otomatis.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Pemasukan Bulan Ini"
          value={summary.pemasukan}
          description="Dari reservasi berstatus Selesai"
          icon={TrendingUp}
          variant="pemasukan"
        />
        <SummaryCard
          label="Pengeluaran Operasional"
          value={summary.pengeluaran}
          description="Akumulasi biaya bulan berjalan"
          icon={TrendingDown}
          variant="pengeluaran"
        />
        <SummaryCard
          label="Laba Bersih"
          value={summary.laba_bersih}
          description="Pemasukan dikurangi pengeluaran"
          icon={Wallet}
          variant="laba"
        />
        <SummaryCard
          label="Menunggu Verifikasi"
          value={reservasiPending.length}
          valueType="number"
          description="Bukti bayar perlu dicek admin"
          icon={Clock3}
          variant="pending"
        />
      </div>

      <TrenLabaChart data={trenLaba} />

      <TabelVerifikasiPembayaran data={reservasiPending} />
    </div>
  );
}
