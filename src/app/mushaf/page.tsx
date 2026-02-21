"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSettings } from "@/lib/SettingsContext";

export default function MushafPage() {
  const { script } = useSettings();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const totalPages = 604;

  useEffect(() => {
    const preloadImage = (page: number) => {
      if (page > 0 && page <= totalPages) {
        const img = new Image();
        img.src = getPageUrl(page);
      }
    };
    preloadImage(currentPage + 1);
    preloadImage(currentPage - 1);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setLoading(true);
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageUrl = (page: number) => {
    const pageStr = page.toString().padStart(3, '0');
    // Using high quality Android Quran CDN
    return `https://android.quran.com/data/width_1260/page${pageStr}.png`;
  };

  const currentImageSrc = getPageUrl(currentPage);

  return (
    <div className="relative min-h-screen bg-[#fffcf2] dark:bg-zinc-950 overflow-hidden flex flex-col items-center">
      {/* Immersive Controls Overlay */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="bg-emerald-900/95 backdrop-blur-md text-white shadow-lg border-b border-gold-premium/30 px-4 py-3 flex items-center justify-between mx-auto max-w-2xl mt-4 rounded-full">
           <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            ←
          </Link>

          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-widest uppercase text-gold-premium">Mushaf Madinah</span>
            <span className="text-xs opacity-70">Page {currentPage}</span>
          </div>

          <button 
            onClick={() => setShowControls(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Reading Area (Full Screen) */}
      <main 
        className="h-[100dvh] w-full flex items-center justify-center relative cursor-pointer"
        onClick={() => setShowControls(!showControls)}
      >
        <div className="relative h-full w-full max-w-3xl aspect-[0.65] bg-white shadow-2xl overflow-hidden flex items-center justify-center mx-auto">
           {/* Detailed Realistic Frame (CSS) */}
           <div className="absolute inset-0 pointer-events-none z-20 border-[20px] border-[#e0d8c0]"></div>
           <div className="absolute inset-4 pointer-events-none z-20 border-2 border-emerald-900/20"></div>
           <div className="absolute inset-[18px] pointer-events-none z-20 border border-gold-premium/40"></div>
           
           {/* Corner Ornaments */}
           <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-emerald-900 z-30"></div>
           <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-emerald-900 z-30"></div>
           <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-emerald-900 z-30"></div>
           <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-emerald-900 z-30"></div>

           {loading && (
             <div className="absolute inset-0 flex items-center justify-center bg-[#fffcf2] z-10">
               <div className="animate-spin h-10 w-10 border-4 border-emerald-900 border-t-transparent rounded-full"></div>
             </div>
           )}

           <img 
             src={currentImageSrc} 
             alt={`Mushaf Page ${currentPage}`}
             className={`h-full w-full object-contain transition-opacity duration-300 p-6 sm:p-8 ${loading ? 'opacity-0' : 'opacity-100'}`}
             onLoad={() => setLoading(false)}
           />
        </div>
      </main>

      {/* Floating Navigation */}
      <div 
         className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-32'}`}
      >
        <div className="flex items-center gap-4 bg-emerald-900/90 backdrop-blur-md p-2 rounded-full shadow-xl border border-gold-premium/20">
          <button 
             onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage + 1); }}
             disabled={currentPage >= totalPages}
             className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ←
          </button>
          
          <div className="relative group">
             <input 
               type="number"
               min="1"
               max="604"
               value={currentPage}
               onChange={(e) => handlePageChange(parseInt(e.target.value))}
               className="w-16 h-10 bg-transparent text-center text-white font-bold focus:outline-none focus:bg-white/10 rounded-lg transition-colors"
             />
             <div className="absolute inset-x-0 bottom-1 h-0.5 bg-gold-premium opacity-50"></div>
          </div>

          <button 
             onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage - 1); }}
             disabled={currentPage <= 1}
             className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
