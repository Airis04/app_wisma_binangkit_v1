import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pecahFasilitas(fasilitas: string) {
  return fasilitas
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { id_unit: "asc" },
      include: {
        fotos: {
          orderBy: { urutan: "asc" },
          select: { id_foto: true, file_path: true, urutan: true },
        },
      },
    });

    return jsonOk(
      units.map((unit) => ({
        id_unit: unit.id_unit,
        nama_unit: unit.nama_unit,
        kategori: unit.kategori,
        harga_per_malam: unit.harga_per_malam,
        kapasitas: unit.kapasitas,
        fasilitas: pecahFasilitas(unit.fasilitas),
        foto_unit: unit.foto_unit,
        status_unit: unit.status_unit,
        fotos: unit.fotos,
      }))
    );
  } catch (err) {
    console.error("Gagal mengambil daftar unit:", err);
    return jsonError("Gagal mengambil daftar unit", 500);
  }
}
