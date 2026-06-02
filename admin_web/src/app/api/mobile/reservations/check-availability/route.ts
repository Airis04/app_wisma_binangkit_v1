import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/mobile/api-response";
import { requireMobileUser } from "@/lib/mobile/auth";
import {
  cekKetersediaanUnit,
  validasiInputTanggalReservasi,
} from "@/lib/mobile/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const availabilitySchema = z.object({
  id_unit: z.string().trim().max(10, "ID unit maksimal 10 karakter"),
  tgl_checkin: z.string().trim(),
  tgl_checkout: z.string().trim(),
});

export async function POST(request: Request) {
  const auth = await requireMobileUser(request);
  if (!auth.ok) return auth.response;

  let parsed;
  try {
    parsed = availabilitySchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(
        err.issues[0]?.message ?? "Data cek ketersediaan tidak valid"
      );
    }
    return jsonError("Body JSON tidak valid");
  }

  const tanggal = validasiInputTanggalReservasi(parsed);
  if (!tanggal.ok) {
    return jsonError(tanggal.message);
  }

  try {
    const result = await cekKetersediaanUnit({
      id_unit: parsed.id_unit,
      checkin: tanggal.checkin,
      checkout: tanggal.checkout,
    });

    if (!result.ok) {
      return jsonError(result.message, result.status);
    }

    const totalTagihan = result.available
      ? result.unit.harga_per_malam * tanggal.jumlah_malam
      : 0;

    return jsonOk({
      available: result.available,
      reason: result.reason,
      message: result.message,
      jumlah_malam: tanggal.jumlah_malam,
      total_tagihan: totalTagihan,
      unit: result.unit,
      overlap: "overlap" in result ? result.overlap : null,
    });
  } catch (err) {
    console.error("Gagal cek ketersediaan:", err);
    return jsonError("Gagal cek ketersediaan", 500);
  }
}
