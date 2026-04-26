"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Shield, Lock, ArrowRight, Fingerprint, Activity, ShieldCheck, Eye } from "lucide-react";
import Link from "next/link";

export default function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Text Entrance
      gsap.fromTo(
        ".sec-text",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
      );

      // 2. Visual Container Entrance
      gsap.fromTo(
        visualRef.current,
        { x: 50, opacity: 0, scale: 0.95 },
        { x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out", delay: 0.2 }
      );

      // 3. Floating Shield Core
      gsap.to(shieldRef.current, {
        y: "-=15",
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // 4. Counter-rotating Security Rings
      gsap.to(ring1Ref.current, {
        rotation: 360,
        duration: 40,
        ease: "none",
        repeat: -1,
      });
      gsap.to(ring2Ref.current, {
        rotation: -360,
        duration: 30,
        ease: "none",
        repeat: -1,
      });

      // 5. Laser Scanner Effect
      gsap.fromTo(
        scannerRef.current,
        { y: "-10%" },
        {
          y: "400%", // Scan downwards
          duration: 3,
          ease: "linear",
          repeat: -1,
          opacity: 0.8,
          yoyo: true
        }
      );

      // 6. Floating Action Pills (Threat Blocked, etc.)
      gsap.fromTo(
        ".sec-pill-1",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 1 }
      );
      gsap.fromTo(
        ".sec-pill-2",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 2.5 }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full bg-[#030303] py-24 md:py-32 overflow-hidden border-t border-white/[0.05]"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[50vw] h-[60vh] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vh] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* --- LEFT: COPY --- */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="sec-text inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-bold tracking-wide">
                <Lock className="w-4 h-4" />
                Revolut Secure
              </div>
              
              <h2 className="sec-text text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05]">
                Your money's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">safe space.</span>
              </h2>
              
              <p className="sec-text text-lg text-slate-400 font-light leading-relaxed max-w-lg">
                With Revolut Secure, you're entering the new era of money security — where your bank account has 24/7 protection through proactive, purpose-built defences and a team of specialists.
              </p>
            </div>

            {/* Feature List */}
            <div className="sec-text grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2">
              {[
                { icon: <Activity className="w-5 h-5 text-blue-400" />, title: "24/7 Fraud Monitoring" },
                { icon: <Fingerprint className="w-5 h-5 text-indigo-400" />, title: "Biometric Authentication" },
                { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: "Proactive Defense" },
                { icon: <Eye className="w-5 h-5 text-cyan-400" />, title: "Dynamic CVV Codes" },
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  {feat.icon}
                  <span className="text-sm font-semibold text-slate-300">{feat.title}</span>
                </div>
              ))}
            </div>

            <Link href={'/signin'} className="sec-text mt-4 h-14 rounded-full bg-white text-black px-8 font-bold text-base hover:bg-blue-50 active:scale-[0.98] transition-all duration-300 inline-flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] group">
              Explore security
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* --- RIGHT: VISUAL CORE --- */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end" ref={visualRef}>
            
            <div className="w-full max-w-[500px] aspect-square md:aspect-[4/3] bg-[#0a0a0c] rounded-[3rem] border border-white/10 overflow-hidden relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] flex items-center justify-center">
              
              {/* Background Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
              
              {/* Central Glow */}
              <div className="absolute w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full" />

              {/* Rotating Ring 1 (Dashed) */}
              <div 
                ref={ring1Ref}
                className="absolute w-[80%] h-[80%] max-w-[400px] max-h-[400px] rounded-full border-[2px] border-blue-500/20 border-dashed"
              />
              
              {/* Rotating Ring 2 (Dotted) */}
              <div 
                ref={ring2Ref}
                className="absolute w-[60%] h-[60%] max-w-[300px] max-h-[300px] rounded-full border-[1px] border-indigo-400/30"
                style={{ borderStyle: 'dotted' }}
              />

              {/* Floating Shield Core */}
              <div 
                ref={shieldRef}
                className="relative z-10 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-blue-400/30 shadow-[0_0_50px_rgba(59,130,246,0.4)]"
              >
                <div className="w-[85%] h-[85%] bg-[#0a0a0c]/80 rounded-full flex items-center justify-center border border-indigo-500/20">
                  <Shield className="w-12 h-12 md:w-16 md:h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                </div>
              </div>

              {/* Laser Scanner Effect */}
              <div 
                ref={scannerRef}
                className="absolute top-0 left-0 w-full h-[4px] bg-blue-400 shadow-[0_0_20px_4px_rgba(59,130,246,0.5)] z-20"
              />
              {/* Scanner Gradient Trail */}
              <div 
                className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none z-10"
                style={{ transform: 'translateY(calc(var(--scanner-y, 0px) - 150px))' }} // Note: In a pure GSAP setup, the trail usually requires a timeline tie, but this static representation works well visually with the line.
              />

              {/* Floating Event Pills */}
              <div className="sec-pill-1 absolute top-8 left-8 md:left-12 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 z-30 shadow-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Login Secured</span>
              </div>

              <div className="sec-pill-2 absolute bottom-12 right-8 md:right-12 bg-rose-500/10 border border-rose-500/30 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 z-30 shadow-lg">
                <Lock className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">Suspicious IP Blocked</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}