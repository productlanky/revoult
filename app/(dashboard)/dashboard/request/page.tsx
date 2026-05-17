"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  QrCode, Copy, Share, Search,
  CheckCircle2, Clock, XCircle, ChevronRight,
  Link as LinkIcon, MessageSquare, Smartphone,
  Loader2, Sparkles, HandCoins, X
} from "lucide-react";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit, addDoc } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface PaymentRequest {
  id: string;
  amount: number;
  note: string;
  status: "Pending" | "Paid" | "Expired";
  contactName: string;
  color?: string;
  createdAt: string;
}

export default function RequestFundsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Real-time Auth & Data
  const { user, userData, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [requestAmount, setRequestAmount] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI States
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Fetch Live Requests
  useEffect(() => {
    if (!user) return;

    const reqQ = query(collection(db, "users", user.uid, "requests"), orderBy("createdAt", "desc"), limit(20));

    // Added the error callback as the third argument
    const unsubscribe = onSnapshot(
      reqQ,
      (snapshot) => {
        setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRequest)));
        setLoading(false);
      },
      (error) => {
        if (error.code === "permission-denied") {
          console.log("Requests stream safely detached during logout.");
        } else {
          console.error("Firestore requests snapshot error:", error);
        }
        setLoading(false); // Stop the loading spinner even if it disconnects
      }
    );

    return () => unsubscribe();
  }, [user]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted || authLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  // --- ACTIONS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCopyLink = (linkToCopy: string) => {
    navigator.clipboard.writeText(linkToCopy);
    setCopied(true);
    showToast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate a generic sharable request link
  const handleGenerateLink = async () => {
    const numAmount = parseFloat(requestAmount);
    if (isNaN(numAmount) || numAmount <= 0) return showToast("Enter a valid amount");
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Create a trackable request in DB
      await addDoc(collection(db, "users", user.uid, "requests"), {
        amount: numAmount,
        note: requestNote || "Shared Link Request",
        status: "Pending",
        contactName: "Shared Link",
        color: "from-emerald-500 to-teal-500",
        createdAt: new Date().toISOString()
      });

      // Construct and copy link
      const username = userData.firstName?.toLowerCase() || "pay";
      const customLink = `https://sixpay.me/${username}/${numAmount}`;
      handleCopyLink(customLink);

      setRequestAmount("");
      setRequestNote("");
    } catch (error) {
      showToast("Failed to generate link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const personalLink = `sixpay.me/${userData.firstName?.toLowerCase() || 'user'}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`https://${personalLink}`)}`;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8 relative">

      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- QR CODE MODAL --- */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <button onClick={() => setIsQrModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your QR Code</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Scan to pay {userData.firstName}</p>

            {/* QR Code Graphic - Forced white background so it scans perfectly in dark mode */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-md mb-8">
              <img src={qrCodeUrl} alt="Personal QR Code" className="w-48 h-48 rounded-xl object-contain" />
            </div>

            <button
              onClick={() => handleCopyLink(`https://${personalLink}`)}
              className="w-full py-4 rounded-[16px] font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-transform active:scale-95 shadow-xl hover:scale-[1.02]"
            >
              Copy Payment Link
            </button>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Request Funds</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate payment links or share your QR code.</p>
        </div>
        <button onClick={() => setIsQrModalOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-900 font-bold text-[13px] hover:scale-105 transition-all active:scale-95 shadow-lg shadow-cyan-500/20">
          <QrCode className="w-4 h-4" strokeWidth={2.5} /> <span className="hidden sm:inline">Show QR</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ==========================================
            LEFT COLUMN: THE REQUEST TERMINAL
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* Main Input Terminal */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative group">

            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none opacity-50 dark:opacity-30 transition-colors" />
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            <div className="p-8 sm:p-10 relative z-10 flex flex-col items-center justify-center min-h-[380px]">

              <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
                Set Amount
              </span>

              {/* Massive Amount Input */}
              <div className="relative flex items-center justify-center w-full">
                <span className={`text-4xl sm:text-6xl font-bold transition-colors ${requestAmount ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="bg-transparent border-none outline-none text-6xl sm:text-[80px] font-black tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-800 text-center w-full max-w-[300px] sm:max-w-[400px] p-0"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {/* Note Input */}
              <div className="mt-8 w-full max-w-sm relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a24] flex items-center justify-center text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="What's this for?"
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500/50 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none shadow-inner"
                />
              </div>

              {/* Quick Actions Dock */}
              <div className="w-full max-w-sm mt-8">
                <button
                  disabled={isSubmitting || !requestAmount}
                  onClick={handleGenerateLink}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-[16px] font-bold text-[14px] transition-all shadow-xl ${requestAmount ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 active:scale-[0.98]' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LinkIcon className="w-4 h-4" /> Generate Payment Link</>}
                </button>
              </div>

            </div>
          </div>

          {/* Personal Payment Link Card (Glassmorphic) */}
          <div className="bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-[#0A0A0C] border border-indigo-800 dark:border-indigo-500/30 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            {/* Texture & Glow */}
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-inner">
                  <Smartphone className="w-6 h-6 text-indigo-100" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Your Payment Link</h3>
                <p className="text-sm text-indigo-200/70 mt-1 leading-relaxed max-w-[280px]">
                  Share this permanent link. Anyone can pay you instantly via card or bank transfer.
                </p>

                {/* The Link Pill */}
                <div className="mt-5 inline-flex items-center gap-3 p-2 pr-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-inner overflow-hidden max-w-full">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-400/20 shrink-0">
                    <span className="text-[10px] font-black text-indigo-300">
                      {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide truncate">{personalLink}</span>
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex sm:flex-col gap-3 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleCopyLink(`https://${personalLink}`)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-black text-[13px] transition-all active:scale-95 shadow-xl"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button onClick={() => showToast("Opening sharing options...")} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[13px] transition-all active:scale-95 backdrop-blur-md">
                  <Share className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: TRACKING & HISTORY
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">

          {/* Pending / Recent Requests Tracker */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Request History</h3>
              <Search className="w-4 h-4 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] flex-1">
              {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-cyan-500 animate-spin" /></div>
              ) : requests.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <HandCoins className="w-12 h-12 text-slate-300 dark:text-white/10 mb-4" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No requests yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Links you generate to request funds will appear here.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-colors">

                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${req.color || 'from-slate-500 to-slate-700'} flex items-center justify-center shadow-inner shrink-0 text-white font-bold text-lg`}>
                        {req.contactName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-none">{req.contactName}</h4>
                        <p className="text-[12px] text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
                          {req.status === "Pending" && <Clock className="w-3 h-3 text-amber-500" />}
                          {req.status === "Paid" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          {req.status === "Expired" && <XCircle className="w-3 h-3 text-slate-400" />}
                          {req.note}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <p className={`text-[16px] font-black ${req.status === "Paid" ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        ${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`mt-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${req.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                          req.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                            'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'
                        }`}>
                        {req.status}
                      </span>
                    </div>

                  </div>
                ))
              )}
            </div>

            {requests.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01] mt-auto">
                <button onClick={() => showToast("Loading full history...")} className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                  View All Requests <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}