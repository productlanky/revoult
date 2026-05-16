"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  BarChart3, TrendingDown, TrendingUp, Calendar, 
  ShoppingCart, Coffee, Zap, Plane, ChevronDown, 
  ArrowUpRight, Target, Activity, MoreHorizontal,
  CreditCard, Loader2, Landmark, Building2
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

// --- DYNAMIC CATEGORY MAPPER ---
const CATEGORY_MAP: Record<string, any> = {
  "Groceries": { icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500", lightBg: "bg-emerald-500/10" },
  "Shopping": { icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500", lightBg: "bg-blue-500/10" },
  "Dining": { icon: Coffee, color: "text-amber-500", bg: "bg-amber-500", lightBg: "bg-amber-500/10" },
  "Travel": { icon: Plane, color: "text-indigo-500", bg: "bg-indigo-500", lightBg: "bg-indigo-500/10" },
  "Transport": { icon: Zap, color: "text-rose-500", bg: "bg-rose-500", lightBg: "bg-rose-500/10" },
  "Income": { icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500", lightBg: "bg-emerald-500/10" },
  "Internal": { icon: Landmark, color: "text-slate-500", bg: "bg-slate-500", lightBg: "bg-slate-500/10" },
  "Other": { icon: Activity, color: "text-cyan-500", bg: "bg-cyan-500", lightBg: "bg-cyan-500/10" }
};

export default function AnalyticsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading } = useAuth();
  
  // State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]); // New state for real budgets
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Fetch all transactions and budgets to aggregate locally
  useEffect(() => {
    if (!user) return;
    
    // Transactions Listener
    const txQ = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"));
    const unsubscribeTx = onSnapshot(txQ, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Budgets Listener
    const budgetQ = query(collection(db, "users", user.uid, "budgets"), orderBy("createdAt", "desc"));
    const unsubscribeBudgets = onSnapshot(budgetQ, (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeTx();
      unsubscribeBudgets();
    };
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

  // 1. Filter for selected year & only look at SPENDING (debits)
  const yearTxs = transactions.filter(tx => {
    if (tx.isCredit) return false;
    return new Date(tx.createdAt).getFullYear() === selectedYear;
  });

  const prevYearTxs = transactions.filter(tx => {
    if (tx.isCredit) return false;
    return new Date(tx.createdAt).getFullYear() === selectedYear - 1;
  });

  // 2. Calculate Monthly Spend Array for the Bar Chart
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySpendData = months.map((month, index) => {
    const amount = yearTxs
      .filter(tx => new Date(tx.createdAt).getMonth() === index)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { month, amount };
  });

  const maxSpend = Math.max(...monthlySpendData.map(d => d.amount), 1);

  // 3. Calculate Totals & Averages
  const ytdSpent = yearTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const prevYtdSpent = prevYearTxs.reduce((sum, tx) => sum + tx.amount, 0);
  
  const currentMonthNum = selectedYear === new Date().getFullYear() ? new Date().getMonth() + 1 : 12;
  const avgPerMonth = ytdSpent / currentMonthNum;
  
  let yoyChange = 0;
  if (prevYtdSpent > 0) yoyChange = ((ytdSpent - prevYtdSpent) / prevYtdSpent) * 100;

  // 4. Calculate Top Merchants
  const merchantMap: Record<string, { amount: number, count: number, category: string }> = {};
  yearTxs.forEach(tx => {
    const name = tx.title || tx.name || "Unknown";
    if (!merchantMap[name]) merchantMap[name] = { amount: 0, count: 0, category: tx.category || "Other" };
    merchantMap[name].amount += tx.amount;
    merchantMap[name].count += 1;
  });
  
  const topMerchants = Object.entries(merchantMap)
    .map(([name, data]) => ({ id: name, name, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  // 5. Calculate Real Budget Usage (Current Month Only, Dynamic from DB)
  const currentMonthTxs = yearTxs.filter(tx => new Date(tx.createdAt).getMonth() === new Date().getMonth());
  const dynamicBudgets = budgets.map(b => {
    const spent = currentMonthTxs
      .filter(tx => tx.category === b.category)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { ...b, spent };
  });

  // --- ACTIONS ---
  const handleDownloadCSV = () => {
    const headers = ["Date", "Description", "Category", "Amount", "Type"];
    const rows = transactions.map(tx => [
      new Date(tx.createdAt).toLocaleDateString(),
      `"${tx.title || tx.name}"`, 
      tx.category,
      tx.amount,
      tx.isCredit ? "Credit" : "Debit"
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Annual_transactions_${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const ghostHeights = [30, 45, 20, 60, 80, 45, 55, 30, 70, 40, 60, 50];

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Deep dive into your spending habits and budgets.</p>
        </div>
        
        {/* Functional Year Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#1a1a24] text-white font-bold text-[13px] border border-transparent dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/10 transition-all shadow-md cursor-pointer"
          >
            <Calendar className="w-4 h-4" /> 
            <span>{selectedYear}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          
          {isYearDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              {[2026, 2025, 2024].map(year => (
                <button 
                  key={year}
                  onClick={() => { setSelectedYear(year); setIsYearDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: MAIN CHARTS & MERCHANTS
            ========================================== */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Functional Hero Chart Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative group p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none opacity-50 dark:opacity-30 transition-colors" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
                <div>
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2">Total Spent ({selectedYear})</h3>
                  <div className="flex items-end gap-3">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                      ${ytdSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#111115] p-2 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a24] shadow-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Avg / Month</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">${avgPerMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Vs Last Year</p>
                    <p className={`text-sm font-bold flex items-center ${yoyChange > 0 ? 'text-rose-500' : ytdSpent === 0 ? 'text-slate-400' : 'text-emerald-500'}`}>
                      {yoyChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />} 
                      {Math.abs(yoyChange).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Data Bar Chart Area */}
              <div className="w-full h-[240px] relative mt-8">
                
                {/* GHOST EMPTY STATE OVERLAY */}
                {ytdSpent === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/40 dark:bg-[#0A0A0C]/40 backdrop-blur-[2px] rounded-2xl">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 border border-slate-200 dark:border-white/10 shadow-sm">
                      <BarChart3 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">No spending in {selectedYear}</h4>
                    <p className="text-xs text-slate-500 mt-1">Your insights will appear here once you make a transaction.</p>
                  </div>
                )}

                <div className={`w-full h-full relative flex items-end justify-between gap-2 sm:gap-4 transition-opacity duration-500 ${ytdSpent === 0 ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                  {monthlySpendData.map((data, idx) => {
                    const isActive = activeMonth === idx;
                    const heightPercent = ytdSpent === 0 ? ghostHeights[idx] : Math.max((data.amount / maxSpend) * 100, 2);
                    
                    return (
                      <div 
                        key={data.month} 
                        onClick={() => ytdSpent > 0 && setActiveMonth(idx)}
                        className="relative flex flex-col items-center justify-end w-full h-full group cursor-pointer"
                      >
                        {ytdSpent > 0 && (
                          <div className={`absolute -top-10 whitespace-nowrap px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg transition-all duration-300 z-10 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                            ${data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        )}

                        <div 
                          className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out ${
                            isActive && ytdSpent > 0
                              ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                              : 'bg-slate-200 dark:bg-white/10 group-hover:bg-cyan-500/50'
                          }`}
                          style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                        />
                        
                        <span className={`mt-3 text-[11px] font-bold transition-colors ${isActive && ytdSpent > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                          {data.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Top Merchants Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Top Merchants ({selectedYear})</h3>
              <Link href="/dashboard/transactions" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5">
                <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-white" />
              </Link>
            </div>
            
            <div className="p-2">
              {topMerchants.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/5 flex items-center justify-center mb-3">
                    <ShoppingCart className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No merchant data available.</p>
                </div>
              ) : (
                topMerchants.map((merchant, idx) => {
                  const mapData = CATEGORY_MAP[merchant.category] || CATEGORY_MAP["Other"];
                  const IconComp = mapData.icon;
                  return (
                    <div key={merchant.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#111115] rounded-[24px] cursor-pointer group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${mapData.lightBg}`}>
                            <IconComp className={`w-5 h-5 ${mapData.color}`} />
                          </div>
                          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-[#0A0A0C]">
                            {idx + 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-none">{merchant.name}</h4>
                          <p className="text-[12px] text-slate-500 mt-1.5 font-medium">{merchant.category} • {merchant.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] font-black text-slate-900 dark:text-white">
                          ${merchant.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {topMerchants.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-[#0A0A0C]">
                <Link href="/dashboard/transactions" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                  View All Merchants <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: BUDGETS & INSIGHTS
            ========================================== */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
          
          {/* Dynamic Budget Trackers from Firestore */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Active Budgets</h3>
              <Target className="w-5 h-5 text-slate-400" />
            </div>

            {dynamicBudgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Target className="w-10 h-10 text-slate-200 dark:text-slate-800 mb-3" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">No active budgets.</p>
                <Link href="/dashboard/budgets" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  Create a budget
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {dynamicBudgets.map((budget) => {
                  const percent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                  const isNearing = percent > 85;
                  const mapping = CATEGORY_MAP[budget.category] || CATEGORY_MAP["Other"];
                  
                  return (
                    <div key={budget.category}>
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">{budget.category}</h4>
                          <p className="text-[11px] font-medium text-slate-500 mt-1">
                            ${budget.spent.toLocaleString(undefined, {maximumFractionDigits:0})} spent of ${budget.limit}
                          </p>
                        </div>
                        <span className={`text-[12px] font-black ${isNearing ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                          {percent.toFixed(0)}%
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${isNearing ? 'bg-rose-500' : mapping.bg}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {dynamicBudgets.length > 0 && (
              <Link href="/dashboard/budgets" className="mt-8 py-4 rounded-[16px] bg-slate-50 hover:bg-slate-100 dark:bg-[#111115] dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-[13px] transition-all flex justify-center">
                Manage Budgets
              </Link>
            )}
          </div>

          {/* AI Spending Insight */}
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
              
              <h3 className="text-xl font-bold tracking-tight">Data Analyzed</h3>
              <p className="text-sm text-indigo-100/80 mt-3 leading-relaxed">
                {topMerchants.length > 0 ? (
                  <>Based on your {selectedYear} history, your highest spending category is <strong className="text-white">{topMerchants[0]?.category}</strong> at <strong className="text-white">${topMerchants[0]?.amount.toLocaleString(undefined, {maximumFractionDigits:0})}</strong>.</>
                ) : (
                  "We need a bit more data to generate personalized AI spending insights for this year."
                )}
              </p>
              
              <Link href="/dashboard/subscriptions" className="mt-8 px-5 py-3 rounded-xl bg-white text-indigo-950 font-black text-[12px] hover:bg-slate-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] w-full flex justify-center">
                Review Spending
              </Link>
            </div>
          </div>

          {/* Functional CSV Download */}
          <button onClick={handleDownloadCSV} className="w-full bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] p-6 shadow-sm flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-left">
                <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Download CSV Report</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Export {selectedYear} transaction data</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>

        </div>
      </div>
    </div>
  );
}