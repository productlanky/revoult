"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Globe, Send, Search, ChevronDown, Plus, 
  ArrowDownUp, Clock, Info, CheckCircle2, 
  Building2, Landmark, Plane, ShieldCheck,
  Zap, ArrowRight
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const RECIPIENTS = [
  { id: "r_1", name: "Yuki Tanaka", country: "Japan", currency: "JPY", flag: "🇯🇵", bank: "Mizuho Bank", lastSent: "2 days ago", color: "from-rose-500 to-orange-500" },
  { id: "r_2", name: "Elena Rodriguez", country: "Spain", currency: "EUR", flag: "🇪🇸", bank: "Santander", lastSent: "1 week ago", color: "from-blue-500 to-cyan-500" },
  { id: "r_3", name: "Alexander Wright", country: "UK", currency: "GBP", flag: "🇬🇧", bank: "Barclays", lastSent: "Oct 12, 2026", color: "from-indigo-500 to-purple-500" },
  { id: "r_4", name: "Acme Corp Ltd.", country: "Germany", currency: "EUR", flag: "🇩🇪", bank: "Deutsche Bank", lastSent: "Sep 28, 2026", color: "from-slate-500 to-slate-700" },
];

const CURRENCIES = {
  USD: { symbol: "$", rate: 1.00, name: "US Dollar", flag: "🇺🇸" },
  EUR: { symbol: "€", rate: 0.92, name: "Euro", flag: "🇪🇺" },
  GBP: { symbol: "£", rate: 0.79, name: "British Pound", flag: "🇬🇧" },
  JPY: { symbol: "¥", rate: 151.45, name: "Japanese Yen", flag: "🇯🇵" },
};

export default function GlobalTransferPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Transfer State
  const [sendAmount, setSendAmount] = useState("1000");
  const [sendCurrency, setSendCurrency] = useState("USD");
  const [receiveCurrency, setReceiveCurrency] = useState("EUR");

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Calculation
  const numericAmount = parseFloat(sendAmount.replace(/,/g, '')) || 0;
  const exchangeRate = CURRENCIES[receiveCurrency as keyof typeof CURRENCIES].rate / CURRENCIES[sendCurrency as keyof typeof CURRENCIES].rate;
  const receiveAmount = numericAmount * exchangeRate;

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Global Transfer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Send money internationally with zero hidden fees and real-time tracking.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" /> Bank-grade Security
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: THE TRANSFER TERMINAL
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative">
            
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none opacity-50 dark:opacity-30 transition-colors" />

            <div className="p-6 sm:p-8 relative z-10">
              
              {/* --- SEND INPUT CARD --- */}
              <div className="bg-slate-50 dark:bg-[#111115] rounded-[24px] p-5 sm:p-7 border border-slate-200 dark:border-white/[0.04] shadow-inner transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">You Send</span>
                  <span className="text-[12px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 bg-white dark:bg-[#1a1a24] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Balance: $24,500.50
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="relative w-full">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl sm:text-4xl font-bold text-slate-400 dark:text-slate-600">
                      {CURRENCIES[sendCurrency as keyof typeof CURRENCIES].symbol}
                    </span>
                    <input 
                      type="text" 
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-800 pl-8 sm:pl-10"
                      placeholder="0.00"
                    />
                  </div>

                  <button className="flex items-center gap-2 px-4 py-3 rounded-[16px] bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/20 transition-all shadow-sm shrink-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 dark:bg-black/50 text-sm">
                      {CURRENCIES[sendCurrency as keyof typeof CURRENCIES].flag}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{sendCurrency}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* --- THE BRIDGE (FEES & RATES) --- */}
              <div className="relative py-4 pl-8 sm:pl-10">
                {/* Vertical Line connecting the inputs */}
                <div className="absolute left-[39px] sm:left-[47px] top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/10 flex items-center justify-center z-10 shadow-sm -ml-[11px]">
                      <ArrowDownUp className="w-3 h-3 text-slate-500" />
                    </div>
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Exchange Rate</span>
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                        1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center z-10 shadow-sm -ml-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Transfer Fee</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-400 line-through decoration-slate-400/50">
                          {CURRENCIES[sendCurrency as keyof typeof CURRENCIES].symbol}5.00
                        </span>
                        <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">Free (Metal)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center z-10 shadow-sm -ml-[11px]">
                      <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex items-center justify-between w-full pr-2">
                      <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Estimated Arrival</span>
                      <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400">Seconds (Instant)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- RECEIVE OUTPUT CARD --- */}
              <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[24px] p-5 sm:p-7 border border-indigo-100 dark:border-indigo-500/10 shadow-inner transition-colors mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-indigo-600/70 dark:text-indigo-400/70">Recipient Gets</span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="relative w-full overflow-hidden">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl sm:text-4xl font-bold text-indigo-300 dark:text-indigo-500/50">
                      {CURRENCIES[receiveCurrency as keyof typeof CURRENCIES].symbol}
                    </span>
                    <div className="w-full bg-transparent text-4xl sm:text-5xl font-black tracking-tighter text-indigo-900 dark:text-white pl-8 sm:pl-10 truncate">
                      {receiveAmount > 0 ? receiveAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
                    </div>
                  </div>

                  <button className="flex items-center gap-2 px-4 py-3 rounded-[16px] bg-white dark:bg-[#1a1a24] border border-indigo-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/20 transition-all shadow-sm shrink-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 dark:bg-black/50 text-sm">
                      {CURRENCIES[receiveCurrency as keyof typeof CURRENCIES].flag}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{receiveCurrency}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button className="w-full mt-8 py-4 sm:py-5 rounded-[20px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-[15px] sm:text-[16px] transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 group">
                Continue to Recipient 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: RECIPIENTS & TRACKING
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Saved Beneficiaries */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Send Again</h3>
              <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5">
                <Search className="w-4 h-4 text-slate-500 dark:text-white" />
              </button>
            </div>

            {/* Horizontal Quick Avatars */}
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex gap-4 overflow-x-auto scrollbar-hide">
              <button className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center border-dashed group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                  <Plus className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">New</span>
              </button>

              {RECIPIENTS.map((rec) => (
                <button key={`avatar-${rec.id}`} className="flex flex-col items-center gap-2 shrink-0 group">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${rec.color} p-[2px] shadow-md group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full rounded-full bg-white dark:bg-[#0A0A0C] border-2 border-white dark:border-[#0A0A0C] flex items-center justify-center overflow-hidden">
                        <span className="font-black text-slate-900 dark:text-white">{rec.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#0A0A0C] flex items-center justify-center text-[10px]">
                      {rec.flag}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate w-16 text-center">{rec.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Full List */}
            <div className="p-4 space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2 mb-3">Saved Contacts</h4>
              {RECIPIENTS.map((rec) => (
                <div key={`list-${rec.id}`} className="p-4 rounded-[20px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rec.color} flex items-center justify-center shadow-inner shrink-0 text-white font-bold`}>
                      {rec.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-none">{rec.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-1.5 flex items-center gap-1">
                        <Landmark className="w-3 h-3" /> {rec.bank} • {rec.currency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">{rec.lastSent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Transfer Tracker Widget */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            {/* Background Map Graphic Simulation */}
            <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            <Globe className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000" strokeWidth={1} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> In Transit
                </div>
                <span className="text-xs font-bold text-slate-400">Ref: #TR-9021</span>
              </div>

              <h3 className="text-white font-bold text-lg leading-tight">Transfer to Maria Garcia</h3>
              <p className="text-slate-400 text-sm mt-1">€1,500.00 • Arriving Today</p>

              {/* Progress Steps */}
              <div className="mt-8 relative">
                {/* Track Line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-700/50" />
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Funds Deducted</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Oct 14 • 09:12 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                      <Plane className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Cross-border Routing</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Processing via Swift</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 relative z-10 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Bank Processing</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Awaiting Banco Santander</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[13px] transition-colors">
                View Receipt
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}