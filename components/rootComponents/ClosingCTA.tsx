"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Download } from "lucide-react";

export default function ClosingCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Reveal the CTA Card as it enters the viewport
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out", delay: 0.2 }
      );

      // 2. Stagger the content inside
      gsap.fromTo(
        ".cta-content",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 }
      );

      // 3. Subtle continuous breathing for the background glows
      gsap.to(".cta-glow", {
        scale: 1.1,
        opacity: 0.8,
        duration: 4,
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
      className="relative w-full bg-[#030303] py-24 md:py-32 overflow-hidden flex justify-center items-center px-4 sm:px-6"
    >
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      {/* --- THE MAGNETIC GLASS ISLAND --- */}
      <div 
        ref={cardRef}
        className="relative w-full max-w-5xl bg-[#0a0a0c] border border-white/[0.05] hover:border-white/10 transition-colors duration-500 rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 lg:p-24 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] z-10 text-center flex flex-col items-center"
      >
        
        {/* Internal Glowing Orbs (Animated) */}
        <div className="cta-glow absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="cta-glow absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" style={{ animationDelay: '-2s' }} />

        {/* Abstract SVG Pattern Overlay for Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        {/* --- CTA CONTENT --- */}
        <div className="relative z-20 flex flex-col items-center w-full">
          
          <div className="cta-content inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">The Future is Here</span>
          </div>

          <h2 className="cta-content text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[1.05] mb-6 max-w-3xl">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-400 to-slate-600">70+ million</span> using Revolut
          </h2>

          <p className="cta-content text-slate-400 text-base md:text-lg lg:text-xl font-light leading-relaxed max-w-xl mb-12">
            Open your premium account in under 3 minutes. Zero paperwork, global freedom, and powerful daily banking.
          </p>

          {/* Action Buttons */}
          <div className="cta-content flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-16 rounded-full bg-white text-black hover:bg-slate-200 text-base font-bold transition-all active:scale-[0.97] px-10 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 group">
              <Download className="w-5 h-5 mr-1" />
              Download the app
            </Button>
            
            <Button variant="outline" className="w-full sm:w-auto h-16 rounded-full text-white bg-white/[0.02] border-white/10 hover:bg-white/10 hover:border-white/20 text-base font-bold transition-all px-10 flex items-center justify-center gap-2 group">
              Explore features
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="cta-content text-xs text-slate-500 mt-8 font-medium tracking-wide">
            Available on iOS and Android. Terms and conditions apply.
          </p>

        </div>
      </div>
    </section>
  );
}