"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  QrCode, Copy, Share, Search, Plus, 
  CheckCircle2, Clock, XCircle, ChevronRight, 
  Link as LinkIcon, MessageSquare, Send, Smartphone
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const RECENT_REQUESTS = [
  { id: "req_1", name: "Marcus Chen", amount: 450.00, status: "Pending", date: "Today, 2:15 PM", note: "Dinner & Drinks", color: "from-blue-500 to-cyan-500" },
  { id: "req_2", name: "Sarah Jenkins", amount: 120.00, status: "Paid", date: "Yesterday", note: "Concert Tickets", color: "from-rose-500 to-orange-500" },
  { id: "req_3", name: "David Kim", amount: 85.50, status: "Expired", date: "Oct 10, 2026", note: "Uber split", color: "from-slate-500 to-slate-700" },
  { id: "req_4", name: "Elena Rodriguez", amount: 2500.00, status: "Paid", date: "Oct 05, 2026", note: "Project Advance", color: "from-indigo-500 to-purple-500" },
];

const QUICK_CONTACTS = [
  { id: "c_1", name: "Elena", color: "from-indigo-500 to-purple-500" },
  { id: "c_2", name: "Marcus", color: "from-blue-500 to-cyan-500" },
  { id: "c_3", name: "Sarah", color: "from-rose-500 to-orange-500" },
  { id: "c_4", name: "David", color: "from-slate-500 to-slate-700" },
];

export default function RequestFundsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [requestAmount, setRequestAmount] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Request Funds</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate payment links, share your QR code, or request directly.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-900 font-bold text-[13px] hover:scale-105 transition-all active:scale-95 shadow-lg shadow-cyan-500/20">
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
                  type="text" 
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
              <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-8">
                <button className="flex items-center justify-center gap-2 py-4 rounded-[16px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-[14px] transition-all active:scale-[0.98] shadow-xl">
                  <LinkIcon className="w-4 h-4" /> Generate Link
                </button>
                <button className="flex items-center justify-center gap-2 py-4 rounded-[16px] bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1a24] dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-[14px] transition-all active:scale-[0.98]">
                  <Send className="w-4 h-4" /> Send to Contact
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
                <div className="mt-5 inline-flex items-center gap-3 p-2 pr-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-inner">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-400/20">
                    <span className="text-[10px] font-black text-indigo-300">SN</span>
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">sixpay.me/satoshi</span>
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex sm:flex-col gap-3 shrink-0 w-full sm:w-auto">
                <button 
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-black text-[13px] transition-all active:scale-95 shadow-xl"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[13px] transition-all active:scale-95 backdrop-blur-md">
                  <Share className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: TRACKING & CONTACTS
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Contacts */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Quick Request</h3>
              <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5">
                <Search className="w-4 h-4 text-slate-500 dark:text-white" />
              </button>
            </div>

            <div className="p-6 flex gap-4 overflow-x-auto scrollbar-hide">
              <button className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center border-dashed group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                  <Plus className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">New</span>
              </button>

              {QUICK_CONTACTS.map((contact) => (
                <button key={`contact-${contact.id}`} className="flex flex-col items-center gap-2 shrink-0 group">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${contact.color} p-[2px] shadow-md group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#0A0A0C] border-2 border-white dark:border-[#0A0A0C] flex items-center justify-center overflow-hidden">
                      <span className="font-black text-slate-900 dark:text-white text-lg">{contact.name.charAt(0)}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate w-14 text-center">{contact.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pending / Recent Requests Tracker */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Request History</h3>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {RECENT_REQUESTS.map((req) => (
                <div key={req.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-colors">
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${req.color} flex items-center justify-center shadow-inner shrink-0 text-white font-bold text-lg`}>
                      {req.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-none">{req.name}</h4>
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
                      ${req.amount.toFixed(2)}
                    </p>
                    <span className={`mt-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                        req.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 
                        req.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 
                        'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
              <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                View All Requests <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}