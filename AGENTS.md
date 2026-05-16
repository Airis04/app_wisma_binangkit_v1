# ATURAN KETAT PENGEMBANGAN — WISMA BINANGKIT

Dokumen ini berlaku untuk **seluruh proyek** (web admin, backend API, dan mobile tamu). Setiap proses rekayasa perangkat lunak (vibe coding, refactor, bugfix, fitur baru) **WAJIB** mengikuti aturan di bawah. Dilarang menyimpang tanpa konfirmasi user.

---

## 0. STRUKTUR MONOREPO

```
app_wisma_binangkit/
├── admin_web/      → Next.js 16 (App Router) — Web Admin + Backend API
├── tamu_mobile/    → Flutter (Dart) — Aplikasi Mobile Tamu
└── AGENTS.md       → File ini (aturan global)
```

- `admin_web` berperan **ganda**: frontend dasbor admin sekaligus backend API yang dikonsumsi mobile.
- `tamu_mobile` adalah klien mobile saja, tidak boleh akses DB langsung — selalu lewat API di `admin_web`.

---

## 1. TECH STACK (DIKUNCI — DILARANG GANTI)

### A. Web Admin & Backend API (`admin_web/`)
| Layer | Library Wajib |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript ketat |
| Styling | Tailwind CSS v4 + `shadcn/ui` (Radix) |
| Form & Validasi | `react-hook-form` + `zod` |
| Kalender Dasbor | `react-big-calendar` (grid bulanan, BUKAN gantt) |
| Auth Sesi | NextAuth.js / Auth.js v5 + `bcrypt` |
| Upload Gambar | `sharp` untuk kompresi sebelum simpan |
| ORM | Prisma + `@prisma/adapter-pg` + `pg` → PostgreSQL |

> **Catatan Next.js 16**: versi ini punya breaking changes. Sebelum menulis kode App Router/Route Handler/Server Action, **WAJIB** baca `admin_web/node_modules/next/dist/docs/` terlebih dahulu.

### B. Mobile Tamu (`tamu_mobile/`)
| Layer | Library Wajib |
|---|---|
| Framework | Flutter SDK (Dart) |
| State Management | `flutter_riverpod` |
| HTTP Client | `dio` (dengan interceptor JWT) |
| Pengambil Foto | `image_picker` |
| Lokalisasi | `intl` (format Rupiah & kalender ID) |

### C. Infrastruktur Deployment
| Komponen | Fungsi |
|---|---|
| **Nginx** | Reverse proxy + load balancer di depan server Next.js, sesuai laporan TA bab Arsitektur Model. |
| **PostgreSQL** | Database utama (lokal dev + production). |
| **Postman** | Tools developer untuk uji API (tidak masuk dependency project). |
| **Git** | Version control. |

---

## 2. ATURAN UI/UX (WEB ADMIN)

### Palet Warna (Final, dilarang tambah warna baru)
- Primary: **Dark Navy Blue `#1E3A8A`**
- Background utama: **Light Gray `#F9FAFB`**
- Card: **Putih `#FFFFFF`**
- Semantik:
  - Hijau `#10B981` → pemasukan / tersedia
  - Merah `#EF4444` → pengeluaran / terisi / tombol tolak
  - Biru terang `#3B82F6` → metrik laba bersih

### Sidebar (WCAG Compliant)
- Background: `#1E3A8A` solid.
- Teks menu: **Putih solid `#FFFFFF`** (dilarang abu-abu redup, termasuk untuk menu tidak aktif).
- Bahasa: **Indonesia seutuhnya** → `Dasbor`, `Pemesanan`, `Unit`, `Keuangan`, `Pengaturan`.

### Layout Halaman
| Halaman | Aturan |
|---|---|
| Login | Split-screen 50/50 — kiri foto pantai Pangandaran, kanan form putih dengan logo di tengah atas. |
| Dasbor | Atas: 3 Summary Card (Pemasukan/Pengeluaran/Laba Bersih) + aksen garis vertikal warna semantik. Tengah: grafik "Tren Laba Bersih". Bawah: tabel "Verifikasi Pembayaran" (tombol Setujui biru gelap, Tolak outline merah). |
| Manajemen Unit | Header dengan tombol "+ Tambah Unit Baru". Konten: list vertikal kartu unit (foto, kapasitas, harga, badge status, tombol Edit/Hapus). |
| Form Tambah Unit | Dua card: kiri "Informasi Dasar" (form teks), kanan "Foto Unit" (drag & drop zone dashed border, ikon awan). |
| Pemesanan (Kalender) | Grid kalender bulanan tradisional **7x5**. Kiri: panel filter tipe unit + legenda. Kanan: kalender penuh dengan pita horizontal hijau (Tersedia) / merah (Terisi) + tooltip hover detail pemesan. **DILARANG pakai timeline/gantt horizontal.** |
| Keuangan | Atas: form "Catat Pengeluaran Baru" (Date Picker, angka, dropdown Kategori, textarea Deskripsi). Bawah: tabel "Riwayat Pengeluaran". |

### Komponen
- **Wajib** pakai komponen Shadcn UI untuk semua form, tombol, tabel, dialog. Dilarang custom dari nol kalau Shadcn sudah menyediakan.
- Dilarang teks dummy (lorem ipsum). Pakai bahasa Indonesia kontekstual homestay.

---

## 3. ATURAN DATABASE & SKEMA PRISMA

### Naming
- **WAJIB** snake_case untuk field: `id_unit`, `id_user`, `id_reservasi`, `tgl_checkin`, dst.
- **DILARANG** pakai camelCase seperti `userId`, `unitId`.
- Tabel pengeluaran: `OperationalCost` dengan field `kategori_pengeluaran` (string).

### Tipe Data Kunci
| Field | Tipe | Catatan |
|---|---|---|
| `id_user`, `id_unit`, `id_reservasi`, `id_biaya` | `Char(10)` | **Wajib** divalidasi `zod.string().max(10)` di form FE. Format: `USR-000001`, `UNT-000001`, `RES-000001`, `BIY-000001`. |
| `total_tagihan`, `total_pengeluaran` | `Int` | Cukup untuk angka rupiah homestay (max ~2.1 milyar). Sesuai laporan TA. |
| `tgl_checkin`, `tgl_checkout`, `tanggal_pencatatan` | `@db.Date` | |
| `created_at` | `@db.Timestamp` default `now()` | |
| `role` | `admin` / `tamu` | Enum 2 nilai (sesuai laporan TA). |
| `kategori` (Unit) | `Rumah Utama` / `Kamar Luar` | Enum 2 nilai (sesuai laporan TA). |
| `status_unit` | `Tersedia` / `Terisi` / `Perawatan` | |
| `status_pesanan` | `Menunggu Pembayaran` / `Menunggu Konfirmasi` / `Selesai` / `Batal` | Kanonik untuk seluruh sistem (web + mobile). |
| `kategori_pengeluaran` | `Utilitas` / `Pemeliharaan` / `Konsumsi` | Dropdown wajib. |
| `deskripsi_pengeluaran` | `VarChar(100)` | Nama field final di OperationalCost (BUKAN `keterangan_periode`). |
| `bukti_bayar`, `foto_unit` | `String?` (nullable) | Boleh kosong saat draft, validasi "wajib" dilakukan di form upload, bukan di skema DB. |

### Penamaan Tabel di DB
Wajib pakai `@@map` agar nama tabel di PostgreSQL snake_case lowercase:
- `User` → `@@map("users")`
- `Unit` → `@@map("units")`
- `Reservation` → `@@map("reservations")`
- `OperationalCost` → `@@map("operational_costs")`

### Index Performa
- `Reservation` **wajib** punya `@@index([tgl_checkin, tgl_checkout])` untuk overlap detection.

### Larangan
- Dilarang mengarang nama field/tabel di luar `schema.prisma`.
- Dilarang akses DB langsung dari `tamu_mobile`. Selalu lewat API di `admin_web`.

---

## 4. ATURAN LOGIKA BISNIS

### Overlap Detection (Anti Double Booking)
Algoritma First Come First Served (FCFS). Reservasi baru **DITOLAK** apabila:
```
(NewCheckIn < OldCheckOut) AND (NewCheckOut > OldCheckIn)
```
Berlaku terhadap reservasi dengan `status_pesanan` = `Menunggu Konfirmasi` ATAU `Selesai`.

### Laba Bersih (Real-time)
```
Laba Bersih = Σ(total_tagihan WHERE status_pesanan = 'Selesai')
            − Σ(total_pengeluaran)
```
Hitung di server (API), bukan di client.

### Form Fasilitas
- **WAJIB** pakai grid Checkbox + Tags Input.
- Sebelum simpan ke Prisma: `array.join(', ')` jadi string tunggal.
- **DILARANG** textarea bebas.

### Soft Lock (Validasi Pembayaran Manual)
Alur kunci jadwal sesuai laporan TA bab "Kebutuhan Proses":
1. Tamu unggah bukti bayar → status pesanan otomatis berubah jadi `Menunggu Konfirmasi`.
2. Pemilik buka tabel "Verifikasi Pembayaran" di Dasbor → klik **Setujui** atau **Tolak**.
3. Jika **Setujui** → status pesanan jadi `Selesai`, status unit terkait jadi `Terisi` (event-driven trigger di backend).
4. Jika **Tolak** → status pesanan jadi `Batal`, slot tanggal kembali tersedia untuk reservasi lain.
- Soft Lock = persetujuan manual oleh pemilik, BUKAN otomatis. Sistem hanya menjalankan eksekusi setelah pemilik menekan tombol.
- Setelah `Selesai`, status pesanan TIDAK bisa di-rollback (kecuali via aksi admin eksplisit, di luar scope MVP).

---

## 5. ATURAN FORM & VALIDASI

- Setiap form `react-hook-form` **wajib** punya schema `zod`.
- Field `id_unit`/`id_user`/`id_reservasi` wajib `.max(10)` di zod.
- Field `kategori_pengeluaran` wajib `z.enum(['Utilitas','Pemeliharaan','Konsumsi'])`.
- Validasi sisi client **TIDAK MENGGANTIKAN** validasi server. API route juga harus revalidate.

---

## 6. WORKFLOW GIT

1. **Setiap fitur/halaman = branch baru.** Contoh: `feature/dasbor`, `feature/login`, `fix/overlap-detection`.
2. **DILARANG commit/merge langsung ke `main`** tanpa review user.
3. Setelah fitur selesai → push branch → tunggu user cek → baru merge ke `main`.
4. Pakai atomic commits (1 commit = 1 perubahan logis), pesan commit bahasa Indonesia.
5. Dilarang `git push --force` ke `main`/`master`.
6. Dilarang `--no-verify` saat commit kecuali user minta.

---

## 7. LARANGAN PENGINSTALAN

- **DILARANG** `npm install`, `pnpm add`, `flutter pub add`, atau `npx shadcn add ...` tanpa **MINTA IZIN** user terlebih dahulu.
- Kalau butuh library baru: jelaskan **kenapa**, **rekomendasi pilihan**, dan **tradeoff**-nya. Tunggu user konfirmasi.
- Update versi paket existing juga butuh izin (bisa ada breaking change).

---

## 8. WORKFLOW SETIAP SESI

### Sebelum mulai
- Baca AGENTS.md (file ini).
- Untuk Next.js: baca `admin_web/node_modules/next/dist/docs/` di area yang relevan.
- Konfirmasi ke user kalau ada ambiguitas requirement — **JANGAN** menebak.

### Selesai mengerjakan
**WAJIB** beri ringkasan akhir berupa **TODO LIST langkah berikutnya** agar user tahu next step. Format:

```
✅ SUDAH SELESAI:
- [yang baru dikerjakan, file/branch yang diubah]

📋 NEXT STEP (saran):
- [ ] Langkah berikutnya 1
- [ ] Langkah berikutnya 2
- [ ] ...
```

---

## 9. RINGKASAN LARANGAN GLOBAL

- ❌ Bahasa Inggris di UI (semua copy harus Indonesia)
- ❌ Warna di luar palet yang sudah ditetapkan
- ❌ camelCase pada nama field DB
- ❌ Kalender model timeline/gantt (wajib grid 7x5)
- ❌ Textarea bebas untuk fasilitas (wajib checkbox)
- ❌ Install library tanpa izin user
- ❌ Commit/merge langsung ke `main`
- ❌ Lorem ipsum / teks dummy
- ❌ Mengarang field/tabel di luar `schema.prisma`
- ❌ Akses DB langsung dari mobile
