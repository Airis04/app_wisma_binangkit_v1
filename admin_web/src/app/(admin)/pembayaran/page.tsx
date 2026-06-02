import prisma from "@/lib/prisma";
import FormPengaturanPembayaran from "./_components/form-pengaturan-pembayaran";
import { DEFAULT_PAYMENT_SETTING } from "./_lib/schema";

export default async function PembayaranPage() {
  const paymentSetting = await prisma.paymentSetting.findUnique({
    where: { id_setting: DEFAULT_PAYMENT_SETTING.id_setting },
  });

  const defaultValues = paymentSetting
    ? {
        id_setting: paymentSetting.id_setting,
        nama_bank: paymentSetting.nama_bank,
        nomor_rekening: paymentSetting.nomor_rekening,
        nama_pemilik_rekening: paymentSetting.nama_pemilik_rekening,
        instruksi_pembayaran: paymentSetting.instruksi_pembayaran,
      }
    : DEFAULT_PAYMENT_SETTING;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Pembayaran Manual
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola rekening dan instruksi pembayaran yang ditampilkan kepada tamu.
        </p>
      </div>

      <FormPengaturanPembayaran defaultValues={defaultValues} />
    </div>
  );
}
