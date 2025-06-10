import React from 'react';
import { BentoCard } from '@/components/ui/bento-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Star, Youtube, Instagram, Twitch, Video, Phone, Briefcase, Rocket, Share2, Settings, Pencil } from 'lucide-react';

interface ProfileLayoutProps {
  user: {
    uid: string;
    photoURL?: string | null;
    displayName?: string;
    role?: 'expert' | 'creator';
    expertise?: {
      mainType: string;
      subType: string;
      description?: string;
      level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      value?: string;
    };
    creator?: {
      mainType: string;
      subType: string;
      description: string;
      platforms: string[];
      audienceSize: string;
    };
    description?: string;
    skills?: string[];
    email?: string;
    phone?: string;
    showEmail?: boolean;
    showPhone?: boolean;
    youtube?: string;
    instagram?: string;
    twitch?: string;
    tiktok?: string;
  };
  variant?: 'private' | 'public';
  onContact?: () => void;
  onEdit?: () => void;
  children?: React.ReactNode;
}

const getExpertTypeName = (expertType: string): string => {
  const expertTypes: Record<string, string> = {
    editor: "Monteur",
    designer: "Designer",
    writer: "Rédacteur",
    developer: "Développeur",
    marketing: "Marketing",
    other: "Autre"
  };
  return expertTypes[expertType] || expertType;
};

const getExpertSubTypeName = (mainType: string, subType: string): string => {
  const subTypes: Record<string, Record<string, string>> = {
    editor: {
      video: "Vidéo",
      photo: "Photo",
      audio: "Audio",
      motion: "Motion Design"
    },
    designer: {
      graphic: "Graphisme",
      ui: "UI Design",
      ux: "UX Design",
      web: "Web Design",
      brand: "Identité visuelle"
    },
    writer: {
      content: "Contenu",
      copywriting: "Copywriting",
      script: "Scénario",
      blog: "Blog"
    },
    developer: {
      web: "Web",
      mobile: "Mobile",
      game: "Jeu vidéo",
      other: "Autre"
    },
    marketing: {
      social: "Réseaux sociaux",
      seo: "SEO",
      ads: "Publicité",
      strategy: "Stratégie"
    }
  };
  return subTypes[mainType]?.[subType] || subType;
};

const getExpertLevelName = (level: string): string => {
  const levels: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    expert: "Expert"
  };
  return levels[level] || level;
};

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ 
  user, 
  variant = 'public',
  onContact,
  onEdit,
  children 
}) => {
  const isExpert = user.role === 'expert';
  const isPrivate = variant === 'private';

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Colonne de gauche */}
          <div className="space-y-6">
            <BentoCard variant="highlight" className="flex flex-col items-center text-center p-6">
              <div className="w-32 h-32 rounded-xl overflow-hidden mb-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-500/20 flex items-center justify-center">
                    <User className="w-12 h-12 text-purple-500/60" />
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">{user.displayName}</h1>
              {isExpert ? (
                <>
                  <div className="text-xl text-gray-300">
                    {user.expertise && getExpertTypeName(user.expertise.mainType)}
                  </div>
                  {user.expertise?.subType && (
                    <div className="text-sm text-gray-400">
                      {getExpertSubTypeName(user.expertise.mainType, user.expertise.subType)}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-xl text-gray-300">Créateur de contenu</div>
                  {user.creator?.mainType && (
                    <div className="text-sm text-gray-400">
                      {user.creator.mainType}
                      {user.creator.subType && ` • ${user.creator.subType}`}
                    </div>
                  )}
                </>
              )}
            </BentoCard>

            {/* Niveau d'expertise (pour les experts uniquement) */}
            {isExpert && user.expertise?.level && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-300">Niveau d'expertise</h2>
                <Badge 
                  variant="outline"
                  className="bg-black/40 text-gray-300 border-gray-700"
                >
                  {getExpertLevelName(user.expertise.level)}
                </Badge>
              </div>
            )}

            {/* Compétences */}
            {user.skills && user.skills.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-300">Compétences</h2>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="bg-black/40 text-gray-300 border-gray-700"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Valeur ajoutée (pour les experts uniquement) */}
            {isExpert && user.expertise?.value && (
              <BentoCard>
                <h2 className="text-lg font-semibold mb-4">Ce que je peux vous apporter</h2>
                <p className="text-gray-300">{user.expertise.value}</p>
              </BentoCard>
            )}

            {/* Boutons d'action */}
            <div className="space-y-3">
              {isPrivate ? (
                <Button 
                  variant="outline" 
                  className="w-full bg-black/20 hover:bg-black/40"
                  onClick={onEdit}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres du profil
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={onContact}
                >
                  Contacter
                </Button>
              )}
            </div>

            {/* Contact */}
            {((user.showEmail && user.email) || (user.showPhone && user.phone)) && (
              <BentoCard>
                <h2 className="text-lg font-semibold mb-4">Contact</h2>
                <div className="space-y-3">
                  {user.showEmail && user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                  {user.showPhone && user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                </div>
              </BentoCard>
            )}

            {/* Réseaux sociaux */}
            {(user.youtube || user.instagram || user.twitch || user.tiktok) && (
              <BentoCard>
                <h2 className="text-lg font-semibold mb-4">Réseaux sociaux</h2>
                <div className="space-y-3">
                  {user.youtube && (
                    <a href={user.youtube} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-2 text-sm hover:text-purple-400 transition-colors">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </a>
                  )}
                  {user.instagram && (
                    <a href={user.instagram} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-sm hover:text-purple-400 transition-colors">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                  )}
                  {user.twitch && (
                    <a href={user.twitch} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-sm hover:text-purple-400 transition-colors">
                      <Twitch className="w-4 h-4" />
                      Twitch
                    </a>
                  )}
                  {user.tiktok && (
                    <a href={user.tiktok} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-sm hover:text-purple-400 transition-colors">
                      <Video className="w-4 h-4" />
                      TikTok
                    </a>
                  )}
                </div>
              </BentoCard>
            )}
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout; 