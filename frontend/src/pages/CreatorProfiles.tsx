import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, User, Video, Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit, startAfter, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '@/config/firebase';
import ProfileCard from '@/components/profile/ProfileCard';

// Types
interface CreatorProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  description: string;
  skills: string[];
  rating: number;
  projectCount: number;
  role: 'creator';
  creator?: {
    mainType: string;
    subType: string;
    description: string;
    platforms: string[];
    audienceSize: string;
  };
}

// Nombre de créateurs à charger par page
const CREATORS_PER_PAGE = 10;

const CreatorProfiles: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer les créateurs en fonction de la recherche
  const filteredProfiles = useMemo(() => {
    if (searchTerm.trim() === '') {
      return profiles;
    }
    
    const lowerCaseQuery = searchTerm.toLowerCase();
    return profiles.filter(profile => 
      profile.displayName.toLowerCase().includes(lowerCaseQuery) || 
      profile.description?.toLowerCase().includes(lowerCaseQuery) ||
      profile.skills?.some(skill => skill.toLowerCase().includes(lowerCaseQuery))
    );
  }, [searchTerm, profiles]);

  const loadProfiles = async (searchQuery = '') => {
    try {
      setLoading(true);
      let creatorQuery = query(
        collection(db, 'users'),
        where('role', '==', 'creator'),
        orderBy('displayName'),
        limit(CREATORS_PER_PAGE)
      );

      if (lastVisible && !searchQuery) {
        creatorQuery = query(
          collection(db, 'users'),
          where('role', '==', 'creator'),
          orderBy('displayName'),
          startAfter(lastVisible),
          limit(CREATORS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(creatorQuery);
      const newProfiles = querySnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          uid: doc.id,
          displayName: data.displayName || 'Créateur Anonyme',
          email: data.email || '',
          photoURL: data.photoURL || null,
          description: data.description || 'Aucune description disponible',
          skills: Array.isArray(data.skills) ? data.skills : [],
          rating: typeof data.rating === 'number' ? data.rating : 0,
          projectCount: typeof data.projectCount === 'number' ? data.projectCount : 0,
          role: 'creator' as const,
          creator: data.creator
        } as CreatorProfile;
      });

      if (searchQuery) {
        const filtered = newProfiles.filter(profile =>
          profile.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.skills?.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setProfiles(filtered);
        setHasMore(false);
      } else {
        setProfiles(prev => lastVisible ? [...prev, ...newProfiles] : newProfiles);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === CREATORS_PER_PAGE);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les profils.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setLastVisible(null);
    setCurrentPage(1);
    loadProfiles(value);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadProfiles();
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
              onClick={() => navigate('/profiles/experts')}
              variant="outline"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              Voir les experts
            </Button>
            <div className="relative w-60">
              <div 
                className="flex items-center border border-purple-500/30 rounded-md bg-black/50 p-2 pl-3 cursor-text w-full"
                onClick={() => document.getElementById('creator-search-input')?.focus()}
              >
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <span className={`text-gray-400 ${searchTerm ? 'hidden' : 'block'}`}>Rechercher</span>
                <input
                  id="creator-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="bg-transparent border-none outline-none text-white absolute inset-0 pl-10 pr-3 py-2 w-full"
                  style={{ opacity: searchTerm ? 1 : 0 }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="text-gray-400">Chargement des profils de créateurs...</p>
          </div>
        ) : (
          <>
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-300">Aucun créateur trouvé</h2>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== '' ? 
                    "Aucun résultat pour votre recherche. Essayez d'autres termes." : 
                    "Aucun créateur n'est disponible pour le moment."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProfiles.map((profile) => (
                  <ProfileCard 
                    key={profile.uid} 
                    profile={profile}
                    onViewProfile={() => handleViewProfile(profile.uid)}
                    onContact={(name) => handleContact(profile.uid, name)}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && filteredProfiles.length > 0 && (
              <div className="flex justify-center mt-8 gap-4">
                {hasMore && (
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    className="border-purple-500/30 text-purple-300"
                    disabled={loading}
                  >
                    {loading ? (
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
};

export default CreatorProfiles; 