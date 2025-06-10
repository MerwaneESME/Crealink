import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BentoCard } from '@/components/ui/bento-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Star, Youtube, Instagram, Twitch, Video, Phone, Briefcase, Rocket, Share2, Settings } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { BlockData } from '@/types/profile';
import { profileService } from '@/services/profileService';
import DynamicBlocks from '@/components/profile/DynamicBlocks';

const GRID_SIZE = 3;
const BLOCK_WIDTH = 300;
const BLOCK_HEIGHT = 200;
const GRID_GAP = 16;

interface CreatorProfile {
  uid: string;
  displayName: string;
  name?: string;
  photoURL?: string;
  avatar?: string;
  bio?: string;
  description?: string;
  skills?: string[];
  specialties?: string[];
  role: 'expert' | 'creator';
  email?: string;
  phone?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  experience?: string;
  education?: string;
  location?: string;
  joinDate?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  creator?: {
    mainType: string;
    subType: string;
    description: string;
    platforms: string[];
    audienceSize: string;
  };
}

interface PortfolioItem {
  id: string;
  creatorId: string;
  type: 'youtube' | 'image' | 'audio' | 'other';
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: any;
}

const getYoutubeEmbedUrl = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export default function CreatorPortfolio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);

  useEffect(() => {
    if (id) {
      loadCreatorData();
      loadBlocks();
    }
  }, [id]);

  const loadCreatorData = async () => {
      if (!id) return;
      
      try {
        const creatorDoc = await getDoc(doc(db, 'users', id));
        
        if (!creatorDoc.exists()) {
        setError("Créateur non trouvé");
        setLoading(false);
          return;
        }
        
        const creatorData = creatorDoc.data();
        
        setCreatorProfile({
          uid: creatorDoc.id,
          displayName: creatorData.displayName || creatorData.name || "Créateur anonyme",
          name: creatorData.name || creatorData.displayName,
          photoURL: creatorData.photoURL || creatorData.avatar,
          avatar: creatorData.avatar || creatorData.photoURL,
        bio: creatorData.bio || creatorData.description || "Aucune biographie disponible",
          description: creatorData.description || creatorData.bio || "Aucune description disponible",
        skills: Array.isArray(creatorData.skills) ? creatorData.skills : [],
          specialties: creatorData.specialties || creatorData.skills || [],
        role: 'creator',
          email: creatorData.email,
          phone: creatorData.phone,
          showEmail: creatorData.showEmail,
          showPhone: creatorData.showPhone,
        experience: creatorData.experience,
        education: creatorData.education,
        location: creatorData.location || creatorData.address,
        joinDate: creatorData.createdAt,
        instagram: creatorData.instagram || creatorData.socials?.instagram || '',
        youtube: creatorData.youtube || creatorData.socials?.youtube || '',
        twitter: creatorData.twitter || creatorData.socials?.twitter || '',
        linkedin: creatorData.linkedin || creatorData.socials?.linkedin || '',
        creator: creatorData.creator
      });

      // Charger le portfolio
      const portfolioQuery = query(
            collection(db, 'portfolio'),
            where('creatorId', '==', creatorDoc.id)
          );
      const portfolioSnapshot = await getDocs(portfolioQuery);
      const portfolioData = portfolioSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];
      setPortfolioItems(portfolioData);

    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError("Erreur lors du chargement du profil");
      } finally {
      setLoading(false);
    }
  };

  const loadBlocks = async () => {
    if (!id) return;
    
    setIsLoadingBlocks(true);
    try {
      const loadedBlocks = await profileService.getBlocks(id);
      setBlocks(loadedBlocks.sort((a, b) => {
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des blocs:', error);
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  const handleContact = () => {
    // TODO: Implémenter la logique de contact
    console.log('Contact clicked');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }
  
  if (error || !creatorProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
        <div className="container mx-auto px-4">
          <div className="bg-red-900/20 border border-red-900/50 rounded-md p-4 text-center text-red-400">
            <p>{error || "Profil non trouvé"}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/profiles/creators')}
            >
              Retour aux profils
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout 
      user={creatorProfile}
      onContact={handleContact}
    >
      <div className="space-y-6">
        {/* Zone personnalisable */}
        <BentoCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Zone personnalisable</h2>
            <Button variant="outline" size="sm" className="text-purple-400 border-purple-400/20">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>
          
          {isLoadingBlocks ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <DynamicBlocks
              blocks={blocks}
              onBlocksChange={() => {}}
              isEditing={false}
              onEditingChange={() => {}}
            />
          )}
        </BentoCard>
      </div>
    </ProfileLayout>
  );
} 