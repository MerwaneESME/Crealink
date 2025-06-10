import { User } from '@/contexts/AuthContext';

// Types de base pour les profils
export interface BaseProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  description?: string;
  email: string | null;
  phone?: string | null;
  showEmail?: boolean;
  showPhone?: boolean;
  skills?: string[];
  socials?: {
    youtube?: string;
    instagram?: string;
    twitch?: string;
    tiktok?: string;
  };
}

// Type pour l'expertise
export interface ExpertiseData {
  mainType: string;
  subType: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  value: string;
}

// Type pour les créateurs
export interface CreatorData {
  mainType: string;
  subType: string;
  description: string;
  platforms: string[];
  audienceSize: string;
}

// Types pour les blocs
export type BlockType = 'youtube' | 'social' | 'link' | 'image' | 'text';

export type SocialPlatform = 'youtube' | 'twitter' | 'instagram' | 'github' | 'mastodon' | 'buymeacoffee';

export interface BlockContent {
  title?: string;
  text?: string;
  url?: string;
  platform?: 'youtube' | 'instagram' | 'tiktok' | 'twitch' | 'x';
  backgroundColor?: string;
}

export interface BlockPosition {
  x: number;
  y: number;
}

export interface BlockData {
  id: string;
  type: BlockType;
  content: BlockContent;
  position: BlockPosition;
}

export interface NewBlockData {
  type: BlockType;
  content: BlockContent;
}

export interface SocialLinks {
  youtube?: string;
  instagram?: string;
  twitch?: string;
  tiktok?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}

// Type unifié pour tous les profils
export interface UnifiedProfile extends BaseProfile {
  role?: 'expert' | 'creator' | 'pending';
  expertise?: ExpertiseData;
  creator?: CreatorData;
  updatedAt?: string;
  createdAt?: string;
  verified?: boolean;
  rating?: string;
  useDisplayNameOnly?: boolean;
  onboardingCompleted?: boolean;
  socials: SocialLinks;
  settings?: {
    emailVisibility: 'public' | 'private';
    phoneVisibility: 'public' | 'private';
    allowMessages: boolean;
    allowNotifications: boolean;
  };
}

// Props pour les composants
export interface ProfileViewProps {
  user: UnifiedProfile;
  variant?: 'private' | 'public';
  onEdit?: () => void;
  onContact?: () => void;
}

export interface ProfileSettingsProps {
  user: UnifiedProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ProfileCardProps {
  profile: Partial<UnifiedProfile>;
  onViewProfile?: () => void;
  onContact?: (name: string) => void;
} 