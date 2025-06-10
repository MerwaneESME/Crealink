import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Profile from '@/components/profile/Profile';
import { profileService } from '@/services/profileService';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

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

  return <Profile user={unifiedUser} variant="private" />;
};

export default ProfilePage; 