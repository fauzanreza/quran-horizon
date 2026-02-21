# 📱 Quran Horizon - PWA Offline Guide

## ✅ Fitur Offline yang Tersedia

### 1. **Service Worker Aktif**
- ✅ Otomatis terdaftar saat aplikasi dibuka
- ✅ Cache semua request secara otomatis
- ✅ Fallback ke cache saat offline

### 2. **Data yang Bisa Offline**
- ✅ **Halaman Utama** - Daftar 114 surah
- ✅ **Halaman Surah** - Detail surah dengan ayat-ayat (setelah dibuka sekali)
- ✅ **Halaman Mushaf** - Gambar halaman mushaf (setelah di-download)
- ✅ **Teks Arab & Terjemahan** - Semua 114 surah (setelah di-download)
- ✅ **Font & Assets** - Amiri, LPMQ, Outfit fonts
- ✅ **Tema & Pengaturan** - Tersimpan di localStorage

## 🚀 Cara Menggunakan Offline

### Langkah 1: Install PWA
1. Buka aplikasi di browser (Chrome/Edge/Safari)
2. Klik menu browser → "Install app" atau "Add to Home Screen"
3. Icon akan muncul di home screen HP/Desktop

### Langkah 2: Download Resource
1. Buka aplikasi
2. Klik tombol **"Pengaturan"** (⚙️)
3. Scroll ke bawah ke bagian **"Offline Data"**
4. Klik **"Unduh Sekarang"** untuk:
   - **Teks & Terjemahan** (~10 MB) - Semua 114 surah
   - **Mushaf Madinah** (~200 MB) - 604 halaman gambar

### Langkah 3: Gunakan Offline
1. Matikan koneksi internet
2. Buka aplikasi PWA
3. Semua surah yang sudah di-download akan bisa dibuka!

## 📊 Status Download

### Indikator Status:
- **"Unduh Sekarang"** - Belum di-download
- **Progress bar** - Sedang download
- **"Downloaded" ✓** - Sudah tersimpan
- **Tombol 🗑️** - Hapus cache

## 🔧 Troubleshooting

### Aplikasi Tidak Bisa Offline?
1. **Pastikan sudah download resource** di menu Pengaturan
2. **Buka halaman sekali** saat online (akan otomatis ter-cache)
3. **Clear cache browser** lalu download ulang
4. **Reinstall PWA** - Uninstall dan install ulang

### Download Gagal "Failed to Fetch"?
1. **Pastikan koneksi internet stabil**
2. **Gunakan Wi-Fi** untuk download Mushaf (200MB)
3. **Coba lagi** - Klik tombol download ulang
4. **Check console** - Buka DevTools untuk lihat error detail

### Icon Tidak Muncul?
1. **Hard refresh** - Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
2. **Clear cache** browser
3. **Reinstall PWA**

## 💾 Cara Kerja Cache

### Strategi Caching:
1. **Cache-First** (Mushaf Images)
   - Cek cache dulu, baru network
   - Cocok untuk gambar yang jarang berubah

2. **Stale-While-Revalidate** (API Data)
   - Tampilkan cache dulu
   - Update di background jika ada koneksi
   - Cocok untuk data yang bisa sedikit outdated

3. **Network-First** (Halaman App)
   - Coba network dulu
   - Fallback ke cache jika offline

## 🗑️ Menghapus Cache

### Dari Aplikasi:
1. Buka **Pengaturan**
2. Scroll ke **"Offline Data"**
3. Klik tombol **🗑️** di samping "Downloaded"
4. Konfirmasi penghapusan

### Manual (Browser):
1. Buka DevTools (F12)
2. Tab **Application** → **Storage**
3. Klik **"Clear site data"**

## 📱 Testing Offline Mode

### Development:
1. Buka DevTools (F12)
2. Tab **Network**
3. Centang **"Offline"**
4. Refresh halaman
5. Aplikasi harus tetap bisa dibuka!

### Production:
1. Build: `npm run build`
2. Start: `npm start`
3. Buka di browser
4. Download resource
5. Matikan WiFi/Data
6. Test buka aplikasi

## ✨ Fitur Tambahan

### Sinkronisasi Otomatis:
- Service Worker check update setiap 1 menit
- Auto-update cache saat ada koneksi
- Tidak perlu manual refresh

### Persistent Settings:
- Tema (Light/Dark) tersimpan
- Font size tersimpan
- Visibility toggles tersimpan
- Tetap ada meski offline

## 🎯 Best Practices

1. **Download saat WiFi** - Hemat kuota data
2. **Download bertahap** - Surah dulu, baru Mushaf
3. **Check storage** - Pastikan HP punya ruang cukup
4. **Update berkala** - Buka online sesekali untuk update

## 📞 Support

Jika ada masalah:
1. Check console browser (F12)
2. Lihat error message
3. Coba clear cache dan download ulang
4. Reinstall PWA jika perlu

---

**Selamat Membaca Al-Quran! 📖✨**
