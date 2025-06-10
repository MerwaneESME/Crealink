import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { BlockData, UnifiedProfile, SocialLinks } from '../types/profile';

export const profileService = {
  async getAllProfiles(): Promise<UnifiedProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.docs.map(doc => profileService.convertToUnifiedProfile(doc.data(), doc.id));
    } catch (error) {
      console.error("Erreur lors de la récupération des profils:", error);
      throw error;
    }
  },

  async getProfilesByRole(role: 'expert' | 'creator'): Promise<UnifiedProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => profileService.convertToUnifiedProfile(doc.data(), doc.id));
    } catch (error) {
      console.error(`Erreur lors de la récupération des profils ${role}:`, error);
      throw error;
    }
  },

  async getFullProfile(userId: string): Promise<UnifiedProfile> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("Profil utilisateur introuvable");
      }
      
      return profileService.convertToUnifiedProfile(userDoc.data(), userId);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      throw error;
    }
  },

  convertToUnifiedProfile(data: any, userId: string): UnifiedProfile {
    // Filtrer les compétences pour éviter les doublons avec l'expertise
    const skills = Array.isArray(data.skills) ? data.skills : [];
    const expertiseTerms = data.expertise ? [
      data.expertise.mainType?.toLowerCase(),
      data.expertise.subType?.toLowerCase()
    ].filter(Boolean) : [];
    
    const filteredSkills = skills.filter((skill: string) => 
      !expertiseTerms.includes(skill.toLowerCase())
    );

    // Nettoyer la description
    let description = data.description || '';
    if (description && skills.length > 0) {
      const skillsString = skills.join(', ');
      description = description.replace(skillsString, '').trim();
      description = description.replace(/,\s*$/, '').trim();
    }

    // Construire l'objet socials
    const socials: SocialLinks = {
      youtube: data.youtube || data.socials?.youtube || '',
      instagram: data.instagram || data.socials?.instagram || '',
      twitch: data.twitch || data.socials?.twitch || '',
      tiktok: data.tiktok || data.socials?.tiktok || '',
      twitter: data.twitter || data.socials?.twitter || '',
      github: data.github || data.socials?.github || '',
      linkedin: data.linkedin || data.socials?.linkedin || ''
    };

    // Construire le profil unifié
    return {
      uid: userId,
      displayName: data.displayName || data.name || null,
      photoURL: data.photoURL || null,
      email: data.email || null,
      phone: data.phone || null,
      description,
      role: data.role || 'creator',
      expertise: data.expertise,
      creator: data.creator,
      skills: filteredSkills,
      socials,
      settings: {
        emailVisibility: data.settings?.emailVisibility || 'private',
        phoneVisibility: data.settings?.phoneVisibility || 'private',
        allowMessages: data.settings?.allowMessages ?? true,
        allowNotifications: data.settings?.allowNotifications ?? true
      },
      verified: data.verified || false,
      rating: data.rating || null,
      updatedAt: data.updatedAt || new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
      useDisplayNameOnly: data.useDisplayNameOnly || false,
      onboardingCompleted: data.onboardingCompleted || false
    };
  },

  async forceUpdateProfile(userId: string, profileData: Partial<UnifiedProfile>) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("Profil utilisateur introuvable");
      }
      
      const existingData = userDoc.data();
      const updatedData = {
        ...existingData,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(userRef, updatedData);
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  },

  async updateProfileSettings(userId: string, settings: UnifiedProfile['settings']) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        settings,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      throw error;
    }
  },

  async updateSocialLinks(userId: string, socials: SocialLinks) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        socials,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des liens sociaux:", error);
      throw error;
    }
  },

  async saveBlocks(userId: string, blocks: BlockData[]) {
    try {
      const userProfileRef = doc(db, 'profiles', userId);
      await setDoc(userProfileRef, { blocks }, { merge: true });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des blocs:', error);
      throw error;
    }
  },

  async getBlocks(userId: string): Promise<BlockData[]> {
    try {
      const userProfileRef = doc(db, 'profiles', userId);
      const profileDoc = await getDoc(userProfileRef);
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        // Vérifier si data.blocks est un tableau
        if (Array.isArray(data.blocks)) {
          return data.blocks;
        }
      }
      
      // Si le document n'existe pas ou si blocks n'est pas un tableau, initialiser avec un tableau vide
      await setDoc(userProfileRef, { blocks: [] }, { merge: true });
      return [];
    } catch (error) {
      console.error('Erreur lors du chargement des blocs:', error);
      throw error;
    }
  },

  async updateBlockLayout(userId: string, blocks: BlockData[]) {
    try {
      const userProfileRef = doc(db, 'profiles', userId);
      await updateDoc(userProfileRef, { blocks });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du layout:', error);
      throw error;
    }
  }
}; 