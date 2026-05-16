"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Building2, Zap, ArrowRight, Check, RotateCcw,
  Delete, ShieldCheck, AlertCircle, Smartphone,
  Loader2, ChevronDown, User, Hash, Landmark, Sparkles
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, addDoc, collection, getDoc } from "firebase/firestore";
import { useTheme } from "next-themes";

// --- TYPESCRIPT INTERFACES ---
interface SystemFees {
  ach: number;
  wire: number;
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$" };

const BANKS = [
  "Chase", "Bank of America", "Wells Fargo", "Citibank", "U.S. Bank",
  "Capital One", "Goldman Sachs", "PNC Bank", "TD Bank", "Ally Bank",
  "Discover", "Navy Federal", "Charles Schwab", "American Express", "Other"
];

const STEPS = ["Type", "Details", "Review", "OTP", "Done"];

const pageVariants: Variants = {
  initial: { opacity: 0, y: 15, filter: "blur(4px)" },
  in: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
  out: { opacity: 0, y: -15, filter: "blur(4px)", transition: { duration: 0.2, ease: "easeIn" } },
};

export default function SendMoneyPage() {
  // --- STATE DECLARATIONS ---
  const [mounted, setMounted] = useState(false);
  const { user, userData, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  const [step, setStep] = useState(0);
  const [type, setType] = useState<"ach" | "wire" | null>(null);
  const [systemFees, setSystemFees] = useState<SystemFees>({ ach: 0, wire: 15 });

  const [currency, setCurrency] = useState("USD");
  const [bankName, setBankName] = useState("");
  const [showBanks, setShowBanks] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [holderName, setHolderName] = useState("");
  const [routing, setRouting] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [acctType, setAcctType] = useState<"checking" | "savings">("checking");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [txId, setTxId] = useState("");

  const bankRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchSystemFees() {
      try {
        const feeDoc = await getDoc(doc(db, "system", "fees"));
        if (feeDoc.exists()) {
          const data = feeDoc.data();
          setSystemFees({
            ach: data.achTransfer !== undefined ? Number(data.achTransfer) : 0,
            wire: data.wireTransfer !== undefined ? Number(data.wireTransfer) : 15,
          });
        }
      } catch (error) {
        console.error("Using default fees", error);
      }
    }
    fetchSystemFees();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (!mounted || authLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  // --- FIX: COMPREHENSIVE SECURITY & KYC CHECKS ---
  const userStatus = (userData.status || userData.accountStatus || "").toLowerCase();
  const txStatus = (userData.txStatus || "allowed").toLowerCase();
  const kycStatus = (userData.kycStatus || "verified").toLowerCase();

  const isFrozen = userStatus === "frozen" || userStatus === "suspended" || userData.cardFrozen;
  const isTxRestricted = txStatus === "restricted";
  const isKycVerified = kycStatus === "verified" || kycStatus === "approved" || userData.role === "admin";
  
  // Is Blocked checks ALL conditions
  const isBlocked = isFrozen || isTxRestricted || !isKycVerified;

  // --- DYNAMIC BALANCE CALCULATIONS ---
  // Safely grab the balance for the currently selected fiat wallet
  const availableBalance = userData.balances?.[currency] !== undefined 
    ? Number(userData.balances[currency]) 
    : (currency === "USD" ? Number(userData.balance || 0) : 0);

  const num = parseFloat(amount) || 0;

  const activeTransferTypes = [
    { id: "ach", label: "ACH Transfer", icon: <Building2 className="w-6 h-6" />, fee: systemFees.ach, time: "1–2 business days", desc: "Standard bank-to-bank transfer. Best for non-urgent payments." },
    { id: "wire", label: "Wire Transfer", icon: <Zap className="w-6 h-6" />, fee: systemFees.wire, time: "Same day (by 4 PM ET)", desc: "Faster, direct transfer. Guaranteed same-day delivery." },
  ];

  const selectedType = activeTransferTypes.find((t) => t.id === type);
  const fee = selectedType ? selectedType.fee : 0;
  const total = num + fee;

  const filteredBanks = BANKS.filter((b) => b.toLowerCase().includes(bankSearch.toLowerCase()));
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  const fmt = (n: number) => `${sym}${Number(n).toLocaleString("en-US", { minimumFractionDigits: currency === 'JPY' ? 0 : 2, maximumFractionDigits: currency === 'JPY' ? 0 : 2 })}`;

  const showToast = (msg: string, duration = 4000) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), duration);
  };

  // --- FIX: ENFORCE BLOCKING IN ADVANCEMENT ---
  function canAdvance() {
    if (isBlocked) return false;
    if (step === 0) return !!type;
    if (step === 1) return bankName && holderName && routing.length === 9 && accountNum.length >= 4 && num > 0 && total <= availableBalance;
    if (step === 2) return true;
    return false;
  }

  async function generateAndSendOtp() {
    setIsGeneratingOtp(true);
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { activeTransferOtp: code });
      }
      setOtpCode(code);
      setOtp("");
      setOtpError(false);
      setCountdown(30);
      setStep(3);

      showToast(`📱 SMS: Your security code is ${code}`, 8000);
    } catch (error) {
      showToast("Failed to secure connection.");
    } finally {
      setIsGeneratingOtp(false);
    }
  }

  function handleOtpKey(k: string) {
    if (isVerifyingOtp) return;
    if (k === "del") {
      setOtp((p) => p.slice(0, -1));
      setOtpError(false);
      return;
    }
    if (otp.length >= 6) return;
    const next = otp + k;
    setOtp(next);
    setOtpError(false);

    if (next.length === 6) {
      setIsVerifyingOtp(true);
      setTimeout(async () => {
        if (next === otpCode) {
          try {
            if (!user) throw new Error("Auth Error");

            // 1. Precise Target Deduction
            const updatePayload: any = {
              [`balances.${currency}`]: availableBalance - total,
              activeTransferOtp: null
            };
            
            // Keeps legacy field safely in sync if they used USD
            if (currency === "USD") {
              updatePayload.balance = availableBalance - total;
            }

            await updateDoc(doc(db, "users", user.uid), updatePayload);

            // 2. Record Transaction
            const newTxId = "TRF" + Math.random().toString(36).slice(2, 10).toUpperCase();
            await addDoc(collection(db, "users", user.uid, "transactions"), {
              transactionId: newTxId,
              amount: total,
              currency: currency, // Track the specific currency used
              category: "Transfer",
              isCredit: false,
              title: `Transfer to ${holderName}`,
              note: memo || `${type === "ach" ? "ACH" : "Wire"} to ${bankName}`,
              accountEnding: accountNum.slice(-4),
              createdAt: new Date().toISOString(),
              status: "pending" // Set to pending to ensure admin approval flow
            });

            // 3. Dispatch Notification
            await addDoc(collection(db, "users", user.uid, "notifications"), {
              title: "Transfer Initiated",
              message: `Your ${type === "ach" ? "ACH" : "wire"} transfer of ${fmt(num)} to ${holderName} has been processed successfully and is pending review.`,
              type: "transfer",
              isRead: false,
              createdAt: new Date().toISOString()
            });

            setTxId(newTxId);
            setStep(4);
          } catch (error: any) {
            console.error(error);
            showToast("Transaction failed. Please try again.");
            setOtp("");
          } finally {
            setIsVerifyingOtp(false);
          }
        } else {
          setOtpError(true);
          setOtp("");
          setIsVerifyingOtp(false);
        }
      }, 1500);
    }
  }

  function reset() {
    setStep(0); setType(null); setBankName(""); setHolderName("");
    setRouting(""); setAccountNum(""); setAmount(""); setMemo("");
    setOtp(""); setOtpError(false); setCurrency("USD"); setIsVerifyingOtp(false);
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 animate-in fade-in duration-700">

      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      <div className="mb-8 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Send Money</h1>
        <p className="text-sm text-slate-500 font-medium">Secure domestic bank transfer</p>
      </div>

      {/* --- DYNAMIC WARNING ALERTS --- */}
      {isFrozen ? (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-[20px] p-5 flex items-start gap-4 mb-6">
          <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-white mb-1">Account Suspended</h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
              {userData.suspensionReason || "Your account has been temporarily suspended. Please contact support."}
            </p>
          </div>
        </div>
      ) : isTxRestricted ? (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[20px] p-5 flex items-start gap-4 mb-6">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-white mb-1">Transactions Restricted</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {userData.txRestrictionReason || "Outgoing transactions have been restricted on your account. Please contact support."}
            </p>
          </div>
        </div>
      ) : !isKycVerified ? (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[20px] p-5 flex items-start gap-4 mb-6">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-white mb-1">Verification Required</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">Your identity documents are currently under review. Outgoing transfers are disabled until verification is complete.</p>
          </div>
        </div>
      ) : null}

      {/* --- MAIN TERMINAL --- */}
      <div className={`bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-xl relative overflow-hidden transition-opacity duration-300 ${isBlocked ? 'opacity-50 pointer-events-none' : ''}`}>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between px-8 pt-8 pb-4 relative">
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 dark:bg-white/5 -z-10 -translate-y-1/2" />
            {STEPS.slice(0, 4).map((s, i) => {
              const done = step > i;
              const active = step === i;
              return (
                <div key={s} className="flex flex-col items-center gap-2 z-10 bg-white dark:bg-[#0A0A0C] px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${done ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' :
                    active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-2 border-slate-900 dark:border-white' :
                      'bg-white dark:bg-[#0A0A0C] border-2 border-slate-200 dark:border-white/10 text-slate-400'
                    }`}>
                    {done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-slate-900 dark:text-white' : done ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>{s}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-6 sm:p-10 relative z-10">
          <AnimatePresence mode="wait">

            {/* STEP 0: TYPE SELECTION */}
            {step === 0 && (
              <motion.div key="step0" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Select delivery speed</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeTransferTypes.map((t) => {
                    const isSelected = type === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id as any)}
                        className={`text-left p-6 rounded-[24px] border transition-all duration-300 ${isSelected
                          ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 shadow-[0_10px_30px_-10px_rgba(6,182,212,0.3)]'
                          : 'bg-white dark:bg-[#111115] border-slate-200 dark:border-white/10 hover:border-cyan-500/50'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isSelected ? 'bg-cyan-500 text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                          {t.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.label}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed min-h-[40px]">{t.desc}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${isSelected ? 'bg-cyan-200/50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                            {t.fee === 0 ? "Free" : `Fee: $${t.fee}`}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500">
                            {t.time}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={!canAdvance()}
                  onClick={() => setStep(1)}
                  className={`w-full py-4 mt-4 rounded-[20px] font-black text-[15px] transition-all flex items-center justify-center gap-2 group ${canAdvance() ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-[1.01] active:scale-[0.98]' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                >
                  Continue <ArrowRight className={`w-5 h-5 transition-transform ${canAdvance() ? 'group-hover:translate-x-1' : ''}`} />
                </button>
              </motion.div>
            )}

            {/* STEP 1: DETAILS */}
            {step === 1 && (
              <motion.div key="step1" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">

                {/* Bank Selector */}
                <div className="relative" ref={bankRef}>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Recipient's Bank</label>
                  <button onClick={() => { setShowBanks(!showBanks); setBankSearch(""); }} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white flex justify-between items-center transition-all shadow-inner">
                    {bankName || <span className="text-slate-400 font-medium">Select bank...</span>}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showBanks ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showBanks && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[105%] left-0 right-0 z-20 rounded-2xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                        <div className="p-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111115]">
                          <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} placeholder="Search banks..." className="w-full p-3 rounded-xl bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/5 text-sm outline-none text-slate-900 dark:text-white" autoFocus />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {filteredBanks.map((b) => (
                            <button key={b} onClick={() => { setBankName(b); setShowBanks(false); }} className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${bankName === b ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                              {b}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={User} label="Account Holder Name" value={holderName} onChange={setHolderName} placeholder="Full legal name" />
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Account Type</label>
                    <div className="flex p-1 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 shadow-inner">
                      {(["checking", "savings"] as const).map((t) => (
                        <button key={t} onClick={() => setAcctType(t)} className={`flex-1 py-3 text-xs font-bold rounded-xl capitalize transition-all ${acctType === t ? 'bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field icon={Landmark} label="Routing Number" value={routing} onChange={(v: string) => setRouting(v.replace(/\D/g, "").slice(0, 9))} placeholder="9 digits" mono hint={routing.length > 0 && routing.length < 9 ? `${routing.length}/9 digits` : undefined} />
                  <Field icon={Hash} label="Account Number" value={accountNum} onChange={(v: string) => setAccountNum(v.replace(/\D/g, ""))} placeholder="Account digits" mono />
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 shadow-inner mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Transfer Amount</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer">
                      {Object.keys(CURRENCY_SYMBOLS).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-slate-400 mr-2">{sym}</span>
                    <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-4xl font-black tracking-tighter text-slate-900 dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-slate-800" />
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                    <span className="text-xs font-medium text-slate-500">Available: {sym}{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Total + Fee: {fmt(total)}</span>
                  </div>
                  {num > availableBalance && <p className="text-xs font-bold text-rose-500 mt-2">Insufficient funds in {currency} wallet.</p>}
                </div>

                <div className="flex gap-4 pt-2">
                  <button onClick={() => setStep(0)} className="px-6 py-4 rounded-[20px] font-bold text-[15px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Back</button>
                  <button disabled={!canAdvance()} onClick={() => setStep(2)} className={`flex-1 py-4 rounded-[20px] font-black text-[15px] transition-all flex items-center justify-center gap-2 group ${canAdvance() ? 'bg-cyan-500 text-slate-900 shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.98]' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}>
                    Review Transfer <ArrowRight className={`w-5 h-5 transition-transform ${canAdvance() ? 'group-hover:translate-x-1' : ''}`} />
                  </button>
                </div>

              </motion.div>
            )}

            {/* STEP 2: REVIEW */}
            {step === 2 && (
              <motion.div key="step2" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">
                <div className="rounded-[24px] bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                  <div className="p-8 bg-slate-900 dark:bg-[#1a1a24] text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{type === "ach" ? "ACH Transfer" : "Wire Transfer"}</p>
                    <p className="text-5xl font-black text-white tracking-tighter">{fmt(num)}</p>
                    {fee > 0 && <p className="text-xs font-medium text-slate-400 mt-3">+{fmt(fee)} transfer fee</p>}
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      ["Recipient", holderName],
                      ["Bank", bankName],
                      ["Routing", `•••••${routing.slice(-4)}`],
                      ["Account", `•••••${accountNum.slice(-4)}`],
                      ["Funding Wallet", currency],
                      ["Deducted Total", fmt(total)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                        <span className="text-sm font-medium text-slate-500">{k}</span>
                        <span className={`text-sm font-bold ${k === 'Deducted Total' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button disabled={isGeneratingOtp} onClick={() => setStep(1)} className="px-6 py-4 rounded-[20px] font-bold text-[15px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Edit</button>
                  <button disabled={isGeneratingOtp} onClick={generateAndSendOtp} className="flex-1 py-4 rounded-[20px] font-black text-[15px] transition-all flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-[1.01] active:scale-[0.98]">
                    {isGeneratingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {isGeneratingOtp ? "Securing..." : "Confirm with OTP"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: OTP */}
            {step === 3 && (
              <motion.div key="step3" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6">
                  <Smartphone className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify Identity</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center max-w-[280px]">
                  Enter the 6-digit code sent to <strong className="text-slate-900 dark:text-white">•••• {userData.phone?.slice(-4) || "7823"}</strong>
                </p>

                {/* OTP Dots */}
                <div className="flex gap-4 mb-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={otpError ? { x: [-5, 5, -5, 5, 0], borderColor: "#ef4444", backgroundColor: "#fef2f2" } : { scale: i < otp.length ? 1.2 : 1, backgroundColor: i < otp.length ? (theme === "dark" ? "#fff" : "#0f172a") : "transparent", borderColor: i < otp.length ? (theme === "dark" ? "#fff" : "#0f172a") : (theme === "dark" ? "#334155" : "#cbd5e1") }}
                      transition={otpError ? { duration: 0.4 } : { duration: 0.2 }}
                      className="w-4 h-4 rounded-full border-2"
                    />
                  ))}
                </div>

                {/* State Handling (Loading vs Keypad) */}
                <AnimatePresence mode="wait">
                  {isVerifyingOtp ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10">
                      <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Processing Transfer...</p>
                    </motion.div>
                  ) : (
                    <motion.div key="keypad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-[280px]">
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k, idx) => (
                          k === "" ? <div key={idx} /> : (
                            <motion.button
                              key={idx}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleOtpKey(k)}
                              className="h-14 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/5 flex items-center justify-center text-xl font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm"
                            >
                              {k === "del" ? <Delete className="w-5 h-5 text-slate-500" /> : k}
                            </motion.button>
                          )
                        ))}
                      </div>
                      <div className="text-center">
                        {countdown > 0 ? (
                          <p className="text-xs font-medium text-slate-500">Resend in <strong className="text-slate-900 dark:text-white">00:{countdown.toString().padStart(2, "0")}</strong></p>
                        ) : (
                          <button onClick={generateAndSendOtp} disabled={isGeneratingOtp} className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-1 mx-auto hover:text-cyan-700">
                            {isGeneratingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />} Resend Code
                          </button>
                        )}
                        <button onClick={() => { setStep(2); setOtp(""); setOtpError(false); }} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel Transfer</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <motion.div key="step4" variants={pageVariants} initial="initial" animate="in" className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-6 ring-8 ring-emerald-50 dark:ring-emerald-500/10">
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Transfer Initiated</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[280px] leading-relaxed">
                  Your {type === "ach" ? "ACH" : "wire"} transfer of <strong className="text-slate-900 dark:text-white">{fmt(num)}</strong> is on its way to <strong className="text-slate-900 dark:text-white">{holderName}</strong>.
                </p>

                <div className="w-full flex gap-4 mt-auto">
                  <button onClick={reset} className="px-6 py-4 rounded-[20px] font-bold text-[15px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    New Transfer
                  </button>
                  <Link href="/dashboard" className="flex-1 py-4 rounded-[20px] font-black text-[15px] transition-all flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-[1.02]">
                    Dashboard
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function Field({ label, value, onChange, placeholder, mono, hint, icon: Icon }: any) {
  return (
    <div className="relative">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">{label}</label>
      <div className="absolute left-4 bottom-4 text-slate-400"><Icon className="w-5 h-5" /></div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500/50 dark:focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none shadow-inner ${mono ? "font-mono tracking-widest" : ""}`}
      />
      {hint && <p className="text-[10px] font-bold text-amber-500 mt-1.5 pl-1 absolute -bottom-5 left-0">{hint}</p>}
    </div>
  );
}