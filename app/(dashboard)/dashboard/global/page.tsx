"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Globe, Send, Search, ChevronDown, Plus,
  ArrowDownUp, Clock, CheckCircle2, Check,
  Building2, Landmark, Plane, ShieldCheck,
  Zap, ArrowRight, RotateCcw, Delete, Smartphone,
  AlertCircle, Loader2, Sparkles, Users
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, addDoc, collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { useTheme } from "next-themes";

// --- TYPESCRIPT & DATA CONFIG ---
interface SystemFees {
  ach: number;
  wire: number;
}

const CURRENCY_CONFIG = {
  USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  EUR: { symbol: "€", name: "Euro", flag: "🇪🇺" },
  GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧" },
  JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" }, 
};

type CurrencyKey = keyof typeof CURRENCY_CONFIG;

const STEPS = ["Type", "Details", "Review", "OTP", "Done"];

const pageVariants: Variants = {
  initial: { opacity: 0, y: 15, filter: "blur(4px)" },
  in: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
  out: { opacity: 0, y: -15, filter: "blur(4px)", transition: { duration: 0.2, ease: "easeIn" } },
};

export default function GlobalTransferPage() {
  const [mounted, setMounted] = useState(false);
  const { user, userData, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // --- STATE MACHINE ---
  const [step, setStep] = useState(0);
  const [type, setType] = useState<"swift" | "sepa" | null>(null);

  // --- LIVE EXCHANGE RATES ---
  const [rates, setRates] = useState<Record<CurrencyKey, number>>({
    USD: 1.00, EUR: 0.92, GBP: 0.79, JPY: 151.45, AUD: 1.52, CAD: 1.35
  });

  // --- FORM DATA ---
  const [sendAmount, setSendAmount] = useState("");
  const [sendCurrency, setSendCurrency] = useState<CurrencyKey>("USD");
  const [receiveCurrency, setReceiveCurrency] = useState<CurrencyKey>("EUR");

  const [holderName, setHolderName] = useState("");
  const [country, setCountry] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [memo, setMemo] = useState("");

  // --- OTP & SECURITY ---
  const [toastMsg, setToastMsg] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [txId, setTxId] = useState("");

  // Real-time Transactions
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function fetchLiveRates() {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        if (data && data.rates) {
          setRates({
            USD: data.rates.USD || 1,
            EUR: data.rates.EUR || 0.92,
            GBP: data.rates.GBP || 0.79,
            JPY: data.rates.JPY || 151.45,
            AUD: data.rates.AUD || 1.52,
            CAD: data.rates.CAD || 1.35,
          });
        }
      } catch (error) {
        console.error("Failed to fetch live rates, using fallback.", error);
      }
    }
    fetchLiveRates();
  }, []);

  useEffect(() => {
    if (!user) return;
    const txQ = query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(txQ, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const autoRecipients = useMemo(() => {
    const recipientsMap = new Map();
    const colors = [
      "from-rose-500 to-orange-500", "from-blue-500 to-cyan-500",
      "from-indigo-500 to-purple-500", "from-emerald-500 to-teal-500",
      "from-slate-500 to-slate-700"
    ];

    transactions.forEach(tx => {
      if (!tx.isCredit && tx.category === "Transfer" && tx.title?.includes("Wire to ")) {
        const name = tx.title.replace("Global Wire to ", "").replace("Wire to ", "");

        if (!recipientsMap.has(name)) {
          const currencyMatch = tx.note?.match(/\(([A-Z]{3})\)/);
          const currency = currencyMatch ? currencyMatch[1] : "USD";
          const color = colors[name.length % colors.length];

          recipientsMap.set(name, {
            id: tx.id,
            name,
            currency,
            flag: CURRENCY_CONFIG[currency as CurrencyKey]?.flag || "🌐",
            bank: "Saved Account",
            lastSent: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            color
          });
        }
      }
    });

    return Array.from(recipientsMap.values()).slice(0, 5);
  }, [transactions]);

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

  const isFrozen = userStatus === "frozen" || userStatus === "suspended";
  const isTxRestricted = txStatus === "restricted";
  const isKycVerified = kycStatus === "verified" || kycStatus === "approved" || userData.role === "admin";
  
  // Is Blocked checks ALL conditions
  const isBlocked = isFrozen || isTxRestricted || !isKycVerified;

  // --- DYNAMIC BALANCE CALCULATIONS ---
  const availableBalance = userData.balances?.[sendCurrency] !== undefined 
    ? Number(userData.balances[sendCurrency]) 
    : (sendCurrency === "USD" ? Number(userData.balance || 0) : 0);

  const numAmount = parseFloat(sendAmount) || 0;

  const exchangeRate = rates[receiveCurrency] / rates[sendCurrency];
  const receiveAmount = numAmount * exchangeRate;

  const activeTransferTypes = [
    { id: "swift", label: "SWIFT Wire Transfer", icon: <Globe className="w-6 h-6" />, fee: 25, time: "1–3 business days", desc: "Global standard for secure international wire transfers. Reaches 150+ countries." },
    { id: "sepa", label: "Local Network (SEPA/ACH)", icon: <Building2 className="w-6 h-6" />, fee: 0, time: "2–5 business days", desc: "Slower, but uses local banking networks to avoid international wire fees." },
  ];

  const selectedType = activeTransferTypes.find((t) => t.id === type);
  const fee = selectedType ? selectedType.fee : 0;
  const totalDeducted = numAmount + fee;

  const fmtSend = (n: number) => `${CURRENCY_CONFIG[sendCurrency].symbol}${n.toLocaleString("en-US", { minimumFractionDigits: sendCurrency === 'JPY' ? 0 : 2, maximumFractionDigits: sendCurrency === 'JPY' ? 0 : 2 })}`;
  const fmtRecv = (n: number) => `${CURRENCY_CONFIG[receiveCurrency].symbol}${n.toLocaleString("en-US", { minimumFractionDigits: receiveCurrency === 'JPY' ? 0 : 2, maximumFractionDigits: receiveCurrency === 'JPY' ? 0 : 2 })}`;

  const showToast = (msg: string, duration = 4000) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), duration);
  };

  // --- FIX: ENFORCE BLOCKING IN ADVANCEMENT ---
  function canAdvance() {
    if (isBlocked) return false;
    if (step === 0) return !!type;
    if (step === 1) return holderName && country && swiftCode.length >= 8 && iban.length >= 10 && numAmount > 0 && totalDeducted <= availableBalance;
    if (step === 2) return true;
    return false;
  }

  async function generateAndSendOtp() {
    setIsGeneratingOtp(true);
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      if (user) await updateDoc(doc(db, "users", user.uid), { activeTransferOtp: code });
      setOtpCode(code);
      setOtp("");
      setOtpError(false);
      setCountdown(30);
      setStep(3);
      showToast(`📱 SMS: Your global transfer OTP is ${code}`, 8000);
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

            // Deduct Balance
            const updatePayload: any = {
              [`balances.${sendCurrency}`]: availableBalance - totalDeducted,
              activeTransferOtp: null
            };
            if (sendCurrency === "USD") updatePayload.balance = availableBalance - totalDeducted;

            await updateDoc(doc(db, "users", user.uid), updatePayload);

            // Record Transaction
            const newTxId = "GLB" + Math.random().toString(36).slice(2, 10).toUpperCase();
            await addDoc(collection(db, "users", user.uid, "transactions"), {
              transactionId: newTxId,
              amount: totalDeducted,
              currency: sendCurrency,
              category: "Transfer",
              isCredit: false,
              title: `Global Wire to ${holderName}`,
              note: `Sent ${fmtRecv(receiveAmount)} (${receiveCurrency}) via ${type?.toUpperCase()}`,
              accountEnding: iban.slice(-4),
              createdAt: new Date().toISOString(),
              status: "pending" // Set to pending to ensure admin approval flow
            });

            // Dispatch Notification
            await addDoc(collection(db, "users", user.uid, "notifications"), {
              title: "Global Transfer Initiated",
              message: `Your ${type?.toUpperCase()} transfer of ${fmtRecv(receiveAmount)} to ${holderName} has been processed successfully and is pending review.`,
              type: "transfer",
              isRead: false,
              createdAt: new Date().toISOString()
            });

            setTxId(newTxId);
            setStep(4);
          } catch (error: any) {
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
      }, 2000);
    }
  }

  function reset() {
    setStep(0); setType(null); setHolderName(""); setCountry("");
    setSwiftCode(""); setIban(""); setSendAmount(""); setMemo("");
    setOtp(""); setOtpError(false); setIsVerifyingOtp(false);
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8 relative">

      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Global Transfer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Send money internationally with real-time tracking.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" /> SWIFT Network
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ==========================================
            LEFT COLUMN: THE TRANSFER TERMINAL
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* --- FIX: DYNAMIC WARNING BANNERS (Now checks Tx Status) --- */}
          {isFrozen && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-[24px] p-5 flex items-start gap-4 animate-in slide-in-from-top-4">
              <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900 dark:text-white mb-1">Account Suspended</h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  {userData.suspensionReason || "Your account has been temporarily suspended. Please contact support."}
                </p>
              </div>
            </div>
          )}
          {!isFrozen && isTxRestricted && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[24px] p-5 flex items-start gap-4 animate-in slide-in-from-top-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-white mb-1">Transactions Restricted</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {userData.txRestrictionReason || "Outgoing transactions have been restricted on your account. Please contact support."}
                </p>
              </div>
            </div>
          )}
          {!isFrozen && !isTxRestricted && !isKycVerified && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[24px] p-5 flex items-start gap-4 animate-in slide-in-from-top-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-white mb-1">Verification Required</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">International wires require full KYC. Documents are under review.</p>
              </div>
            </div>
          )}

          <div className={`bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative group min-h-[550px] flex flex-col transition-opacity duration-300 ${isBlocked ? 'opacity-50 pointer-events-none' : ''}`}>

            <div className={`absolute top-0 right-0 w-[80%] h-[80%] blur-[100px] rounded-full pointer-events-none opacity-50 dark:opacity-30 transition-colors duration-1000 ${step === 4 ? 'bg-emerald-500/20' : 'bg-indigo-500/10'}`} />
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            <div className="p-6 sm:p-10 relative z-10 flex-1 flex flex-col">

              {step < 4 && (
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 dark:bg-white/5 -z-10 -translate-y-1/2" />
                  {STEPS.slice(0, 4).map((s, i) => {
                    const done = step > i;
                    const active = step === i;
                    return (
                      <div key={s} className="flex flex-col items-center gap-2 z-10 bg-white dark:bg-[#0A0A0C] px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${done ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' :
                            active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-2 border-slate-900 dark:border-white' :
                              'bg-white dark:bg-[#0A0A0C] border-2 border-slate-200 dark:border-white/10 text-slate-400'
                          }`}>
                          {done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-slate-900 dark:text-white' : done ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="relative flex-1">
                <AnimatePresence mode="wait">

                  {step === 0 && (
                    <motion.div key="step0" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Select delivery speed</h2>
                      <div className="grid grid-cols-1 gap-4">
                        {activeTransferTypes.map((t) => {
                          const isSelected = type === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => setType(t.id as any)}
                              className={`text-left p-6 rounded-[24px] border transition-all duration-300 flex flex-col sm:flex-row gap-6 ${isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.3)]'
                                  : 'bg-white dark:bg-[#111115] border-slate-200 dark:border-white/10 hover:border-indigo-500/50'
                                }`}
                            >
                              <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                                {t.icon}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.label}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed max-w-sm">{t.desc}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${isSelected ? 'bg-indigo-200/50 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                                    {t.fee === 0 ? "Free" : `Fee: $${t.fee}`}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500">
                                    {t.time}
                                  </span>
                                </div>
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

                  {step === 1 && (
                    <motion.div key="step1" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">

                      <div className="bg-slate-50 dark:bg-[#111115] rounded-[24px] p-5 sm:p-7 border border-slate-200 dark:border-white/[0.04] shadow-inner transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">You Send</span>
                          <span className="text-[12px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 bg-white dark:bg-[#1a1a24] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Balance: {fmtSend(availableBalance)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="relative w-full flex items-center gap-2">
                            <span className="text-3xl sm:text-4xl font-bold text-slate-400 dark:text-slate-600">
                              {CURRENCY_CONFIG[sendCurrency].symbol}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={sendAmount}
                              onChange={(e) => setSendAmount(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-800"
                              placeholder="0.00"
                            />
                          </div>

                          <select value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value as CurrencyKey)} className="appearance-none font-bold text-slate-900 dark:text-white bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 px-4 py-3 rounded-[16px] shadow-sm cursor-pointer outline-none">
                            {Object.keys(CURRENCY_CONFIG).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="relative py-2 pl-8 sm:pl-10">
                        <div className="absolute left-[39px] sm:left-[47px] top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10" />

                        <div className="space-y-4 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/10 flex items-center justify-center z-10 shadow-sm -ml-1">
                              <ArrowDownUp className="w-3 h-3 text-slate-500" />
                            </div>
                            <div className="flex items-center justify-between w-full pr-2">
                              <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Exchange Rate</span>
                              <span className="text-[13px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[24px] p-5 sm:p-7 border border-indigo-100 dark:border-indigo-500/10 shadow-inner transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-indigo-600/70 dark:text-indigo-400/70">Recipient Gets</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="relative w-full overflow-hidden flex gap-2 items-center">
                            <span className="relative text-3xl sm:text-4xl font-bold text-indigo-300 dark:text-indigo-500/50">
                              {CURRENCY_CONFIG[receiveCurrency].symbol}
                            </span>
                            <div className="w-full bg-transparent text-4xl sm:text-5xl font-black tracking-tighter text-indigo-900 dark:text-white truncate">
                              {receiveAmount > 0 ? receiveAmount.toLocaleString(undefined, { minimumFractionDigits: receiveCurrency === 'JPY' ? 0 : 2, maximumFractionDigits: receiveCurrency === 'JPY' ? 0 : 2 }) : "0.00"}
                            </div>
                          </div>

                          <select value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value as CurrencyKey)} className="appearance-none font-bold text-indigo-900 dark:text-white bg-white dark:bg-[#1a1a24] border border-indigo-100 dark:border-white/10 px-4 py-3 rounded-[16px] shadow-sm cursor-pointer outline-none">
                            {Object.keys(CURRENCY_CONFIG).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <Field label="Account Holder" value={holderName} onChange={setHolderName} placeholder="Full legal name" />
                        <Field label="Country" value={country} onChange={setCountry} placeholder="e.g. Germany" />
                        <Field label="SWIFT / BIC Code" value={swiftCode} onChange={setSwiftCode} placeholder="8 or 11 characters" mono />
                        <Field label="IBAN / Account No" value={iban} onChange={setIban} placeholder="International Bank Acct Num" mono />
                      </div>

                      {numAmount > availableBalance && <p className="text-xs font-bold text-rose-500 text-center">Insufficient funds in {sendCurrency} wallet</p>}

                      <div className="flex gap-4 pt-2">
                        <button onClick={() => setStep(0)} className="px-6 py-4 rounded-[20px] font-bold text-[15px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Back</button>
                        <button disabled={!canAdvance()} onClick={() => setStep(2)} className={`flex-1 py-4 rounded-[20px] font-black text-[15px] transition-all flex items-center justify-center gap-2 group ${canAdvance() ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 active:scale-[0.98]' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}>
                          Review Transfer <ArrowRight className={`w-5 h-5 transition-transform ${canAdvance() ? 'group-hover:translate-x-1' : ''}`} />
                        </button>
                      </div>

                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-6">
                      <div className="rounded-[24px] bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                        <div className="p-8 bg-slate-900 dark:bg-[#1a1a24] text-center">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sending International Wire</p>
                          <p className="text-5xl font-black text-white tracking-tighter">{fmtRecv(receiveAmount)}</p>
                          <p className="text-xs font-medium text-slate-400 mt-3">Recipient gets</p>
                        </div>
                        <div className="p-6 space-y-4">
                          {[
                            ["Recipient", holderName],
                            ["Destination", country],
                            ["IBAN", `•••••${iban.slice(-4)}`],
                            ["SWIFT/BIC", swiftCode],
                            ["Transfer Fee", fee > 0 ? fmtSend(fee) : "Free"],
                            ["Funding Wallet", sendCurrency],
                            ["Total Deducted", fmtSend(totalDeducted)],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                              <span className="text-sm font-medium text-slate-500">{k}</span>
                              <span className={`text-sm font-bold ${k === 'Total Deducted' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{v}</span>
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

                  {step === 3 && (
                    <motion.div key="step3" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col items-center justify-center h-full min-h-[350px]">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6">
                        <Smartphone className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify Identity</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center max-w-[280px]">
                        Enter the 6-digit code sent to <strong className="text-slate-900 dark:text-white">•••• {userData.phone?.slice(-4) || "7823"}</strong>
                      </p>

                      <div className="flex gap-4 mb-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <motion.div
                            key={i}
                            animate={otpError ? { x: [-5, 5, -5, 5, 0], borderColor: "#ef4444", backgroundColor: "#fef2f2" } : { scale: i < otp.length ? 1.2 : 1, backgroundColor: i < otp.length ? (isDark ? "#fff" : "#0f172a") : "transparent", borderColor: i < otp.length ? (isDark ? "#fff" : "#0f172a") : (isDark ? "#334155" : "#cbd5e1") }}
                            transition={otpError ? { duration: 0.4 } : { duration: 0.2 }}
                            className="w-4 h-4 rounded-full border-2"
                          />
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        {isVerifyingOtp ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Routing via SWIFT...</p>
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

                  {step === 4 && (
                    <motion.div key="step4" variants={pageVariants} initial="initial" animate="in" className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-6 ring-8 ring-emerald-50 dark:ring-emerald-500/10">
                        <Check className="w-10 h-10 text-white" strokeWidth={3} />
                      </motion.div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Wire Initiated</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[280px] leading-relaxed">
                        Your international transfer of <strong className="text-slate-900 dark:text-white">{fmtRecv(receiveAmount)}</strong> is en route to <strong className="text-slate-900 dark:text-white">{holderName}</strong> in {country}.
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

        </div>

        {/* ==========================================
            RIGHT COLUMN: RECIPIENTS & TRACKING
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">

            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Recipients</h3>
              <Search className="w-4 h-4 text-slate-500 dark:text-white" />
            </div>

            {autoRecipients.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <Users className="w-12 h-12 text-slate-300 dark:text-white/10 mb-4" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">No recent recipients</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Send an international wire and they will automatically appear here.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex gap-4 overflow-x-auto scrollbar-hide">
                  {autoRecipients.map((rec: any) => (
                    <button
                      key={`avatar-${rec.id}`}
                      onClick={() => { if (step === 1) { setHolderName(rec.name); setReceiveCurrency(rec.currency as CurrencyKey); showToast(`Loaded ${rec.name}`); } }}
                      className="flex flex-col items-center gap-2 shrink-0 group"
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${rec.color} p-[2px] shadow-md group-hover:scale-105 transition-transform`}>
                          <div className="w-full h-full rounded-full bg-white dark:bg-[#0A0A0C] border-2 border-white dark:border-[#0A0A0C] flex items-center justify-center overflow-hidden">
                            <span className="font-black text-slate-900 dark:text-white">{rec.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#0A0A0C] flex items-center justify-center text-[10px]">
                          {rec.flag}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate w-16 text-center">{rec.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 space-y-2">
                  {autoRecipients.map((rec: any) => (
                    <div
                      key={`list-${rec.id}`}
                      onClick={() => { if (step === 1) { setHolderName(rec.name); setReceiveCurrency(rec.currency as CurrencyKey); showToast(`Loaded ${rec.name}`); } }}
                      className="p-4 rounded-[20px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rec.color} flex items-center justify-center shadow-inner shrink-0 text-white font-bold`}>
                          {rec.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-none">{rec.name}</h4>
                          <p className="text-[11px] font-medium text-slate-500 mt-1.5 flex items-center gap-1">
                            <Landmark className="w-3 h-3" /> {rec.bank} • {rec.currency}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-400 block mb-1">{rec.lastSent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            <Globe className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000" strokeWidth={1} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> In Transit
                </div>
                <span className="text-xs font-bold text-slate-400">Ref: #{txId || "GLB-9021"}</span>
              </div>

              <h3 className="text-white font-bold text-lg leading-tight">Transfer to {step === 4 ? holderName : "Maria Garcia"}</h3>
              <p className="text-slate-400 text-sm mt-1">{step === 4 ? fmtRecv(receiveAmount) : "€1,500.00"} • Arriving Soon</p>

              <div className="mt-8 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-700/50" />

                <div className="space-y-6">
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Funds Deducted</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Processed</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                      <Plane className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Cross-border Routing</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Processing via Swift</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 relative z-10 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Bank Processing</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Awaiting Destination Bank</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/dashboard/transactions" className="w-full mt-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[13px] transition-colors flex justify-center items-center">
                View Receipt
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono, hint }: any) {
  return (
    <div className="relative">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none shadow-inner ${mono ? "font-mono tracking-widest" : ""}`}
      />
      {hint && <p className="text-[10px] font-bold text-amber-500 mt-1.5 pl-1 absolute -bottom-5 left-0">{hint}</p>}
    </div>
  );
}