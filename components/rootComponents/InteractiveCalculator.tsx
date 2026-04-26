"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { 
  ArrowDownUp, Sparkles, TrendingUp, Info, ArrowRight, 
  Globe2, PiggyBank, Activity, ShieldCheck 
} from "lucide-react";

// Fallback rates in case the API is blocked or offline
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.00, EUR: 0.92, GBP: 0.79, NGN: 1150.50, JPY: 151.20, CAD: 1.35, AUD: 1.52, CHF: 0.90
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", JPY: "¥", CAD: "$", AUD: "$", CHF: "₣"
};

export default function WealthEngine() {
  const sectionRef = useRef<HTMLElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'transfer' | 'save'>('transfer');
  
  // Transfer State
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [isLive, setIsLive] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [fromCur, setFromCur] = useState<string>("USD");
  const [toCur, setToCur] = useState<string>("EUR");
  
  // Savings State
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(500);
  const [saveGoal, setSaveGoal] = useState<'adventure' | 'wedding' | 'home'>('adventure');

  // --- FETCH REAL-TIME RATES ---
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
          setIsLive(true);
        }
      } catch (error) {
        console.log("Using fallback rates");
      }
    };
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- GSAP ANIMATIONS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      gsap.to(widgetRef.current, {
        y: "-=10",
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // --- CALCULATIONS: TRANSFER ---
  const exchangeRate = (rates[toCur] || 1) / (rates[fromCur] || 1);
  const convertedAmount = amount * exchangeRate;
  const traditionalBankFee = 15 + (amount * 0.025);
  const apexFee = 0.00; 
  const totalSavings = traditionalBankFee - apexFee;

  // --- CALCULATIONS: SAVINGS (4% AER) ---
  const calculateYield = () => {
    let total = 0;
    const monthlyRate = 0.04 / 12;
    for(let i=0; i<12; i++) {
      total += monthlyDeposit;
      total *= (1 + monthlyRate);
    }
    return total;
  };
  const projectedTotal = calculateYield();
  const interestEarned = projectedTotal - (monthlyDeposit * 12);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmount(isNaN(val) ? 0 : val);
  };

  return (
    <section 
      ref={sectionRef}
      id="pricing"
      className="relative w-full bg-[#030303] pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden border-t border-white/[0.05] scroll-mt-24"
    >
      {/* Dynamic Ambient Background Lighting */}
      <div className={`absolute top-[20%] left-[-10%] w-[60vw] h-[60vh] blur-[150px] rounded-full pointer-events-none transition-colors duration-1000 ${
        activeTab === 'transfer' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] blur-[150px] rounded-full pointer-events-none transition-colors duration-1000 ${
        activeTab === 'transfer' ? 'bg-cyan-500/10' : 'bg-indigo-500/10'
      }`} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* --- TOP HEADER & TOGGLE --- */}
        <div className="flex flex-col items-center mb-16 md:mb-24">
          <div className="inline-flex bg-white/[0.03] border border-white/10 rounded-full p-1.5 backdrop-blur-md mb-12 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`relative flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full text-sm font-bold transition-all duration-500 ${
                activeTab === 'transfer' ? 'text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTab === 'transfer' && (
                <span className="absolute inset-0 bg-white rounded-full shadow-md z-0" />
              )}
              <Globe2 className="relative z-10 w-4 h-4" />
              <span className="relative z-10 tracking-wide">Global Transfers</span>
            </button>
            <button
              onClick={() => setActiveTab('save')}
              className={`relative flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full text-sm font-bold transition-all duration-500 ${
                activeTab === 'save' ? 'text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTab === 'save' && (
                <span className="absolute inset-0 bg-white rounded-full shadow-md z-0" />
              )}
              <PiggyBank className="relative z-10 w-4 h-4" />
              <span className="relative z-10 tracking-wide">High-Yield Savings</span>
            </button>
          </div>
        </div>

        {/* --- MAIN SPLIT LAYOUT --- */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* --- LEFT: DYNAMIC COPY --- */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left relative min-h-[350px]">
            
            {/* Transfer Copy */}
            <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeTab === 'transfer' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300 tracking-widest uppercase">Real-Time Market Rates</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tighter text-white leading-[1.05] mb-6">
                Keep more of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">your own money.</span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md mb-8">
                Traditional banks quietly charge up to 3% in hidden markups. We use the real mid-market rate, saving you hundreds on every transfer.
              </p>
              
              <div className="flex items-center gap-5 bg-white/[0.02] border border-white/10 rounded-2xl p-5 w-full max-w-md backdrop-blur-sm">
                 <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                   <Sparkles className="w-7 h-7 text-emerald-400" />
                 </div>
                 <div className="text-left">
                   <p className="text-slate-400 text-xs font-semibold mb-1 tracking-wider uppercase">Estimated Savings</p>
                   <p className="text-white text-3xl font-bold tracking-tight">
                     {CURRENCY_SYMBOLS[fromCur] || ""}{totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </p>
                 </div>
              </div>
            </div>

            {/* Savings Copy */}
            <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeTab === 'save' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-bold text-rose-300 tracking-widest uppercase">4.00% AER (Variable)</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tighter text-white leading-[1.05] mb-6">
                Grow your wealth <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">on autopilot.</span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md mb-8">
                Life, meet savings. Earn 4% AER interest on your Instant Access Savings, calculated daily and paid monthly. Zero lock-in periods.
              </p>

              <ul className="space-y-4 max-w-md">
                {['Interest paid out every single month', 'Withdraw your money instantly, anytime', 'Protected by FSCS up to £85,000'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span className="text-slate-300 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>

          {/* --- RIGHT: INTERACTIVE WIDGET --- */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end" ref={widgetRef}>
            
            {/* 👇 FIX: Height increased to 600px to prevent clipping 👇 */}
            <div className="w-full max-w-[500px] h-[600px] relative perspective-[1200px]">
              
              {/* --- 1. THE CALCULATOR WIDGET --- */}
              <div className={`absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] transition-all duration-700 transform-gpu flex flex-col justify-between ${
                activeTab === 'transfer' ? 'opacity-100 rotate-y-0 scale-100 z-20' : 'opacity-0 rotate-y-[10deg] scale-95 pointer-events-none z-0'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-white font-bold text-lg">Send Money</h3>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                      <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{isLive ? 'Live Rates' : 'Offline'}</span>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-[1.5rem] p-4 mb-2 hover:border-white/20 transition-colors focus-within:border-cyan-500/50 focus-within:bg-white/[0.05]">
                    <label className="text-xs font-semibold text-slate-400 block mb-3 uppercase tracking-wider">You Send</label>
                    <div className="flex items-center justify-between gap-4">
                      <input 
                        type="number" 
                        value={amount}
                        onChange={handleAmountChange}
                        className="bg-transparent text-4xl font-bold text-white w-full outline-none font-mono tracking-tighter"
                        min="0"
                      />
                      <select 
                        value={fromCur}
                        onChange={(e) => setFromCur(e.target.value)}
                        className="bg-[#18181b] border border-white/10 text-white font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:bg-[#27272a] transition-colors appearance-none"
                      >
                        {Object.keys(rates).slice(0,10).map(cur => <option key={cur} value={cur}>{cur}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center -my-3 z-10">
                     <div className="absolute left-0 w-full h-[1px] bg-white/10" />
                     <button 
                       onClick={() => {setFromCur(toCur); setToCur(fromCur);}}
                       className="relative bg-[#18181b] border border-white/10 rounded-full p-2.5 hover:bg-white hover:text-black transition-all text-slate-400 group shadow-xl"
                     >
                       <ArrowDownUp className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                     </button>
                     <div className="absolute left-6 bg-[#0a0a0c] px-3 border border-white/5 rounded-full py-1 flex items-center gap-2 text-xs font-bold text-cyan-400">
                        1 {fromCur} = {exchangeRate.toFixed(4)} {toCur}
                     </div>
                  </div>

                  <div className="bg-cyan-500/[0.03] border border-cyan-500/20 rounded-[1.5rem] p-4 mt-2">
                    <label className="text-xs font-semibold text-cyan-400 block mb-3 uppercase tracking-wider">Recipient Gets</label>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-4xl font-bold text-white w-full font-mono tracking-tighter overflow-hidden text-ellipsis">
                        {convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <select 
                        value={toCur}
                        onChange={(e) => setToCur(e.target.value)}
                        className="bg-[#18181b] border border-cyan-500/30 text-white font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:bg-[#27272a] transition-colors appearance-none"
                      >
                        {Object.keys(rates).slice(0,10).map(cur => <option key={cur} value={cur}>{cur}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 👇 FIX: Added shrink-0 to button 👇 */}
                <button className="w-full shrink-0 h-14 mt-6 rounded-full bg-white text-black hover:bg-cyan-50 text-base font-bold transition-transform active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 group">
                  Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* --- 2. THE SAVINGS SIMULATOR WIDGET --- */}
              <div className={`absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-[#0a0a0c] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] transition-all duration-700 transform-gpu flex flex-col justify-between ${
                activeTab === 'save' ? 'opacity-100 rotate-y-0 scale-100 z-20' : 'opacity-0 rotate-y-[-10deg] scale-95 pointer-events-none z-0'
              }`}>
                
                {/* 👇 FIX: Added shrink-0 to prevent goals from getting squashed 👇 */}
                <div className="flex gap-2 shrink-0 mb-4 overflow-x-auto pb-2 scrollbar-hide pt-1">
                  {[
                    { id: 'adventure', label: 'Adventure', icon: '✈️' },
                    { id: 'wedding', label: 'Wedding', icon: '💍' },
                    { id: 'home', label: 'New Home', icon: '🏠' }
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setSaveGoal(goal.id as any)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        saveGoal === goal.id ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <span>{goal.icon}</span> {goal.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <p className="text-slate-300 font-medium mb-1">If you save</p>
                    <div className="flex justify-center items-end gap-1">
                      <span className="text-5xl font-black text-white font-mono tracking-tighter">${monthlyDeposit}</span>
                      <span className="text-slate-400 font-bold mb-1">/mo</span>
                    </div>
                  </div>

                  <div className="mb-8 px-2 shrink-0">
                    <input 
                      type="range" 
                      min="50" 
                      max="2000" 
                      step="50"
                      value={monthlyDeposit}
                      onChange={(e) => setMonthlyDeposit(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-400"
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                      <span>$50</span>
                      <span>$2,000+</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shrink-0">
                    <p className="text-center text-sm font-medium text-slate-300 mb-3">In 1 year, you'll have:</p>
                    <div className="text-center mb-4">
                      <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400 font-mono tracking-tighter">
                        ${projectedTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold border-t border-white/10 pt-3">
                      <span className="text-slate-400">Total Deposits</span>
                      <span className="text-white">${(monthlyDeposit * 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold mt-2">
                      <span className="text-slate-400">Interest Earned</span>
                      <span className="text-rose-400">+${interestEarned.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                {/* 👇 FIX: Added shrink-0 and specific margin 👇 */}
                <button className="w-full shrink-0 h-14 mt-6 rounded-full bg-white text-black hover:bg-indigo-50 text-base font-bold transition-transform active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                  Open a Vault
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}