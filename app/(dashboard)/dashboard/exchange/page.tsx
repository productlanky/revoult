"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  ArrowRightLeft, TrendingUp, History, Globe, 
  Clock, ShieldCheck, ChevronDown, Info, 
  ArrowDownRight, ArrowUpRight, Activity
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const EXCHANGE_RATES = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  JPY: { symbol: "¥", rate: 151.45 },
};

const RECENT_EXCHANGES = [
  { id: 1, from: "USD", to: "EUR", amountIn: 1200.00, amountOut: 1104.00, date: "Today, 10:45 AM", rate: "1.086" },
  { id: 2, from: "GBP", to: "USD", amountIn: 500.00, amountOut: 632.50, date: "Oct 12, 2026", rate: "1.265" },
  { id: 3, from: "EUR", to: "JPY", amountIn: 250.00, amountOut: 40850.00, date: "Oct 08, 2026", rate: "163.4" },
];

const CHART_LINE = "M 0 80 Q 20 60 40 70 T 80 40 T 120 50 T 160 20 L 160 100 L 0 100 Z";
const CHART_STROKE = "M 0 80 Q 20 60 40 70 T 80 40 T 120 50 T 160 20";

export default function ExchangePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Exchange State
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1000");
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Mock calculation
  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const exchangeRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES].rate / EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES].rate;
  const resultAmount = numericAmount * exchangeRate;

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setFromCurrency(toCurrency);
      setToCurrency(fromCurrency);
      setAmount(resultAmount.toFixed(2));
      setIsSwapping(false);
    }, 300); // Match animation duration
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-10">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Exchange</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time interbank rates with zero weekend markup.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: THE CONVERTER (lg:col-span-7)
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Exchange Widget */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative group">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000 opacity-50 dark:opacity-30" />
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            <div className="p-6 sm:p-8 relative z-10">
              
              {/* The Exchange Container */}
              <div className="relative">
                
                {/* --- FROM AMOUNT --- */}
                <div className={`p-5 sm:p-7 rounded-[24px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04] transition-all duration-300 ${isSwapping ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">You Sell</span>
                    <span className="text-[11px] font-medium text-slate-500">Balance: {EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES].symbol}24,500.50</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <input 
                      type="text" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 p-0"
                      placeholder="0.00"
                    />
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0 shadow-sm">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-black/50 text-xs">
                        {fromCurrency === 'USD' ? '🇺🇸' : fromCurrency === 'EUR' ? '🇪🇺' : fromCurrency === 'GBP' ? '🇬🇧' : '🇯🇵'}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{fromCurrency}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* --- SWAP BUTTON (Floating) --- */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <button 
                    onClick={handleSwap}
                    className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl border-4 border-white dark:border-[#0A0A0C]"
                  >
                    <ArrowRightLeft className={`w-5 h-5 ${isSwapping ? 'animate-spin' : 'rotate-90'}`} />
                  </button>
                </div>

                {/* --- TO AMOUNT --- */}
                <div className={`mt-2 p-5 sm:p-7 rounded-[24px] bg-cyan-50/50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/10 transition-all duration-300 ${isSwapping ? '-translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">You Receive</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-full text-4xl sm:text-5xl font-black tracking-tighter text-cyan-700 dark:text-white truncate">
                      {resultAmount > 0 ? resultAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-white dark:bg-[#1a1a24] border border-cyan-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shrink-0 shadow-sm">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-black/50 text-xs">
                        {toCurrency === 'USD' ? '🇺🇸' : toCurrency === 'EUR' ? '🇪🇺' : toCurrency === 'GBP' ? '🇬🇧' : '🇯🇵'}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{toCurrency}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Rate & Fee Breakdown */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-slate-400" /> Exchange Rate
                  </span>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-400" /> Fair Usage Fee
                  </span>
                  <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 line-through decoration-emerald-600/50 mr-2">
                    {EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES].symbol}4.50
                  </span>
                  <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    $0.00 (Metal Plan)
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-8 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-900 font-black text-[15px] transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20">
                Confirm Exchange
              </button>
            </div>
          </div>

          {/* Recent Exchanges Feed */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Exchanges</h3>
                <History className="w-5 h-5 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {RECENT_EXCHANGES.map((tx) => (
                    <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                <ArrowRightLeft className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-none">
                                  {tx.from} to {tx.to}
                                </h4>
                                <p className="text-[12px] text-slate-500 mt-1.5 font-medium">Rate: {tx.rate} • {tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[15px] font-black text-slate-900 dark:text-white">
                              +{EXCHANGE_RATES[tx.to as keyof typeof EXCHANGE_RATES].symbol}{tx.amountOut.toFixed(2)}
                          </p>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                              -{EXCHANGE_RATES[tx.from as keyof typeof EXCHANGE_RATES].symbol}{tx.amountIn.toFixed(2)}
                          </p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN: CHARTS & INFO (lg:col-span-5)
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Market Chart Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] p-6 sm:p-8 shadow-sm dark:shadow-xl relative overflow-hidden group transition-all duration-500 hover:border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs">🇺🇸</div>
                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs z-10">🇪🇺</div>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">{fromCurrency} / {toCurrency}</h3>
                    <p className="text-[11px] text-emerald-500 font-bold mt-0.5">+0.42% Today</p>
                  </div>
               </div>
               
               <div className="flex bg-slate-100 dark:bg-white/[0.05] rounded-lg p-1">
                 {['1D', '1W', '1M'].map((t, i) => (
                   <button key={t} className={`px-3 py-1 rounded-md text-[10px] font-bold ${i === 1 ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                     {t}
                   </button>
                 ))}
               </div>
            </div>

            {/* Price Display */}
            <div className="mb-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {exchangeRate.toFixed(4)}
              </h2>
              <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5" /> Market Open • Live
              </p>
            </div>

            {/* Glowing SVG Chart */}
            <div className="w-full h-[140px] relative -mx-2">
              <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" className="text-cyan-500" stopColor="currentColor" stopOpacity="0.4" />
                      <stop offset="100%" className="text-cyan-500" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={CHART_LINE} fill="url(#chart-gradient)" className="hidden dark:block" />
                  <path d={CHART_LINE} fill="url(#chart-gradient)" className="block dark:hidden opacity-30" />
                  <path d={CHART_STROKE} fill="none" stroke="currentColor" className="text-cyan-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Premium Feature Promo */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-[#0A0A0C] border border-indigo-800 dark:border-indigo-500/20 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group text-white">
            <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-colors" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-xl">
                  <Globe className="w-6 h-6 text-indigo-100" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Spend like a local</h3>
              <p className="text-sm text-indigo-100/70 mt-2 leading-relaxed">
                Your card automatically converts balances to the local currency when you spend abroad, at the exact interbank rate.
              </p>
              
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-[16px] bg-black/20 border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold">Zero Weekend Fees</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-[16px] bg-black/20 border border-white/5">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold">Auto-Exchange Orders</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}