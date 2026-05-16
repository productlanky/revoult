"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank, Plus, TrendingUp, Target, Coins,
  Settings, ArrowRight, ArrowUpRight, ArrowDownRight,
  History, Plane, ShieldCheck, Home as HomeIcon,
  Percent, ChevronRight, X, Loader2, Sparkles, Activity
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, addDoc } from "firebase/firestore";

// --- TYPES & THEMES ---
interface Vault {
  id: string;
  name: string;
  balance: number;
  target: number;
  apy: string;
  themeIndex: number;
  createdAt: string;
}

const VAULT_THEMES = [
  { icon: ShieldCheck, theme: "from-emerald-500/20 to-emerald-500/5", lightTheme: "from-emerald-500/10 to-emerald-500/5", color: "text-emerald-500", bgClass: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
  { icon: Plane, theme: "from-cyan-500/20 to-cyan-500/5", lightTheme: "from-cyan-500/10 to-cyan-500/5", color: "text-cyan-500 dark:text-cyan-400", bgClass: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20" },
  { icon: HomeIcon, theme: "from-indigo-500/20 to-indigo-500/5", lightTheme: "from-indigo-500/10 to-indigo-500/5", color: "text-indigo-500 dark:text-indigo-400", bgClass: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20" },
  { icon: Target, theme: "from-rose-500/20 to-rose-500/5", lightTheme: "from-rose-500/10 to-rose-500/5", color: "text-rose-500 dark:text-rose-400", bgClass: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" },
  { icon: PiggyBank, theme: "from-amber-500/20 to-amber-500/5", lightTheme: "from-amber-500/10 to-amber-500/5", color: "text-amber-500 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" }
];

export default function VaultsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Real-time Data
  const { user, userData, loading: authLoading } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // UI States
  const [roundUpsEnabled, setRoundUpsEnabled] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [activeVault, setActiveVault] = useState<Vault | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [newVaultName, setNewVaultName] = useState("");
  const [newVaultTarget, setNewVaultTarget] = useState("");
  const [manageAmount, setManageAmount] = useState("");
  const [manageAction, setManageAction] = useState<"deposit" | "withdraw">("deposit");

  useEffect(() => setMounted(true), []);

  // Fetch Vaults and Vault Transactions
  useEffect(() => {
    if (!user) return;

    // 1. Listen to Vaults
    const vaultsQ = query(collection(db, "users", user.uid, "vaults"), orderBy("createdAt", "desc"));
    const unsubscribeVaults = onSnapshot(vaultsQ, (snapshot) => {
      setVaults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vault)));
    });

    // 2. Listen to Transactions
    const txQ = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribeTx = onSnapshot(txQ, (snapshot) => {
      const txs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((tx: any) => tx.category === "Vault");
      setTransactions(txs);
      setDataLoading(false);
    });

    return () => {
      unsubscribeVaults();
      unsubscribeTx();
    };
  }, [user]);

  // Sync Round-up state with Firebase user document
  useEffect(() => {
    if (userData?.roundUpsEnabled !== undefined) {
      setRoundUpsEnabled(userData.roundUpsEnabled);
    }
  }, [userData]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted || authLoading || dataLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  const mainBalance = Number(userData.balances?.USD || userData.balance || 0);
  const totalVaultsBalance = vaults.reduce((acc, curr) => acc + curr.balance, 0);
  const totalInterestEarned = vaults.length * 12.40; // Simulated historical interest for UI

  // --- ACTIONS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleToggleRoundUps = async () => {
    if (!user) return;
    const newState = !roundUpsEnabled;
    setRoundUpsEnabled(newState);
    await updateDoc(doc(db, "users", user.uid), { roundUpsEnabled: newState });
    showToast(newState ? "Round-ups enabled" : "Round-ups disabled");
  };

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const targetAmt = parseFloat(newVaultTarget);
    if (!newVaultName || isNaN(targetAmt) || targetAmt <= 0) return showToast("Invalid vault details");

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "users", user.uid, "vaults"), {
        name: newVaultName,
        balance: 0,
        target: targetAmt,
        apy: "4.5%",
        themeIndex: vaults.length % VAULT_THEMES.length,
        createdAt: new Date().toISOString()
      });
      showToast("Vault created successfully!");
      setIsCreateOpen(false);
      setNewVaultName("");
      setNewVaultTarget("");
    } catch (error) {
      showToast("Failed to create vault.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeVault) return;

    const amt = parseFloat(manageAmount);
    if (isNaN(amt) || amt <= 0) return showToast("Enter a valid amount");

    setIsSubmitting(true);
    try {
      let newVaultBalance = activeVault.balance;
      let newMainBalance = mainBalance;

      if (manageAction === "deposit") {
        if (amt > mainBalance) throw new Error("Insufficient funds in main wallet");
        newVaultBalance += amt;
        newMainBalance -= amt;
      } else {
        if (amt > activeVault.balance) throw new Error("Insufficient funds in vault");
        newVaultBalance -= amt;
        newMainBalance += amt;
      }

      // Update Vault
      await updateDoc(doc(db, "users", user.uid, "vaults", activeVault.id), { balance: newVaultBalance });

      // Update Main Balance (Defaulting to USD for Vaults)
      const balanceUpdateKey = userData.balances?.USD !== undefined ? "balances.USD" : "balance";
      await updateDoc(doc(db, "users", user.uid), { [balanceUpdateKey]: newMainBalance });

      // Record Transaction
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        amount: amt,
        category: "Vault",
        isCredit: manageAction === "deposit",
        title: manageAction === "deposit" ? "Deposit to Vault" : "Withdrawal from Vault",
        note: `Vault: ${activeVault.name}`,
        status: "completed",
        createdAt: new Date().toISOString()
      });

      showToast(manageAction === "deposit" ? "Funds deposited!" : "Funds withdrawn!");
      setIsManageOpen(false);
      setManageAmount("");
    } catch (error: any) {
      showToast(error.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openManage = (vault: Vault) => {
    setActiveVault(vault);
    setManageAction("deposit");
    setManageAmount("");
    setIsManageOpen(true);
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

      {/* --- CREATE VAULT MODAL --- */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0A0A0C] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 relative"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#111115]">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Vault</h3>
                  <p className="text-xs text-slate-500">Set a new savings goal</p>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateVault} className="p-6 space-y-4">
                <div className="relative">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Vault Name</label>
                  <input required type="text" value={newVaultName} onChange={(e) => setNewVaultName(e.target.value)} placeholder="e.g. New Car, Taxes" className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium focus:border-cyan-500/50 outline-none shadow-inner" />
                </div>
                <div className="relative">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Target Amount</label>
                  <div className="absolute left-4 top-[38px] text-slate-400 font-bold">$</div>
                  <input required type="number" step="1" min="1" value={newVaultTarget} onChange={(e) => setNewVaultTarget(e.target.value)} placeholder="5000" className="w-full pl-8 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium focus:border-cyan-500/50 outline-none shadow-inner" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-4 rounded-2xl font-black text-[15px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Open Vault"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MANAGE VAULT MODAL --- */}
      <AnimatePresence>
        {isManageOpen && activeVault && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0A0A0C] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 relative"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#111115]">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{activeVault.name}</h3>
                  <p className="text-xs font-bold text-cyan-500">${activeVault.balance.toLocaleString()} / ${activeVault.target.toLocaleString()}</p>
                </div>
                <button onClick={() => setIsManageOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/5 shadow-inner">
                  <button onClick={() => setManageAction("deposit")} className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${manageAction === "deposit" ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    Deposit
                  </button>
                  <button onClick={() => setManageAction("withdraw")} className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${manageAction === "withdraw" ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    Withdraw
                  </button>
                </div>
                <form onSubmit={handleManageVault} className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</div>
                    <input autoFocus required type="number" step="0.01" min="0.01" value={manageAmount} onChange={(e) => setManageAmount(e.target.value)} placeholder="0.00" className="w-full pl-9 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-xl font-black tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium focus:border-cyan-500/50 outline-none shadow-inner" />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-slate-500">Available to {manageAction}:</span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">${(manageAction === 'deposit' ? mainBalance : activeVault.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-4 rounded-2xl font-black text-[15px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex justify-center items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Vaults</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Earn up to 4.5% AER paid daily on your savings goals.</p>
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Vault</span><span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ==========================================
            LEFT COLUMN: SUMMARY & VAULTS (lg:col-span-8)
            ========================================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* Main Balance & Interest Card */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative transition-colors duration-500 group">
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-500/30 transition-colors pointer-events-none" />

            <div className="p-6 sm:p-8 relative z-10 flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05]">
                  <PiggyBank className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Total Savings</span>
                </div>

                {vaults.length > 0 && (
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Interest Earned</p>
                    <p className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                      <TrendingUp className="w-4 h-4" /> +${totalInterestEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                  ${totalVaultsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                  Across {vaults.length} active vaults earning up to 4.5% AER.
                </p>
              </div>
            </div>
          </div>

          {/* Goal Vaults (Mobile Carousel -> Desktop Grid) */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Your Goal Vaults</h3>
            </div>

            {vaults.length === 0 ? (
              <div className="w-full bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-10 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No active vaults</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">Create a vault to start saving for your next holiday, deposit, or emergency fund.</p>
                <button onClick={() => setIsCreateOpen(true)} className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                  Create First Vault
                </button>
              </div>
            ) : (
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 gap-4 pb-2 sm:pb-0">
                {vaults.map((vault) => {
                  const theme = VAULT_THEMES[vault.themeIndex % VAULT_THEMES.length];
                  const progress = Math.min((vault.balance / vault.target) * 100, 100);

                  return (
                    <div
                      key={vault.id}
                      onClick={() => openManage(vault)}
                      className="w-[85vw] sm:w-auto shrink-0 snap-center bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-all duration-300 group cursor-pointer hover:border-slate-300 dark:hover:border-white/[0.1] hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${isDark ? theme.theme : theme.lightTheme} opacity-50 pointer-events-none transition-opacity group-hover:opacity-70`} />

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 border ${theme.bgClass}`}>
                            <theme.icon className={`w-6 h-6 ${theme.color}`} />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">APY</span>
                            <span className="px-2 py-1 rounded-md bg-white/50 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[12px] font-bold text-slate-800 dark:text-white shadow-sm">
                              {vault.apy}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <h4 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight mb-1 truncate">{vault.name}</h4>
                          <div className="flex items-end justify-between mb-3">
                            <p className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
                              ${vault.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-[12px] font-medium text-slate-500">
                              of ${vault.target.toLocaleString()}
                            </p>
                          </div>

                          <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out bg-current ${theme.color}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-3 text-right">
                            {progress.toFixed(0)}% Achieved
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: AUTO-SAVE & ACTIVITY (lg:col-span-4)
            ========================================== */}
        <div className="lg:col-span-4 space-y-6">

          {/* Round-ups Auto-Save Promo */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-[#1e1b4b] dark:to-[#0A0A0C] border border-indigo-800 dark:border-indigo-500/20 rounded-[24px] p-6 shadow-sm dark:shadow-[0_8px_30px_-10px_rgba(99,102,241,0.15)] relative overflow-hidden transition-colors duration-500 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full pointer-events-none transition-colors" />
            <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                {/* iOS Style Toggle for Round-ups */}
                <button
                  onClick={handleToggleRoundUps}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none shadow-inner ${roundUpsEnabled ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ease-out ${roundUpsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="mb-5">
                <h3 className="text-lg font-bold text-white tracking-tight">Spare Change Round-ups</h3>
                <p className="text-xs text-indigo-100 mt-1.5 leading-relaxed">
                  We'll round up your card purchases to the nearest dollar and deposit the difference into your vault automatically.
                </p>
              </div>

              {roundUpsEnabled && (
                <div className="mt-5 p-3 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between shadow-inner">
                  <span className="text-xs font-medium text-white/80">Saved this week:</span>
                  <span className="text-sm font-bold text-white tracking-tight">+$12.45</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Vault Activity */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500 min-h-[300px] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Vault Activity</h3>
              <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <History className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] flex-1">
              {transactions.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-white/10 mb-3" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No vault activity</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">Deposits and withdrawals from your vaults will appear here.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group">

                    <div className="flex items-center gap-3 sm:gap-4 truncate">
                      <div className="w-10 h-10 rounded-[12px] bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                        {tx.isCredit ? <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                      </div>
                      <div className="truncate">
                        <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{tx.title}</h4>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{new Date(tx.createdAt).toLocaleDateString()} • {tx.note.replace('Vault: ', '')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <p className={`text-[14px] font-bold ${tx.isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {tx.isCredit ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {transactions.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01] mt-auto">
                <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                  View Full History <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}