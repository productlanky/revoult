"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User, Mail, Smartphone, Globe, Moon, Sun,
    Shield, Key, Fingerprint, Laptop, Bell,
    MessageSquare, EyeOff, FileDown, LifeBuoy,
    FileText, LogOut, AlertTriangle, ChevronRight,
    CheckCircle2, CreditCard, Activity, Loader2, Sparkles, X, Check,
    HelpCircle, Send,
    ChevronDown
} from "lucide-react";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase/config";
import { doc, updateDoc, deleteDoc, addDoc, collection } from "firebase/firestore";
import { signOut, deleteUser } from "firebase/auth";

type ModalType = "language" | "currency" | "password" | "download" | "delete" | "timezone" | "help" | "support" | null;

export default function SettingsPage() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const { user, userData, loading } = useAuth();

    // --- MODAL & INTERACTION STATES ---
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    
    // Support Ticket States
    const [ticketSubject, setTicketSubject] = useState("General Inquiry");
    const [ticketMessage, setTicketMessage] = useState("");

    // FAQ States
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    useEffect(() => setMounted(true), []);
    const isDark = mounted ? resolvedTheme === "dark" : true;

    // --- HELPER FUNCTIONS ---
    const getInitials = () => {
        if (!userData) return "??";
        return `${userData.firstName?.[0] || ""}${userData.lastName?.[0] || ""}`.toUpperCase();
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalSuccess(false);
        setDeleteConfirmText("");
        setTicketMessage("");
    };

    // --- FIREBASE HANDLERS ---
    const handleToggle = async (field: string, currentValue: boolean) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "users", user.uid), { [field]: !currentValue });
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
        }
    };

    const handleThemeToggle = async () => {
        const newTheme = isDark ? "light" : "dark";
        setTheme(newTheme);
        if (user) await updateDoc(doc(db, "users", user.uid), { themePreference: newTheme });
    };

    const handleValueUpdate = async (field: string, newValue: string) => {
        if (!user) return;
        setModalLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { [field]: newValue });
            setModalSuccess(true);
            setTimeout(() => closeModal(), 1000);
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSimulatedAction = async () => {
        setModalLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setModalLoading(false);
        setModalSuccess(true);
        setTimeout(() => closeModal(), 1500);
    };

    // CREATE SUPPORT TICKET
    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !ticketMessage.trim()) return;
        setModalLoading(true);

        try {
            await addDoc(collection(db, "users", user.uid, "tickets"), {
                subject: ticketSubject,
                message: ticketMessage,
                status: "open",
                createdAt: new Date().toISOString(),
                hasUnreadAdminReply: false
            });
            setModalSuccess(true);
            setTimeout(() => closeModal(), 2000);
        } catch (error) {
            console.error("Error submitting ticket:", error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/signin");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user || deleteConfirmText !== "DELETE") return;
        setModalLoading(true);
        try {
            await deleteDoc(doc(db, "users", user.uid));
            await deleteUser(user);
            router.push("/signup");
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Requires recent login to delete account. Please log out and back in.");
            setModalLoading(false);
        }
    };

    if (!mounted || loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    if (!userData) return null;

    const FAQS = [
        { q: "How long do global transfers take?", a: "Standard global transfers typically take 1-3 business days depending on the destination country and receiving bank." },
        { q: "How do I upgrade to a Metal plan?", a: "You can upgrade to Metal by tapping the crown icon in your sidebar and selecting 'Upgrade'." },
        { q: "What should I do if my card is lost?", a: "Immediately navigate to the Cards dashboard and click 'Freeze'. Then contact support to issue a replacement." },
        { q: "Are my funds insured?", a: "Yes, fiat balances are safeguarded by our partner banks and are protected under standard regulatory frameworks up to standard limits." }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto pb-12 animate-in fade-in duration-500 relative">

            {/* ==========================================
                FUNCTIONAL SETTINGS MODALS
                ========================================== */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">

                        <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
                            <X className="w-5 h-5" />
                        </button>

                        {/* 1. LANGUAGE MODAL */}
                        {activeModal === "language" && (
                            <div className="flex flex-col mt-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Select Language</h3>
                                <div className="space-y-2 overflow-y-auto">
                                    {[
                                        { code: 'en-US', label: 'English (US)' },
                                        { code: 'en-GB', label: 'English (UK)' },
                                        { code: 'es', label: 'Español' },
                                        { code: 'fr', label: 'Français' },
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleValueUpdate("language", lang.label)}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors border border-slate-200 dark:border-white/[0.04]"
                                        >
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{lang.label}</span>
                                            {(userData.language || "English (US)") === lang.label && <Check className="w-4 h-4 text-cyan-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. CURRENCY MODAL */}
                        {activeModal === "currency" && (
                            <div className="flex flex-col mt-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Primary Currency</h3>
                                <div className="space-y-2 overflow-y-auto">
                                    {[
                                        { code: 'USD', label: 'US Dollar ($)' },
                                        { code: 'EUR', label: 'Euro (€)' },
                                        { code: 'GBP', label: 'British Pound (£)' },
                                    ].map((curr) => (
                                        <button
                                            key={curr.code}
                                            onClick={() => handleValueUpdate("currency", curr.label)}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors border border-slate-200 dark:border-white/[0.04]"
                                        >
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{curr.label}</span>
                                            {(userData.currency || "US Dollar ($)") === curr.label && <Check className="w-4 h-4 text-cyan-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. CHANGE PASSWORD MODAL */}
                        {activeModal === "password" && (
                            <div className="flex flex-col mt-2 text-center items-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center mb-6">
                                    <Key className="w-8 h-8 text-slate-700 dark:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Update Password</h3>
                                <p className="text-sm text-slate-500 mb-6">Enter a new secure password for your account.</p>

                                <input type="password" placeholder="Current Password" className="w-full p-4 mb-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] focus:outline-none focus:border-cyan-500/50 text-sm text-slate-900 dark:text-white" />
                                <input type="password" placeholder="New Password" className="w-full p-4 mb-6 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] focus:outline-none focus:border-cyan-500/50 text-sm text-slate-900 dark:text-white" />

                                <button onClick={handleSimulatedAction} className="w-full py-4 rounded-full font-bold text-sm bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] transition-transform shadow-xl flex justify-center items-center">
                                    {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : modalSuccess ? "Password Updated" : "Save Changes"}
                                </button>
                            </div>
                        )}

                        {/* 4. DOWNLOAD DATA MODAL */}
                        {activeModal === "download" && (
                            <div className="flex flex-col mt-2 text-center items-center">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mb-6">
                                    <FileDown className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Download Data</h3>
                                <p className="text-sm text-slate-500 mb-8 px-2">Compile and download a ZIP file containing your transaction history, profile data, and settings.</p>

                                <button onClick={handleSimulatedAction} className="w-full py-4 rounded-full font-bold text-sm bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] flex justify-center items-center">
                                    {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : modalSuccess ? "Check your email" : "Request Data Archive"}
                                </button>
                            </div>
                        )}

                        {/* 5. DELETE ACCOUNT MODAL */}
                        {activeModal === "delete" && (
                            <div className="flex flex-col mt-2 text-center items-center">
                                <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Account?</h3>
                                <p className="text-sm text-rose-600/80 dark:text-rose-500/80 mb-6">This action cannot be undone. All funds, data, and settings will be permanently erased.</p>

                                <input
                                    type="text"
                                    placeholder="Type DELETE to confirm"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full p-4 mb-6 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-rose-200 dark:border-rose-500/20 focus:outline-none focus:border-rose-500 text-sm text-center font-mono font-bold text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:font-normal"
                                />

                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== "DELETE" || modalLoading}
                                    className="w-full py-4 rounded-full font-bold text-sm bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-[0_0_20px_rgba(225,29,72,0.3)] flex justify-center items-center disabled:opacity-50 disabled:shadow-none"
                                >
                                    {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Permanently Delete"}
                                </button>
                            </div>
                        )}

                        {/* 6. HELP CENTER / FAQ MODAL */}
                        {activeModal === "help" && (
                            <div className="flex flex-col mt-2 h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                                        <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Help Center</h3>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">Frequently Asked Questions</p>
                                    </div>
                                </div>

                                <div className="space-y-3 overflow-y-auto flex-1 pb-4 pr-1">
                                    {FAQS.map((faq, i) => (
                                        <div key={i} className="border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-white/[0.02] overflow-hidden transition-all">
                                            <button 
                                                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                            >
                                                <span className="text-sm font-bold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                                            </button>
                                            <div className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${expandedFaq === i ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-white/10 pt-3">
                                                    {faq.a}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setActiveModal("support")} className="mt-4 w-full py-4 rounded-xl font-bold text-sm bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] transition-transform shadow-xl">
                                    Still need help? Contact Support
                                </button>
                            </div>
                        )}

                        {/* 7. CONTACT SUPPORT MODAL */}
                        {activeModal === "support" && (
                            <div className="flex flex-col mt-2 h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shrink-0">
                                        <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Contact Support</h3>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">Submit a ticket to the admin team</p>
                                    </div>
                                </div>

                                {modalSuccess ? (
                                    <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in-95">
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ticket Submitted!</h4>
                                        <p className="text-sm text-slate-500">We will review your request and reply shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitTicket} className="flex flex-col flex-1">
                                        <div className="space-y-4 flex-1 overflow-y-auto pr-1 pb-4">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Category</label>
                                                <select 
                                                    value={ticketSubject}
                                                    onChange={(e) => setTicketSubject(e.target.value)}
                                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500/50 shadow-inner appearance-none"
                                                >
                                                    <option>General Inquiry</option>
                                                    <option>Transaction Dispute</option>
                                                    <option>Account Access</option>
                                                    <option>Card Replacement</option>
                                                    <option>Bug Report</option>
                                                </select>
                                            </div>
                                            <div className="flex-1 min-h-[150px]">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Message</label>
                                                <textarea
                                                    required
                                                    value={ticketMessage}
                                                    onChange={(e) => setTicketMessage(e.target.value)}
                                                    placeholder="Please describe your issue in detail..."
                                                    className="w-full h-full min-h-[150px] p-4 rounded-2xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-cyan-500/50 resize-none shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={modalLoading || !ticketMessage.trim()} 
                                            className="mt-2 w-full py-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                        >
                                            {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Ticket</>}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            )}


            {/* --- HEADER --- */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings & Privacy</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your app preferences, security, and data privacy.</p>
            </div>

            <div className="space-y-6">

                {/* 1. QUICK PROFILE SNIPPET */}
                <Link href="/dashboard/profile" className="block bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-4 sm:p-5 shadow-sm dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.8)] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2a2a32] dark:to-[#121215] border border-slate-300 dark:border-white/10 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                                <span className="font-bold text-lg text-slate-800 dark:text-white tracking-wider">{getInitials()}</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                    {userData.firstName} {userData.lastName}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-1.5">{userData.email}</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                        {userData.plan || "Standard"} Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-white/[0.06] transition-colors shrink-0">
                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </Link>

                {/* 2. GENERAL PREFERENCES */}
                <SettingsCard title="General Preferences" icon={Globe}>
                    <ToggleRow
                        icon={isDark ? Moon : Sun}
                        title="Dark Mode"
                        description="Toggle the stealth wealth aesthetic."
                        isOn={isDark}
                        onToggle={handleThemeToggle}
                    />
                    <NavigationRow
                        icon={Globe}
                        title="Language"
                        value={userData.language || "English (US)"}
                        onClick={() => setActiveModal("language")}
                    />
                    <NavigationRow
                        icon={CreditCard}
                        title="Primary Currency"
                        value={userData.currency || "US Dollar ($)"}
                        onClick={() => setActiveModal("currency")}
                    />
                    <NavigationRow
                        icon={Activity}
                        title="Timezone"
                        value={userData.timezone || "Eastern Time (EST)"}
                        border={false}
                        onClick={() => setActiveModal("timezone")}
                    />
                </SettingsCard>

                {/* 3. SECURITY & AUTHENTICATION */}
                <SettingsCard title="Security & Authentication" icon={Shield}>
                    <NavigationRow
                        icon={Key}
                        title="Change Password"
                        description="Manage your login credentials"
                        onClick={() => setActiveModal("password")}
                    />
                    <ToggleRow
                        icon={Smartphone}
                        title="Two-Factor Authentication (2FA)"
                        description="Requires an authenticator app code to log in."
                        isOn={userData.twoFactor ?? false}
                        onToggle={() => handleToggle("twoFactor", userData.twoFactor ?? false)}
                    />
                    <ToggleRow
                        icon={Fingerprint}
                        title="Biometric Login"
                        description="Use Face ID or Touch ID on supported devices."
                        isOn={userData.biometrics ?? false}
                        onToggle={() => handleToggle("biometrics", userData.biometrics ?? false)}
                    />
                    <NavigationRow
                        icon={Laptop}
                        title="Active Sessions"
                        description="Manage devices currently logged in"
                        border={false}
                    />
                </SettingsCard>

                {/* 4. NOTIFICATIONS */}
                <SettingsCard title="Notifications" icon={Bell}>
                    <ToggleRow
                        icon={Bell}
                        title="Push Notifications"
                        description="Instant alerts for transfers and account activity."
                        isOn={userData.pushNotifs ?? true}
                        onToggle={() => handleToggle("pushNotifs", userData.pushNotifs ?? true)}
                    />
                    <ToggleRow
                        icon={Mail}
                        title="Email Notifications"
                        description="Receive daily summaries and statement alerts."
                        isOn={userData.emailNotifs ?? true}
                        onToggle={() => handleToggle("emailNotifs", userData.emailNotifs ?? true)}
                    />
                    <ToggleRow
                        icon={MessageSquare}
                        title="Marketing & Promos"
                        description="Receive offers and product updates."
                        isOn={userData.marketingEmails ?? false}
                        onToggle={() => handleToggle("marketingEmails", userData.marketingEmails ?? false)}
                        border={false}
                    />
                </SettingsCard>

                {/* 5. PRIVACY & DATA */}
                <SettingsCard title="Privacy & Data" icon={EyeOff}>
                    <ToggleRow
                        icon={User}
                        title="Public Profile Visibility"
                        description="Allow other users to find you by your @handle."
                        isOn={userData.publicProfile ?? true}
                        onToggle={() => handleToggle("publicProfile", userData.publicProfile ?? true)}
                    />
                    <ToggleRow
                        icon={Activity}
                        title="Share Analytics Data"
                        description="Help us improve by sharing anonymous usage data."
                        isOn={userData.dataSharing ?? false}
                        onToggle={() => handleToggle("dataSharing", userData.dataSharing ?? false)}
                    />
                    <NavigationRow
                        icon={FileDown}
                        title="Download My Data"
                        description="Request a ZIP file of all your account data."
                        border={false}
                        onClick={() => setActiveModal("download")}
                    />
                </SettingsCard>

                {/* 6. SUPPORT & LEGAL (UPDATED WITH CLICK ACTIONS) */}
                <SettingsCard title="Support & Legal" icon={LifeBuoy}>
                    <NavigationRow icon={HelpCircle} title="Help Center & FAQ" onClick={() => setActiveModal("help")} />
                    <NavigationRow icon={MessageSquare} title="Contact Support" onClick={() => setActiveModal("support")} />
                    <NavigationRow icon={FileText} title="Terms of Service" />
                    <NavigationRow icon={Shield} title="Privacy Policy" border={false} />
                </SettingsCard>

                {/* 7. DANGER ZONE */}
                <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/10 rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden mt-8 transition-colors duration-500">
                    <div className="p-5 sm:p-6 border-b border-rose-100 dark:border-rose-500/10 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 tracking-wide">Danger Zone</h3>
                    </div>

                    <div className="divide-y divide-rose-100 dark:divide-rose-500/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-rose-100/50 dark:hover:bg-rose-500/10 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <LogOut className="w-5 h-5 text-rose-600 dark:text-rose-500 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors" />
                                <div className="text-left">
                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Log Out of all devices</p>
                                    <p className="text-xs text-rose-600/70 dark:text-rose-500/70 mt-0.5">You will be required to log in again everywhere.</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveModal("delete")}
                            className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-rose-100/50 dark:hover:bg-rose-500/10 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-500 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors" />
                                <div className="text-left">
                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Delete Account</p>
                                    <p className="text-xs text-rose-600/70 dark:text-rose-500/70 mt-0.5">Permanently erase your account and data.</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-rose-400 dark:text-rose-500/50 group-hover:text-rose-600 dark:group-hover:text-rose-400" />
                        </button>
                    </div>
                </div>

                <div className="pt-6 pb-4 text-center">
                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500">Revolut App v4.2.0 (Build 9021)</p>
                </div>

            </div>
        </div>
    );
}

// --- REUSABLE MICRO-COMPONENTS ---

function SettingsCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-500">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{title}</h3>
            </div>
            <div className="flex flex-col">
                {children}
            </div>
        </div>
    );
}

function ToggleRow({ icon: Icon, title, description, isOn, onToggle, border = true }: { icon: any; title: string; description?: string; isOn: boolean; onToggle: () => void; border?: boolean }) {
    return (
        <div className={`flex items-center justify-between p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${border ? 'border-b border-slate-100 dark:border-white/[0.04]' : ''}`}>
            <div className="flex items-center gap-4 pr-4">
                <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                <div className="text-left">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{title}</p>
                    {description && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>}
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none ${isOn ? 'bg-cyan-500 dark:bg-cyan-500' : 'bg-slate-200 dark:bg-white/10'}`}
            >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ease-out ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

function NavigationRow({ icon: Icon, title, description, value, border = true, onClick }: { icon: any; title: string; description?: string; value?: string; border?: boolean; onClick?: () => void; }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group ${border ? 'border-b border-slate-100 dark:border-white/[0.04]' : ''}`}
        >
            <div className="flex items-center gap-4 pr-4">
                <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
                <div className="text-left">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{title}</p>
                    {description && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>}
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                {value && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{value}</span>}
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
            </div>
        </button>
    );
}