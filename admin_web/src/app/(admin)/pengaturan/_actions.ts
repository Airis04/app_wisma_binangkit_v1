"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  DEFAULT_PAYMENT_SETTING,
  paymentSettingFormSchema,
} from "./_lib/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Tidak diizinkan");
  }
}

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function updatePaymentSetting(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  let parsed;
  try {
    parsed = paymentSettingFormSchema.parse({
      id_setting: String(formData.get("id_setting") ?? "").trim(),
      nama_bank: String(formData.get("nama_bank") ?? "").trim(),
      nomor_rekening: String(formData.get("nomor_rekening") ?? "").trim(),
      nama_pemilik_rekening: String(
        formData.get("nama_pemilik_rekening") ?? ""
      ).trim(),
      instruksi_pembayaran: String(
        formData.get("instruksi_pembayaran") ?? ""
      ).trim(),
    });
  } catch (err) {
    if (err instanceof Error) {
      return { ok: false, message: err.message };
    }
    return { ok: false, message: "Data pengaturan pembayaran tidak valid" };
  }

  await prisma.paymentSetting.upsert({
    where: { id_setting: DEFAULT_PAYMENT_SETTING.id_setting },
    create: parsed,
    update: {
      nama_bank: parsed.nama_bank,
      nomor_rekening: parsed.nomor_rekening,
      nama_pemilik_rekening: parsed.nama_pemilik_rekening,
      instruksi_pembayaran: parsed.instruksi_pembayaran,
    },
  });

  revalidatePath("/pengaturan");

  return {
    ok: true,
    message: "Pengaturan pembayaran berhasil disimpan",
  };
}
