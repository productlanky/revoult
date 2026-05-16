"use client";

import { 
  Activity, DollarSign, Users, TrendingUp, 
  Download, Loader2, Sparkles, PieChart, 
  CreditCard, Bitcoin, ArrowRightLeft, ShieldCheck
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface UserDoc {
  id: string;
  role?: string;
  plan?: string;
  kycStatus?: string;
  createdAt?: string;
}

interface TransactionDoc {
  id: string;
  amount: number;
  category: string;
  type?: string;
  createdAt: string;
}

export default function AnalyticsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Real-time Data States
  const { user, loading: authLoading } = useAuth();
  const [usersData, setUsersData] = useState<UserDoc[]>([]);
  const [transactionsData, setTransactionsData] = useState<TransactionDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // --- FIREBASE DATA FETCHING ---
  useEffect(() => {
    if (!user) return;

    // Fetch Users (Limit 500 for client-side aggregation to avoid needing complex Firestore indexes)
    const usersQ = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(500));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      setUsersData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDoc)));
    });

    // Fetch Transactions (Limit 500)
    const txQ = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(500));
    const unsubscribeTx = onSnapshot(txQ, (snapshot) => {
      setTransactionsData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionDoc)));
      setDataLoading(false); // Both listeners are attached
    });

    return () => {
      unsubscribeUsers();
      unsubscribeTx();
    };
  }, [user]);

  // --- DATA PROCESSING & AGGREGATION ---
  const analytics = useMemo(() => {
    // 1. User Distributions
    const actualCustomers = usersData.filter(u => u.role !== 'admin');
    const totalCustomers = actualCustomers.length || 1; // Prevent division by zero
    
    const plans = {
      Standard: actualCustomers.filter(u => (u.plan || 'Standard') === 'Standard').length,
      Premium: actualCustomers.filter(u => u.plan === 'Premium').length,
      Metal: actualCustomers.filter(u => u.plan === 'Metal').length,
    };

    const kyc = {
      Verified: actualCustomers.filter(u => (u.kycStatus || 'pending').toLowerCase() === 'verified').length,
      Pending: actualCustomers.filter(u => (u.kycStatus || 'pending').toLowerCase() === 'pending').length,
      Rejected: actualCustomers.filter(u => (u.kycStatus || 'pending').toLowerCase() === 'rejected').length,
    };

    // 2. Transaction Metrics
    const totalVolume = transactionsData.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
    const avgTxSize = transactionsData.length > 0 ? totalVolume / transactionsData.length : 0;
    
    const categories = {
      Crypto: transactionsData.filter(tx => tx.category === 'Crypto').length,
      Transfer: transactionsData.filter(tx => tx.category === 'Transfer').length,
      Deposit: transactionsData.filter(tx => tx.category === 'Deposit' || !tx.category).length,
    };

    // 3. Daily Volume Chart Generation (Last 14 Days)
    const last14Days = Array.from({length: 14}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyVolumes = last14Days.map(date => {
      const dayTx = transactionsData.filter(tx => tx.createdAt && tx.createdAt.startsWith(date));
      return dayTx.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
    });

    const maxDailyVol = Math.max(...dailyVolumes, 100); // Minimum scale of 100

    // SVG Path Generation for Line Chart
    // Maps points from (0, height) to (width, 0)
    const chartWidth = 1000;
    const chartHeight = 250;
    const points = dailyVolumes.map((vol, idx) => {
      const x = (idx / 13) * chartWidth;
      const y = chartHeight - ((vol / maxDailyVol) * chartHeight * 0.8); // 80% height max to leave padding
      return `${x},${y}`;
    });

    const svgPath = `M 0,${chartHeight} L ${points.map((p, i) => i === 0 ? p : `L ${p}`).join(' ')} L ${chartWidth},${chartHeight} Z`;
    const svgStroke = `M ${points.map((p, i) => i === 0 ? p : `L ${p}`).join(' ')}`;

    return { totalCustomers, plans, kyc, totalVolume, avgTxSize, categories, svgPath, svgStroke, dailyVolumes, last14Days, maxDailyVol };
  }, [usersData, transactionsData]);

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

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-700 relative">
      
      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2 whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform performance and user demographics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => showToast("Exporting Analytics Data...")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[13px] hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* --- TOP METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20">
              <DollarSign className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Transaction Volume</h4>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${analytics.totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Transaction Size</h4>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${analytics.avgTxSize.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20">
              <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Transactions</h4>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{transactionsData.length.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* --- TRANSACTION VOLUME CHART --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative flex flex-col">
        <div className="p-6 sm:p-8 flex items-center justify-between z-10 relative">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Volume Over Time <TrendingUp className="w-4 h-4 text-cyan-500" />
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Transaction volume (USD) over the last 14 days.</p>
          </div>
        </div>
        
        {analytics.totalVolume === 0 ? (
           <div className="w-full h-[250px] flex flex-col items-center justify-center mt-auto z-0 -mx-1 pb-10">
             <Activity className="w-8 h-8 text-slate-300 dark:text-white/10 mb-2" />
             <p className="text-sm font-bold text-slate-500">Not enough data to graph.</p>
           </div>
        ) : (
          <div className="w-full h-[250px] relative mt-auto z-0 -mx-1">
            <svg viewBox="0 0 1000 250" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="volChartGradDark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="volChartGradLight" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={analytics.svgPath} fill={isDark ? "url(#volChartGradDark)" : "url(#volChartGradLight)"} />
              <path d={analytics.svgStroke} fill="none" stroke="#06b6d4" strokeWidth="4" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            {/* Axis Labels Mockup */}
            <div className="absolute bottom-2 left-4 text-[10px] font-bold text-slate-400">{analytics.last14Days[0]}</div>
            <div className="absolute bottom-2 right-4 text-[10px] font-bold text-slate-400">Today</div>
          </div>
        )}
      </div>

      {/* --- DEMOGRAPHICS & BREAKDOWNS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* User Plans Distribution */}
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-6">
            <Users className="w-4 h-4 text-slate-400" /> Plan Distribution
          </h3>
          
          <div className="space-y-5">
            <DistributionBar label="Standard" value={analytics.plans.Standard} total={analytics.totalCustomers} color="bg-slate-400" />
            <DistributionBar label="Premium" value={analytics.plans.Premium} total={analytics.totalCustomers} color="bg-indigo-500" />
            <DistributionBar label="Metal" value={analytics.plans.Metal} total={analytics.totalCustomers} color="bg-amber-500" />
          </div>
        </div>

        {/* KYC Compliance Status */}
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-slate-400" /> KYC Compliance
          </h3>
          
          <div className="space-y-5">
            <DistributionBar label="Verified" value={analytics.kyc.Verified} total={analytics.totalCustomers} color="bg-emerald-500" />
            <DistributionBar label="Pending" value={analytics.kyc.Pending} total={analytics.totalCustomers} color="bg-amber-500" />
            <DistributionBar label="Rejected" value={analytics.kyc.Rejected} total={analytics.totalCustomers} color="bg-rose-500" />
          </div>
        </div>

      </div>

    </div>
  );
}

// --- MICRO COMPONENT: CSS DISTRIBUTION BAR ---
function DistributionBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{label}</span>
        <div className="text-right">
          <span className="text-[14px] font-black text-slate-900 dark:text-white">{value}</span>
          <span className="text-[11px] font-medium text-slate-500 ml-2">({percentage.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}