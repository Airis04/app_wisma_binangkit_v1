import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@wismabinangkit.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const namaLengkap = process.env.SEED_ADMIN_NAME ?? "Admin Wisma Binangkit";
  const noTelepon = process.env.SEED_ADMIN_PHONE ?? "081234567890";
  const idUser = process.env.SEED_ADMIN_ID ?? "USR-000001";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin dengan email ${email} sudah ada (id_user=${existing.id_user}). Skip.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      id_user: idUser,
      nama_lengkap: namaLengkap,
      email,
      password: hashed,
      no_telepon: noTelepon,
      role: "admin",
    },
  });

  console.log("✓ Admin berhasil dibuat:");
  console.log(`  id_user      : ${user.id_user}`);
  console.log(`  email        : ${user.email}`);
  console.log(`  nama_lengkap : ${user.nama_lengkap}`);
  console.log(`  password     : ${password}  (segera ganti setelah login pertama)`);
}

main()
  .catch((err) => {
    console.error("✗ Gagal seed admin:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
