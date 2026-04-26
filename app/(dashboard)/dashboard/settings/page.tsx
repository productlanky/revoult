"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
    User, Mail, Smartphone, Globe, Moon, Sun,
    Shield, Key, Fingerprint, Laptop, Bell,
    MessageSquare, EyeOff, FileDown, LifeBuoy,
    FileText, LogOut, AlertTriangle, ChevronRight,
    CheckCircle2, CreditCard, Activity
} from "lucide-react";

export default function SettingsPage() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Hydration fix for next-themes
    useEffect(() => setMounted(true), []);

    // Comprehensive mock states for every setting
    const [twoFactor, setTwoFactor] = useState(true);
    const [biometrics, setBiometrics] = useState(false);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [dataSharing, setDataSharing] = useState(false);
    const [publicProfile, setPublicProfile] = useState(true);

    const isDark = mounted ? resolvedTheme === "dark" : true;

    if (!mounted) return null; // Prevent flash during hydration

    return (
        <div className="w-full max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">

            {/* --- HEADER --- */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings & Privacy</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your app preferences, security, and data privacy.</p>
            </div>

            <div className="space-y-6">

                {/* 1. QUICK PROFILE SNIPPET (Native App Style) */}
                <Link
                    href="/dashboard/profile"
                    className="block bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.08] rounded-[24px] p-4 sm:p-5 shadow-sm dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.8)] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">

                            {/* Sleek Titanium Avatar (No loud gradients) */}
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#2a2a32] dark:to-[#121215] border border-slate-300 dark:border-white/10 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                                <span className="font-bold text-lg text-slate-800 dark:text-white tracking-wider">SN</span>
                            </div>

                            {/* Stacked Info */}
                            <div className="flex flex-col justify-center">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Satoshi Nakamoto</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-1.5">satoshi@example.com</p>

                                {/* Clean KYC Badge */}
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">KYC Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Native iOS style Chevron instead of a bulky button */}
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
                        onToggle={() => setTheme(isDark ? "light" : "dark")}
                    />
                    <NavigationRow icon={Globe} title="Language" value="English (US)" />
                    <NavigationRow icon={CreditCard} title="Primary Currency" value="USD ($)" />
                    <NavigationRow icon={Activity} title="Timezone" value="Eastern Time (EST)" border={false} />
                </SettingsCard>

                {/* 3. SECURITY & AUTHENTICATION */}
                <SettingsCard title="Security & Authentication" icon={Shield}>
                    <NavigationRow icon={Key} title="Change Password" description="Last changed 3 months ago" />
                    <ToggleRow
                        icon={Smartphone}
                        title="Two-Factor Authentication (2FA)"
                        description="Requires an authenticator app code to log in."
                        isOn={twoFactor}
                        onToggle={() => setTwoFactor(!twoFactor)}
                    />
                    <ToggleRow
                        icon={Fingerprint}
                        title="Biometric Login"
                        description="Use Face ID or Touch ID on supported devices."
                        isOn={biometrics}
                        onToggle={() => setBiometrics(!biometrics)}
                    />
                    <NavigationRow icon={Laptop} title="Active Sessions" description="Manage devices currently logged in" border={false} />
                </SettingsCard>

                {/* 4. NOTIFICATIONS */}
                <SettingsCard title="Notifications" icon={Bell}>
                    <ToggleRow
                        icon={Bell}
                        title="Push Notifications"
                        description="Instant alerts for transfers and account activity."
                        isOn={pushNotifs}
                        onToggle={() => setPushNotifs(!pushNotifs)}
                    />
                    <ToggleRow
                        icon={Mail}
                        title="Email Notifications"
                        description="Receive daily summaries and statement alerts."
                        isOn={emailNotifs}
                        onToggle={() => setEmailNotifs(!emailNotifs)}
                    />
                    <ToggleRow
                        icon={MessageSquare}
                        title="Marketing & Promos"
                        description="Receive offers and product updates."
                        isOn={marketingEmails}
                        onToggle={() => setMarketingEmails(!marketingEmails)}
                        border={false}
                    />
                </SettingsCard>

                {/* 5. PRIVACY & DATA */}
                <SettingsCard title="Privacy & Data" icon={EyeOff}>
                    <ToggleRow
                        icon={User}
                        title="Public Profile Visibility"
                        description="Allow other users to find you by your @handle."
                        isOn={publicProfile}
                        onToggle={() => setPublicProfile(!publicProfile)}
                    />
                    <ToggleRow
                        icon={Activity}
                        title="Share Analytics Data"
                        description="Help us improve by sharing anonymous usage data."
                        isOn={dataSharing}
                        onToggle={() => setDataSharing(!dataSharing)}
                    />
                    <NavigationRow icon={FileDown} title="Download My Data" description="Request a ZIP file of all your account data." border={false} />
                </SettingsCard>

                {/* 6. SUPPORT & LEGAL */}
                <SettingsCard title="Support & Legal" icon={LifeBuoy}>
                    <NavigationRow icon={LifeBuoy} title="Help Center & FAQ" />
                    <NavigationRow icon={MessageSquare} title="Contact Support" />
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
                        <button className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-rose-100/50 dark:hover:bg-rose-500/10 transition-colors group">
                            <div className="flex items-center gap-4">
                                <LogOut className="w-5 h-5 text-rose-600 dark:text-rose-500 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors" />
                                <div className="text-left">
                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Log Out of all devices</p>
                                    <p className="text-xs text-rose-600/70 dark:text-rose-500/70 mt-0.5">You will be required to log in again everywhere.</p>
                                </div>
                            </div>
                        </button>

                        <button className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-rose-100/50 dark:hover:bg-rose-500/10 transition-colors group">
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

                {/* App Version Footer */}
                <div className="pt-6 pb-4 text-center">
                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500">Revolut App v4.2.0 (Build 9021)</p>
                </div>

            </div>
        </div>
    );
}

// --- REUSABLE MICRO-COMPONENTS ---

/**
 * Wrapper for categorized settings blocks (Bento Cards)
 */
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

/**
 * A row for binary settings (Toggles)
 */
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
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none ${isOn ? 'bg-cyan-500 dark:bg-cyan-500' : 'bg-slate-200 dark:bg-white/10'
                    }`}
            >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ease-out ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

/**
 * A row for navigable links or displaying values (with Chevrons)
 */
function NavigationRow({ icon: Icon, title, description, value, border = true }: { icon: any; title: string; description?: string; value?: string; border?: boolean }) {
    return (
        <button className={`w-full flex items-center justify-between p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group ${border ? 'border-b border-slate-100 dark:border-white/[0.04]' : ''}`}>
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