"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ArrowUpRight, Zap, PieChart } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    title: "Your salary, reimagined.",
    desc: "Spend smartly, send quickly, sort your salary automatically, and watch your savings grow — all with a single bank account.",
    cta: "Move your salary",
    gradient: "from-indigo-600 via-purple-600 to-fuchsia-600",
    glowColor: "bg-fuchsia-500/10",
    icon: <ArrowUpRight className="w-5 h-5 text-fuchsia-400" />,
    mockupData: { label: "Salary arrival", amount: "+£3,200.00" }
  },
  {
    title: "Instant transfers.",
    desc: "Send money instantly to anyone, anywhere. Split bills, pay friends, and manage group expenses with a simple tap.",
    cta: "Try it out",
    gradient: "from-blue-600 via-cyan-500 to-teal-400",
    glowColor: "bg-cyan-500/10",
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    mockupData: { label: "Sent to Sarah", amount: "-£45.00" }
  },
  {
    title: "Smart budgeting.",
    desc: "Set budgets, track spending, and get deep insights into your financial habits with automatic categorization.",
    cta: "Explore budgets",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowColor: "bg-emerald-500/10",
    icon: <PieChart className="w-5 h-5 text-emerald-400" />,
    mockupData: { label: "Monthly budget", amount: "75% used" }
  }
];

export default function SalarySection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-24 lg:py-32 bg-[#030303]">

      {/* --- SECTION TRANSITION & GROUNDING --- */}
      {/* Subtle top border to separate from the Hero section */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Gentle gradient fade down from the top to create depth */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

      {/* Dynamic Ambient Glow matching the active slide */}
      <div
        className={`absolute top-1/2 right-0 md:right-[10%] -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ease-in-out ${slides[currentSlide].glowColor}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* --- LEFT SIDE: COPY (Col Span 5) --- */}
          <div className="lg:col-span-5 flex flex-col space-y-10 lg:pr-8">

            {/* Crossfading Text Container */}
            <div className="relative grid min-h-[200px] md:min-h-[220px] items-start">
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`col-start-1 row-start-1 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${idx === currentSlide
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-8 pointer-events-none"
                    }`}
                >
                  <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tighter text-white leading-[1.05] mb-6">
                    {slide.title}
                  </h2>
                  <p className="text-lg text-slate-400 font-light leading-relaxed max-w-md">
                    {slide.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Actions & Indicators */}
            <div className="space-y-10">
              {/* FIXED BUTTON: Clean, stable startup hover effect without text glitches */}
              <Link href={'/signin'} className="h-14 rounded-full bg-white text-black px-8 font-bold text-base hover:bg-slate-200 active:scale-[0.98] transition-all duration-300 inline-flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] group">
                {slides[currentSlide].cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Refined Carousel Indicators */}
              <div className="flex gap-3 items-center">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className="relative group h-6 flex items-center"
                  >
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${idx === currentSlide
                        ? 'w-12 bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                        : 'w-4 bg-white/20 group-hover:bg-white/40 group-hover:w-6'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: PHONE STAGE (Col Span 7) --- */}
          <div className="lg:col-span-7 relative flex justify-center items-center perspective-[1200px] h-[550px] sm:h-[650px] w-full mt-10 lg:mt-0">

            {/* Structural Stage Background (Creates a "zone" for the phone) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent border border-white/[0.05] rounded-[3rem] backdrop-blur-sm -z-10 transform-gpu hidden sm:block scale-95" />

            {/* Phone Hardware Frame */}
            <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] bg-[#050505] rounded-[3.5rem] border-[8px] border-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] overflow-hidden z-10 transform-gpu transition-transform duration-700 hover:rotate-y-[-4deg] hover:rotate-x-[2deg]">

              {/* Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50 border border-white/5 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-500/50 rounded-full blur-[1px] ml-14" />
              </div>

              {/* Screens Container */}
              <div className="relative w-full h-full bg-[#0a0a0a]">
                {slides.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${idx === currentSlide
                      ? 'opacity-100 translate-x-0 scale-100 z-20'
                      : idx < currentSlide
                        ? 'opacity-0 -translate-x-1/4 scale-95 z-0'
                        : 'opacity-0 translate-x-1/4 scale-95 z-0'
                      }`}
                  >
                    {/* Screen Backgrounds */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-[0.15]`} />
                    <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${slide.gradient} opacity-[0.2] blur-[80px]`} />

                    {/* UI Content inside the screen */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-6 pb-12">

                      {/* Floating App Widget */}
                      <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 mb-4 shadow-2xl transform translate-y-0 transition-transform duration-300">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${slide.gradient} p-[1px] mb-4`}>
                          <div className="w-full h-full bg-[#111111] rounded-full flex items-center justify-center">
                            {slide.icon}
                          </div>
                        </div>
                        <div className="space-y-1 mb-5">
                          <p className="text-sm font-medium text-white/50">{slide.mockupData.label}</p>
                          <p className="text-2xl font-bold text-white tracking-tight">{slide.mockupData.amount}</p>
                        </div>

                        {/* Fake Progress/UI Bar */}
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${slide.gradient}`}
                            style={{
                              width: idx === 0 ? '85%' : idx === 1 ? '100%' : '75%',
                              transition: 'width 1s cubic-bezier(0.22,1,0.36,1) 0.3s'
                            }}
                          />
                        </div>
                      </div>

                      {/* Fake Bottom Navigation */}
                      <div className="flex justify-between items-center px-4 mt-6">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center">
                            <div className={`w-5 h-5 rounded-md border-[2px] transition-colors ${i === idx ? 'border-white' : 'border-white/20'}`} />
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}