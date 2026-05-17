import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

import SummaryCard from "./_components/summary-card";
import TrenLabaChart from "./_components/tren-laba-chart";
import TabelVerifikasiPembayaran from "./_components/tabel-verifikasi-pembayaran";
import { mockSummary, mockTrenLaba, mockReservasiPending } from "./mock-data";

export default function DasborPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dasbor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan performa keuangan dan antrean verifikasi pembayaran Wisma Binangkit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Pemasukan Bulan Ini"
          value={mockSummary.pemasukan}
          description="Dari reservasi berstatus Selesai"
          icon={TrendingUp}
          variant="pemasukan"
        />
        <SummaryCard
          label="Pengeluaran Operasional"
          value={mockSummary.pengeluaran}
          description="Akumulasi biaya bulan berjalan"
          icon={TrendingDown}
          variant="pengeluaran"
        />
        <SummaryCard
          label="Laba Bersih"
          value={mockSummary.laba_bersih}
          description="Pemasukan dikurangi pengeluaran"
          icon={Wallet}
          variant="laba"
        />
      </div>

      <TrenLabaChart data={mockTrenLaba} />

      <TabelVerifikasiPembayaran data={mockReservasiPending} />
    </div>
  );
}
