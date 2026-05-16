"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PieChart, Activity, Send, HandCoins, ArrowRightLeft,
  Globe, Wallet, PiggyBank, LockKeyhole, Users, CreditCard, Smartphone,
  Bitcoin, TrendingUp, Receipt, Repeat, FileText, Settings, LifeBuoy,
  LogOut, Search, Bell, Menu, X, ChevronDown, Sparkles, Plus,
  Command, Crown, PanelLeftClose, PanelLeftOpen, Sun, Moon,
  User as UserIcon, ShieldCheck, ChevronRight, Home, Grid, CheckCircle2,
  Ticket, AlertTriangle, Clock, UploadCloud,
  Loader2
} from "lucide-react";

// Firebase Integration
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit, doc, writeBatch, updateDoc } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface NotificationDoc {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// --- NAVIGATION ARCHITECTURE ---
const NAVIGATION = [
  {
    title: "Dashboards",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/dashboard/analytics", icon: PieChart },
      { name: "Cash Flow", href: "/dashboard/cashflow", icon: Activity },
      { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
    ]
  },
  {
    title: "Money Movement",
    items: [
      { name: "Send Money", href: "/dashboard/send", icon: Send },
      { name: "Request Funds", href: "/dashboard/request", icon: HandCoins },
      { name: "Global Transfer", href: "/dashboard/global", icon: Globe },
      { name: "Exchange Currency", href: "/dashboard/exchange", icon: ArrowRightLeft },
    ]
  },
  {
    title: "Accounts & Cards",
    items: [
      { name: "Main Wallets", href: "/dashboard/wallets", icon: Wallet },
      { name: "High-Yield Vaults", href: "/dashboard/vaults", icon: PiggyBank }, 
      { name: "Virtual Cards", href: "/dashboard/cards/virtual", icon: Smartphone },
    ]
  },
  {
    title: "Wealth & Trading",
    items: [
      { name: "Crypto Portfolio", href: "/dashboard/crypto", icon: Bitcoin },
      { name: "Stocks & ETFs", href: "/dashboard/stocks", icon: TrendingUp },
    ]
  },
   {
    title: "Management",
    items: [
      { name: "Tickets", href: "/dashboard/support", icon: Ticket },
    ]
  }
];

// --- MOBILE BOTTOM NAV CONFIG ---
const MOBILE_NAV = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/dashboard/analytics", icon: PieChart },
  { name: "Action", href: "/dashboard/send", icon: ArrowRightLeft, isAction: true },
  { name: "Cards", href: "/dashboard/cards/physical", icon: CreditCard },
  { name: "Menu", action: "TOGGLE_MENU", icon: Grid },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, userData } = useAuth(); // Connect to Firebase
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- KYC RE-UPLOAD STATE ---
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycType, setKycType] = useState("Passport");
  const [kycFileFront, setKycFileFront] = useState<File | null>(null);
  const [kycFileBack, setKycFileBack] = useState<File | null>(null);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);
  const [kycError, setKycError] = useState("");
  
  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);
  const requiresBackSide = kycType !== "Passport";

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? resolvedTheme === "dark" : true;

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Dashboards": true,
    "Money Movement": true,
    "Accounts & Cards": false,
    "Wealth & Trading": false,
    "Management": false,
  });

  // --- FETCH NOTIFICATIONS (REAL-TIME) ---
  useEffect(() => {
    if (!user) return;
    const notifQ = query(collection(db, "users", user.uid, "notifications"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribe = onSnapshot(notifQ, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationDoc)));
    });
    return () => unsubscribe();
  }, [user]);

  // --- MARK ALL AS READ (BATCH WRITE) ---
  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    const batch = writeBatch(db);
    
    notifications.filter(n => !n.isRead).forEach(notif => {
      const ref = doc(db, "users", user.uid, "notifications", notif.id);
      batch.update(ref, { isRead: true });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  // --- KYC RE-UPLOAD LOGIC ---
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST", body: formData,
    });

    if (!res.ok) throw new Error("Document upload failed.");
    const data = await res.json();
    return data.secure_url;
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!kycFileFront || (requiresBackSide && !kycFileBack)) {
      setKycError("Please upload all required documents.");
      return;
    }

    setIsUploadingKyc(true);
    setKycError("");

    try {
      const frontUrl = await uploadToCloudinary(kycFileFront);
      let backUrl = null;
      if (requiresBackSide && kycFileBack) {
        backUrl = await uploadToCloudinary(kycFileBack);
      }

      await updateDoc(doc(db, "users", user.uid), {
        kycStatus: "pending", // Reset to pending for review
        kycDocumentType: kycType,
        kycDocumentUrl: frontUrl,
        ...(backUrl ? { kycDocumentBackUrl: backUrl } : { kycDocumentBackUrl: null }),
        kycRejectionReason: null // Clear previous rejection reason
      });

      setKycModalOpen(false);
      setKycFileFront(null);
      setKycFileBack(null);
    } catch (err) {
      console.error("KYC Upload Error:", err);
      setKycError("Failed to securely upload documents. Please try again.");
    } finally {
      setIsUploadingKyc(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    document.body.style.backgroundColor = isDarkMode ? '#030303' : '#F7F7F9';
    if (isMobileMenuOpen || kycModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.backgroundColor = ''; document.body.style.overflow = ''; };
  }, [isDarkMode, isMobileMenuOpen, kycModalOpen, mounted]);

  const toggleCategory = (title: string) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedCategories(prev => ({ ...prev, [title]: true }));
      return;
    }
    setExpandedCategories(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Extract User Details safely
  const firstName = userData?.firstName || "Satoshi";
  const lastName = userData?.lastName || "Nakamoto";
  const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const userPlan = userData?.plan || "Standard";
  const kycStatus = (userData?.kycStatus || "").toLowerCase();

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // --- DESKTOP & MOBILE DRAWER SIDEBAR CONTENT ---
  const sidebarContent = (
    <div className={`flex flex-col h-full transition-colors duration-500 relative ${isDarkMode ? 'bg-[#030303]' : 'bg-[#F7F7F9]'}`}>
      <div className={`shrink-0 flex items-center justify-between pt-6 px-5 pb-5 transition-colors duration-500`}>
        <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
          <div className={`min-w-8 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.15)]' : 'bg-black shadow-md'}`}>
            <span className={`font-black text-sm tracking-tighter ${isDarkMode ? 'text-black' : 'text-white'}`}>R</span>
          </div>
          <span className={`text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Revolut</span>
        </Link>
        <button type="button" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`hidden lg:flex p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-500' : 'hover:bg-slate-200 text-slate-400'} ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
          {isSidebarCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
        </button>
      </div>

      <div className={`shrink-0 px-4 pb-4 relative z-40`}>
        {isUserMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />}
        <div role="button" tabIndex={0} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`w-full relative overflow-hidden rounded-[16px] p-2 flex items-center gap-3 transition-all duration-300 group cursor-pointer ${isSidebarCollapsed ? 'justify-center' : ''} ${isDarkMode ? 'bg-[#0A0A0C] border border-white/[0.04] hover:border-white/[0.08] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.8)]' : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'} ${isUserMenuOpen ? (isDarkMode ? 'ring-1 ring-white/10' : 'ring-1 ring-slate-200') : ''}`}>
          <div className={`relative z-10 w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-[#2a2a32] to-[#121215] border border-white/10 shadow-inner' : 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-inner'}`}>
            <span className={`font-bold text-xs tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{userInitials}</span>
          </div>
          <div className={`flex-1 text-left min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
            <h3 className={`font-bold text-[13px] truncate leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{firstName} {lastName}</h3>
            <p className={`text-[10px] font-medium tracking-wide flex items-center gap-1 mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}><ShieldCheck className="w-3 h-3" /> {userPlan} Plan</p>
          </div>
          {!isSidebarCollapsed && <ChevronRight className={`relative z-10 w-4 h-4 shrink-0 transition-transform duration-300 ${isDarkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600'} ${isUserMenuOpen ? 'rotate-90' : ''}`} />}
        </div>

        <div className={`absolute left-4 right-4 top-[calc(100%+8px)] rounded-[16px] border p-1.5 shadow-2xl z-40 transform transition-all duration-300 origin-top ease-[cubic-bezier(0.16,1,0.3,1)] ${isUserMenuOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'} ${isDarkMode ? 'bg-[#111114]/95 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-2xl border-slate-200'}`}>
          <div className="space-y-0.5">
            <Link href="/dashboard/profile" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${isDarkMode ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><UserIcon className="w-4 h-4 text-slate-500" /> My Profile</Link>
            <Link href="/dashboard/settings" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${isDarkMode ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Settings className="w-4 h-4 text-slate-500" /> Settings & Privacy</Link>
            <div className={`w-full h-px my-1 ${isDarkMode ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
            <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${isDarkMode ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'}`}><LogOut className="w-4 h-4 text-rose-500/70" /> Sign Out</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-6 space-y-1 relative z-0">
        {NAVIGATION.map((category) => {
          const isExpanded = isSidebarCollapsed ? false : expandedCategories[category.title];
          const hasActiveChild = category.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

          return (
            <div key={category.title} className="flex flex-col">
              <div role="button" tabIndex={0} onClick={() => toggleCategory(category.title)} className={`w-full flex items-center px-3 py-2.5 cursor-pointer transition-colors group ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`} title={isSidebarCollapsed ? category.title : undefined}>
                <span className={`text-[11px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'} ${hasActiveChild && !isExpanded ? (isDarkMode ? "text-white" : "text-black") : isDarkMode ? "text-slate-500 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-600"}`}>{category.title}</span>
                {!isSidebarCollapsed ? <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isDarkMode ? "text-slate-600" : "text-slate-400"}`} /> : <div className={`w-4 border-b border-solid my-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`} />}
              </div>
              <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded || isSidebarCollapsed ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                {category.items.map((item) => {
                  const isActive = pathname === item.href;
                  const activeClass = isDarkMode ? "bg-white/[0.04] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.05]" : "bg-black/[0.03] text-black shadow-sm border border-black/5";
                  const inactiveClass = isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent" : "text-slate-500 hover:text-slate-900 hover:bg-black/[0.02] border border-transparent";
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} title={isSidebarCollapsed ? item.name : undefined} className={`flex items-center rounded-[12px] font-medium text-[13px] transition-all duration-300 group relative ${isSidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2 gap-3'} ${isActive ? activeClass : inactiveClass}`}>
                      {isActive && !isSidebarCollapsed && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full ${isDarkMode ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]' : 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]'}`} />}
                      {isActive && isDarkMode && !isSidebarCollapsed && <div className="absolute inset-0 bg-white/5 blur-md rounded-xl pointer-events-none" />}
                      <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors relative z-10 ${isActive ? (isDarkMode ? "text-white" : "text-black") : (isDarkMode ? "text-slate-500 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-600")}`} />
                      <span className={`whitespace-nowrap relative z-10 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`shrink-0 p-4 transition-colors duration-500 z-10 bg-transparent`}>
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isSidebarCollapsed ? 'h-0 opacity-0 m-0' : 'h-auto opacity-100'}`}>
          <div className={`rounded-[16px] p-4 relative overflow-hidden group border ${isDarkMode ? 'bg-[#0A0A0C] border-white/[0.08] shadow-[0_10px_40px_-10px_rgba(0,0,0,1)]' : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-xl'}`}>
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="flex items-center gap-2"><Crown className="w-4 h-4 text-slate-300" /><h4 className="font-bold text-[13px] tracking-tight text-white">Revolut <span className="text-slate-300">Metal</span></h4></div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-400">Exclusive titanium card, priority support, and 4.5% AER.</p>
              <button className="w-full py-2 mt-1 font-bold text-[11px] uppercase tracking-widest rounded-[10px] transition-all active:scale-95 bg-white text-black hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.15)]">Upgrade</button>
            </div>
          </div>
        </div>
        {isSidebarCollapsed && (
          <button className={`w-full flex items-center justify-center p-3 rounded-[12px] transition-all ${isDarkMode ? 'bg-[#0A0A0C] text-slate-300 border border-white/10 hover:border-white/20' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-900'}`} title="Upgrade to Metal"><Crown className="w-[18px] h-[18px]" /></button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`h-[100dvh] overflow-hidden w-full flex font-sans transition-colors duration-500 relative ${isDarkMode ? 'bg-[#030303] text-slate-50' : 'bg-[#F7F7F9] text-slate-900'}`}>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`hidden lg:block h-[100dvh] sticky top-0 z-40 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-r ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'} ${isDarkMode ? 'border-white/[0.04]' : 'border-slate-200'}`}>
        {sidebarContent}
      </aside>

      {/* --- MOBILE OVERLAY & DRAWER --- */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`} onClick={() => setIsMobileMenuOpen(false)} />
      <aside className={`fixed top-0 left-0 w-[280px] sm:w-[320px] h-[100dvh] border-r z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col shadow-2xl ${isDarkMode ? 'border-white/10' : 'border-slate-200'} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setIsMobileMenuOpen(false)} className={`absolute top-6 right-4 p-2 rounded-full transition-colors z-50 ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-black'}`}>
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* --- NOTIFICATION DROPDOWN OVERLAY --- */}
      {isNotificationOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
          <div className={`absolute top-[70px] right-4 sm:right-8 w-[320px] sm:w-[360px] max-h-[450px] flex flex-col rounded-[24px] border shadow-2xl z-50 transform origin-top-right transition-all duration-300 ${isDarkMode ? 'bg-[#111114]/95 backdrop-blur-2xl border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)]' : 'bg-white/95 backdrop-blur-2xl border-slate-200 shadow-xl'}`}>
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center shrink-0">
               <h3 className="font-bold text-sm tracking-tight">Notifications</h3>
               {unreadCount > 0 && (
                 <button onClick={handleMarkAllAsRead} className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold transition-colors">
                   Mark all read
                 </button>
               )}
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {notifications.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Bell className="w-8 h-8 text-slate-300 dark:text-white/10 mb-3" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">You're all caught up!</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">New alerts for transfers, deposits, and account activity will appear here.</p>
                 </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`relative p-4 rounded-xl flex gap-3 transition-colors ${!notif.isRead ? (isDarkMode ? 'bg-white/5' : 'bg-slate-50') : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
                    {!notif.isRead && (
                      <div className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    )}
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 ml-2">
                       {notif.type === 'transfer' ? <ArrowRightLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{notif.title}</p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">{formatTime(notif.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* --- KYC RE-UPLOAD MODAL --- */}
      {kycModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setKycModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 mb-6 mt-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20 shrink-0">
                <ShieldCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verify Identity</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Upload a valid government ID</p>
              </div>
            </div>

            {kycError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-500 text-xs font-bold animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {kycError}
              </div>
            )}

            <form onSubmit={handleKycSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 block mb-2">Document Type</label>
                <select 
                  value={kycType} 
                  onChange={(e) => {
                    setKycType(e.target.value);
                    setKycFileFront(null);
                    setKycFileBack(null);
                  }}
                  className="w-full h-12 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl px-4 text-slate-900 dark:text-white outline-none cursor-pointer text-sm font-medium focus:border-cyan-500/50 appearance-none"
                >
                  <option value="Passport">Passport</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="National ID">National ID Card</option>
                </select>
              </div>

              <div className={`grid gap-4 ${requiresBackSide ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {/* Front Upload */}
                <div className="relative">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputFrontRef} onChange={(e) => e.target.files && setKycFileFront(e.target.files[0])} />
                  <button type="button" onClick={() => fileInputFrontRef.current?.click()} className={`w-full flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-xl transition-all h-32 ${kycFileFront ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/[0.02] hover:border-cyan-500/50'}`}>
                    {kycFileFront ? (
                      <><CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" /><span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate w-full px-2">{kycFileFront.name}</span><span className="text-[9px] text-emerald-500 mt-1 uppercase tracking-widest">Front ready</span></>
                    ) : (
                      <><UploadCloud className="w-6 h-6 text-slate-400 mb-2" /><span className="text-[11px] font-medium text-slate-500">{requiresBackSide ? 'Upload Front' : `Upload ${kycType}`}</span></>
                    )}
                  </button>
                </div>

                {/* Back Upload (Conditional) */}
                {requiresBackSide && (
                  <div className="relative">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputBackRef} onChange={(e) => e.target.files && setKycFileBack(e.target.files[0])} />
                    <button type="button" onClick={() => fileInputBackRef.current?.click()} className={`w-full flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-xl transition-all h-32 ${kycFileBack ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/[0.02] hover:border-cyan-500/50'}`}>
                      {kycFileBack ? (
                        <><CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" /><span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate w-full px-2">{kycFileBack.name}</span><span className="text-[9px] text-emerald-500 mt-1 uppercase tracking-widest">Back ready</span></>
                      ) : (
                        <><UploadCloud className="w-6 h-6 text-slate-400 mb-2" /><span className="text-[11px] font-medium text-slate-500">Upload Back</span></>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isUploadingKyc || !kycFileFront || (requiresBackSide && !kycFileBack)}
                className="w-full py-4 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-lg shadow-cyan-500/20"
              >
                {isUploadingKyc ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading securely...</> : "Submit Documents"}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] relative">

        {/* --- DYNAMIC HEADER --- */}
        <header className={`h-[72px] lg:h-[72px] h-[80px] shrink-0 flex items-center justify-between px-4 sm:px-8 border-b sticky top-0 z-30 transition-colors duration-500 ${isDarkMode ? 'bg-[#030303]/70 backdrop-blur-3xl border-white/[0.04]' : 'bg-[#F7F7F9]/80 backdrop-blur-3xl border-slate-200 shadow-sm'
          }`}>

          {/* NATIVE MOBILE GREETING */}
          <div className="flex lg:hidden items-center justify-between w-full pt-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-xs shadow-inner ${isDarkMode ? 'bg-gradient-to-br from-[#2a2a32] to-[#121215] border border-white/10 text-white' : 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 text-slate-800'}`}>
                {userInitials}
              </div>
              <div className="flex flex-col">
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Welcome back,</span>
                <span className={`text-[16px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{firstName}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button type="button" className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`}>
                <Search className="w-[18px] h-[18px]" />
              </button>
              <button type="button" onClick={() => setIsNotificationOpen(!isNotificationOpen)} className={`relative p-2.5 rounded-full transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`}>
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && <span className={`absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,1)]`} />}
              </button>
            </div>
          </div>

          {/* DESKTOP HEADER CONTENT */}
          <div className="hidden lg:flex items-center gap-4">
            <h1 className={`text-lg font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {NAVIGATION.flatMap(c => c.items).find(i => i.href === pathname)?.name || "Overview"}
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-3 sm:gap-4">
            <div className="flex items-center relative group cursor-text">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              </div>
              <div className={`h-9 w-64 rounded-xl pl-9 pr-3 flex items-center justify-between transition-all border shadow-sm ${isDarkMode ? 'bg-[#0A0A0C] border-white/10 group-hover:border-white/20' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                <span className={`text-[13px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Search...</span>
                <div className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${isDarkMode ? 'text-slate-500 bg-white/5 border-white/10' : 'text-slate-400 bg-slate-50 border-slate-200'}`}><Command className="w-3 h-3" /> K</div>
              </div>
            </div>

            <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-300'}`} />

            <button type="button" onClick={toggleTheme} className={`relative p-2 rounded-full transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`} title="Toggle Theme">
              {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <button type="button" onClick={() => setIsNotificationOpen(!isNotificationOpen)} className={`relative p-2 rounded-full transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`}>
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && <span className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,1)]`} />}
            </button>
            
            <Link href="/dashboard/wallets" className={`flex items-center gap-2 ml-1 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95 ${isDarkMode ? 'bg-white text-black hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.15)]' : 'bg-black text-white hover:bg-slate-800 shadow-md'}`}>
              <Plus className="w-4 h-4" /> Add Money
            </Link>
          </div>
        </header>

        {/* --- MAIN CONTENT INJECTION --- */}
        <main className="flex-1 overflow-y-auto relative p-4 pb-28 lg:pb-8 sm:p-8">
          {isDarkMode && <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[40vh] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none z-0" />}
          <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />

          <div className="relative z-10 max-w-7xl mx-auto min-h-full">
            
            {/* GLOBAL KYC ALERTS */}
            {kycStatus === 'pending' && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3 shadow-sm">
                 <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                 <div>
                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">Verification in Review</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-500/80 mt-1 leading-relaxed">Your identity documents are currently being reviewed by our team. Some account features may be limited until approved.</p>
                 </div>
              </div>
            )}
            
            {kycStatus === 'rejected' && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                 <div className="flex items-start gap-3">
                     <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                     <div>
                        <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">Verification Rejected</h3>
                        <p className="text-xs text-rose-600 dark:text-rose-500/80 mt-1 leading-relaxed">
                          {userData?.kycRejectionReason || "Your uploaded documents could not be verified. Please upload a clearer image or a different document."}
                        </p>
                     </div>
                 </div>
                 <button 
                    onClick={() => setKycModalOpen(true)} 
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shrink-0 transition-colors shadow-md active:scale-95"
                 >
                    Re-Verify Identity
                 </button>
              </div>
            )}

            {/* PAGE CONTENT */}
            {children}
          </div>
        </main>

        {/* --- FLOATING LIQUID GLASS DOCK (Apple-Tier Native Experience) --- */}
        <div className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[420px] h-[76px] rounded-[38px] z-50 transition-all duration-500 ${isDarkMode
          ? 'bg-[#25252b]/40 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/[0.12] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]'
          : 'bg-white/40 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)]'
          }`}>

          {/* CENTER FLOATING ACTION BUTTON */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-50">
            <Link
              href="/dashboard/send"
              className={`flex items-center justify-center w-[68px] h-[68px] rounded-full transition-transform active:scale-95 ${isDarkMode
                ? 'bg-gradient-to-b from-[#2a2a32] to-[#111115] border border-white/10 text-white shadow-[0_16px_32px_-8px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 text-white shadow-[0_16px_32px_-8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                }`}
            >
              {isDarkMode && (
                <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none rounded-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
              )}
              <ArrowRightLeft className="w-6 h-6 stroke-[2px] relative z-10" />
            </Link>
          </div>

          {/* Nav Icons Grid */}
          <div className="w-full h-full grid grid-cols-5 items-center justify-items-center relative z-10 px-2">
            {MOBILE_NAV.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (item.isAction) return <div key="fab-spacer" className="w-full h-full pointer-events-none" />;

              if (item.action === "TOGGLE_MENU") {
                return (
                  <button
                    key={item.name}
                    onClick={() => setIsMobileMenuOpen(true)}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <Icon className="w-[24px] h-[24px]" />
                    <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-300 relative ${isActive
                    ? (isDarkMode ? 'text-white' : 'text-black')
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                    }`}>
                  <div className="relative flex flex-col items-center">
                    {isActive && (
                      <div className={`absolute -top-3 w-5 h-1 rounded-full ${isDarkMode ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]' : 'bg-black shadow-sm'}`} />
                    )}
                    <Icon className={`w-[24px] h-[24px] transition-transform ${isActive ? 'stroke-[2.5px] -translate-y-0.5' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-medium tracking-wide transition-all ${isActive ? 'opacity-100 font-bold' : 'opacity-80'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}