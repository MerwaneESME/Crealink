import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, User, Briefcase, Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit, startAfter, orderBy, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Types
interface ExpertProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  skills: string[];
  rating: number;
  projectCount: number;
  role: string;
}

// Nombre d'experts à charger par page
const EXPERTS_PER_PAGE = 6;

export default function ExpertProfiles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [openImage, setOpenImage] = useState<string | null>(null);

  // Filtrer les experts en fonction de la recherche
  const filteredExperts = useMemo(() => {
    if (searchQuery.trim() === '') {
      return experts;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return experts.filter(expert => 
      expert.displayName.toLowerCase().includes(lowerCaseQuery) || 
      expert.bio?.toLowerCase().includes(lowerCaseQuery) ||
      expert.skills?.some(skill => skill.toLowerCase().includes(lowerCaseQuery))
    );
  }, [searchQuery, experts]);

  // Fonction pour compter les projets d'un expert (version simplifiée)
  const countExpertProjects = async (expertId: string): Promise<number> => {
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('expertId', '==', expertId)
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      return projectsSnapshot.size;
    } catch (error) {
      console.error(`Erreur lors du comptage des projets pour l'expert ${expertId}:`, error);
      return 0;
    }
  };

  // Chargement initial des experts
  useEffect(() => {
    const fetchExperts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Requête Firestore pour récupérer les profils d'experts
        const expertsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'expert'),
          limit(EXPERTS_PER_PAGE)
        );
        
        const querySnapshot = await getDocs(expertsQuery);
        
        if (querySnapshot.empty) {
          setExperts([]);
          setHasMore(false);
          setIsLoading(false);
          return;
        }
        
        // Mémoriser le dernier document pour la pagination
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        
        // Récupérer les données des experts
        const expertsData: ExpertProfile[] = [];
        
        // Traiter chaque document d'expert
        querySnapshot.forEach(docSnapshot => {
          const expertData = docSnapshot.data();
          
          // Ajouter l'expert à la liste avec les informations de base
          expertsData.push({
            uid: docSnapshot.id,
            displayName: expertData.displayName || expertData.name || 'Expert Anonyme',
            email: expertData.email || '',
            photoURL: expertData.photoURL || expertData.avatar || '',
            bio: expertData.description || expertData.bio || 'Aucune biographie disponible',
            skills: expertData.skills || [],
            rating: expertData.rating || 0,
            projectCount: 0,
            role: expertData.role || 'expert'
          });
        });
        
        // Mettre à jour l'état avec les données de base des experts
        setExperts(expertsData);
        
        // Récupération asynchrone des décomptes de projets
        const updateProjectCounts = async () => {
          const updatedExperts = [...expertsData];
          
          for (let i = 0; i < updatedExperts.length; i++) {
            const projectCount = await countExpertProjects(updatedExperts[i].uid);
            updatedExperts[i] = { ...updatedExperts[i], projectCount };
          }
          
          setExperts(updatedExperts);
        };
        
        // Déclencher la mise à jour des décomptes de projets sans bloquer l'affichage initial
        updateProjectCounts();
        
        // S'il y a moins d'experts que la limite, il n'y en a probablement pas d'autres
        setHasMore(querySnapshot.docs.length === EXPERTS_PER_PAGE);
        
      } catch (err: any) {
        console.error("Erreur lors du chargement des experts:", err);
        
        // Si l'erreur est liée aux permissions, essayer avec des données de secours
        if (err.code === 'permission-denied') {
          try {
            // Essai d'une approche alternative
            console.log("Tentative de récupération alternative des profils d'experts...");
            
            // Récupérer tous les utilisateurs et filtrer côté client
            const usersQuery = query(
              collection(db, 'users'),
              limit(20) // Une limite plus grande pour récupérer plus d'utilisateurs
            );
            
            const usersSnapshot = await getDocs(usersQuery);
            
            if (usersSnapshot.empty) {
              setExperts([]);
              setHasMore(false);
              setIsLoading(false);
              return;
            }
            
            // Filtrer les experts côté client
            const expertsData = usersSnapshot.docs
              .filter(doc => doc.data().role === 'expert')
              .map(doc => {
                const userData = doc.data();
                return {
                  uid: doc.id,
                  displayName: userData.displayName || userData.name || 'Expert Anonyme',
                  email: userData.email || '',
                  photoURL: userData.photoURL || userData.avatar || '',
                  bio: userData.description || userData.bio || 'Aucune biographie disponible',
                  skills: userData.skills || [],
                  rating: userData.rating || 0,
                  projectCount: 0, // On mettra à jour cette valeur plus tard
                  role: 'expert'
                };
              });
            
            setExperts(expertsData);
            setHasMore(false); // Sans pagination pour l'approche alternative
            
          } catch (backupError) {
            console.error("Échec de la récupération alternative:", backupError);
            setError("Impossible de charger les profils d'experts. Permissions insuffisantes.");
            toast({
              variant: "destructive",
              title: "Erreur d'accès",
              description: "Vous n'avez pas les permissions nécessaires pour accéder aux profils d'experts."
            });
          }
        } else {
          setError("Impossible de charger les profils d'experts. Veuillez réessayer plus tard.");
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger les profils d'experts."
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExperts();
  }, [toast]);

  // Charger plus d'experts (pagination)
  const loadMoreExperts = async () => {
    if (!lastVisible || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      // Requête pour la page suivante
      const nextExpertsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'expert'),
        startAfter(lastVisible),
        limit(EXPERTS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(nextExpertsQuery);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        setIsLoadingMore(false);
        return;
      }
      
      // Mémoriser le dernier document pour la pagination
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      // Récupérer les données des experts
      const newExpertsData: ExpertProfile[] = [];
      
      // Traiter chaque document d'expert
      querySnapshot.forEach(docSnapshot => {
        const expertData = docSnapshot.data();
        
        // Ajouter l'expert à la liste avec les informations de base
        newExpertsData.push({
          uid: docSnapshot.id,
          displayName: expertData.displayName || expertData.name || 'Expert Anonyme',
          email: expertData.email || '',
          photoURL: expertData.photoURL || expertData.avatar || '',
          bio: expertData.description || expertData.bio || 'Aucune biographie disponible',
          skills: expertData.skills || [],
          rating: expertData.rating || 0,
          projectCount: 0,
          role: expertData.role || 'expert'
        });
      });
      
      // Ajouter les nouveaux experts à la liste existante
      setExperts(prev => [...prev, ...newExpertsData]);
      setCurrentPage(prev => prev + 1);
      setHasMore(querySnapshot.docs.length === EXPERTS_PER_PAGE);
      
      // Récupération asynchrone des décomptes de projets pour les nouveaux experts
      const updateProjectCounts = async () => {
        const updatedNewExperts = [...newExpertsData];
        
        for (let i = 0; i < updatedNewExperts.length; i++) {
          const projectCount = await countExpertProjects(updatedNewExperts[i].uid);
          updatedNewExperts[i] = { ...updatedNewExperts[i], projectCount };
        }
        
        setExperts(prev => {
          const existingExperts = prev.slice(0, prev.length - newExpertsData.length);
          return [...existingExperts, ...updatedNewExperts];
        });
      };
      
      // Déclencher la mise à jour des décomptes de projets sans bloquer l'affichage initial
      updateProjectCounts();
      
    } catch (err: any) {
      console.error("Erreur lors du chargement de plus d'experts:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger plus de profils."
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleViewProfile = (expertId: string) => {
    navigate(`/expert/${expertId}`);
  };

  const handleContact = (expertId: string, expertName: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour contacter un expert.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Rediriger vers la messagerie
    navigate(`/messages?recipient=${expertId}&name=${encodeURIComponent(expertName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Profils d'Experts
            </h1>
            <p className="text-gray-400 mt-2">
              Découvrez nos experts et leurs portfolios. Proposez-leur des collaborations pour vos projets.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => navigate('/profiles/creators')}
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
            >
              Voir les créateurs de contenu
            </Button>
            <div className="relative w-60">
              <div 
                className="flex items-center border border-purple-500/30 rounded-md bg-black/50 p-2 pl-3 cursor-text w-full"
                onClick={() => document.getElementById('expert-search-input')?.focus()}
              >
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <span className={`text-gray-400 ${searchQuery ? 'hidden' : 'block'}`}>Rechercher</span>
                <input
                  id="expert-search-input"
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
            <p className="text-gray-400">Chargement des profils d'experts...</p>
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
            {filteredExperts.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-300">Aucun expert trouvé</h2>
                <p className="text-gray-500 mt-2">
                  {searchQuery.trim() !== '' ? 
                    "Aucun résultat pour votre recherche. Essayez d'autres termes." : 
                    "Aucun expert n'est disponible pour le moment."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperts.map((expert) => (
                  <Card 
                    key={expert.uid} 
                    className="bg-purple-900/10 border-purple-500/20 hover:border-purple-500/40 transition-all"
                    style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
                  >
                    {/* En-tête fixe avec photo et nom */}
                    <div className="p-4 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-purple-950 flex-shrink-0">
                          {expert.photoURL ? (
                            <img 
                              src={expert.photoURL} 
                              alt={expert.displayName} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-purple-800">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-lg font-semibold truncate">{expert.displayName}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{expert.rating.toFixed(1)}</span>
                            <span className="mx-1">•</span>
                            <Briefcase className="h-3 w-3 text-gray-400" />
                            <span>{expert.projectCount} projets</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contenu avec hauteur fixe */}
                    <div className="p-4 pt-0 flex flex-col" style={{ height: '170px' }}>
                      {/* Compétences */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {expert.skills && expert.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index} 
                            className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-xs text-purple-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {expert.skills && expert.skills.length > 3 && (
                          <span className="text-xs text-gray-500">+{expert.skills.length - 3} autres</span>
                        )}
                      </div>
                      
                      {/* Bio avec texte tronqué */}
                      <div className="my-2 flex-grow overflow-hidden">
                        <p className="text-sm text-gray-400 line-clamp-4 text-ellipsis overflow-hidden">
                          {expert.bio}
                        </p>
                      </div>
                    </div>
                    
                    {/* Pied de carte avec actions */}
                    <div className="mt-auto border-t border-purple-500/10 p-3 flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        onClick={() => handleViewProfile(expert.uid)}
                      >
                        Voir profil
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-purple-500/20 text-purple-300 hover:bg-purple-400/10"
                        onClick={() => handleContact(expert.uid, expert.displayName)}
                      >
                        Contacter
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && filteredExperts.length > 0 && (
              <div className="flex justify-center mt-8 gap-4">
                {hasMore && (
                  <Button
                    onClick={loadMoreExperts}
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
                      <>Afficher plus d'experts</>
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
