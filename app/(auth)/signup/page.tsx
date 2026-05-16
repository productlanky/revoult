"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle, User, UploadCloud, CheckCircle2 } from "lucide-react";

// Firebase Imports
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export default function SignupForm() {
  const router = useRouter();
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Data State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // KYC State
  const [kycType, setKycType] = useState("Passport");
  const [kycFileFront, setKycFileFront] = useState<File | null>(null);
  const [kycFileBack, setKycFileBack] = useState<File | null>(null);
  
  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);

  const requiresBackSide = kycType !== "Passport";

  const handleKycTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKycType(e.target.value);
    setKycFileFront(null);
    setKycFileBack(null);
    setError("");
  };

  const handleFileChangeFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKycFileFront(e.target.files[0]);
      setError("");
    }
  };

  const handleFileChangeBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKycFileBack(e.target.files[0]);
      setError("");
    }
  };

  // Helper to upload a single file to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Document upload failed.");
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (!kycFileFront || (requiresBackSide && !kycFileBack)) {
      setError("Please upload all required sides of your identification document to proceed.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Upload KYC Documents to Cloudinary
      const frontUrl = await uploadToCloudinary(kycFileFront);
      let backUrl = null;
      if (requiresBackSide && kycFileBack) {
        backUrl = await uploadToCloudinary(kycFileBack);
      }

      // 2. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Create the User Profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        plan: "Standard", 
        kycStatus: "pending", 
        kycDocumentType: kycType,
        kycDocumentUrl: frontUrl,
        ...(backUrl && { kycDocumentBackUrl: backUrl }) // Only add backUrl if it exists
      });

      // 4. Auto-generate their first default USD Wallet
      const randomCardEnd = Math.floor(1000 + Math.random() * 9000).toString();
      
      await setDoc(doc(db, "users", user.uid, "wallets", "w_usd"), {
        currency: "USD",
        name: "US Dollar",
        symbol: "$",
        balance: 0.00,
        flag: "🇺🇸",
        cardNumber: randomCardEnd,
        theme: "from-slate-800 via-slate-900 to-[#050505] border-white/10",
        lightTheme: "from-slate-100 via-slate-200 to-slate-300 border-slate-300",
        glow: "rgba(255,255,255,0.05)",
        isPrimary: true,
      });

      // 5. Redirect to the Dashboard
      router.push("/dashboard");

    } catch (err: any) {
      console.error("Signup Error:", err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please sign in.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.message.includes("upload failed")) {
        setError("Failed to securely upload your ID. Check your connection and try again.");
      } else {
        setError("An error occurred during sign up. Please try again.");
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

        {/* --- NAME INPUTS --- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              First Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input 
                id="firstName"
                type="text" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Satoshi"
                className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-2xl pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all duration-300 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              Last Name
            </label>
            <div className="relative group">
              <input 
                id="lastName"
                type="text" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nakamoto"
                className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-2xl px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.04] transition-all duration-300 shadow-inner"
              />
            </div>
          </div>
        </div>

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

        {/* --- KYC VERIFICATION SECTION --- */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 shadow-inner space-y-4">
          <div>
            <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest pl-1 block mb-2">
              Identity Verification (KYC)
            </label>
            <p className="text-xs text-slate-400 pl-1 mb-3">Federal regulations require a valid government ID to open an account.</p>
            
            <select 
              value={kycType} 
              onChange={handleKycTypeChange}
              className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl px-4 text-white outline-none cursor-pointer text-sm font-medium focus:border-cyan-500/50 transition-colors appearance-none"
            >
              <option value="Passport" className="bg-slate-900 text-white">Passport</option>
              <option value="Driver's License" className="bg-slate-900 text-white">Driver's License</option>
              <option value="National ID" className="bg-slate-900 text-white">National ID Card</option>
            </select>
          </div>

          <div className={`grid gap-4 ${requiresBackSide ? 'grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* FRONT UPLOAD */}
            <div className="relative">
              <input type="file" accept="image/*" className="hidden" ref={fileInputFrontRef} onChange={handleFileChangeFront} />
              <button
                type="button"
                onClick={() => fileInputFrontRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all h-32 ${
                  kycFileFront ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/20 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/5'
                }`}
              >
                {kycFileFront ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-emerald-400 text-center truncate w-full px-2">{kycFileFront.name}</span>
                    <span className="text-[9px] text-emerald-500/80 mt-1 uppercase tracking-widest">Front ready</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs font-medium text-slate-300">{requiresBackSide ? 'Upload Front' : `Upload ${kycType}`}</span>
                  </>
                )}
              </button>
            </div>

            {/* BACK UPLOAD (Conditional) */}
            {requiresBackSide && (
              <div className="relative">
                <input type="file" accept="image/*" className="hidden" ref={fileInputBackRef} onChange={handleFileChangeBack} />
                <button
                  type="button"
                  onClick={() => fileInputBackRef.current?.click()}
                  className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all h-32 ${
                    kycFileBack ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/20 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/5'
                  }`}
                >
                  {kycFileBack ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                      <span className="text-xs font-bold text-emerald-400 text-center truncate w-full px-2">{kycFileBack.name}</span>
                      <span className="text-[9px] text-emerald-500/80 mt-1 uppercase tracking-widest">Back ready</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                      <span className="text-xs font-medium text-slate-300">Upload Back</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- PASSWORD INPUT --- */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Create Password
          </label>
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
          <p className="text-[10px] text-slate-500 pl-1">Must be at least 6 characters long.</p>
        </div>

        {/* --- SUBMIT BUTTON --- */}
        <button 
          type="submit"
          disabled={isLoading || !email || !password || !firstName || !lastName || !kycFileFront || (requiresBackSide && !kycFileBack)}
          className="w-full h-14 mt-4 rounded-full bg-cyan-500 text-black font-black text-base hover:bg-cyan-400 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_30px_-10px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <span>Securing Account...</span>
            </div>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* --- TERMS & CONDITIONS --- */}
        <p className="text-center text-[10px] text-slate-500 mt-4 px-4 leading-relaxed">
          By clicking "Create Account", you agree to our{" "}
          <Link href="#" className="text-slate-400 hover:text-white underline underline-offset-2">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="text-slate-400 hover:text-white underline underline-offset-2">Privacy Policy</Link>.
        </p>

        {/* --- BOTTOM LINK --- */}
        <div className="relative flex items-center justify-center mt-8 pt-6 border-t border-white/[0.08]">
          <p className="text-center text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link href="/signin" className="text-white font-semibold hover:text-cyan-400 transition-colors">
              Sign In
            </Link>
          </p>
        </div>

      </form>
    </>
  );
}