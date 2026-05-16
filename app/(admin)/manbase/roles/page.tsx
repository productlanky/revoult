"use client";

import { 
  ShieldCheck, Search, Loader2, Sparkles, 
  UserCog, Key, Lock, CheckCircle2, Shield, Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Firebase Imports
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";

// --- TYPESCRIPT INTERFACES ---
interface UserDoc {
  id: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
  [key: string]: any;
}

// --- SYSTEM ROLES CONFIGURATION ---
const SYSTEM_ROLES = [
  {
    id: "admin",
    name: "Super Admin",
    description: "Full access to all system features.",
    icon: Key,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
    badge: "bg-rose-500 text-white border-transparent"
  },
  {
    id: "compliance",
    name: "Compliance Officer",
    description: "Can view and approve KYC documents.",
    icon: Shield,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20",
    badge: "bg-indigo-500 text-white border-transparent"
  },
  {
    id: "support",
    name: "Support Agent",
    description: "Read-only access to profiles & logs.",
    icon: UserCog,
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
    badge: "bg-cyan-500 text-white border-transparent"
  },
  {
    id: "user",
    name: "Standard User",
    description: "Standard customer account.",
    icon: Users,
    color: "text-slate-500",
    bg: "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10",
    badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10"
  }
];

export default function RolesPermissionsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Auth & Data States
  const { user, loading: authLoading } = useAuth();
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  // --- FIREBASE DATA FETCHING ---
  useEffect(() => {
    if (!user) return;

    // Fetch ALL users (up to 500) so we can promote/demote anyone
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, orderBy("createdAt", "desc"), limit(500));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const allFetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDoc));
      setAllUsers(allFetched);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!mounted || authLoading || dataLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  // --- ACTIONS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Safety Lock: Prevent the admin from demoting themselves
    if (userId === user?.uid && newRole !== 'admin') {
      return showToast("Action Denied: You cannot downgrade your own Super Admin account.");
    }

    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      const roleName = SYSTEM_ROLES.find(r => r.id === newRole)?.name || "User";
      showToast(`User successfully updated to ${roleName}`);
    } catch (error) {
      showToast("Failed to update role. Check your database permissions.");
    } finally {
      setUpdatingId(null);
    }
  };

  // --- FILTERING ---
  const filteredUsers = allUsers.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-700 relative">
      
      {/* --- ELITE TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 dark:border-black/10 font-bold text-sm flex items-center gap-2 whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
          {toastMsg}
        </div>
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Access Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Assign roles and modify system permissions for any user.</p>
        </div>
      </div>

      {/* --- STAFF OVERVIEW CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {SYSTEM_ROLES.filter(r => r.id !== 'user').map((role) => (
          <div key={role.id} className={`bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[24px] p-6 shadow-sm dark:shadow-xl transition-all duration-300 relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border ${role.bg}`}>
                <role.icon className={`w-6 h-6 ${role.color}`} />
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {allUsers.filter(u => u.role === role.id).length}
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned</p>
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight mb-1">{role.name}</h4>
              <p className="text-[12px] font-medium text-slate-500 leading-relaxed">{role.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- ALL USERS DIRECTORY TABLE --- */}
      <div className="bg-white dark:bg-[#0A0A0C] border border-slate-200 dark:border-white/[0.04] rounded-[32px] shadow-sm dark:shadow-2xl overflow-hidden flex flex-col min-h-[400px]">
        
        {/* Controls Toolbar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user by name or email..." 
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none shadow-sm transition-all focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="p-5 font-bold">User</th>
                <th className="p-5 font-bold">Current Privilege</th>
                <th className="p-5 font-bold hidden md:table-cell">Joined Date</th>
                <th className="p-5 font-bold text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Lock className="w-10 h-10 text-slate-300 dark:text-white/10 mb-3" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">No users found.</p>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || "Pending Setup";
                  const initial = displayName.charAt(0).toUpperCase();
                  const currentRole = u.role || 'user';
                  const roleConfig = SYSTEM_ROLES.find(r => r.id === currentRole) || SYSTEM_ROLES[3];
                  const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown";
                  const isProcessing = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 border shadow-inner ${roleConfig.bg}`}>
                            <span className={roleConfig.color}>{initial}</span>
                          </div>
                          <div className="truncate">
                            <p className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-1.5">
                              {displayName}
                              {currentRole === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border ${roleConfig.badge}`}>
                          {roleConfig.name}
                        </span>
                      </td>

                      <td className="p-5 hidden md:table-cell text-[12px] font-medium text-slate-500 whitespace-nowrap">
                        {joinDate}
                      </td>

                      <td className="p-5 text-right relative">
                        <div className="flex items-center justify-end gap-3">
                          {isProcessing && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />}
                          <select
                            value={currentRole}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={isProcessing || (u.id === user?.uid)}
                            className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-cyan-500 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <option value="user">Standard User</option>
                            <option value="support">Support Agent</option>
                            <option value="compliance">Compliance Officer</option>
                            <option value="admin">Super Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between text-xs text-slate-500 font-medium">
          <p>Showing {filteredUsers.length} total users</p>
        </div>
      </div>

    </div>
  );
}