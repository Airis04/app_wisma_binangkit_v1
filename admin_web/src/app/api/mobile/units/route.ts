import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { formatUnitMobile } from "@/lib/mobile/units";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    return jsonOk(units.map((unit) => formatUnitMobile(unit)));
  } catch (err) {
    console.error("Gagal mengambil daftar unit:", err);
    return jsonError("Gagal mengambil daftar unit", 500);
  }
}
