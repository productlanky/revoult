"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
    Plus, ArrowRightLeft, Send, ArrowDownToLine,
    History, Building2, Landmark, ChevronRight, ArrowUpRight,
    DollarSign, Euro, PoundSterling, MoreHorizontal,
    Wifi, ShieldCheck, Activity, Smartphone
} from "lucide-react";

// --- MOCK DATA ---
const WALLETS = [
    {
        id: "w_usd",
        currency: "USD",
        name: "US Dollar",
        symbol: "$",
        balance: 24500.50,
        icon: DollarSign,
        flag: "🇺🇸",
        cardNumber: "•••• 8254",
        theme: "from-slate-800 via-slate-900 to-[#050505] border-white/10",
        lightTheme: "from-slate-100 via-slate-200 to-slate-300 border-slate-300",
        glow: "bg-slate-500/20",
        isPrimary: true,
    },
    {
        id: "w_eur",
        currency: "EUR",
        name: "Euro",
        symbol: "€",
        balance: 3240.00,
        icon: Euro,
        flag: "🇪🇺",
        cardNumber: "•••• 1928",
        theme: "from-indigo-900 via-[#1e1b4b] to-[#0a0a14] border-indigo-500/30",
        lightTheme: "from-indigo-100 via-indigo-200 to-indigo-300 border-indigo-300",
        glow: "bg-indigo-500/20",
        isPrimary: false,
    },
    {
        id: "w_gbp",
        currency: "GBP",
        name: "British Pound",
        symbol: "£",
        balance: 850.75,
        icon: PoundSterling,
        flag: "🇬🇧",
        cardNumber: "•••• 4412",
        theme: "from-rose-900 via-[#4c0519] to-[#140505] border-rose-500/30",
        lightTheme: "from-rose-100 via-rose-200 to-rose-300 border-rose-300",
        glow: "bg-rose-500/20",
        isPrimary: false,
    }
];

const TRANSACTIONS = [
    { id: 1, type: "Transfer In", entity: "Chase Bank", amount: 5000.00, currency: "USD", date: "Today, 10:23 AM", isCredit: true, icon: Landmark },
    { id: 2, type: "Exchange", entity: "USD to EUR", amount: 1200.00, currency: "USD", date: "Yesterday", isCredit: false, icon: ArrowRightLeft },
    { id: 3, type: "Payment Sent", entity: "Elena Rodriguez", amount: 450.00, currency: "USD", date: "Oct 14, 2026", isCredit: false, icon: Send },
    { id: 4, type: "Direct Deposit", entity: "Acme Corp Payroll", amount: 4250.00, currency: "USD", date: "Oct 12, 2026", isCredit: true, icon: Building2 },
];

const LINKED_BANKS = [
    { id: "b_1", name: "JPMorgan Chase", type: "Checking", accountEnd: "4412", status: "Connected" },
    { id: "b_2", name: "Bank of America", type: "Savings", accountEnd: "0998", status: "Connected" },
];

export default function WalletsPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeWalletIndex, setActiveWalletIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => setMounted(true), []);
    useEffect(() => {
        if (mounted && cardRefs.current[activeWalletIndex]) {
            cardRefs.current[activeWalletIndex]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center", // This centers the card in the track
            });
        }
    }, [activeWalletIndex, mounted]);

    // Prevent hydration mismatch by defaulting to dark until mounted
    const isDark = mounted ? resolvedTheme === "dark" : true;
    const activeWallet = WALLETS[activeWalletIndex];

    return (
        <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">

            {/* --- HEADER --- */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Main Wallets</h1>
                    <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your fiat balances, exchange currencies, and fund your account.</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Money</span><span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* ==========================================
            LEFT COLUMN: WALLETS & ACTIONS (lg:col-span-7)
            ========================================== */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Stunning Wallet Cards Carousel */}
                    <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden transition-colors duration-500 relative flex flex-col">

                        {/* Dynamic Ambient Background Glow */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] blur-[100px] rounded-full pointer-events-none transition-colors duration-1000 ${activeWallet.glow} opacity-40 dark:opacity-20`} />

                        {/* Top Carousel Area */}
                        <div className="pt-8 pb-6 relative z-10 w-full overflow-hidden">

                            {/* Horizontal Snapping Cards Track */}
                            <div
                                ref={scrollContainerRef}
                                className="flex overflow-x-auto snap-x snap-mandatory px-[25%] sm:px-[30%] gap-6 items-center py-10 scrollbar-hide"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {WALLETS.map((wallet, idx) => {
                                    const isActive = activeWalletIndex === idx;

                                    return (
                                        <div
                                            key={wallet.id}
                                            ref={(el) => { cardRefs.current[idx] = el; }}
                                            onClick={() => setActiveWalletIndex(idx)}
                                            className={`flex-none w-[300px] h-[190px] sm:w-[360px] sm:h-[220px] snap-center rounded-[32px] relative overflow-hidden transition-all duration-700 cursor-pointer ${isActive
                                                ? 'scale-105 z-20 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)]'
                                                : 'scale-90 opacity-30 grayscale blur-[1px] z-10'
                                                }`}
                                        >
                                            {/* 1. DYNAMIC OUTER GLOW (Bleeds outside the card when active) */}
                                            {isActive && (
                                                <div className={`absolute -inset-10 blur-[60px] opacity-40 mix-blend-screen transition-colors duration-1000 ${wallet.glow} pointer-events-none`} />
                                            )}

                                            {/* 2. CARD BASE LAYER */}
                                            <div className={`absolute inset-0 border transition-all duration-700 ${isActive
                                                ? `bg-gradient-to-br ${isDark ? wallet.theme : wallet.lightTheme} border-white/20`
                                                : 'bg-slate-800/50 border-white/5'
                                                }`}>

                                                {/* 3. SPECULAR HIGHLIGHT (The 'Light Slash') */}
                                                {isActive && (
                                                    <div className="absolute top-[-100%] left-[-50%] w-[200%] h-[300%] bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent rotate-[25deg] pointer-events-none animate-[shimmer_8s_infinite]" />
                                                )}

                                                {/* 4. MICRO-TEXTURE (Ultra-fine noise) */}
                                                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

                                                {/* 5. CONTENT LAYER */}
                                                <div className="relative z-10 p-7 h-full flex flex-col justify-between">

                                                    {/* Header: Identity & Wireless */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/10 shadow-inner">
                                                                <span className="text-lg leading-none">{wallet.flag}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 leading-none mb-1">
                                                                    {wallet.currency}
                                                                </span>
                                                                <p className={`text-[13px] font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                                                    {wallet.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Wifi className={`w-5 h-5 rotate-90 transition-opacity duration-700 ${isActive ? 'text-white/40' : 'opacity-0'}`} />
                                                    </div>

                                                    {/* Center: The Balance (The Hero) */}
                                                    <div className="flex flex-col items-center">
                                                        <h2 className={`text-3xl sm:text-4xl font-black tracking-tighter transition-all duration-700 ${isActive ? 'text-white scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-slate-600'
                                                            }`}>
                                                            {wallet.symbol}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </h2>
                                                    </div>

                                                    {/* Footer: Card Detail Aesthetic */}
                                                    <div className="flex justify-between items-end">
                                                        <div className="flex flex-col">
                                                            <p className={`text-[12px] font-mono tracking-[0.25em] transition-all duration-700 ${isActive ? 'text-white/40' : 'text-transparent'
                                                                }`}>
                                                                •••• {wallet.cardNumber}
                                                            </p>
                                                        </div>
                                                        <div className="flex -space-x-3 opacity-60">
                                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20" />
                                                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10" />
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Dots */}
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {WALLETS.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveWalletIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${activeWalletIndex === idx ? 'w-6 bg-slate-900 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Action Dock */}
                        <div className="border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/80 dark:bg-[#0A0A0C]/80 backdrop-blur-md grid grid-cols-4 divide-x divide-slate-100 dark:divide-white/[0.04] relative z-10">
                            {[
                                { icon: ArrowDownToLine, label: "Add" },
                                { icon: ArrowRightLeft, label: "Exchange", color: "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20" },
                                { icon: Send, label: "Send" },
                                { icon: MoreHorizontal, label: "Details" },
                            ].map((action) => (
                                <button
                                    key={action.label}
                                    className="flex flex-col items-center justify-center gap-2 py-4 sm:py-5 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors group"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${action.color || 'bg-slate-200 dark:bg-[#15151A] text-slate-700 dark:text-slate-300'}`}>
                                        <action.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed for Active Wallet */}
                    <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
                        <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                {activeWallet.currency} Activity
                            </h3>
                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <History className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                            {TRANSACTIONS.filter(t => t.currency === activeWallet.currency).map((tx) => (
                                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] active:bg-slate-100 dark:active:bg-white/[0.05] transition-colors cursor-pointer group">

                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                                            <tx.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${tx.isCredit ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                                        </div>
                                        <div className="truncate pr-2">
                                            <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{tx.entity}</h4>
                                            <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 mt-0.5 truncate">{tx.type} • {tx.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <p className={`text-[14px] sm:text-[15px] font-bold ${tx.isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                            {tx.isCredit ? '+' : '-'}{activeWallet.symbol}{tx.amount.toFixed(2)}
                                        </p>
                                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 sm:hidden" />
                                    </div>
                                </div>
                            ))}

                            {TRANSACTIONS.filter(t => t.currency === activeWallet.currency).length === 0 && (
                                <div className="p-8 text-center flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                                        <Activity className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">No recent activity</p>
                                    <p className="text-xs text-slate-500 mt-1">Transactions in {activeWallet.currency} will appear here.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
                            <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                                Download Statement <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                </div>

                {/* ==========================================
            RIGHT COLUMN: LINKED ACCOUNTS & EXCHANGE (lg:col-span-5)
            ========================================== */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Quick Exchange Promo (Glassmorphic) */}
                    <div className="bg-gradient-to-br from-cyan-900 to-slate-900 dark:from-[#082f49] dark:to-[#0A0A0C] border border-cyan-800 dark:border-cyan-500/20 rounded-[32px] p-6 sm:p-8 shadow-sm dark:shadow-[0_8px_30px_-10px_rgba(6,182,212,0.15)] relative overflow-hidden transition-colors duration-500 group">
                        <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-cyan-500/30 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-[12px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                                    <Euro className="w-5 h-5 text-cyan-100" />
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
                                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Current Rate</span>
                                    <span className="text-sm font-bold text-white tracking-tight mt-0.5">1 EUR = 1.09 USD</span>
                                </div>
                                <button className="px-5 py-2.5 rounded-xl bg-white text-black dark:text-black font-bold text-[12px] hover:bg-slate-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                                    Convert
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Linked Bank Accounts */}
                    <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
                        <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Linked Accounts</h3>
                            <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1.5 rounded-lg">
                                Link New <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-2">
                            {LINKED_BANKS.map((bank) => (
                                <div key={bank.id} className="p-4 rounded-[20px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                            <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">{bank.name}</h4>
                                            <p className="text-[11px] font-mono text-slate-500 mt-0.5">{bank.type} •••• {bank.accountEnd}</p>
                                        </div>
                                    </div>
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                            ))}

                            <div className="p-4 rounded-[20px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer border-dashed">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shadow-sm shrink-0">
                                        <Smartphone className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-slate-700 dark:text-slate-300">Link Digital Wallet</h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Apple Pay or Google Pay</p>
                                    </div>
                                </div>
                                <Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}