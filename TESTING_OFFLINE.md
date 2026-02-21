# 🔧 Testing Offline Mode - Step by Step

## ⚠️ PENTING: Masalah yang Diperbaiki

**Masalah:** Halaman surah tidak bisa dibuka saat offline, redirect ke home.

**Penyebab:** 
1. Service Worker tidak meng-cache API response dengan benar
2. Tidak ada error handling saat fetch gagal
3. Cache version lama masih aktif

**Solusi:**
1. ✅ Update Service Worker dengan caching logic yang lebih baik
2. ✅ Tambah error handling di halaman surah
3. ✅ Update cache version ke v2
4. ✅ Tambah loading state dan error message yang jelas

---

## 📋 Langkah Testing (WAJIB IKUTI URUTAN!)

### Step 1: Clear Old Cache
```
1. Buka DevTools (F12)
2. Tab "Application" → "Storage"
3. Klik "Clear site data"
4. Refresh halaman (Ctrl+R)
```

### Step 2: Unregister Old Service Worker
```
1. DevTools → Tab "Application" → "Service Workers"
2. Klik "Unregister" pada service worker lama
3. Refresh halaman
4. Service worker baru akan otomatis register
```

### Step 3: Download Data (ONLINE)
```
1. Pastikan internet AKTIF
2. Buka aplikasi
3. Klik "Pengaturan" ⚙️
4. Scroll ke "Offline Data"
5. Klik "Unduh Sekarang" untuk "Teks & Terjemahan"
6. Tunggu sampai muncul "Downloaded ✓"
```

### Step 4: Test Buka Surah (ONLINE)
```
1. Masih dalam kondisi ONLINE
2. Klik salah satu surah dari list (misal: Al-Fatihah)
3. Halaman surah harus terbuka dengan sempurna
4. Buka 2-3 surah lainnya juga
5. Ini penting untuk memastikan data ter-cache!
```

### Step 5: Check Cache (Verifikasi)
```
1. DevTools → "Application" → "Cache Storage"
2. Expand "quran-runtime-v2"
3. Harus ada entries untuk:
   - https://equran.id/api/v2/surat
   - https://equran.id/api/v2/surat/1
   - https://equran.id/api/v2/surat/2
   - https://api.quran.com/api/v4/chapters/...
   - https://api.quran.com/api/v4/verses/...
```

### Step 6: Test Offline Mode
```
1. DevTools → Tab "Network"
2. Centang "Offline" checkbox
3. Refresh halaman (Ctrl+R)
4. Home page harus tetap muncul
5. Klik surah yang SUDAH PERNAH dibuka tadi
6. Halaman surah HARUS TERBUKA! ✅
```

### Step 7: Test Surah Belum Di-cache
```
1. Masih dalam mode "Offline"
2. Klik surah yang BELUM PERNAH dibuka
3. Harus muncul error message:
   "Gagal memuat surah. Pastikan Anda sudah mengunduh..."
4. Ada tombol "Kembali ke Beranda" dan "Coba Lagi"
5. Ini NORMAL dan EXPECTED! ✅
```

---

## ✅ Expected Behavior

### Skenario 1: Surah Sudah Di-cache
```
ONLINE → Buka Surah 1 → OK
OFFLINE → Buka Surah 1 → OK ✅
```

### Skenario 2: Surah Belum Di-cache
```
OFFLINE → Buka Surah 99 (belum pernah dibuka) → Error Message ✅
Error: "Gagal memuat surah. Pastikan Anda sudah mengunduh..."
```

### Skenario 3: Setelah Download Semua
```
ONLINE → Download "Teks & Terjemahan" → Wait
ONLINE → Buka beberapa surah → OK
OFFLINE → Buka surah manapun → OK ✅
```

---

## 🐛 Troubleshooting

### Masalah: Service Worker Tidak Update
**Solusi:**
```
1. Hard refresh: Ctrl+Shift+R
2. DevTools → Application → Service Workers → Unregister
3. Close semua tab aplikasi
4. Buka lagi
```

### Masalah: Cache Tidak Tersimpan
**Solusi:**
```
1. Check browser storage quota
2. Clear old cache (v1)
3. Download ulang data
4. Check console untuk error
```

### Masalah: Surah Tetap Tidak Bisa Dibuka Offline
**Solusi:**
```
1. Pastikan sudah buka surah tersebut SAAT ONLINE
2. Check cache di DevTools
3. Pastikan Service Worker v2 aktif
4. Coba surah lain yang sudah pernah dibuka
```

### Masalah: Download Stuck/Gagal
**Solusi:**
```
1. Check koneksi internet
2. Buka console untuk lihat error
3. Refresh halaman
4. Coba download ulang
```

---

## 📊 How It Works

### Cache Strategy:
```
1. User download "Teks & Terjemahan"
   → Fetch all 114 surah dari API
   → Service Worker cache semua response

2. User buka surah saat online
   → Fetch dari API
   → Service Worker cache response
   → Tampilkan ke user

3. User buka surah saat offline
   → Service Worker cek cache
   → Jika ada: Return dari cache ✅
   → Jika tidak ada: Throw error → Show error message
```

### Why Need to Open Surah First?
```
- Next.js menggunakan dynamic routes
- Data di-fetch saat component mount
- Service Worker hanya bisa cache request yang pernah terjadi
- Solusi: Download semua data dulu, ATAU buka surah saat online
```

---

## 🎯 Production Deployment

### Before Deploy:
```
1. Build production: npm run build
2. Test dengan production server: npm start
3. Test offline mode di production
4. Pastikan Service Worker registered
5. Test di berbagai browser
```

### After Deploy:
```
1. Clear browser cache
2. Install PWA fresh
3. Download data
4. Test offline
5. Monitor console untuk error
```

---

## 📝 Notes

- ✅ Service Worker v2 sudah include better error handling
- ✅ Error message lebih informatif
- ✅ Loading state ditambahkan
- ✅ Cache strategy improved
- ⚠️ User HARUS download data atau buka surah saat online dulu
- ⚠️ Tidak semua surah otomatis ter-cache (by design)

---

**Happy Testing! 🚀**
