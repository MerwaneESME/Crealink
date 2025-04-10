import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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
  getDocs
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
const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    throw new Error(error.message || 'Une erreur est survenue lors de la récupération des données');
  }
};

// Fonction de connexion
const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Vérifier si l'utilisateur existe dans Firestore
    const userData = await getUserData(firebaseUser.uid);
    if (!userData) {
      await signOut(auth);
      throw new Error('Compte non trouvé dans la base de données');
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
};

export const authService = {
  // Inscription
  async register(email: string, password: string, userData: Omit<User, "uid">): Promise<User> {
    try {
      // Vérifier si l'email est déjà utilisé
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Créer le document utilisateur dans Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const newUser: User = {
        ...userData,
        uid: firebaseUser.uid,
        role: userData.role || 'pending',
        createdAt: new Date().toISOString(),
        verified: false,
        displayName: firebaseUser.displayName || userData.name,
        photoURL: firebaseUser.photoURL || userData.avatar || null,
      };

      // Filtrer les valeurs undefined avant de sauvegarder
      const cleanUser = Object.fromEntries(
        Object.entries(newUser).filter(([_, value]) => value !== undefined)
      ) as User;

      await setDoc(userRef, cleanUser);
      console.log('User registered with role:', newUser.role);

      return newUser;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error(error.message || 'Une erreur est survenue lors de l\'inscription');
    }
  },

  // Connexion
  login: loginUser,

  // Déconnexion
  async logout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      throw new Error(error.message || 'Une erreur est survenue lors de la déconnexion');
    }
  },

  // Obtenir les données de l'utilisateur
  getUserData,

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
        updatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw new Error(error.message || 'Une erreur est survenue lors de la mise à jour du profil');
    }
  }
}; 