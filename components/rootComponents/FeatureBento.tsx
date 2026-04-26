"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight, Zap, Globe2, CreditCard, Lock, ArrowRight, Smartphone } from "lucide-react";

export default function FeatureBento() {
  const [activeTab, setActiveTab] = useState<'virtual' | 'physical'>('virtual');
  const sectionRef = useRef<HTMLElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Content for the interactive Hero Box
  const showcaseContent = {
    virtual: {
      title: "Limitless Virtual Cards",
      description: "Generate dedicated USD, GBP, or EUR cards for different subscriptions in seconds. Freeze or terminate them with a tap.",
      icon: <Smartphone className="w-6 h-6 text-cyan-400" />,
      glow: "group-hover:from-cyan-500/5 group-hover:to-indigo-500/10"
    },
    physical: {
      title: "Elevate your physical spend",
      description: "Earn points on your purchases with our premium brushed-metal debit cards. Tap, dip, or swipe globally with zero hidden fees.",
      icon: <CreditCard className="w-6 h-6 text-slate-300" />,
      glow: "group-hover:from-slate-400/5 group-hover:to-white/10"
    }
  };

  const currentContent = showcaseContent[activeTab];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance Animations
      gsap.fromTo(
        ".bento-header",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }
      );

      gsap.fromTo(
        ".bento-box",
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.15, ease: "power2.out", delay: 0.2 }
      );

      // 2. Continuous floating for the interactive card container
      gsap.to(cardContainerRef.current, {
        y: "-=12",
        rotationZ: "-=2",
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full bg-[#030303] py-24 md:py-32 overflow-hidden border-t border-white/[0.05]"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vh] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* --- HEADER --- */}
        <div className="bento-header flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 mb-6 backdrop-blur-md">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-semibold text-slate-300 tracking-widest uppercase">The Ecosystem</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
              Everything you need.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600">Nothing you don't.</span>
            </h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-white hover:text-cyan-400 transition-colors group text-sm font-semibold tracking-wide">
            View All Features <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* --- BENTO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* --- HERO BOX 1: INTERACTIVE CARD SHOWCASE (Spans 2 columns) --- */}
          <div className={`bento-box lg:col-span-2 lg:row-span-2 bg-[#0a0a0c] border border-white/[0.05] hover:border-white/10 transition-colors duration-500 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group min-h-[450px] md:min-h-[500px] flex flex-col justify-between`}>
            
            {/* Inner Interactive Glow */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-transparent transition-all duration-700 ${currentContent.glow}`} />
            
            {/* Top Section: Toggle & Icon */}
            <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-inner transition-colors duration-500">
                {currentContent.icon}
              </div>

              {/* iOS-Style Segmented Control */}
              <div className="inline-flex bg-black/50 border border-white/10 rounded-full p-1 backdrop-blur-md self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab('virtual')}
                  className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'virtual' ? 'text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {activeTab === 'virtual' && (
                    <span className="absolute inset-0 bg-white rounded-full shadow-sm z-0" />
                  )}
                  <span className="relative z-10">Virtual</span>
                </button>
                <button
                  onClick={() => setActiveTab('physical')}
                  className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'physical' ? 'text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {activeTab === 'physical' && (
                    <span className="absolute inset-0 bg-white rounded-full shadow-sm z-0" />
                  )}
                  <span className="relative z-10">Physical</span>
                </button>
              </div>
            </div>

            {/* Bottom Section: Text & CTA */}
            <div className="relative z-20 w-full lg:w-[60%] mt-auto">
              {/* Text wrapped in absolute/relative container for crossfading */}
              <div className="min-h-[140px] md:min-h-[120px]">
                <h3 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight transition-all duration-500">
                  {currentContent.title}
                </h3>
                <p className="text-slate-400 text-base md:text-lg leading-relaxed font-light transition-all duration-500">
                  {currentContent.description}
                </p>
              </div>
              <button className="mt-6 flex items-center gap-2 text-white font-semibold text-sm group/btn hover:text-cyan-300 transition-colors">
                {activeTab === 'virtual' ? 'Create virtual card' : 'Order physical card'} 
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* The Dynamic Floating Card Element */}
            <div 
              ref={cardContainerRef}
              className="absolute top-32 lg:top-24 right-[-40px] md:right-12 lg:right-20 w-[260px] md:w-[320px] h-[160px] md:h-[200px] perspective-[1000px] z-10 pointer-events-none"
            >
              {/* Virtual Card Material */}
              <div className={`absolute inset-0 rounded-[20px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] border transition-all duration-700 ease-in-out origin-center transform-gpu
                ${activeTab === 'virtual' 
                  ? 'rotate-12 scale-100 opacity-100 border-cyan-400/30 bg-gradient-to-tr from-indigo-900/40 via-cyan-900/40 to-indigo-500/20 backdrop-blur-xl mix-blend-screen' 
                  : 'rotate-0 scale-90 opacity-0 pointer-events-none border-transparent'
                }`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(100,255,255,0.15)_30%,rgba(255,255,255,0.3)_40%,transparent_50%)]" />
                <div className="relative z-10 h-full p-5 md:p-6 flex flex-col justify-between">
                    <div className="w-10 h-7 md:w-12 md:h-9 rounded-md bg-white/10 p-[1px] border border-white/20"><div className="w-full h-full border border-black/10 rounded-[4px]" /></div>
                    <div className="mt-auto">
                        <p className="text-[#e2e8f0] font-mono text-lg md:text-xl tracking-[0.15em] mb-2 [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">**** 9012</p>
                        <div className="flex justify-between items-end">
                            <p className="text-white text-[10px] md:text-xs font-bold tracking-wider">VIRTUAL • SATOSHI</p>
                            <div className="flex"><div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#eb001b] opacity-80 relative z-10" /><div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#f79e1b] opacity-80 -ml-3 md:-ml-4" /></div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Physical Card Material */}
              <div className={`absolute inset-0 rounded-[20px] shadow-[0_40px_80px_-10px_rgba(0,0,0,1)] border transition-all duration-700 ease-in-out origin-center transform-gpu
                ${activeTab === 'physical' 
                  ? 'rotate-6 scale-100 opacity-100 border-slate-400/40 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700' 
                  : 'rotate-12 scale-110 opacity-0 pointer-events-none border-transparent'
                }`}
              >
                 <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                 <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.4)_30%,rgba(255,255,255,0.8)_40%,transparent_50%)] mix-blend-overlay" />
                 <div className="relative z-10 h-full p-5 md:p-6 flex flex-col justify-between">
                    {/* Metal Chip */}
                    <div className="w-10 h-7 md:w-12 md:h-9 rounded-md bg-gradient-to-br from-yellow-100 to-yellow-400 p-[1px] border border-yellow-600/50 shadow-inner">
                      <div className="flex justify-between h-full flex-col p-1"><div className="border-b border-black/20 h-1/2 w-full" /></div>
                    </div>
                    <div className="mt-auto">
                        <p className="text-slate-800 font-mono text-lg md:text-xl tracking-[0.15em] mb-2 [text-shadow:1px_1px_0px_rgba(255,255,255,0.5)]">**** 4432</p>
                        <div className="flex justify-between items-end">
                            <p className="text-slate-800 text-[10px] md:text-xs font-bold tracking-wider">METAL • SATOSHI</p>
                            <div className="flex"><div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#eb001b] mix-blend-multiply opacity-80 relative z-10" /><div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#f79e1b] mix-blend-multiply opacity-80 -ml-3 md:-ml-4" /></div>
                        </div>
                    </div>
                </div>
              </div>
            </div>

          </div>

          {/* --- SIDE BOX 1: INSTANT TRANSFERS (Spans 1 column) --- */}
          <div className="bento-box lg:col-span-1 bg-[#0a0a0c] border border-white/[0.05] hover:border-white/10 transition-colors rounded-[2rem] p-8 relative overflow-hidden group min-h-[250px] flex flex-col justify-end cursor-pointer">
            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 transform-gpu">
               <Globe2 className="w-32 h-32 text-cyan-500/20 stroke-[1]" />
            </div>

            <div className="relative z-20 mt-12">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-colors">
                <ArrowUpRight className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Global Transfers</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Send money across borders instantly with real-time mid-market exchange rates and zero hidden fees.
              </p>
            </div>
          </div>

          {/* --- SIDE BOX 2: BILLS & SUBSCRIPTIONS (Spans 1 column) --- */}
          <div className="bento-box lg:col-span-1 bg-[#0a0a0c] border border-white/[0.05] hover:border-white/10 transition-colors rounded-[2rem] p-8 relative overflow-hidden group min-h-[250px] flex flex-col justify-end cursor-pointer">
            {/* Mock Subscription UI */}
            <div className="absolute top-8 right-8 flex flex-col gap-2 opacity-50 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
               <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2 pr-4 border border-white/10 backdrop-blur-sm">
                 <div className="w-6 h-6 rounded-full bg-[#E50914] flex items-center justify-center text-[10px] font-bold text-white">N</div>
                 <span className="text-[10px] text-white font-medium">-$14.99</span>
               </div>
               <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2 pr-4 border border-white/10 backdrop-blur-sm ml-6">
                 <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center text-[10px] font-bold text-black">S</div>
                 <span className="text-[10px] text-white font-medium">-$9.99</span>
               </div>
            </div>

            <div className="relative z-20 mt-12">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-5 group-hover:bg-purple-500/20 transition-colors">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Auto-Pilot Bills</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Automatically detect subscriptions. Never pay for a service you forgot to cancel again.
              </p>
            </div>
          </div>

        </div>

        <button className="md:hidden mt-8 w-full flex items-center justify-center gap-2 text-white bg-white/5 border border-white/10 rounded-full h-14 hover:bg-white/10 transition-colors text-sm font-semibold tracking-wide">
          View All Features <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </section>
  );
}