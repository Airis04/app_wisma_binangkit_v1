# Dokumentasi Koneksi Mobile ke Backend

Dokumen ini menjelaskan cara menjalankan aplikasi `tamu_mobile` agar bisa terhubung ke backend `admin_web` saat testing.

Backend API mobile berada di:

```text
http://<alamat-server>:3000/api
```

Ada dua cara utama:

- Lewat USB dengan `adb reverse`.
- Lewat WiFi yang sama.

## 1. Jalankan Backend Admin

Selalu jalankan backend terlebih dahulu:

```bash
cd ~/app_wisma_binangkit/admin_web
npm run dev:lan
```

Pastikan server berjalan di port `3000`.

Cek port:

```bash
ss -ltnp | grep ':3000'
```

Jika berhasil, biasanya terlihat server listen di:

```text
0.0.0.0:3000
```

## 2. Cara 1: Koneksi Lewat USB

Cara ini paling stabil untuk device fisik Android.

### 2.1 Cek Device

```bash
flutter devices
```

Pastikan device muncul, contoh:

```text
SM A075F (mobile) • R9RYB01GAKT • android-arm64
```

Jika muncul `not authorized`, cek HP dan tekan izinkan USB debugging.

### 2.2 Aktifkan ADB Reverse

```bash
adb reverse tcp:3000 tcp:3000
```

Cek apakah sudah aktif:

```bash
adb reverse --list
```

Jika berhasil, akan muncul mapping port `3000`.

### 2.3 Jalankan Mobile

```bash
cd ~/app_wisma_binangkit/tamu_mobile
flutter run -d R9RYB01GAKT --dart-define=API_BASE_URL=http://127.0.0.1:3000/api
```

Kenapa pakai `127.0.0.1`?

- Di HP, `127.0.0.1` berarti HP sendiri.
- Dengan `adb reverse`, port `127.0.0.1:3000` di HP diarahkan ke port `3000` laptop.

### 2.4 Jika Timeout

Jika muncul:

```text
Koneksi ke server timeout. Coba lagi.
```

Ulangi:

```bash
adb reverse tcp:3000 tcp:3000
```

Lalu jalankan ulang aplikasi.

`adb reverse` bisa hilang jika:

- HP dicabut.
- USB debugging reconnect.
- Laptop restart.
- ADB restart.
- Device berubah authorization.

## 3. Cara 2: Koneksi Lewat WiFi yang Sama

Cara ini dipakai jika HP dan laptop berada di jaringan WiFi yang sama.

### 3.1 Cari IP Laptop

Di laptop:

```bash
hostname -I
```

Contoh hasil:

```text
172.18.0.1 172.17.0.1 10.107.123.65
```

Gunakan IP jaringan WiFi/LAN yang bisa diakses HP. Biasanya bukan `172.17.x.x` atau `172.18.x.x` karena itu sering milik Docker.

Contoh IP yang dipakai:

```text
10.107.123.65
```

### 3.2 Tes dari Browser HP

Buka browser di HP:

```text
http://10.107.123.65:3000
```

Jika halaman admin/web bisa terbuka, berarti HP bisa menjangkau laptop.

Jika tidak bisa terbuka:

- Pastikan laptop dan HP ada di WiFi yang sama.
- Pastikan backend berjalan dengan `npm run dev:lan`.
- Pastikan firewall tidak memblokir port `3000`.
- Coba IP lain dari hasil `hostname -I`.

### 3.3 Jalankan Mobile dengan IP WiFi

```bash
cd ~/app_wisma_binangkit/tamu_mobile
flutter run -d R9RYB01GAKT --dart-define=API_BASE_URL=http://10.107.123.65:3000/api
```

Ganti `10.107.123.65` sesuai IP laptop.

## 4. Perbedaan USB dan WiFi

| Cara | API_BASE_URL | Kelebihan | Catatan |
|---|---|---|---|
| USB `adb reverse` | `http://127.0.0.1:3000/api` | Stabil dan cepat untuk dev | Harus ulang `adb reverse` jika device reconnect |
| WiFi sama | `http://IP_LAPTOP:3000/api` | Bisa tanpa kabel | HP harus bisa akses IP laptop |

## 5. Emulator Android

Jika memakai emulator Android, gunakan:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

`10.0.2.2` adalah alias localhost laptop dari emulator Android.

## 6. Browser/Desktop Flutter

Jika menjalankan Flutter di Chrome atau Linux desktop:

```bash
flutter run -d chrome --dart-define=API_BASE_URL=http://127.0.0.1:3000/api
```

atau:

```bash
flutter run -d linux --dart-define=API_BASE_URL=http://127.0.0.1:3000/api
```

## 7. Checklist Saat Timeout

Jika mobile menampilkan timeout:

- [ ] Backend `admin_web` sudah jalan.
- [ ] Port `3000` aktif.
- [ ] Untuk USB, `adb reverse tcp:3000 tcp:3000` sudah dijalankan.
- [ ] Untuk USB, jalankan mobile dengan `http://127.0.0.1:3000/api`.
- [ ] Untuk WiFi, HP bisa membuka `http://IP_LAPTOP:3000` dari browser.
- [ ] `API_BASE_URL` tidak salah.
- [ ] HP dan laptop berada di jaringan yang sama jika memakai WiFi.
- [ ] Firewall tidak memblokir port `3000`.

## 8. Command Cepat

### USB

```bash
cd ~/app_wisma_binangkit/admin_web
npm run dev:lan
```

Terminal lain:

```bash
adb reverse tcp:3000 tcp:3000
cd ~/app_wisma_binangkit/tamu_mobile
flutter run -d R9RYB01GAKT --dart-define=API_BASE_URL=http://127.0.0.1:3000/api
```

### WiFi

```bash
cd ~/app_wisma_binangkit/admin_web
npm run dev:lan
```

Terminal lain:

```bash
hostname -I
cd ~/app_wisma_binangkit/tamu_mobile
flutter run -d R9RYB01GAKT --dart-define=API_BASE_URL=http://IP_LAPTOP:3000/api
```

Ganti `IP_LAPTOP` dengan IP laptop yang bisa diakses HP.
