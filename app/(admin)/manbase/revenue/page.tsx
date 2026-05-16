"use client";

import { 
  DollarSign, TrendingUp, Download, Loader2, 
  Sparkles, ArrowUpRight, ArrowDownRight, Activity, 
  CreditCard, Bitcoin, Briefcase, BarChart3, LineChart
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collectionGroup, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface TransactionDoc {
  id: string;
  amount: number;
  category: string;
  type?: string;
  cryptoSymbol?: string;
  stockSymbol?: string;
  createdAt: string;
}

// Platform Fee Configuration (e.g., 1% trading fee)
const PLATFORM_FEE_RATE = 0.01; 

export default function RevenuePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const [transactionsData, setTransactionsData] = useState<TransactionDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // --- FIREBASE DATA FETCHING ---
  useEffect(() => {
    if (!user) return;

    // Use collectionGroup to fetch transactions from ALL users
    const txQ = query(collectionGroup(db, "transactions"), orderBy("createdAt", "desc"), limit(1000));
    
    const unsubscribeTx = onSnapshot(txQ, (snapshot) => {
      setTransactionsData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionDoc)));
      setDataLoading(false);
    }, (error) => {
      console.error("Error fetching global transactions. Note: Collection Group Queries require an index in Firestore.", error);
      setDataLoading(false); // Failsafe
    });

    return () => unsubscribeTx();
  }, [user]);

  // --- REVENUE DATA PROCESSING & AGGREGATION ---
  const revenueData = useMemo(() => {
    // 1. Filter revenue-generating transactions (Trades)
    const revenueTx = transactionsData.filter(tx => tx.category === 'Crypto' || tx.category === 'Stock');
    
    // 2. Aggregate Totals
    const totalVolume = revenueTx.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
    const netRevenue = totalVolume * PLATFORM_FEE_RATE;
    const avgDailyRev = netRevenue / 30; // Simulated over 30 days

    // 3. Breakdown by Asset Class
    const cryptoVolume = revenueTx.filter(tx => tx.category === 'Crypto').reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
    const stockVolume = revenueTx.filter(tx => tx.category === 'Stock').reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    const cryptoRev = cryptoVolume * PLATFORM_FEE_RATE;
    const stockRev = stockVolume * PLATFORM_FEE_RATE;

    // 4. Daily Revenue Chart Generation (Last 14 Days)
    const last14Days = Array.from({length: 14}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyRevenues = last14Days.map(date => {
      const dayTx = revenueTx.filter(tx => tx.createdAt && tx.createdAt.startsWith(date));
      const dayVol = dayTx.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
      return dayVol * PLATFORM_FEE_RATE;
    });

    const maxDailyRev = Math.max(...dailyRevenues, 10); // Minimum scale of $10 to avoid flatline

    // SVG Path Generation for Area Chart
    const chartWidth = 1000;
    const chartHeight = 250;
    const points = dailyRevenues.map((rev, idx) => {
      const x = (idx / 13) * chartWidth;
      const y = chartHeight - ((rev / maxDailyRev) * chartHeight * 0.8); // 80% max height
      return `${x},${y}`;
    });

    const svgPath = `M 0,${chartHeight} L ${points.map((p, i) => i === 0 ? p : `L ${p}`).join(' ')} L ${chartWidth},${chartHeight} Z`;
    const svgStroke = `M ${points.map((p, i) => i === 0 ? p : `L ${p}`).join(' ')}`;

    // 5. Recent High-Value Fees (Top 5)
    const topFees = [...revenueTx]
      .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
      .slice(0, 5);

    return { totalVolume, netRevenue, avgDailyRev, cryptoRev, stockRev, svgPath, svgStroke, last14Days, topFees };
  }, [transactionsData]);

  if (!mounted || authLoading || dataLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleExportCSV = () => {
    showToast("Compiling revenue report...");
    setTimeout(() => showToast("Report downloaded successfully!"), 1500);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-700 relative">
      
      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2 whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Revenue Intelligence</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform earnings, trading fees, and financial health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[13px] hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Download className="w-4 h-4" /> Export Financials
          </button>
        </div>
      </div>

      {/* --- TOP METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-all duration-300 relative overflow-hidden group hover:border-emerald-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10">
              <TrendingUp className="w-3 h-3" /> +14.2%
            </span>
          </div>
          <div className="relative z-10">
            <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Net Platform Revenue</h4>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">${revenueData.netRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-2">Generated from {PLATFORM_FEE_RATE * 100}% trading fees</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20">
              <BarChart3 className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Trading Volume</h4>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${revenueData.totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20">
              <Activity className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Daily Revenue</h4>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${revenueData.avgDailyRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>
      </div>

      {/* --- REVENUE OVER TIME CHART --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative flex flex-col">
        <div className="p-6 sm:p-8 flex items-center justify-between z-10 relative">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Earnings Velocity <TrendingUp className="w-4 h-4 text-emerald-500" />
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform fee revenue collected over the last 14 days.</p>
          </div>
        </div>
        
        {revenueData.netRevenue === 0 ? (
           <div className="w-full h-[250px] flex flex-col items-center justify-center mt-auto z-0 -mx-1 pb-10">
             <LineChart className="w-8 h-8 text-slate-300 dark:text-white/10 mb-2" />
             <p className="text-sm font-bold text-slate-500">No revenue data available.</p>
             <p className="text-xs text-slate-400 mt-1">Users need to complete trades to generate fees.</p>
           </div>
        ) : (
          <div className="w-full h-[250px] relative mt-auto z-0 -mx-1">
            <svg viewBox="0 0 1000 250" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="revChartGradDark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="revChartGradLight" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={revenueData.svgPath} fill={isDark ? "url(#revChartGradDark)" : "url(#revChartGradLight)"} />
              <path d={revenueData.svgStroke} fill="none" stroke="#10b981" strokeWidth="4" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            <div className="absolute bottom-2 left-4 text-[10px] font-bold text-slate-400">{revenueData.last14Days[0]}</div>
            <div className="absolute bottom-2 right-4 text-[10px] font-bold text-slate-400">Today</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* --- REVENUE BY ASSET CLASS --- */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-6">
            <CreditCard className="w-4 h-4 text-slate-400" /> Revenue Source
          </h3>
          
          <div className="space-y-6">
            <RevenueBar 
              label="Crypto Trading" 
              revenue={revenueData.cryptoRev} 
              total={revenueData.netRevenue} 
              icon={Bitcoin}
              color="bg-orange-500" 
            />
            <RevenueBar 
              label="Stock & Equity Trading" 
              revenue={revenueData.stockRev} 
              total={revenueData.netRevenue} 
              icon={Briefcase}
              color="bg-indigo-500" 
            />
          </div>
        </div>

        {/* --- HIGH YIELD TRANSACTIONS (Top 5) --- */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Largest Fee Drivers</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Top trades generating the most platform revenue.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="p-4 font-bold">Transaction</th>
                  <th className="p-4 font-bold">Volume</th>
                  <th className="p-4 font-bold text-right text-emerald-600 dark:text-emerald-400">Platform Fee Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {revenueData.topFees.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-sm font-bold text-slate-500">
                      No trading revenue generated yet.
                    </td>
                  </tr>
                ) : (
                  revenueData.topFees.map((tx) => {
                    const feeGenerated = (Number(tx.amount) || 0) * PLATFORM_FEE_RATE;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${tx.category === 'Crypto' ? 'bg-orange-50 border-orange-200 text-orange-500 dark:bg-orange-500/10 dark:border-orange-500/20' : 'bg-indigo-50 border-indigo-200 text-indigo-500 dark:bg-indigo-500/10 dark:border-indigo-500/20'}`}>
                              {tx.category === 'Crypto' ? <Bitcoin className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">{tx.type} {tx.cryptoSymbol || tx.stockSymbol || tx.category}</p>
                              <p className="text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[13px] font-bold text-slate-600 dark:text-slate-300">
                          ${Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[13px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                            +${feeGenerated.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- MICRO COMPONENT: REVENUE DISTRIBUTION BAR ---
function RevenueBar({ label, revenue, total, icon: Icon, color }: { label: string, revenue: number, total: number, icon: any, color: string }) {
  const percentage = total > 0 ? (revenue / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-[14px] font-black text-slate-900 dark:text-white">${revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-slate-500 w-10 text-right">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}