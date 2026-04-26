"use client";

import { 
  Search, Filter, Plus, ArrowRightLeft, TrendingUp, 
  TrendingDown, ArrowUpRight, ArrowDownRight, Activity, 
  Wallet, ShieldCheck, History, Send, QrCode, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// --- MOCK DATA ---
const CRYPTO_HOLDINGS = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.845,
    price: 68420.50,
    change24h: "+2.45%",
    isUp: true,
    value: 57815.32,
    color: "#F7931A", // Bitcoin Orange
    sparkline: "M 0 30 Q 10 25 20 40 T 40 20 T 60 10 T 80 5",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    balance: 14.2,
    price: 3450.75,
    change24h: "+1.80%",
    isUp: true,
    value: 48999.65,
    color: "#627EEA", // Ethereum Blue/Purple
    sparkline: "M 0 40 Q 10 30 20 20 T 40 25 T 60 15 T 80 10",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    balance: 145.0,
    price: 145.20,
    change24h: "-4.20%",
    isUp: false,
    value: 21054.00,
    color: "#14F195", // Solana Green
    sparkline: "M 0 10 Q 10 15 20 30 T 40 25 T 60 35 T 80 40",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    balance: 500.0,
    price: 18.45,
    change24h: "+0.50%",
    isUp: true,
    value: 9225.00,
    color: "#2A5ADA", // Chainlink Blue
    sparkline: "M 0 25 Q 10 20 20 25 T 40 15 T 60 20 T 80 15",
  }
];

const WATCHLIST = [
  { symbol: "AVAX", name: "Avalanche", price: "$42.10", change: "+5.6%", isUp: true },
  { symbol: "DOGE", name: "Dogecoin", price: "$0.18", change: "-1.2%", isUp: false },
  { symbol: "DOT", name: "Polkadot", price: "$8.40", change: "+2.1%", isUp: true },
  { symbol: "ADA", name: "Cardano", price: "$0.55", change: "-0.4%", isUp: false },
];

export default function CryptoPage() {
  const totalCryptoValue = CRYPTO_HOLDINGS.reduce((acc, curr) => acc + curr.value, 0);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Crypto</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your digital assets, trade, and stake.</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 sm:p-2.5 rounded-full sm:rounded-xl bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
            <Search className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          
          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plus className="w-4 h-4" /> Buy Crypto
          </button>
          <button className="sm:hidden p-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==========================================
            LEFT COLUMN: MAIN PORTFOLIO (lg:col-span-8)
            ========================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Main Balance Card (Metallic Stealth Design) */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative transition-colors duration-500 group">
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-indigo-500/30 transition-colors pointer-events-none" />
            
            <div className="p-6 sm:p-8 relative z-10 flex flex-col justify-between min-h-[220px] sm:min-h-[240px]">
              
              {/* Top Row: Title & Action */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05]">
                  <Wallet className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Crypto Wallet</span>
                </div>
                
                <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors" title="Receive / Deposit">
                  <QrCode className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Row: Balance & Change */}
              <div className="mt-8">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                  ${totalCryptoValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </h2>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold">
                    <TrendingUp className="w-3.5 h-3.5" /> +$3,420.15 (24h)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Dock (Floats over the bottom edge of the card) */}
            <div className="border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/[0.04] relative z-10">
              <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-4 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors text-slate-600 dark:text-slate-300">
                <ArrowRightLeft className="w-4 h-4" />
                <span className="text-[12px] font-bold">Swap</span>
              </button>
              <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-4 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors text-slate-600 dark:text-slate-300">
                <Send className="w-4 h-4" />
                <span className="text-[12px] font-bold">Send</span>
              </button>
              <button className="flex flex-col sm:flex-row items-center justify-center gap-2 py-4 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors text-slate-600 dark:text-slate-300">
                <Activity className="w-4 h-4" />
                <span className="text-[12px] font-bold">Earn</span>
              </button>
            </div>
          </div>

          {/* 2. Holdings List */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Your Assets</h3>
              <button className="p-2 sm:p-2.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors text-slate-500 dark:text-slate-400">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {CRYPTO_HOLDINGS.map((asset) => (
                <div key={asset.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] active:bg-slate-100 dark:active:bg-white/[0.05] transition-colors group cursor-pointer">
                  
                  {/* Left: Icon & Ticker */}
                  <div className="flex items-center gap-3 sm:gap-4 w-[150px] sm:w-[200px]">
                    {/* Glowing Crypto Avatar */}
                    <div 
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: `${asset.color}20`, border: `1px solid ${asset.color}40` }}
                    >
                      <span className="font-bold text-[13px] text-slate-900 dark:text-white" style={{ color: isDark ? '#fff' : asset.color }}>{asset.symbol}</span>
                    </div>
                    <div className="truncate pr-2">
                      <h4 className="text-[15px] sm:text-[16px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{asset.name}</h4>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5 truncate">{asset.balance} {asset.symbol}</p>
                    </div>
                  </div>

                  {/* Middle: Sparkline Chart (Hidden on small mobile) */}
                  <div className="hidden sm:block w-[80px] h-[30px]">
                    <svg viewBox="0 0 80 40" preserveAspectRatio="none" className="w-full h-full">
                      <path d={asset.sparkline} fill="none" stroke={asset.isUp ? "#10b981" : "#f43f5e"} strokeWidth="2" strokeLinecap="round" className={isDark ? "drop-shadow-md" : ""} />
                    </svg>
                  </div>

                  {/* Right: Fiat Value & Change */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end">
                      <p className="text-[15px] sm:text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">
                        ${asset.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[12px] font-medium ${asset.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {asset.change24h}
                        </span>
                      </div>
                    </div>
                    {/* Native iOS Chevron (Visible only on mobile) */}
                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 sm:hidden" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: MARKETS & DISCOVERY (lg:col-span-4)
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Security / Earn Promo Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-[#1e1b4b] dark:to-[#0A0A0C] border border-indigo-800 dark:border-indigo-500/20 rounded-[24px] p-6 shadow-sm dark:shadow-[0_8px_30px_-10px_rgba(99,102,241,0.15)] relative overflow-hidden transition-colors duration-500 group cursor-pointer hover:border-indigo-400/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-colors" />
            <div className="relative z-10 flex gap-4">
              <div className="w-10 h-10 rounded-[12px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Stake & Earn</h3>
                <p className="text-xs text-indigo-200 mt-1 max-w-md leading-relaxed">
                  Earn up to 4.5% APY on your ETH securely.
                </p>
              </div>
            </div>
          </div>

          {/* Watchlist (Horizontal Scroll on Mobile, Stack on Desktop) */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Watchlist</h3>
              <button className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">Edit</button>
            </div>

            {/* Mobile Swipe / Desktop List */}
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-col gap-3">
              {WATCHLIST.map((coin) => (
                <div key={coin.symbol} className="w-[140px] sm:w-full shrink-0 snap-center p-3 rounded-[16px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer">
                  
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0 shadow-sm">
                      <span className="font-bold text-[10px] text-slate-800 dark:text-slate-300">{coin.symbol.slice(0,1)}</span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-none">{coin.symbol}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[60px] sm:max-w-[100px]">{coin.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{coin.price}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {coin.isUp ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />}
                      <span className={`text-[10px] font-bold ${coin.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {coin.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Mini-Feed */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h3>
              <button className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <History className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">Received BTC</p>
                    <p className="text-[11px] text-slate-500">From external wallet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">+0.025 BTC</p>
                  <p className="text-[11px] text-slate-500">Today</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">Swapped ETH to SOL</p>
                    <p className="text-[11px] text-slate-500">DEX Trade</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">12.5 SOL</p>
                  <p className="text-[11px] text-slate-500">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}