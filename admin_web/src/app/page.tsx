import pool from '../lib/db';

export default async function Home() {
  // Mencoba mengambil waktu saat ini langsung dari mesin PostgreSQL
  let dbTime = "Gagal terhubung ke database";
  try {
    const result = await pool.query('SELECT NOW()');
    dbTime = String(result.rows[0].now);
  } catch (error) {
    console.error("Database Error:", error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black">
      <h1 className="text-4xl font-bold mb-4">🚀 Next.js Berhasil Berjalan!</h1>
      <div className="p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Status Koneksi PostgreSQL:</h2>
        <p className="text-blue-600 font-mono">{dbTime}</p>
      </div>
    </main>
  );
}