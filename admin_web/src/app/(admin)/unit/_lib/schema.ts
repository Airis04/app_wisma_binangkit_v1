import { z } from "zod";

export const KATEGORI_UNIT = ["Rumah Utama", "Kamar Luar"] as const;
export const STATUS_UNIT = ["Tersedia", "Terisi", "Perawatan"] as const;

export const FASILITAS_DEFAULT = ["WiFi", "AC", "TV"] as const;

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
  kapasitas: z
    .number({ message: "Kapasitas harus berupa angka" })
    .int("Kapasitas harus bilangan bulat")
    .positive("Kapasitas minimal 1"),
  fasilitas: z.array(z.enum(FASILITAS_DEFAULT)),
  fasilitas_lainnya: z.string().max(200, "Fasilitas lainnya maksimal 200 karakter"),
  kategori: z.enum(KATEGORI_UNIT, {
    message: "Pilih kategori unit",
  }),
  status_unit: z.enum(STATUS_UNIT, {
    message: "Pilih status unit",
  }),
  harga_per_malam: z
    .number({ message: "Harga harus berupa angka" })
    .int("Harga harus bilangan bulat")
    .positive("Harga harus lebih dari 0"),
}).refine(
  (data) => data.fasilitas.length > 0 || data.fasilitas_lainnya.trim().length > 0,
  {
    message: "Pilih minimal 1 fasilitas atau isi fasilitas lainnya",
    path: ["fasilitas"],
  }
);

export type UnitFormValues = z.infer<typeof unitFormSchema>;

export function gabungFasilitas(
  fasilitas: string[],
  fasilitasLainnya: string
): string {
  const lainnya = fasilitasLainnya
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...fasilitas, ...lainnya].join(", ");
}

export function pisahFasilitas(gabungan: string): {
  fasilitas: string[];
  fasilitas_lainnya: string;
} {
  const all = gabungan
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const defaultSet = new Set<string>(FASILITAS_DEFAULT);
  const fasilitas = all.filter((f) => defaultSet.has(f));
  const lainnya = all.filter((f) => !defaultSet.has(f));
  return { fasilitas, fasilitas_lainnya: lainnya.join(", ") };
}
