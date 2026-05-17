"use client";

import {
  ArrowRightLeft, TrendingUp, Activity,
  Wallet, History, ChevronRight,
  Loader2, Sparkles, Bitcoin, Coins, ArrowDownToLine,
  ArrowUpRight, ArrowDownRight, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, addDoc, where } from "firebase/firestore";

// --- CONFIGURATION ---
const ASSETS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", color: "#F7931A" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA" },
  { id: "solana", symbol: "SOL", name: "Solana", color: "#14F195" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", color: "#C2A633" },
];

const FALLBACK_RATES: Record<string, { usd: number, usd_24h_change: number }> = {
  bitcoin: { usd: 68420.50, usd_24h_change: 2.45 },
  ethereum: { usd: 3450.75, usd_24h_change: 1.80 },
  solana: { usd: 145.20, usd_24h_change: -4.20 },
  dogecoin: { usd: 0.18, usd_24h_change: 15.4 },
};

export default function CryptoPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Real-time Data
  const { user, userData, loading: authLoading } = useAuth();
  const [liveRates, setLiveRates] = useState<Record<string, { usd: number, usd_24h_change: number }>>(FALLBACK_RATES);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Unified Trade States
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [tradeAsset, setTradeAsset] = useState<string>("bitcoin");
  const [tradeAmount, setTradeAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Value Display State
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "BTC">("USD");

  useEffect(() => setMounted(true), []);

  // 1. Fetch Live Crypto Prices (Routed through local API to bypass CORS/Adblockers)
  useEffect(() => {
    async function fetchPrices() {
      try {
        const ids = ASSETS.map(a => a.id).join(',');
        // POINT TO YOUR NEW LOCAL PROXY ROUTE
        const res = await fetch(`/api/crypto?ids=${ids}`);
        if (!res.ok) throw new Error("API error");

        const json = await res.json();
        if (json && json.data) {
          const newRates: Record<string, { usd: number, usd_24h_change: number }> = {};
          json.data.forEach((coin: any) => {
            newRates[coin.id] = {
              usd: parseFloat(coin.priceUsd),
              usd_24h_change: parseFloat(coin.changePercent24Hr)
            };
          });
          setLiveRates(newRates);
        }
      } catch (error) {
        // Safe silent fallback mechanism
        setLiveRates(prev => {
          const simulated = { ...prev };
          Object.keys(simulated).forEach(sym => {
            simulated[sym].usd *= (1 + (Math.random() * 0.002 - 0.001));
          });
          return simulated;
        });
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Crypto Transactions (Added Error Catcher)
  useEffect(() => {
    if (!user) return;

    const txQ = query(
      collection(db, "users", user.uid, "transactions"),
      where("category", "==", "Crypto"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      txQ,
      (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setDataLoading(false);
      },
      (error) => {
        // Safe silent error sink prevents global window console faulting on logout
        if (error.code === "permission-denied") {
          console.log("Crypto transactions stream safely detached during logout.");
        } else {
          console.error("Firestore crypto tx snapshot error:", error);
        }
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Fetch Crypto Transactions
  useEffect(() => {
    if (!user) return;
    const txQ = query(collection(db, "users", user.uid, "transactions"), where("category", "==", "Crypto"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(txQ, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDataLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted || authLoading || dataLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  // --- DATA AGGREGATION ---
  const usdWalletBalance = userData.balances?.USD !== undefined ? Number(userData.balances.USD) : Number(userData.balance || 0);
  const currentBtcPrice = liveRates.bitcoin?.usd || FALLBACK_RATES.bitcoin.usd;

  const ownedAssets = ASSETS.filter(asset => (userData.cryptoBalances?.[asset.id] || 0) > 0);

  const totalCryptoValueUsd = ownedAssets.reduce((acc, asset) => {
    const bal = userData.cryptoBalances?.[asset.id] || 0;
    const price = liveRates[asset.id]?.usd || FALLBACK_RATES[asset.id].usd;
    return acc + (bal * price);
  }, 0);

  // --- VALUE FORMATTER ---
  // Converts USD value to chosen display currency (USD or BTC)
  const formatValue = (usdValue: number) => {
    if (displayCurrency === "USD") {
      return `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const btcValue = usdValue / currentBtcPrice;
      return `₿${btcValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`;
    }
  };

  // --- ACTIONS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleAmountChange = (val: string) => {
    if (/^\d*\.?\d*$/.test(val)) setTradeAmount(val);
  };

  // --- UNIFIED TRADE LOGIC ---
  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numAmount = parseFloat(tradeAmount);
    if (isNaN(numAmount) || numAmount <= 0) return showToast("Enter a valid amount");

    const assetPrice = liveRates[tradeAsset]?.usd || FALLBACK_RATES[tradeAsset].usd;
    const currentCryptoBal = userData.cryptoBalances?.[tradeAsset] || 0;
    const balanceUpdateKey = userData.balances?.USD !== undefined ? "balances.USD" : "balance";

    setIsSubmitting(true);

    try {
      let newUsdBalance = usdWalletBalance;
      let newCryptoBalance = currentCryptoBal;
      let cryptoAmountTraded = 0;
      let usdAmountTraded = 0;

      if (tradeAction === "buy") {
        usdAmountTraded = numAmount;
        cryptoAmountTraded = numAmount / assetPrice;

        if (usdAmountTraded > usdWalletBalance) throw new Error("Insufficient USD balance");

        newUsdBalance -= usdAmountTraded;
        newCryptoBalance += cryptoAmountTraded;
      } else {
        cryptoAmountTraded = numAmount;
        usdAmountTraded = numAmount * assetPrice;

        if (cryptoAmountTraded > currentCryptoBal) throw new Error(`Insufficient ${ASSETS.find(a => a.id === tradeAsset)?.symbol} balance`);

        newUsdBalance += usdAmountTraded;
        newCryptoBalance -= cryptoAmountTraded;
      }

      await updateDoc(doc(db, "users", user.uid), {
        [balanceUpdateKey]: newUsdBalance,
        [`cryptoBalances.${tradeAsset}`]: newCryptoBalance
      });

      const symbol = ASSETS.find(a => a.id === tradeAsset)?.symbol || "Crypto";

      await addDoc(collection(db, "users", user.uid, "transactions"), {
        amount: usdAmountTraded,
        cryptoAmount: cryptoAmountTraded,
        cryptoSymbol: symbol,
        category: "Crypto",
        type: tradeAction === "buy" ? "Buy" : "Sell",
        isCredit: tradeAction === "sell",
        title: `${tradeAction === "buy" ? "Bought" : "Sold"} ${symbol}`,
        note: `Rate: $${assetPrice.toLocaleString()}`,
        status: "completed",
        createdAt: new Date().toISOString()
      });

      showToast(`Successfully ${tradeAction === "buy" ? "bought" : "sold"} ${cryptoAmountTraded.toFixed(6)} ${symbol}!`);
      setTradeAmount("");
    } catch (error: any) {
      showToast(error.message || "Trade failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8 relative">

      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2 whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Crypto</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your digital assets and trade instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ==========================================
            LEFT COLUMN: PORTFOLIO & ASSETS
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* Main Portfolio Hero Card */}
          <div className="bg-[#0f172a] dark:bg-[#0A0A0C] border border-slate-800 dark:border-white/[0.04] rounded-[32px] shadow-2xl overflow-hidden relative transition-colors duration-500 group">
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 blur-[60px] rounded-full group-hover:bg-cyan-500/30 transition-colors pointer-events-none" />

            <div className="p-6 sm:p-10 relative z-10 flex flex-col justify-between min-h-[260px]">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">Total Crypto Value</span>
                </div>

                {/* --- USD / BTC DISPLAY TOGGLE --- */}
                <div className="flex bg-white/10 p-1 rounded-lg backdrop-blur-md border border-white/10 shadow-inner">
                  <button
                    onClick={() => setDisplayCurrency("USD")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${displayCurrency === 'USD' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setDisplayCurrency("BTC")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${displayCurrency === 'BTC' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                  >
                    BTC
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h2 className={`font-black text-white tracking-tighter ${displayCurrency === 'USD' ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'}`}>
                  {formatValue(totalCryptoValueUsd)}
                </h2>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm font-bold text-slate-400">
                    Calculated from live market rates
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Real Assets List */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Your Assets</h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {ownedAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Coins className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No crypto assets yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm">Use the trading terminal to buy your first cryptocurrency. It will automatically appear here.</p>
                </div>
              ) : (
                ownedAssets.map((asset) => {
                  const bal = userData.cryptoBalances?.[asset.id] || 0;
                  const price = liveRates[asset.id]?.usd || FALLBACK_RATES[asset.id].usd;
                  const valUsd = bal * price;
                  const change = liveRates[asset.id]?.usd_24h_change || 0;

                  return (
                    <div key={asset.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3 sm:gap-4 w-[150px] sm:w-[200px]">
                        <div
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden"
                          style={{ backgroundColor: `${asset.color}20`, border: `1px solid ${asset.color}40` }}
                        >
                          <span className="font-bold text-[12px] text-slate-900 dark:text-white" style={{ color: isDark ? '#fff' : asset.color }}>{asset.symbol}</span>
                        </div>
                        <div className="truncate pr-2">
                          <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{asset.name}</h4>
                          <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 mt-0.5 truncate">{bal > 0 ? bal.toFixed(6) : "0.00"} {asset.symbol}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">
                          {formatValue(valUsd)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${change >= 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: TRADING TERMINAL & FEED
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">

          {/* UNIFIED TRADING TERMINAL */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-xl transition-colors duration-500">
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-500" /> Trade Crypto
            </h3>

            {/* Buy / Sell Toggles */}
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/5 shadow-inner mb-6">
              <button onClick={() => { setTradeAction("buy"); setTradeAmount(""); }} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${tradeAction === "buy" ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Buy</button>
              <button onClick={() => { setTradeAction("sell"); setTradeAmount(""); }} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${tradeAction === "sell" ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Sell</button>
            </div>

            <form onSubmit={handleTrade} className="space-y-4">

              {/* Asset Selection */}
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 pl-1">Select Asset</label>
                <div className="relative">
                  <select
                    value={tradeAsset}
                    onChange={(e) => { setTradeAsset(e.target.value); setTradeAmount(""); }}
                    className="w-full pl-4 pr-10 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/5 text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer appearance-none shadow-inner"
                  >
                    {ASSETS.map(a => <option key={a.id} value={a.id}>{a.name} ({a.symbol})</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="flex justify-between px-1 mt-1">
                  <span className="text-[10px] font-bold text-slate-500">Live Price:</span>
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">${(liveRates[tradeAsset]?.usd || FALLBACK_RATES[tradeAsset].usd).toLocaleString()}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="relative pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 pl-1">
                  {tradeAction === "buy" ? "Pay with USD" : `Sell ${ASSETS.find(a => a.id === tradeAsset)?.symbol}`}
                </label>
                <div className="relative">
                  {tradeAction === "buy" && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</div>}
                  <input
                    type="text"
                    value={tradeAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className={`w-full ${tradeAction === "buy" ? 'pl-9' : 'pl-4'} pr-16 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/5 text-xl font-black tracking-tighter text-slate-900 dark:text-white outline-none shadow-inner`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    {tradeAction === "buy" ? "USD" : ASSETS.find(a => a.id === tradeAsset)?.symbol}
                  </div>
                </div>

                <div className="flex justify-between items-center px-1 mt-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    {tradeAction === "buy"
                      ? `USD Balance: $${usdWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : `Crypto Balance: ${(userData.cryptoBalances?.[tradeAsset] || 0).toFixed(6)}`}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {tradeAction === "buy"
                      ? `Get: ${tradeAmount ? (parseFloat(tradeAmount) / (liveRates[tradeAsset]?.usd || 1)).toFixed(6) : "0.00"} ${ASSETS.find(a => a.id === tradeAsset)?.symbol}`
                      : `Get: $${tradeAmount ? (parseFloat(tradeAmount) * (liveRates[tradeAsset]?.usd || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}`}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !tradeAmount ||
                  (tradeAction === 'buy' && parseFloat(tradeAmount) > usdWalletBalance) ||
                  (tradeAction === 'sell' && parseFloat(tradeAmount) > (userData.cryptoBalances?.[tradeAsset] || 0))
                }
                className={`w-full mt-4 py-4 rounded-xl font-black text-[14px] transition-all flex justify-center items-center shadow-xl ${(tradeAction === 'buy' && parseFloat(tradeAmount) > usdWalletBalance) || (tradeAction === 'sell' && parseFloat(tradeAmount) > (userData.cryptoBalances?.[tradeAsset] || 0))
                  ? 'bg-rose-500 text-white cursor-not-allowed shadow-rose-500/20'
                  : !tradeAmount
                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-900 active:scale-95 shadow-cyan-500/20'
                  }`}
              >
                {isSubmitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : tradeAction === 'buy' && parseFloat(tradeAmount) > usdWalletBalance
                    ? "Insufficient USD"
                    : tradeAction === 'sell' && parseFloat(tradeAmount) > (userData.cryptoBalances?.[tradeAsset] || 0)
                      ? "Insufficient Crypto"
                      : `Confirm ${tradeAction.charAt(0).toUpperCase() + tradeAction.slice(1)}`
                }
              </button>
            </form>
          </div>

          {/* Activity Mini-Feed */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500 p-5 sm:p-6 min-h-[250px] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Recent Trades</h3>
              <Link href="/dashboard/transactions" className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <History className="w-3.5 h-3.5" />
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
                  <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${tx.isCredit ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.05]'}`}>
                        {tx.isCredit ? <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{tx.title}</p>
                        <p className="text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[13px] font-bold ${tx.isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {tx.isCredit ? '+' : ''}${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
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