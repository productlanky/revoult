"use client";

import { FileQuestion, ArrowLeft, Home, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F7F7F9] dark:bg-[#030303] text-slate-900 dark:text-white p-4 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-2xl h-[80vw] max-h-2xl bg-cyan-500/10 dark:bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

      <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700 max-w-md w-full">
        
        {/* Floating Icon */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-[24px] blur-xl group-hover:bg-cyan-500/30 transition-colors duration-500" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 shadow-2xl flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
            <FileQuestion className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-500" />
          </div>
        </div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-700 dark:text-slate-300 mb-4">
          Page not found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-xs mx-auto">
          The page you are looking for doesn't exist or has been moved to a different coordinate.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          
          <Link 
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-[13px] font-bold transition-all shadow-xl hover:scale-[1.02] active:scale-95"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}