import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, User, Video, Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Types
interface CreatorProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  description: string;
  skills: string[];
  rating: number;
  projectCount: number;
  role: string;
  youtube?: string;
  twitch?: string;
  instagram?: string;
  favoriteNetwork?: string;
}

// Nombre de créateurs à charger par page
const CREATORS_PER_PAGE = 6;

export default function CreatorProfiles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer les créateurs en fonction de la recherche
  const filteredCreators = useMemo(() => {
    if (searchQuery.trim() === '') {
      return creators;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return creators.filter(creator => 
      creator.displayName.toLowerCase().includes(lowerCaseQuery) || 
      creator.description?.toLowerCase().includes(lowerCaseQuery) ||
      creator.skills?.some(skill => skill.toLowerCase().includes(lowerCaseQuery))
    );
  }, [searchQuery, creators]);

  // Chargement initial des créateurs
  useEffect(() => {
    const fetchCreators = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Requête Firestore pour récupérer les profils de créateurs
        const creatorsQuery = query(
          collection(db, 'users'),
          where('role', 'in', ['creator', 'influencer']),
          limit(CREATORS_PER_PAGE)
        );
        
        const querySnapshot = await getDocs(creatorsQuery);
        
        if (querySnapshot.empty) {
          setCreators([]);
          setHasMore(false);
          setIsLoading(false);
          return;
        }
        
        // Mémoriser le dernier document pour la pagination
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        
        const creatorsData: CreatorProfile[] = [];
        
        // Récupérer les données des créateurs
        querySnapshot.forEach(docSnapshot => {
          const creatorData = docSnapshot.data();
          
          creatorsData.push({
            uid: docSnapshot.id,
            displayName: creatorData.displayName || creatorData.name || 'Créateur Anonyme',
            email: creatorData.email || '',
            photoURL: creatorData.photoURL || creatorData.avatar || '',
            description: creatorData.description || creatorData.bio || 'Aucune description disponible',
            skills: creatorData.skills || [],
            rating: creatorData.rating || 0,
            projectCount: 0,
            role: creatorData.role || 'creator',
            youtube: creatorData.youtube || creatorData.socials?.youtube || '',
            twitch: creatorData.twitch || creatorData.socials?.twitch || '',
            instagram: creatorData.instagram || creatorData.socials?.instagram || '',
            favoriteNetwork: creatorData.favoriteNetwork || ''
          });
        });
        
        setCreators(creatorsData);
        
        // S'il y a moins de créateurs que la limite, il n'y en a probablement pas d'autres
        setHasMore(querySnapshot.docs.length === CREATORS_PER_PAGE);
        
      } catch (err: any) {
        console.error("Erreur lors du chargement des créateurs:", err);
        setError("Impossible de charger les profils de créateurs. Veuillez réessayer plus tard.");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les profils de créateurs."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCreators();
  }, [toast]);

  // Charger plus de créateurs (pagination)
  const loadMoreCreators = async () => {
    if (!lastVisible || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      // Requête pour la page suivante
      const nextCreatorsQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['creator', 'influencer']),
        startAfter(lastVisible),
        limit(CREATORS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(nextCreatorsQuery);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        setIsLoadingMore(false);
        return;
      }
      
      // Mémoriser le dernier document pour la pagination
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      const newCreatorsData: CreatorProfile[] = [];
      
      // Récupérer les données des créateurs
      querySnapshot.forEach(docSnapshot => {
        const creatorData = docSnapshot.data();
        
        newCreatorsData.push({
          uid: docSnapshot.id,
          displayName: creatorData.displayName || creatorData.name || 'Créateur Anonyme',
          email: creatorData.email || '',
          photoURL: creatorData.photoURL || creatorData.avatar || '',
          description: creatorData.description || creatorData.bio || 'Aucune description disponible',
          skills: creatorData.skills || [],
          rating: creatorData.rating || 0,
          projectCount: 0,
          role: creatorData.role || 'creator',
          youtube: creatorData.youtube || creatorData.socials?.youtube || '',
          twitch: creatorData.twitch || creatorData.socials?.twitch || '',
          instagram: creatorData.instagram || creatorData.socials?.instagram || '',
          favoriteNetwork: creatorData.favoriteNetwork || ''
        });
      });
      
      // Ajouter les nouveaux créateurs à la liste existante
      setCreators(prev => [...prev, ...newCreatorsData]);
      
      // Mettre à jour le statut de pagination
      setHasMore(querySnapshot.docs.length === CREATORS_PER_PAGE);
      setCurrentPage(prev => prev + 1);
      
    } catch (err) {
      console.error("Erreur lors du chargement de plus de créateurs:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger plus de profils de créateurs."
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleViewProfile = (creatorId: string) => {
    navigate(`/creator/${creatorId}`);
  };

  const handleContact = (creatorId: string, creatorName: string) => {
    navigate(`/messages?recipient=${creatorId}&name=${encodeURIComponent(creatorName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Profils de Créateurs
            </h1>
            <p className="text-gray-400 mt-2">
              Découvrez nos créateurs et leurs contenus pour vos projets de collaboration.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => navigate('/profiles')}
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
            >
              Voir les experts
            </Button>
            <div className="relative w-60">
              <div 
                className="flex items-center border border-purple-500/30 rounded-md bg-black/50 p-2 pl-3 cursor-text w-full"
                onClick={() => document.getElementById('creator-search-input')?.focus()}
              >
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <span className={`text-gray-400 ${searchQuery ? 'hidden' : 'block'}`}>Rechercher</span>
                <input
                  id="creator-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white absolute inset-0 pl-10 pr-3 py-2 w-full"
                  style={{ opacity: searchQuery ? 1 : 0 }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="text-gray-400">Chargement des profils de créateurs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900/50 rounded-md p-4 text-center text-red-400">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            {filteredCreators.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-300">Aucun créateur trouvé</h2>
                <p className="text-gray-500 mt-2">
                  {searchQuery.trim() !== '' ? 
                    "Aucun résultat pour votre recherche. Essayez d'autres termes." : 
                    "Aucun créateur n'est disponible pour le moment."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreators.map((creator) => (
                  <Card 
                    key={creator.uid} 
                    className="bg-purple-900/10 border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col"
                  >
                    {/* En-tête avec photo et nom */}
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-purple-950 flex-shrink-0">
                          {creator.photoURL ? (
                            <img 
                              src={creator.photoURL} 
                              alt={creator.displayName} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-purple-800">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-lg font-semibold truncate">{creator.displayName}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{creator.rating ? creator.rating.toFixed(1) : '0.0'}</span>
                            <span className="mx-1">•</span>
                            <Video className="h-3 w-3 text-gray-400" />
                            <span>{creator.projectCount || 0} vidéos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenu */}
                    <div className="p-4 pt-0 flex-grow">
                      {/* Compétences */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {creator.skills && creator.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index} 
                            className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-xs text-purple-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {creator.skills && creator.skills.length > 3 && (
                          <span className="text-xs text-gray-500">+{creator.skills.length - 3} autres</span>
                        )}
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {creator.description}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-auto p-4 pt-3 border-t border-purple-500/10">
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          onClick={() => handleViewProfile(creator.uid)}
                        >
                          Voir profil
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-purple-500/20 text-purple-300 hover:bg-purple-400/10"
                          onClick={() => handleContact(creator.uid, creator.displayName)}
                        >
                          Contacter
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && filteredCreators.length > 0 && (
              <div className="flex justify-center mt-8 gap-4">
                {hasMore && (
                  <Button
                    onClick={loadMoreCreators}
                    variant="outline"
                    className="border-purple-500/30 text-purple-300"
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>Afficher plus de créateurs</>
                    )}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 