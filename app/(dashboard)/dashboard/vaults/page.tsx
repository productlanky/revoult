"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  PiggyBank, Plus, TrendingUp, Target, Coins, 
  Settings, ArrowRight, ArrowUpRight, ArrowDownRight, 
  History, Plane, ShieldCheck, Home as HomeIcon,
  Percent, ChevronRight
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const VAULTS = [
  {
    id: "v_1",
    name: "Emergency Fund",
    icon: ShieldCheck,
    balance: 15420.50,
    target: 20000.00,
    apy: "4.5%",
    theme: "from-emerald-500/20 to-emerald-500/5",
    lightTheme: "from-emerald-500/10 to-emerald-500/5",
    color: "text-emerald-500",
    bgClass: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
  },
  {
    id: "v_2",
    name: "Japan Trip 2027",
    icon: Plane,
    balance: 2450.00,
    target: 5000.00,
    apy: "4.5%",
    theme: "from-cyan-500/20 to-cyan-500/5",
    lightTheme: "from-cyan-500/10 to-cyan-500/5",
    color: "text-cyan-500 dark:text-cyan-400",
    bgClass: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20"
  },
  {
    id: "v_3",
    name: "House Deposit",
    icon: HomeIcon,
    balance: 45000.00,
    target: 100000.00,
    apy: "4.5%",
    theme: "from-indigo-500/20 to-indigo-500/5",
    lightTheme: "from-indigo-500/10 to-indigo-500/5",
    color: "text-indigo-500 dark:text-indigo-400",
    bgClass: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20"
  }
];

const VAULT_TRANSACTIONS = [
  { id: 1, type: "Interest Paid", vault: "House Deposit", amount: 168.40, date: "Today", isCredit: true, icon: Percent },
  { id: 2, type: "Round-up Deposit", vault: "Japan Trip 2027", amount: 2.45, date: "Yesterday", isCredit: true, icon: Coins },
  { id: 3, type: "Manual Deposit", vault: "Emergency Fund", amount: 500.00, date: "Oct 12, 2026", isCredit: true, icon: ArrowUpRight },
  { id: 4, type: "Withdrawal", vault: "Emergency Fund", amount: 1200.00, date: "Oct 05, 2026", isCredit: false, icon: ArrowDownRight },
];

export default function VaultsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [roundUpsEnabled, setRoundUpsEnabled] = useState(true);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const totalVaultsBalance = VAULTS.reduce((acc, curr) => acc + curr.balance, 0);
  const totalInterestEarned = 1245.80; // Mock historical interest

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Vaults</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Earn up to 4.5% AER paid daily on your savings goals.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Vault</span><span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: SUMMARY & VAULTS (lg:col-span-8)
            ========================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Balance & Interest Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative transition-colors duration-500 group">
            {/* Metallic Noise Texture */}
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-500/30 transition-colors pointer-events-none" />
            
            <div className="p-6 sm:p-8 relative z-10 flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05]">
                  <PiggyBank className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Total Savings</span>
                </div>
                
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Interest Earned</p>
                  <p className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4" /> +${totalInterestEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                  ${totalVaultsBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                  Across {VAULTS.length} active vaults earning up to 4.5% AER.
                </p>
              </div>
            </div>
          </div>

          {/* Goal Vaults (Mobile Carousel -> Desktop Grid) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Your Goal Vaults</h3>
              <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:text-cyan-700 dark:hover:text-cyan-300">
                Manage <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 gap-4 pb-2 sm:pb-0">
              {VAULTS.map((vault) => {
                const progress = (vault.balance / vault.target) * 100;
                
                return (
                  <div 
                    key={vault.id} 
                    className="w-[85vw] sm:w-auto shrink-0 snap-center bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-500 group cursor-pointer hover:border-slate-300 dark:hover:border-white/[0.1]"
                  >
                    {/* Ambient Background Gradient based on vault theme */}
                    <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${isDark ? vault.theme : vault.lightTheme} opacity-50 pointer-events-none`} />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 border ${vault.bgClass}`}>
                          <vault.icon className={`w-6 h-6 ${vault.color}`} />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">APY</span>
                          <span className="px-2 py-1 rounded-md bg-white/50 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[12px] font-bold text-slate-800 dark:text-white">
                            {vault.apy}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <h4 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight mb-1">{vault.name}</h4>
                        <div className="flex items-end justify-between mb-3">
                          <p className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
                            ${vault.balance.toLocaleString()}
                          </p>
                          <p className="text-[12px] font-medium text-slate-500">
                            of ${vault.target.toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out bg-current ${vault.color}`} 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-3 text-right">
                          {progress.toFixed(0)}% Achieved
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: AUTO-SAVE & ACTIVITY (lg:col-span-4)
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Round-ups Auto-Save Promo */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-[#1e1b4b] dark:to-[#0A0A0C] border border-indigo-800 dark:border-indigo-500/20 rounded-[24px] p-6 shadow-sm dark:shadow-[0_8px_30px_-10px_rgba(99,102,241,0.15)] relative overflow-hidden transition-colors duration-500 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full pointer-events-none transition-colors" />
            <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                {/* iOS Style Toggle for Round-ups */}
                <button 
                  onClick={() => setRoundUpsEnabled(!roundUpsEnabled)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none ${
                    roundUpsEnabled ? 'bg-cyan-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ease-out ${roundUpsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <div className="mb-5">
                <h3 className="text-lg font-bold text-white tracking-tight">Spare Change Round-ups</h3>
                <p className="text-xs text-indigo-100 mt-1.5 leading-relaxed">
                  We'll round up your card purchases to the nearest dollar and deposit the difference into your <b>Japan Trip</b> vault automatically.
                </p>
              </div>

              {roundUpsEnabled && (
                <div className="mt-5 p-3 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/80">Saved this week:</span>
                  <span className="text-sm font-bold text-white tracking-tight">+$12.45</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Vault Activity */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Vault Activity</h3>
              <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <History className="w-4 h-4" />
              </button>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {VAULT_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                      <tx.icon className={`w-4 h-4 ${tx.isCredit ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">{tx.type}</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{tx.date} • {tx.vault}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <p className={`text-[14px] font-bold ${tx.isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {tx.isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    {/* Native iOS Chevron (Visible only on mobile) */}
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 sm:hidden" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
              <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                Download Statement <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}