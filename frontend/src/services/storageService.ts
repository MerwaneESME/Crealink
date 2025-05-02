import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { auth } from '../config/firebase';

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

      // Vérification du type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Seuls les fichiers images sont acceptés');
      }

      // Vérification de la taille
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Le fichier est trop volumineux (max 5MB)');
      }

      // Construction du chemin
      const userId = auth.currentUser?.uid || 'anonymous';
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const fullPath = `projects/${userId}/${fileName}`;

      console.log('Tentative d\'upload avec les paramètres:', {
        path: fullPath,
        size: file.size,
        type: file.type,
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
          uploadDate: new Date().toISOString()
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
        type: 'image'
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

  async uploadProfilePhoto(file: File, userId: string): Promise<string> {
    try {
      // Vérification de l'authentification
      if (!auth.currentUser) {
        throw new Error('Vous devez être connecté pour uploader une photo de profil');
      }

      // Vérification de base
      if (!file) {
        throw new Error('Aucun fichier fourni');
      }

      // Vérification du type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Seuls les fichiers images sont acceptés');
      }

      // Vérification de la taille
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Le fichier est trop volumineux (max 5MB)');
      }

      // Construction du chemin pour la photo de profil
      const timestamp = Date.now();
      const fileName = `profile_${timestamp}_${file.name}`;
      const fullPath = `users/${userId}/profile/${fileName}`;

      console.log('Tentative d\'upload de photo de profil:', {
        path: fullPath,
        size: file.size,
        type: file.type,
        userId,
        currentUser: auth.currentUser.uid,
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
          type: 'profile_photo',
          userRole: auth.currentUser.displayName || 'unknown'
        }
      };

      // Upload avec métadonnées
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('Upload de photo de profil réussi:', {
        path: snapshot.ref.fullPath,
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType,
        customMetadata: snapshot.metadata.customMetadata
      });

      // Récupération de l'URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL de la photo de profil obtenue:', downloadURL);

      return downloadURL;

    } catch (error: any) {
      console.error('Erreur d\'upload de photo de profil:', {
        code: error.code,
        message: error.message,
        details: error.details,
        serverResponse: error.serverResponse,
        bucket: storage.app.options.storageBucket,
        currentUser: auth.currentUser?.uid,
        userId
      });

      // Gestion spécifique des erreurs
      if (error.code === 'storage/unauthorized') {
        throw new Error(`Vous n'êtes pas autorisé à uploader des photos de profil. Utilisateur: ${auth.currentUser?.uid}, Rôle: ${auth.currentUser?.displayName}`);
      } else if (error.code === 'storage/canceled') {
        throw new Error('L\'upload a été annulé');
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error('L\'upload a échoué après plusieurs tentatives');
      } else if (error.code === 'storage/invalid-argument') {
        throw new Error('Arguments invalides pour l\'upload');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Erreur inconnue lors de l\'upload. Veuillez réessayer.');
      } else {
        throw new Error(`Erreur d'upload de photo de profil: ${error.message}`);
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
}

export const storageService = new StorageService(); 