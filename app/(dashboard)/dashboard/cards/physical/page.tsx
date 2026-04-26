"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  CreditCard, Eye, Snowflake, Settings, RefreshCw, 
  MapPin, ShieldCheck, CheckCircle2, ChevronRight,
  Wifi, Landmark, ShoppingBag, Coffee, AlertCircle
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const CARD_DETAILS = {
  name: "Satoshi Nakamoto",
  type: "Titanium Metal",
  number: "•••• •••• •••• 1234",
  fullNumber: "4111 2222 3333 1234",
  expiry: "08/28",
  cvv: "***",
  atmUsed: 400,
  atmLimit: 1000,
};

const RECENT_TRANSACTIONS = [
  { id: 1, merchant: "Whole Foods Market", amount: 124.50, date: "Today, 1:15 PM", icon: ShoppingBag, location: "New York, NY" },
  { id: 2, merchant: "Starbucks", amount: 6.45, date: "Today, 8:30 AM", icon: Coffee, location: "New York, NY" },
  { id: 3, merchant: "Chase ATM", amount: 200.00, date: "Yesterday", icon: Landmark, location: "Brooklyn, NY" },
];

export default function PhysicalCardPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Security Toggles State
  const [isFrozen, setIsFrozen] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [contactless, setContactless] = useState(true);
  const [magstripe, setMagstripe] = useState(false);
  const [atmWithdrawals, setAtmWithdrawals] = useState(true);
  const [onlinePayments, setOnlinePayments] = useState(true);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const handleCopy = () => {
    // Copy logic mockup
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Physical Card</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your premium titanium card and physical security.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          <CreditCard className="w-4 h-4" /> Order Spare
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ==========================================
            LEFT COLUMN: CARD & MAIN ACTIONS (lg:col-span-7)
            ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card Presentation Area */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl p-6 sm:p-8 transition-colors duration-500 flex flex-col items-center">
            
            {/* The Titanium Physical Card Render */}
            <div className={`w-full max-w-[380px] aspect-[1.586/1] rounded-[24px] p-6 sm:p-7 relative overflow-hidden shadow-2xl dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-700 ease-out transform group ${isFrozen ? 'grayscale opacity-80' : ''} ${isDark ? 'bg-gradient-to-br from-[#2a2a32] via-[#111115] to-[#0A0A0C]' : 'bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400'}`}>
              
              {/* Heavy Brushed Metal Noise */}
              <div className="absolute inset-0 opacity-[0.5] dark:opacity-[0.25] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
              
              {/* Specular Highlights */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
              
              {/* Ice Overlay if Frozen */}
              {isFrozen && (
                <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-[2px] z-20 flex items-center justify-center border border-cyan-300/30 rounded-[24px]">
                  <div className="bg-[#0A0A0C]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-xs font-bold tracking-widest uppercase">Card Frozen</span>
                  </div>
                </div>
              )}

              <div className="relative z-10 flex flex-col justify-between h-full">
                
                <div className="flex justify-between items-start">
                  {/* EMV Chip */}
                  <div className="w-11 h-8 rounded-[6px] bg-gradient-to-br from-[#e0c097] via-[#c49b5c] to-[#8a6513] shadow-inner border border-black/30 flex flex-col justify-evenly px-1.5 overflow-hidden relative">
                     <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                     <div className="w-full h-[1px] bg-black/30" />
                     <div className="w-full h-[1px] bg-black/30" />
                  </div>
                  
                  {/* Contactless Icon */}
                  <div className="flex flex-col items-end">
                    <Wifi className="w-5 h-5 text-slate-700 dark:text-white/60 rotate-90 opacity-80" />
                    <span className="font-bold text-slate-800 dark:text-white/80 text-[10px] tracking-widest uppercase mt-2">{CARD_DETAILS.type}</span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <p className="text-[20px] sm:text-[22px] font-mono tracking-[0.15em] text-slate-800 dark:text-white/90 drop-shadow-md">
                    {CARD_DETAILS.number}
                  </p>
                  
                  <div className="flex justify-between items-end mt-3">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold tracking-widest uppercase text-slate-700 dark:text-white/80 drop-shadow-sm">
                        {CARD_DETAILS.name}
                      </span>
                    </div>
                    {/* Mastercard Style Circles */}
                    <div className="flex -space-x-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/80 mix-blend-multiply dark:mix-blend-screen" />
                      <div className="w-8 h-8 rounded-full bg-amber-500/80 mix-blend-multiply dark:mix-blend-screen" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Card Action Buttons */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full mt-8">
              <ActionButton 
                icon={Snowflake} 
                label={isFrozen ? "Unfreeze" : "Freeze"} 
                onClick={() => setIsFrozen(!isFrozen)}
                isActive={isFrozen}
                activeColor="text-cyan-500 bg-cyan-500/10 border-cyan-500/30"
              />
              <ActionButton 
                icon={showPin ? Eye : Eye} 
                label="Show PIN" 
                onClick={() => setShowPin(!showPin)}
                isActive={showPin}
              />
              <ActionButton icon={Settings} label="Limits" />
              <ActionButton icon={RefreshCw} label="Replace" danger={true} />
            </div>
          </div>

          {/* Physical Security Toggles */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Card Security</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              <ToggleRow 
                icon={Wifi} 
                title="Contactless Payments" 
                description="Allow tap-to-pay via NFC terminals." 
                isOn={contactless} 
                onToggle={() => setContactless(!contactless)} 
              />
              <ToggleRow 
                icon={Landmark} 
                title="ATM Withdrawals" 
                description="Allow cash withdrawals globally." 
                isOn={atmWithdrawals} 
                onToggle={() => setAtmWithdrawals(!atmWithdrawals)} 
              />
              <ToggleRow 
                icon={CreditCard} 
                title="Magstripe Transactions" 
                description="Allow swipes (less secure than Chip/PIN)." 
                isOn={magstripe} 
                onToggle={() => setMagstripe(!magstripe)} 
              />
              <ToggleRow 
                icon={ShoppingBag} 
                title="Online Transactions" 
                description="Use this physical card number for web purchases." 
                isOn={onlinePayments} 
                onToggle={() => setOnlinePayments(!onlinePayments)} 
              />
            </div>
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: TRACKING & ACTIVITY (lg:col-span-5)
            ========================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Status & Pin */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-colors duration-500">
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-white/[0.05]">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Card is Active</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Your Metal card was delivered to your primary address on Oct 1, 2026.
                </p>
              </div>
            </div>

            <div className="pt-6">
               <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 Card PIN
               </h3>
               <div className="flex items-center justify-between p-4 rounded-[16px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.04]">
                  <div className="flex items-center gap-3">
                     {showPin ? (
                       <span className="text-2xl font-mono font-bold tracking-[0.5em] text-slate-900 dark:text-white pl-2">
                         8492
                       </span>
                     ) : (
                       <div className="flex gap-2">
                         {[1,2,3,4].map(i => <div key={i} className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600" />)}
                       </div>
                     )}
                  </div>
                  <button 
                    onClick={() => setShowPin(!showPin)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[12px] font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    {showPin ? 'Hide' : 'Reveal'}
                  </button>
               </div>
            </div>
          </div>

          {/* ATM Limit Progress */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-colors duration-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5" /> ATM Rolling Limit
              </h3>
              <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                {Math.round((CARD_DETAILS.atmUsed / CARD_DETAILS.atmLimit) * 100)}% Used
              </span>
            </div>
            
            <div className="flex items-end gap-1 mb-4">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">${CARD_DETAILS.atmUsed}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1"> / ${CARD_DETAILS.atmLimit}</span>
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(CARD_DETAILS.atmUsed / CARD_DETAILS.atmLimit) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 text-center">
              Fee-free limit resets in 14 days.
            </p>
          </div>

          {/* Physical Transactions Only */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Physical Swipes & Dips</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {RECENT_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-[12px] bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                      <tx.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">{tx.merchant}</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {tx.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white">-${tx.amount.toFixed(2)}</p>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 sm:hidden" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-center bg-slate-50/50 dark:bg-white/[0.01]">
              <button className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors">
                View All Physical Activity
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- MICRO COMPONENTS ---

function ActionButton({ icon: Icon, label, danger = false, onClick, isActive = false, activeColor }: { icon: any, label: string, danger?: boolean, onClick?: () => void, isActive?: boolean, activeColor?: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 group"
    >
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[18px] flex items-center justify-center border transition-all duration-300 ${
        isActive && activeColor
          ? activeColor
          : isActive
            ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400'
            : danger 
              ? 'bg-slate-50 dark:bg-[#111115] border-slate-200 dark:border-white/[0.05] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/20'
              : 'bg-slate-50 dark:bg-[#111115] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
      }`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span className={`text-[10px] sm:text-[11px] font-bold tracking-wide ${danger ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'} transition-colors`}>
        {label}
      </span>
    </button>
  );
}

function ToggleRow({ icon: Icon, title, description, isOn, onToggle }: { icon: any; title: string; description?: string; isOn: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={onToggle}>
      <div className="flex items-center gap-4 pr-4">
        <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
        <div className="text-left">
          <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{title}</p>
          {description && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>}
        </div>
      </div>
      <button 
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none ${
          isOn ? 'bg-cyan-500 dark:bg-cyan-500' : 'bg-slate-200 dark:bg-white/10'
        }`}
      >
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ease-out ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}