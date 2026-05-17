"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Download, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const centerCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const floatCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Badge & Headline Stagger
      tl.fromTo(
        ".animate-badge",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )
        .fromTo(
          ".animate-headline",
          { y: 50, opacity: 0, filter: "blur(10px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: 0.12 },
          "-=0.5"
        )
        .fromTo(
          ".animate-body",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          ".animate-social",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          ".animate-actions",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
          "-=0.3"
        );

      // 2. Phone Mockup Base
      tl.fromTo(
        phoneRef.current,
        { y: 80, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.1)" },
        "-=1.2"
      );

      // 3. Card Fan Reveal (Emerging from phone)
      tl.fromTo(
        [leftCardRef.current, centerCardRef.current, rightCardRef.current],
        { y: 150, opacity: 0, scale: 0.5, rotationZ: 0 },
        { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: "back.out(1.2)" },
        "-=0.8"
      );

      // Fan out into tight formation
      gsap.to(leftCardRef.current, {
        x: "-42%",
        y: 40,
        rotationZ: -12,
        scale: 0.85,
        duration: 1.6,
        ease: "power3.out",
        delay: 1.0,
      });
      gsap.to(rightCardRef.current, {
        x: "42%",
        y: 40,
        rotationZ: 12,
        scale: 0.85,
        duration: 1.6,
        ease: "power3.out",
        delay: 1.1,
      });
      gsap.to(centerCardRef.current, {
        rotationZ: 0,
        y: -15,
        scale: 1.05,
        duration: 1.6,
        ease: "power3.out",
        delay: 1.0,
      });

      // 4. Floating Notification Card
      tl.fromTo(
        floatCardRef.current,
        { x: 30, y: 20, opacity: 0, scale: 0.8 },
        { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" },
        "-=0.5"
      );

      // 5. Ambient Floating (Infinite & Synchronized)
      gsap.to(leftCardRef.current, {
        y: "+=12",
        rotationZ: "-=1",
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2.6,
      });
      gsap.to(centerCardRef.current, {
        y: "-=10",
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2.6,
      });
      gsap.to(rightCardRef.current, {
        y: "+=12",
        rotationZ: "+=1",
        duration: 4.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2.6,
      });
      gsap.to(floatCardRef.current, {
        y: "-=8",
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] w-full bg-[#030303] overflow-hidden flex items-center pt-20"
    >
      {/* --- AMBIENT STUDIO LIGHTING --- */}
      <div className="absolute top-[5%] left-[50%] -translate-x-1/2 w-[90vw] h-[60vh] bg-indigo-900/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[50vh] bg-[#3b0764]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[40vw] h-[40vh] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container px-4 md:px-8 mx-auto relative z-10 w-full max-w-7xl py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* --- LEFT COLUMN: COPY --- */}
          <div className="flex flex-col items-start text-left space-y-8 lg:pr-8">

            {/* Badge */}
            <div className="animate-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-slate-300 tracking-widest uppercase">
                Trusted by 70+ million customers
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="animate-headline text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-black tracking-tighter text-white leading-[0.95]">
                Banking &
              </h1>
              <h1 className="animate-headline text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-[0.95]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-slate-200 to-indigo-300">
                  Beyond.
                </span>
              </h1>
            </div>

            {/* Body */}
            <p className="animate-body text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-md">
              This is your bank, redefined. Get powerful daily banking, global freedom, and instant multi-currency cards. Start saving in under 3 minutes.
            </p>

            {/* CTAs */}
            <div className="animate-actions flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/signin">
                <Button className="h-14 rounded-full bg-white text-black hover:bg-slate-200 text-base font-bold transition-all active:scale-[0.98] px-8 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                  Start Saving Currency
                </Button>
              </Link>
              <Link href={'#features'}>
                <Button
                  variant="outline"
                  className="h-14 rounded-full text-white bg-transparent border-white/20 hover:bg-white/10 hover:text-white text-base font-medium transition-all group px-8 backdrop-blur-md"
                >
                  Explore Features
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="animate-social flex items-center gap-4 pt-2">
              <div className="flex -space-x-3">
                {[
                  "bg-gradient-to-br from-pink-400 to-rose-500",
                  "bg-gradient-to-br from-blue-400 to-indigo-500",
                  "bg-gradient-to-br from-amber-400 to-orange-500",
                  "bg-gradient-to-br from-emerald-400 to-teal-500",
                ].map((gradient, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${gradient} border-2 border-[#030303] flex items-center justify-center text-xs font-bold text-white relative z-${40 - i}`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  <span className="text-slate-300 font-semibold">4.9/5</span> from 2M+ reviews
                </p>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: VISUALS (RESTRUCTURED) --- */}
          <div className="relative flex items-center justify-center h-[500px] md:h-[600px] lg:h-[700px] w-full perspective-[2000px]">

            {/* Core Center Glow to pop cards off the background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none z-0" />

            {/* Sleek Central Phone Mockup Base */}
            <div
              ref={phoneRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] md:w-[300px] h-[580px] md:h-[620px] bg-[#050505] rounded-[3.5rem] border-[8px] border-slate-900/80 shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)] z-0 hidden sm:block will-change-transform"
            >
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20 border border-white/5" />

              {/* Screen Content Gradient */}
              <div className="w-full h-full bg-gradient-to-b from-slate-900/50 via-indigo-950/30 to-black rounded-[2.8rem] overflow-hidden border border-white/5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_70%)]" />
                {/* Subtle UI lines inside phone */}
                <div className="absolute top-20 left-6 right-6 h-12 rounded-xl bg-white/5 border border-white/5" />
                <div className="absolute top-36 left-6 right-6 h-32 rounded-xl bg-white/5 border border-white/5" />
              </div>
            </div>

            {/* Card Fan Container */}
            <div className="relative w-full max-w-[400px] md:max-w-[500px] h-[400px] flex justify-center items-center z-10">

              {/* LEFT CARD (Brushed Silver) */}
              <div
                ref={leftCardRef}
                className="absolute w-[280px] md:w-[320px] h-[175px] md:h-[200px] rounded-[20px] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-white/40 z-10 will-change-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#cbd5e1] to-[#64748b]" />
                <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.4)_30%,rgba(255,255,255,0.8)_40%,transparent_50%)] mix-blend-overlay" />
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                <div className="relative z-10 h-full p-5 md:p-6 flex flex-col justify-between">
                  <div className="w-10 h-7 md:w-12 md:h-9 rounded-md bg-gradient-to-br from-slate-100 to-slate-400 p-[1px] border border-slate-500 shadow-sm">
                    <div className="w-full h-full border border-slate-400/50 rounded-[4px]" />
                  </div>
                  <div className="mt-auto">
                    <p className="text-slate-800 font-mono text-base md:text-lg tracking-[0.15em] mb-2 [text-shadow:1px_1px_0px_rgba(255,255,255,0.5)]">
                      **** **** **** 1024
                    </p>
                    <div className="flex justify-between items-end">
                      <p className="text-slate-700 text-xs font-bold tracking-wider">GBP ACCOUNT</p>
                      <div className="flex">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#eb001b] mix-blend-multiply opacity-80 relative z-10" />
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#f79e1b] mix-blend-multiply opacity-80 -ml-3 md:-ml-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD (Deep Indigo) */}
              <div
                ref={rightCardRef}
                className="absolute w-[280px] md:w-[320px] h-[175px] md:h-[200px] rounded-[20px] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-indigo-400/30 z-10 will-change-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-bl from-[#312e81] via-[#1e1b4b] to-[#020617]" />
                <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(100,255,255,0.08)_30%,rgba(255,255,255,0.15)_40%,transparent_50%)] mix-blend-screen" />
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                <div className="relative z-10 h-full p-5 md:p-6 flex flex-col justify-between">
                  <div className="w-10 h-7 md:w-12 md:h-9 rounded-md bg-gradient-to-br from-slate-300 to-slate-500 p-[1px] border border-slate-600 shadow-inner opacity-90">
                    <div className="w-full h-full border border-black/30 rounded-[4px]" />
                  </div>
                  <div className="mt-auto">
                    <p className="text-[#e2e8f0] font-mono text-base md:text-lg tracking-[0.15em] mb-2 [text-shadow:1px_1px_1px_rgba(0,0,0,0.8)]">
                      **** **** **** 8890
                    </p>
                    <div className="flex justify-between items-end">
                      <p className="text-white text-xs font-bold tracking-wider [text-shadow:1px_1px_1px_rgba(0,0,0,0.8)]">EUR ACCOUNT</p>
                      <div className="flex">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#eb001b] mix-blend-screen opacity-90 relative z-10" />
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#f79e1b] mix-blend-screen opacity-90 -ml-3 md:-ml-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER CARD (Dark Titanium - Hero) */}
              <div
                ref={centerCardRef}
                className="absolute w-[300px] md:w-[360px] h-[190px] md:h-[225px] rounded-[24px] overflow-hidden z-30 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] border border-white/10 will-change-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#404045] via-[#1f1f23] to-[#111114]" />
                <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,105,180,0.06)_30%,rgba(100,255,255,0.06)_40%,rgba(255,255,255,0.15)_45%,transparent_55%)] mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />

                <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start w-full">
                    <div className="w-12 h-9 md:w-14 md:h-10 rounded-md bg-gradient-to-br from-[#c0c0c0] via-[#a0a0a0] to-[#707070] flex flex-col justify-between p-[2px] border border-[#505050] shadow-inner opacity-90">
                      <div className="flex justify-between h-[30%]"><div className="w-[35%] border-b border-r border-[#505050]/50 rounded-br-sm" /><div className="w-[35%] border-b border-l border-[#505050]/50 rounded-bl-sm" /></div>
                      <div className="flex justify-between h-[30%]"><div className="w-[35%] border-y border-r border-[#505050]/50 rounded-r-sm" /><div className="w-[35%] border-y border-l border-[#505050]/50 rounded-l-sm" /></div>
                      <div className="flex justify-between h-[30%]"><div className="w-[35%] border-t border-r border-[#505050]/50 rounded-tr-sm" /><div className="w-[35%] border-t border-l border-[#505050]/50 rounded-tl-sm" /></div>
                    </div>
                    <svg className="w-7 h-7 md:w-8 md:h-8 text-white/60 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 21.3c-2.4-2.8-3.5-6.5-3.5-10.3 0-3.8 1.1-7.5 3.5-10.3M12.5 19.8c-1.8-2.1-2.5-4.8-2.5-7.8s.7-5.7 2.5-7.8M16.5 18.3c-1.2-1.4-1.5-3.1-1.5-5.3s.3-3.9 1.5-5.3M20.5 16.8c-.6-.7-.5-1.7-.5-2.8s-.1-2.1.5-2.8" />
                    </svg>
                  </div>

                  <div className="mt-auto">
                    <p className="text-[#e2e8f0] font-mono text-lg md:text-[20px] tracking-[0.15em] mb-3 [text-shadow:1px_1px_1px_rgba(0,0,0,0.8),-1px_-1px_1px_rgba(255,255,255,0.2)]">
                      4234 5678 9992 9012
                    </p>
                    <div className="flex justify-between items-end">
                      <p className="text-[#e2e8f0] text-sm md:text-[15px] font-semibold tracking-widest [text-shadow:1px_1px_1px_rgba(0,0,0,0.8),-1px_-1px_1px_rgba(255,255,255,0.1)] uppercase">
                        SATOSHI NAKAMOTO
                      </p>
                      <div className="flex">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#eb001b] mix-blend-screen relative z-10 opacity-90" />
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#f79e1b] mix-blend-screen -ml-4 md:-ml-5 opacity-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Notification Card - Pinned to composition bottom-right */}
            <div
              ref={floatCardRef}
              className="absolute bottom-4 right-0 md:bottom-12 md:right-8 lg:right-[-20px] z-40 bg-slate-900/70 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] will-change-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-400/20">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="pr-2">
                  <p className="text-xs text-slate-400 font-medium">Received now</p>
                  <p className="font-bold text-white text-sm tracking-wide">+£500.00</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}