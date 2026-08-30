import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full mt-auto border-t border-slate-800/60 bg-[#050a14]/90 backdrop-blur-md py-5 px-4 z-20 relative">
      <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-[#0b1221]/80 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-sm shadow-cyan-900/10">
            <img src="/logo-sqlukay.png" alt="SQLukay Logo" className="w-4 h-4 object-contain" />
          </div>
          <span className="text-[14px] font-semibold text-slate-300 tracking-wide">SQLukay</span>
        </div>
        
        {/* Attribution */}
        <div className="text-[12px] font-medium text-slate-500 flex flex-col sm:flex-row items-center sm:space-x-2 gap-1">
          <span>&copy; {year} SQLukay</span>
          <span className="hidden sm:inline text-slate-700">&bull;</span>
          <span>
            Created by{' '}
            <a 
              href="https://www.instagram.com/luckyluqmn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-cyan-400 transition-colors font-semibold cursor-pointer"
            >
              Lucky Luqmanul Hakim
            </a>
          </span>
          <span className="hidden sm:inline text-slate-700">&bull;</span>
          <a 
            href="https://luckyluqmn.web.app/portofolio" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-500/80 hover:text-cyan-400 transition-colors font-semibold cursor-pointer"
          >
            Lukay Project
          </a>
        </div>
      </div>
    </footer>
  );
}
