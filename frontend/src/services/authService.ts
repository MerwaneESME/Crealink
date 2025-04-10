import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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

export const authService = {
  // Inscription
  async register(email: string, password: string, userData: Omit<UserData, "uid">) {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Créer le document utilisateur dans Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...userData,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });

      // Retourner l'utilisateur sans le reconnecter
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Connexion
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Obtenir les données de l'utilisateur
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Mise à jour du profil utilisateur
  async updateUserProfile(uid: string, userData: Partial<UserData>) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }
}; 