import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BentoCard } from '@/components/ui/bento-card';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BlockData } from '@/types/profile';
import { profileService } from '@/services/profileService';
import DynamicBlocks from '@/components/profile/DynamicBlocks';

const GRID_SIZE = 3;
const BLOCK_WIDTH = 300;
const BLOCK_HEIGHT = 200;
const GRID_GAP = 16;

export default function ExpertPortfolio() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [expertProfile, setExpertProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);

  useEffect(() => {
    if (id) {
      loadExpertProfile();
      loadBlocks();
    }
  }, [id]);

  const loadExpertProfile = async () => {
    if (!id) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (userDoc.exists()) {
        setExpertProfile({
          uid: userDoc.id,
          ...userDoc.data()
        });
      } else {
        toast({
          title: "Erreur",
          description: "Profil non trouvé",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      toast({
        title: "Erreur",
        description: "Impossible de charger les blocs du profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  const handleContact = () => {
    // Logique de contact
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!expertProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Profil non trouvé</p>
      </div>
    );
  }

  return (
    <ProfileLayout 
      user={expertProfile}
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