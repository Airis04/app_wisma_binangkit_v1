import { CalendarDays, Clock3, Search, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import DasborAutoRefresh from "./_components/dasbor-auto-refresh";
import SummaryCard from "./_components/summary-card";
import TrenLabaChart from "./_components/tren-laba-chart";
import TabelVerifikasiPembayaran from "./_components/tabel-verifikasi-pembayaran";
import {
  getDasborSummary,
  getTrenLaba,
  getReservasiPending,
} from "./_lib/queries";
import { Button } from "@/components/ui/button";

type DasborPageProps = {
  searchParams: Promise<{
    dari?: string;
    sampai?: string;
  }>;
};

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return fallback;

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed;
}

function formatTanggalIndonesia(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function DasborPage({ searchParams }: DasborPageProps) {
  const params = await searchParams;
  const today = new Date();
  const defaultDari = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultSampai = today;

  let dari = parseInputDate(params.dari, defaultDari);
  let sampai = parseInputDate(params.sampai, defaultSampai);

  if (dari > sampai) {
    [dari, sampai] = [sampai, dari];
  }

  const [summary, trenLaba, reservasiPending] = await Promise.all([
    getDasborSummary(dari, sampai),
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

        <form
          method="GET"
          className="mt-5 grid gap-3 rounded-lg border border-gray-200 bg-[#F9FAFB] p-4 md:grid-cols-[1fr_1fr_auto]"
        >
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-gray-700">
              Dari Tanggal
            </span>
            <input
              type="date"
              name="dari"
              defaultValue={toInputDate(dari)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#1E3A8A] focus:ring-3 focus:ring-[#1E3A8A]/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-gray-700">
              Sampai Tanggal
            </span>
            <input
              type="date"
              name="sampai"
              defaultValue={toInputDate(sampai)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#1E3A8A] focus:ring-3 focus:ring-[#1E3A8A]/10"
            />
          </label>

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full bg-[#1E3A8A] text-white hover:bg-[#162d6e] md:w-auto"
            >
              <Search size={16} className="mr-2" />
              Tampilkan
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <CalendarDays size={16} className="text-[#1E3A8A]" />
          <span>
            Periode laporan:{" "}
            <strong className="text-gray-900">
              {formatTanggalIndonesia(dari)}
            </strong>{" "}
            s/d{" "}
            <strong className="text-gray-900">
              {formatTanggalIndonesia(sampai)}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Pemasukan Periode"
          value={summary.pemasukan}
          description="Dari reservasi berstatus Selesai"
          icon={TrendingUp}
          variant="pemasukan"
        />
        <SummaryCard
          label="Pengeluaran Periode"
          value={summary.pengeluaran}
          description="Akumulasi biaya pada rentang tanggal"
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
