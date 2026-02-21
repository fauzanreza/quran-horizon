"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSurahList, Surah } from "@/services/quran";

interface QuranNavigatorProps {
  /** Pre-select surah number (used when already on a surah page) */
  currentSurahId?: number;
  /** Called when the user navigates; for in-page ayat scroll, parent provides this */
  onScrollToAyat?: (ayatNo: number) => void;
}

export default function QuranNavigator({ currentSurahId, onScrollToAyat }: QuranNavigatorProps) {
  const router = useRouter();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(true);

  const [selectedSurahNo, setSelectedSurahNo] = useState<number>(currentSurahId ?? 1);
  const [selectedAyatNo, setSelectedAyatNo] = useState<number>(1);

  // Dropdown open states
  const [surahOpen, setSurahOpen] = useState(false);
  const [ayatOpen, setAyatOpen] = useState(false);

  // Refs for closing on outside click
  const surahRef = useRef<HTMLDivElement>(null);
  const ayatRef = useRef<HTMLDivElement>(null);

  // Search inside surah dropdown
  const [surahSearch, setSurahSearch] = useState("");
  const surahSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSurahList().then((data) => {
      setSurahs(data);
      setLoadingSurahs(false);
    });
  }, []);

  // When currentSurahId changes (e.g. navigating between surahs), update selection
  useEffect(() => {
    if (currentSurahId) {
      setSelectedSurahNo(currentSurahId);
      setSelectedAyatNo(1);
    }
  }, [currentSurahId]);

  // Reset ayat to 1 when surah changes
  useEffect(() => {
    setSelectedAyatNo(1);
  }, [selectedSurahNo]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (surahRef.current && !surahRef.current.contains(e.target as Node)) {
        setSurahOpen(false);
        setSurahSearch("");
      }
      if (ayatRef.current && !ayatRef.current.contains(e.target as Node)) {
        setAyatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search when surah dropdown opens
  useEffect(() => {
    if (surahOpen) {
      setTimeout(() => surahSearchRef.current?.focus(), 50);
    } else {
      setSurahSearch("");
    }
  }, [surahOpen]);

  const selectedSurah = surahs.find((s) => s.nomor === selectedSurahNo);
  const jumlahAyat = selectedSurah?.jumlahAyat ?? 7;
  const ayatNumbers = Array.from({ length: jumlahAyat }, (_, i) => i + 1);

  const filteredSurahs = surahs.filter((s) => {
    const q = surahSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.namaLatin.toLowerCase().includes(q) ||
      s.arti.toLowerCase().includes(q) ||
      s.nama.includes(q) ||
      s.nomor.toString() === q
    );
  });

  function handleNavigate() {
    const isSameSurah = currentSurahId === selectedSurahNo;
    if (isSameSurah && onScrollToAyat) {
      // In-page scroll
      onScrollToAyat(selectedAyatNo);
    } else {
      // Navigate to surah page with hash anchor
      router.push(`/surah/${selectedSurahNo}#ayat-${selectedAyatNo}`);
    }
    setSurahOpen(false);
    setAyatOpen(false);
  }

  return (
    <div className="flex items-center gap-2 w-full min-w-0">
      {/* Surah Dropdown — grows to fill space */}
      <div ref={surahRef} className="relative flex-1 min-w-0">
        <button
          id="surah-nav-dropdown"
          onClick={() => { setSurahOpen((v) => !v); setAyatOpen(false); }}
          disabled={loadingSurahs}
          className="w-full flex items-center gap-2 rounded-2xl border border-gold-premium/30 bg-white/60 dark:bg-emerald-950/40 backdrop-blur-sm px-3 py-2.5 text-sm font-bold text-zinc-800 dark:text-zinc-100 shadow-sm hover:border-gold-premium/70 transition-all"
          aria-expanded={surahOpen}
          aria-haspopup="listbox"
        >
          {/* Number badge */}
          <span
            className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg text-xs font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg, #065f46, #059669)' }}
          >
            {selectedSurahNo}
          </span>
          <span className="flex-1 text-left truncate text-xs sm:text-sm">
            {loadingSurahs ? "Memuat..." : (selectedSurah?.namaLatin ?? "Pilih Surah")}
          </span>
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-gold-premium/60 transition-transform duration-200 ${surahOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Surah Dropdown Panel */}
        {surahOpen && (
          <div
            className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl overflow-hidden shadow-2xl border border-gold-premium/20"
            style={{ background: 'var(--background)', boxShadow: '0 20px 60px -10px rgba(6,78,59,0.15), 0 0 0 1px rgba(197,160,89,0.1)' }}
            role="listbox"
          >
            {/* Search inside dropdown */}
            <div className="p-3 border-b border-gold-premium/10">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-premium/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={surahSearchRef}
                  type="text"
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  placeholder="Cari surah..."
                  className="w-full rounded-xl border border-gold-premium/20 bg-white/60 dark:bg-emerald-900/30 pl-9 pr-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-gold-premium/50 transition-all"
                />
              </div>
            </div>

            {/* Options list */}
            <ul className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
              {filteredSurahs.length === 0 ? (
                <li className="px-4 py-3 text-xs text-zinc-400 text-center">Surah tidak ditemukan</li>
              ) : (
                filteredSurahs.map((surah) => (
                  <li key={surah.nomor}>
                    <button
                      onClick={() => {
                        setSelectedSurahNo(surah.nomor);
                        setSurahOpen(false);
                        setSurahSearch("");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all hover:bg-gold-premium/5 ${
                        selectedSurahNo === surah.nomor
                          ? "bg-emerald-900/5 dark:bg-emerald-400/10"
                          : ""
                      }`}
                      role="option"
                      aria-selected={selectedSurahNo === surah.nomor}
                    >
                      <span
                        className="flex items-center justify-center h-7 w-7 shrink-0 rounded-lg text-xs font-extrabold text-white"
                        style={{ background: selectedSurahNo === surah.nomor ? 'linear-gradient(135deg,#b38d45,#d4af37)' : 'linear-gradient(135deg,#065f46,#059669)' }}
                      >
                        {surah.nomor}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs">
                          {surah.namaLatin}
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                          {surah.arti} • {surah.jumlahAyat} ayat
                        </div>
                      </div>
                      <span className="quran-indo text-base text-emerald-deep/70 dark:text-emerald-400/70 shrink-0">
                        {surah.nama}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Divider */}
      <span className="text-gold-premium/40 font-bold text-xs select-none shrink-0">:</span>

      {/* Ayat Dropdown — fixed compact width */}
      <div ref={ayatRef} className="relative shrink-0">
        <button
          id="ayat-nav-dropdown"
          onClick={() => { setAyatOpen((v) => !v); setSurahOpen(false); }}
          className="flex items-center gap-1.5 rounded-2xl border border-gold-premium/30 bg-white/60 dark:bg-emerald-950/40 backdrop-blur-sm px-3 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-100 shadow-sm hover:border-gold-premium/70 transition-all w-[88px]"
          aria-expanded={ayatOpen}
          aria-haspopup="listbox"
        >
          <span className="flex-1 text-center">{selectedAyatNo}</span>
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-gold-premium/60 transition-transform duration-200 ${ayatOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Ayat Dropdown Panel */}
        {ayatOpen && (
          <div
            className="absolute left-0 top-full mt-2 z-50 w-36 rounded-2xl overflow-hidden shadow-2xl border border-gold-premium/20"
            style={{ background: 'var(--background)', boxShadow: '0 20px 60px -10px rgba(6,78,59,0.15), 0 0 0 1px rgba(197,160,89,0.1)' }}
            role="listbox"
          >
            <ul className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
              {ayatNumbers.map((n) => (
                <li key={n}>
                  <button
                    onClick={() => { setSelectedAyatNo(n); setAyatOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold transition-all hover:bg-gold-premium/5 ${
                      selectedAyatNo === n
                        ? "text-gold-600 dark:text-gold-400 bg-gold-premium/5"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                    role="option"
                    aria-selected={selectedAyatNo === n}
                  >
                    <span
                      className="flex items-center justify-center h-6 w-6 rounded-lg text-xs font-extrabold"
                      style={{
                        background: selectedAyatNo === n
                          ? 'linear-gradient(135deg,#b38d45,#d4af37)'
                          : 'rgba(197,160,89,0.1)',
                        color: selectedAyatNo === n ? '#fff' : 'var(--gold-500)',
                      }}
                    >
                      {n}
                    </span>
                    <span>Ayat {n}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Go — icon-only arrow button */}
      <button
        id="quran-navigator-go"
        onClick={handleNavigate}
        className="group relative shrink-0 flex items-center justify-center h-10 w-10 rounded-2xl text-white shadow-lg transition-all hover:scale-110 active:scale-95 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #065f46, #059669)', boxShadow: '0 6px 20px -4px rgba(6,78,59,0.4)' }}
        title="Pergi ke surah & ayat"
        aria-label="Navigasi ke surah dan ayat"
      >
        <svg className="relative z-10 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-500" />
      </button>
    </div>
  );
}
