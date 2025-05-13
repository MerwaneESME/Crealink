import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const profileService = {
  async forceUpdateProfile(userId: string, profileData: any) {
    try {
      console.log("Force update profile for user:", userId);
      console.log("With data:", profileData);
      
      // Récupérer d'abord les données actuelles
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("Profil utilisateur introuvable");
      }
      
      // Fusionner les données actuelles avec les nouvelles données
      const existingData = userDoc.data();
      const updatedData = {
        ...existingData,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      // Mettre à jour le document
      await updateDoc(userRef, updatedData);
      
      console.log("Profil mis à jour avec succès!");
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour forcée du profil:", error);
      throw error;
    }
  },
  
  async getFullProfile(userId: string) {
    try {
      console.log("Fetching full profile for user:", userId);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("Profil utilisateur introuvable");
      }
      
      return userDoc.data();
    } catch (error) {
      console.error("Erreur lors de la récupération du profil complet:", error);
      throw error;
    }
  }
}; 