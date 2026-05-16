"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { 
  Search, ArrowDownRight, ArrowUpRight, 
  Filter, Calendar, Download, Loader2, Sparkles, Activity,
  ChevronLeft, ChevronRight
} from "lucide-react";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface TransactionDoc {
  id: string;
  amount: number;
  assetClass?: 'fiat' | 'crypto' | 'stock' | 'vault';
  assetSymbol?: string;
  currency?: string;
  category: string; 
  title?: string;
  status?: string;
  createdAt: string;
  isCredit?: boolean;
  type?: string;
  [key: string]: any;
}

const FIAT_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$" };

export default function TransactionsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Real-time Auth & Data
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Income" | "Expense">("All");
  const [dateFilter, setDateFilter] = useState<"All Time" | "Last 30 Days" | "This Year">("Last 30 Days");
  
  // UI States
  const [toastMsg, setToastMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => setMounted(true), []);

  // Fetch Transactions
  useEffect(() => {
    if (!user) return;
    
    // We fetch a larger limit to allow local filtering/searching
    const txQ = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(txQ, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionDoc)));
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  // --- FILTERING & MATH LOGIC ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Text Search (Title, Category, or Asset Symbol)
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        (tx.title || "").toLowerCase().includes(searchStr) ||
        (tx.category || "").toLowerCase().includes(searchStr) ||
        (tx.assetSymbol || "").toLowerCase().includes(searchStr);
      
      // 2. Type Filter (Income vs Expense)
      const isCredit = tx.isCredit !== undefined ? tx.isCredit : (tx.type?.toLowerCase() === 'deposit' || tx.category?.toLowerCase() === 'receive');
      const matchesType = 
        typeFilter === "All" || 
        (typeFilter === "Income" && isCredit) || 
        (typeFilter === "Expense" && !isCredit);
      
      // 3. Date Filter (Simulated logic based on string matching for demo purposes)
      // In a production app with heavy data, you would query Firebase directly using where("createdAt", ">=", date)
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      let matchesDate = true;
      
      if (dateFilter === "Last 30 Days") {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        matchesDate = txDate >= thirtyDaysAgo;
      } else if (dateFilter === "This Year") {
        matchesDate = txDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [transactions, searchTerm, typeFilter, dateFilter]);

  // Calculate Totals based ONLY on filtered view
  const { totalEarned, totalSpent } = useMemo(() => {
    let earned = 0;
    let spent = 0;
    
    filteredTransactions.forEach(tx => {
      const isCredit = tx.isCredit !== undefined ? tx.isCredit : (tx.type?.toLowerCase() === 'deposit' || tx.category?.toLowerCase() === 'receive');
      // Only sum completed transactions that are Fiat (to keep the math somewhat sane in a multi-asset system)
      if ((tx.status || 'pending').toLowerCase() === 'completed' && (!tx.assetClass || tx.assetClass === 'fiat')) {
         if (isCredit) earned += Number(tx.amount);
         else spent += Number(tx.amount);
      }
    });

    return { totalEarned: earned, totalSpent: spent };
  }, [filteredTransactions]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, dateFilter]);

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
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8 relative">
      
      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Search, filter, and export your financial history.</p>
        </div>
        
        <button 
          onClick={() => showToast("Exporting CSV...")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] shrink-0"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* --- FILTER & SUMMARY BAR --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl p-4 sm:p-5 flex flex-col lg:flex-row gap-5 lg:items-center justify-between transition-colors duration-500">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activity..." 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500/50 outline-none shadow-inner transition-all"
            />
          </div>

          <div className="flex gap-3">
            {/* Type Filter */}
            <div className="relative flex-1 sm:w-[140px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Filter className="w-4 h-4 text-slate-400" />
              </div>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full h-11 pl-10 pr-8 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none shadow-inner appearance-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Income">Income (+)</option>
                <option value="Expense">Expenses (-)</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative flex-1 sm:w-[150px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full h-11 pl-10 pr-8 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none shadow-inner appearance-none cursor-pointer"
              >
                <option value="All Time">All Time</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Math Summary */}
        <div className="flex items-center gap-6 px-2 sm:px-4 py-2 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/10">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total Spent</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total Earned</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+${totalEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>

      </div>

      {/* --- THE LEDGER TABLE --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] overflow-hidden shadow-sm dark:shadow-xl flex flex-col min-h-[500px] transition-colors duration-500">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="p-5 font-bold">Date & Time</th>
                <th className="p-5 font-bold">Transaction Details</th>
                <th className="p-5 font-bold hidden sm:table-cell">Asset Type</th>
                <th className="p-5 font-bold hidden md:table-cell">Status</th>
                <th className="p-5 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {paginatedTransactions.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-16 text-center">
                     <div className="flex flex-col items-center justify-center">
                        <Activity className="w-10 h-10 text-slate-300 dark:text-white/10 mb-4" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">No records found</p>
                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters.</p>
                     </div>
                   </td>
                 </tr>
              ) : (
                paginatedTransactions.map(tx => {
                  const isCredit = tx.isCredit !== undefined ? tx.isCredit : (tx.type?.toLowerCase() === 'deposit' || tx.category?.toLowerCase() === 'receive');
                  const st = (tx.status || 'pending').toLowerCase();
                  const txDate = new Date(tx.createdAt);
                  
                  // Extract Symbol (Crypto, Fiat, Stock)
                  const sym = tx.assetSymbol || tx.currency || 'USD';
                  const prefix = FIAT_SYMBOLS[sym.toUpperCase()] || '';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      
                      {/* Date */}
                      <td className="p-5">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                          {txDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {txDate.toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </td>

                      {/* Details */}
                      <td className="p-5 max-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.05]'}`}>
                            {isCredit ? <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                          </div>
                          <div className="truncate">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{tx.title || tx.category}</p>
                            <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{tx.category || "Transfer"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Asset */}
                      <td className="p-5 hidden sm:table-cell">
                         <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize">
                           {tx.assetClass || "Fiat"} • {sym.toUpperCase()}
                         </span>
                      </td>

                      {/* Status */}
                      <td className="p-5 hidden md:table-cell">
                         <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                           st === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 
                           st === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 
                           'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
                         }`}>
                           {st === 'completed' ? 'Processed' : st === 'rejected' ? 'Declined' : 'Pending'}
                         </span>
                      </td>

                      {/* Amount */}
                      <td className="p-5 text-right">
                         <span className={`text-[14px] font-black ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                           {isCredit ? '+' : '-'}{prefix}{Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                         </span>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between mt-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}