"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  ArrowRightLeft, ArrowDownToLine, Send, Plus, 
  CreditCard, TrendingUp, History, ChevronRight, 
  Landmark, ShoppingBag, Coffee, Building2, Eye,
  Activity, ArrowUpRight, Zap,
  Search
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const RECENT_TRANSACTIONS = [
  { id: 1, name: "Whole Foods Market", category: "Groceries", amount: 124.50, date: "Today, 1:15 PM", isCredit: false, icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 2, name: "Acme Corp Payroll", category: "Income", amount: 4250.00, date: "Yesterday", isCredit: true, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 3, name: "Starbucks", category: "Dining", amount: 6.45, date: "Yesterday", isCredit: false, icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: 4, name: "Transfer to Savings", category: "Internal", amount: 500.00, date: "Oct 14, 2026", isCredit: false, icon: Landmark, color: "text-slate-500", bg: "bg-slate-500/10" },
];

const QUICK_CONTACTS = [
  { id: "c_1", name: "Elena R.", initials: "ER", color: "from-blue-500 to-cyan-500" },
  { id: "c_2", name: "Marcus C.", initials: "MC", color: "from-indigo-500 to-purple-500" },
  { id: "c_3", name: "David K.", initials: "DK", color: "from-rose-500 to-orange-500" },
  { id: "c_4", name: "Sarah J.", initials: "SJ", color: "from-emerald-500 to-teal-500" },
];

export default function DashboardOverview() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Hello, Satoshi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is your financial summary for today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold">
          <Activity className="w-4 h-4 text-emerald-500" /> All systems operational
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: HERO & ACTIVITY
            ========================================== */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Main Net Worth / Hero Card */}
          <div className="bg-[#0A0A0C] rounded-[32px] shadow-2xl overflow-hidden relative group p-8 sm:p-10 border border-white/10">
            
            {/* Liquid Mesh Background */}
            <div className="absolute top-[-50%] left-[-20%] w-[120%] h-[150%] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[100%] h-[120%] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Total Net Worth</span>
                </div>
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 mb-10">
                <h2 className="text-5xl sm:text-[72px] font-black tracking-tighter text-white drop-shadow-2xl flex items-center gap-2">
                  <span className="text-white/50 font-normal">$</span>
                  {showBalance ? "138,248.58" : "••••••"}
                </h2>
                <div className="flex items-center gap-2 mt-4">
                  <span className="flex items-center gap-1 text-[14px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <TrendingUp className="w-4 h-4" /> +$3,420.50 (2.4%)
                  </span>
                  <span className="text-[13px] text-white/50 font-medium">vs last month</span>
                </div>
              </div>

              {/* Action Dock inside Hero */}
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                <HeroAction icon={ArrowDownToLine} label="Add Money" link="/dashboard/wallets" />
                <HeroAction icon={Send} label="Transfer" link="/dashboard/transfer/send" />
                <HeroAction icon={ArrowRightLeft} label="Exchange" link="/dashboard/exchange" highlight />
                <HeroAction icon={Plus} label="More" link="/dashboard/wallets" />
              </div>

            </div>
          </div>

          {/* Quick Send Strip */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Quick Send</h3>
              <Link href="/dashboard/transfer/send" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 transition-colors">View All</Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              <button className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="w-14 h-14 rounded-[20px] bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/5 flex items-center justify-center border-dashed group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Search</span>
              </button>

              {QUICK_CONTACTS.map((contact) => (
                <button key={contact.id} className="flex flex-col items-center gap-2 shrink-0 group">
                  <div className={`w-14 h-14 rounded-[20px] bg-gradient-to-tr ${contact.color} p-[2px] shadow-sm group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full rounded-[18px] bg-white dark:bg-[#0A0A0C] flex items-center justify-center">
                      <span className="font-black text-slate-900 dark:text-white">{contact.initials}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{contact.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
              <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                <History className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {RECENT_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#111115]/50 cursor-pointer group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[20px] ${tx.bg} border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <tx.icon className={`w-5 h-5 ${tx.color}`} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-none">{tx.name}</h4>
                      <p className="text-[12px] text-slate-500 mt-1.5 font-medium">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <p className={`text-[16px] font-black ${tx.isCredit ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                    {tx.isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-[#0A0A0C]">
              <Link href="/dashboard/analytics" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 transition-colors flex items-center gap-1">
                View All Transactions <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: CARDS & WIDGETS
            ========================================== */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
          
          {/* Active Card Widget (Mini) */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">My Cards</h3>
              <Link href="/dashboard/cards/physical" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700">Manage</Link>
            </div>

            {/* Premium Black Metal Card Visual */}
            <div className="w-full aspect-[1.586/1] rounded-[20px] bg-gradient-to-br from-[#2a2a32] via-[#111115] to-[#050505] p-5 relative overflow-hidden shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer group hover:scale-[1.02] transition-transform duration-500 border border-white/[0.08]">
              {/* Specular Highlight */}
              <div className="absolute top-[-100%] left-[-50%] w-[200%] h-[300%] bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent rotate-[25deg] pointer-events-none group-hover:translate-x-[50%] transition-transform duration-1000" />
              <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-6 rounded-[4px] bg-gradient-to-br from-[#e0c097] via-[#c49b5c] to-[#8a6513] shadow-inner border border-black/30" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Metal</span>
                </div>
                <div>
                  <p className="text-[16px] font-mono tracking-[0.2em] text-white/90 drop-shadow-md">
                    •••• •••• •••• 1234
                  </p>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">Satoshi Nakamoto</span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-rose-500/80 mix-blend-screen" />
                      <div className="w-6 h-6 rounded-full bg-amber-500/80 mix-blend-screen" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Link href="/dashboard/cards/physical" className="py-3 rounded-[16px] bg-slate-50 hover:bg-slate-100 dark:bg-[#111115] dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                <CreditCard className="w-4 h-4" /> Details
              </Link>
              <button className="py-3 rounded-[16px] bg-slate-50 hover:bg-slate-100 dark:bg-[#111115] dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                 <Zap className="w-4 h-4" /> Freeze
              </button>
            </div>
          </div>

          {/* Cash Flow Mini Widget */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">October Cash Flow</h3>
              <Link href="/dashboard/cashflow" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5">
                <ArrowUpRight className="w-4 h-4 text-slate-500 dark:text-white" />
              </Link>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-500">Earned</span>
                  <span className="font-bold text-emerald-500">$8,450.00</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%] rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-500">Spent</span>
                  <span className="font-bold text-slate-900 dark:text-white">$5,240.50</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 dark:bg-white w-[62%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Vaults Promo Widget */}
          <Link href="/dashboard/vaults" className="block bg-gradient-to-br from-indigo-900 to-[#0A0A0C] border border-indigo-500/20 rounded-[32px] p-6 shadow-xl relative overflow-hidden group hover:border-indigo-400/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full pointer-events-none group-hover:bg-indigo-400/30 transition-colors" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-200 border border-white/10 mb-2 inline-block">4.5% AER</span>
                <h3 className="text-white font-bold text-lg">High-Yield Vaults</h3>
                <p className="text-indigo-200/70 text-xs mt-1">Make your money work harder.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 text-white group-hover:scale-110 transition-transform">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}

// --- MICRO COMPONENTS ---

function HeroAction({ icon: Icon, label, highlight = false, link }: { icon: any, label: string, highlight?: boolean, link: string }) {
  return (
    <Link href={link} className="flex flex-col items-center justify-center gap-2 group">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center transition-all duration-300 ${
        highlight 
          ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105' 
          : 'bg-white/10 text-white backdrop-blur-md border border-white/10 group-hover:bg-white/20 group-hover:scale-105'
      }`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={highlight ? 3 : 2} />
      </div>
      <span className="text-[11px] sm:text-[12px] font-bold text-white/80 group-hover:text-white transition-colors tracking-wide">
        {label}
      </span>
    </Link>
  );
}