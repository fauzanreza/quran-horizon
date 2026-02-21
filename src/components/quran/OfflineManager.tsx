"use client";

import { useState, useEffect } from "react";

export default function OfflineManager() {
  const [downloadingSurah, setDownloadingSurah] = useState(false);
  const [surahProgress, setSurahProgress] = useState(0);
  const [downloadingMushaf, setDownloadingMushaf] = useState(false);
  const [mushafProgress, setMushafProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [surahDownloaded, setSurahDownloaded] = useState(false);
  const [mushafDownloaded, setMushafDownloaded] = useState(false);

  useEffect(() => {
    // Check if resources were previously downloaded
    if (typeof window !== 'undefined') {
      setSurahDownloaded(localStorage.getItem('surah-downloaded') === 'true');
      setMushafDownloaded(localStorage.getItem('mushaf-downloaded') === 'true');
    }
  }, []);

  const downloadAllSurahs = async () => {
    if (downloadingSurah || surahDownloaded) return;
    setDownloadingSurah(true);
    setSurahProgress(0);
    setError(null);

    try {
      // 1. Fetch List
      const listResponse = await fetch("https://equran.id/api/v2/surat");
      if (!listResponse.ok) throw new Error("Gagal mengambil daftar surah");
      
      // Open cache for pre-caching pages
      const cache = await caches.open('quran-runtime-v3');
      
      // 2. Fetch Details for all 114 Surahs
      for (let i = 1; i <= 114; i++) {
        try {
          // Fetch EQuran Data (Indonesian Text & Translation)
          const equranResponse = await fetch(`https://equran.id/api/v2/surat/${i}`);
          if (equranResponse.ok) {
            const data = await equranResponse.json();
            // Cache the response
            await cache.put(`https://equran.id/api/v2/surat/${i}`, new Response(JSON.stringify(data), {
              headers: { 'Content-Type': 'application/json' }
            }));
          }
          
          // Also fetch Quran.com data for Madinah script
          try {
            const chapterResponse = await fetch(`https://api.quran.com/api/v4/chapters/${i}`);
            if (chapterResponse.ok) {
              const chapterData = await chapterResponse.json();
              await cache.put(`https://api.quran.com/api/v4/chapters/${i}`, new Response(JSON.stringify(chapterData), {
                headers: { 'Content-Type': 'application/json' }
              }));
            }
            
            const versesResponse = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${i}?language=id&words=false&translations=33&fields=text_uthmani,text_indopak`);
            if (versesResponse.ok) {
              const versesData = await versesResponse.json();
              await cache.put(`https://api.quran.com/api/v4/verses/by_chapter/${i}?language=id&words=false&translations=33&fields=text_uthmani,text_indopak`, new Response(JSON.stringify(versesData), {
                headers: { 'Content-Type': 'application/json' }
              }));
            }
          } catch (e) {
            console.warn(`Quran.com API failed for surah ${i}`, e);
            // Continue even if Quran.com fails
          }
          
          // Pre-cache the surah page itself
          try {
            const pageResponse = await fetch(`/surah/${i}`);
            if (pageResponse.ok) {
              await cache.put(`/surah/${i}`, pageResponse.clone());
            }
          } catch (e) {
            console.warn(`Failed to cache page for surah ${i}`, e);
          }
          
          setSurahProgress(Math.round((i / 114) * 100));
        } catch (e) {
          console.error(`Failed to cache surah ${i}`, e);
          // Continue anyway
        }
      }
      
      localStorage.setItem('surah-downloaded', 'true');
      setSurahDownloaded(true);
    } catch (err) {
      console.error("Download error:", err);
      setError("Gagal mengunduh data surah. Pastikan Anda terhubung ke internet dan coba lagi.");
    } finally {
      setDownloadingSurah(false);
    }
  };

  const downloadMushafImages = async () => {
    if (downloadingMushaf || mushafDownloaded) return;
    if (!confirm("Unduh Mushaf Lengkap (604 Halaman)?\n\nIni akan menggunakan sekitar 150-200MB data. Pastikan Anda menggunakan Wi-Fi.")) {
      return;
    }

    setDownloadingMushaf(true);
    setMushafProgress(0);
    setError(null);

    const totalPages = 604;
    const batchSize = 5; // Download 5 images at a time

    try {
      for (let i = 1; i <= totalPages; i += batchSize) {
        const promises = [];
        for (let j = 0; j < batchSize && i + j <= totalPages; j++) {
          const page = i + j;
          const pageStr = page.toString().padStart(3, '0');
          const url = `https://android.quran.com/data/width_1260/page${pageStr}.png`;
          promises.push(
            fetch(url).then(res => {
              if (!res.ok) throw new Error(`Failed to fetch page ${page}`);
              return res.blob(); // Consume response
            }).catch(e => {
              console.warn(`Failed to cache page ${page}`, e);
              return null;
            })
          );
        }
        
        await Promise.all(promises);
        setMushafProgress(Math.round((Math.min(i + batchSize - 1, totalPages) / totalPages) * 100));
      }
      
      localStorage.setItem('mushaf-downloaded', 'true');
      setMushafDownloaded(true);
    } catch (err) {
      console.error("Mushaf download error:", err);
      setError("Gagal mengunduh gambar Mushaf. Pastikan Anda terhubung ke internet dan coba lagi.");
    } finally {
      setDownloadingMushaf(false);
    }
  };

  const clearSurahCache = async () => {
    if (!confirm("Hapus semua data surah yang tersimpan?")) return;
    
    try {
      // Clear from localStorage
      localStorage.removeItem('surah-downloaded');
      setSurahDownloaded(false);
      
      // Clear from cache storage
      if ('caches' in window) {
        const cache = await caches.open('quran-runtime-v3');
        const keys = await cache.keys();
        for (const request of keys) {
          if (request.url.includes('equran.id') || request.url.includes('api.quran.com')) {
            await cache.delete(request);
          }
        }
      }
      
      alert("Data surah berhasil dihapus!");
    } catch (err) {
      console.error("Clear cache error:", err);
      alert("Gagal menghapus cache. Coba refresh halaman.");
    }
  };

  const clearMushafCache = async () => {
    if (!confirm("Hapus semua gambar Mushaf yang tersimpan (~200MB)?")) return;
    
    try {
      // Clear from localStorage
      localStorage.removeItem('mushaf-downloaded');
      setMushafDownloaded(false);
      
      // Clear from cache storage
      if ('caches' in window) {
        const cache = await caches.open('quran-runtime-v3');
        const keys = await cache.keys();
        for (const request of keys) {
          if (request.url.includes('android.quran.com')) {
            await cache.delete(request);
          }
        }
      }
      
      alert("Gambar Mushaf berhasil dihapus!");
    } catch (err) {
      console.error("Clear cache error:", err);
      alert("Gagal menghapus cache. Coba refresh halaman.");
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-gold-premium/10">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
        Offline Data
      </h3>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl font-bold">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Surah Data Downloader */}
        <div className="bg-emerald-900/5 dark:bg-white/5 p-4 rounded-2xl border border-transparent hover:border-gold-premium/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-deep dark:text-emerald-300">Teks & Terjemahan (114 Surah)</span>
            <span className="text-[10px] font-extrabold text-gold-600 dark:text-gold-400">~ 10 MB</span>
          </div>
          
          {surahDownloaded ? (
            <div className="flex items-center justify-between gap-2 py-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-bold">Downloaded</span>
              </div>
              <button
                onClick={clearSurahCache}
                className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                title="Hapus data surah"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ) : downloadingSurah ? (
            <div className="space-y-2">
              <div className="h-2 w-full bg-emerald-900/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${surahProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-right text-emerald-deep/60 dark:text-emerald-400 font-bold">
                {surahProgress}%
              </p>
            </div>
          ) : (
            <button
              onClick={downloadAllSurahs}
              className="w-full py-2 bg-emerald-deep/10 dark:bg-emerald-400/10 text-emerald-deep dark:text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-deep/20 dark:hover:bg-emerald-400/20 transition-colors"
            >
              Unduh Sekarang
            </button>
          )}
        </div>

        {/* Mushaf Images Downloader */}
        <div className="bg-emerald-900/5 dark:bg-white/5 p-4 rounded-2xl border border-transparent hover:border-gold-premium/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-deep dark:text-emerald-300">Mushaf Madinah (604 Hal)</span>
            <span className="text-[10px] font-extrabold text-gold-600 dark:text-gold-400">~ 200 MB</span>
          </div>

          {mushafDownloaded ? (
            <div className="flex items-center justify-between gap-2 py-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-bold">Downloaded</span>
              </div>
              <button
                onClick={clearMushafCache}
                className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                title="Hapus gambar Mushaf"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ) : downloadingMushaf ? (
            <div className="space-y-2">
              <div className="h-2 w-full bg-emerald-900/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold-premium transition-all duration-300"
                  style={{ width: `${mushafProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-right text-emerald-deep/60 dark:text-emerald-400 font-bold">
                {mushafProgress}%
              </p>
            </div>
          ) : (
            <button
              onClick={downloadMushafImages}
              className="w-full py-2 bg-gold-premium/10 dark:bg-gold-400/10 text-gold-700 dark:text-gold-400 text-xs font-bold rounded-xl hover:bg-gold-premium/20 dark:hover:bg-gold-400/20 transition-colors"
            >
              Unduh Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
