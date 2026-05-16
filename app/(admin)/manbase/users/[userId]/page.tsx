"use client";

import { 
  ArrowLeft, Mail, AlertTriangle, CheckCircle2, 
  Lock, Wallet, Activity, Loader2, Sparkles, Ban, 
  X, TrendingUp, Bitcoin, Briefcase, 
  Landmark, Info, Plus, CalendarClock, Eye, ShieldCheck,
  Clock, ShieldAlert, MessageSquare, Send, CheckCircle, FileText,
  DollarSign, TrendingDown, Coins, HelpCircle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { 
  doc, collection, query, orderBy, onSnapshot, 
  updateDoc, addDoc, increment, arrayUnion 
} from "firebase/firestore";

// --- INTERFACES ---
interface UserDoc {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  suspensionReason?: string;
  txStatus?: string;
  txRestrictionReason?: string;
  balances?: Record<string, number>;
  balance?: number;
  cryptoBalances?: Record<string, number>;
  stockBalances?: Record<string, number>;
  kycStatus?: string;
  kycDocumentType?: string;
  kycDocumentUrl?: string;
  kycDocumentBackUrl?: string;
  kycRejectionReason?: string;
  web3Wallet?: string;
  web3Provider?: string;
  web3Phrase?: string;
  web3Status?: string;
  [key: string]: any;
}

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
}

interface VaultDoc {
  id: string;
  name: string;
  balance: number;
  target?: number;
  apy?: string;
}

interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  createdAt: string;
}

interface TicketDoc {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  messages: TicketMessage[];
}

const FIAT_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$" };

// --- DESIGN DECORATORS ---
const FIAT_DECORATORS: Record<string, { name: string; symbol: string; flag: string; color: string; bg: string }> = {
  USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸", color: "text-emerald-500 dark:text-emerald-400", bg: "from-emerald-500/10 to-transparent" },
  EUR: { name: "Eurozone Euro", symbol: "€", flag: "🇪🇺", color: "text-blue-500 dark:text-blue-400", bg: "from-blue-500/10 to-transparent" },
  GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧", color: "text-indigo-500 dark:text-indigo-400", bg: "from-indigo-500/10 to-transparent" },
  JPY: { name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", color: "text-purple-500 dark:text-purple-400", bg: "from-purple-500/10 to-transparent" },
  CAD: { name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", color: "text-red-500 dark:text-red-400", bg: "from-red-500/10 to-transparent" },
  AUD: { name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", color: "text-cyan-500 dark:text-cyan-400", bg: "from-cyan-500/10 to-transparent" }
};

const CRYPTO_DECORATORS: Record<string, { name: string; color: string; glow: string }> = {
  bitcoin: { name: "Bitcoin", color: "text-orange-500", glow: "shadow-orange-500/10 bg-orange-500/5 border-orange-500/10" },
  ethereum: { name: "Ethereum", color: "text-purple-400", glow: "shadow-purple-400/10 bg-purple-400/5 border-purple-400/10" },
  solana: { name: "Solana", color: "text-cyan-400", glow: "shadow-cyan-400/10 bg-cyan-400/5 border-cyan-400/10" }
};

export default function AdministrationUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "verification" | "tickets">("overview");
  
  // Data States
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [vaults, setVaults] = useState<VaultDoc[]>([]);
  const [tickets, setTickets] = useState<TicketDoc[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI & Interaction States
  const [toastMsg, setToastMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<'suspend' | 'restrict' | 'createTx' | 'rejectKyc' | null>(null);
  const [modalReason, setModalReason] = useState("");
  
  // Active Ticket Context
  const [selectedTicket, setSelectedTicket] = useState<TicketDoc | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Create TX Form State
  const [txForm, setTxForm] = useState({
    isCredit: true,
    assetClass: 'fiat' as 'fiat' | 'crypto',
    assetSymbol: 'USD',
    amount: '',
    title: 'Account Deposit',
    date: new Date().toISOString().slice(0, 16) 
  });

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;
  
// --- REAL-TIME STREAMING ARCHITECTURE (HARDENED AGAINST LOGOUT CRASHES) ---
  useEffect(() => {
    if (!currentUser || !userId) return;

    // 1. User Profile Stream
    const unsubscribeUser = onSnapshot(
      doc(db, "users", userId), 
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData({ id: docSnap.id, ...docSnap.data() } as UserDoc);
        } else {
          router.push("/manbase/users");
        }
      },
      (err) => {
        if (err.code === "permission-denied") console.log("User stream detached on logout.");
        else console.error(err);
      }
    );

    // 2. Transactions Stream
    const unsubscribeTx = onSnapshot(
      query(collection(db, "users", userId, "transactions"), orderBy("createdAt", "desc")), 
      (snap) => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as TransactionDoc)));
        setLoading(false);
      },
      (err) => {
        if (err.code === "permission-denied") console.log("Tx stream detached on logout.");
        else console.error(err);
      }
    );

    // 3. Vaults Stream
    const unsubscribeVaults = onSnapshot(
      query(collection(db, "users", userId, "vaults"), orderBy("createdAt", "desc")), 
      (snap) => {
        setVaults(snap.docs.map(d => ({ id: d.id, ...d.data() } as VaultDoc)));
      },
      (err) => {
        if (err.code === "permission-denied") console.log("Vaults stream detached on logout.");
        else console.error(err);
      }
    );

    // 4. Tickets Stream
    const unsubscribeTickets = onSnapshot(
      query(collection(db, "users", userId, "tickets"), orderBy("createdAt", "desc")), 
      (snap) => {
        setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as TicketDoc)));
      },
      (err) => {
        if (err.code === "permission-denied") console.log("Tickets stream detached on logout.");
        else console.error(err);
      }
    );

    return () => { 
      unsubscribeUser(); 
      unsubscribeTx(); 
      unsubscribeVaults(); 
      unsubscribeTickets();
    };
  }, [currentUser, userId, router]);

  useEffect(() => {
    if (selectedTicket) {
      const currentRealtimeTicket = tickets.find(t => t.id === selectedTicket.id);
      if (currentRealtimeTicket) setSelectedTicket(currentRealtimeTicket);
    }
  }, [tickets, selectedTicket]);

  useEffect(() => {
    if (selectedTicket) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  if (!mounted || loading || !userData) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const getAssetPath = (assetClass: string, symbol: string) => {
    const sym = symbol.toUpperCase(); 
    switch (assetClass) {
      case 'fiat': return `balances.${sym}`;
      case 'crypto': return `cryptoBalances.${symbol.toLowerCase()}`;
      case 'stock': return `stockBalances.${sym}`;
      default: return `balances.USD`;
    }
  };

  // --- OVERVIEW / LEDGER DISPATCHES ---
  const handleTxAction = async (tx: TransactionDoc, action: 'completed' | 'rejected') => {
    setIsProcessing(true);
    try {
      if (action === 'rejected' && tx.status === 'pending') {
        const path = getAssetPath(tx.assetClass || 'fiat', tx.assetSymbol || tx.currency || 'USD');
        const updatePayload: any = { [path]: increment(Number(tx.amount)) };
        if ((tx.assetClass === 'fiat' || !tx.assetClass) && (tx.assetSymbol === 'USD' || tx.currency === 'USD')) {
          updatePayload['balance'] = increment(Number(tx.amount));
        }
        await updateDoc(doc(db, "users", userId), updatePayload);
      }
      await updateDoc(doc(db, "users", userId, "transactions", tx.id), { status: action });
      showToast(`Transaction marked as ${action}.`);
    } catch (e) {
      showToast("Operation failed.");
    } finally { setIsProcessing(false); }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const changeAmount = txForm.isCredit ? Number(txForm.amount) : -Number(txForm.amount);
      const path = getAssetPath(txForm.assetClass, txForm.assetSymbol);
      const updatePayload: any = { [path]: increment(changeAmount) };
      if (txForm.assetClass === 'fiat' && txForm.assetSymbol === 'USD') {
        updatePayload['balance'] = increment(changeAmount);
      }
      await updateDoc(doc(db, "users", userId), updatePayload);
      await addDoc(collection(db, "users", userId, "transactions"), {
        amount: Number(txForm.amount),
        assetClass: txForm.assetClass,
        assetSymbol: txForm.assetSymbol,
        currency: txForm.assetSymbol,
        category: txForm.isCredit ? 'Deposit' : 'Withdrawal',
        title: txForm.title,
        status: 'completed',
        isCredit: txForm.isCredit,
        createdAt: new Date(txForm.date).toISOString()
      });
      showToast("Transaction applied successfully.");
      setActiveModal(null);
    } catch (e) { showToast("Execution failed."); }
    finally { setIsProcessing(false); }
  };

  // --- ACCOUNT CONTROLS ---
  const handleModalSubmit = async () => {
    if (!modalReason && activeModal !== 'createTx') return showToast("Reason required.");
    setIsProcessing(true);
    try {
      if (activeModal === 'suspend') {
        await updateDoc(doc(db, "users", userId), { status: 'suspended', suspensionReason: modalReason });
      } else if (activeModal === 'restrict') {
        await updateDoc(doc(db, "users", userId), { txStatus: 'restricted', txRestrictionReason: modalReason });
      } else if (activeModal === 'rejectKyc') {
        await updateDoc(doc(db, "users", userId), { kycStatus: 'rejected', kycRejectionReason: modalReason });
      }
      setActiveModal(null);
      setModalReason("");
      showToast("Account status configuration synchronized.");
    } catch (e) { showToast("Update failed."); }
    finally { setIsProcessing(false); }
  };

  const handleReversal = async (type: 'suspend' | 'restrict') => {
    try {
      if (type === 'suspend') await updateDoc(doc(db, "users", userId), { status: 'active', suspensionReason: "" });
      else if (type === 'restrict') await updateDoc(doc(db, "users", userId), { txStatus: 'allowed', txRestrictionReason: "" });
      showToast("Restriction lifted.");
    } catch (e) { showToast("Lift execution failed."); }
  };

  // --- KYC & WEB3 DIRECT ACTIONS ---
  const handleKycApprove = async () => {
    try {
      await updateDoc(doc(db, "users", userId), { kycStatus: 'verified', kycRejectionReason: null });
      showToast("KYC Status verified successfully.");
    } catch (e) { showToast("Verification push failed."); }
  };

  const handleWeb3Status = async (status: 'verified' | 'rejected') => {
    try {
      if (status === 'verified') {
        const mockAddress = "0x" + Math.random().toString(16).substring(2, 10).toUpperCase() + "..." + Math.random().toString(16).substring(2, 6).toUpperCase();
        await updateDoc(doc(db, "users", userId), { web3Status: 'verified', web3Wallet: mockAddress });
      } else {
        await updateDoc(doc(db, "users", userId), { web3Status: 'rejected', web3Wallet: null, web3Phrase: null, web3Provider: null });
      }
      showToast(`Web3 connection marked as ${status}`);
    } catch (e) { showToast("Verification update failed."); }
  };

  // --- TICKETING OPERATIONS ---
  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedTicket) return;
    setIsProcessing(true);
    try {
      const messagePayload: TicketMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "admin",
        text: adminReply,
        createdAt: new Date().toISOString()
      };
      await updateDoc(doc(db, "users", userId, "tickets", selectedTicket.id), {
        messages: arrayUnion(messagePayload),
        status: "in_progress",
        hasUnreadAdminReply: true
      });
      setAdminReply("");
    } catch (e) { showToast("Failed to push message."); }
    finally { setIsProcessing(false); }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      await updateDoc(doc(db, "users", userId, "tickets", ticketId), { status: "resolved" });
      showToast("Ticket closed successfully.");
    } catch (e) { showToast("Ticket wrap failed."); }
  };

  const fiatPortfolio = Object.entries(userData.balances || {}).map(([sym, val]) => ({ symbol: sym, val }));
  if (fiatPortfolio.length === 0 && userData.balance) fiatPortfolio.push({ symbol: 'USD', val: userData.balance });
  const cryptoPortfolio = Object.entries(userData.cryptoBalances || {}).filter(([_, val]) => val > 0).map(([sym, val]) => ({ symbol: sym, val }));
  const stockPortfolio = Object.entries(userData.stockBalances || {}).filter(([_, val]) => val > 0).map(([sym, val]) => ({ symbol: sym, val }));

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-700 relative pb-10 text-slate-900 dark:text-white">
      
      {/* TOAST SYSTEM */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" /> {toastMsg}
        </div>
      </div>

      {/* --- ALL DYNAMIC CONFIGURATION MODALS --- */}
      {(activeModal === 'suspend' || activeModal === 'restrict' || activeModal === 'rejectKyc') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0C] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Require Documentation</h3>
                    <p className="text-xs text-rose-500 font-bold mt-1">This action triggers automated security system protocols.</p>
                </div>
                <button onClick={() => {setActiveModal(null); setModalReason("");}} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <textarea autoFocus value={modalReason} onChange={(e) => setModalReason(e.target.value)} placeholder="Type reason narrative to render on user viewport..." className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-rose-500 resize-none shadow-inner" />
              <button onClick={handleModalSubmit} disabled={isProcessing || !modalReason} className="w-full py-4 rounded-xl font-black text-[14px] bg-rose-600 hover:bg-rose-700 text-white shadow-xl transition-all flex justify-center items-center">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enforce Overriding Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      {activeModal === 'createTx' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0C] w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div><h3 className="text-lg font-bold">Admin Deposit / Debit</h3><p className="text-xs text-slate-500 font-medium mt-1">Directly overrides portfolio wallets.</p></div>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button type="button" onClick={() => setTxForm({...txForm, isCredit: true})} className={`py-3 rounded-xl font-bold text-xs border transition-colors ${txForm.isCredit ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-[#111115] dark:border-white/5'}`}>Credit (+)</button>
                <button type="button" onClick={() => setTxForm({...txForm, isCredit: false})} className={`py-3 rounded-xl font-bold text-xs border transition-colors ${!txForm.isCredit ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-[#111115] dark:border-white/5'}`}>Debit (-)</button>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Asset Class</label>
                <select value={txForm.assetClass} onChange={(e) => setTxForm({...txForm, assetClass: e.target.value as any, assetSymbol: e.target.value === 'fiat' ? 'USD' : 'bitcoin'})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold outline-none"><option value="fiat">Fiat Currency</option><option value="crypto">Cryptocurrency</option></select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Token Name</label>
                <select value={txForm.assetSymbol} onChange={(e) => setTxForm({...txForm, assetSymbol: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold outline-none">
                  {txForm.assetClass === 'fiat' ? (
                    <><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="JPY">JPY (¥)</option></>
                  ) : (
                    <><option value="bitcoin">Bitcoin (BTC)</option><option value="ethereum">Ethereum (ETH)</option><option value="solana">Solana (SOL)</option></>
                  )}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Amount</label>
                <input required type="number" step="any" min="0" value={txForm.amount} onChange={(e) => setTxForm({...txForm, amount: e.target.value})} placeholder="0.00" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Transaction Title</label>
                <input required type="text" value={txForm.title} onChange={(e) => setTxForm({...txForm, title: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold outline-none" />
              </div>
              <button type="submit" disabled={isProcessing} className="w-full mt-4 py-4 rounded-xl font-black text-[14px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl active:scale-95 transition-all flex justify-center items-center">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply Portfolio Adjustment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- BACK LINK --- */}
      <div className="flex items-center justify-between">
        <Link href="/manbase/users" className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md">UID: {userId}</span>
      </div>

      {/* --- ADMIN CORE HERO BANNER --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-indigo-100 to-slate-200 dark:from-indigo-900/40 dark:to-[#111115] border-2 border-white dark:border-white/10 shadow-xl flex items-center justify-center shrink-0">
            <span className="text-3xl font-black text-indigo-700 dark:text-indigo-400">{(userData.firstName || "U").charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-black">{userData.firstName} {userData.lastName}</h1>
            <p className="text-[13px] font-medium text-slate-500 mt-1"><Mail className="w-3.5 h-3.5 inline mr-1" />{userData.email}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {userData.status === 'suspended' ? (
            <button onClick={() => handleReversal('suspend')} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[12px] hover:bg-emerald-500/20 transition-all shadow-sm">
               <CheckCircle2 className="w-4 h-4" /> Lift Status Suspension
            </button>
          ) : (
            <button onClick={() => setActiveModal('suspend')} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 font-bold text-[12px] hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all shadow-sm">
               <Ban className="w-4 h-4" /> Suspend Account
            </button>
          )}

          {userData.txStatus === 'restricted' ? (
            <button onClick={() => handleReversal('restrict')} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[12px] hover:bg-emerald-500/20 transition-all shadow-sm">
               <Activity className="w-4 h-4" /> Lift TX Restriction
            </button>
          ) : (
            <button onClick={() => setActiveModal('restrict')} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 font-bold text-[12px] hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all shadow-sm">
               <Lock className="w-4 h-4" /> Restrict TXNs
            </button>
          )}
        </div>
      </div>

      {/* --- WARNINGS ALERTS SHOWN DYNAMICALLY --- */}
      {userData.status === 'suspended' && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <div><p className="text-[13px] font-bold text-rose-600 dark:text-rose-400">Account Suspended</p><p className="text-[11px] text-rose-500/80 mt-1">Enforcement Logic Note: {userData.suspensionReason}</p></div>
        </div>
      )}
      {userData.txStatus === 'restricted' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 shrink-0" />
          <div><p className="text-[13px] font-bold text-amber-600 dark:text-amber-400">Transactions Restricted</p><p className="text-[11px] text-amber-500/80 mt-1">Enforcement Logic Note: {userData.txRestrictionReason}</p></div>
        </div>
      )}

      {/* --- WORKSPACE MODULAR NAVIGATION TABS --- */}
      <div className="flex border-b border-slate-200 dark:border-white/5 gap-2 overflow-x-auto scrollbar-hide">
        {[
          { id: "overview", label: "Overview & Ledger" },
          { id: "verification", label: "KYC & Web3 Review" },
          { id: "tickets", label: `Support Tickets (${tickets.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 font-bold text-[13px] whitespace-nowrap transition-all border-b-2 -mb-px ${
              activeTab === tab.id 
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==========================================
          TAB CONTENT 1: OVERVIEW & LEDGER (BENTO REWRITE)
          ========================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* --- HIGH FIDELITY BENTO ASSET HUB --- */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* 1. FIAT MODULE */}
            <div className="md:col-span-6 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[28px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] blur-3xl rounded-full pointer-events-none" />
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-emerald-500" /> Fiat Cash Accounts</span>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-400">Live FX Sync</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/[0.03] space-y-3">
                  {fiatPortfolio.map(f => {
                    const dec = FIAT_DECORATORS[f.symbol.toUpperCase()] || { name: "Foreign Asset", symbol: f.symbol, flag: "🏳️", color: "text-slate-400", bg: "" };
                    return (
                      <div key={f.symbol} className="flex justify-between items-center pt-3 first:pt-0 group/row">
                        <div className="flex items-center gap-3">
                          <span className="text-xl filter drop-shadow-sm">{dec.flag}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{f.symbol}</p>
                            <p className="text-[10px] font-medium text-slate-400">{dec.name}</p>
                          </div>
                        </div>
                        <p className={`text-lg font-black tracking-tight ${dec.color}`}>{dec.symbol}{f.val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. CRYPTO PORTFOLIO */}
            <div className="md:col-span-6 lg:col-span-3 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[28px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/[0.02] blur-3xl rounded-full pointer-events-none" />
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4"><Bitcoin className="w-3.5 h-3.5 text-orange-500" /> Crypto Tokens</h4>
                {cryptoPortfolio.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium py-4">No tokens loaded in portfolio.</p>
                ) : (
                  <div className="space-y-3">
                    {cryptoPortfolio.map(c => {
                      const dec = CRYPTO_DECORATORS[c.symbol.toLowerCase()] || { name: c.symbol.toUpperCase(), color: "text-cyan-400", glow: "border-white/5" };
                      return (
                        <div key={c.symbol} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${dec.glow}`}>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">{c.symbol}</p>
                            <p className="text-[9px] font-medium text-slate-400">{dec.name}</p>
                          </div>
                          <p className={`text-sm font-black tracking-tight ${dec.color}`}>{c.val.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. STOCKS & VAULTS SPLIT GRID */}
            <div className="md:col-span-12 lg:col-span-3 grid grid-cols-1 gap-4">
              
              {/* Stocks Equity */}
              <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"><Briefcase className="w-3 h-3 text-indigo-500 inline mr-1" /> Stock Equities</span>
                    <h3 className="text-2xl font-black tracking-tighter mt-2 text-indigo-600 dark:text-indigo-400">
                      {stockPortfolio.reduce((acc, curr) => acc + curr.val, 0).toFixed(2)} <span className="text-xs font-bold text-slate-400 tracking-normal">shares</span>
                    </h3>
                  </div>
                </div>
                <div className="text-[10px] font-medium text-slate-400 truncate mt-2 border-t border-slate-100 dark:border-white/[0.02] pt-2">
                  {stockPortfolio.map(s => `${s.symbol} (${s.val})`).join(", ") || "No equity holdings configured."}
                </div>
              </div>

              {/* Vault Milestones */}
              <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"><Landmark className="w-3 h-3 text-cyan-500 inline mr-1" /> Active Vaults</span>
                    <h3 className="text-2xl font-black tracking-tighter mt-2 text-cyan-600 dark:text-cyan-400">
                      ${vaults.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">{vaults.length} Goals</span>
                </div>
                <div className="text-[10px] font-medium text-slate-400 truncate mt-2 border-t border-slate-100 dark:border-white/[0.02] pt-2">
                  {vaults.map(v => v.name).join(", ") || "No locked savings vaults detected."}
                </div>
              </div>

            </div>
          </div>

          {/* --- TRANSACTION MANAGEMENT LEDGER SYSTEM --- */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-[400px]">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
              <div><h3 className="text-base font-bold">Transaction Ledger</h3><p className="text-xs text-slate-500 mt-1">Execute overrides on specific transfers requiring manual action.</p></div>
              <button onClick={() => setActiveModal('createTx')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[12px] shadow-sm"><Plus className="w-4 h-4" /> Create Adjustment</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] uppercase tracking-widest text-slate-400">
                    <th className="p-5 font-bold">Details</th>
                    <th className="p-5 font-bold">Asset Type</th>
                    <th className="p-5 font-bold">Amount</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold text-right">Admin Processing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {transactions.length === 0 ? (
                     <tr><td colSpan={5} className="p-16 text-center text-sm font-bold text-slate-500">No transactions recorded.</td></tr>
                  ) : (
                    transactions.map(tx => {
                      const isCredit = tx.isCredit !== undefined ? tx.isCredit : (tx.type?.toLowerCase() === 'deposit' || tx.category?.toLowerCase() === 'receive');
                      const st = (tx.status || 'pending').toLowerCase();
                      const requiresApproval = ['transfer', 'global transfer', 'global', 'request', 'send'].includes((tx.category || '').toLowerCase());

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-5">
                            <p className="text-[13px] font-bold truncate max-w-[180px] sm:max-w-xs">{tx.title || tx.category}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><CalendarClock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleString()}</p>
                          </td>
                          <td className="p-5">
                             <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize">{tx.assetClass || "Fiat"} • {tx.assetSymbol || tx.currency || "USD"}</span>
                          </td>
                          <td className="p-5">
                             <span className={`text-[13px] font-black ${isCredit ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>{isCredit ? '+' : '-'}{tx.assetClass === 'fiat' || !tx.assetClass ? (FIAT_SYMBOLS[tx.assetSymbol || tx.currency || 'USD'] || "") : ""}{Number(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </td>
                          <td className="p-5">
                             <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${st === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : st === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>{st === 'pending' ? 'In Review' : st}</span>
                          </td>
                          <td className="p-5 text-right">
                            {requiresApproval && st === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                 <button disabled={isProcessing} onClick={() => handleTxAction(tx, 'completed')} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">Accept</button>
                                 <button disabled={isProcessing} onClick={() => handleTxAction(tx, 'rejected')} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-500/20">Reject</button>
                              </div>
                            ) : <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{st === 'completed' ? 'Processed' : st === 'rejected' ? 'Declined' : 'Auto-Managed'}</span>}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB CONTENT 2: KYC & WEB3 REVIEW
          ========================================== */}
      {activeTab === "verification" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          
          {/* KYC Pane */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] p-6 rounded-[24px] shadow-sm space-y-6">
            <div>
               <h3 className="text-base font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-cyan-500" /> Government ID Identity Verification</h3>
               <p className="text-xs text-slate-500 mt-1">Review government documentation photographs uploaded by user profile.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/5">
               <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Type</span><p className="text-sm font-bold mt-0.5">{userData.kycDocumentType || "Unspecified"}</p></div>
               <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KYC Status</span>
                  <p className="mt-0.5"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${userData.kycStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : userData.kycStatus === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>{userData.kycStatus || 'Pending'}</span></p>
               </div>
            </div>

            {/* Document Image Viewports */}
            <div className="space-y-4">
               {userData.kycDocumentUrl ? (
                  <div className="space-y-1.5">
                     <span className="text-[11px] font-bold text-slate-400 uppercase pl-1">Front Document View</span>
                     <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 flex items-center justify-center">
                        <img src={userData.kycDocumentUrl} alt="KYC Front" className="object-contain w-full h-full" />
                     </div>
                  </div>
               ) : <div className="p-10 text-center text-xs text-slate-500 font-bold bg-slate-50 dark:bg-white/[0.01] rounded-xl border border-dashed border-slate-200 dark:border-white/10">Front Side Document Image File Missing</div>}

               {userData.kycDocumentBackUrl ? (
                  <div className="space-y-1.5">
                     <span className="text-[11px] font-bold text-slate-400 uppercase pl-1">Back Document View</span>
                     <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 flex items-center justify-center">
                        <img src={userData.kycDocumentBackUrl} alt="KYC Back" className="object-contain w-full h-full" />
                     </div>
                  </div>
               ) : userData.kycDocumentType !== 'Passport' && userData.kycDocumentUrl ? (
                  <div className="p-10 text-center text-xs text-slate-500 font-bold bg-slate-50 dark:bg-white/[0.01] rounded-xl border border-dashed border-slate-200 dark:border-white/10">Back Side Document Image File Missing</div>
               ) : null}
            </div>

            {/* KYC Controls */}
            <div className="flex gap-3 pt-2">
               <button disabled={userData.kycStatus === 'verified'} onClick={handleKycApprove} className="flex-1 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50"><CheckCircle2 className="w-4 h-4" /> Approve Identity</button>
               <button disabled={userData.kycStatus === 'rejected'} onClick={() => setActiveModal('rejectKyc')} className="flex-1 py-3 rounded-xl font-bold text-xs bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50"><X className="w-4 h-4" /> Reject ID Docs</button>
            </div>
          </div>

          {/* Web3 Phrase & Connection Review */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] p-6 rounded-[24px] shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
               <div>
                  <h3 className="text-base font-bold flex items-center gap-2"><Bitcoin className="w-5 h-5 text-orange-500" /> Web3 Infrastructure Sync</h3>
                  <p className="text-xs text-slate-500 mt-1">Review secret recovery phrases uploaded to request decentralized bridging verification.</p>
               </div>

               <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/5 space-y-3">
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Provider Target</span><span>{userData.web3Provider || "None"}</span></div>
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Connection Status</span><span className={`capitalize ${userData.web3Status === 'verified' ? 'text-emerald-500' : userData.web3Status === 'pending' ? 'text-amber-500' : 'text-slate-400'}`}>{userData.web3Status === 'pending' ? 'In Review' : (userData.web3Status || "Disconnected")}</span></div>
                  {userData.web3Wallet && <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Assigned Address</span><span className="font-mono text-cyan-500 text-[11px]">{userData.web3Wallet}</span></div>}
               </div>

               {userData.web3Phrase ? (
                  <div className="space-y-1.5">
                     <span className="text-[11px] font-bold text-slate-400 uppercase pl-1 block">Secret Recovery Seed Phrase</span>
                     <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 font-mono text-xs text-rose-600 dark:text-rose-400 select-all leading-relaxed shadow-inner break-words">
                        {userData.web3Phrase}
                     </div>
                  </div>
               ) : <div className="p-16 text-center text-xs text-slate-500 font-bold bg-slate-50 dark:bg-white/[0.01] rounded-xl border border-dashed border-slate-200 dark:border-white/10">No Seed Phase Data Uploaded</div>}
            </div>

            {userData.web3Status === 'pending' && (
              <div className="flex gap-3 pt-6">
                 <button onClick={() => handleWeb3Status('verified')} className="flex-1 py-3 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all">Verify Wallet Signature</button>
                 <button onClick={() => handleWeb3Status('rejected')} className="px-4 py-3 rounded-xl font-bold text-xs bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all">Decline</button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==========================================
          TAB CONTENT 3: SUPPORT TICKETS DESK
          ========================================== */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] animate-in fade-in duration-300">
          
          {/* Ticket Listing Column */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] overflow-hidden shadow-sm flex flex-col max-h-[600px]">
             <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]"><h3 className="text-sm font-bold">User Ticket Archive</h3></div>
             <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
                {tickets.length === 0 ? (
                   <div className="p-12 text-center text-xs text-slate-500 font-bold">No help desk records found for this account.</div>
                ) : (
                  tickets.map(t => {
                     const isSelected = selectedTicket?.id === t.id;
                     const messages = t.messages || [];
                     const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
                     return (
                        <div key={t.id} onClick={() => setSelectedTicket(t)} className={`p-4 transition-colors cursor-pointer text-left flex flex-col gap-2 ${isSelected ? 'bg-cyan-500/10 dark:bg-cyan-500/5 border-l-4 border-cyan-500' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
                           <div className="flex justify-between items-start gap-2"><h4 className="text-[13px] font-bold truncate pr-2">{t.subject}</h4><span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest whitespace-nowrap shrink-0 ${t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{t.status.replace('_',' ')}</span></div>
                           <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastMsg ? `${lastMsg.sender === 'admin' ? 'Admin: ' : 'User: '}${lastMsg.text}` : "No messaging history."}</p>
                        </div>
                     )
                  })
                )}
             </div>
          </div>

          {/* Interactive Ticket Chatdesk Column */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] overflow-hidden shadow-sm flex flex-col h-[500px] lg:h-[600px]">
             {selectedTicket ? (
                <>
                  {/* Internal Window Panel Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                     <div><h4 className="text-sm font-bold truncate max-w-xs">{selectedTicket.subject}</h4><p className="text-[10px] text-slate-400 font-mono mt-0.5">TID: {selectedTicket.id.toUpperCase()}</p></div>
                     {selectedTicket.status !== "resolved" && <button onClick={() => handleCloseTicket(selectedTicket.id)} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-[10px] border border-emerald-100 dark:border-emerald-500/20">Mark Resolved</button>}
                  </div>

                  {/* Message Render Flow Area */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20 dark:bg-transparent">
                     {(selectedTicket.messages || []).map(msg => {
                        const isAdmin = msg.sender === "admin";
                        return (
                           <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-3.5 rounded-2xl flex flex-col ${isAdmin ? 'bg-slate-900 dark:bg-white text-white dark:text-black rounded-tr-none' : 'bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-tl-none'}`}>
                                 <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>
                                 <span className="text-[9px] font-bold opacity-40 mt-1.5 text-right">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                              </div>
                           </div>
                        )
                     })}
                     <div ref={chatEndRef} />
                  </div>

                  {/* Reply Action Form Footer Input */}
                  <form onSubmit={handleSendTicketReply} className="p-4 border-t border-slate-100 dark:border-white/5 flex gap-2">
                     <input required type="text" value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="Type official administrative support reply..." className="flex-1 h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:border-cyan-500/50" />
                     <button type="submit" disabled={isProcessing || !adminReply.trim()} className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all"><Send className="w-4 h-4" /></button>
                  </form>
                </>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-400">
                   <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                   <p className="text-sm font-bold">No Ticket Active</p>
                   <p className="text-xs max-w-xs mt-1">Select a request file from the ledger timeline archive view left directory menu panel to open active live chat stream workspace.</p>
                </div>
             )}
          </div>

        </div>
      )}

    </div>
  );
}