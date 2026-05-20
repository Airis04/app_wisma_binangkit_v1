import { z } from "zod";

export const KATEGORI_PENGELUARAN = [
  "Utilitas",
  "Pemeliharaan",
  "Konsumsi",
] as const;

export const operationalCostFormSchema = z.object({
  tanggal_pencatatan: z
    .custom<Date>((val) => val instanceof Date && !Number.isNaN(val.getTime()), {
      message: "Tanggal pencatatan wajib diisi",
    }),
  kategori_pengeluaran: z.enum(KATEGORI_PENGELUARAN, {
    message: "Pilih kategori pengeluaran",
  }),
  deskripsi_pengeluaran: z
    .string()
    .min(1, "Deskripsi wajib diisi")
    .max(100, "Deskripsi maksimal 100 karakter"),
  total_pengeluaran: z
    .number({ message: "Total pengeluaran harus berupa angka" })
    .int("Total pengeluaran harus bilangan bulat")
    .positive("Total pengeluaran harus lebih dari 0"),
});

export type OperationalCostFormValues = z.infer<typeof operationalCostFormSchema>;
