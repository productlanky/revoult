"use client";

import { 
  Users, ShieldCheck, AlertCircle, ShieldAlert,
  MoreHorizontal, Download, TrendingUp,
  UserCheck, UserX, Clock, Loader2, ArrowRight,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link"; // Added for routing

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit, getCountFromServer, where } from "firebase/firestore";

// --- TYPESCRIPT INTERFACE ---
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

// SVG Chart Path Mockup
const CHART_LINE = "M 0 120 C 40 100, 80 140, 120 90 C 160 40, 200 110, 240 70 C 280 30, 320 80, 360 40 C 400 0, 440 60, 480 20 L 480 200 L 0 200 Z";
const CHART_STROKE = "M 0 120 C 40 100, 80 140, 120 90 C 160 40, 200 110, 240 70 C 280 30, 320 80, 360 40 C 400 0, 440 60, 480 20";

export default function AdminDashboardPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Real-time Data States
  const { user, loading: authLoading } = useAuth();
  const [recentCustomers, setRecentCustomers] = useState<UserDoc[]>([]);
  const [pendingReviews, setPendingReviews] = useState<UserDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // Metric Counts
  const [metrics, setMetrics] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    restricted: 0
  });

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    if (!user) return;

    const usersRef = collection(db, "users");

    // 1. Fetch Real-time Users
    const usersQuery = query(usersRef, orderBy("createdAt", "desc"), limit(50));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const allFetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDoc));
      
      // Filter out admins strictly
      const customersOnly = allFetched.filter(u => u.role !== 'admin');
      
      setRecentCustomers(customersOnly.slice(0, 6)); // Top 6 for the table
      
      // Extract users needing KYC review
      setPendingReviews(
        customersOnly.filter(u => 
          (u.kycStatus || '').toLowerCase() === 'pending' || 
          (u.status || '').toLowerCase() === 'pending'
        ).slice(0, 4)
      );

      setDataLoading(false);
    });

    // 2. Fetch Aggregated System Counts
    const fetchCounts = async () => {
      try {
        const totalSnap = await getCountFromServer(usersRef);
        
        let verifiedCount = 0;
        let pendingCount = 0;
        let restrictedCount = 0;

        try { verifiedCount = (await getCountFromServer(query(usersRef, where("kycStatus", "==", "verified")))).data().count; } catch(e) {}
        try { pendingCount = (await getCountFromServer(query(usersRef, where("kycStatus", "==", "pending")))).data().count; } catch(e) {}
        try { restrictedCount = (await getCountFromServer(query(usersRef, where("status", "==", "frozen")))).data().count; } catch(e) {}

        setMetrics({
          total: totalSnap.data().count,
          verified: verifiedCount,
          pending: pendingCount,
          restricted: restrictedCount
        });

      } catch (error) {
        console.error("Failed to fetch aggregate counts", error);
      }
    };

    fetchCounts();

    return () => unsubscribeUsers();
  }, [user]);

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
    if (recentCustomers.length === 0) {
      showToast("No data to export.");
      return;
    }

    // Prepare CSV Headers
    const headers = ["ID", "First Name", "Last Name", "Email", "Account Status", "KYC Status", "Plan", "Join Date"];
    
    // Parse user data into rows
    const csvRows = recentCustomers.map(u => {
      const joinDate = u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : "N/A";
      return `"${u.id}","${u.firstName || ''}","${u.lastName || ''}","${u.email || ''}","${u.status || 'active'}","${u.kycStatus || 'pending'}","${u.plan || 'Standard'}","${joinDate}"`;
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    // Trigger standard browser download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `customer_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("CSV Exported successfully!");
  };

  // --- DYNAMIC METRICS AGGREGATION ---
  const dynamicMetricsCards = [
    { title: "Total Customers", value: metrics.total.toLocaleString(), label: "Registered accounts", icon: Users, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20" },
    { title: "Verified Accounts", value: metrics.verified.toLocaleString(), label: "KYC approved", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
    { title: "Pending KYC", value: metrics.pending.toLocaleString(), label: "Awaiting review", icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" },
    { title: "Restricted", value: metrics.restricted.toLocaleString(), label: "Frozen or suspended", icon: UserX, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" },
  ];

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Intelligence</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time user base metrics and compliance tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[13px] hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* --- METRICS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dynamicMetricsCards.map((metric) => (
          <div key={metric.title} className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-all duration-300 hover:border-cyan-500/30 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border ${metric.bg}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">{metric.title}</h4>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{metric.value}</p>
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-2">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* --- MAIN CHART --- */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden relative flex flex-col">
          <div className="p-6 sm:p-8 flex items-center justify-between z-10 relative">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Platform Growth <TrendingUp className="w-4 h-4 text-cyan-500" />
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customer acquisition trend.</p>
            </div>
          </div>
          
          <div className="w-full h-[250px] relative mt-auto z-0 -mx-1">
            <svg viewBox="0 0 480 200" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="adminChartGradDark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="adminChartGradLight" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={CHART_LINE} fill={isDark ? "url(#adminChartGradDark)" : "url(#adminChartGradLight)"} />
              <path d={CHART_STROKE} fill="none" stroke="#06b6d4" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* --- ACTION REQUIRED: PENDING KYC --- */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Pending Reviews
              </h3>
              <p className="text-[11px] text-amber-500 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Action Required
              </p>
            </div>
            {/* Added Link routing to /manbase/users */}
            <Link href="/manbase/users" className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
              View Queue
            </Link>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {pendingReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <ShieldCheck className="w-10 h-10 text-emerald-500/50 mb-3" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Queue is empty</p>
                <p className="text-xs text-slate-500 mt-1">All customer accounts are verified.</p>
              </div>
            ) : (
              pendingReviews.map((u) => {
                const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || "Unknown User";
                const initial = displayName.charAt(0).toUpperCase();
                
                return (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] hover:border-cyan-500/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center font-bold text-[12px] text-amber-700 dark:text-amber-400 shrink-0">
                        {initial}
                      </div>
                      <div className="truncate">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{displayName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    {/* Added Link routing to specific user */}
                    <Link href={`/manbase/users/${u.id}`} className="p-2 rounded-xl bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* --- RECENT CUSTOMERS TABLE --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Registrations</h3>
            <p className="text-xs text-slate-500 mt-1">Latest customers to join the platform.</p>
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="p-5 font-bold">Customer</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold hidden sm:table-cell">Plan</th>
                <th className="p-5 font-bold hidden md:table-cell">Joined</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {recentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-sm font-bold text-slate-500">
                    No recent customers found.
                  </td>
                </tr>
              ) : (
                recentCustomers.map((u) => {
                  const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || "Unknown User";
                  const initial = displayName.charAt(0).toUpperCase();
                  
                  const currentStatus = (u.kycStatus || u.status || u.accountStatus || 'Pending').toLowerCase();
                  const currentPlan = u.plan || 'Standard';
                  const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center font-bold text-[12px] text-slate-600 dark:text-slate-300 shrink-0">
                            {initial}
                          </div>
                          <div className="truncate">
                            <p className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight truncate">{displayName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                          currentStatus === 'verified' || currentStatus === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                          currentStatus === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                          'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="p-5 hidden sm:table-cell text-[13px] font-bold text-slate-600 dark:text-slate-300">
                        {currentPlan}
                      </td>
                      <td className="p-5 hidden md:table-cell text-[12px] font-medium text-slate-500 whitespace-nowrap">
                        {joinDate}
                      </td>
                      <td className="p-5 text-right">
                        {/* Added Link routing to specific user */}
                        <Link href={`/manbase/users/${u.id}`} className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline transition-colors">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}