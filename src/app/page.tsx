"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getSurahList, Surah } from "@/services/quran";
import { useSettings } from "@/lib/SettingsContext";
import PersonalizationPanel from "@/components/quran/PersonalizationPanel";

// Dynamically imported with no SSR to prevent hydration mismatch
// (QuranNavigator uses useRouter + browser APIs that differ server vs client)
const QuranNavigator = dynamic(
  () => import("@/components/quran/QuranNavigator"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 w-full animate-pulse">
        <div className="flex-1 h-10 rounded-2xl bg-gold-premium/10" />
        <div className="w-[88px] h-10 rounded-2xl bg-gold-premium/10 shrink-0" />
        <div className="w-10 h-10 rounded-2xl bg-gold-premium/10 shrink-0" />
      </div>
    ),
  }
);

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const { translation, script, setTranslation, setScript } = useSettings();

  useEffect(() => {
    getSurahList().then((data) => {
      setSurahs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Texture Layer */}
      <div className="fixed inset-0 pointer-events-none islamic-ornament z-0 opacity-[0.05]"></div>

      <header className="sticky top-0 z-30 premium-header">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <span className="gold-gradient-text text-4xl">✦</span>
                <span className="text-emerald-deep dark:text-emerald-400">Quran</span>
                <span className="gold-gradient-text">Horizon</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-0.5 w-4 bg-gold-premium rounded-full"></span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em]">
                  The Premium Experience
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <PersonalizationPanel />

              <div className="flex shrink-0 p-1 bg-white/50 dark:bg-emerald-900/30 backdrop-blur-md rounded-2xl border border-gold-premium/20 shadow-inner">
                <button
                  onClick={() => setTranslation("id")}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    translation === "id" 
                    ? "bg-emerald-deep text-white shadow-lg shadow-emerald-900/30" 
                    : "text-emerald-deep/60 dark:text-emerald-300/60 hover:text-emerald-deep dark:hover:text-emerald-300"
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => setTranslation("en")}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    translation === "en" 
                    ? "bg-emerald-deep text-white shadow-lg shadow-emerald-900/30" 
                    : "text-emerald-deep/60 dark:text-emerald-300/60 hover:text-emerald-deep dark:hover:text-emerald-300"
                  }`}
                >
                  EN
                </button>
              </div>

              <div className="flex shrink-0 p-1 bg-white/50 dark:bg-emerald-900/30 backdrop-blur-md rounded-2xl border border-gold-premium/20 shadow-inner">
                <button
                  onClick={() => setScript("indonesia")}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    script === "indonesia" 
                    ? "bg-gold-premium text-white shadow-lg shadow-gold-premium/30" 
                    : "text-gold-premium/60 dark:text-gold-300/60 hover:text-gold-premium dark:hover:text-gold-300"
                  }`}
                >
                  INDO
                </button>
                <button
                  onClick={() => setScript("madinah")}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    script === "madinah" 
                    ? "bg-gold-premium text-white shadow-lg shadow-gold-premium/30" 
                    : "text-gold-premium/60 dark:text-gold-300/60 hover:text-gold-premium dark:hover:text-gold-300"
                  }`}
                >
                  MADINAH
                </button>
              </div>

              {/* Mushaf — icon-only book button */}
              <Link
                href="/mushaf"
                className="group relative shrink-0 flex items-center justify-center h-10 w-10 rounded-2xl text-white shadow-lg shadow-gold-premium/20 transition-all hover:scale-110 active:scale-95 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #b38d45, #d4af37)' }}
                title="Mushaf"
                aria-label="Buka Mushaf"
              >
                {/* Open book icon */}
                <svg className="relative z-10 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigator Bar — replaces the old text search */}
      <div
        className="sticky top-[88px] z-20 px-4 py-3 sm:px-6"
        style={{ background: 'var(--background)', borderBottom: '1px solid rgba(197,160,89,0.1)' }}
      >
        <div className="mx-auto max-w-6xl">
          {/* overflow-visible is critical: dropdown panels are position:absolute and must not be clipped */}
          <div className="flex items-center gap-2.5">
            {/* Label: icon only on mobile, text on sm+ */}
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gold-600/70 dark:text-gold-400/60 select-none shrink-0">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Navigasi</span>
            </div>
            <div className="h-5 w-px bg-gold-premium/20 shrink-0" />
            {/* overflow-visible so dropdown panels escape the row bounds */}
            <div className="flex-1 min-w-0 overflow-visible">
              <QuranNavigator surahs={surahs} />
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
             <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gold-premium border-t-transparent opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-gold-premium text-xs">✦</div>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {surahs.map((surah: Surah) => (
              <Link
                key={surah.nomor}
                href={`/surah/${surah.nomor}`}
                className="islamic-card group relative flex items-center gap-5 rounded-[2rem] p-6 overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="fill-gold-premium">
                    <path d="M50 0L64.7 35.3L100 50L64.7 64.7L50 100L35.3 64.7L0 50L35.3 35.3Z" />
                  </svg>
                </div>

                <div className="number-badge h-14 w-14 shrink-0 text-xl border-2 border-white/50">
                  {surah.nomor}
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-deep dark:group-hover:text-emerald-400 transition-all">
                    {surah.namaLatin}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                      {surah.arti}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                      {surah.jumlahAyat} AYAT
                    </span>
                  </div>
                </div>

                <div className="quran-indo text-2xl text-emerald-deep/80 dark:text-emerald-400/80 group-hover:text-emerald-deep dark:group-hover:text-emerald-400 transition-all filter drop-shadow-sm">
                  {surah.nama}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="relative z-10 py-16 border-t border-gold-premium/10 mt-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="inline-block px-12 py-8 bg-white/30 dark:bg-emerald-950/30 backdrop-blur-xl rounded-[3rem] border border-gold-premium/10 islamic-card">
            <h4 className="gold-gradient-text text-xl font-bold mb-2">QURAN HORIZON</h4>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-premium/40"></span>
              <span className="text-gold-premium text-xl">❦</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-premium/40"></span>
            </div>
            <p className="max-w-xs mx-auto text-[10px] font-extrabold tracking-[0.3em] uppercase text-zinc-500 mb-2">
              Digital Mushaf Excellence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
