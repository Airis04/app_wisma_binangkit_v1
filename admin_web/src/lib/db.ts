import { Pool } from 'pg';

// Membuat antrean koneksi (pool) ke database menggunakan URL dari file .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;