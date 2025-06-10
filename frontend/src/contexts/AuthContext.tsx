import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';

// Types d'utilisateur
export type UserRole = 'admin' | 'creator' | 'expert' | 'pending' | 'influencer';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  originalDisplayName?: string;
  photoURL: string | null;
  role?: 'expert' | 'creator' | 'pending';
  onboardingStep?: 'name_confirmation' | 'role_selection' | 'profile_completion';
  description?: string;
  bio?: string;
  phone?: string;
  youtube?: string;
  instagram?: string;
  twitch?: string;
  tiktok?: string;
  skills?: string[];
  expertise?: {
    mainType: string;
    subType: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    value: string;
  };
  creator?: {
    mainType: string;
    subType: string;
    description: string;
    platforms: string[];
    audienceSize: string;
  };
  onboardingCompleted?: boolean;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
  error: string | null;
  signInWithGoogle: () => Promise<{ isNewUser: boolean; user: User }>;
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
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async (): Promise<void> => {
    if (!user) return;
    try {
      console.log("Rafraîchissement des données utilisateur pour:", user.uid);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("Données utilisateur brutes:", userData);
        
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
          skills: Array.isArray(userData.skills) ? userData.skills : [],
          education: userData.education,
          favoriteNetwork: userData.favoriteNetwork,
          linkedin: userData.linkedin,
          twitter: userData.twitter,
          showPhone: userData.showPhone || false,
          showEmail: userData.showEmail || false,
          rating: userData.rating || '',
          useDisplayNameOnly: userData.useDisplayNameOnly || false,
          firstName: userData.firstName,
          lastName: userData.lastName,
          tiktok: userData.tiktok,
          expertiseCreator: userData.expertiseCreator,
          creator: userData.creator,
          onboardingCompleted: userData.onboardingCompleted || false
        };
        
        console.log("Données utilisateur mises à jour:", updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
    }
  };

  const handleAuthStateChanged = async (firebaseUser: FirebaseUser | null) => {
    setLoading(true);
    try {
      if (firebaseUser) {
        // Récupérer les données utilisateur de Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          console.log("Données utilisateur chargées:", userData);
          console.log("Skills:", userData.skills);
          setUser(userData);
        } else {
          // Si l'utilisateur n'existe pas dans Firestore, créer un document par défaut
          const defaultUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verified: false,
            showPhone: false,
            showEmail: true,
            rating: '0',
            useDisplayNameOnly: false,
            onboardingCompleted: false,
            skills: [] // Initialiser un tableau vide pour les compétences
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), defaultUser);
          setUser(defaultUser);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setError('Une erreur est survenue lors de la vérification de l\'authentification');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(handleAuthStateChanged);

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = result;
      
      // Vérifier si l'utilisateur existe déjà
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const isNewUser = !userDoc.exists();
      
      if (isNewUser) {
        // Créer un nouveau document utilisateur avec les données de Google
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ')[1] || '',
          originalDisplayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL,
          role: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          onboardingCompleted: false,
          onboardingStep: 'name_confirmation'
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        return { isNewUser, user: userData };
      }
      
      const userData = (await getDoc(doc(db, 'users', firebaseUser.uid))).data() as User;
      return { isNewUser, user: userData };
    } catch (error: any) {
      console.error("Erreur lors de la connexion avec Google:", error);
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    error,
    register: async (email: string, password: string, userData: Partial<User>) => {
      try {
        await authService.register(email, password, userData);
        await refreshUser();
      } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        setError('Erreur lors de la création de l\'utilisateur');
      }
    },
    login: async (email: string, password: string) => {
      try {
        await authService.login(email, password);
        await refreshUser();
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        setError('Erreur lors de la connexion');
      }
    },
    signInWithGoogle,
    logout: async () => {
      try {
        await firebaseSignOut(auth);
        notificationService.resetDisplayedNotifications();
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
      }
    },
    updateUserProfile: async (data: Partial<User>) => {
      const userId = user?.uid;
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