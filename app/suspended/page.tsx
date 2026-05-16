"use client";

import { Ban, ShieldAlert, Mail, ShieldX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Assuming you want to show their specific reason

export default function SuspendedPage() {
  const { userData } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F7F7F9] dark:bg-[#030303] text-slate-900 dark:text-white p-4 relative overflow-hidden">
      
      {/* Danger Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-3xl h-[80vw] max-h-3xl bg-rose-500/10 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center">
          
          {/* Top Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-600" />

          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping opacity-50" />
            <ShieldX className="w-10 h-10 text-rose-500" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Account Suspended
          </h1>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your account has been temporarily restricted due to a violation of our terms of service or a security flag.
          </p>

          {/* Dynamic Reason Box */}
          <div className="p-4 rounded-[16px] bg-rose-50 dark:bg-[#111115] border border-rose-100 dark:border-white/5 text-left mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-4 h-4 text-rose-500" />
              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest">Reason for restriction</span>
            </div>
            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 leading-snug">
              {userData?.suspensionReason || "Our automated security systems have detected irregular activity. Please contact support to verify your identity and restore access."}
            </p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = "mailto:support@yourbank.com"}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-black transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] active:scale-95"
            >
              <Mail className="w-5 h-5" /> Contact Support Team
            </button>
            
            <Link 
              href="/"
              className="w-full flex items-center justify-center px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
            >
              Return to Homepage
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}