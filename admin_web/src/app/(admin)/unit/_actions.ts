"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unitFormSchema, gabungFasilitas } from "./_lib/schema";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "units");
const PUBLIC_PATH_PREFIX = "/uploads/units";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Tidak diizinkan");
  }
}

async function compressFoto(file: File): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return await sharp(buffer)
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

async function saveFoto(
  file: File,
  idUnit: string,
  index: number
): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const compressed = await compressFoto(file);
  const fileName = `${idUnit}-${Date.now()}-${index}.webp`;
  await writeFile(path.join(UPLOAD_DIR, fileName), compressed);
  return `${PUBLIC_PATH_PREFIX}/${fileName}`;
}

async function unlinkPublicFile(publicPath: string) {
  if (!publicPath) return;
  const fileName = path.basename(publicPath);
  try {
    await unlink(path.join(UPLOAD_DIR, fileName));
  } catch {
    // file sudah tidak ada, abaikan
  }
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
    fasilitas_lainnya: String(formData.get("fasilitas_lainnya") ?? "").trim(),
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

  const fotoFiles = formData
    .getAll("foto_baru")
    .filter((v): v is File => v instanceof File && v.size > 0);

  if (fotoFiles.length === 0) {
    return { ok: false, message: "Tambahkan minimal 1 foto unit" };
  }

  const fotoPaths: string[] = [];
  try {
    for (let i = 0; i < fotoFiles.length; i++) {
      fotoPaths.push(await saveFoto(fotoFiles[i], parsed.id_unit, i));
    }
  } catch (err) {
    console.error("Gagal proses foto:", err);
    for (const p of fotoPaths) {
      await unlinkPublicFile(p);
    }
    return { ok: false, message: "Gagal memproses foto unit" };
  }

  const fasilitasGabungan = gabungFasilitas(
    parsed.fasilitas,
    parsed.fasilitas_lainnya
  );

  await prisma.unit.create({
    data: {
      id_unit: parsed.id_unit,
      nama_unit: parsed.nama_unit,
      kategori: parsed.kategori,
      harga_per_malam: parsed.harga_per_malam,
      kapasitas: parsed.kapasitas,
      fasilitas: fasilitasGabungan,
      foto_unit: fotoPaths[0],
      status_unit: parsed.status_unit,
      fotos: {
        create: fotoPaths.map((p, idx) => ({
          file_path: p,
          urutan: idx,
        })),
      },
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
    include: { fotos: { orderBy: { urutan: "asc" } } },
  });
  if (!existing) {
    return { ok: false, message: "Unit tidak ditemukan" };
  }

  const removedIds = formData
    .getAll("foto_dihapus")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n));

  const fotoFiles = formData
    .getAll("foto_baru")
    .filter((v): v is File => v instanceof File && v.size > 0);

  const remainingExistingFotos = existing.fotos.filter(
    (f) => !removedIds.includes(f.id_foto)
  );

  if (remainingExistingFotos.length === 0 && fotoFiles.length === 0) {
    return { ok: false, message: "Unit harus punya minimal 1 foto" };
  }

  const newFotoPaths: string[] = [];
  try {
    for (let i = 0; i < fotoFiles.length; i++) {
      newFotoPaths.push(await saveFoto(fotoFiles[i], idUnit, i));
    }
  } catch (err) {
    console.error("Gagal proses foto:", err);
    for (const p of newFotoPaths) {
      await unlinkPublicFile(p);
    }
    return { ok: false, message: "Gagal memproses foto unit" };
  }

  const fasilitasGabungan = gabungFasilitas(
    parsed.fasilitas,
    parsed.fasilitas_lainnya
  );

  const coverPath =
    remainingExistingFotos[0]?.file_path ?? newFotoPaths[0] ?? null;

  await prisma.$transaction(async (tx) => {
    if (removedIds.length > 0) {
      await tx.unitFoto.deleteMany({
        where: { id_foto: { in: removedIds }, id_unit: idUnit },
      });
    }

    if (newFotoPaths.length > 0) {
      const startUrutan = remainingExistingFotos.length;
      await tx.unitFoto.createMany({
        data: newFotoPaths.map((p, idx) => ({
          id_unit: idUnit,
          file_path: p,
          urutan: startUrutan + idx,
        })),
      });
    }

    await tx.unit.update({
      where: { id_unit: idUnit },
      data: {
        nama_unit: parsed.nama_unit,
        kategori: parsed.kategori,
        harga_per_malam: parsed.harga_per_malam,
        kapasitas: parsed.kapasitas,
        fasilitas: fasilitasGabungan,
        foto_unit: coverPath,
        status_unit: parsed.status_unit,
      },
    });
  });

  const removedFotos = existing.fotos.filter((f) => removedIds.includes(f.id_foto));
  for (const f of removedFotos) {
    await unlinkPublicFile(f.file_path);
  }

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

  const unit = await prisma.unit.findUnique({
    where: { id_unit: idUnit },
    include: { fotos: true },
  });
  if (!unit) {
    return { ok: false, message: "Unit tidak ditemukan" };
  }

  await prisma.unit.delete({ where: { id_unit: idUnit } });

  for (const foto of unit.fotos) {
    await unlinkPublicFile(foto.file_path);
  }
  if (unit.foto_unit && !unit.fotos.some((f) => f.file_path === unit.foto_unit)) {
    await unlinkPublicFile(unit.foto_unit);
  }

  revalidatePath("/unit");
  return { ok: true };
}
