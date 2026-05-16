"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Target, Plus, Loader2, Sparkles, X, Trash2, 
  AlertCircle, ShoppingCart, ShoppingBag, Coffee, 
  Plane, Car, Activity, TrendingDown, ChevronRight
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, limit } from "firebase/firestore";

// --- DYNAMIC CATEGORY MAPPER ---
const CATEGORY_MAP: Record<string, any> = {
  "Groceries": { icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500", lightBg: "bg-emerald-500/10" },
  "Shopping": { icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500", lightBg: "bg-blue-500/10" },
  "Dining": { icon: Coffee, color: "text-amber-500", bg: "bg-amber-500", lightBg: "bg-amber-500/10" },
  "Travel": { icon: Plane, color: "text-indigo-500", bg: "bg-indigo-500", lightBg: "bg-indigo-500/10" },
  "Transport": { icon: Car, color: "text-rose-500", bg: "bg-rose-500", lightBg: "bg-rose-500/10" },
  "Other": { icon: Activity, color: "text-cyan-500", bg: "bg-cyan-500", lightBg: "bg-cyan-500/10" }
};

interface Budget {
  id: string;
  category: string;
  limit: number;
  createdAt: string;
}

export default function ManageBudgetsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Real-time Data States
  const { user, loading: authLoading } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: "Groceries",
    limit: "",
  });

  useEffect(() => setMounted(true), []);

  // Fetch Budgets & Transactions
  useEffect(() => {
    if (!user) return;

    // 1. Listen to Budgets
    const budgetsQ = query(collection(db, "users", user.uid, "budgets"), orderBy("createdAt", "desc"));
    const unsubscribeBudgets = onSnapshot(budgetsQ, (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
    });

    // 2. Listen to Transactions (to calculate spent amounts)
    const txQ = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(200));
    const unsubscribeTx = onSnapshot(txQ, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribeBudgets();
      unsubscribeTx();
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

  // --- DATA AGGREGATION ---
  // Filter transactions for the current month only
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTxs = transactions.filter(tx => {
    const txDate = new Date(tx.createdAt);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && !tx.isCredit;
  });

  // Enrich budgets with dynamically calculated "spent" values
  const enrichedBudgets = budgets.map(budget => {
    const spent = currentMonthTxs
      .filter(tx => tx.category === budget.category)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { ...budget, spent };
  });

  // Calculate Overall Totals
  const totalBudgetLimit = enrichedBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = enrichedBudgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercent = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  // --- ACTIONS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    // Prevent duplicate budget categories
    if (budgets.some(b => b.category === formData.category)) {
      showToast(`${formData.category} budget already exists!`);
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "budgets"), {
        category: formData.category,
        limit: parseFloat(formData.limit),
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({ category: "Groceries", limit: "" });
      showToast("Budget created successfully");
    } catch (error) {
      showToast("Failed to create budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user || !confirm("Delete this budget? Your transaction data will remain safe.")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "budgets", id));
      showToast("Budget deleted");
    } catch (error) {
      showToast("Failed to delete budget");
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

      {/* --- CREATE BUDGET MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create Budget</h3>
            
            <form onSubmit={handleCreateBudget} className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Category</label>
                <select 
                  required 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] focus:outline-none focus:border-cyan-500/50 text-sm text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  {Object.keys(CATEGORY_MAP).map(cat => (
                    <option key={cat} value={cat} className="bg-white dark:bg-[#0A0A0C]">{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Monthly Limit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    required 
                    type="number" 
                    step="1" 
                    min="1"
                    placeholder="500" 
                    value={formData.limit} 
                    onChange={e => setFormData({...formData, limit: e.target.value})} 
                    className="w-full p-4 pl-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] focus:outline-none focus:border-cyan-500/50 text-sm font-bold text-slate-900 dark:text-white" 
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 rounded-full font-bold text-sm bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] flex justify-center items-center">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set Budget"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Budgets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control your spending and reach your goals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        >
          <Plus className="w-4 h-4" /> Create Budget
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="sm:hidden p-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: TOTAL SUMMARY
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Summary Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-[-50%] right-[-50%] w-[150%] h-[150%] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none transition-all group-hover:bg-cyan-500/10" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Total Monthly Budget</h3>
                  <p className="text-[11px] font-medium text-slate-500">Across all categories</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                    ${totalBudgetSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                  </h2>
                  <p className="text-lg font-bold text-slate-400 dark:text-slate-500 mb-1">
                    / ${totalBudgetLimit.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <span>Usage</span>
                  <span className={overallPercent > 90 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}>
                    {overallPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${overallPercent > 90 ? 'bg-rose-500' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`} 
                    style={{ width: `${Math.min(overallPercent, 100)}%` }} 
                  />
                </div>
              </div>
              
              {overallPercent > 90 && (
                <div className="mt-6 flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                    You are approaching your overall limit. Review your categories to avoid overspending.
                  </p>
                </div>
              )}
            </div>
          </div>

          <Link href="/dashboard/analytics" className="w-full bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 shadow-sm flex items-center justify-between cursor-pointer hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="text-left">
                <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Spending Analytics</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">View your detailed breakdown</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </Link>
        </div>

        {/* ==========================================
            RIGHT COLUMN: INDIVIDUAL BUDGETS
            ========================================== */}
        <div className="lg:col-span-8">
          
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden min-h-[400px]">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/[0.04]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Categories</h3>
            </div>

            {enrichedBudgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No budgets set yet</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                  Create custom limits for dining, shopping, and more to keep your monthly spending on track.
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold text-[13px] hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95"
                >
                  Create First Budget
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrichedBudgets.map((budget) => {
                  const mapping = CATEGORY_MAP[budget.category] || CATEGORY_MAP["Other"];
                  const IconComp = mapping.icon;
                  const percent = (budget.spent / budget.limit) * 100;
                  const isWarning = percent >= 85;
                  const isOver = percent >= 100;

                  return (
                    <div key={budget.id} className="p-5 rounded-[24px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04] relative group transition-colors hover:border-slate-300 dark:hover:border-white/10">
                      
                      {/* Delete Button (Appears on Hover) */}
                      <button 
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-500/30 opacity-0 group-hover:opacity-100 transition-all z-10"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${mapping.lightBg}`}>
                          <IconComp className={`w-4 h-4 ${mapping.color}`} />
                        </div>
                        <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">{budget.category}</h4>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-end gap-1.5 mb-1">
                          <span className={`text-2xl font-black tracking-tighter leading-none ${isOver ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                            ${budget.spent.toLocaleString(undefined, {maximumFractionDigits:0})}
                          </span>
                          <span className="text-[13px] font-bold text-slate-400 mb-0.5">
                            / ${budget.limit.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500">
                          {isOver 
                            ? `$${(budget.spent - budget.limit).toLocaleString()} over budget` 
                            : `$${(budget.limit - budget.spent).toLocaleString()} remaining`}
                        </p>
                      </div>

                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${isOver || isWarning ? 'bg-rose-500' : mapping.bg}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}