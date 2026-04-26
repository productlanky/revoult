"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Send, Search, Plus, CheckCircle2, Clock, 
  ChevronRight, MessageSquare, Wallet, User, 
  ArrowRight, ShieldCheck, QrCode, Smartphone
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const RECENT_TRANSFERS = [
  { id: "tr_1", name: "Elena Rodriguez", amount: 450.00, status: "Sent", date: "Today, 2:15 PM", note: "Dinner & Drinks", color: "from-blue-500 to-cyan-500" },
  { id: "tr_2", name: "Marcus Chen", amount: 120.00, status: "Sent", date: "Yesterday", note: "Concert Tickets", color: "from-indigo-500 to-purple-500" },
  { id: "tr_3", name: "David Kim", amount: 85.50, status: "Pending", date: "Oct 10, 2026", note: "Uber split", color: "from-slate-500 to-slate-700" },
  { id: "tr_4", name: "Sarah Jenkins", amount: 2500.00, status: "Sent", date: "Oct 05, 2026", note: "Project Advance", color: "from-rose-500 to-orange-500" },
];

const CONTACTS = [
  { id: "c_1", name: "Elena", fullName: "Elena Rodriguez", handle: "@elena_r", color: "from-blue-500 to-cyan-500" },
  { id: "c_2", name: "Marcus", fullName: "Marcus Chen", handle: "@marcusc", color: "from-indigo-500 to-purple-500" },
  { id: "c_3", name: "Sarah", fullName: "Sarah Jenkins", handle: "@sjenkins", color: "from-rose-500 to-orange-500" },
  { id: "c_4", name: "David", fullName: "David Kim", handle: "@davidk", color: "from-slate-500 to-slate-700" },
];

export default function SendMoneyPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [selectedContact, setSelectedContact] = useState<typeof CONTACTS[0] | null>(null);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-700 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Send Money</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Instant, fee-free transfers to friends and family.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" /> Secured Transfer
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: THE SEND TERMINAL
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Input Terminal */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative group">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none opacity-50 dark:opacity-30 transition-colors" />
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            <div className="p-8 sm:p-10 relative z-10 flex flex-col items-center justify-center min-h-[440px]">
              
              {/* Wallet Balance Badge */}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold tracking-widest shadow-sm mb-8">
                <Wallet className="w-3.5 h-3.5" /> USD Balance: $24,500.50
              </div>

              {/* Massive Amount Input */}
              <div className="relative flex items-center justify-center w-full mb-8">
                <span className={`text-4xl sm:text-6xl font-bold transition-colors ${sendAmount ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
                  $
                </span>
                <input 
                  type="text" 
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-transparent border-none outline-none text-6xl sm:text-[80px] font-black tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-800 text-center w-full max-w-[300px] sm:max-w-[400px] p-0"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {/* Recipient Selector Block */}
              <div className="w-full max-w-sm bg-slate-50 dark:bg-[#111115] rounded-[24px] p-2 border border-slate-200 dark:border-white/[0.04] shadow-inner mb-4">
                {selectedContact ? (
                  <div className="flex items-center justify-between p-3 rounded-[20px] bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer" onClick={() => setSelectedContact(null)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedContact.color} flex items-center justify-center shadow-inner text-white font-bold text-lg`}>
                        {selectedContact.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900 dark:text-white leading-none">{selectedContact.fullName}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{selectedContact.handle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-[20px] hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent border-dashed dark:hover:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-[#1a1a24] flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-[14px] font-bold text-slate-500 dark:text-slate-400">Select Recipient...</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Note Input */}
              <div className="w-full max-w-sm relative mb-8">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a24] flex items-center justify-center text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  value={sendNote}
                  onChange={(e) => setSendNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500/50 dark:focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none shadow-inner"
                />
              </div>

              {/* Action Button */}
              <button 
                disabled={!sendAmount || !selectedContact}
                className={`w-full max-w-sm py-4 rounded-[20px] font-black text-[15px] sm:text-[16px] transition-all flex items-center justify-center gap-2 group ${
                  sendAmount && selectedContact 
                    ? 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-900 shadow-xl shadow-cyan-500/20 active:scale-[0.98]' 
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                Send Money 
                <ArrowRight className={`w-5 h-5 transition-transform ${sendAmount && selectedContact ? 'group-hover:translate-x-1' : ''}`} />
              </button>

            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: CONTACTS & ACTIVITY
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Contacts */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Send to Contacts</h3>
              <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5">
                <Search className="w-4 h-4 text-slate-500 dark:text-white" />
              </button>
            </div>

            {/* Horizontal Contact Scroller */}
            <div className="p-6 flex gap-4 overflow-x-auto scrollbar-hide">
              <button className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center border-dashed group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                  <Plus className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Add New</span>
              </button>

              {CONTACTS.map((contact) => (
                <button 
                  key={`contact-${contact.id}`} 
                  onClick={() => setSelectedContact(contact)}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${contact.color} p-[2px] shadow-md transition-transform ${selectedContact?.id === contact.id ? 'scale-110 ring-2 ring-white dark:ring-[#0A0A0C]' : 'group-hover:scale-105'}`}>
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#0A0A0C] border-2 border-white dark:border-[#0A0A0C] flex items-center justify-center overflow-hidden">
                      <span className="font-black text-slate-900 dark:text-white text-lg">{contact.name.charAt(0)}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate w-14 text-center">{contact.name}</span>
                </button>
              ))}
            </div>
            
            {/* Promo Options */}
            <div className="p-4 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-white/[0.04]">
               <button className="flex items-center gap-3 p-3 rounded-[16px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                      <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Scan QR</span>
               </button>
               <button className="flex items-center gap-3 p-3 rounded-[16px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                      <Smartphone className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bank Transfer</span>
               </button>
            </div>
          </div>

          {/* Recent Transfers Tracker */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Transfers</h3>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {RECENT_TRANSFERS.map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-colors">
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tx.color} flex items-center justify-center shadow-inner shrink-0 text-white font-bold text-lg`}>
                      {tx.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-none">{tx.name}</h4>
                      <p className="text-[12px] text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
                        {tx.status === "Pending" && <Clock className="w-3 h-3 text-amber-500" />}
                        {tx.status === "Sent" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {tx.note}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <p className={`text-[16px] font-black ${tx.status === "Pending" ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      -${tx.amount.toFixed(2)}
                    </p>
                    <span className={`mt-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                        tx.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 
                        'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </div>

                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
              <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-1">
                View All Activity <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}