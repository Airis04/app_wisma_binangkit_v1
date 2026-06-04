import { ArrowDownCircle, BarChart3, ReceiptText, Wallet } from "lucide-react";

import prisma from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import FormCatatPengeluaran from "./_components/form-catat-pengeluaran";
import TabelRiwayatPengeluaran from "./_components/tabel-riwayat-pengeluaran";

export default async function KeuanganPage() {
  const rows = await prisma.operationalCost.findMany({
    orderBy: [
      { tanggal_pencatatan: "desc" },
      { id_biaya: "desc" },
    ],
  });

  const totalPengeluaran = rows.reduce(
    (sum, row) => sum + row.total_pengeluaran,
    0
  );
  const bulanIni = new Date().getMonth();
  const tahunIni = new Date().getFullYear();
  const pengeluaranBulanIni = rows
    .filter((row) => {
      const tanggal = new Date(row.tanggal_pencatatan);
      return tanggal.getMonth() === bulanIni && tanggal.getFullYear() === tahunIni;
    })
    .reduce((sum, row) => sum + row.total_pengeluaran, 0);

  const kategoriAktif = new Set(rows.map((row) => row.kategori_pengeluaran)).size;

  const summaryItems = [
    {
      label: "Pengeluaran Bulan Ini",
      value: formatRupiah(pengeluaranBulanIni),
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
      </div>

      <FormCatatPengeluaran />

      <TabelRiwayatPengeluaran data={rows} />
    </div>
  );
}
