"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added for routing
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";


export default function LoginForm() {
  const router = useRouter();
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Data State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any previous errors

    try {
      // 1. Attempt to sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. On success, redirect to the overview dashboard
      router.push("/dashboard"); 
      
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code);
      
      // 3. Handle specific Firebase errors gracefully
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
        
        {/* --- ERROR MESSAGE DISPLAY --- */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <Link href="/forgot-password" className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          disabled={isLoading || !email || !password}
          className="w-full h-14 mt-4 rounded-full bg-white text-black font-bold text-base hover:bg-slate-200 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_30px_-10px_rgba(255,255,255,0.4)] disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
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