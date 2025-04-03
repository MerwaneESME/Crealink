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
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        console.log('Connecté avec succès');
      });
  }

  async function register(email: string, password: string, userData: any) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        // Créer un profil utilisateur dans Firestore
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          email,
          ...userData,
          createdAt: new Date(),
        });
        console.log('Utilisateur créé avec succès');
      });
  }

  async function logout() {
    return signOut(auth);
  }

  async function updateUserProfile(data: any) {
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date(),
    });
  }

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 