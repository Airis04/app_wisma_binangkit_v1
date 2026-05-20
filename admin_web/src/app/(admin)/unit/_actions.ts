"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unitFormSchema } from "./_lib/schema";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "units");
const PUBLIC_PATH_PREFIX = "/uploads/units";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Tidak diizinkan");
  }
}

async function processFoto(file: File, idUnit: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(buffer)
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const fileName = `${idUnit}.webp`;
  await writeFile(path.join(UPLOAD_DIR, fileName), compressed);
  return `${PUBLIC_PATH_PREFIX}/${fileName}`;
}

function parseFormPayload(formData: FormData) {
  const fasilitasRaw = formData.getAll("fasilitas").map((v) => String(v));

  return unitFormSchema.parse({
    id_unit: String(formData.get("id_unit") ?? "").trim().toUpperCase(),
    nama_unit: String(formData.get("nama_unit") ?? "").trim(),
    kategori: String(formData.get("kategori") ?? ""),
    harga_per_malam: Number(formData.get("harga_per_malam")),
    kapasitas: Number(formData.get("kapasitas")),
    fasilitas: fasilitasRaw,
    status_unit: String(formData.get("status_unit") ?? ""),
  });
}

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function createUnit(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  let parsed;
  try {
    parsed = parseFormPayload(formData);
  } catch (err) {
    if (err instanceof Error) {
      return { ok: false, message: err.message };
    }
    return { ok: false, message: "Data form tidak valid" };
  }

  const existing = await prisma.unit.findUnique({
    where: { id_unit: parsed.id_unit },
  });
  if (existing) {
    return { ok: false, message: `ID Unit ${parsed.id_unit} sudah dipakai` };
  }

  const fotoFile = formData.get("foto") as File | null;
  let fotoPath: string | null = null;
  if (fotoFile && fotoFile.size > 0) {
    try {
      fotoPath = await processFoto(fotoFile, parsed.id_unit);
    } catch (err) {
      console.error("Gagal proses foto:", err);
      return { ok: false, message: "Gagal memproses foto unit" };
    }
  }

  await prisma.unit.create({
    data: {
      id_unit: parsed.id_unit,
      nama_unit: parsed.nama_unit,
      kategori: parsed.kategori,
      harga_per_malam: parsed.harga_per_malam,
      kapasitas: parsed.kapasitas,
      fasilitas: parsed.fasilitas.join(", "),
      foto_unit: fotoPath,
      status_unit: parsed.status_unit,
    },
  });

  revalidatePath("/unit");
  redirect("/unit");
}

export async function updateUnit(
  idUnit: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  let parsed;
  try {
    parsed = parseFormPayload(formData);
  } catch (err) {
    if (err instanceof Error) {
      return { ok: false, message: err.message };
    }
    return { ok: false, message: "Data form tidak valid" };
  }

  if (parsed.id_unit !== idUnit) {
    return { ok: false, message: "ID Unit tidak boleh diubah" };
  }

  const existing = await prisma.unit.findUnique({
    where: { id_unit: idUnit },
  });
  if (!existing) {
    return { ok: false, message: "Unit tidak ditemukan" };
  }

  const fotoFile = formData.get("foto") as File | null;
  let fotoPath = existing.foto_unit;
  if (fotoFile && fotoFile.size > 0) {
    try {
      fotoPath = await processFoto(fotoFile, idUnit);
    } catch (err) {
      console.error("Gagal proses foto:", err);
      return { ok: false, message: "Gagal memproses foto unit" };
    }
  }

  await prisma.unit.update({
    where: { id_unit: idUnit },
    data: {
      nama_unit: parsed.nama_unit,
      kategori: parsed.kategori,
      harga_per_malam: parsed.harga_per_malam,
      kapasitas: parsed.kapasitas,
      fasilitas: parsed.fasilitas.join(", "),
      foto_unit: fotoPath,
      status_unit: parsed.status_unit,
    },
  });

  revalidatePath("/unit");
  revalidatePath(`/unit/${idUnit}/edit`);
  redirect("/unit");
}

export async function deleteUnit(idUnit: string): Promise<ActionResult> {
  await requireAdmin();

  const reservasiAktif = await prisma.reservation.count({
    where: {
      id_unit: idUnit,
      status_pesanan: { in: ["Menunggu Konfirmasi", "Selesai"] },
    },
  });

  if (reservasiAktif > 0) {
    return {
      ok: false,
      message: `Unit masih punya ${reservasiAktif} reservasi aktif. Tidak bisa dihapus.`,
    };
  }

  const unit = await prisma.unit.findUnique({ where: { id_unit: idUnit } });
  if (!unit) {
    return { ok: false, message: "Unit tidak ditemukan" };
  }

  await prisma.unit.delete({ where: { id_unit: idUnit } });

  if (unit.foto_unit) {
    const fileName = path.basename(unit.foto_unit);
    try {
      await unlink(path.join(UPLOAD_DIR, fileName));
    } catch {
      // foto sudah tidak ada, abaikan
    }
  }

  revalidatePath("/unit");
  return { ok: true };
}
