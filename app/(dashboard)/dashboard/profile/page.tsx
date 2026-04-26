"use client";

import { 
  CheckCircle2, Copy, Sparkles, MapPin, Calendar, 
  Award, Zap, Gem, Wallet, Smartphone, ShieldCheck, 
  ArrowUpRight, QrCode
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      
      {/* --- HERO BANNER & AVATAR --- */}
      <div className="relative rounded-[32px] bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] shadow-sm dark:shadow-2xl overflow-hidden mt-2 transition-colors duration-500">
        
        {/* Abstract Metallic Cover Photo */}
        <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-[#111115] dark:via-[#1a1a24] dark:to-[#111115] relative overflow-hidden transition-colors duration-500">
          <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.6%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[80px] rounded-full" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 sm:-mt-16 relative z-10">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[20px] p-1.5 bg-white dark:bg-[#030303] shadow-md dark:shadow-2xl shrink-0 transition-colors duration-500">
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2a2a32] dark:to-[#121215] border border-slate-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" />
                  <span className="font-bold text-3xl sm:text-4xl text-slate-800 dark:text-white tracking-widest">SN</span>
                </div>
              </div>
              
              {/* Name & Handle */}
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Satoshi Nakamoto</h1>
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] px-2.5 py-1 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors">
                    @satoshiglobal <Copy className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Metal Member
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 pb-1">
              <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-white transition-colors group">
                <QrCode className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
              </button>
              <Link href="/dashboard/settings" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- BENTO BOX GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Identity Details & Stats (col-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* About Me Bento */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-colors duration-500">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Identity Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-0.5">Primary Residence</p>
                  <p className="text-[13px] font-bold dark:font-medium text-slate-800 dark:text-slate-200 leading-relaxed">123 Block Chain Blvd<br/>Suite 404, NY 10001</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-0.5">Joined</p>
                  <p className="text-[13px] font-bold dark:font-medium text-slate-800 dark:text-slate-200">October 2023</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-0.5">Verification Level</p>
                  <p className="text-[13px] font-bold dark:font-medium text-emerald-600 dark:text-emerald-400">Tier 3 (Unlimited Limits)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty & Rewards Bento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm dark:shadow-xl flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 dark:bg-cyan-500/10 blur-[30px] rounded-full" />
              <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">12,450</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">RevPoints</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm dark:shadow-xl flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[30px] rounded-full" />
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">$420.50</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Cashback</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cards & Connections (col-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Membership Card Display */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-1 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col sm:flex-row transition-colors duration-500">
            
            {/* The Physical Card Render */}
            <div className="w-full sm:w-1/2 p-6 sm:p-8 flex items-center justify-center bg-slate-50 dark:bg-white/[0.01] rounded-[20px] transition-colors">
              
              {/* Card Surface changes from Platinum to Obsidian based on theme */}
              <div className="w-[280px] h-[175px] rounded-[16px] p-5 relative overflow-hidden shadow-lg dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-slate-300 dark:border-white/[0.08] bg-gradient-to-br from-slate-100 to-slate-300 dark:from-[#111115] dark:via-[#1a1a24] dark:to-[#111115] group cursor-pointer transform hover:-translate-y-2 hover:rotate-1 transition-all duration-500 ease-out">
                {/* Metallic Noise */}
                <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-black/10 dark:from-white/10 dark:via-transparent dark:to-black/50 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    {/* Metal Chip */}
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-[#d4af37] via-[#aa8222] to-[#8a6513] shadow-inner border border-black/20 flex flex-col justify-evenly px-1">
                      <div className="w-full h-[1px] bg-black/20" />
                      <div className="w-full h-[1px] bg-black/20" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white/90 italic tracking-tighter">Revolut</span>
                  </div>
                  
                  <div>
                    <p className="text-[14px] font-mono tracking-[0.2em] text-slate-800 dark:text-white/90 drop-shadow-sm dark:drop-shadow-md">
                      **** **** **** 9012
                    </p>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-[11px] font-bold tracking-widest uppercase text-slate-700 dark:text-white/80 drop-shadow-sm dark:drop-shadow-md">Satoshi Nakamoto</p>
                      <div className="w-8 h-8 rounded-full border-2 border-slate-400 dark:border-white/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-slate-400 dark:bg-white/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="w-full sm:w-1/2 p-6 sm:p-8 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/[0.04]">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center mb-4 transition-colors">
                <Gem className="w-5 h-5 text-slate-400 dark:text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Metal Plan</h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                You are currently enjoying our highest tier. 1% cashback globally, unlimited FX, and priority 24/7 support.
              </p>
              
              <div className="mt-6 flex gap-3">
                <button className="flex-1 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-[12px] font-bold text-slate-700 dark:text-white transition-colors">
                  Card Settings
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-[12px] font-bold text-cyan-700 dark:text-cyan-400 transition-colors">
                  View Benefits
                </button>
              </div>
            </div>
          </div>

          {/* Linked Connections Bento */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-colors duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Connected Integrations</h3>
              <button className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 uppercase tracking-widest transition-colors flex items-center gap-1">
                Add New <PlusIcon className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-[16px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black border border-slate-300 dark:border-white/10 flex items-center justify-center shadow-inner">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">Apple Pay</p>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">Active on iPhone 15</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-[16px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1e293b] border border-slate-300 dark:border-white/10 flex items-center justify-center shadow-inner">
                    <Wallet className="w-4 h-4 text-[#38bdf8]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">MetaMask Wallet</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">0x71C...3E4a</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}