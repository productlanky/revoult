"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  TrendingUp, TrendingDown, Activity, Calendar, 
  PieChart, ChevronDown, Coffee, ShoppingBag, 
  Car, Music, AlertCircle, ArrowUpRight, ArrowDownRight,
  Zap, CreditCard, Filter
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const CASHFLOW_STATS = {
  net: 3209.50,
  income: 8450.00,
  expense: 5240.50,
  savingsRate: "38%",
  previousNet: 2800.00,
};

const CATEGORIES = [
  { id: "cat_1", name: "Shopping", amount: 1240.00, total: 2000, icon: ShoppingBag, color: "bg-indigo-500", text: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { id: "cat_2", name: "Food & Dining", amount: 850.50, total: 1000, icon: Coffee, color: "bg-rose-500", text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { id: "cat_3", name: "Transport", amount: 420.00, total: 500, icon: Car, color: "bg-cyan-500", text: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { id: "cat_4", name: "Subscriptions", amount: 145.00, total: 150, icon: Music, color: "bg-purple-500", text: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

const INSIGHTS = [
  { id: 1, title: "Spending Spike", desc: "You've spent 24% more on Food & Dining this week compared to last week.", icon: AlertCircle, type: "warning" },
  { id: 2, title: "Great Saving", desc: "Your transportation costs are down by $80 this month. Keep it up!", icon: Zap, type: "success" },
];

// SVG Chart Paths
const CHART_INCOME_FILL = "M 0 70 Q 20 40 40 50 T 80 30 T 120 40 T 160 10 L 160 100 L 0 100 Z";
const CHART_INCOME_LINE = "M 0 70 Q 20 40 40 50 T 80 30 T 120 40 T 160 10";

const CHART_EXPENSE_FILL = "M 0 90 Q 20 75 40 85 T 80 60 T 120 70 T 160 50 L 160 100 L 0 100 Z";
const CHART_EXPENSE_LINE = "M 0 90 Q 20 75 40 85 T 80 60 T 120 70 T 160 50";

export default function CashFlowPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState("This Month");

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Cash Flow</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your income, expenses, and overall financial health.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#1a1a24] text-white font-bold text-[13px] border border-transparent dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/10 transition-all shadow-md cursor-pointer">
            <Calendar className="w-4 h-4" /> 
            <span>{timeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: THE MAIN CHARTS & STATS
            ========================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Net Flow Chart Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative group">
            
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none opacity-50 dark:opacity-30" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none opacity-50 dark:opacity-30" />
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            <div className="p-6 sm:p-8 relative z-10">
              
              {/* Header Stats */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold tracking-widest uppercase shadow-sm">
                      Net Cash Flow
                    </span>
                  </div>
                  <h2 className="text-4xl sm:text-[56px] font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                    +${CASHFLOW_STATS.net.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-4 h-4" /> +14.5% vs Last Month
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> Income
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">${CASHFLOW_STATS.income.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-10 bg-slate-200 dark:bg-white/10" />
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" /> Expense
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">${CASHFLOW_STATS.expense.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Glowing Area Chart */}
              <div className="w-full h-[220px] sm:h-[280px] relative -mx-2 mt-4 border-b border-slate-100 dark:border-white/[0.05]">
                <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="income-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" className="text-emerald-500" stopColor="currentColor" stopOpacity="0.4" />
                      <stop offset="100%" className="text-emerald-500" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="expense-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" className="text-rose-500" stopColor="currentColor" stopOpacity="0.3" />
                      <stop offset="100%" className="text-rose-500" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                    {/* Glow filter for dark mode */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Expense Chart (Background) */}
                  <path d={CHART_EXPENSE_FILL} fill="url(#expense-grad)" className="hidden dark:block" />
                  <path d={CHART_EXPENSE_FILL} fill="url(#expense-grad)" className="block dark:hidden opacity-30" />
                  <path d={CHART_EXPENSE_LINE} fill="none" stroke="currentColor" className="text-rose-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Income Chart (Foreground) */}
                  <path d={CHART_INCOME_FILL} fill="url(#income-grad)" className="hidden dark:block" />
                  <path d={CHART_INCOME_FILL} fill="url(#income-grad)" className="block dark:hidden opacity-30" />
                  <path d={CHART_INCOME_LINE} fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter={isDark ? "url(#glow)" : ""} />
                </svg>

                {/* X-Axis Labels mockup */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2">
                  {["W1", "W2", "W3", "W4"].map(week => (
                    <span key={week} className="text-[10px] font-bold text-slate-400">{week}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics (Two Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Savings Rate Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-[#0A0A0C] border border-indigo-800 dark:border-indigo-500/30 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-inner">
                  <Activity className="w-6 h-6 text-indigo-100" />
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-widest text-indigo-300/80 mb-1">Savings Rate</p>
                  <h3 className="text-4xl font-black text-white tracking-tighter">{CASHFLOW_STATS.savingsRate}</h3>
                  <p className="text-sm text-indigo-200/70 mt-2 leading-relaxed">
                    You saved 38% of your income this month. Experts recommend 20%.
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Bills Widget */}
            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] p-6 shadow-sm dark:shadow-xl transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Upcoming Bills</h3>
                </div>
                <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-1 rounded-md">Next 7 Days</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-black/50 flex items-center justify-center text-xl">🏠</div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">Rent / Mortgage</p>
                      <p className="text-[11px] text-slate-500">Due Oct 31</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-slate-900 dark:text-white">$2,100.00</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-black/50 flex items-center justify-center text-xl">⚡</div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">Con Edison</p>
                      <p className="text-[11px] text-slate-500">Due Nov 02</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-slate-900 dark:text-white">$145.20</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: CATEGORIES & INSIGHTS
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Spending by Category */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Spending</h3>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>

            <div className="p-6 space-y-6">
              {CATEGORIES.map((cat) => {
                const percent = (cat.amount / cat.total) * 100;
                
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.bg} border ${cat.border}`}>
                          <cat.icon className={`w-4 h-4 ${cat.text}`} />
                        </div>
                        <span className="text-[14px] font-bold text-slate-900 dark:text-white">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[14px] font-bold text-slate-900 dark:text-white">${cat.amount}</span>
                      </div>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${cat.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
              <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                View All Categories <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Insights Engine */}
          <div className="space-y-4">
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest px-2">AI Insights</h3>
            
            {INSIGHTS.map((insight) => (
              <div 
                key={insight.id} 
                className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 shadow-sm dark:shadow-lg transition-all hover:border-slate-300 dark:hover:border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border ${
                    insight.type === 'warning' 
                      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-500' 
                      : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-500'
                  }`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-none mb-1.5">{insight.title}</h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {insight.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}