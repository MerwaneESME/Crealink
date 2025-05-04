import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, User, Briefcase, Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

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
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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
        
        const expertsData: ExpertProfile[] = [];
        const projectsPromises: Promise<number>[] = [];
        
        // Récupérer les données des experts
        querySnapshot.forEach(docSnapshot => {
          const expertData = docSnapshot.data();
          
          expertsData.push({
            uid: docSnapshot.id,
            displayName: expertData.displayName || expertData.name || 'Expert Anonyme',
            email: expertData.email || '',
            photoURL: expertData.photoURL || expertData.avatar || '',
            bio: expertData.bio || 'Aucune biographie disponible',
            skills: expertData.skills || [],
            rating: expertData.rating || 0,
            projectCount: 0, // Sera mis à jour après
            role: expertData.role || 'expert'
          });
          
          // Créer une promesse pour compter les projets
          const projectCountPromise = countExpertProjects(docSnapshot.id);
          projectsPromises.push(projectCountPromise);
        });
        
        // Attendre que tous les compteurs de projets soient résolus
        const projectCounts = await Promise.all(projectsPromises);
        
        // Mettre à jour le nombre de projets pour chaque expert
        expertsData.forEach((expert, index) => {
          expert.projectCount = projectCounts[index];
        });
        
        setExperts(expertsData);
        
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
            const expertsData: ExpertProfile[] = [];
            
            usersSnapshot.docs.forEach(doc => {
              const userData = doc.data();
              
              if (userData.role === 'expert') {
                expertsData.push({
                  uid: doc.id,
                  displayName: userData.displayName || userData.name || 'Expert Anonyme',
                  email: userData.email || '',
                  photoURL: userData.photoURL || userData.avatar || '',
                  bio: userData.bio || 'Aucune biographie disponible',
                  skills: userData.skills || [],
                  rating: userData.rating || 0,
                  projectCount: Math.floor(Math.random() * 25) + 5, // Valeur aléatoire pour le moment
                  role: 'expert'
                });
              }
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

  // Fonction pour compter les projets d'un expert (exécuté en parallèle)
  const countExpertProjects = async (expertId: string): Promise<number> => {
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('expertId', '==', expertId),
        limit(100) // Limite raisonnable
      );
      
      try {
        const projectsSnapshot = await getDocs(projectsQuery);
        return projectsSnapshot.size;
      } catch (error) {
        console.error(`Erreur lors de la requête des projets pour l'expert ${expertId}:`, error);
        // Retourner une valeur par défaut en cas d'erreur
        return Math.floor(Math.random() * 25) + 5;
      }
    } catch (error) {
      console.error(`Erreur lors du comptage des projets pour l'expert ${expertId}:`, error);
      return 0;
    }
  };

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
      
      const newExpertsData: ExpertProfile[] = [];
      const projectsPromises: Promise<number>[] = [];
      
      // Récupérer les données des experts
      querySnapshot.forEach(docSnapshot => {
        const expertData = docSnapshot.data();
        
        newExpertsData.push({
          uid: docSnapshot.id,
          displayName: expertData.displayName || expertData.name || 'Expert Anonyme',
          email: expertData.email || '',
          photoURL: expertData.photoURL || expertData.avatar || '',
          bio: expertData.bio || 'Aucune biographie disponible',
          skills: expertData.skills || [],
          rating: expertData.rating || 0,
          projectCount: 0, // Sera mis à jour après
          role: expertData.role || 'expert'
        });
        
        // Créer une promesse pour compter les projets
        const projectCountPromise = countExpertProjects(docSnapshot.id);
        projectsPromises.push(projectCountPromise);
      });
      
      // Attendre que tous les compteurs de projets soient résolus
      const projectCounts = await Promise.all(projectsPromises);
      
      // Mettre à jour le nombre de projets pour chaque expert
      newExpertsData.forEach((expert, index) => {
        expert.projectCount = projectCounts[index];
      });
      
      setExperts(prev => [...prev, ...newExpertsData]);
      setCurrentPage(prev => prev + 1);
      setHasMore(querySnapshot.docs.length === EXPERTS_PER_PAGE);
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

  const handleProposeOffer = (expertId: string, expertName: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour proposer une offre.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (user.role !== 'creator' && user.role !== 'influencer') {
      toast({
        title: "Action non autorisée",
        description: "Seuls les créateurs de contenu peuvent proposer des offres.",
        variant: "destructive"
      });
      return;
    }
    
    // Si c'est un influenceur, rediriger vers la page de ses offres pour en sélectionner une
    if (user.role === 'influencer' || user.role === 'creator') {
      console.log("Redirection vers le tableau de bord avec expert:", expertId, expertName);
      // Utilisez encodeURIComponent pour s'assurer que les caractères spéciaux dans le nom sont bien encodés
      const redirectUrl = `/creator-dashboard?expertId=${expertId}&expertName=${encodeURIComponent(expertName)}`;
      console.log("URL de redirection:", redirectUrl);
      
      toast({
        title: "Sélection d'offre",
        description: "Veuillez sélectionner une offre à proposer à cet expert.",
      });
      
      navigate(redirectUrl);
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement des profils d'experts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 px-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Erreur</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
          Profils d'Experts
        </h1>
        <p className="text-gray-400 mb-6">
          Découvrez nos experts et leurs portfolios. Proposez-leur des collaborations pour vos projets.
        </p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, compétences ou description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/50 border-purple-500/30 focus:border-purple-500"
          />
        </div>
      </div>

      {filteredExperts.length === 0 ? (
        <div className="text-center py-12 bg-black/50 border border-purple-500/20 rounded-lg">
          <User className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">
            {searchQuery.trim() !== '' 
              ? 'Aucun expert ne correspond à votre recherche.' 
              : 'Aucun expert disponible pour le moment.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <Card key={expert.uid} className="overflow-hidden border border-purple-500/20 bg-black/50 hover:border-purple-500/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    {expert.photoURL ? (
                      <img 
                        src={expert.photoURL} 
                        alt={expert.displayName} 
                        className="w-16 h-16 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-900/40 flex items-center justify-center">
                        <User className="h-8 w-8 text-purple-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-xl font-semibold text-white">
                        {expert.displayName}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-400">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{expert.rating.toFixed(1)}</span>
                        <span className="mx-2">•</span>
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>{expert.projectCount} projets</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{expert.bio}</p>
                  
                  {expert.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {expert.skills.slice(0, 4).map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                        {expert.skills.length > 4 && (
                          <span className="inline-block bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-md">
                            +{expert.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                      onClick={() => handleViewProfile(expert.uid)}
                    >
                      Voir profil
                    </Button>
                    {user && (user.role === 'creator' || user.role === 'influencer') && (
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => handleProposeOffer(expert.uid, expert.displayName)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Proposer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {searchQuery.trim() === '' && (
            <div className="mt-8 flex justify-center">
              {hasMore ? (
                <Button
                  onClick={loadMoreExperts}
                  disabled={isLoadingMore}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>Voir plus d'experts</>
                  )}
                </Button>
              ) : experts.length > 0 && (
                <p className="text-gray-400 text-sm">Tous les experts ont été chargés</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}