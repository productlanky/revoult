"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Activity, Settings, 
  LogOut, Search, Bell, Grid, PanelLeftClose, 
  PanelLeftOpen, Sun, Moon, ShieldAlert, 
  DollarSign, Server, ChevronDown, ShieldCheck,
  ChevronRight, Command, Database, UserCog
} from "lucide-react";

// --- ADMIN NAVIGATION ARCHITECTURE ---
const ADMIN_NAVIGATION = [
  {
    title: "Core",
    items: [
      { name: "Overview", href: "/manbase", icon: LayoutDashboard },
      { name: "Analytics", href: "/manbase/analytics", icon: Activity },
      { name: "Revenue", href: "/manbase/revenue", icon: DollarSign },
    ]
  },
  {
    title: "Management",
    items: [
      { name: "Users", href: "/manbase/users", icon: Users },
      { name: "Roles & Permissions", href: "/manbase/roles", icon: UserCog },
    ]
  }
];

// --- MOBILE BOTTOM NAV CONFIG ---
const MOBILE_NAV = [
  { name: "Overview", href: "/manbase", icon: LayoutDashboard },
  { name: "Users", href: "/manbase/users", icon: Users },
  { name: "Alerts", href: "/manbase/alerts", icon: ShieldAlert, isAction: true },
  { name: "Settings", href: "/manbase/settings", icon: Settings },
  { name: "Menu", action: "TOGGLE_MENU", icon: Grid },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    "Core": true,
    "Management": true,
    "System": true,
  });

  useEffect(() => {
    if (!mounted) return;
    document.body.style.backgroundColor = isDarkMode ? '#030303' : '#F7F7F9';
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.backgroundColor = ''; document.body.style.overflow = ''; };
  }, [isDarkMode, isMobileMenuOpen, mounted]);

  const toggleCategory = (title: string) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedCategories(prev => ({ ...prev, [title]: true }));
      return;
    }
    setExpandedCategories(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // --- DESKTOP & MOBILE DRAWER SIDEBAR CONTENT ---
  const sidebarContent = (
    <div className={`flex flex-col h-full transition-colors duration-500 relative ${isDarkMode ? 'bg-[#030303]' : 'bg-[#F7F7F9]'}`}>
      
      {/* Brand Header */}
      <div className={`shrink-0 flex items-center justify-between pt-6 px-5 pb-5 transition-colors duration-500`}>
        <Link href="/manbase" className="flex items-center gap-3 group overflow-hidden">
          <div className={`min-w-8 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-cyan-600 shadow-md'}`}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Manbase</span>
        </Link>
        <button type="button" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`hidden lg:flex p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-500' : 'hover:bg-slate-200 text-slate-400'} ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
          {isSidebarCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {/* Admin User Profile */}
      <div className={`shrink-0 px-4 pb-4 relative z-40`}>
        {isUserMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />}
        <div role="button" tabIndex={0} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`w-full relative overflow-hidden rounded-[16px] p-2 flex items-center gap-3 transition-all duration-300 group cursor-pointer ${isSidebarCollapsed ? 'justify-center' : ''} ${isDarkMode ? 'bg-[#0A0A0C] border border-white/[0.04] hover:border-white/[0.08] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.8)]' : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'} ${isUserMenuOpen ? (isDarkMode ? 'ring-1 ring-white/10' : 'ring-1 ring-slate-200') : ''}`}>
          <div className={`relative z-10 w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${isDarkMode ? 'bg-gradient-to-br from-cyan-900 to-[#121215] border border-cyan-500/30 shadow-inner' : 'bg-gradient-to-br from-cyan-100 to-slate-200 border border-cyan-300 shadow-inner'}`}>
            <span className={`font-bold text-xs tracking-wider ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>AD</span>
          </div>
          <div className={`flex-1 text-left min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
            <h3 className={`font-bold text-[13px] truncate leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Super Admin</h3>
            <p className={`text-[10px] font-medium tracking-wide flex items-center gap-1 mt-0.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System Online
            </p>
          </div>
          {!isSidebarCollapsed && <ChevronRight className={`relative z-10 w-4 h-4 shrink-0 transition-transform duration-300 ${isDarkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600'} ${isUserMenuOpen ? 'rotate-90' : ''}`} />}
        </div>

        {/* Dropdown */}
        <div className={`absolute left-4 right-4 top-[calc(100%+8px)] rounded-[16px] border p-1.5 shadow-2xl z-40 transform transition-all duration-300 origin-top ease-[cubic-bezier(0.16,1,0.3,1)] ${isUserMenuOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'} ${isDarkMode ? 'bg-[#111114]/95 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-2xl border-slate-200'}`}>
          <div className="space-y-0.5">
            <Link href="/manbase/settings" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${isDarkMode ? 'text-slate-300 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}><Settings className="w-4 h-4 text-slate-500" /> Global Settings</Link>
            <div className={`w-full h-px my-1 ${isDarkMode ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
            <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${isDarkMode ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'}`}><LogOut className="w-4 h-4 text-rose-500/70" /> Admin Logout</button>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-6 space-y-1 relative z-0">
        {ADMIN_NAVIGATION.map((category) => {
          const isExpanded = isSidebarCollapsed ? false : expandedCategories[category.title];
          const hasActiveChild = category.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

          return (
            <div key={category.title} className="flex flex-col">
              <div role="button" tabIndex={0} onClick={() => toggleCategory(category.title)} className={`w-full flex items-center px-3 py-2.5 cursor-pointer transition-colors group ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`} title={isSidebarCollapsed ? category.title : undefined}>
                <span className={`text-[11px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'} ${hasActiveChild && !isExpanded ? (isDarkMode ? "text-cyan-400" : "text-cyan-600") : isDarkMode ? "text-slate-500 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-600"}`}>{category.title}</span>
                {!isSidebarCollapsed ? <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isDarkMode ? "text-slate-600" : "text-slate-400"}`} /> : <div className={`w-4 border-b border-solid my-1 ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`} />}
              </div>
              
              <div className={`space-y-0.5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded || isSidebarCollapsed ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                {category.items.map((item) => {
                  const isActive = pathname === item.href;
                  const activeClass = isDarkMode ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-700 border border-cyan-100";
                  const inactiveClass = isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent" : "text-slate-500 hover:text-slate-900 hover:bg-black/[0.02] border border-transparent";
                  
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} title={isSidebarCollapsed ? item.name : undefined} className={`flex items-center rounded-[12px] font-medium text-[13px] transition-all duration-300 group relative ${isSidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2 gap-3'} ${isActive ? activeClass : inactiveClass}`}>
                      {isActive && !isSidebarCollapsed && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full ${isDarkMode ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]' : 'bg-cyan-600'}`} />}
                      <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors relative z-10 ${isActive ? (isDarkMode ? "text-cyan-400" : "text-cyan-600") : (isDarkMode ? "text-slate-500 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-600")}`} />
                      <span className={`whitespace-nowrap relative z-10 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`h-[100dvh] overflow-hidden w-full flex font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#030303] text-slate-50' : 'bg-[#F7F7F9] text-slate-900'}`}>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`hidden lg:block h-[100dvh] sticky top-0 z-40 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-r ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'} ${isDarkMode ? 'border-white/[0.04]' : 'border-slate-200'}`}>
        {sidebarContent}
      </aside>

      {/* --- MOBILE OVERLAY & DRAWER --- */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`} onClick={() => setIsMobileMenuOpen(false)} />
      <aside className={`fixed top-0 left-0 w-[280px] sm:w-[320px] h-[100dvh] border-r z-60 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col shadow-2xl ${isDarkMode ? 'border-white/10' : 'border-slate-200'} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] relative">

        {/* --- DYNAMIC HEADER --- */}
        <header className={`h-[72px] lg:h-[72px] h-[80px] shrink-0 flex items-center justify-between px-4 sm:px-8 border-b sticky top-0 z-30 transition-colors duration-500 ${isDarkMode ? 'bg-[#030303]/70 backdrop-blur-3xl border-white/[0.04]' : 'bg-[#F7F7F9]/80 backdrop-blur-3xl border-slate-200 shadow-sm'}`}>
          
          {/* Mobile Greeting */}
          <div className="flex lg:hidden items-center justify-between w-full pt-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-xs shadow-inner ${isDarkMode ? 'bg-gradient-to-br from-cyan-900 to-[#121215] border border-cyan-500/30 text-cyan-400' : 'bg-gradient-to-br from-cyan-100 to-slate-200 border border-cyan-300 text-cyan-700'}`}>
                AD
              </div>
              <div className="flex flex-col">
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manbase</span>
                <span className={`text-[16px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin Panel</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button type="button" className={`relative p-2.5 rounded-full transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`}>
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,1)]" />
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center gap-4">
            <h1 className={`text-lg font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {ADMIN_NAVIGATION.flatMap(c => c.items).find(i => i.href === pathname)?.name || "Admin Dashboard"}
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-3 sm:gap-4">
            <div className="flex items-center relative group cursor-text">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              </div>
              <div className={`h-9 w-64 rounded-xl pl-9 pr-3 flex items-center justify-between transition-all border shadow-sm ${isDarkMode ? 'bg-[#0A0A0C] border-white/10 group-hover:border-white/20' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                <span className={`text-[13px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Search users, logs...</span>
                <div className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${isDarkMode ? 'text-slate-500 bg-white/5 border-white/10' : 'text-slate-400 bg-slate-50 border-slate-200'}`}><Command className="w-3 h-3" /> K</div>
              </div>
            </div>

            <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-300'}`} />

            <button type="button" onClick={toggleTheme} className={`relative p-2 rounded-full transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`} title="Toggle Theme">
              {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <button className={`relative p-2 rounded-full transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`}>
              <Bell className="w-[18px] h-[18px]" />
              <span className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,1)]`} />
            </button>
          </div>
        </header>

        {/* --- MAIN CONTENT INJECTION --- */}
        <main className="flex-1 overflow-y-auto relative p-4 pb-28 lg:pb-8 sm:p-8">
          {/* Admin specific background ambient glow */}
          {isDarkMode && <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[40vh] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none z-0" />}
          <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />

          <div className="relative z-10 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>

        {/* --- MOBILE LIQUID GLASS DOCK --- */}
        <div className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[420px] h-[76px] rounded-[38px] z-50 transition-all duration-500 ${isDarkMode
          ? 'bg-[#25252b]/40 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/[0.12] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]'
          : 'bg-white/40 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)]'
          }`}>

          {/* Admin FAB (Alerts/Actions) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-50">
            <Link
              href="/manbase/alerts"
              className={`flex items-center justify-center w-[68px] h-[68px] rounded-full transition-transform active:scale-95 ${isDarkMode
                ? 'bg-gradient-to-b from-cyan-900 to-[#111115] border border-cyan-500/30 text-cyan-400 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                : 'bg-gradient-to-b from-cyan-500 to-cyan-600 border border-cyan-400 text-white shadow-[0_16px_32px_-8px_rgba(6,182,212,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                }`}
            >
              <ShieldAlert className="w-6 h-6 stroke-[2px] relative z-10" />
            </Link>
          </div>

          <div className="w-full h-full grid grid-cols-5 items-center justify-items-center relative z-10 px-2">
            {MOBILE_NAV.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (item.isAction) return <div key="fab-spacer" className="w-full h-full pointer-events-none" />;

              if (item.action === "TOGGLE_MENU") {
                return (
                  <button key={item.name} onClick={() => setIsMobileMenuOpen(true)} className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                    <Icon className="w-[24px] h-[24px]" />
                    <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                  </button>
                );
              }

              return (
                <Link key={item.name} href={item.href || "#"} className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-300 relative ${isActive ? (isDarkMode ? 'text-cyan-400' : 'text-cyan-600') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}>
                  <div className="relative flex flex-col items-center">
                    {isActive && <div className={`absolute -top-3 w-5 h-1 rounded-full ${isDarkMode ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]' : 'bg-cyan-600 shadow-sm'}`} />}
                    <Icon className={`w-[24px] h-[24px] transition-transform ${isActive ? 'stroke-[2.5px] -translate-y-0.5' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-medium tracking-wide transition-all ${isActive ? 'opacity-100 font-bold' : 'opacity-80'}`}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}