"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  // 1. Listen for Auth State & Real-time User Profile
  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Use onSnapshot for REAL-TIME updates
        const docRef = doc(db, "users", firebaseUser.uid);
        unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false); // Only stop loading once we have the data
        });
        
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    // Cleanup listeners when component unmounts
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // 2. Air Traffic Control (Routing Logic)
  useEffect(() => {
    if (loading) return; 

    if (user && userData) {
      const isSuspended = userData.status === "suspended";
      const isAdmin = userData.role === "admin";

      // ENFORCE SUSPENSION FIRST
      if (isSuspended) {
        if (pathname !== "/suspended") {
          router.replace("/suspended");
        }
        return; // Halt further routing checks if suspended
      }

      // If user is NOT suspended but somehow on the suspended page, kick them back
      if (!isSuspended && pathname === "/suspended") {
        router.replace(isAdmin ? "/manbase" : "/dashboard");
        return;
      }

      // Normal Authentication Routing
      if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
        router.push(isAdmin ? "/manbase" : "/dashboard");
      }
      else if (pathname.startsWith("/manbase") && !isAdmin) {
        router.push("/dashboard");
      }
    } else if (!user) {
      // Unauthenticated Routing
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/manbase") || pathname === "/suspended") {
        router.push("/signin");
      }
    }
  }, [user, userData, loading, pathname, router]);

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/manbase") || pathname === "/suspended";
  
  if (loading && isProtectedRoute) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#030303] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);