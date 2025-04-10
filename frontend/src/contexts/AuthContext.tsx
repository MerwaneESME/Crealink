import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { authService } from '@/services/authService';

// Types d'utilisateur
export type UserRole = 'admin' | 'creator' | 'expert';

export interface User {
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  register: (email: string, password: string, userData: any) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    register: authService.register,
    login: authService.login,
    logout: authService.logout,
    updateUserProfile: async (data: any) => {
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 