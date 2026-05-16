"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, Command } from "lucide-react";

const LINKS = [
  { label: "Personal", href: "#personal" },
  { label: "Business", href: "#business" },
  { label: "Company", href: "#company" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for spotlight effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!navRef.current || !spotlightRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(59,130,246,0.15), transparent 60%)`;
  }, []);

  // Scroll listener with throttling feel via CSS transition
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* --- DESKTOP & MOBILE FLOATING NAV --- */}
      <header
        ref={navRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (spotlightRef.current) spotlightRef.current.style.background = "transparent";
        }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] 
          transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${scrolled && !mobileOpen
            ? "w-[92%] md:w-[85%] max-w-4xl bg-slate-950/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] border-white/[0.08] backdrop-blur-2xl"
            : "w-[96%] md:w-[95%] max-w-6xl bg-slate-950/40 border-white/[0.04] backdrop-blur-xl"
          } border rounded-[2rem] overflow-hidden`}
      >
        {/* Spotlight overlay */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none transition-all duration-300"
        />

        <div className="relative flex items-center justify-between px-2 py-2">

          {/* Logo */}
          <Link
            href="/"
            className="relative z-10 flex items-center gap-3 pl-4 pr-3 group"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-blue-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500">
                <span className="text-black font-black text-sm tracking-tighter">R</span>
              </div>
            </div>
            <span className="text-white font-bold text-lg tracking-tight hidden sm:block group-hover:text-blue-100 transition-colors">
              Revolut
            </span>
          </Link>

          {/* Desktop Links with Inner Pill & Magnetic Hover */}
          <nav className="hidden md:flex items-center gap-1 relative z-10 px-2 py-1.5 bg-white/[0.02] border border-white/[0.05] rounded-full">
            {LINKS.map((link) => (
              <MagneticLink key={link.label} href={link.href}>
                {link.label}
              </MagneticLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 relative z-10 pr-2">
            <Link href={'/signin'}>
              <button className="px-5 py-2.5 text-[14px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-full transition-all duration-300">
                Log in
              </button>
            </Link>

            <button className="group relative px-5 py-2.5 bg-white text-black text-[14px] font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95">
              <span className="relative z-10 flex items-center gap-2">
                Get the app
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative z-[110] p-3 mr-1 text-white rounded-full hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            <div className="w-5 h-5 relative flex flex-col justify-center items-center">
              <span className={`block w-5 h-[1.5px] bg-current transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? "rotate-45 translate-y-[0.5px]" : "-translate-y-1"}`} />
              <span className={`block w-5 h-[1.5px] bg-current transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"}`} />
              <span className={`block w-5 h-[1.5px] bg-current transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? "-rotate-45 -translate-y-[0.5px]" : "translate-y-1"}`} />
            </div>
          </button>
        </div>
      </header>

      {/* --- CINEMATIC MOBILE MENU --- */}
      <div className={`fixed inset-0 z-[90] md:hidden transition-all duration-700 ${mobileOpen ? "visible" : "invisible"}`}>
        {/* Backdrop with blur */}
        <div
          className={`absolute inset-0 bg-slate-950/95 backdrop-blur-3xl transition-opacity duration-700 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Ambient Orbs */}
        <div className={`absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-600/20 rounded-full blur-[120px] transition-all duration-1000 ${mobileOpen ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[100px] transition-all duration-1000 delay-100 ${mobileOpen ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />

        {/* Content */}
        <div className="relative h-full flex flex-col pt-28 px-8 pb-12">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between py-5 border-b border-white/[0.04] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                  ${mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: mobileOpen ? `${100 + i * 60}ms` : "0ms" }}
              >
                <span className="text-[clamp(2rem,8vw,3.5rem)] font-semibold text-white leading-none tracking-tight group-hover:text-blue-300 transition-colors duration-300">
                  {link.label}
                </span>
                <ArrowUpRight className="w-8 h-8 text-slate-600 group-hover:text-blue-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto space-y-4">
            {/* <div className={`flex items-center gap-3 text-slate-500 text-sm font-medium mb-6 transition-all duration-700 ${mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: mobileOpen ? "400ms" : "0ms" }}>
              <Command className="w-4 h-4" />
              <span>Press CMD+K to search</span>
            </div> */}

            <Link href={'/signup'} className={`w-full h-16 rounded-2xl bg-white text-black font-bold text-lg hover:bg-blue-50 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 shadow-[0_0_60px_-15px_rgba(255,255,255,0.3)] ${mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: mobileOpen ? "450ms" : "0ms" }}>
              Open Free Account <ArrowUpRight className="w-5 h-5" />
            </Link>

            <Link href={'/signin'} className={`w-full h-14 rounded-2xl bg-white/[0.03] text-white font-medium text-base border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/10 active:scale-[0.98] transition-all duration-500 ${mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: mobileOpen ? "500ms" : "0ms" }}>
              Sign In securely
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Magnetic Link Component ---
function MagneticLink({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * 0.15; // slightly reduced magnetic strength for stability
    const distY = (e.clientY - centerY) * 0.15;
    setPosition({ x: distX, y: distY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative px-5 py-2 text-[14px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-full transition-colors duration-300"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 && position.y === 0 ? "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
      }}
    >
      {children}
    </Link>
  );
}
