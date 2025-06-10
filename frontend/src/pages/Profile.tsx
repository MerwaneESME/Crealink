import React, { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import Profile from '@/components/profile/Profile';
import { storageService } from '@/services/storageService';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Upload de la photo
      const photoURL = await storageService.uploadProfilePhoto(file, user.uid);
      
      // Mise à jour du profil utilisateur avec la nouvelle URL de la photo
      await updateUserProfile({
        photoURL,
        avatar: photoURL
      });
      
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
        variant: "default",
      });
      
      // Recharger la page pour afficher la nouvelle photo
      window.location.reload();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la photo.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Accès requis</h2>
          <p>Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  // Convertir l'user du contexte auth vers le format UnifiedProfile
  const unifiedUser = {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    email: user.email,
    phone: user.phone,
    description: user.description,
    role: user.role,
    expertise: user.expertise,
    creator: user.creator,
    skills: user.skills,
    socials: {
      youtube: user.youtube || '',
      instagram: user.instagram || '',
      twitch: user.twitch || '',
      tiktok: user.tiktok || '',
      twitter: user.twitter || '',
      github: user.github || '',
      linkedin: user.linkedin || ''
    },
    settings: {
      emailVisibility: (user.showEmail ? 'public' : 'private') as 'public' | 'private',
      phoneVisibility: (user.showPhone ? 'public' : 'private') as 'public' | 'private',
      allowMessages: true,
      allowNotifications: true
    },
    verified: user.verified || false,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    useDisplayNameOnly: user.useDisplayNameOnly || false,
    onboardingCompleted: user.onboardingCompleted || false
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20">
      <Profile
        user={unifiedUser}
        variant="private"
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handlePhotoChange}
      />
    </div>
  );
};

export default ProfilePage; 