# Dokumentasi Perubahan Wisma Binangkit

Dokumen ini merangkum perubahan yang sudah dibuat untuk integrasi web admin, backend API, dan aplikasi mobile tamu.

Tanggal dokumentasi: 3 Juni 2026

## 1. Gambaran Sistem

Monorepo ini terdiri dari:

- `admin_web`: Next.js sebagai web admin sekaligus backend API mobile.
- `tamu_mobile`: Flutter sebagai aplikasi tamu.
- Database: PostgreSQL lewat Prisma.

Prinsip utama yang sudah diterapkan:

- Mobile tidak akses database langsung.
- Semua data mobile lewat API di `admin_web`.
- Reservasi memakai soft lock manual: tamu upload bukti bayar, admin setujui/tolak.
- Status dan data penting dibuat auto-refresh agar admin dan tamu cepat sinkron.

## 2. Alur Reservasi Mobile

Alur reservasi tamu sekarang:

1. Tamu daftar/login.
2. Tamu masuk katalog unit.
3. Tamu buka detail unit.
4. Jika unit `Perawatan`, unit tidak bisa dipesan.
5. Jika unit terisi hari ini, detail memberi informasi, tetapi tamu tetap bisa pilih tanggal lain.
6. Tamu pilih tanggal check-in dan check-out.
7. Mobile cek ketersediaan tanggal ke API.
8. Jika tanggal tersedia, tombol `Lanjutkan` membuka step pembayaran.
9. Tamu melihat instruksi rekening pembayaran manual.
10. Tamu upload bukti pembayaran.
11. Status pesanan menjadi `Menunggu Konfirmasi`.
12. Pesanan masuk tabel `Verifikasi Pembayaran` di dashboard admin.
13. Admin klik `Setujui` atau `Tolak`.
14. Mobile otomatis memperbarui status di riwayat/detail pesanan.

## 3. Fitur API Mobile

Endpoint mobile yang sudah dibuat:

- `POST /api/mobile/auth/register`
- `POST /api/mobile/auth/login`
- `GET /api/mobile/auth/me`
- `PATCH /api/mobile/auth/me`
- `POST /api/mobile/auth/me/foto`
- `POST /api/mobile/auth/forgot-password`
- `GET /api/mobile/units`
- `GET /api/mobile/units/[id_unit]`
- `POST /api/mobile/reservations/check-availability`
- `POST /api/mobile/reservations`
- `GET /api/mobile/reservations/me`
- `GET /api/mobile/reservations/[id_reservasi]`
- `POST /api/mobile/reservations/[id_reservasi]/bukti-bayar`
- `GET /api/mobile/payment-settings`

Catatan keamanan:

- Endpoint reservasi memakai JWT mobile.
- Detail reservasi hanya bisa dibuka oleh pemilik reservasi.
- Upload foto/bukti bayar divalidasi tipe dan ukuran file.
- Password disimpan dengan `bcrypt`.

## 4. Fitur Mobile Tamu

Fitur mobile yang sudah dibuat:

- Registrasi akun tamu.
- Login akun tamu.
- Auth guard: user belum login diarahkan ke login.
- Logout.
- Lupa password memakai email dan nomor telepon terdaftar.
- Katalog unit dari API.
- Detail unit dari API.
- Status unit `Perawatan` diblok untuk reservasi.
- Status unit `Terisi` di detail dihitung per hari ini.
- Cek ketersediaan tanggal sebelum pembayaran.
- Step pembayaran manual.
- Instruksi rekening pembayaran dari admin.
- Upload bukti pembayaran.
- Popup sukses setelah kirim bukti bayar.
- CTA `Lihat Pesanan` menuju riwayat.
- Riwayat pesanan.
- Detail riwayat pesanan.
- Pengaturan akun mobile:
  - Edit foto profil.
  - Edit nama lengkap.
  - Edit nomor telepon.
  - Ganti kata sandi.
  - Logout.
  - Informasi akun dan aplikasi.

## 5. Fitur Web Admin

Fitur admin yang sudah dibuat/dirapikan:

- Dashboard menampilkan ringkasan dan tabel `Verifikasi Pembayaran`.
- Admin bisa setujui/tolak pembayaran.
- Jika setujui, status reservasi menjadi `Selesai`.
- Jika tolak, status reservasi menjadi `Batal`.
- Halaman `Pembayaran Manual` untuk mengatur rekening pembayaran.
- Route lama `/pengaturan` diarahkan ke `/pembayaran`.
- Notifikasi icon di header admin dihapus sementara.
- Logout admin tetap melalui icon user kanan atas.
- Pengaturan akun admin:
  - Edit foto profil.
  - Edit nama admin.
  - Edit nomor telepon.
  - Ganti kata sandi.

## 6. Auto-Refresh / Realtime Ringan

Untuk MVP, realtime dibuat memakai polling ringan tanpa package baru.

Polling yang sudah dipasang:

- Dashboard admin: refresh otomatis tiap 5 detik.
- Setelah admin setujui/tolak reservasi: dashboard langsung refresh.
- Katalog mobile: refresh otomatis tiap 10 detik.
- Detail unit mobile: refresh otomatis tiap 10 detik.
- Riwayat pesanan mobile: refresh otomatis tiap 10 detik.
- Detail pesanan mobile: refresh otomatis tiap 10 detik.

Dampaknya:

- Reservasi baru dari mobile cepat masuk ke dashboard admin.
- Status pesanan setelah admin setujui/tolak cepat berubah di mobile.
- Perubahan status/foto/profil lebih cepat terlihat.

## 7. Pembayaran Manual

Konsep pembayaran saat ini:

- Pembayaran dilakukan manual via transfer bank.
- Data rekening diatur admin melalui menu `Pembayaran`.
- Mobile mengambil rekening dari API.
- Tamu upload bukti pembayaran.
- Admin melakukan verifikasi manual.

Data yang bisa diatur admin:

- Nama bank.
- Nomor rekening.
- Nama pemilik rekening.
- Instruksi pembayaran.

## 8. Perubahan Database

Perubahan Prisma yang sudah dilakukan:

- Model `PaymentSetting` ditambahkan untuk menyimpan rekening pembayaran manual.
- Field `foto_profil String? @db.VarChar(255)` ditambahkan pada model `User`.

Perintah yang sudah dijalankan:

```bash
cd admin_web
npx prisma generate
npx prisma db push
```

Catatan:

- Setelah pull/checkout branch terkait, jika database lokal belum sinkron, jalankan lagi `npx prisma db push`.

## 9. Perbaikan Bug Penting

Bug yang sudah diperbaiki:

- App mobile tidak boleh langsung masuk katalog kalau belum login.
- Timeout registrasi karena device tidak bisa akses server dijelaskan dan dibantu lewat `adb reverse`.
- Bug tanggal mundur satu hari pada kalender admin diperbaiki dengan date-only UTC.
- Setelah upload bukti pembayaran muncul popup sukses dan CTA `Lihat Pesanan`.
- Unit `Perawatan` tidak boleh dipesan dari mobile.
- Unit yang sudah terisi hari ini tampil informatif di detail unit.
- Katalog tetap bisa menampilkan `Tersedia` agar tamu bisa memilih tanggal lain.
- Detail unit tidak lagi memakai cache status lama setelah admin mengubah status.
- Foto profil mobile di katalog ikut berubah setelah user update foto.
- Status riwayat pesanan mobile otomatis berubah setelah admin setujui/tolak.
- Dashboard admin otomatis memuat pesanan baru tanpa refresh manual.

## 10. Branch dan Commit Utama

Urutan branch/commit penting:

- `feature/api-mobile-public`
  - `f390e6f feat(api-mobile): tambah auth tamu dan reservasi mobile`
- `feature/mobile-auth`
  - `348a3f7 feat(mobile): tambah registrasi dan login tamu`
- `feature/mobile-katalog`
  - `ccc1ff8 feat(mobile): tampilkan katalog dan detail unit dari API`
- `feature/mobile-reservasi`
  - `06e8495 feat(mobile): tambah form reservasi dan bukti bayar`
- `feature/mobile-riwayat`
  - `1a66479 feat(mobile): tampilkan riwayat pesanan tamu`
- `feature/mobile-auth-guard`
  - `9283965 feat(mobile): tambah auth guard dan logout tamu`
- `feature/api-mobile-availability`
  - `5f9b86b feat(api-mobile): tambah cek ketersediaan reservasi`
- `feature/mobile-availability-flow`
  - `3343dce feat(mobile): tambah alur cek ketersediaan sebelum bayar`
- `feature/mobile-payment-step`
  - `b2668a9 feat(mobile): pisahkan step pembayaran manual`
  - `ffda82c fix(reservasi): koreksi tanggal dan dialog sukses pembayaran`
- `feature/admin-payment-settings`
  - `a52d897 feat(pengaturan): kelola rekening pembayaran manual`
- `fix/unit-status-availability`
  - `e0ea1dc fix(mobile): perjelas status unit dan tanggal terisi`
  - `7638327 fix(mobile): sinkronkan status detail unit harian`
  - `2cfb480 fix(mobile): refresh otomatis status unit`
- `feature/mobile-forgot-password`
  - `e5c0101 feat(mobile): tambah lupa password tamu`
- `feature/mobile-riwayat-detail`
  - `8c18e8f feat(mobile): tambah detail riwayat pesanan`
- `feature/settings-navigation`
  - `0d59634 feat(ui): rapikan menu pembayaran dan pengaturan mobile`
- `feature/account-settings`
  - `670a55e feat(akun): tambah pengaturan profil admin dan tamu`
  - `8958207 fix(mobile): sinkronkan foto profil katalog`
  - `9f2514a fix(mobile): refresh otomatis status riwayat`
  - `e8329ad fix(admin): refresh otomatis verifikasi pembayaran`

## 11. Cara Testing Utama

### Admin Web

```bash
cd admin_web
npm run dev:lan
```

Yang perlu dites:

- Login admin.
- Buka menu `Pembayaran`.
- Simpan rekening pembayaran manual.
- Buka dashboard admin.
- Pastikan tabel `Verifikasi Pembayaran` auto-refresh.
- Setujui/tolak reservasi dan pastikan row langsung berubah/hilang.
- Buka icon user kanan atas.
- Buka `Pengaturan Akun`.
- Edit foto, nama, nomor telepon, dan kata sandi admin.

### Mobile

Jika memakai device fisik dengan USB:

```bash
adb reverse tcp:3000 tcp:3000
cd tamu_mobile
flutter run -d R9RYB01GAKT --dart-define=API_BASE_URL=http://127.0.0.1:3000/api
```

Yang perlu dites:

- Daftar akun tamu baru.
- Login.
- Buka katalog.
- Buka detail unit.
- Pilih tanggal dan cek ketersediaan.
- Lanjut pembayaran.
- Upload bukti pembayaran.
- Buka riwayat dan detail pesanan.
- Di admin, setujui/tolak pembayaran.
- Pastikan mobile update otomatis maksimal 10 detik.
- Buka pengaturan akun mobile.
- Edit foto, nama, nomor telepon, dan kata sandi.
- Pastikan foto profil di katalog ikut berubah.

## 12. Catatan Artefak Testing

Folder berikut muncul dari hasil testing upload dan tidak perlu dicommit:

- `.tmp/`
- `admin_web/public/uploads/payments/`
- `admin_web/public/uploads/profiles/`

Jika ingin membersihkan manual, pastikan file tersebut memang hanya data testing.

## 13. Saran Lanjutan

Fitur yang bisa dipertimbangkan berikutnya:

- Refund/reschedule/pindah unit jika admin membatalkan pesanan setelah pembayaran.
- Notifikasi admin yang benar-benar realtime.
- Notifikasi mobile saat status pesanan berubah.
- Detail bukti refund jika alur refund disetujui dosen pembimbing.
- Migrasi realtime dari polling ke WebSocket/SSE jika nanti dibutuhkan.
