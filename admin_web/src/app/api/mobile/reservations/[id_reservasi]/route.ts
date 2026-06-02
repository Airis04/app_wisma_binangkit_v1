import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { requireMobileUser } from "@/lib/mobile/auth";
import { formatReservasiMobile } from "@/lib/mobile/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id_reservasi: string }> }
) {
  const auth = await requireMobileUser(request);
  if (!auth.ok) return auth.response;

  const { id_reservasi } = await context.params;
  if (id_reservasi.length > 10) {
    return jsonError("ID reservasi tidak valid");
  }

  try {
    const reservasi = await prisma.reservation.findUnique({
      where: { id_reservasi },
      include: {
        unit: {
          select: {
            id_unit: true,
            nama_unit: true,
            kategori: true,
            harga_per_malam: true,
            kapasitas: true,
            foto_unit: true,
            status_unit: true,
          },
        },
      },
    });

    if (!reservasi || reservasi.id_user !== auth.user.id_user) {
      return jsonError("Reservasi tidak ditemukan", 404);
    }

    return jsonOk(formatReservasiMobile(reservasi));
  } catch (err) {
    console.error("Gagal mengambil detail reservasi:", err);
    return jsonError("Gagal mengambil detail reservasi", 500);
  }
}
