import { z } from "zod";

export const paymentSettingFormSchema = z.object({
  id_setting: z.string().max(10, "ID setting maksimal 10 karakter"),
  nama_bank: z
    .string()
    .trim()
    .min(1, "Nama bank wajib diisi")
    .max(30, "Nama bank maksimal 30 karakter"),
  nomor_rekening: z
    .string()
    .trim()
    .min(1, "Nomor rekening wajib diisi")
    .max(30, "Nomor rekening maksimal 30 karakter"),
  nama_pemilik_rekening: z
    .string()
    .trim()
    .min(1, "Atas nama rekening wajib diisi")
    .max(50, "Atas nama rekening maksimal 50 karakter"),
  instruksi_pembayaran: z
    .string()
    .trim()
    .min(1, "Instruksi pembayaran wajib diisi")
    .max(200, "Instruksi pembayaran maksimal 200 karakter"),
});

export type PaymentSettingFormValues = z.infer<
  typeof paymentSettingFormSchema
>;

export const DEFAULT_PAYMENT_SETTING: PaymentSettingFormValues = {
  id_setting: "PAY-000001",
  nama_bank: "BCA",
  nomor_rekening: "1234567890",
  nama_pemilik_rekening: "Wisma Binangkit",
  instruksi_pembayaran:
    "Transfer sesuai nominal tagihan, lalu unggah bukti pembayaran agar pemilik dapat memverifikasi pesanan.",
};
