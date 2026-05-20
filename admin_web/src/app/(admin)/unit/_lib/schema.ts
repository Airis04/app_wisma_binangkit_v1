import { z } from "zod";

export const KATEGORI_UNIT = ["Rumah Utama", "Kamar Luar"] as const;
export const STATUS_UNIT = ["Tersedia", "Terisi", "Perawatan"] as const;

export const FASILITAS_OPTIONS = [
  "AC",
  "Kipas Angin",
  "WiFi",
  "TV",
  "Kamar Mandi Dalam",
  "Air Panas",
  "Dapur",
  "Kulkas",
  "Parkir",
  "Pemandangan Pantai",
  "Tempat Tidur Tambahan",
  "Sarapan",
] as const;

export const unitFormSchema = z.object({
  id_unit: z
    .string()
    .min(1, "ID Unit wajib diisi")
    .max(10, "ID Unit maksimal 10 karakter")
    .regex(/^[A-Z0-9-]+$/, "Hanya huruf kapital, angka, dan strip"),
  nama_unit: z
    .string()
    .min(1, "Nama unit wajib diisi")
    .max(30, "Nama unit maksimal 30 karakter"),
  kategori: z.enum(KATEGORI_UNIT, {
    message: "Pilih kategori unit",
  }),
  harga_per_malam: z
    .number({ message: "Harga harus berupa angka" })
    .int("Harga harus bilangan bulat")
    .positive("Harga harus lebih dari 0"),
  kapasitas: z
    .number({ message: "Kapasitas harus berupa angka" })
    .int("Kapasitas harus bilangan bulat")
    .positive("Kapasitas minimal 1"),
  fasilitas: z
    .array(z.string())
    .min(1, "Pilih minimal 1 fasilitas"),
  status_unit: z.enum(STATUS_UNIT, {
    message: "Pilih status unit",
  }),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;
