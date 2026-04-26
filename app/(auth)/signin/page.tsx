"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
// Reusing the inline SVG components for brands to avoid lucide-react missing icons 

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <>
      {/* THE AUTOFILL FIX: 
        This intercepts the browser's attempt to inject a solid background color 
        when the user uses saved passwords/emails.
      */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          transition: background-color 9999s ease-in-out 0s;
          -webkit-text-fill-color: #f8fafc !important;
          caret-color: white;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        
        {/* --- EMAIL INPUT --- */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input 
              id="email"
              type="email" 
              required
              placeholder="satoshi@example.com"
              className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-2xl pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all duration-300 shadow-inner"
            />
          </div>
        </div>

        {/* --- PASSWORD INPUT --- */}
        <div className="space-y-2">
          <div className="flex justify-between items-center pl-1 pr-1">
            <label htmlFor="password" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Password
            </label>
            <Link href="#" className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              FORGOT?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              required
              placeholder="••••••••••••"
              className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-2xl pl-11 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all duration-300 shadow-inner font-mono text-lg tracking-widest"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* --- SUBMIT BUTTON --- */}
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full h-14 mt-4 rounded-full bg-white text-black font-bold text-base hover:bg-slate-200 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_30px_-10px_rgba(255,255,255,0.4)] disabled:opacity-70 disabled:scale-100"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              Sign In securely
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* --- DIVIDER --- */}
        <div className="relative flex items-center justify-center mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]"></div>
          </div>
          <div className="relative bg-[#0a0a0c] px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Or continue with
          </div>
        </div>

        {/* --- SOCIAL LOGINS --- */}
        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="h-12 flex items-center justify-center gap-2 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 group">
            <GoogleIcon className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Google</span>
          </button>
          
          <button type="button" className="h-12 flex items-center justify-center gap-2 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 group">
            <AppleIcon className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity text-white" />
            <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Apple</span>
          </button>
        </div>

        {/* --- BOTTOM LINK --- */}
        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Don't have an account?{" "}
          <Link href="/signup" className="text-white font-semibold hover:text-cyan-400 transition-colors">
            Sign up
          </Link>
        </p>

      </form>
    </>
  );
}

// --- Inline SVG Icons for Socials ---
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.805 3.05 1.52-.075 2.105-.98 3.961-.98 1.855 0 2.37.98 3.961.942 1.634-.038 2.65-1.52 3.634-2.977 1.157-1.685 1.634-3.328 1.653-3.415-.038-.016-3.192-1.226-3.23-4.9-.038-3.087 2.527-4.567 2.641-4.644-1.444-2.115-3.69-2.39-4.507-2.446-1.956-.17-3.948 1.306-4.515 1.306zm2.247-2.883c.834-1.013 1.393-2.43 1.24-3.84-1.215.05-2.68.807-3.532 1.821-.758.855-1.424 2.296-1.253 3.692 1.365.105 2.71-.652 3.545-1.673z" />
    </svg>
  );
}