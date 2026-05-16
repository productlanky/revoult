"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, ArrowRightLeft, Send, ArrowDownToLine,
    History, ChevronRight, ArrowUpRight, DollarSign, 
    Euro, PoundSterling, MoreHorizontal, Wifi, 
    Activity, Smartphone, Copy, CheckCircle2, X, Bitcoin,
    JapaneseYen, ChevronLeft, Building2, Globe,
    Landmark
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// --- EXPANDED WALLET CONFIGURATION ---
const WALLETS_CONFIG = [
    { id: "w_usd", currency: "USD", name: "US Dollar", symbol: "$", icon: DollarSign, flag: "🇺🇸", theme: "from-slate-800 via-slate-900 to-[#050505] border-white/10", lightTheme: "from-slate-700 via-slate-800 to-slate-900 border-slate-300", glow: "bg-slate-500/20" },
    { id: "w_eur", currency: "EUR", name: "Euro", symbol: "€", icon: Euro, flag: "🇪🇺", theme: "from-indigo-900 via-[#1e1b4b] to-[#0a0a14] border-indigo-500/30", lightTheme: "from-indigo-600 via-indigo-700 to-indigo-900 border-indigo-300", glow: "bg-indigo-500/20" },
    { id: "w_gbp", currency: "GBP", name: "British Pound", symbol: "£", icon: PoundSterling, flag: "🇬🇧", theme: "from-rose-900 via-[#4c0519] to-[#140505] border-rose-500/30", lightTheme: "from-rose-600 via-rose-700 to-rose-900 border-rose-300", glow: "bg-rose-500/20" },
    { id: "w_jpy", currency: "JPY", name: "Japanese Yen", symbol: "¥", icon: JapaneseYen, flag: "🇯🇵", theme: "from-amber-900 via-[#451a03] to-[#1a0601] border-amber-500/30", lightTheme: "from-amber-600 via-amber-700 to-amber-900 border-amber-300", glow: "bg-amber-500/20" },
    { id: "w_cad", currency: "CAD", name: "Canadian Dollar", symbol: "C$", icon: DollarSign, flag: "🇨🇦", theme: "from-emerald-900 via-[#064e3b] to-[#022c22] border-emerald-500/30", lightTheme: "from-emerald-600 via-emerald-700 to-emerald-900 border-emerald-300", glow: "bg-emerald-500/20" },
    { id: "w_aud", currency: "AUD", name: "Australian Dollar", symbol: "A$", icon: DollarSign, flag: "🇦🇺", theme: "from-cyan-900 via-[#164e63] to-[#082f49] border-cyan-500/30", lightTheme: "from-cyan-600 via-cyan-700 to-cyan-900 border-cyan-300", glow: "bg-cyan-500/20" }
];

export default function WalletsPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // Auth & Data
    const { user, userData, loading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    
    // UI States
    const [activeWalletIndex, setActiveWalletIndex] = useState(0);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [addMoneyTab, setAddMoneyTab] = useState<"bank" | "crypto">("bank");
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState("");

    useEffect(() => setMounted(true), []);

    // Fetch Transactions
    useEffect(() => {
        if (!user) return;
        const txQ = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(100));
        const unsubscribe = onSnapshot(txQ, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const isDark = mounted ? resolvedTheme === "dark" : true;

    if (!mounted || authLoading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!userData) return null;

    // --- DATA AGGREGATION ---
    const getBalance = (currency: string) => {
        if (userData.balances && userData.balances[currency] !== undefined) {
            return Number(userData.balances[currency]);
        }
        if (currency === "USD") return Number(userData.balance) || 0;
        return 0;
    };

    const dynamicWallets = WALLETS_CONFIG.map(w => ({
        ...w,
        balance: getBalance(w.currency),
        cardNumber: userData.cardSuffix || "1234"
    }));

    const activeWallet = dynamicWallets[activeWalletIndex];

    const filteredTransactions = transactions.filter(tx => {
        if (tx.currency === activeWallet.currency) return true;
        if (tx.fromCurrency === activeWallet.currency || tx.toCurrency === activeWallet.currency) return true;
        if (!tx.currency && !tx.fromCurrency && activeWallet.currency === "USD") return true; // Legacy fallback
        return false;
    }).slice(0, 8); 

    // --- ACTIONS ---
    const nextWallet = () => {
        setDirection(1);
        setActiveWalletIndex((prev) => (prev + 1) % dynamicWallets.length);
    };

    const prevWallet = () => {
        setDirection(-1);
        setActiveWalletIndex((prev) => (prev - 1 + dynamicWallets.length) % dynamicWallets.length);
    };

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(id);
        showToast("Copied to clipboard");
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const btcAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    const btcQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${btcAddress}`;

    // Framer Motion Slide Variants
    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0, scale: 0.95 }),
        center: { x: 0, opacity: 1, scale: 1, zIndex: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0, scale: 0.95, zIndex: 0 })
    };

    return (
        <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8 relative">

            {/* --- ELITE TOAST NOTIFICATION --- */}
            <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
                    {toastMsg}
                </div>
            </div>

            {/* --- ADD MONEY MODAL --- */}
            <AnimatePresence>
                {isAddMoneyOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            // initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#0A0A0C] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 relative"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#111115]">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Money</h3>
                                    <p className="text-xs text-slate-500">Fund your {activeWallet.currency} wallet</p>
                                </div>
                                <button onClick={() => setIsAddMoneyOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Tabs */}
                                <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/5 shadow-inner">
                                    <button 
                                        onClick={() => setAddMoneyTab("bank")}
                                        className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${addMoneyTab === "bank" ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <Building2 className="w-4 h-4" /> Bank Transfer
                                    </button>
                                    <button 
                                        onClick={() => setAddMoneyTab("crypto")}
                                        className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${addMoneyTab === "crypto" ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        <Bitcoin className="w-4 h-4" /> Crypto (BTC)
                                    </button>
                                </div>

                                {addMoneyTab === "bank" ? (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/5">
                                            <p className="text-xs text-slate-500 mb-4">Send a wire or ACH transfer to the details below to fund your wallet. Funds typically arrive in 1-3 business days.</p>
                                            
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/5">
                                                    <span className="text-xs font-bold text-slate-400">Bank Name</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Revolut Bank UAB</span>
                                                </div>
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/5">
                                                    <span className="text-xs font-bold text-slate-400">Routing Number</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-mono text-slate-900 dark:text-white">121000358</span>
                                                        <button onClick={() => handleCopy("121000358", "routing")} className="text-slate-400 hover:text-cyan-500 transition-colors">
                                                            {copiedItem === "routing" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-400">Account Number</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-mono text-slate-900 dark:text-white">000012345678</span>
                                                        <button onClick={() => handleCopy("000012345678", "account")} className="text-slate-400 hover:text-cyan-500 transition-colors">
                                                            {copiedItem === "account" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center">
                                        <p className="text-xs text-slate-500 mb-6 text-center">Send Bitcoin (BTC) to this address. It will be automatically converted to {activeWallet.currency} and added to your balance.</p>
                                        
                                        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md mb-6">
                                            <img src={btcQrUrl} alt="BTC Address QR" className="w-40 h-40 object-contain" />
                                        </div>

                                        <div className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/5">
                                            <span className="text-[10px] sm:text-xs font-mono text-slate-900 dark:text-white truncate pr-4">
                                                {btcAddress}
                                            </span>
                                            <button 
                                                onClick={() => handleCopy(btcAddress, "btc")}
                                                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white text-xs font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-colors shrink-0 flex items-center gap-1"
                                            >
                                                {copiedItem === "btc" ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- HEADER --- */}
            <div className="flex items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Main Wallets</h1>
                    <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your fiat balances and fund your account.</p>
                </div>

                <button 
                    onClick={() => setIsAddMoneyOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Money</span><span className="sm:hidden">Add</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* ==========================================
            LEFT COLUMN: WALLETS & ACTIONS (lg:col-span-7)
            ========================================== */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Single Wallet Display with Arrows */}
                    <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden transition-colors duration-500 relative flex flex-col">

                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] blur-[100px] rounded-full pointer-events-none transition-colors duration-1000 ${activeWallet.glow} opacity-40 dark:opacity-20`} />

                        {/* Interactive Wallet Area */}
                        <div className="pt-8 pb-6 relative z-10 w-full overflow-hidden flex flex-col items-center">
                            
                            {/* Arrow Controls & Card */}
                            <div className="flex items-center justify-center w-full px-4 sm:px-8 gap-2 sm:gap-4">
                                <button onClick={prevWallet} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shrink-0 z-20">
                                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </button>

                                {/* The Physical Card Component */}
                                <div className="relative w-[280px] h-[175px] sm:w-[340px] sm:h-[210px] perspective-1000">
                                    <AnimatePresence initial={false} custom={direction}>
                                        <motion.div
                                            key={activeWallet.id}
                                            custom={direction}
                                            variants={slideVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="absolute inset-0 rounded-[24px] overflow-hidden shadow-2xl"
                                        >
                                            <div className={`absolute inset-0 border bg-gradient-to-br ${isDark ? activeWallet.theme : activeWallet.lightTheme} border-white/20`}>
                                                <div className="absolute top-[-100%] left-[-50%] w-[200%] h-[300%] bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent rotate-[25deg] pointer-events-none animate-[shimmer_8s_infinite]" />
                                                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

                                                <div className="relative z-10 p-5 sm:p-6 h-full flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/10 shadow-inner">
                                                                <span className="text-base sm:text-lg leading-none">{activeWallet.flag}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none mb-1">
                                                                    {activeWallet.currency}
                                                                </span>
                                                                <p className="text-[12px] sm:text-[13px] font-bold tracking-tight text-white shadow-black/50">
                                                                    {activeWallet.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Wifi className="w-4 h-4 sm:w-5 sm:h-5 rotate-90 text-white/60" />
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <h2 className="text-2xl sm:text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                                            {activeWallet.symbol}{activeWallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </h2>
                                                    </div>

                                                    <div className="flex justify-between items-end">
                                                        <div className="flex flex-col">
                                                            <p className="text-[10px] sm:text-[12px] font-mono tracking-[0.2em] sm:tracking-[0.25em] text-white/60 drop-shadow-md">
                                                                •••• {activeWallet.cardNumber}
                                                            </p>
                                                        </div>
                                                        <div className="flex -space-x-2 sm:-space-x-3 opacity-80">
                                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20" />
                                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                <button onClick={nextWallet} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shrink-0 z-20">
                                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>

                            {/* Pagination Dots */}
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {dynamicWallets.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setDirection(idx > activeWalletIndex ? 1 : -1);
                                            setActiveWalletIndex(idx);
                                        }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${activeWalletIndex === idx ? 'w-6 bg-slate-900 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Functional Action Dock */}
                        <div className="border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/80 dark:bg-[#0A0A0C]/80 backdrop-blur-md grid grid-cols-4 divide-x divide-slate-100 dark:divide-white/[0.04] relative z-10">
                            <button onClick={() => setIsAddMoneyOpen(true)} className="flex flex-col items-center justify-center gap-2 py-4 sm:py-5 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors group">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-slate-200 dark:bg-[#15151A] text-slate-700 dark:text-slate-300">
                                    <ArrowDownToLine className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Add</span>
                            </button>

                            <Link href="/dashboard/exchange" className="flex flex-col items-center justify-center gap-2 py-4 sm:py-5 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors group">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20">
                                    <ArrowRightLeft className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">Exchange</span>
                            </Link>

                            <Link href="/dashboard/send" className="flex flex-col items-center justify-center gap-2 py-4 sm:py-5 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors group">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-slate-200 dark:bg-[#15151A] text-slate-700 dark:text-slate-300">
                                    <Send className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Send</span>
                            </Link>

                            <button onClick={() => showToast(`Wallet Details for ${activeWallet.name}`)} className="flex flex-col items-center justify-center gap-2 py-4 sm:py-5 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors group">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-slate-200 dark:bg-[#15151A] text-slate-700 dark:text-slate-300">
                                    <MoreHorizontal className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Details</span>
                            </button>
                        </div>
                    </div>

                    {/* Activity Feed for Active Wallet */}
                    <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500 min-h-[300px] flex flex-col">
                        <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                {activeWallet.currency} Activity
                            </h3>
                            <Link href="/dashboard/transactions" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <History className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-white/[0.04] flex-1">
                            {filteredTransactions.map((tx) => {
                                let displayAmount = tx.amount;
                                let isCredit = tx.isCredit;
                                let icon = Landmark;

                                if (tx.category === "Exchange") {
                                    icon = ArrowRightLeft;
                                    if (tx.toCurrency === activeWallet.currency) {
                                        isCredit = true;
                                        displayAmount = tx.amountOut || tx.amount;
                                    } else {
                                        isCredit = false;
                                        displayAmount = tx.amount;
                                    }
                                } else if (tx.category === "Transfer" || tx.category === "Internal") {
                                    icon = Send;
                                } else {
                                    icon = Activity;
                                }

                                return (
                                    <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] active:bg-slate-100 dark:active:bg-white/[0.05] transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                                                {(() => {
                                                    const IconComp = icon;
                                                    return <IconComp className={`w-4 h-4 sm:w-5 sm:h-5 ${isCredit ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />;
                                                })()}
                                            </div>
                                            <div className="truncate pr-2">
                                                <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                                                    {tx.title || tx.name || tx.category}
                                                </h4>
                                                <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 mt-0.5 truncate">
                                                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <p className={`text-[14px] sm:text-[15px] font-bold ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                {isCredit ? '+' : '-'}{activeWallet.symbol}{displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredTransactions.length === 0 && (
                                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                                        <Activity className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">No recent activity</p>
                                    <p className="text-xs text-slate-500 mt-1">Transactions in {activeWallet.currency} will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ==========================================
            RIGHT COLUMN: PORTFOLIO & PROMOS (lg:col-span-5)
            ========================================== */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Quick Exchange Promo (Glassmorphic) */}
                    <div className="bg-gradient-to-br from-cyan-900 to-slate-900 dark:from-[#082f49] dark:to-[#0A0A0C] border border-cyan-800 dark:border-cyan-500/20 rounded-[32px] p-6 sm:p-8 shadow-sm dark:shadow-[0_8px_30px_-10px_rgba(6,182,212,0.15)] relative overflow-hidden transition-colors duration-500 group">
                        <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-cyan-500/30 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-[12px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <Globe className="w-5 h-5 text-cyan-100" />
                                </div>
                                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                                <div className="w-10 h-10 rounded-[12px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <DollarSign className="w-5 h-5 text-cyan-100" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white tracking-tight">Real-time FX Exchange</h3>
                            <p className="text-[13px] text-cyan-100/80 mt-2 leading-relaxed">
                                Exchange between 30+ currencies instantly at the interbank rate, with zero hidden fees.
                            </p>

                            <div className="mt-6 p-4 rounded-[16px] bg-black/30 border border-white/10 backdrop-blur-md flex justify-between items-center shadow-lg">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Global Wallets</span>
                                    <span className="text-sm font-bold text-white tracking-tight mt-0.5">Instant Transfers</span>
                                </div>
                                <Link href="/dashboard/exchange" className="px-5 py-2.5 rounded-xl bg-white text-black dark:text-black font-bold text-[12px] hover:bg-slate-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] block">
                                    Convert Now
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Breakdown Widget */}
                    <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
                        <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Portfolio Breakdown</h3>
                                <p className="text-[11px] text-slate-500 mt-1">All active currency accounts</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>

                        <div className="p-2 space-y-1">
                            {dynamicWallets.map((wallet, idx) => (
                                <div 
                                    key={`list-${wallet.id}`} 
                                    onClick={() => setActiveWalletIndex(idx)}
                                    className={`p-4 rounded-[20px] flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${activeWalletIndex === idx ? 'bg-slate-50 dark:bg-white/[0.02]' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shadow-sm shrink-0">
                                            <span className="text-lg leading-none">{wallet.flag}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">{wallet.name}</h4>
                                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{wallet.currency}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-[14px] font-black text-slate-900 dark:text-white">
                                            {wallet.symbol}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}