'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: () => void;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logIn = () => {
    // Redirect to the login page, optionally preserving the original destination
    const currentPath = window.location.pathname;
    const from = currentPath !== '/login' ? `?from=${currentPath}` : '';
    router.push(`/login${from}`);
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      // Redirect to home and reload to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  const value = { user, loading, logIn, logOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
