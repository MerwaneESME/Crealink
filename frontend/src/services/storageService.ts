import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const storageService = {
  async uploadProfilePhoto(file: File, userId: string): Promise<string> {
    try {
      const storageRef = ref(storage, `profile-photos/${userId}`);
      
      // Supprimer l'ancienne photo si elle existe
      try {
        await deleteObject(storageRef);
      } catch (error) {
        // Ignorer l'erreur si le fichier n'existe pas
      }

      // Uploader la nouvelle photo
      await uploadBytes(storageRef, file);
      
      // Obtenir l'URL de téléchargement
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de la photo:', error);
      throw new Error(error.message || 'Une erreur est survenue lors du téléchargement de la photo');
    }
  },

  async deleteProfilePhoto(userId: string): Promise<void> {
    try {
      const storageRef = ref(storage, `profile-photos/${userId}`);
      await deleteObject(storageRef);
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la photo:', error);
      throw new Error(error.message || 'Une erreur est survenue lors de la suppression de la photo');
    }
  }
}; 