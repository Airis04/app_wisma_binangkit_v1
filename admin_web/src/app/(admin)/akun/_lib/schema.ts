import { z } from "zod";

export const accountProfileSchema = z.object({
  nama_lengkap: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(30, "Nama lengkap maksimal 30 karakter"),
  no_telepon: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .max(15, "Nomor telepon maksimal 15 karakter"),
});

export const accountPasswordSchema = z.object({
  password_lama: z.string().min(1, "Kata sandi lama wajib diisi"),
  password_baru: z
    .string()
    .min(8, "Kata sandi baru minimal 8 karakter")
    .max(72, "Kata sandi baru maksimal 72 karakter"),
});

export type AccountProfileValues = z.infer<typeof accountProfileSchema>;
export type AccountPasswordValues = z.infer<typeof accountPasswordSchema>;
