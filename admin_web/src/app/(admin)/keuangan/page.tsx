import prisma from "@/lib/prisma";
import FormCatatPengeluaran from "./_components/form-catat-pengeluaran";
import TabelRiwayatPengeluaran from "./_components/tabel-riwayat-pengeluaran";

export default async function KeuanganPage() {
  const rows = await prisma.operationalCost.findMany({
    orderBy: [
      { tanggal_pencatatan: "desc" },
      { id_biaya: "desc" },
    ],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Keuangan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Catat dan pantau seluruh pengeluaran operasional Wisma Binangkit.
          Total pengeluaran otomatis dipotong dari pemasukan untuk menghasilkan
          laba bersih di Dasbor.
        </p>
      </div>

      <FormCatatPengeluaran />

      <TabelRiwayatPengeluaran data={rows} />
    </div>
  );
}
