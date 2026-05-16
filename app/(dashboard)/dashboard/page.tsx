"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  ArrowRightLeft, ArrowDownToLine, Send, 
  CreditCard, TrendingUp, History, ChevronRight, 
  Landmark, ShoppingBag, Coffee, Building2, Eye,
  Activity, ArrowUpRight, Zap, Loader2, Plane, Car, Snowflake, Globe,
  Info, CheckCircle2, Clock, XCircle
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit, updateDoc, doc } from "firebase/firestore";

// --- DYNAMIC CATEGORY MAPPER ---
const CATEGORY_MAP: Record<string, any> = {
  "Groceries": { icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  "Income": { icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
  "Dining": { icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10" },
  "Internal": { icon: Landmark, color: "text-slate-500", bg: "bg-slate-500/10" },
  "Travel": { icon: Plane, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  "Transport": { icon: Car, color: "text-rose-500", bg: "bg-rose-500/10" },
  "Other": { icon: Activity, color: "text-cyan-500", bg: "bg-cyan-500/10" }
};

// --- SYMBOLS & FALLBACK RATES (Base: USD) ---
const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$" };

const FALLBACK_RATES = {
  fiat: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.5, CAD: 1.36, AUD: 1.52 }
};

type CurrencyKey = keyof typeof CURRENCY_SYMBOLS;

type CardData = {
  id: string;
  type?: string;
  status?: string;
  [key: string]: any;
};

export default function DashboardOverview() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // UI States
  const [showBalance, setShowBalance] = useState(true);
  const [isFreezing, setIsFreezing] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState<CurrencyKey>("USD");
  
  // Live Rates State
  const [liveRates, setLiveRates] = useState(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);

  // Real-time Auth & User Data
  const { user, userData, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [virtualCard, setVirtualCard] = useState<any>(null);
  const [txLoading, setTxLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  // 1. Fetch Live Exchange Rates (Fiat Only)
  useEffect(() => {
    async function fetchLiveRates() {
      try {
        // Fetch Fiat rates with USD base
        const fiatRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CAD,AUD");
        const fiatData = await fiatRes.json();
        
        setLiveRates({
          fiat: { USD: 1, ...fiatData.rates }
        });
      } catch (error) {
        console.warn("Failed to fetch live rates, using fallback values.", error);
      } finally {
        setRatesLoading(false);
      }
    }
    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, 60000); // Sync every minute
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch recent transactions
  useEffect(() => {
    if (!user) return;
    const txRef = collection(db, "users", user.uid, "transactions");
    const q = query(txRef, orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTxLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Fetch User's Virtual Card
  useEffect(() => {
    if (!user) return;
    const cardsRef = collection(db, "users", user.uid, "cards");
    const q = query(cardsRef, limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCards: CardData[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<CardData, 'id'>) }));
      const vCard = fetchedCards.find(c => (c.type || '').toLowerCase() === 'virtual') || fetchedCards[0];
      setVirtualCard(vCard || null);
      setCardLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted || authLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  // --- ACTIONS ---
  const handleFreezeCard = async () => {
    if (!user || !virtualCard) return;
    setIsFreezing(true);
    try {
      const newStatus = virtualCard.status === 'Frozen' ? 'Active' : 'Frozen';
      await updateDoc(doc(db, "users", user.uid, "cards", virtualCard.id), { 
        status: newStatus,
        freezeReason: newStatus === 'Frozen' ? 'User triggered freeze via dashboard' : ''
      });
    } catch (error) {
      console.error("Failed to update card state.");
    } finally {
      setIsFreezing(false);
    }
  };

  // --- LIVE MATH & TRANSLUCENT NET WORTH CALCULATIONS ---
  const currentSymbol = CURRENCY_SYMBOLS[activeCurrency];
  
  // Extract Raw Balances from document
  const balUsd = userData.balances?.USD || userData.balance || 0;
  const balEur = userData.balances?.EUR || 0;
  const balGbp = userData.balances?.GBP || 0;
  const balJpy = userData.balances?.JPY || 0;
  const balCad = userData.balances?.CAD || 0;
  const balAud = userData.balances?.AUD || 0;

  // Normalize balances down to USD Base for conversion stability
  const eurUsd = balEur / liveRates.fiat.EUR;
  const gbpUsd = balGbp / liveRates.fiat.GBP;
  const jpyUsd = balJpy / liveRates.fiat.JPY;
  const cadUsd = balCad / liveRates.fiat.CAD;
  const audUsd = balAud / liveRates.fiat.AUD;

  const totalNetWorthUsd = balUsd + eurUsd + gbpUsd + jpyUsd + cadUsd + audUsd;

  // Conversion utilities (USD -> Display Account Type Selected)
  const convertAmount = (amountUsd: number) => amountUsd * liveRates.fiat[activeCurrency as keyof typeof liveRates.fiat];
  
  const formatConverted = (amountUsd: number) => {
    const converted = convertAmount(amountUsd);
    const fractionDigits = activeCurrency === 'JPY' ? 0 : 2;
    return converted.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "Recent";
    const date = new Date(isoString);
    if (date.toDateString() === new Date().toDateString()) return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Compile active accounts array to justify math inside the UI transparency display
  const assetBreakdown = [
    { label: 'USD', raw: balUsd, usdValue: balUsd, symbol: '$' },
    { label: 'EUR', raw: balEur, usdValue: eurUsd, symbol: '€' },
    { label: 'GBP', raw: balGbp, usdValue: gbpUsd, symbol: '£' },
    { label: 'JPY', raw: balJpy, usdValue: jpyUsd, symbol: '¥' },
    { label: 'CAD', raw: balCad, usdValue: cadUsd, symbol: 'C$' },
    { label: 'AUD', raw: balAud, usdValue: audUsd, symbol: 'A$' },
  ].filter(asset => asset.raw > 0);

  // Cash Flow Calculation (Current Month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let calculatedEarned = 0;
  let calculatedSpent = 0;

  transactions.forEach(tx => {
    const txDate = new Date(tx.createdAt);
    // Only count completed/processed transactions in cash flow
    const st = (tx.status || 'pending').toLowerCase();
    if (st === 'completed' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
      if (tx.isCredit) calculatedEarned += tx.amount;
      else calculatedSpent += tx.amount;
    }
  });

  const earned = calculatedEarned > 0 ? calculatedEarned : (userData.monthlyEarned || 0);
  const spent = calculatedSpent > 0 ? calculatedSpent : (userData.monthlySpent || 0);
  
  const totalFlow = earned + spent;
  const earnedPercent = totalFlow > 0 ? (earned / totalFlow) * 100 : 0;
  const spentPercent = totalFlow > 0 ? (spent / totalFlow) * 100 : 0;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8 relative">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">
            Hello, {userData.firstName || "User"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is your financial summary for today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold">
          {ratesLoading ? <Loader2 className="w-4 h-4 animate-spin text-cyan-500" /> : <Activity className="w-4 h-4 text-emerald-500" />} 
          {ratesLoading ? "Syncing live forex rates..." : "Forex Engine Online"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: HERO & ACTIVITY
            ========================================== */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Main Net Worth / Hero Card */}
          <div className="bg-[#0A0A0C] rounded-[32px] shadow-2xl overflow-hidden relative group p-8 sm:p-10 border border-white/10">
            <div className="absolute top-[-50%] left-[-20%] w-[120%] h-[150%] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[100%] h-[120%] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
              <div className="flex justify-between items-start">
                
                {/* CURRENCY SELECTOR */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest hidden sm:inline-block">Total Balance</span>
                  <select 
                    value={activeCurrency}
                    onChange={(e) => setActiveCurrency(e.target.value as CurrencyKey)}
                    className="bg-transparent text-[11px] font-bold text-white uppercase tracking-widest outline-none cursor-pointer sm:border-l border-white/20 sm:pl-3"
                  >
                    {Object.keys(CURRENCY_SYMBOLS).map(c => (
                      <option key={c} value={c} className="text-black">{c}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 mb-6">
                <h2 className="text-5xl sm:text-[72px] font-black tracking-tighter text-white drop-shadow-2xl flex items-center gap-2">
                  <span className="text-white/50 font-normal">{currentSymbol}</span>
                  {showBalance ? formatConverted(totalNetWorthUsd) : "••••••"}
                </h2>
                <div className="flex items-center gap-2 mt-4">
                  <span className="flex items-center gap-1 text-[14px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <TrendingUp className="w-4 h-4" /> +{currentSymbol}{userData.monthlyChange ? formatConverted(userData.monthlyChange) : "0.00"}
                  </span>
                  <span className="text-[13px] text-white/50 font-medium">vs last month</span>
                </div>
              </div>

              {/* TRANSPARENT PORTFOLIO BREAKDOWN (Fiat Only) */}
              {assetBreakdown.length > 0 && showBalance && (
                <div className="mb-8 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Active Accounts Breakdown</span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {assetBreakdown.map(asset => {
                      const decimalPlaces = asset.label === 'JPY' ? 0 : 2;
                      return (
                        <div key={asset.label} className="flex flex-col bg-black/20 backdrop-blur-sm border border-white/5 px-3 py-2 rounded-xl shrink-0">
                          <span className="text-[11px] font-bold text-white/70 flex items-center gap-1">
                            {asset.symbol} {asset.label}
                          </span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-black text-white">
                              {asset.raw.toLocaleString(undefined, {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces})}
                            </span>
                            {asset.label !== 'USD' && (
                              <span className="text-[10px] text-cyan-400/80 font-medium tracking-wide">
                                ≈ ${asset.usdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Functional Action Dock Links */}
              <div className="grid grid-cols-4 gap-3 sm:gap-4 mt-auto">
                <HeroAction icon={ArrowDownToLine} label="Add Money" link="/dashboard/wallets" />
                <HeroAction icon={Send} label="Transfer" link="/dashboard/send" />
                <HeroAction icon={ArrowRightLeft} label="Exchange" link="/dashboard/exchange" highlight />
                <HeroAction icon={Globe} label="Global Transfer" link="/dashboard/global" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
              <Link href="/dashboard/transactions" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                <History className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
            
            {txLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-cyan-500 animate-spin" /></div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Activity className="w-10 h-10 text-slate-300 dark:text-white/10 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No recent transactions</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {/* Only show the 4 most recent on the dashboard home */}
                {transactions.slice(0, 4).map((tx) => {
                  const mapping = CATEGORY_MAP[tx.category] || CATEGORY_MAP["Other"];
                  const IconComp = mapping.icon;
                  const st = (tx.status || 'pending').toLowerCase();
                  
                  return (
                    <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#111115]/50 cursor-pointer group transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[20px] ${mapping.bg} border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
                          <IconComp className={`w-5 h-5 ${mapping.color}`} />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight mb-1">{tx.title || tx.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-500">{tx.category} • {formatDate(tx.createdAt)}</span>
                          </div>
                          
                          {/* STATUS BADGE */}
                          <div className="flex items-center gap-1 mt-1.5">
                            {st === 'completed' ? (
                              <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</span></>
                            ) : st === 'rejected' ? (
                              <><XCircle className="w-3 h-3 text-rose-500" /> <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Rejected</span></>
                            ) : (
                              <><Clock className="w-3 h-3 text-amber-500" /> <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</span></>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-[16px] font-black ${tx.isCredit ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                          {tx.isCredit ? '+' : '-'}{currentSymbol}{formatConverted(tx.amount)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {transactions.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-[#0A0A0C]">
                <Link href="/dashboard/transactions" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 transition-colors flex items-center gap-1">
                  View All Transactions <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: CARDS & WIDGETS
            ========================================== */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
          
          {/* Active Card Widget */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Virtual Card</h3>
              <Link href="/dashboard/cards" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700">Manage</Link>
            </div>

            {cardLoading ? (
              <div className="w-full aspect-[1.586/1] rounded-[20px] bg-slate-100 dark:bg-white/5 animate-pulse flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : !virtualCard ? (
              <div className="w-full aspect-[1.586/1] rounded-[20px] bg-slate-50 dark:bg-[#111115] border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center p-6 text-center">
                <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">No Virtual Card</p>
                <p className="text-[11px] text-slate-500 mt-1 mb-4">Generate a virtual card for safe online transaction usage.</p>
                <Link href="/dashboard/cards/virtual" className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/20">
                  Create Card
                </Link>
              </div>
            ) : (
              <div className={`w-full aspect-[1.586/1] rounded-[20px] bg-gradient-to-br from-[#1a2942] via-[#111b2b] to-[#050912] p-5 relative overflow-hidden shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer group hover:scale-[1.02] transition-all duration-500 border border-white/[0.08] ${virtualCard.status === 'Frozen' ? 'grayscale opacity-70' : ''}`}>
                <div className="absolute top-[-100%] left-[-50%] w-[200%] h-[300%] bg-gradient-to-tr from-transparent via-cyan-500/[0.05] to-transparent rotate-[25deg] pointer-events-none group-hover:translate-x-[50%] transition-transform duration-1000" />
                <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
                
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div className="text-[12px] font-black italic tracking-widest text-cyan-400 drop-shadow-md">VIRTUAL</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{userData.plan || "Standard"}</span>
                  </div>
                  <div>
                    <p className="text-[16px] font-mono tracking-[0.2em] text-white/90 drop-shadow-md">
                      **** **** **** {virtualCard.last4 || "1234"}
                    </p>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white/60 truncate max-w-[150px]">
                        {userData.firstName} {userData.lastName}
                      </span>
                      {virtualCard.status === 'Frozen' ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">FROZEN</span>
                      ) : (
                        <div className="flex -space-x-2 shrink-0">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/80 mix-blend-screen" />
                          <div className="w-6 h-6 rounded-full bg-blue-500/80 mix-blend-screen" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {virtualCard && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Link href="/dashboard/cards" className="py-3 rounded-[16px] bg-slate-50 hover:bg-slate-100 dark:bg-[#111115] dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                  <CreditCard className="w-4 h-4" /> Details
                </Link>
                
                <button 
                  onClick={handleFreezeCard}
                  disabled={isFreezing}
                  className={`py-3 rounded-[16px] border flex items-center justify-center gap-2 text-sm font-bold transition-colors ${
                    virtualCard.status === 'Frozen'
                    ? 'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400' 
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#111115] dark:hover:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isFreezing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : virtualCard.status === 'Frozen' ? (
                    <><Snowflake className="w-4 h-4" /> Unfreeze</>
                  ) : (
                    <><Zap className="w-4 h-4" /> Freeze</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Cash Flow Widget */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Monthly Cash Flow</h3>
              <Link href="/dashboard/analytics" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5">
                <ArrowUpRight className="w-4 h-4 text-slate-500 dark:text-white" />
              </Link>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-500">Earned</span>
                  <span className="font-bold text-emerald-500">{currentSymbol}{formatConverted(earned)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${earnedPercent}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-500">Spent</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentSymbol}{formatConverted(spent)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-slate-800 dark:bg-white rounded-full transition-all duration-1000 ease-out`} style={{ width: `${spentPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

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
      <span className="text-[11px] sm:text-[12px] font-bold text-white/80 group-hover:text-white transition-colors tracking-wide text-center">
        {label}
      </span>
    </Link>
  );
}