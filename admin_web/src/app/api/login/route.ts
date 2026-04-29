import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 2. Mencari user di database berdasarkan email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // 3. Pengecekan: Apakah user ada? Dan apakah passwordnya cocok?
    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: 'Email atau password salah!' }, { status: 401 });
    }

    // 4. Jika sukses, kembalikan data user dengan nama kolom yang sesuai
    return NextResponse.json({ 
      success: true, 
      message: 'Login berhasil!',
      user: { 
        id: user.id_user, 
        name: user.nama_lengkap, 
        role: user.role 
      }
    });

  } catch (error) {
    console.error('Error saat login:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}