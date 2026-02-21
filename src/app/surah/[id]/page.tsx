"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { getSurahDetailFull, Ayat, SurahDetail } from "@/services/quran";
import ExportPDFButton from "@/components/quran/ExportPDFButton";
import PersonalizationPanel from "@/components/quran/PersonalizationPanel";
import BismillahHeader from "@/components/quran/BismillahHeader";
import { useSettings } from "@/lib/SettingsContext";

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchAyat, setSearchAyat] = useState("");
  const { 
    translation, script, 
    fontSizeArabic, fontSizeLatin, fontSizeTranslation,
    showArabic, showLatin, showTranslation 
  } = useSettings();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSearchAyat("");
    getSurahDetailFull(parseInt(id), translation, script)
      .then((data) => {
        setSurah(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load surah:", err);
        setError("Gagal memuat surah. Pastikan Anda sudah mengunduh data surah di menu Pengaturan atau terhubung ke internet.");
        setLoading(false);
      });
  }, [id, translation, script]);

  const filteredAyat = surah?.ayat.filter((ayat) => {
    const q = searchAyat.trim().toLowerCase();
    if (!q) return true;
    return (
      ayat.nomorAyat.toString() === q ||
      (ayat.teksArab && ayat.teksArab.includes(searchAyat.trim())) ||
      (ayat.teksLatin && ayat.teksLatin.toLowerCase().includes(q)) ||
      (ayat.teksIndonesia && ayat.teksIndonesia.toLowerCase().includes(q)) ||
      (ayat.teksEnglish && ayat.teksEnglish.toLowerCase().includes(q))
    );
  }) ?? [];

  const scrollToAyat = useCallback((ayatNo: number) => {
    const el = document.getElementById(`ayat-${ayatNo}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ayat-highlight");
      setTimeout(() => el.classList.remove("ayat-highlight"), 1800);
    }
  }, []);

  // Handle #ayat-N hash in URL (e.g. when navigating from QuranNavigator on another page)
  useEffect(() => {
    if (!surah || loading) return;
    const hash = window.location.hash; // e.g. "#ayat-5"
    if (hash.startsWith("#ayat-")) {
      const ayatNo = parseInt(hash.replace("#ayat-", ""), 10);
      if (!isNaN(ayatNo)) {
        // Give DOM time to render before scrolling
        setTimeout(() => scrollToAyat(ayatNo), 400);
      }
    }
  }, [surah, loading, scrollToAyat]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mb-4"></div>
          <p className="text-emerald-deep dark:text-emerald-400 font-bold">Memuat surah...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl">📡</div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Tidak Dapat Memuat Surah</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-emerald-deep dark:bg-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Kembali ke Beranda
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!surah) return <div className="p-20 text-center font-bold text-gold-600">Surah Not Found</div>;

  return (
    <div className="min-h-screen">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none islamic-ornament z-0 opacity-[0.03]"></div>

      <header className="sticky top-0 z-40 premium-header">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm font-extrabold text-emerald-deep dark:text-emerald-400 hover:text-gold-600 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-deep/5 dark:bg-white/10 group-hover:bg-gold-premium/10 group-hover:rotate-[-10deg] transition-all duration-300">
                <span className="text-xl">←</span>
              </div>
            </Link>

            <div className="text-center flex-1 min-w-0">
              <h1 className="text-lg font-black text-zinc-900 dark:text-white sm:text-2xl tracking-tighter truncate leading-tight">
                {surah ? surah.namaLatin.toUpperCase() : "..."}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gold-600 dark:text-gold-400 font-black truncate">
                  {surah?.arti} • {surah?.jumlahAyat} Verses
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {surah && <ExportPDFButton surah={surah} />}
              <PersonalizationPanel />
            </div>
          </div>
        </div>
      </header>

      {/* Ayat Search Bar */}
      {!loading && !error && surah && (
        <div className="sticky top-[72px] z-30 px-4 py-3 sm:px-6" style={{ background: 'var(--background)', borderBottom: '1px solid rgba(197,160,89,0.1)' }}>
          <div className="mx-auto max-w-4xl">
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg className="h-5 w-5 text-gold-premium/70 group-focus-within:text-gold-premium transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="ayat-search-input"
                type="text"
                value={searchAyat}
                onChange={(e) => setSearchAyat(e.target.value)}
                placeholder={`Cari ayat di ${surah.namaLatin}... (nomor, teks, atau terjemahan)`}
                className="w-full rounded-2xl border border-gold-premium/20 bg-white/60 dark:bg-emerald-950/40 pl-12 pr-12 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 backdrop-blur-sm shadow-sm focus:outline-none focus:border-gold-premium/60 focus:ring-2 focus:ring-gold-premium/20 transition-all"
              />
              {searchAyat && (
                <button
                  onClick={() => setSearchAyat("")}
                  className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-gold-premium transition-colors"
                  aria-label="Clear ayat search"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchAyat && (
              <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 px-1">
                {filteredAyat.length > 0
                  ? `${filteredAyat.length} ayat ditemukan`
                  : "Tidak ada ayat yang cocok"}
              </p>
            )}
          </div>
        </div>
      )}

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-6">
            <div className="relative">
               <div className="h-20 w-20 animate-spin rounded-full border-4 border-gold-premium/10 border-t-gold-premium"></div>
               <div className="absolute inset-0 flex items-center justify-center text-gold-600">✦</div>
            </div>
          </div>
        ) : surah && (
          <div className="flex flex-col gap-12 sm:gap-16">
            {/* New Bismillah Header */}
            {surah.nomor !== 1 && surah.nomor !== 9 && showArabic && !searchAyat && (
              <BismillahHeader fontSize={fontSizeArabic} />
            )}

            {filteredAyat.length === 0 && searchAyat ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="text-6xl opacity-40">🔍</div>
                <div className="text-center">
                  <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">Ayat tidak ditemukan</p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Coba cari dengan nomor ayat, teks Arab, atau terjemahan</p>
                </div>
                <button
                  onClick={() => setSearchAyat("")}
                  className="px-6 py-2.5 rounded-xl bg-gold-premium/10 text-gold-600 dark:text-gold-400 font-bold text-sm hover:bg-gold-premium/20 transition-colors"
                >
                  Hapus pencarian
                </button>
              </div>
            ) : (
            <div className="space-y-8 sm:space-y-12">
              {filteredAyat.map((ayat: Ayat) => (
                <div
                  key={ayat.nomorAyat}
                  id={`ayat-${ayat.nomorAyat}`}
                  className="islamic-card group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-14 transition-all duration-500"
                >
                  <div className="mb-6 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
                    <div className="number-badge h-10 w-10 sm:h-12 sm:w-12 shrink-0 text-xs sm:text-sm border-2 sm:border-4 border-white shadow-xl order-first">
                      {ayat.nomorAyat}
                    </div>
                    
                    {showArabic && (
                      <div className="w-full">
                        <p 
                          className={`text-right ${script === 'madinah' ? 'leading-[2.5]' : 'leading-[2.2]'} quran-indo text-zinc-900 dark:text-zinc-100 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:!text-[length:var(--arabic-size)]`}
                          style={{ 
                            fontSize: `${fontSizeArabic * 0.8}px`,
                            ['--arabic-size' as any]: `${fontSizeArabic}px` 
                          } as any}
                        >
                          {ayat.teksArab}
                        </p>
                      </div>
                    )}
                  </div>

                  {(showLatin || showTranslation) && (
                    <div className="relative pt-6 sm:pt-8 mt-4 border-t border-gold-premium/10 space-y-4">
                      <div className="absolute -top-[1px] left-0 h-[2px] w-12 sm:w-16 bg-gold-premium shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
                      
                      {showLatin && translation === 'id' && (
                        <p 
                          className="font-bold leading-relaxed text-emerald-900 dark:text-emerald-500 italic opacity-80"
                          style={{ fontSize: `${fontSizeLatin}px` }}
                        >
                          {ayat.teksLatin}
                        </p>
                      )}

                      {showTranslation && (
                        <p 
                          className="font-medium leading-relaxed text-zinc-800 dark:text-zinc-200 indent-4"
                          style={{ fontSize: `${fontSizeTranslation}px` }}
                        >
                          {translation === 'id' ? ayat.teksIndonesia : ayat.teksEnglish}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
