import {
  ArrowDownCircle,
  BarChart3,
  CalendarDays,
  ReceiptText,
  Search,
  Wallet,
} from "lucide-react";

import prisma from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import FormCatatPengeluaran from "./_components/form-catat-pengeluaran";
import TabelRiwayatPengeluaran from "./_components/tabel-riwayat-pengeluaran";

type KeuanganPageProps = {
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

function startOfNextDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function formatTanggalIndonesia(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function KeuanganPage({
  searchParams,
}: KeuanganPageProps) {
  const params = await searchParams;
  const today = new Date();
  const defaultDari = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultSampai = today;

  let dari = parseInputDate(params.dari, defaultDari);
  let sampai = parseInputDate(params.sampai, defaultSampai);

  if (dari > sampai) {
    [dari, sampai] = [sampai, dari];
  }

  const rows = await prisma.operationalCost.findMany({
    where: {
      tanggal_pencatatan: {
        gte: dari,
        lt: startOfNextDay(sampai),
      },
    },
    orderBy: [
      { tanggal_pencatatan: "desc" },
      { id_biaya: "desc" },
    ],
  });

  const totalPengeluaran = rows.reduce(
    (sum, row) => sum + row.total_pengeluaran,
    0
  );
  const kategoriAktif = new Set(rows.map((row) => row.kategori_pengeluaran)).size;

  const summaryItems = [
    {
      label: "Pengeluaran Periode",
      value: formatRupiah(totalPengeluaran),
      helper: "Dipakai hitung laba bersih",
      icon: ArrowDownCircle,
      className: "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
    },
    {
      label: "Total Riwayat",
      value: formatRupiah(totalPengeluaran),
      helper: `${rows.length} catatan pengeluaran`,
      icon: Wallet,
      className: "border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A]",
    },
    {
      label: "Kategori Terpakai",
      value: kategoriAktif,
      helper: "Utilitas, Pemeliharaan, Konsumsi",
      icon: BarChart3,
      className: "border-[#3B82F6]/20 bg-[#3B82F6]/10 text-[#3B82F6]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1E3A8A]">
            <ReceiptText size={14} />
            Operasional Homestay
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Keuangan</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            Catat dan pantau seluruh pengeluaran operasional Wisma Binangkit.
            Total pengeluaran otomatis dipotong dari pemasukan untuk
            menghasilkan laba bersih di Dasbor.
          </p>
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
            Periode pengeluaran:{" "}
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

      <FormCatatPengeluaran />

      <TabelRiwayatPengeluaran data={rows} />
    </div>
  );
}
