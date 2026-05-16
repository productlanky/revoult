"use client";

import { 
  Users, Search, Filter, Download, Loader2, 
  Sparkles, MoreHorizontal, ShieldCheck, 
  AlertCircle, ShieldAlert, ArrowRight,
  Clock
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface UserDoc {
  id: string;
  role?: string;
  kycStatus?: string;
  status?: string;
  accountStatus?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  plan?: string;
  createdAt?: string;
  [key: string]: any;
}

export default function UsersManagementPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Auth & Data States
  const { user, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<UserDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Pending" | "Restricted">("All");
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // --- FIREBASE DATA FETCHING ---
  useEffect(() => {
    if (!user) return;

    // Fetching up to 500 recent users for robust client-side searching
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, orderBy("createdAt", "desc"), limit(500));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const allFetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDoc));
      // Strictly filter out admin accounts
      setCustomers(allFetched.filter(u => u.role !== 'admin'));
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- SEARCH & FILTER LOGIC ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search matching (Name or Email)
      const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
      const email = (customer.email || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower);

      // Status matching
      const currentStatus = (customer.status || customer.accountStatus || 'Active').toLowerCase();
      const kycStatus = (customer.kycStatus || 'pending').toLowerCase();
      
      let matchesStatus = true;
      if (statusFilter === "Active") {
        matchesStatus = currentStatus === 'active' && kycStatus === 'verified';
      } else if (statusFilter === "Pending") {
        matchesStatus = kycStatus === 'pending' || currentStatus === 'pending';
      } else if (statusFilter === "Restricted") {
        matchesStatus = currentStatus === 'frozen' || currentStatus === 'suspended' || kycStatus === 'rejected';
      }

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  if (!mounted || authLoading || dataLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  // --- ACTIONS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) return showToast("No data to export.");

    const headers = ["ID", "First Name", "Last Name", "Email", "Account Status", "KYC Status", "Plan", "Join Date"];
    const csvRows = filteredCustomers.map(u => {
      const joinDate = u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : "N/A";
      return `"${u.id}","${u.firstName || ''}","${u.lastName || ''}","${u.email || ''}","${u.status || 'Active'}","${u.kycStatus || 'Pending'}","${u.plan || 'Standard'}","${joinDate}"`;
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `filtered_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("CSV Exported successfully!");
  };

  // Aggregated Counts for Quick Stats
  const totalCount = customers.length;
  const pendingCount = customers.filter(u => (u.kycStatus || 'pending').toLowerCase() === 'pending').length;
  const restrictedCount = customers.filter(u => ['frozen', 'suspended'].includes((u.status || '').toLowerCase())).length;

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-700 relative">
      
      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2 whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View, search, and manage customer accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[13px] hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Download className="w-4 h-4" /> Export List
          </button>
        </div>
      </div>

      {/* --- QUICK STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Customers</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pending KYC</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Restricted</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{restrictedCount}</p>
          </div>
        </div>
      </div>

      {/* --- MAIN TABLE SECTION --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Controls Toolbar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
          
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..." 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium focus:border-cyan-500/50 outline-none shadow-sm transition-all"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
            {(["All", "Active", "Pending", "Restricted"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  statusFilter === status 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md' 
                    : 'bg-white dark:bg-[#111115] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[11px] uppercase tracking-widest text-slate-400">
                <th className="p-5 font-bold">Customer</th>
                <th className="p-5 font-bold">KYC Status</th>
                <th className="p-5 font-bold">Account</th>
                <th className="p-5 font-bold hidden md:table-cell">Plan</th>
                <th className="p-5 font-bold hidden lg:table-cell">Joined</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="w-10 h-10 text-slate-300 dark:text-white/10 mb-3" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">No customers found.</p>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((u) => {
                  const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || "Unknown User";
                  const initial = displayName.charAt(0).toUpperCase();
                  
                  const accountStatus = (u.status || u.accountStatus || 'Active').toLowerCase();
                  const kycStatus = (u.kycStatus || 'pending').toLowerCase();
                  const currentPlan = u.plan || 'Standard';
                  const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center font-bold text-[12px] text-slate-600 dark:text-slate-300 shrink-0 shadow-inner">
                            {initial}
                          </div>
                          <div className="truncate">
                            <p className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{displayName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                          kycStatus === 'verified' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                          kycStatus === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                          'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}>
                          {kycStatus === 'verified' && <ShieldCheck className="w-3 h-3" />}
                          {kycStatus === 'pending' && <Clock className="w-3 h-3" />}
                          {kycStatus === 'rejected' && <ShieldAlert className="w-3 h-3" />}
                          {kycStatus}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold capitalize ${
                          accountStatus === 'active' ? 'text-slate-700 dark:text-slate-300' : 
                          'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
                        }`}>
                          {accountStatus === 'frozen' || accountStatus === 'suspended' ? 'Restricted' : accountStatus}
                        </span>
                      </td>
                      <td className="p-5 hidden md:table-cell text-[13px] font-bold text-slate-600 dark:text-slate-300">
                        {currentPlan}
                      </td>
                      <td className="p-5 hidden lg:table-cell text-[12px] font-medium text-slate-500 whitespace-nowrap">
                        {joinDate}
                      </td>
                      <td className="p-5 text-right">
                        <Link 
                          href={`/manbase/users/${u.id}`} 
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-200 dark:hover:border-cyan-500/30 transition-all group-hover:scale-105"
                          title="Manage User"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Footer/Pagination info */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between text-xs text-slate-500 font-medium">
          <p>Showing {filteredCustomers.length} results</p>
          {filteredCustomers.length >= 500 && <p className="text-amber-500">List limited to 500 recent users.</p>}
        </div>
      </div>

    </div>
  );
}