import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { parseDateOnly, STATUS_AKTIF_OVERLAP } from "@/lib/mobile/reservations";
import { formatUnitMobile, todayDateOnly } from "@/lib/mobile/units";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id_unit: string }> }
) {
  const { id_unit } = await context.params;

  if (id_unit.length > 10) {
    return jsonError("ID unit tidak valid");
  }

  try {
    const today = parseDateOnly(todayDateOnly());

    const unit = await prisma.unit.findUnique({
      where: { id_unit },
      include: {
        fotos: {
          orderBy: { urutan: "asc" },
          select: { id_foto: true, file_path: true, urutan: true },
        },
        reservations: today
          ? {
              where: {
                status_pesanan: { in: [...STATUS_AKTIF_OVERLAP] },
                tgl_checkin: { lte: today },
                tgl_checkout: { gt: today },
              },
              select: {
                id_reservasi: true,
                tgl_checkin: true,
                tgl_checkout: true,
                status_pesanan: true,
              },
            }
          : false,
      },
    });

    if (!unit) {
      return jsonError("Unit tidak ditemukan", 404);
    }

    return jsonOk(formatUnitMobile(unit, { hitungStatusHariIni: true }));
  } catch (err) {
    console.error("Gagal mengambil detail unit:", err);
    return jsonError("Gagal mengambil detail unit", 500);
  }
}
