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
  showPhone: boolean;
  showEmail: boolean;
  rating: string;
  useDisplayNameOnly: any;
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
  avatar?: string;
  description?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
  displayName?: string;
  photoURL?: string | null;
  phone?: string;
  youtube?: string;
  twitch?: string;
  instagram?: string;
  publishingFrequency?: string;
  challenges?: string;
  previousCollaborations?: string;
  neededServices?: string;
  goals?: string;
  expertise?: string;
  experiences?: string[];
  skills?: string[] | string;
  education?: string;
  favoriteNetwork?: 'youtube' | 'twitch' | 'instagram' | null;
  linkedin?: string;
  twitter?: string;
}

interface AuthContextType {
  user: User | null;
  register: (email: string, password: string, userData: any) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any, uid?: string) => Promise<boolean>;
  loading: boolean;
  refreshUser: () => Promise<boolean | undefined>;
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

  const refreshUser = async () => {
    if (!user) return;
    try {
      console.log("Rafraîchissement des données utilisateur pour:", user.uid);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("Nouvelles données utilisateur:", userData);
        
        const updatedUser: User = {
          uid: userData.uid,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          verified: userData.verified || false,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          displayName: userData.displayName || userData.name,
          photoURL: userData.photoURL || userData.avatar,
          description: userData.description || userData.bio,
          bio: userData.bio,
          phone: userData.phone,
          youtube: userData.youtube,
          twitch: userData.twitch,
          instagram: userData.instagram,
          publishingFrequency: userData.publishingFrequency,
          challenges: userData.challenges,
          previousCollaborations: userData.previousCollaborations,
          neededServices: userData.neededServices,
          goals: userData.goals,
          expertise: userData.expertise,
          experiences: userData.experiences,
          skills: userData.skills,
          education: userData.education,
          favoriteNetwork: userData.favoriteNetwork,
          linkedin: userData.linkedin,
          twitter: userData.twitter,
          showPhone: userData.showPhone || false,
          showEmail: userData.showEmail || false,
          rating: userData.rating || '',
          useDisplayNameOnly: userData.useDisplayNameOnly
        };
        
        console.log("Mise à jour de l'état utilisateur avec:", updatedUser);
        setUser(updatedUser);
        return true;
      } else {
        console.warn("Document utilisateur non trouvé lors du rafraîchissement");
        return false;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      return false;
    }
  };

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
              updatedAt: new Date().toISOString(),
              displayName: firebaseUser.displayName || userData.name,
              photoURL,
              description: userData.description || userData.bio,
              bio: userData.bio,
              phone: userData.phone,
              youtube: userData.youtube,
              twitch: userData.twitch,
              instagram: userData.instagram,
              publishingFrequency: userData.publishingFrequency,
              challenges: userData.challenges,
              previousCollaborations: userData.previousCollaborations,
              neededServices: userData.neededServices,
              goals: userData.goals,
              expertise: userData.expertise,
              experiences: userData.experiences,
              skills: userData.skills,
              education: userData.education,
              favoriteNetwork: userData.favoriteNetwork,
              linkedin: userData.linkedin,
              twitter: userData.twitter,
              showPhone: false,
              showEmail: false,
              rating: '',
              useDisplayNameOnly: undefined
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

      try {
        console.log("Mise à jour du profil avec les données:", data);
        
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        
        // Mettre à jour l'état utilisateur localement pour un effet immédiat
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            ...data,
          };
        });
        
        // Actualiser les données utilisateur depuis Firestore après la mise à jour
        setTimeout(async () => {
          await refreshUser();
        }, 500);
        
        return true;
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        throw error;
      }
    },
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 