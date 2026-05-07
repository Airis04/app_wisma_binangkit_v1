import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Mengambil URL dari file .env
const connectionString = `${process.env.DATABASE_URL}`;

// Inisialisasi pool koneksi
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Inisialisasi Prisma Client dengan adapter
const prisma = new PrismaClient({ adapter });

export default prisma;