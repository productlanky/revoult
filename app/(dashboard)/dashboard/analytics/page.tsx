"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  BarChart3, TrendingDown, TrendingUp, Calendar, 
  ShoppingCart, Coffee, Zap, Plane, ChevronDown, 
  ArrowUpRight, Target, Activity, MoreHorizontal,
  CreditCard
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const MONTHLY_SPEND = [
  { month: "Jan", amount: 4200 },
  { month: "Feb", amount: 3800 },
  { month: "Mar", amount: 5100 },
  { month: "Apr", amount: 4600 },
  { month: "May", amount: 6200 },
  { month: "Jun", amount: 3900 },
  { month: "Jul", amount: 4800 },
  { month: "Aug", amount: 5500 },
  { month: "Sep", amount: 4100 },
  { month: "Oct", amount: 3200 }, // Current month (partial)
];

const TOP_MERCHANTS = [
  { id: "m1", name: "Amazon", category: "Shopping", amount: 1245.50, transactions: 14, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "m2", name: "Whole Foods", category: "Groceries", amount: 840.20, transactions: 6, icon: Coffee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "m3", name: "Delta Airlines", category: "Travel", amount: 650.00, transactions: 1, icon: Plane, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "m4", name: "Uber", category: "Transport", amount: 320.45, transactions: 12, icon: Zap, color: "text-slate-500", bg: "bg-slate-500/10" },
];

const BUDGETS = [
  { id: "b1", category: "Dining Out", spent: 450, limit: 500, color: "bg-rose-500" },
  { id: "b2", category: "Entertainment", spent: 120, limit: 300, color: "bg-purple-500" },
  { id: "b3", category: "Shopping", spent: 850, limit: 1000, color: "bg-cyan-500" },
];

export default function AnalyticsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeMonth, setActiveMonth] = useState(7); // Default to August for demo

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted) return null;

  const maxSpend = Math.max(...MONTHLY_SPEND.map(d => d.amount));

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Deep dive into your spending habits and budgets.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#1a1a24] text-white font-bold text-[13px] border border-transparent dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/10 transition-all shadow-md cursor-pointer">
          <Calendar className="w-4 h-4" /> 
          <span>2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: MAIN CHARTS & MERCHANTS
            ========================================== */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Hero Chart Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative group p-6 sm:p-8">
            
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none opacity-50 dark:opacity-30 transition-colors" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
                <div>
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2">Total Spent (YTD)</h3>
                  <div className="flex items-end gap-3">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                      $45,400.00
                    </h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#111115] p-2 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a24] shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Avg / Month</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">$4,540</p>
                  </div>
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Vs Last Year</p>
                    <p className="text-sm font-bold text-emerald-500 flex items-center"><TrendingDown className="w-3 h-3 mr-1" /> 12%</p>
                  </div>
                </div>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="w-full h-[240px] relative flex items-end justify-between gap-2 sm:gap-4 mt-8">
                {MONTHLY_SPEND.map((data, idx) => {
                  const isActive = activeMonth === idx;
                  const heightPercent = (data.amount / maxSpend) * 100;
                  
                  return (
                    <div 
                      key={data.month} 
                      onClick={() => setActiveMonth(idx)}
                      className="relative flex flex-col items-center justify-end w-full h-full group cursor-pointer"
                    >
                      {/* Tooltip (visible on hover or active) */}
                      <div className={`absolute -top-10 whitespace-nowrap px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                        ${data.amount}
                      </div>

                      {/* The Bar */}
                      <div 
                        className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out ${
                          isActive 
                            ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                            : 'bg-slate-200 dark:bg-white/10 group-hover:bg-cyan-500/50'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      
                      {/* Label */}
                      <span className={`mt-3 text-[11px] font-bold transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Merchants Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Top Merchants</h3>
              <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5">
                <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-white" />
              </button>
            </div>
            
            <div className="p-2">
              {TOP_MERCHANTS.map((merchant, idx) => (
                <div key={merchant.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#111115] rounded-[24px] cursor-pointer group transition-colors">
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${merchant.bg}`}>
                        <merchant.icon className={`w-5 h-5 ${merchant.color}`} />
                      </div>
                      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-[#0A0A0C]">
                        {idx + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-none">{merchant.name}</h4>
                      <p className="text-[12px] text-slate-500 mt-1.5 font-medium">{merchant.category} • {merchant.transactions} transactions</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[16px] font-black text-slate-900 dark:text-white">
                      ${merchant.amount.toFixed(2)}
                    </p>
                  </div>

                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-[#0A0A0C]">
              <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                View All Merchants <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: BUDGETS & INSIGHTS
            ========================================== */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
          
          {/* Budget Trackers */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Active Budgets</h3>
              <Target className="w-5 h-5 text-slate-400" />
            </div>

            <div className="space-y-8">
              {BUDGETS.map((budget) => {
                const percent = (budget.spent / budget.limit) * 100;
                const isNearing = percent > 85;
                
                return (
                  <div key={budget.id}>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">{budget.category}</h4>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">
                          ${budget.spent} spent of ${budget.limit}
                        </p>
                      </div>
                      <span className={`text-[12px] font-black ${isNearing ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                        {percent.toFixed(0)}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isNearing ? 'bg-rose-500' : budget.color}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-8 py-4 rounded-[16px] bg-slate-50 hover:bg-slate-100 dark:bg-[#111115] dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-[13px] transition-all">
              Manage Budgets
            </button>
          </div>

          {/* AI Spending Insight (Premium Glass Card) */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black border border-indigo-500/20 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/30 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/40 transition-colors" />
            
            <div className="relative z-10 text-white">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                    <Activity className="w-6 h-6 text-indigo-200" />
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-indigo-200">
                  AI Insight
                </span>
              </div>
              
              <h3 className="text-xl font-bold tracking-tight">Subscription Creep</h3>
              <p className="text-sm text-indigo-100/80 mt-3 leading-relaxed">
                We noticed your recurring payments have increased by <strong className="text-white">$45.00</strong> this month. You have 3 inactive subscriptions you might want to cancel.
              </p>
              
              <button className="mt-8 px-5 py-3 rounded-xl bg-white text-indigo-950 font-black text-[12px] hover:bg-slate-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] w-full">
                Review Subscriptions
              </button>
            </div>
          </div>

          {/* Mini Action Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] p-6 shadow-sm flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Download CSV Report</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Export your year-to-date data</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </div>

        </div>
      </div>
    </div>
  );
}