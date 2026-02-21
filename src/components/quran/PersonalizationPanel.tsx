"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "@/lib/SettingsContext";
import { useTheme } from "next-themes";
import OfflineManager from "./OfflineManager";

export default function PersonalizationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    fontSizeArabic, setFontSizeArabic,
    fontSizeLatin, setFontSizeLatin,
    fontSizeTranslation, setFontSizeTranslation,
    showArabic, setShowArabic,
    showLatin, setShowLatin,
    showTranslation, setShowTranslation
  } = useSettings();

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>
      
      {/* Modal Card */}
      <div className="relative z-[100000] w-[90%] max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-gold-premium/30 overflow-y-auto max-h-[85vh] animate-in fade-in zoom-in slide-in-from-bottom-10 duration-300">
        <div className="mb-6 flex items-center justify-between border-b border-gold-premium/10 pb-4">
          <h2 className="text-xl font-black text-emerald-deep dark:text-gold-premium tracking-tight">Personalisasi</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-full bg-emerald-900/5 p-2 hover:bg-emerald-900/10 transition-colors"
          >
            <svg className="h-5 w-5 text-emerald-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-8 text-left">
          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">Tema Aplikasi</h3>
            <div className="flex gap-2 p-1 bg-emerald-900/5 dark:bg-white/5 rounded-2xl">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  theme === 'light' 
                    ? 'bg-white text-emerald-deep shadow-lg ring-1 ring-black/5 dark:bg-emerald-200 dark:text-emerald-900' 
                    : 'text-emerald-deep/60 hover:text-emerald-deep dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Terang
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  theme === 'dark' 
                    ? 'bg-zinc-800 text-white shadow-lg ring-1 ring-white/10' 
                    : 'text-emerald-deep/60 hover:text-emerald-deep dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Gelap
              </button>
            </div>
          </div>

          {/* Visibility Checklist */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">Tampilan Ayat</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'arab', label: 'Teks Arab', value: showArabic, setter: setShowArabic },
                { id: 'latin', label: 'Teks Latin', value: showLatin, setter: setShowLatin },
                { id: 'arti', label: 'Terjemahan', value: showTranslation, setter: setShowTranslation },
              ].map((item) => (
                <label 
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-emerald-900/5 dark:bg-white/5 px-4 py-3 cursor-pointer hover:bg-emerald-900/10 dark:hover:bg-white/10 transition-all border border-transparent hover:border-gold-premium/20 dark:hover:border-gold-400/50"
                >
                  <span className="text-sm font-bold text-emerald-deep dark:text-emerald-300">{item.label}</span>
                  <input 
                    type="checkbox" 
                    checked={item.value} 
                    onChange={(e) => item.setter(e.target.checked)}
                    className="h-5 w-5 rounded-lg accent-emerald-deep dark:accent-emerald-500 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Font Size Sliders */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">Ukuran Font</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-emerald-deep/60 dark:text-zinc-400">
                  <span>Arab</span>
                  <span>{fontSizeArabic}px</span>
                </div>
                <input 
                  type="range" min="20" max="64" value={fontSizeArabic} 
                  onChange={(e) => setFontSizeArabic(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-emerald-900/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-deep dark:accent-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-emerald-deep/60 dark:text-zinc-400">
                  <span>Latin</span>
                  <span>{fontSizeLatin}px</span>
                </div>
                <input 
                  type="range" min="12" max="24" value={fontSizeLatin} 
                  onChange={(e) => setFontSizeLatin(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-emerald-900/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-deep dark:accent-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-emerald-deep/60 dark:text-zinc-400">
                  <span>Terjemah</span>
                  <span>{fontSizeTranslation}px</span>
                </div>
                <input 
                  type="range" min="12" max="24" value={fontSizeTranslation} 
                  onChange={(e) => setFontSizeTranslation(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-emerald-900/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-deep dark:accent-emerald-500"
                />
              </div>
            </div>
          </div>

          <OfflineManager />

          <button 
            onClick={() => setIsOpen(false)}
            className="w-full rounded-2xl bg-emerald-deep dark:bg-emerald-600 py-4 text-sm font-black text-white shadow-xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all dark:hover:bg-emerald-500"
          >
            SIMPAN PENGATURAN
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-white/50 dark:bg-emerald-950/30 backdrop-blur-md px-4 py-2 text-xs font-bold text-emerald-deep dark:text-emerald-300 border border-gold-premium/30 dark:border-gold-premium/40 hover:bg-gold-premium/10 transition-all shadow-sm"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="hidden sm:inline">Pengaturan</span>
      </button>

      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
