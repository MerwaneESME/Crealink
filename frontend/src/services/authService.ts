import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../contexts/AuthContext';

export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  role: "creator" | "expert" | "pending";
  name: string;
  phone?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  interests?: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

// Fonctions utilitaires
async function getUserData(uid: string): Promise<User | null> {
  try {
    console.log('Fetching user data for uid:', uid);
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      console.log('User data retrieved:', userData);
      return userData;
    }
    
    console.log('No user data found for uid:', uid);
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// Fonction de connexion
async function loginUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('User logged in:', firebaseUser);
    
    const userData = await getUserData(firebaseUser.uid);
    console.log('User data after login:', userData);
    
    if (!userData) {
      throw new Error('Données utilisateur non trouvées');
    }

    return {
      ...userData,
      displayName: firebaseUser.displayName || userData.name,
      photoURL: firebaseUser.photoURL || userData.avatar,
    };
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    throw new Error(error.message || 'Une erreur est survenue lors de la connexion');
  }
}

export const authService = {
  // Créer un nouvel utilisateur
  async register(email: string, password: string, userData: Partial<User>): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Créer le document utilisateur dans Firestore
      const userDoc: User = {
        uid: user.uid,
        email: user.email || '',
        name: userData.name || '',
        role: userData.role || 'creator',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      return userDoc;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  // Se connecter
  async login(email: string, password: string): Promise<User> {
    try {
      // Vérifier d'abord si l'utilisateur existe
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        throw new Error('Aucun compte trouvé avec cet email');
      }

      // Tenter la connexion
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase user:', user);

      // Récupérer les données utilisateur depuis Firestore
      const userData = await getUserData(user.uid);
      console.log('User data from Firestore:', userData);

      if (!userData) {
        // Créer un document utilisateur par défaut si nécessaire
        const defaultUserData: Partial<User> = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          role: 'creator',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', user.uid), defaultUserData);
        return defaultUserData as User;
      }

      return {
        ...userData,
        displayName: user.displayName || userData.name,
        photoURL: user.photoURL || userData.avatar
      };
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Email ou mot de passe incorrect');
      }
      throw new Error(error.message || 'Une erreur est survenue lors de la connexion');
    }
  },

  // Se déconnecter
  async signOut(): Promise<void> {
    try {
      // Désactiver temporairement le réseau Firestore avant la déconnexion
      // await disableNetwork(db); // Commenté car cause des problèmes
      await firebaseSignOut(auth);
      // Réactiver le réseau après la déconnexion
      // await enableNetwork(db); // Commenté car pas nécessaire si on ne désactive pas
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Récupérer les données utilisateur
  async getUserData(uid: string): Promise<Partial<User>> {
    try {
      console.log('Fetching user data for uid:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        return userDoc.data() as User;
      } else {
        // Si le document n'existe pas, créer un document utilisateur par défaut
        const defaultUserData: Partial<User> = {
          uid,
          role: 'creator',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'users', uid), defaultUserData);
        return defaultUserData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Mise à jour du profil utilisateur
  async updateUserProfile(uid: string, userData: Partial<User>) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }
}; 