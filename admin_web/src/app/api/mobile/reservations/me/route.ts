import prisma from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { requireMobileUser } from "@/lib/mobile/auth";
import { formatReservasiMobile } from "@/lib/mobile/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireMobileUser(request);
  if (!auth.ok) return auth.response;

  try {
    const reservations = await prisma.reservation.findMany({
      where: { id_user: auth.user.id_user },
      orderBy: { created_at: "desc" },
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

    return jsonOk(reservations.map(formatReservasiMobile));
  } catch (err) {
    console.error("Gagal mengambil riwayat reservasi:", err);
    return jsonError("Gagal mengambil riwayat reservasi", 500);
  }
}
