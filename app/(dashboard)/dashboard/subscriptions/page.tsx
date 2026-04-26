"use client";

import {
    Calendar, MonitorPlay, Music, Server, Dumbbell,
    CreditCard, ArrowUpRight, Search, Filter, Plus,
    MoreHorizontal, ShieldAlert, CheckCircle2, AlertCircle,
    TrendingDown, ChevronRight
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const SUBSCRIPTIONS = [
    {
        id: 1,
        name: "Netflix Premium",
        category: "Entertainment",
        price: 22.99,
        cycle: "Monthly",
        nextBilling: "Oct 12",
        status: "Active",
        icon: MonitorPlay,
        colorClass: "text-rose-500",
        bgClass: "bg-rose-500/10 border-rose-500/20",
        cardSuffix: "9012"
    },
    {
        id: 2,
        name: "Spotify Duo",
        category: "Entertainment",
        price: 14.99,
        cycle: "Monthly",
        nextBilling: "Oct 15",
        status: "Active",
        icon: Music,
        colorClass: "text-emerald-500",
        bgClass: "bg-emerald-500/10 border-emerald-500/20",
        cardSuffix: "9012"
    },
    {
        id: 3,
        name: "AWS Cloud Services",
        category: "Software",
        price: 145.50,
        cycle: "Monthly",
        nextBilling: "Oct 28",
        status: "Active",
        icon: Server,
        colorClass: "text-orange-500",
        bgClass: "bg-orange-500/10 border-orange-500/20",
        cardSuffix: "4136"
    },
    {
        id: 4,
        name: "Equinox Membership",
        category: "Health & Fitness",
        price: 240.00,
        cycle: "Monthly",
        nextBilling: "Nov 01",
        status: "Active",
        icon: Dumbbell,
        colorClass: "text-slate-700 dark:text-slate-300",
        bgClass: "bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20",
        cardSuffix: "9012"
    }
];

export default function SubscriptionsPage() {
    const totalMonthly = SUBSCRIPTIONS.reduce((acc, curr) => acc + curr.price, 0);

    return (
        <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">

            {/* --- HEADER --- */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Subscriptions</h1>
                    <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage your recurring payments seamlessly.</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="p-2 sm:p-2.5 rounded-full sm:rounded-xl bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
                        <Filter className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>

                    {/* Mobile FAB vs Desktop Button */}
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                        <Plus className="w-4 h-4" /> Add Manual
                    </button>
                    <button className="sm:hidden p-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* --- SUMMARY CARDS (Mobile Carousel -> Desktop Grid) --- */}
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-4 pb-2 sm:pb-0">

                {/* Total Spend Card */}
                <div className="w-[85vw] sm:w-auto shrink-0 snap-center bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-500 group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full group-hover:bg-cyan-500/20 transition-colors" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="w-10 h-10 rounded-[14px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">This Month</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Spend</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${totalMonthly.toFixed(2)}</h2>
                    </div>
                </div>

                {/* Active Subs Card */}
                <div className="w-[85vw] sm:w-auto shrink-0 snap-center bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-500">
                    <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="w-10 h-10 rounded-[14px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Subs</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{SUBSCRIPTIONS.length}</h2>
                    </div>
                </div>

                {/* Action Needed Card */}
                <div className="w-[85vw] sm:w-auto shrink-0 snap-center bg-white dark:bg-gradient-to-br dark:from-[#151111] dark:to-[#0A0A0C] border border-slate-200 dark:border-rose-500/20 rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-[0_8px_30px_-10px_rgba(244,63,94,0.15)] relative overflow-hidden transition-colors duration-500 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 blur-[40px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="w-10 h-10 rounded-[14px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-500/20">Next 7 Days</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Upcoming Billing</p>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">Netflix Premium</h2>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Oct 12 • $22.99</p>
                    </div>
                </div>
            </div>

            {/* --- MOBILE-OPTIMIZED SUBSCRIPTION LIST --- */}
            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">

                {/* Search Header */}
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
                    <div className="hidden sm:flex items-center gap-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">All Subscriptions</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-600 dark:text-slate-300">{SUBSCRIPTIONS.length} Total</span>
                    </div>

                    <div className="relative group w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search subscriptions..."
                            className="w-full h-10 sm:h-9 rounded-[14px] sm:rounded-xl pl-10 pr-4 text-[14px] sm:text-[13px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Touch-Friendly List */}
                <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {SUBSCRIPTIONS.map((sub) => (
                        <div
                            key={sub.id}
                            className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] active:bg-slate-100 dark:active:bg-white/[0.05] transition-colors cursor-pointer group"
                        >

                            {/* Left Side: Icon & Details */}
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center shrink-0 border ${sub.bgClass}`}>
                                    <sub.icon className={`w-5 h-5 sm:w-5 sm:h-5 ${sub.colorClass}`} />
                                </div>

                                <div className="truncate pr-2">
                                    <h4 className="text-[15px] sm:text-[14px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{sub.name}</h4>
                                    <p className="text-[12px] sm:text-[12px] font-medium text-slate-500 mt-0.5 truncate">{sub.category}</p>
                                </div>
                            </div>

                            {/* Right Side: Payment Info & Actions */}
                            <div className="flex items-center gap-3 sm:gap-6 shrink-0">

                                {/* Billing Info Stack */}
                                <div className="flex flex-col items-end">
                                    <p className="text-[15px] sm:text-[14px] font-bold text-slate-900 dark:text-white">${sub.price.toFixed(2)}</p>

                                    {/* Desktop Date Display */}
                                    <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        <p className="text-[11px] font-medium text-slate-500">{sub.nextBilling}</p>
                                    </div>

                                    {/* Mobile Date Display */}
                                    <p className="text-[11px] font-medium text-slate-500 sm:hidden mt-0.5">Renews {sub.nextBilling}</p>
                                </div>

                                {/* Desktop-only Info & Buttons */}
                                <div className="hidden sm:flex items-center gap-6">
                                    {/* Card Used */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04]">
                                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">**{sub.cardSuffix}</span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center justify-center w-20">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                            {sub.status}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors shrink-0">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Native iOS Chevron (Visible only on mobile) */}
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 sm:hidden" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* List Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
                    <button className="text-[13px] sm:text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1 py-1">
                        View Past Subscriptions <ArrowUpRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                </div>
            </div>

            {/* --- AUTOMATION CALLOUT (Mobile Stacked) --- */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-[#111115] dark:via-[#1a1a24] dark:to-[#111115] border border-slate-700 dark:border-white/[0.04] rounded-[24px] p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors duration-500 group">
                <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.6%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex gap-4 sm:gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Block Unwanted Charges</h3>
                        <p className="text-sm text-slate-300 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                            Generate virtual cards for free trials. Automatically pause the card before they charge you for the real subscription.
                        </p>
                    </div>
                </div>

                <button className="relative z-10 w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-[14px] sm:rounded-xl bg-white text-black font-bold text-[14px] sm:text-[13px] hover:bg-slate-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap">
                    Create Virtual Card
                </button>
            </div>

        </div>
    );
}