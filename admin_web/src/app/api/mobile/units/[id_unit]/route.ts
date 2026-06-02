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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id_unit: string }> }
) {
  const { id_unit } = await context.params;

  if (id_unit.length > 10) {
    return jsonError("ID unit tidak valid");
  }

  try {
    const unit = await prisma.unit.findUnique({
      where: { id_unit },
      include: {
        fotos: {
          orderBy: { urutan: "asc" },
          select: { id_foto: true, file_path: true, urutan: true },
        },
      },
    });

    if (!unit) {
      return jsonError("Unit tidak ditemukan", 404);
    }

    return jsonOk({
      id_unit: unit.id_unit,
      nama_unit: unit.nama_unit,
      kategori: unit.kategori,
      harga_per_malam: unit.harga_per_malam,
      kapasitas: unit.kapasitas,
      fasilitas: pecahFasilitas(unit.fasilitas),
      foto_unit: unit.foto_unit,
      status_unit: unit.status_unit,
      fotos: unit.fotos,
    });
  } catch (err) {
    console.error("Gagal mengambil detail unit:", err);
    return jsonError("Gagal mengambil detail unit", 500);
  }
}
