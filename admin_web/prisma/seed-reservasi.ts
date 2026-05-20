import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

const TAMU_DUMMY = [
  {
    id_user: "USR-000010",
    nama: "Budi Santoso",
    email: "budi.santoso@example.com",
    no_telepon: "081234567811",
  },
  {
    id_user: "USR-000011",
    nama: "Siti Nurhaliza",
    email: "siti.nurhaliza@example.com",
    no_telepon: "081234567812",
  },
  {
    id_user: "USR-000012",
    nama: "Agus Wijaya",
    email: "agus.wijaya@example.com",
    no_telepon: "081234567813",
  },
  {
    id_user: "USR-000013",
    nama: "Dewi Lestari",
    email: "dewi.lestari@example.com",
    no_telepon: "081234567814",
  },
  {
    id_user: "USR-000014",
    nama: "Rahmat Hidayat",
    email: "rahmat.hidayat@example.com",
    no_telepon: "081234567815",
  },
];

async function ensureTamu() {
  const password = await bcrypt.hash("tamu12345", 10);

  for (const tamu of TAMU_DUMMY) {
    const existing = await prisma.user.findUnique({
      where: { id_user: tamu.id_user },
    });
    if (existing) continue;

    await prisma.user.create({
      data: {
        id_user: tamu.id_user,
        nama_lengkap: tamu.nama,
        email: tamu.email,
        password,
        no_telepon: tamu.no_telepon,
        role: "tamu",
      },
    });
    console.log(`  + Tamu ${tamu.id_user} (${tamu.nama}) ditambahkan`);
  }
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("→ Seed tamu dummy...");
  await ensureTamu();

  const units = await prisma.unit.findMany({ orderBy: { id_unit: "asc" } });
  if (units.length === 0) {
    console.error(
      "✗ Tidak ada unit di database. Tambah unit dulu lewat /unit/baru sebelum jalankan seed ini."
    );
    return;
  }

  console.log(`→ Seed reservasi dummy untuk ${units.length} unit...`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reservasiTemplates: Array<{
    id_user: string;
    offsetCheckin: number;
    durasi: number;
    status: "Selesai" | "Menunggu Konfirmasi";
  }> = [
    { id_user: "USR-000010", offsetCheckin: -10, durasi: 3, status: "Selesai" },
    { id_user: "USR-000011", offsetCheckin: -3, durasi: 2, status: "Selesai" },
    { id_user: "USR-000012", offsetCheckin: 4, durasi: 4, status: "Selesai" },
    { id_user: "USR-000013", offsetCheckin: 12, durasi: 2, status: "Selesai" },
    { id_user: "USR-000014", offsetCheckin: 20, durasi: 3, status: "Menunggu Konfirmasi" },
  ];

  let counter = 1;

  await prisma.$transaction(async (tx) => {
    const last = await tx.reservation.findFirst({
      orderBy: { id_reservasi: "desc" },
      select: { id_reservasi: true },
    });
    if (last?.id_reservasi) {
      const num = Number.parseInt(last.id_reservasi.replace("RES-", ""), 10);
      if (Number.isFinite(num)) counter = num + 1;
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (let unitIdx = 0; unitIdx < units.length; unitIdx++) {
      const unit = units[unitIdx];
      const template = reservasiTemplates[unitIdx % reservasiTemplates.length];

      const checkin = addDays(today, template.offsetCheckin + unitIdx * 2);
      const checkout = addDays(checkin, template.durasi);

      const overlap = await tx.reservation.findFirst({
        where: {
          id_unit: unit.id_unit,
          status_pesanan: { in: ["Menunggu Konfirmasi", "Selesai"] },
          tgl_checkin: { lt: checkout },
          tgl_checkout: { gt: checkin },
        },
      });

      if (overlap) {
        skippedCount++;
        continue;
      }

      const idReservasi = `RES-${String(counter).padStart(6, "0")}`;
      counter++;

      await tx.reservation.create({
        data: {
          id_reservasi: idReservasi,
          id_user: template.id_user,
          id_unit: unit.id_unit,
          tgl_checkin: checkin,
          tgl_checkout: checkout,
          total_tagihan: unit.harga_per_malam * template.durasi,
          bukti_bayar:
            template.status === "Selesai"
              ? "/uploads/units/.gitkeep"
              : null,
          status_pesanan: template.status,
        },
      });
      createdCount++;
      console.log(
        `  + ${idReservasi} | ${unit.id_unit} ${unit.nama_unit} | ${
          checkin.toISOString().slice(0, 10)
        } - ${checkout.toISOString().slice(0, 10)} | ${template.status}`
      );
    }

    console.log(`✓ ${createdCount} reservasi dibuat, ${skippedCount} di-skip karena overlap.`);
  });
}

main()
  .catch((err) => {
    console.error("✗ Gagal seed reservasi:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
