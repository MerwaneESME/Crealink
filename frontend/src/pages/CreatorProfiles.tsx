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
              Découvrez nos créateurs et leurs contenus. Proposez-leur des collaborations pour vos projets.
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
                    className="bg-purple-900/10 border-purple-500/20 hover:border-purple-500/40 transition-all"
                    style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
                  >
                    {/* En-tête fixe avec photo et nom */}
                    <div className="p-4 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-purple-950 flex-shrink-0">
                          {creator.photoURL ? (
                            <img 
                              src={creator.photoURL} 
                              alt={creator.displayName} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-purple-800">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-lg font-semibold truncate">{creator.displayName}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{creator.rating ? creator.rating.toFixed(1) : '0.0'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenu avec hauteur fixe */}
                    <div className="p-4 pt-0 flex flex-col" style={{ height: '170px' }}>
                      {/* Compétences */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {creator.skills && creator.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="text-xs bg-purple-950/50 text-purple-300 px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {creator.skills && creator.skills.length > 3 && (
                          <span className="text-xs bg-purple-950/50 text-purple-300 px-2 py-0.5 rounded-full">
                            +{creator.skills.length - 3}
                          </span>
                        )}
                      </div>
                      
                      {/* Description avec hauteur maximum */}
                      <div className="flex-grow overflow-hidden mt-3">
                        <p className="text-sm text-gray-400 overflow-hidden" style={{ 
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical',
                          maxHeight: '60px'
                        }}>
                          {creator.description || "Aucune description disponible"}
                        </p>
                      </div>
                      
                      {/* Réseaux sociaux */}
                      <div className="flex gap-2 mt-auto pb-2">
                        {creator.youtube && (
                          <div className="p-1.5 bg-red-600/40 text-red-400 rounded-md hover:bg-red-600/60 hover:scale-110 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>
                            </svg>
                          </div>
                        )}
                        {creator.twitch && (
                          <div className="p-1.5 bg-purple-600/40 text-purple-400 rounded-md hover:bg-purple-600/60 hover:scale-110 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0zm9.143 7.429-2.286 2.286H7.429l-2 2v-2H3.143V1.143h9.857z"/>
                              <path d="M11.857 3.143h-1.143V6.57h1.143zm-3.143 0H7.571V6.57h1.143z"/>
                            </svg>
                          </div>
                        )}
                        {creator.instagram && (
                          <div className="p-1.5 bg-gradient-to-br from-pink-500/40 to-yellow-500/40 text-pink-400 rounded-md hover:from-pink-500/60 hover:to-yellow-500/60 hover:scale-110 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm.003 7.075a.925.925 0 1 1 0 1.85.925.925 0 0 1 0-1.85m0 1.3a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75M8 3.669a4.33 4.33 0 1 1 0 8.661 4.33 4.33 0 0 1 0-8.661m0 7.15a2.821 2.821 0 1 0 0-5.642 2.821 2.821 0 0 0 0 5.642"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Boutons toujours alignés en bas */}
                    <div className="mt-auto p-4 pt-2 border-t-0">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          className="flex-1 bg-purple-900/20 hover:bg-purple-900/40"
                          onClick={() => handleViewProfile(creator.uid)}
                        >
                          Voir profil
                        </Button>
                        <Button 
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
            <div className="mt-8 flex justify-center">
              {isLoadingMore ? (
                <Button disabled className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </Button>
              ) : hasMore ? (
                <Button 
                  onClick={loadMoreCreators}
                  className="flex items-center gap-2 bg-purple-800/50 hover:bg-purple-800/70"
                >
                  <>Voir plus de créateurs</>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : creators.length > 0 && (
                <p className="text-gray-400 text-sm">Tous les créateurs ont été chargés</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 