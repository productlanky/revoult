"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse position for the 3D parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    // Normalize coordinates between -1 and 1
    const x = (e.clientX / clientWidth - 0.5) * 2;
    const y = (e.clientY / clientHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Fade in the left brand panel elements
      gsap.fromTo(
        ".brand-element",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
      );

      // 2. Base vertical float for the 3D card
      gsap.to(cardRef.current, {
        y: "-=12",
        duration: 3.5,
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

  // Apply Parallax effect on top of the floating animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationY: mousePos.x * 15 - 10, // Base -10deg + parallax
        rotationX: -mousePos.y * 15 + 15, // Base +15deg + parallax
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }, [mousePos]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      // CRITICAL FIX: Fixed height 'h-[100dvh]' and hidden overflow on the main wrapper
      className="h-[100dvh] w-full bg-[#030303] flex overflow-hidden"
    >

      {/* --- LEFT SIDE: BRAND & VISUAL (Fixed in place) --- */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden flex-col justify-between p-12 border-r border-white/[0.05]">

        {/* Ambient Studio Lighting */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-indigo-600/15 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

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
        </div>

        {/* Middle: Ultra-Realistic Obsidian Card */}
        <div className="relative z-10 flex-1 flex items-center justify-center perspective-[1200px]">
          <div
            ref={cardRef}
            className="relative w-[300px] md:w-[360px] h-[190px] md:h-[225px] rounded-[24px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] border border-white/10 transform-gpu z-20"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Base Dark Titanium Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#404045] via-[#1f1f23] to-[#111114] rounded-[24px] overflow-hidden" />

            {/* Glossy Pink/Cyan Reflection Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,105,180,0.06)_30%,rgba(100,255,255,0.06)_40%,rgba(255,255,255,0.15)_45%,transparent_55%)] mix-blend-screen rounded-[24px] overflow-hidden" />

            {/* Edge Lighting Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 rounded-[24px] overflow-hidden" />

            {/* SVG Noise Texture (Brushed Metal feel) */}
            <div className="absolute inset-0 opacity-[0.04] rounded-[24px] overflow-hidden" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />

            <div className="relative z-10 h-full p-6 flex flex-col justify-between">

              {/* Card Top: Chip and Contactless Icon */}
              <div className="flex justify-between items-start w-full">
                {/* Silver EMV Chip */}
                <div className="w-12 h-9 md:w-14 md:h-10 rounded-md bg-gradient-to-br from-[#c0c0c0] via-[#a0a0a0] to-[#707070] flex flex-col justify-between p-[2px] border border-[#505050] shadow-inner opacity-90">
                  <div className="flex justify-between h-[30%]"><div className="w-[35%] border-b border-r border-[#505050]/50 rounded-br-sm" /><div className="w-[35%] border-b border-l border-[#505050]/50 rounded-bl-sm" /></div>
                  <div className="flex justify-between h-[30%]"><div className="w-[35%] border-y border-r border-[#505050]/50 rounded-r-sm" /><div className="w-[35%] border-y border-l border-[#505050]/50 rounded-l-sm" /></div>
                  <div className="flex justify-between h-[30%]"><div className="w-[35%] border-t border-r border-[#505050]/50 rounded-tr-sm" /><div className="w-[35%] border-t border-l border-[#505050]/50 rounded-tl-sm" /></div>
                </div>

                {/* Contactless Waves */}
                <svg className="w-7 h-7 md:w-8 md:h-8 text-white/60 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 21.3c-2.4-2.8-3.5-6.5-3.5-10.3 0-3.8 1.1-7.5 3.5-10.3M12.5 19.8c-1.8-2.1-2.5-4.8-2.5-7.8s.7-5.7 2.5-7.8M16.5 18.3c-1.2-1.4-1.5-3.1-1.5-5.3s.3-3.9 1.5-5.3M20.5 16.8c-.6-.7-.5-1.7-.5-2.8s-.1-2.1.5-2.8" />
                </svg>
              </div>

              {/* Card Bottom: Details */}
              <div className="mt-auto">
                <p className="text-[#e2e8f0] font-mono text-lg md:text-[20px] tracking-[0.15em] mb-3 [text-shadow:1px_1px_1px_rgba(0,0,0,0.8),-1px_-1px_1px_rgba(255,255,255,0.2)]">
                  **** **** **** 2026
                </p>
                <div className="flex justify-between items-end">
                  <p className="text-[#e2e8f0] text-sm md:text-[15px] font-semibold tracking-widest [text-shadow:1px_1px_1px_rgba(0,0,0,0.8),-1px_-1px_1px_rgba(255,255,255,0.1)] uppercase">
                    SECURE ACCESS
                  </p>

                  {/* Master Logo Rings */}
                  <div className="flex">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#eb001b] mix-blend-screen relative z-10 opacity-90" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#f79e1b] mix-blend-screen -ml-4 md:-ml-5 opacity-90" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom: Social Proof */}
        <div className="relative z-10 brand-element">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-emerald-400 fill-current drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-md">
            "The most seamless banking experience I've ever used. Managing multiple currencies feels completely effortless."
          </p>
          <p className="text-slate-500 text-sm mt-3 font-semibold tracking-wide uppercase">
            Alex Chen, Product Designer
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM AREA (Scrollable) --- */}
      {/* CRITICAL FIX: Added 'h-full overflow-y-auto scrollbar-hide' to make this panel scrollable */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-center justify-center p-6 sm:p-12 relative scrollbar-hide">

        {/* Mobile-only background glow (attached to scrolling container) */}
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-900/10 blur-[120px] lg:hidden pointer-events-none" />

        {/* Mobile Header (Hidden on Desktop, floats above scroll) */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center lg:hidden z-20">
          <Link href="/" className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-black font-black text-sm tracking-tighter">R</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Cancel
          </Link>
        </div>

        {/* The active page content (Login/Signup Form) will be injected here */}
        <div ref={formRef} className="w-full max-w-[440px] relative z-10 py-20">
          {children}
        </div>
      </div>

    </div>
  );
}