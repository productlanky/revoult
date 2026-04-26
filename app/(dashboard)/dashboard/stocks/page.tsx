"use client";

import { 
  TrendingUp, TrendingDown, Search, Filter, Plus, 
  ArrowUpRight, BarChart2, PieChart, ChevronRight, 
  Clock, ArrowRightLeft, Star
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const PORTFOLIO_HISTORY = "M 0 100 C 20 80, 40 120, 60 90 C 80 60, 100 110, 120 70 C 140 30, 160 80, 180 40 C 200 0, 220 50, 240 20 L 240 150 L 0 150 Z";
const PORTFOLIO_LINE = "M 0 100 C 20 80, 40 120, 60 90 C 80 60, 100 110, 120 70 C 140 30, 160 80, 180 40 C 200 0, 220 50, 240 20";

const TOP_MOVERS = [
  { symbol: "NVDA", name: "Nvidia", change: "+4.28%", isUp: true, price: "$822.40" },
  { symbol: "TSLA", name: "Tesla", change: "-2.07%", isUp: false, price: "$175.22" },
  { symbol: "META", name: "Meta", change: "+1.50%", isUp: true, price: "$505.10" },
  { symbol: "AAPL", name: "Apple", change: "-0.85%", isUp: false, price: "$168.34" },
  { symbol: "MSFT", name: "Microsoft", change: "+0.70%", isUp: true, price: "$420.55" },
];

const HOLDINGS = [
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    shares: 124.5,
    price: 472.50,
    totalValue: 58826.25,
    change: "+1.24%",
    isUp: true,
    sparkline: "M 0 40 Q 10 35 20 20 T 40 10 T 60 25 T 80 5",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 150.0,
    price: 168.34,
    totalValue: 25251.00,
    change: "-0.85%",
    isUp: false,
    sparkline: "M 0 10 Q 10 15 20 30 T 40 20 T 60 35 T 80 40",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 85.0,
    price: 420.55,
    totalValue: 35746.75,
    change: "+0.70%",
    isUp: true,
    sparkline: "M 0 30 Q 10 20 20 25 T 40 15 T 60 20 T 80 10",
  },
];

export default function StocksPage() {
  const totalPortfolioValue = HOLDINGS.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Wealth & Trading</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your portfolio, track markets, and trade instantly.</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 sm:p-2.5 rounded-full sm:rounded-xl bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
            <Search className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          
          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plus className="w-4 h-4" /> Deposit Funds
          </button>
          <button className="sm:hidden p-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==========================================
            LEFT COLUMN: MAIN PORTFOLIO & CHART (lg:col-span-8)
            ========================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Chart Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative transition-colors duration-500">
            {/* Metallic Noise Texture */}
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            
            <div className="p-6 sm:p-8 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    Total Portfolio <EyeIcon className="w-4 h-4" />
                  </p>
                  <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                    ${totalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold">
                      <TrendingUp className="w-3.5 h-3.5" /> +$1,245.50
                    </span>
                    <span className="text-[13px] font-medium text-slate-500">Past Month</span>
                  </div>
                </div>

                {/* Quick Actions (Trade / Swap) */}
                <div className="hidden sm:flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors">
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold text-[13px] hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors">
                    Trade
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Glowing Chart Area */}
            <div className="w-full h-[220px] sm:h-[280px] relative z-0 mt-4">
              <svg viewBox="0 0 240 150" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="chartGradientDark" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="chartGradientLight" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Fill Area */}
                <path d={PORTFOLIO_HISTORY} fill="url(#chartGradientDark)" className="hidden dark:block" />
                <path d={PORTFOLIO_HISTORY} fill="url(#chartGradientLight)" className="block dark:hidden" />
                {/* Glowing Line */}
                <path d={PORTFOLIO_LINE} fill="none" stroke="#10b981" strokeWidth="2.5" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </svg>
              
              {/* Floating Chart Tooltip Mockup */}
              <div className="absolute top-[30%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black text-[12px] font-bold shadow-xl mb-2">
                  $119,400.20
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0A0A0C] shadow-[0_0_10px_rgba(16,185,129,1)]" />
                <div className="w-px h-full bg-slate-300 dark:bg-white/20 absolute top-8 bottom-[-100px] border-dashed" />
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center p-1 rounded-full bg-white/80 dark:bg-[#111115]/80 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] shadow-lg z-10">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((time, idx) => (
                <button 
                  key={time}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                    idx === 2 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Holdings List (Desktop: Normal, Mobile: Stacked Cards) */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Your Assets</h3>
              <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:text-cyan-700 dark:hover:text-cyan-300">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {HOLDINGS.map((asset) => (
                <div key={asset.symbol} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  
                  {/* Left: Ticker & Name */}
                  <div className="flex items-center gap-3 sm:gap-4 w-[140px] sm:w-[200px]">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                      <span className="font-bold text-[12px] text-slate-700 dark:text-slate-300">{asset.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="truncate pr-2">
                      <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{asset.symbol}</h4>
                      <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 mt-0.5 truncate">{asset.name}</p>
                    </div>
                  </div>

                  {/* Middle: Sparkline Chart (Hidden on small mobile) */}
                  <div className="hidden sm:block w-[100px] h-[30px]">
                    <svg viewBox="0 0 80 40" preserveAspectRatio="none" className="w-full h-full">
                      <path d={asset.sparkline} fill="none" stroke={asset.isUp ? "#10b981" : "#f43f5e"} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Right: Value & Change */}
                  <div className="flex flex-col items-end">
                    <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                      ${asset.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-medium text-slate-500">{asset.shares} shs</span>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${asset.isUp ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'}`}>
                        {asset.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: DISCOVERY & TOP MOVERS (lg:col-span-4)
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Movers (Horizontal Scroll on Mobile, Grid on Desktop) */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Today's Top Movers</h3>
              <button className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">See All</button>
            </div>

            {/* Mobile Swipe / Desktop List */}
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-col gap-3">
              {TOP_MOVERS.map((stock) => (
                <div key={stock.symbol} className="w-[140px] sm:w-full shrink-0 snap-center p-3 rounded-[16px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer">
                  
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0 shadow-sm">
                      <span className="font-bold text-[10px] text-slate-800 dark:text-slate-300">{stock.symbol.slice(0,1)}</span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-none">{stock.symbol}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[60px] sm:max-w-[100px]">{stock.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{stock.price}</p>
                    <span className={`text-[10px] font-bold ${stock.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {stock.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm dark:shadow-xl flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-cyan-500/30 transition-colors cursor-pointer">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 dark:bg-cyan-500/10 blur-[30px] rounded-full" />
              <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Mutual Funds</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">Explore portfolios</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm dark:shadow-xl flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-purple-500/30 transition-colors cursor-pointer">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 dark:bg-purple-500/10 blur-[30px] rounded-full" />
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Pre-IPO Angel</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">Private equity</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Icon wrapper for SVG
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}