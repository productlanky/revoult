"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  TrendingUp, TrendingDown, Activity, Calendar,
  PieChart, Coffee, ShoppingBag, Car, AlertCircle,
  ArrowUpRight, Zap, Landmark, Building2, Plane, Loader2
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface Transaction {
  id: string;
  amount: number;
  category: string;
  createdAt: string;
  isCredit: boolean;
  title?: string;
  name?: string;
}

// --- DYNAMIC CATEGORY MAPPER ---
const CATEGORY_MAP: Record<string, any> = {
  "Groceries": { icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500", lightBg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  "Shopping": { icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500", lightBg: "bg-blue-500/10", border: "border-blue-500/20" },
  "Dining": { icon: Coffee, color: "text-amber-500", bg: "bg-amber-500", lightBg: "bg-amber-500/10", border: "border-amber-500/20" },
  "Internal": { icon: Landmark, color: "text-slate-500", bg: "bg-slate-500", lightBg: "bg-slate-500/10", border: "border-slate-500/20" },
  "Travel": { icon: Plane, color: "text-indigo-500", bg: "bg-indigo-500", lightBg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  "Transport": { icon: Car, color: "text-rose-500", bg: "bg-rose-500", lightBg: "bg-rose-500/10", border: "border-rose-500/20" },
  "Other": { icon: Activity, color: "text-cyan-500", bg: "bg-cyan-500", lightBg: "bg-cyan-500/10", border: "border-cyan-500/20" }
};

export default function CashFlowPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Real-time Data States
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  // Fetch Transactions
  useEffect(() => {
    if (!user) return;
    const txQ = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(200));
    const unsubscribeTx = onSnapshot(txQ, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      setLoading(false);
    });
    return () => unsubscribeTx();
  }, [user]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted || authLoading || loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  // --- DATA AGGREGATION ENGINE ---
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let currentIncome = 0;
  let currentExpense = 0;
  let prevIncome = 0;
  let prevExpense = 0;

  let largestExpense: Transaction | null = null;

  const categoryTotals: Record<string, number> = {};

  const weeklyData = [
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
  ];

  // CHANGED: Using a standard for...of loop so TypeScript can track mutations
  for (const tx of transactions) {
    const date = new Date(tx.createdAt);
    const m = date.getMonth();
    const y = date.getFullYear();
    const d = date.getDate();

    if (m === currentMonth && y === currentYear) {
      if (tx.isCredit) {
        currentIncome += tx.amount;
        const weekIdx = Math.min(Math.floor((d - 1) / 7), 3);
        weeklyData[weekIdx].income += tx.amount;
      } else {
        currentExpense += tx.amount;
        const weekIdx = Math.min(Math.floor((d - 1) / 7), 3);
        weeklyData[weekIdx].expense += tx.amount;

        const cat = tx.category || "Other";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;

        if (!largestExpense || tx.amount > largestExpense.amount) {
          largestExpense = tx;
        }
      }
    } else if (m === lastMonth && y === lastMonthYear) {
      if (tx.isCredit) prevIncome += tx.amount;
      else prevExpense += tx.amount;
    }
  }

  // Derived Metrics
  const currentNet = currentIncome - currentExpense;
  const prevNet = prevIncome - prevExpense;
  const netChange = prevNet !== 0 ? ((currentNet - prevNet) / Math.abs(prevNet)) * 100 : (currentNet > 0 ? 100 : 0);
  const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;

  const sortedCategories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  // --- DYNAMIC SVG CHART GENERATOR ---
  const maxWeekly = Math.max(...weeklyData.map(w => Math.max(w.income, w.expense)), 1); // Avoid division by zero

  // Creates perfectly flat lines if there's zero data
  const getPoints = (type: 'income' | 'expense') => {
    return weeklyData.map((w, i) => {
      const x = (i / 3) * 160;
      const y = maxWeekly === 1 && w[type] === 0 ? 98 : 95 - ((w[type] / maxWeekly) * 85);
      return `${x},${y}`;
    });
  };

  const incomePoints = getPoints('income');
  const expensePoints = getPoints('expense');

  // Curve smoothing logic using basic SVG Bézier parameters
  const createSmoothPath = (points: string[]) => {
    if (points.length === 0) return "";
    let path = `M ${points[0]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i].split(',').map(Number);
      const p2 = points[i + 1].split(',').map(Number);
      // Create horizontal control points for a smooth wave
      const cp1x = p1[0] + (p2[0] - p1[0]) / 2;
      const cp2x = cp1x;
      path += ` C ${cp1x},${p1[1]} ${cp2x},${p2[1]} ${p2[0]},${p2[1]}`;
    }
    return path;
  };

  const CHART_INCOME_LINE = createSmoothPath(incomePoints);
  const CHART_INCOME_FILL = `${CHART_INCOME_LINE} L 160,100 L 0,100 Z`;
  const CHART_EXPENSE_LINE = createSmoothPath(expensePoints);
  const CHART_EXPENSE_FILL = `${CHART_EXPENSE_LINE} L 160,100 L 0,100 Z`;

  const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Cash Flow</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your income, expenses, and overall financial health.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#1a1a24] text-white font-bold text-[13px] border border-transparent dark:border-white/10 shadow-md">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{monthLabel}</span>
          </div>
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
                    {currentNet >= 0 ? "+" : "-"}${Math.abs(currentNet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`flex items-center gap-1 text-[13px] font-bold ${netChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {netChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(netChange).toFixed(1)}% vs Last Month
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> Income
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">${currentIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-px h-10 bg-slate-200 dark:bg-white/10" />
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" /> Expense
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">${currentExpense.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Sleek SVG Chart Terminal */}
              <div className="w-full h-[220px] sm:h-[280px] relative -mx-2 mt-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] overflow-hidden">

                {/* Background Grid Lines for Terminal Aesthetic */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-10 pointer-events-none">
                  <div className="w-full h-px bg-slate-900 dark:bg-white" />
                  <div className="w-full h-px bg-slate-900 dark:bg-white" />
                  <div className="w-full h-px bg-slate-900 dark:bg-white" />
                  <div className="w-full h-px bg-slate-900 dark:bg-white" />
                </div>

                <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="w-full h-full overflow-visible z-10 relative">
                  <defs>
                    <linearGradient id="income-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" className="text-emerald-500" stopColor="currentColor" stopOpacity="0.4" />
                      <stop offset="100%" className="text-emerald-500" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="expense-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" className="text-rose-500" stopColor="currentColor" stopOpacity="0.3" />
                      <stop offset="100%" className="text-rose-500" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Expense Chart */}
                  <path d={CHART_EXPENSE_FILL} fill="url(#expense-grad)" className="opacity-50 dark:opacity-80" />
                  <path d={CHART_EXPENSE_LINE} fill="none" stroke="currentColor" className="text-rose-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Income Chart (Foreground) */}
                  <path d={CHART_INCOME_FILL} fill="url(#income-grad)" className="opacity-50 dark:opacity-80" />
                  <path d={CHART_INCOME_LINE} fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter={isDark ? "url(#glow)" : ""} />
                </svg>

                <div className="absolute bottom-2 left-0 right-0 flex justify-between px-6 z-20">
                  {["Week 1", "Week 2", "Week 3", "Week 4"].map(week => (
                    <span key={week} className="text-[10px] font-bold text-slate-500 bg-white/50 dark:bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">{week}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics (Two Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Premium Savings Rate Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-[#0A0A0C] border border-indigo-800 dark:border-indigo-500/30 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                    <Landmark className="w-6 h-6 text-indigo-100" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200/50">Analytics</span>
                </div>
                <div>
                  <p className="text-[12px] font-black uppercase tracking-widest text-indigo-300/80 mb-1">Savings Rate</p>
                  <h3 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
                    {savingsRate.toFixed(1)}%
                  </h3>
                  <p className="text-sm text-indigo-200/70 mt-2 leading-relaxed">
                    You saved {savingsRate.toFixed(0)}% of your income this month. {savingsRate >= 20 ? "Excellent job!" : "Experts recommend aiming for 20%."}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Largest Expense Widget */}
            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] p-6 shadow-sm dark:shadow-xl transition-colors flex flex-col justify-between group hover:border-rose-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Largest Expense</h3>
                </div>
              </div>

              {largestExpense ? (
                <div className="space-y-3">
                  <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10">
                    <h4 className="text-[16px] font-bold text-slate-900 dark:text-white truncate mb-1">
                      {/* ADDED OPTIONAL CHAINING HERE */}
                      {largestExpense?.title || largestExpense?.name || "Unknown"}
                    </h4>
                    <p className="text-[28px] font-black tracking-tighter bg-gradient-to-r from-rose-600 to-rose-400 dark:from-rose-500 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                      {/* ADDED OPTIONAL CHAINING HERE */}
                      ${largestExpense?.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                      {/* ADDED OPTIONAL CHAINING HERE */}
                      {new Date(largestExpense?.createdAt || "").toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {largestExpense?.category}
                    </p>
                  </div>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed px-1">
                    Accounts for <strong className="text-slate-900 dark:text-white">
                      {/* ADDED OPTIONAL CHAINING HERE */}
                      {(((largestExpense?.amount || 0) / currentExpense) * 100).toFixed(0)}%
                    </strong> of your total spending.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <span className="text-3xl mb-3 opacity-50">🍃</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No expenses yet</p>
                  <p className="text-xs text-slate-500 mt-1">Your wallet is taking a break.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: CATEGORIES (DYNAMIC)
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">

          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Spending Profile</h3>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>

            <div className="p-6 space-y-6">
              {sortedCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No spending data to categorize this month.</p>
                </div>
              ) : (
                sortedCategories.slice(0, 6).map((cat) => {
                  const percent = currentExpense > 0 ? (cat.amount / currentExpense) * 100 : 0;
                  const mapData = CATEGORY_MAP[cat.name] || CATEGORY_MAP["Other"];
                  const IconComp = mapData.icon;

                  return (
                    <div key={cat.name} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mapData.lightBg} border ${mapData.border}`}>
                            <IconComp className={`w-4 h-4 ${mapData.color}`} />
                          </div>
                          <span className="text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">{cat.name}</span>
                        </div>
                        <div className="text-right flex flex-col">
                          <span className="text-[14px] font-bold text-slate-900 dark:text-white">${cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>

                      {/* Dynamic Percentage Bar */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full ${mapData.bg} transition-all duration-1000 ease-out`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 text-right mt-1 tracking-widest uppercase">{percent.toFixed(1)}% of total</p>
                    </div>
                  );
                })
              )}
            </div>

            {sortedCategories.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
                <Link href="/dashboard/analytics" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                  View Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}