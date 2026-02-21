"use client";

import { useSettings } from "@/lib/SettingsContext";

export default function BismillahHeader({ fontSize }: { fontSize: number }) {
  return (
    <div className="islamic-card relative py-8 px-6 mb-8 text-center flex justify-center items-center rounded-[2rem] shadow-sm bg-white dark:bg-zinc-900">
        <p 
          className="quran-indo text-emerald-deep dark:text-emerald-500 leading-relaxed font-bold" 
          style={{ fontSize: `${fontSize * 0.8}px` }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
    </div>
  );
}
