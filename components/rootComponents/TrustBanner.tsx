"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { 
  Smartphone, Star, Award, Users, Shield, Lock, 
  ShieldCheck, Fingerprint, Cpu, LockKeyhole 
} from "lucide-react";

export default function TrustBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Refs for the animated numbers
  const usersRef = useRef<HTMLSpanElement>(null);
  const volRef = useRef<HTMLSpanElement>(null);
  const uptimeRef = useRef<HTMLSpanElement>(null);

  // Intersection Observer to trigger animations only when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Entrance animation for headers
      tl.fromTo(
        ".trust-header",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );

      // 2. Animate the Metric Numbers
      const animateCounter = (ref: any, endValue: number, suffix: string, prefix: string = "") => {
        const target = { val: 0 };
        gsap.to(target, {
          val: endValue,
          duration: 2.5,
          ease: "expo.out",
          onUpdate: () => {
            if (ref.current) {
              let displayVal = target.val.toFixed(endValue % 1 === 0 ? 0 : 2);
              ref.current.innerText = `${prefix}${displayVal}${suffix}`;
            }
          },
        });
      };

      animateCounter(usersRef, 70, "M+");
      animateCounter(volRef, 12, "B+", "$");
      animateCounter(uptimeRef, 99.99, "%");

      // 3. Stagger Awards and Security Cards
      tl.fromTo(
        ".award-card",
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)" },
        "-=2"
      );

      tl.fromTo(
        ".security-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" },
        "-=1.5"
      );

    }, sectionRef);

    return () => ctx.revert();
  }, [isVisible]);

  const awards = [
    { icon: <Smartphone className="w-6 h-6 text-indigo-400" />, title: "#3 Most Downloaded", subtitle: "Finance App Globally" },
    { icon: <Star className="w-6 h-6 text-yellow-400" />, title: "4.7 out of 5", subtitle: "Based on 2M+ Reviews" },
    { icon: <Award className="w-6 h-6 text-fuchsia-400" />, title: "Best International", subtitle: "Payments Provider 2025" },
    { icon: <Users className="w-6 h-6 text-cyan-400" />, title: "Best Consumer Bank", subtitle: "Mobile App 2025" },
    { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: "Customer Satisfaction", subtitle: "Gold Standard Award" },
    { icon: <Lock className="w-6 h-6 text-rose-400" />, title: "Consumer Guardian", subtitle: "Security Badge 2025" },
  ];

  const partners = [
    {
      name: "Mastercard",
      logo: (
        <svg viewBox="0 0 100 60" className="h-8 md:h-10 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <circle cx="35" cy="30" r="20" fill="#EB001B" />
          <circle cx="65" cy="30" r="20" fill="#F79E1B" className="mix-blend-multiply" />
        </svg>
      ),
    },
    {
      name: "Visa",
      logo: (
        <svg viewBox="0 0 100 30" className="h-5 md:h-7 opacity-40 hover:opacity-100 transition-opacity duration-500 text-white fill-current">
          <path d="M38.3 0L31.7 20.3H26L21.3 4.8C20.8 2.5 20.4 1.7 18.7 1.1C14.4 -0.3 7 -0.5 1.5 0L1.7 3.3C4.5 3.6 8.3 4.3 10 5.4C11.3 6.3 11.6 7 12 8.5L18.8 29.8H25.8L45.4 0H38.3ZM65.8 8.4C63.6 7.4 60.8 6.5 58 6.5C51.6 6.5 47 10 47 15.6C47 19.6 50.8 21.8 53.6 23.2C56.6 24.6 57.6 25.5 57.6 26.8C57.6 28.8 55 29.7 52.4 29.7C48.8 29.7 46.8 28.7 44.5 27.6L43.4 27.1L42.2 34.6C44.7 35.8 48.7 36.6 52.8 36.6C59.7 36.6 64.3 33.2 64.3 27.2C64.3 20.4 54.4 20 54.4 16C54.4 14 56.4 12.9 58.7 12.9C61 12.9 63.3 13.5 65.1 14.4L65.8 8.4ZM84.7 36L90.8 0H84.8C83.2 0 82 0.8 81.4 2.3L69.8 36H76.7L78 32H86.5L87.3 36H84.7ZM79.8 26.8L83.2 16.7L85.2 26.8H79.8Z" />
        </svg>
      ),
    },
    {
      name: "Stripe",
      logo: (
        <svg viewBox="0 0 100 40" className="h-6 md:h-8 opacity-40 hover:opacity-100 transition-opacity duration-500 text-white fill-current">
          <path d="M43.7 18.2C43.7 12 38.8 8.2 32.5 8.2C26.1 8.2 21 12.6 21 19.3C21 26 26.2 30.5 32.8 30.5C37.5 30.5 41.6 28.5 43.6 25.4L37.8 21.8C36.6 23.5 34.8 24.3 32.8 24.3C29.6 24.3 28 22.3 27.6 19.8H43.6C43.7 19.3 43.7 18.8 43.7 18.2ZM27.7 14.6C28.2 12.4 30.2 11.2 32.5 11.2C34.6 11.2 36.3 12.2 36.8 14.6H27.7ZM62.8 8.8V1.2L55.8 2.8V30H62.8V18.6C62.8 13.5 66.8 12.3 69.8 12.7V6C66.8 5.8 64.2 6.8 62.8 8.8ZM82 8.2C75.8 8.2 71 12.6 71 19.3C71 26 75.8 30.5 82 30.5C88.2 30.5 93 26.1 93 19.3C93 12.5 88.2 8.2 82 8.2ZM82 24.4C79.4 24.4 77.8 22.1 77.8 19.3C77.8 16.5 79.4 14.3 82 14.3C84.6 14.3 86.2 16.5 86.2 19.3C86.2 22.1 84.6 24.4 82 24.4ZM11 11.3C8.6 10.3 6.6 9.8 5.2 9.8C3.5 9.8 2.8 10.5 2.8 11.5C2.8 13 4.5 13.5 7.2 14.3C10.7 15.3 13.8 16.8 13.8 21.5C13.8 27 9.2 30.3 2.5 30.3C-0.3 30.3 -2.8 29.5 -4.8 28.5L-2.2 23C0 24.2 2.2 24.8 3.8 24.8C5.8 24.8 6.5 24 6.5 23C6.5 21.6 4.6 21.2 2 20.3C-1.5 19.2 -4.3 17.7 -4.3 13.2C-4.3 7.8 0 4.5 6.2 4.5C8.8 4.5 10.8 5.2 12.8 6.2L11 11.3ZM108.5 8.8V-4L101.5 -2.4V30H108.5V18.6C108.5 13.5 112.5 12.3 115.5 12.7V6C112.5 5.8 109.9 6.8 108.5 8.8ZM138.8 8.8V1.2L131.8 2.8V30H138.8V18.6C138.8 13.5 142.8 12.3 145.8 12.7V6C142.8 5.8 140.2 6.8 138.8 8.8ZM164.8 8.2C158.6 8.2 153.8 12.6 153.8 19.3C153.8 26 158.6 30.5 164.8 30.5C171 30.5 175.8 26.1 175.8 19.3C175.8 12.5 171 8.2 164.8 8.2ZM164.8 24.4C162.2 24.4 160.6 22.1 160.6 19.3C160.6 16.5 162.2 14.3 164.8 14.3C167.4 14.3 169 16.5 169 19.3C169 22.1 167.4 24.4 164.8 24.4Z" />
        </svg>
      ),
    },
    {
      name: "ISO 27001",
      logo: (
        <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500 text-white border border-white/20 rounded-md px-4 py-1.5">
          <span className="font-mono text-xs md:text-sm tracking-widest font-bold">ISO 27001</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .marquee-container:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full bg-[#030303] py-24 md:py-32 overflow-hidden border-t border-white/[0.05]"
      >
        {/* Ambient Studio Lighting */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[40vh] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 flex flex-col items-center">
          
          {/* --- LAYER 1: HERO & METRICS --- */}
          <div className="flex flex-col items-center mb-16 md:mb-24 w-full">
            <p className="trust-header text-xs md:text-sm font-medium text-cyan-400 uppercase tracking-[0.25em] mb-4 text-center">
              Global Scale & Trust
            </p>
            <h2 className="trust-header text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white text-center mb-16 max-w-3xl">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">the world's</span> financial superapp.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full border-y border-white/[0.05] py-12 md:py-16">
              <div className="trust-header flex flex-col items-center text-center">
                <span className="text-6xl lg:text-7xl font-black tracking-tighter text-white mb-2" ref={usersRef}>0</span>
                <p className="text-slate-400 text-sm md:text-base font-medium tracking-widest uppercase">Global Customers</p>
              </div>
              <div className="trust-header flex flex-col items-center text-center md:border-x border-white/[0.05] px-4">
                <span className="text-6xl lg:text-7xl font-black tracking-tighter text-white mb-2" ref={volRef}>$0</span>
                <p className="text-slate-400 text-sm md:text-base font-medium tracking-widest uppercase">Processed Annually</p>
              </div>
              <div className="trust-header flex flex-col items-center text-center">
                <span className="text-6xl lg:text-7xl font-black tracking-tighter text-white mb-2" ref={uptimeRef}>0%</span>
                <p className="text-slate-400 text-sm md:text-base font-medium tracking-widest uppercase">Uptime Guaranteed</p>
              </div>
            </div>
          </div>

          {/* --- LAYER 2: REPUTATION (AWARDS GRID) --- */}
          <div className="w-full mb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {awards.map((award, idx) => (
                <div 
                  key={idx} 
                  className="award-card flex items-center gap-5 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    {award.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base md:text-lg tracking-tight mb-1">{award.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{award.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- LAYER 3: INFRASTRUCTURE PARTNERS MARQUEE --- */}
          <div className="w-full mb-24 flex flex-col items-center">
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-8 font-semibold">Secured by industry leaders</p>
            <div 
              className="marquee-container relative w-full flex overflow-hidden group"
              style={{
                maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              }}
            >
              <div className="animate-marquee flex w-max min-w-full shrink-0 items-center justify-around gap-16 md:gap-32 px-8">
                {partners.map((partner, index) => <div key={`set1-${index}`} className="flex items-center justify-center shrink-0">{partner.logo}</div>)}
                {partners.map((partner, index) => <div key={`set2-${index}`} className="flex items-center justify-center shrink-0">{partner.logo}</div>)}
                {partners.map((partner, index) => <div key={`set3-${index}`} className="flex items-center justify-center shrink-0">{partner.logo}</div>)}
              </div>
            </div>
          </div>

          {/* --- LAYER 4: SECURITY ARCHITECTURE --- */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="security-card bg-[#0a0a0c] border border-white/[0.05] rounded-[2rem] p-8 hover:border-white/[0.1] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors duration-500">
                <Fingerprint className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Biometric Encryption</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Your private keys are tied directly to your device's secure enclave. Transfers require physical biometric authentication to execute.
              </p>
            </div>

            <div className="security-card bg-[#0a0a0c] border border-white/[0.05] rounded-[2rem] p-8 hover:border-white/[0.1] transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors duration-500 relative z-10">
                <Cpu className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight relative z-10">AI Fraud Prevention</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium relative z-10">
                Our proprietary machine learning models analyze transaction behavior in milliseconds, blocking suspicious activity before it hits the ledger.
              </p>
            </div>

            <div className="security-card bg-[#0a0a0c] border border-white/[0.05] rounded-[2rem] p-8 hover:border-white/[0.1] transition-colors group">
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-500">
                <LockKeyhole className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">1:1 Cold Storage</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                We are not a lending bank. Every dollar you deposit is backed 1:1 and secured in institutional-grade cold storage. Your money is always yours.
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}