import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { parseDateOnly, STATUS_AKTIF_OVERLAP } from "@/lib/mobile/reservations";
import { formatUnitMobile, todayDateOnly } from "@/lib/mobile/units";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = parseDateOnly(todayDateOnly());

    const units = await prisma.unit.findMany({
      orderBy: { id_unit: "asc" },
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

    return jsonOk(units.map(formatUnitMobile));
  } catch (err) {
    console.error("Gagal mengambil daftar unit:", err);
    return jsonError("Gagal mengambil daftar unit", 500);
  }
}
