"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { KATEGORI_PENGELUARAN } from "./_lib/schema";

const ID_PREFIX = "BIY-";
const ID_PAD = 6;

const serverInputSchema = z.object({
  tanggal_pencatatan: z.coerce.date({
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

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Tidak diizinkan");
  }
}

async function generateNextIdBiaya(
  tx: { operationalCost: { findFirst: typeof prisma.operationalCost.findFirst } }
): Promise<string> {
  const last = await tx.operationalCost.findFirst({
    orderBy: { id_biaya: "desc" },
    select: { id_biaya: true },
  });

  let nextNum = 1;
  if (last?.id_biaya) {
    const numPart = last.id_biaya.replace(ID_PREFIX, "");
    const parsed = Number.parseInt(numPart, 10);
    if (Number.isFinite(parsed)) nextNum = parsed + 1;
  }

  return ID_PREFIX + String(nextNum).padStart(ID_PAD, "0");
}

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function createOperationalCost(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  let parsed;
  try {
    parsed = serverInputSchema.parse({
      tanggal_pencatatan: formData.get("tanggal_pencatatan"),
      kategori_pengeluaran: String(formData.get("kategori_pengeluaran") ?? ""),
      deskripsi_pengeluaran: String(
        formData.get("deskripsi_pengeluaran") ?? ""
      ).trim(),
      total_pengeluaran: Number(formData.get("total_pengeluaran")),
    });
  } catch (err) {
    if (err instanceof Error) {
      return { ok: false, message: err.message };
    }
    return { ok: false, message: "Data form tidak valid" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const idBiaya = await generateNextIdBiaya(tx);
      await tx.operationalCost.create({
        data: {
          id_biaya: idBiaya,
          tanggal_pencatatan: parsed.tanggal_pencatatan,
          kategori_pengeluaran: parsed.kategori_pengeluaran,
          deskripsi_pengeluaran: parsed.deskripsi_pengeluaran,
          total_pengeluaran: parsed.total_pengeluaran,
        },
      });
    });
  } catch (err) {
    console.error("Gagal simpan pengeluaran:", err);
    return { ok: false, message: "Gagal menyimpan pengeluaran" };
  }

  revalidatePath("/keuangan");
  revalidatePath("/dasbor");
  return { ok: true };
}

export async function deleteOperationalCost(
  idBiaya: string
): Promise<ActionResult> {
  await requireAdmin();

  const existing = await prisma.operationalCost.findUnique({
    where: { id_biaya: idBiaya },
  });
  if (!existing) {
    return { ok: false, message: "Data pengeluaran tidak ditemukan" };
  }

  await prisma.operationalCost.delete({ where: { id_biaya: idBiaya } });

  revalidatePath("/keuangan");
  revalidatePath("/dasbor");
  return { ok: true };
}
