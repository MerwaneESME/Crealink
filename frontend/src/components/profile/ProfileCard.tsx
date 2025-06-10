import React from 'react';
import { BentoCard } from '@/components/ui/bento-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, User } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    uid: string;
    photoURL?: string | null;
    displayName?: string;
    role?: 'expert' | 'creator';
    expertise?: {
      mainType: string;
      subType: string;
      description?: string;
    };
    description?: string;
    skills?: string[];
  };
  onViewProfile?: () => void;
  onContact?: (name: string) => void;
}

const getExpertTypeName = (expertType: string): string => {
  const expertTypes: Record<string, string> = {
    editor: "Monteur",
    designer: "Designer",
    thumbnailMaker: "Miniaturiste",
    soundDesigner: "Sound Designer",
    motionDesigner: "Motion Designer",
    videoEditor: "Réalisateur",
    photographer: "Photographe",
    colorist: "Coloriste"
  };
  return expertTypes[expertType] || expertType;
};

const getExpertSubTypeName = (mainType: string, subType: string): string => {
  const subTypes: Record<string, Record<string, string>> = {
    editor: {
      shorts: "Monteur Shorts/TikTok",
      youtube: "Monteur YouTube",
      documentary: "Monteur Documentaire",
      gaming: "Monteur Gaming",
      corporate: "Monteur Corporate"
    },
    designer: {
      logo: "Logo Designer",
      branding: "Branding Designer",
      ui: "UI Designer",
      illustration: "Illustrateur"
    },
    thumbnailMaker: {
      youtube: "Miniatures YouTube",
      gaming: "Miniatures Gaming",
      lifestyle: "Miniatures Lifestyle"
    },
    soundDesigner: {
      music: "Compositeur",
      mixing: "Mixage Audio",
      voiceover: "Voice Over"
    },
    motionDesigner: {
      "2d": "Motion Design 2D",
      "3d": "Motion Design 3D",
      vfx: "VFX"
    },
    videoEditor: {
      commercial: "Publicités",
      music: "Clips Musicaux",
      corporate: "Vidéos Corporate"
    },
    photographer: {
      portrait: "Portrait",
      event: "Événementiel",
      product: "Produit"
    },
    colorist: {
      film: "Film",
      commercial: "Publicité",
      tv: "Télévision"
    }
  };
  return subTypes[mainType]?.[subType] || subType;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onViewProfile, onContact }) => {
  const isExpert = profile.role === 'expert';

  return (
    <BentoCard className="relative overflow-hidden group flex flex-col min-h-[280px]">
      {/* En-tête du profil */}
      <div className="flex items-start gap-4 p-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black/20">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white/90">{profile.displayName}</h3>
          {isExpert && profile.expertise ? (
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-sm text-white/75">
                {getExpertTypeName(profile.expertise.mainType)}
              </span>
              {profile.expertise.subType && (
                <span className="text-sm text-white/75">• {getExpertSubTypeName(profile.expertise.mainType, profile.expertise.subType)}</span>
              )}
            </div>
          ) : (
            <div className="text-lg text-gray-300">Créateur de contenu</div>
          )}
        </div>
      </div>

      {/* Description */}
      {profile.description && profile.description.trim() && !profile.skills?.length && (
        <div className="px-4">
          <p className="text-gray-300 text-sm line-clamp-2">{profile.description}</p>
        </div>
      )}

      {/* Compétences */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="px-4">
          <div className="flex flex-wrap gap-1">
            {profile.skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-purple-500/10 text-purple-300 text-xs py-0"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="mt-auto p-4 pt-4 flex gap-2 items-center justify-between">
        <Button 
          variant="outline" 
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-10"
          onClick={onViewProfile}
        >
          Voir le profil
        </Button>
        {onContact && (
          <Button
            variant="outline"
            className="bg-black/20 hover:bg-black/40 border-purple-500/50 hover:border-purple-400 h-10 w-10 p-0 flex items-center justify-center"
            onClick={() => onContact(profile.displayName || '')}
          >
            <Mail className="w-4 h-4" />
          </Button>
        )}
      </div>
    </BentoCard>
  );
};

export default ProfileCard; 