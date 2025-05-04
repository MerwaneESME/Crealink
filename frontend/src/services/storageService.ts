import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { auth } from '../config/firebase';

// Helper function to ensure authentication is ready
const ensureAuthenticated = async (): Promise<boolean> => {
  // Wait for auth state to be initialized
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};

export interface MediaFile {
  url: string;
  type: 'image' | 'video' | 'audio';
  name: string;
}

class StorageService {
  async uploadFile(file: File, path: string): Promise<MediaFile> {
    try {
      // Vérification de base
      if (!file) {
        throw new Error('Aucun fichier fourni');
      }

      // Déterminer le type de média
      let mediaType: 'image' | 'video' | 'audio';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      } else {
        throw new Error('Type de fichier non supporté. Seuls les images, vidéos et audios sont acceptés');
      }

      // Vérification de la taille
      const maxSize = mediaType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB pour vidéos, 10MB pour autres
      if (file.size > maxSize) {
        throw new Error(`Le fichier est trop volumineux (max ${maxSize/1024/1024}MB pour les fichiers ${mediaType})`);
      }

      // Construction du chemin
      const userId = auth.currentUser?.uid || 'anonymous';
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const fullPath = `${path}/${fileName}`;

      console.log('Tentative d\'upload avec les paramètres:', {
        path: fullPath,
        size: file.size,
        type: file.type,
        mediaType,
        userId,
        bucket: storage.app.options.storageBucket
      });

      // Création de la référence
      const storageRef = ref(storage, fullPath);

      // Préparation des métadonnées
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          uploadDate: new Date().toISOString(),
          mediaType
        }
      };

      // Upload avec métadonnées
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('Upload réussi:', {
        path: snapshot.ref.fullPath,
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType,
        customMetadata: snapshot.metadata.customMetadata
      });

      // Récupération de l'URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL obtenue:', downloadURL);

      return {
        name: file.name,
        url: downloadURL,
        type: mediaType
      };

    } catch (error: any) {
      console.error('Erreur d\'upload:', {
        code: error.code,
        message: error.message,
        details: error.details,
        serverResponse: error.serverResponse,
        bucket: storage.app.options.storageBucket
      });

      // Gestion spécifique des erreurs
      if (error.code === 'storage/unauthorized') {
        throw new Error('Vous n\'êtes pas autorisé à uploader des fichiers');
      } else if (error.code === 'storage/canceled') {
        throw new Error('L\'upload a été annulé');
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error('L\'upload a échoué après plusieurs tentatives');
      } else if (error.code === 'storage/invalid-argument') {
        throw new Error('Arguments invalides pour l\'upload');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Erreur inconnue lors de l\'upload. Veuillez réessayer.');
      } else {
        throw new Error(`Erreur d'upload: ${error.message}`);
    }
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error: any) {
      console.error('Erreur de suppression:', error);
      throw new Error('Impossible de supprimer le fichier');
    }
  }

  /**
   * Télécharge une photo de profil pour un utilisateur
   * @param file Fichier image à télécharger
   * @param userId ID de l'utilisateur
   * @returns URL de téléchargement de la photo
   */
  async uploadProfilePhoto(file: File, userId: string): Promise<string> {
    try {
      // S'assurer que l'authentification est bien initialisée
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        throw new Error("Vous n'êtes pas authentifié. Veuillez vous connecter pour télécharger une photo.");
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      // Chemin de la photo de profil dans le bucket
      const fullPath = `profile-photos/${userId}`;
      console.log(`Tentative d'upload de photo de profil vers ${fullPath}`);

      // Référence au fichier dans Cloud Storage
      const storageRef = ref(storage, fullPath);

      try {
        // Télécharger le fichier
        const snapshot = await uploadBytes(storageRef, file);
        
        // Obtenir l'URL de téléchargement
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`Photo de profil téléchargée avec succès vers ${fullPath}`);
        
        return downloadURL;
      } catch (uploadError: any) {
        // Gérer spécifiquement les erreurs d'autorisation
        if (uploadError.code === 'storage/unauthorized') {
          console.error('Erreur d\'autorisation Firebase Storage:', uploadError);
          throw new Error('Vous n\'avez pas l\'autorisation d\'uploader des photos de profil.');
        }
        
        // Autres erreurs de Storage
        throw uploadError;
      }
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de la photo de profil:', error);
      if (error.code && error.code.startsWith('storage/')) {
        const errorMessages: {[key: string]: string} = {
          'storage/unauthorized': 'Accès non autorisé. Veuillez vous reconnecter.',
          'storage/canceled': 'Upload annulé.',
          'storage/retry-limit-exceeded': 'Le réseau est instable. Veuillez réessayer.',
          'storage/invalid-checksum': 'Image corrompue. Veuillez essayer une autre image.',
          'storage/server-file-wrong-size': 'Erreur lors du transfert. Veuillez réessayer.'
        };
        
        const message = errorMessages[error.code] || `Erreur Firebase: ${error.code}`;
        throw new Error(message);
      }
      
      throw new Error(`Erreur lors du téléchargement de la photo de profil: ${error.message}`);
    }
  }
}

export const storageService = new StorageService(); 