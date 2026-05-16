"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Plus, Eye, EyeOff, Snowflake,
  Settings, Trash2, Copy, RefreshCw, ShoppingBag,
  CheckCircle2, Loader2, Sparkles, X, Activity, CreditCard,
  Lock, ShieldCheck
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, addDoc, deleteDoc, where } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface VirtualCard {
  id: string;
  name: string;
  type: "Multi-use" | "Single-use";
  number: string;
  fullNumber: string;
  expiry: string;
  cvv: string;
  theme: string;
  lightTheme: string;
  status: "Active" | "Frozen";
  monthlyLimit: number;
  spent: number;
  createdAt: string;
}

const CARD_THEMES = [
  { theme: "from-[#111115] via-[#1e1b4b] to-[#312e81]", lightTheme: "from-indigo-500 via-indigo-600 to-indigo-800" },
  { theme: "from-[#2a0845] via-[#831843] to-[#be123c]", lightTheme: "from-rose-400 via-rose-500 to-rose-700" },
  { theme: "from-[#022c22] via-[#064e3b] to-[#0f766e]", lightTheme: "from-emerald-400 via-emerald-500 to-emerald-700" },
  { theme: "from-[#171717] via-[#0f172a] to-[#082f49]", lightTheme: "from-cyan-600 via-cyan-700 to-cyan-900" }
];

export default function VirtualCardsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Real-time Data
  const { user, loading: authLoading } = useAuth();
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // UI States
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLimitOpen, setIsLimitOpen] = useState(false);

  // Form States
  const [newCardName, setNewCardName] = useState("");
  const [newCardType, setNewCardType] = useState<"Multi-use" | "Single-use">("Multi-use");
  const [newLimit, setNewLimit] = useState("");

  useEffect(() => setMounted(true), []);

  // 1. Fetch Cards
  useEffect(() => {
    if (!user) return;
    const cardsQ = query(collection(db, "users", user.uid, "virtualCards"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(cardsQ, (snapshot) => {
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VirtualCard));
      setCards(fetchedCards);

      if (activeCardIndex >= fetchedCards.length) {
        setActiveCardIndex(Math.max(0, fetchedCards.length - 1));
      }
      setDataLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const activeCard = cards[activeCardIndex];

  // 2. Fetch Transactions for Active Card
  useEffect(() => {
    if (!user || !activeCard) return;
    const txQ = query(
      collection(db, "users", user.uid, "transactions"),
      where("cardId", "==", activeCard.id),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(txQ, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user, activeCard]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted || authLoading || dataLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8 relative">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Virtual Cards</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Generate secure cards for online shopping and subscriptions.</p>
        </div>

        <button disabled className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] opacity-50 cursor-not-allowed shadow-md">
          <Plus className="w-4 h-4" /> Create Card
        </button>
      </div>

      {/* --- COMING SOON OVERLAY WRAPPER --- */}
      <div className="relative">
        
        {/* THE OVERLAY */}
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-[#0A0A0C]/60 backdrop-blur-sm rounded-[32px]">
          <div className="bg-white dark:bg-[#111115] px-8 py-8 rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 text-center animate-in zoom-in-95 duration-700 max-w-sm mx-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mx-auto mb-5 border border-cyan-100 dark:border-cyan-500/20">
               <CreditCard className="w-8 h-8 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Coming Soon</h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              We are putting the final touches on our secure Virtual Cards engine. Get ready for a safer, anonymous way to shop online.
            </p>
            <Link href="/dashboard" className="inline-block px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold text-xs transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </div>

        {/* UNDERLYING UI (Blurred, Non-interactive) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pointer-events-none select-none opacity-80">

          {/* ==========================================
              LEFT COLUMN: ACTIVE CARD & ACTIONS
              ========================================== */}
          <div className="lg:col-span-7 space-y-6">

            {/* Card Carousel Area */}
            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl p-6 sm:p-8 flex flex-col items-center min-h-[400px]">

              {/* Fake Mock Card for the visual */}
              <div className={`w-full max-w-[380px] aspect-[1.586/1] rounded-[24px] p-6 sm:p-7 relative overflow-hidden shadow-2xl dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.3)] bg-gradient-to-br from-[#111115] via-[#1e1b4b] to-[#312e81]`}>
                
                <div className="absolute inset-0 opacity-[0.35] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 blur-[50px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-white/90 text-sm tracking-wide">Online Shopping</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md inline-block w-max bg-white/10 text-white border border-white/20">
                        Multi-use
                      </span>
                    </div>
                    <div className="text-white/90 font-black text-xl italic tracking-tighter drop-shadow-md">VISA</div>
                  </div>

                  <div className="mt-auto">
                    <p className="text-[16px] sm:text-[18px] font-mono tracking-[0.15em] text-white drop-shadow-md opacity-80">
                      •••• •••• •••• 4092
                    </p>

                    <div className="flex justify-between items-end mt-4">
                      <div className="flex gap-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Valid Thru</span>
                          <span className="text-[14px] font-mono font-medium text-white drop-shadow-sm">••/••</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">CVV</span>
                          <span className="text-[14px] font-mono font-medium text-white drop-shadow-sm">•••</span>
                        </div>
                      </div>
                      <div className="w-10 h-7 rounded-[4px] bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 opacity-80 mix-blend-overlay border border-white/20 flex flex-col justify-evenly px-1">
                        <div className="w-full h-[1px] bg-black/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake Pagination Dots */}
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                <div className="h-1.5 rounded-full w-6 bg-slate-900 dark:bg-white" />
                <div className="h-1.5 rounded-full w-1.5 bg-slate-300 dark:bg-white/20" />
              </div>

              {/* Fake Action Buttons */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full mt-6 sm:mt-8">
                <ActionButton icon={Eye} label="Reveal" />
                <ActionButton icon={Snowflake} label="Freeze" />
                <ActionButton icon={Settings} label="Settings" />
                <ActionButton icon={Trash2} label="Terminate" danger={true} />
              </div>
            </div>

            {/* Fake Recent Transactions */}
            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Activity • Online Shopping</h3>
                <span className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400">View All</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                <div className="p-8 text-center flex flex-col items-center">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-white/10 mb-3" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No transactions yet</p>
                </div>
              </div>
            </div>

          </div>

          {/* ==========================================
              RIGHT COLUMN: LIMITS & DISCOVERY
              ========================================== */}
          <div className="lg:col-span-5 space-y-6">

            {/* Fake Spend Limit */}
            <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Monthly Spending Limit
              </h3>

              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">$0.00</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium"> / $1000</span>
                </div>
                <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">0% Used</span>
              </div>

              <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden border border-slate-200 dark:border-white/5 mb-6" />

              <button className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-[12px] font-bold text-slate-700 dark:text-slate-300">
                Edit Limit
              </button>
            </div>

            {/* Promo: Disposable Cards */}
            <div className="bg-gradient-to-br from-rose-900 to-slate-900 dark:from-[#4c0519] dark:to-[#0A0A0C] border border-rose-800 dark:border-rose-500/20 rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 blur-[50px] rounded-full" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/20 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6 text-rose-100" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Stay Anonymous Online</h3>
                <p className="text-[13px] text-rose-100/80 mt-2 leading-relaxed">
                  Generate a single-use virtual card. The card details instantly destroy themselves and regenerate after one purchase. Perfect for untrusted websites.
                </p>

                <button className="mt-6 px-5 py-2.5 rounded-xl bg-white text-rose-900 font-bold text-[12px] shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  Create Disposable Card
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- MICRO COMPONENTS ---

function ActionButton({ icon: Icon, label, danger = false }: { icon: any, label: string, danger?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 group">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[18px] flex items-center justify-center border ${
            danger
            ? 'bg-slate-50 dark:bg-[#111115] border-slate-200 dark:border-white/[0.05] text-rose-500'
            : 'bg-slate-50 dark:bg-[#111115] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-300'
        }`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span className={`text-[10px] sm:text-[11px] font-bold tracking-wide ${danger ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}