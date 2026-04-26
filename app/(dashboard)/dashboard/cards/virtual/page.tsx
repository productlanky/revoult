"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Plus, CreditCard, Eye, EyeOff, Snowflake, 
  Settings, Trash2, Copy, RefreshCw, ShoppingBag, 
  ShieldCheck, AlertCircle, ArrowUpRight, CheckCircle2,
  Lock, MonitorPlay
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const VIRTUAL_CARDS = [
  {
    id: "vc_1",
    name: "Online Shopping",
    type: "Multi-use",
    number: "•••• •••• •••• 8254",
    fullNumber: "4111 2222 3333 8254",
    expiry: "12/28",
    cvv: "892",
    theme: "from-[#111115] via-[#1e1b4b] to-[#312e81]", // Deep Indigo
    lightTheme: "from-indigo-500 via-indigo-600 to-indigo-800",
    status: "Active",
    monthlyLimit: 1500,
    spent: 420.50,
  },
  {
    id: "vc_2",
    name: "Disposable Proxy",
    type: "Single-use",
    number: "•••• •••• •••• 9012",
    fullNumber: "5555 4444 3333 9012",
    expiry: "01/29",
    cvv: "145",
    theme: "from-[#2a0845] via-[#831843] to-[#be123c]", // Neon Pink/Rose
    lightTheme: "from-rose-400 via-rose-500 to-rose-700",
    status: "Active",
    monthlyLimit: 500,
    spent: 0,
  }
];

const RECENT_TRANSACTIONS = [
  { id: 1, merchant: "Amazon.com", amount: 145.20, date: "Today, 2:45 PM", icon: ShoppingBag, card: "Online Shopping" },
  { id: 2, merchant: "Netflix", amount: 22.99, date: "Yesterday", icon: MonitorPlay, card: "Online Shopping" },
  { id: 3, merchant: "Uber Eats", amount: 34.50, date: "Oct 12, 2026", icon: ShoppingBag, card: "Disposable Proxy" },
];

export default function VirtualCardsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const activeCard = VIRTUAL_CARDS[activeCardIndex];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Virtual Cards</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Generate secure cards for online shopping and subscriptions.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          <Plus className="w-4 h-4" /> Create Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: ACTIVE CARD & ACTIONS (lg:col-span-7)
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card Carousel Area */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl p-6 sm:p-8 transition-colors duration-500 flex flex-col items-center">
            
            {/* The Virtual Card Render */}
            <div className={`w-full max-w-[380px] aspect-[1.586/1] rounded-[24px] p-6 sm:p-7 relative overflow-hidden shadow-2xl dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-700 ease-out transform group ${isDark ? 'bg-gradient-to-br ' + activeCard.theme : 'bg-gradient-to-br ' + activeCard.lightTheme}`}>
              
              {/* Noise & Lighting Overlays */}
              <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                
                {/* Card Top: Type & Logo */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-white/90 text-sm tracking-wide">{activeCard.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md inline-block w-max ${activeCard.type === 'Single-use' ? 'bg-rose-500/30 text-rose-100 border border-rose-500/50' : 'bg-white/10 text-white border border-white/20'}`}>
                      {activeCard.type}
                    </span>
                  </div>
                  {/* Mock Visa Logo */}
                  <div className="text-white/90 font-black text-xl italic tracking-tighter drop-shadow-md">VISA</div>
                </div>
                
                {/* Card Bottom: Numbers & Details */}
                <div className="mt-auto">
                  <div className="flex items-center gap-3">
                    <p className={`text-[22px] sm:text-[24px] font-mono tracking-[0.15em] text-white drop-shadow-md transition-all duration-300 ${showDetails ? 'opacity-100' : 'opacity-80'}`}>
                      {showDetails ? activeCard.fullNumber : activeCard.number}
                    </p>
                    {showDetails && (
                      <button onClick={handleCopy} className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors" title="Copy Number">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Valid Thru</span>
                        <span className="text-[14px] font-mono font-medium text-white drop-shadow-sm">{showDetails ? activeCard.expiry : "••/••"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">CVV</span>
                        <span className="text-[14px] font-mono font-medium text-white drop-shadow-sm">{showDetails ? activeCard.cvv : "•••"}</span>
                      </div>
                    </div>
                    {/* Metal Chip graphic just for aesthetics */}
                    <div className="w-10 h-7 rounded-[4px] bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 opacity-80 mix-blend-overlay border border-white/20 flex flex-col justify-evenly px-1">
                      <div className="w-full h-[1px] bg-black/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
              {VIRTUAL_CARDS.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeCardIndex === idx ? 'w-6 bg-slate-900 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40'}`}
                />
              ))}
            </div>

            {/* Core Card Action Buttons */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full mt-6 sm:mt-8">
              <ActionButton 
                icon={showDetails ? EyeOff : Eye} 
                label={showDetails ? "Hide" : "Reveal"} 
                onClick={() => setShowDetails(!showDetails)}
                isActive={showDetails}
              />
              <ActionButton icon={Snowflake} label="Freeze" />
              <ActionButton icon={Settings} label="Settings" />
              <ActionButton icon={activeCard.type === 'Single-use' ? RefreshCw : Trash2} label={activeCard.type === 'Single-use' ? "Refresh" : "Terminate"} danger={activeCard.type !== 'Single-use'} />
            </div>
          </div>

          {/* Recent Transactions Context */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
              <Link href="/dashboard/analytics" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:text-cyan-700 dark:hover:text-cyan-300">
                View All
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {RECENT_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                      <tx.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">{tx.merchant}</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{tx.date} • {tx.card}</p>
                    </div>
                  </div>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white">-${tx.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: LIMITS & DISCOVERY (lg:col-span-5)
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Spend Limit Bento */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-colors duration-500">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Monthly Spending Limit
            </h3>
            
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">${activeCard.spent.toFixed(2)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium"> / ${activeCard.monthlyLimit}</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                {Math.round((activeCard.spent / activeCard.monthlyLimit) * 100)}% Used
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden border border-slate-200 dark:border-white/5 mb-6">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(activeCard.spent / activeCard.monthlyLimit) * 100}%` }}
              />
            </div>

            <button className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.05] text-[12px] font-bold text-slate-700 dark:text-slate-300 transition-colors">
              Edit Limit
            </button>
          </div>

          {/* Promo: Disposable Cards */}
          <div className="bg-gradient-to-br from-rose-900 to-slate-900 dark:from-[#4c0519] dark:to-[#0A0A0C] border border-rose-800 dark:border-rose-500/20 rounded-[24px] p-6 sm:p-8 shadow-sm dark:shadow-[0_8px_30px_-10px_rgba(244,63,94,0.15)] relative overflow-hidden transition-colors duration-500 group">
            <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-rose-500/30 transition-colors" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-rose-100" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Stay Anonymous Online</h3>
              <p className="text-[13px] text-rose-100/80 mt-2 leading-relaxed">
                Generate a single-use virtual card. The card details instantly destroy themselves and regenerate after one purchase. Perfect for untrusted websites.
              </p>
              
              <button 
                onClick={() => setActiveCardIndex(1)} // Jumps to the disposable card in the mock array
                className="mt-6 px-5 py-2.5 rounded-xl bg-white text-rose-900 font-bold text-[12px] hover:bg-slate-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                Use Disposable Card
              </button>
            </div>
          </div>

          {/* Subscriptions Linked */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-colors duration-500 flex items-center justify-between group cursor-pointer hover:border-slate-300 dark:hover:border-white/[0.1]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Active Subscriptions</h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">3 linked to this card</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </div>

        </div>
      </div>
    </div>
  );
}

// --- MICRO COMPONENTS ---

function ActionButton({ icon: Icon, label, danger = false, onClick, isActive = false }: { icon: any, label: string, danger?: boolean, onClick?: () => void, isActive?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 group"
    >
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[18px] flex items-center justify-center border transition-all duration-300 ${
        isActive 
          ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400'
          : danger 
            ? 'bg-slate-50 dark:bg-[#111115] border-slate-200 dark:border-white/[0.05] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/20'
            : 'bg-slate-50 dark:bg-[#111115] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
      }`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span className={`text-[10px] sm:text-[11px] font-bold tracking-wide ${danger ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'} transition-colors`}>
        {label}
      </span>
    </button>
  );
}