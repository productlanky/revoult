"use client";

import {
  TrendingUp, Search, Plus, ArrowRightLeft, ArrowUpRight,
  ArrowDownRight, PieChart, ChevronRight, Star, Loader2,
  Sparkles, X, Activity, LineChart, Briefcase
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, doc, updateDoc, addDoc, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// --- ASSET CONFIGURATION & FALLBACKS ---
const PORTFOLIO_HISTORY = "M 0 100 C 20 80, 40 120, 60 90 C 80 60, 100 110, 120 70 C 140 30, 160 80, 180 40 C 200 0, 220 50, 240 20 L 240 150 L 0 150 Z";
const PORTFOLIO_LINE = "M 0 100 C 20 80, 40 120, 60 90 C 80 60, 100 110, 120 70 C 140 30, 160 80, 180 40 C 200 0, 220 50, 240 20";

const STOCKS = [
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", sparkline: "M 0 40 Q 10 35 20 20 T 40 10 T 60 25 T 80 5" },
  { symbol: "AAPL", name: "Apple Inc.", sparkline: "M 0 10 Q 10 15 20 30 T 40 20 T 60 35 T 80 40" },
  { symbol: "MSFT", name: "Microsoft Corp.", sparkline: "M 0 30 Q 10 20 20 25 T 40 15 T 60 20 T 80 10" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sparkline: "M 0 40 Q 10 30 20 20 T 40 10 T 60 5 T 80 0" },
  { symbol: "TSLA", name: "Tesla Inc.", sparkline: "M 0 10 Q 10 20 20 35 T 40 40 T 60 30 T 80 20" }
];

const FALLBACK_PRICES: Record<string, { c: number, dp: number }> = {
  VOO: { c: 472.50, dp: 1.24 },
  AAPL: { c: 168.34, dp: -0.85 },
  MSFT: { c: 420.55, dp: 0.70 },
  NVDA: { c: 822.40, dp: 4.28 },
  TSLA: { c: 175.22, dp: -2.07 }
};

export default function StocksPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Auth & Database State
  const { user, userData, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);

  // Real-time Market Data
  const [livePrices, setLivePrices] = useState<Record<string, { c: number, dp: number }>>(FALLBACK_PRICES);

  // UI States
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [selectedStock, setSelectedStock] = useState("VOO");
  const [tradeAmount, setTradeAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => setMounted(true), []);

  // 1. Fetch Real-Time Market Data via Yahoo Finance Proxy
  useEffect(() => {
    async function fetchPrices() {
      try {
        const promises = STOCKS.map(async (stock) => {
          // Encoded Yahoo Finance Chart API URL
          const url = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=2d`);
          // Bypassing CORS to get real Wall Street data
          const res = await fetch(`https://api.allorigins.win/get?url=${url}`);
          if (!res.ok) throw new Error("Proxy error");

          const data = await res.json();
          const parsed = JSON.parse(data.contents);
          const result = parsed.chart.result[0];

          const currentPrice = result.meta.regularMarketPrice;
          const previousClose = result.meta.chartPreviousClose || result.meta.previousClose;
          const dp = ((currentPrice - previousClose) / previousClose) * 100;

          return { symbol: stock.symbol, c: currentPrice, dp };
        });

        const results = await Promise.all(promises);
        const newPrices: Record<string, { c: number, dp: number }> = {};
        results.forEach(r => { newPrices[r.symbol] = { c: r.c, dp: r.dp }; });
        setLivePrices(newPrices);

      } catch (err) {
        console.warn("Using simulated live market data due to proxy limitations.");
        // Algorithmic simulation to keep the UI moving if the free proxy rate-limits us
        setLivePrices(prev => {
          const simulated = { ...prev };
          Object.keys(simulated).forEach(sym => {
            simulated[sym].c *= (1 + (Math.random() * 0.004 - 0.002));
          });
          return simulated;
        });
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // Fetch every 15s
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Recent Activity
  useEffect(() => {
    if (!user) return;
    const txQ = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(15));
    const unsubscribe = onSnapshot(txQ, (snapshot) => {
      const allTx = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(allTx.filter((tx: any) => tx.category === "Stock"));
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

  // --- DATA AGGREGATION ---
  const fiatBalance = userData.balances?.USD !== undefined ? Number(userData.balances.USD) : Number(userData.balance || 0);

  // Combine Firebase holdings with Live Data
  const holdingsData = STOCKS.map(stock => {
    const shares = userData.stockBalances?.[stock.symbol] || 0;
    const priceData = livePrices[stock.symbol] || FALLBACK_PRICES[stock.symbol];

    return {
      ...stock,
      shares,
      price: priceData.c,
      totalValue: shares * priceData.c,
      change: `${priceData.dp >= 0 ? '+' : ''}${priceData.dp.toFixed(2)}%`,
      isUp: priceData.dp >= 0
    };
  }).filter(stock => stock.shares > 0 || stock.symbol === "VOO" || stock.symbol === "AAPL");

  const totalPortfolioValue = holdingsData.reduce((acc, curr) => acc + curr.totalValue, 0);

  // Top Movers List
  const topMoversData = STOCKS.map(stock => {
    const priceData = livePrices[stock.symbol] || FALLBACK_PRICES[stock.symbol];
    return {
      symbol: stock.symbol,
      name: stock.name,
      price: `$${priceData.c.toFixed(2)}`,
      change: `${priceData.dp >= 0 ? '+' : ''}${priceData.dp.toFixed(2)}%`,
      isUp: priceData.dp >= 0
    };
  }).sort((a, b) => Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change)));

  // --- ACTIONS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAmountChange = (val: string) => {
    if (/^\d*\.?\d{0,2}$/.test(val) || val === "") setTradeAmount(val);
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const usdAmount = parseFloat(tradeAmount);
    if (isNaN(usdAmount) || usdAmount <= 0) return showToast("Enter a valid amount");

    const currentShares = userData.stockBalances?.[selectedStock] || 0;
    const stockPrice = livePrices[selectedStock]?.c || FALLBACK_PRICES[selectedStock].c;
    const sharesToTrade = usdAmount / stockPrice;

    if (tradeAction === "buy" && usdAmount > fiatBalance) return showToast("Insufficient USD balance");
    if (tradeAction === "sell" && sharesToTrade > currentShares) return showToast("Insufficient shares to sell");

    setIsSubmitting(true);
    try {
      const balanceUpdateKey = userData.balances?.USD !== undefined ? "balances.USD" : "balance";

      const newFiatBalance = tradeAction === "buy" ? fiatBalance - usdAmount : fiatBalance + usdAmount;
      const newShareBalance = tradeAction === "buy" ? currentShares + sharesToTrade : currentShares - sharesToTrade;

      // 1. Update DB Balances
      await updateDoc(doc(db, "users", user.uid), {
        [balanceUpdateKey]: newFiatBalance,
        [`stockBalances.${selectedStock}`]: newShareBalance
      });

      // 2. Record Transaction with Completed Status
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        amount: usdAmount,
        shares: sharesToTrade,
        stockSymbol: selectedStock,
        category: "Stock",
        type: tradeAction === "buy" ? "Buy" : "Sell",
        isCredit: tradeAction === "sell",
        title: `${tradeAction === "buy" ? "Bought" : "Sold"} ${selectedStock}`,
        note: `Executed at $${stockPrice.toFixed(2)}/share`,
        status: "completed",
        createdAt: new Date().toISOString()
      });

      showToast(`Successfully ${tradeAction === "buy" ? "purchased" : "sold"} ${selectedStock}!`);
      setIsTradeOpen(false);
      setTradeAmount("");
    } catch (error) {
      showToast("Transaction failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8 relative">

      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- TRADE MODAL --- */}
      {isTradeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0A0A0C] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 relative animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#111115]">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trade Stocks</h3>
                <p className="text-xs text-slate-500">Commission-free execution</p>
              </div>
              <button onClick={() => setIsTradeOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/5 shadow-inner">
                <button onClick={() => setTradeAction("buy")} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${tradeAction === "buy" ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Buy</button>
                <button onClick={() => setTradeAction("sell")} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${tradeAction === "sell" ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Sell</button>
              </div>

              <form onSubmit={handleTrade} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Asset</label>
                    <select
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer appearance-none"
                    >
                      {STOCKS.map(a => <option key={a.symbol} value={a.symbol}>{a.name} ({a.symbol})</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Amount in USD</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</div>
                    <input
                      autoFocus
                      type="text"
                      value={tradeAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-xl font-black tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-400 outline-none shadow-inner"
                    />
                  </div>

                  <div className="flex justify-between items-center px-1 mt-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {tradeAction === "buy" ? `Available: $${fiatBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `Owned: ${(userData.stockBalances?.[selectedStock] || 0).toFixed(4)} shares`}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                      Market Price: ${(livePrices[selectedStock]?.c || FALLBACK_PRICES[selectedStock].c).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-end px-1 mt-1">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Est. Shares: {tradeAmount ? (parseFloat(tradeAmount) / (livePrices[selectedStock]?.c || FALLBACK_PRICES[selectedStock].c)).toFixed(6) : "0.00"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !tradeAmount || (tradeAction === 'buy' && parseFloat(tradeAmount) > fiatBalance) || (tradeAction === 'sell' && (parseFloat(tradeAmount) / (livePrices[selectedStock]?.c || FALLBACK_PRICES[selectedStock].c)) > (userData.stockBalances?.[selectedStock] || 0))}
                  className={`w-full mt-2 py-4 rounded-2xl font-black text-[15px] transition-all flex justify-center items-center ${((tradeAction === 'buy' && parseFloat(tradeAmount) > fiatBalance) || (tradeAction === 'sell' && (parseFloat(tradeAmount) / (livePrices[selectedStock]?.c || FALLBACK_PRICES[selectedStock].c)) > (userData.stockBalances?.[selectedStock] || 0))) ? 'bg-rose-500 text-white cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl active:scale-[0.98]'}`}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : tradeAction === 'buy' && parseFloat(tradeAmount) > fiatBalance ? "Insufficient USD" : tradeAction === 'sell' && (parseFloat(tradeAmount) / (livePrices[selectedStock]?.c || FALLBACK_PRICES[selectedStock].c)) > (userData.stockBalances?.[selectedStock] || 0) ? "Insufficient Shares" : `Confirm ${tradeAction.toUpperCase()}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Wealth & Trading</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your portfolio, track markets, and trade instantly.</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => showToast("Search coming soon")} className="p-2 sm:p-2.5 rounded-full sm:rounded-xl bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
            <Search className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>

          <Link href="/dashboard/wallets" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plus className="w-4 h-4" /> Deposit Funds
          </Link>
          <Link href="/dashboard/wallets" className="sm:hidden p-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ==========================================
            LEFT COLUMN: MAIN PORTFOLIO & CHART (lg:col-span-8)
            ========================================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* Main Chart Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative transition-colors duration-500">
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />

            <div className="p-6 sm:p-8 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    Total Portfolio <Briefcase className="w-4 h-4" />
                  </p>
                  <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                    ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold">
                      <TrendingUp className="w-3.5 h-3.5" /> Market Tracking
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/dashboard/exchange" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors">
                    <ArrowRightLeft className="w-4 h-4" />
                  </Link>
                  <button onClick={() => setIsTradeOpen(true)} className="px-4 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold text-[13px] hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors">
                    Trade
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full h-[220px] sm:h-[280px] relative z-0 mt-4">
              <svg viewBox="0 0 240 150" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="chartGradientDark" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="chartGradientLight" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={PORTFOLIO_HISTORY} fill="url(#chartGradientDark)" className="hidden dark:block" />
                <path d={PORTFOLIO_HISTORY} fill="url(#chartGradientLight)" className="block dark:hidden" />
                <path d={PORTFOLIO_LINE} fill="none" stroke="#10b981" strokeWidth="2.5" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </svg>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center p-1 rounded-full bg-white/80 dark:bg-[#111115]/80 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] shadow-lg z-10">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((time, idx) => (
                <button
                  key={time}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${idx === 2
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Mobile Trade Button */}
            <div className="sm:hidden absolute bottom-6 right-4 z-10">
              <button onClick={() => setIsTradeOpen(true)} className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-[13px] shadow-lg shadow-cyan-500/30">
                Trade
              </button>
            </div>
          </div>

          {/* Holdings List */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Your Assets</h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {holdingsData.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No assets yet</p>
                </div>
              ) : (
                holdingsData.map((asset) => (
                  <div key={asset.symbol} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer">

                    <div className="flex items-center gap-3 sm:gap-4 w-[140px] sm:w-[200px]">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                        <span className="font-bold text-[12px] text-slate-700 dark:text-slate-300">{asset.symbol.slice(0, 2)}</span>
                      </div>
                      <div className="truncate pr-2">
                        <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{asset.symbol}</h4>
                        <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 mt-0.5 truncate">{asset.name}</p>
                      </div>
                    </div>

                    <div className="hidden sm:block w-[100px] h-[30px]">
                      <svg viewBox="0 0 80 40" preserveAspectRatio="none" className="w-full h-full">
                        <path d={asset.sparkline} fill="none" stroke={asset.isUp ? "#10b981" : "#f43f5e"} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="flex flex-col items-end">
                      <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                        ${asset.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-medium text-slate-500">{asset.shares.toFixed(4)} shs</span>
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${asset.isUp ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'}`}>
                          {asset.change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: DISCOVERY & TOP MOVERS (lg:col-span-4)
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">

          {/* Top Movers */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Live Market</h3>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-col gap-3">
              {topMoversData.map((stock) => (
                <div key={stock.symbol} className="w-[140px] sm:w-full shrink-0 snap-center p-3 rounded-[16px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer">

                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0 shadow-sm">
                      <span className="font-bold text-[10px] text-slate-800 dark:text-slate-300">{stock.symbol.slice(0, 1)}</span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-none">{stock.symbol}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[60px] sm:max-w-[100px]">{stock.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{stock.price}</p>
                    <span className={`text-[10px] font-bold ${stock.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {stock.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500 p-5 sm:p-6 min-h-[250px] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Recent Orders</h3>
              <Link href="/dashboard/transactions" className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <LineChart className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4 flex-1">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-6">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-white/10 mb-2" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No history yet</p>
                </div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${tx.isCredit ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.05]'}`}>
                        {tx.isCredit ? <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{tx.title}</p>
                        <p className="text-[11px] text-slate-500">{tx.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[13px] font-bold ${tx.isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {tx.isCredit ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}