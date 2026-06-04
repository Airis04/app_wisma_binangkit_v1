import { CreditCard, Eye, Smartphone } from "lucide-react";

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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1E3A8A]">
            <CreditCard size={14} />
            Metode Pembayaran
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Pembayaran Manual
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            Kelola rekening dan instruksi pembayaran yang ditampilkan kepada
            tamu saat mereka melanjutkan pesanan dan mengunggah bukti bayar.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A]">
              <Smartphone size={18} />
            </div>
            <p className="font-semibold text-gray-900">Terhubung ke Mobile</p>
            <p className="text-sm text-gray-500">
              Perubahan rekening dibaca mobile saat tamu masuk step pembayaran.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981]">
              <Eye size={18} />
            </div>
            <p className="font-semibold text-gray-900">Preview Instruksi</p>
            <p className="text-sm text-gray-500">
              Admin bisa melihat ringkasan tampilan pembayaran sebelum disimpan.
            </p>
          </div>
        </div>
      </div>

      <FormPengaturanPembayaran defaultValues={defaultValues} />
    </div>
  );
}
