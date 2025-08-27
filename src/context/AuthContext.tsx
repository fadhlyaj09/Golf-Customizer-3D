'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

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
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logIn = () => {
    setIsLoginDialogOpen(true);
  };
  
  const handleGoogleSignIn = async () => {
      try {
          await signInWithPopup(auth, googleProvider);
          setIsLoginDialogOpen(false);
      } catch (error) {
          console.error("Google Sign-In Error", error);
      }
  }

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  const value = { user, loading, logIn, logOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login atau Daftar</DialogTitle>
            <DialogDescription>
                Untuk melanjutkan, silakan login menggunakan akun Google Anda. Ini memungkinkan Anda untuk menyimpan alamat dan melihat riwayat pesanan.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
            <FcGoogle className="mr-2 h-5 w-5" />
            Lanjutkan dengan Google
          </Button>
        </DialogContent>
      </Dialog>
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
