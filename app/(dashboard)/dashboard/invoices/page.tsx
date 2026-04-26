"use client";

import { 
  Search, Filter, Plus, FileText, Download, Send, 
  MoreHorizontal, CheckCircle2, Clock, AlertCircle, 
  ArrowRight, Building2, UserCircle2, ChevronRight
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const INVOICES = [
  {
    id: "INV-089",
    client: "Acme Corp",
    type: "Company",
    amount: 12500.00,
    date: "Oct 10",
    dueDate: "Oct 24",
    status: "Pending",
  },
  {
    id: "INV-088",
    client: "Stark Ind.",
    type: "Company",
    amount: 8450.50,
    date: "Oct 05",
    dueDate: "Oct 19",
    status: "Overdue",
  },
  {
    id: "INV-087",
    client: "Elena Rodriguez",
    type: "Individual",
    amount: 1200.00,
    date: "Oct 01",
    dueDate: "Oct 15",
    status: "Paid",
  },
  {
    id: "INV-086",
    client: "Globex Corp",
    type: "Company",
    amount: 45000.00,
    date: "Sep 28",
    dueDate: "Oct 12",
    status: "Paid",
  },
  {
    id: "INV-085",
    client: "Marcus Chen",
    type: "Individual",
    amount: 850.00,
    date: "Sep 25",
    dueDate: "Oct 09",
    status: "Paid",
  }
];

export default function InvoicesPage() {
  const totalOutstanding = INVOICES.filter(i => i.status === "Pending").reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = INVOICES.filter(i => i.status === "Overdue").reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = INVOICES.filter(i => i.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Invoices</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Manage billing, track payments, and send reminders.</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 sm:p-2.5 rounded-full sm:rounded-xl bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
            <Filter className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          
          {/* Mobile FAB vs Desktop Button */}
          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
          <button className="sm:hidden p-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- SUMMARY CARDS (Mobile Carousel -> Desktop Grid) --- */}
      {/* Negative margin on mobile lets the carousel bleed to the edges of the screen beautifully */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-4 pb-2 sm:pb-0">
        
        {/* Outstanding Card */}
        <div className="w-[85vw] sm:w-auto shrink-0 snap-center bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-500 group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full group-hover:bg-orange-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="w-10 h-10 rounded-[14px] bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Outstanding</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${totalOutstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
        </div>

        {/* Overdue Card */}
        <div className="w-[85vw] sm:w-auto shrink-0 snap-center bg-white dark:bg-gradient-to-br dark:from-[#151111] dark:to-[#0A0A0C] border border-slate-200 dark:border-rose-500/20 rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-[0_8px_30px_-10px_rgba(244,63,94,0.15)] relative overflow-hidden transition-colors duration-500 group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 blur-[40px] rounded-full group-hover:bg-rose-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="w-10 h-10 rounded-[14px] bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-500/20">Action Needed</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Overdue</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${totalOverdue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
        </div>

        {/* Paid Card */}
        <div className="w-[85vw] sm:w-auto shrink-0 snap-center bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-500 group">
          <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Paid (30 Days)</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
        </div>
      </div>

      {/* --- MOBILE-OPTIMIZED INVOICE LIST --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
        
        {/* Search Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="hidden sm:flex items-center gap-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Invoices</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-600 dark:text-slate-300">{INVOICES.length} Total</span>
          </div>
          
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full h-10 sm:h-9 rounded-[14px] sm:rounded-xl pl-10 pr-4 text-[14px] sm:text-[13px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Touch-Friendly List */}
        <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
          {INVOICES.map((invoice) => {
            const statusConfig = {
              "Paid": { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
              "Pending": { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20" },
              "Overdue": { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/20" },
            }[invoice.status];

            return (
              <div 
                key={invoice.id} 
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] active:bg-slate-100 dark:active:bg-white/[0.05] transition-colors cursor-pointer group"
              >
                {/* Left Side: Avatar & Identity */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`w-11 h-11 sm:w-10 sm:h-10 rounded-[14px] sm:rounded-[12px] flex items-center justify-center shrink-0 border ${invoice.type === "Company" ? 'bg-slate-100 dark:bg-[#111115] border-slate-200 dark:border-white/[0.05]' : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20'}`}>
                    {invoice.type === "Company" ? <Building2 className="w-5 h-5 sm:w-4 sm:h-4 text-slate-500" /> : <UserCircle2 className="w-5 h-5 sm:w-4 sm:h-4 text-indigo-500 dark:text-indigo-400" />}
                  </div>
                  <div className="truncate pr-2">
                    <h4 className="text-[15px] sm:text-[14px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{invoice.client}</h4>
                    <p className="text-[12px] sm:text-[11px] text-slate-500 mt-0.5 truncate">{invoice.id} • {invoice.date}</p>
                  </div>
                </div>

                {/* Right Side: Values, Status & Interactions */}
                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                  
                  {/* Financial Stack */}
                  <div className="flex flex-col items-end">
                    <p className="text-[15px] sm:text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                      ${invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                    <span className={`mt-0.5 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border ${statusConfig?.bg} ${statusConfig?.color} ${statusConfig?.border}`}>
                      {invoice.status}
                    </span>
                  </div>

                  {/* Native iOS Chevron (Visible only on mobile) */}
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 sm:hidden" />

                  {/* Desktop Only Actions */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0 ml-2">
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors" title="Download PDF">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {invoice.status !== "Paid" && (
                      <button className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors" title="Send Reminder">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* List Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
          <button className="text-[13px] sm:text-[12px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 py-1">
            Load More Invoices <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* --- AUTOMATION CALLOUT (Mobile Stacked) --- */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-[#111115] dark:via-[#1a1a24] dark:to-[#111115] border border-slate-700 dark:border-white/[0.04] rounded-[24px] p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors duration-500">
        <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.6%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex gap-4 sm:gap-6">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Automate Your Billing</h3>
            <p className="text-sm text-slate-300 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
              Set up recurring invoices and automatic payment reminders. Let us chase down your late payments for you.
            </p>
          </div>
        </div>

        <button className="relative z-10 w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-[14px] sm:rounded-xl bg-white text-black font-bold text-[14px] sm:text-[13px] hover:bg-slate-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap">
          Setup Automation
        </button>
      </div>

    </div>
  );
}