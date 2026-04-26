"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Fade in the left brand panel
      gsap.fromTo(
        ".brand-element",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
      );

      // 2. Continuous float for the abstract card
      gsap.to(cardRef.current, {
        y: "-=15",
        rotationZ: "+=2",
        rotationX: "+=5",
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // 3. Slide in the form side
      gsap.fromTo(
        formRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out", delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-[100dvh] w-full bg-[#030303] flex">
      
      {/* --- LEFT SIDE: BRAND & VISUAL (Hidden on mobile) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-white/[0.05]">
        
        {/* Ambient Lighting */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Top: Logo & Back Link */}
        <div className="relative z-10 flex items-center justify-between brand-element">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <span className="text-black font-black text-sm tracking-tighter">R</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight group-hover:text-slate-200 transition-colors">
              Revolut
            </span>
          </Link>

          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to site
          </Link>
        </div>

        {/* Middle: Abstract 3D Security Element */}
        <div className="relative z-10 flex-1 flex items-center justify-center perspective-[1000px]">
          <div 
            ref={cardRef}
            className="relative w-[320px] h-[200px] rounded-[24px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 transform-gpu rotate-[-10deg] rotate-x-[15deg] rotate-y-[-10deg]"
          >
            {/* Dark Titanium Card Material */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1f] via-[#0a0a0c] to-[#050505] rounded-[24px] overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(100,255,255,0.05)_30%,rgba(255,255,255,0.1)_40%,transparent_50%)] mix-blend-screen" />
               <div className="absolute top-6 left-6 w-12 h-9 rounded-md bg-white/5 p-[1px] border border-white/10">
                 <div className="w-full h-full border border-black/30 rounded-[4px]" />
               </div>
               <div className="absolute bottom-6 left-6 right-6">
                 <div className="w-full h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                   <div className="w-1/3 h-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                 </div>
                 <div className="flex justify-between items-end">
                    <p className="text-white/40 font-mono text-sm tracking-[0.2em]">SECURE KEY</p>
                    <ShieldCheck className="w-6 h-6 text-emerald-400/80" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom: Social Proof / Quote */}
        <div className="relative z-10 brand-element">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-emerald-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-md">
            "The most seamless banking experience I've ever used. Managing multiple currencies feels completely effortless."
          </p>
          <p className="text-slate-500 text-sm mt-2 font-semibold tracking-wide">
            ALEX CHEN, PRODUCT DESIGNER
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM AREA --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        {/* Mobile-only background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-900/10 blur-[120px] lg:hidden pointer-events-none" />

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center lg:hidden z-20">
          <Link href="/" className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-black font-black text-sm tracking-tighter">R</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Cancel
          </Link>
        </div>

        {/* Form Stage */}
        <div 
          ref={formRef}
          className="w-full max-w-[440px] relative z-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              {title}
            </h1>
            <p className="text-slate-400 text-base font-light">
              {subtitle}
            </p>
          </div>

          {/* This is where your actual form fields will be injected */}
          <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/[0.05] p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
            {children}
          </div>
          
        </div>
      </div>

    </div>
  );
}