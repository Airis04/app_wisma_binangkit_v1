import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { DEFAULT_PAYMENT_SETTING } from "@/src/app/(admin)/pembayaran/_lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.paymentSetting.findUnique({
      where: { id_setting: DEFAULT_PAYMENT_SETTING.id_setting },
    });

    const data = setting
      ? {
          id_setting: setting.id_setting,
          nama_bank: setting.nama_bank,
          nomor_rekening: setting.nomor_rekening,
          nama_pemilik_rekening: setting.nama_pemilik_rekening,
          instruksi_pembayaran: setting.instruksi_pembayaran,
        }
      : DEFAULT_PAYMENT_SETTING;

    return jsonOk(data);
  } catch (err) {
    console.error("Gagal mengambil data pembayaran:", err);
    return jsonError("Gagal mengambil data pembayaran", 500);
  }
}
