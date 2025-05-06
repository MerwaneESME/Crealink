import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { authService } from '@/services/authService';

// Types d'utilisateur
export type UserRole = 'admin' | 'creator' | 'expert' | 'pending' | 'influencer';

export interface User {
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
  verified: boolean;
  displayName?: string;
  photoURL?: string | null;
  phone?: string;
  address?: string;
  skills?: string;
  experience?: string;
  education?: string;
}

interface AuthContextType {
  user: User | null;
  register: (email: string, password: string, userData: any) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any, uid?: string) => Promise<void>;
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
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log('Firebase user:', firebaseUser);
          const userData = await authService.getUserData(firebaseUser.uid);
          console.log('User data from Firestore:', userData);
          if (userData) {
            let photoURL = firebaseUser.photoURL || userData.avatar || userData.photoURL;
            if (photoURL) {
              photoURL = photoURL.includes('?') 
                ? `${photoURL}&t=${Date.now()}` 
                : `${photoURL}?t=${Date.now()}`;
            }
            
            const userWithRole: User = {
              uid: userData.uid || firebaseUser.uid,
              email: userData.email || firebaseUser.email,
              name: userData.name || '',
              role: userData.role || 'pending',
              verified: userData.verified || false,
              createdAt: userData.createdAt || new Date().toISOString(),
              displayName: firebaseUser.displayName || userData.name,
              photoURL,
              bio: userData.bio,
              phone: userData.phone,
              address: userData.address,
              skills: userData.skills,
              experience: userData.experience,
              education: userData.education,
            };
            console.log('User with role:', userWithRole);
            setUser(userWithRole);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    register: authService.register,
    login: authService.login,
    logout: authService.signOut,
    updateUserProfile: async (data: any, uid?: string) => {
      const userId = uid || user?.uid;
      if (!userId) {
        throw new Error('Aucun utilisateur connecté');
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 