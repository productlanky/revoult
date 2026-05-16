"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  LifeBuoy, Plus, Search, MessageSquare, 
  Clock, CheckCircle2, X, Send, AlertCircle, 
  ChevronRight, Loader2, Sparkles, User, ShieldCheck
} from "lucide-react";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { 
  collection, onSnapshot, query, orderBy, 
  addDoc, doc, updateDoc, arrayUnion 
} from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
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
  hasUnreadAdminReply?: boolean;
}

export default function SupportTicketsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const { user, userData, loading: authLoading } = useAuth();
  
  // Data States
  const [tickets, setTickets] = useState<TicketDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & UI States
  const [activeModal, setActiveModal] = useState<"create" | "view" | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Form States (Create)
  const [newSubject, setNewSubject] = useState("General Inquiry");
  const [newMessage, setNewMessage] = useState("");

  // Form States (Reply)
  const [replyText, setReplyText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // --- FETCH TICKETS ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "tickets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TicketDoc)));
      setDataLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeModal === "view") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages, activeModal]);

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

  const closeModal = () => {
    setActiveModal(null);
    setSelectedTicket(null);
    setNewMessage("");
    setReplyText("");
  };

  // --- INTERCEPT ACTION: OPEN TICKET & CLEAR BADGE ---
  const handleOpenTicket = async (ticket: TicketDoc) => {
    setSelectedTicket(ticket);
    setActiveModal("view");

    // If there is an unread admin reply, instantly update Firestore to remove the badge
    if (ticket.hasUnreadAdminReply && user) {
      try {
        const ticketRef = doc(db, "users", user.uid, "tickets", ticket.id);
        await updateDoc(ticketRef, { hasUnreadAdminReply: false });
      } catch (error) {
        console.error("Error clearing notification badge:", error);
      }
    }
  };

  // --- CREATE TICKET ---
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
    setIsSubmitting(true);

    try {
      const initialMessage: TicketMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "user",
        text: newMessage,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "users", user.uid, "tickets"), {
        subject: newSubject,
        status: "open",
        createdAt: new Date().toISOString(),
        messages: [initialMessage],
        hasUnreadAdminReply: false
      });

      showToast("Ticket created successfully.");
      closeModal();
    } catch (error) {
      showToast("Failed to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SEND REPLY ---
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTicket || !replyText.trim()) return;
    setIsSubmitting(true);

    try {
      const newReply: TicketMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "user",
        text: replyText,
        createdAt: new Date().toISOString()
      };

      const ticketRef = doc(db, "users", user.uid, "tickets", selectedTicket.id);
      
      // Update local state instantly for snappy UI
      const currentMessages = selectedTicket.messages || [];
      setSelectedTicket({
        ...selectedTicket,
        messages: [...currentMessages, newReply]
      });

      await updateDoc(ticketRef, {
        messages: arrayUnion(newReply),
        status: selectedTicket.status === "resolved" ? "open" : selectedTicket.status
      });

      setReplyText("");
    } catch (error) {
      showToast("Failed to send reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const subjectMatch = (t.subject || "").toLowerCase().includes(searchTerm.toLowerCase());
    const messageMatch = (t.messages?.[0]?.text || "").toLowerCase().includes(searchTerm.toLowerCase());
    return subjectMatch || messageMatch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 animate-in fade-in duration-500 relative space-y-6 sm:space-y-8">
      
      {/* TOAST */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Create Ticket Modal */}
      {activeModal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
            <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20 shrink-0">
                    <MessageSquare className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Request</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Submit a ticket to support</p>
                </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Topic</label>
                    <select 
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500/50 shadow-inner appearance-none"
                    >
                        <option>General Inquiry</option>
                        <option>Transaction Dispute</option>
                        <option>Account Access</option>
                        <option>Card Replacement</option>
                        <option>Bug Report</option>
                    </select>
                </div>
                <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Message</label>
                    <textarea
                        required
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-cyan-500/50 resize-none shadow-inner"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting || !newMessage.trim()} 
                    className="mt-2 w-full py-4 rounded-xl font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* View Ticket / Chat Modal */}
      {activeModal === "view" && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 flex flex-col h-[85vh] sm:h-[600px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111115]/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center shrink-0">
                       <LifeBuoy className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                   </div>
                   <div>
                       <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedTicket.subject}</h3>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Ticket #{selectedTicket.id.slice(0,6).toUpperCase()}</p>
                   </div>
                </div>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 dark:bg-transparent">
               {(selectedTicket.messages || []).map((msg) => {
                   const isUser = msg.sender === "user";
                   return (
                       <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] rounded-2xl p-4 flex flex-col ${
                               isUser 
                               ? 'bg-cyan-500 text-slate-900 rounded-tr-sm shadow-[0_5px_15px_-5px_rgba(6,182,212,0.4)]' 
                               : 'bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
                           }`}>
                               <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>
                               <span className={`text-[9px] font-bold tracking-widest uppercase mt-2 ${isUser ? 'text-slate-900/60' : 'text-slate-400'}`}>
                                   {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                           </div>
                       </div>
                   );
               })}
               <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white dark:bg-[#0A0A0C] border-t border-slate-100 dark:border-white/5 shrink-0">
               {selectedTicket.status === "resolved" ? (
                   <div className="text-center py-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                       <p className="text-xs font-bold text-slate-600 dark:text-slate-400">This ticket has been resolved.</p>
                       <p className="text-[10px] text-slate-500 mt-0.5">Sending a message will reopen it.</p>
                   </div>
               ) : null}

               <form onSubmit={handleSendReply} className="mt-2 flex items-center gap-2">
                   <input 
                       type="text"
                       value={replyText}
                       onChange={(e) => setReplyText(e.target.value)}
                       placeholder="Type your reply..."
                       className="flex-1 h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-cyan-500/50"
                   />
                   <button 
                       type="submit"
                       disabled={isSubmitting || !replyText.trim()}
                       className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
                   >
                       {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                   </button>
               </form>
            </div>

          </div>
        </div>
      )}


      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Help & Support</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your support tickets and talk to our team.</p>
        </div>
        
        <button 
          onClick={() => setActiveModal("create")}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <MetricCard title="Total Tickets" value={tickets.length.toString()} icon={LifeBuoy} />
         <MetricCard title="Open" value={tickets.filter(t => t.status === "open").length.toString()} icon={AlertCircle} color="text-amber-500" bg="bg-amber-500/10" />
         <MetricCard title="In Progress" value={tickets.filter(t => t.status === "in_progress").length.toString()} icon={Clock} color="text-cyan-500" bg="bg-cyan-500/10" />
         <MetricCard title="Resolved" value={tickets.filter(t => t.status === "resolved").length.toString()} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      {/* --- TICKET LIST --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] overflow-hidden shadow-sm dark:shadow-xl flex flex-col min-h-[400px] transition-colors duration-500">
         
         {/* Toolbar */}
         <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="relative w-full sm:w-[300px]">
               <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
               </div>
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tickets..." 
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-500/50 outline-none shadow-sm transition-all"
               />
            </div>
         </div>

         {/* List */}
         <div className="flex-1 flex flex-col divide-y divide-slate-100 dark:divide-white/[0.04]">
            {filteredTickets.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                      <LifeBuoy className="w-8 h-8 text-slate-300 dark:text-white/20" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No tickets found</h3>
                  <p className="text-xs text-slate-500">You don't have any active support requests.</p>
               </div>
            ) : (
               filteredTickets.map((ticket) => {
                  const isResolved = ticket.status === "resolved";
                  const isInProgress = ticket.status === "in_progress";
                  
                  const messages = ticket.messages || [];
                  const latestMsg = messages.length > 0 ? messages[messages.length - 1] : null;

                  return (
                      <div 
                         key={ticket.id}
                         onClick={() => handleOpenTicket(ticket)} // <-- UPDATED HANDLER HERE
                         className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group flex items-center justify-between"
                      >
                         <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                            
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                                isResolved ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' :
                                isInProgress ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20' :
                                'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                            }`}>
                                {isResolved ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                                 isInProgress ? <Clock className="w-6 h-6 text-cyan-500" /> :
                                 <AlertCircle className="w-6 h-6 text-amber-500" />}
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{ticket.subject}</h4>
                                    {ticket.hasUnreadAdminReply && (
                                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold tracking-widest uppercase animate-pulse">New Reply</span>
                                    )}
                                </div>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-md">
                                    {latestMsg ? (
                                       <>
                                         <span className="font-bold text-slate-400">{latestMsg.sender === 'admin' ? 'Admin: ' : 'You: '}</span>
                                         {latestMsg.text}
                                       </>
                                    ) : "No messages yet."}
                                </p>
                            </div>

                         </div>

                         <div className="flex flex-col items-end shrink-0 ml-4 hidden sm:flex">
                             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                 {new Date(latestMsg?.createdAt || ticket.createdAt).toLocaleDateString()}
                             </span>
                             <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                                 isResolved ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                 isInProgress ? 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20' :
                                 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                             }`}>
                                 {ticket.status.replace('_', ' ')}
                             </span>
                         </div>
                      </div>
                  )
               })
            )}
         </div>
      </div>

    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color = "text-slate-700 dark:text-white", bg = "bg-slate-100 dark:bg-white/[0.05]" }: any) {
    return (
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] p-4 sm:p-5 rounded-[24px] shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
                <p className={`text-xl font-black mt-0.5 ${color.includes('slate') ? 'text-slate-900 dark:text-white' : color}`}>{value}</p>
            </div>
        </div>
    )
}