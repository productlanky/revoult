"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, TrendingUp, Activity, BarChart3, Info } from "lucide-react";
import Link from "next/link";

export default function InvestingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const chartLineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Text Entrance Stagger
      gsap.fromTo(
        ".invest-text",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
      );

      // 2. Terminal Card Entrance
      gsap.fromTo(
        terminalRef.current,
        { y: 50, opacity: 0, scale: 0.95, rotateX: 5 },
        { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1.2, ease: "power3.out", delay: 0.2 }
      );

      // 3. Draw the SVG Chart Line
      if (chartLineRef.current) {
        const length = chartLineRef.current.getTotalLength();
        gsap.set(chartLineRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(chartLineRef.current, {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power2.inOut",
          delay: 0.5
        });
      }

      // 4. Floating Mini-Tickers
      gsap.to(".float-ticker-1", {
        y: "-=12",
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0
      });
      gsap.to(".float-ticker-2", {
        y: "+=15",
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.5
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full bg-[#030303] py-24 md:py-32 overflow-hidden border-t border-white/[0.05]"
    >
      {/* Ambient Market Glow */}
      <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vh] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-teal-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* --- LEFT: COPY (Col Span 5) --- */}
          <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="invest-text inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300 tracking-widest uppercase">Commission-Free Trading</span>
              </div>
              
              <h2 className="invest-text text-4xl md:text-5xl lg:text-[56px] font-black tracking-tighter text-white leading-[1.05]">
                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">5,000+</span> <br />
                stocks and ETFs.
              </h2>
              
              <p className="invest-text text-lg text-slate-400 font-light leading-relaxed max-w-md">
                From Apple to Zoom, invest in some of the biggest and most influential companies in the world, commission-free within your monthly allowance.²
              </p>
              
              <div className="invest-text flex items-center gap-2 text-sm text-slate-500">
                <Info className="w-4 h-4" />
                <span>Other fees may apply. Capital at risk.</span>
              </div>
            </div>

            <Link href={'/signin'} className="invest-text h-14 rounded-full bg-white text-black px-8 font-bold text-base hover:bg-emerald-50 active:scale-[0.98] transition-all duration-300 inline-flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(52,211,153,0.3)] group">
              Start Investing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* --- RIGHT: TRADING TERMINAL (Col Span 7) --- */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end order-1 lg:order-2">
            
            {/* Main Terminal Stage */}
            <div className="w-full max-w-[550px] relative perspective-[1200px] mt-10 lg:mt-0">
              
              {/* Central Glass Card */}
              <div 
                ref={terminalRef}
                className="w-full bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden transform-gpu"
              >
                {/* Header Info */}
                <div className="p-6 md:p-8 pb-4 border-b border-white/5 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                        {/* Fake Apple Logo Placeholder */}
                        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.84 1.5.05 2.78.69 3.51 1.84-3.2 1.89-2.65 6.07.41 7.29-.68 1.54-1.63 3.01-2.5 3.88zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.36 2.33-1.85 4.31-3.74 4.25z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight">Apple Inc.</h3>
                        <p className="text-slate-400 text-xs font-semibold tracking-wider">AAPL • NASDAQ</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white tracking-tighter font-mono">$173.50</p>
                    <p className="text-emerald-400 font-bold text-sm flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3" /> +1.05% Today
                    </p>
                  </div>
                </div>

                {/* Animated Chart Area */}
                <div className="relative w-full h-[200px] md:h-[240px] bg-gradient-to-b from-transparent to-[#050505]">
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-4 px-6 opacity-10 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-full h-px bg-white border-dashed" />
                    ))}
                  </div>

                  {/* SVG Chart */}
                  <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 400 150">
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area Fill */}
                    <path 
                      d="M0,120 C40,110 80,130 120,90 C160,50 200,80 250,60 C300,40 350,20 400,10 L400,150 L0,150 Z" 
                      fill="url(#chartGrad)" 
                    />
                    {/* Animated Line */}
                    <path 
                      ref={chartLineRef}
                      d="M0,120 C40,110 80,130 120,90 C160,50 200,80 250,60 C300,40 350,20 400,10" 
                      fill="none" 
                      stroke="#34d399" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Live Pulse Indicator on the end of the line */}
                  <div className="absolute top-[8%] right-0 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,1)] z-10 translate-x-1.5 -translate-y-1.5">
                    <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75" />
                  </div>
                </div>

                {/* Bottom Stats / UI */}
                <div className="p-6 md:p-8 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex gap-4">
                    <button className="text-white font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition-colors">1D</button>
                    <button className="text-slate-400 hover:text-white font-bold px-2 py-2 rounded-xl text-sm transition-colors">1W</button>
                    <button className="text-slate-400 hover:text-white font-bold px-2 py-2 rounded-xl text-sm transition-colors">1M</button>
                    <button className="text-slate-400 hover:text-white font-bold px-2 py-2 rounded-xl text-sm transition-colors">1Y</button>
                  </div>
                  <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-2.5 rounded-xl text-sm transition-colors shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    Buy
                  </button>
                </div>
              </div>

              {/* --- Floating Mini-Tickers (Orbiting the Terminal) --- */}
              <div className="float-ticker-1 absolute top-12 -left-8 md:-left-16 bg-[#111115]/90 backdrop-blur-xl border border-white/10 p-3 pr-5 rounded-2xl flex items-center gap-3 shadow-2xl z-20">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                  NVDA
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">$875.28</p>
                  <p className="text-emerald-400 text-[10px] font-bold">+4.12%</p>
                </div>
              </div>

              <div className="float-ticker-2 absolute bottom-24 -right-6 md:-right-12 bg-[#111115]/90 backdrop-blur-xl border border-white/10 p-3 pr-5 rounded-2xl flex items-center gap-3 shadow-2xl z-20">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">
                  TSLA
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">$175.34</p>
                  <p className="text-rose-400 text-[10px] font-bold">-0.42%</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}