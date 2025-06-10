import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, User, Briefcase, Star, MessageSquare, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit, startAfter, orderBy, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProfileCard from '@/components/profile/ProfileCard';
import { Badge } from '@/components/ui/badge';
import { EXPERT_SKILLS } from '@/constants/skills';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Types
interface ExpertProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  description: string;
  skills: string[];
  rating: number;
  projectCount: number;
  role: 'expert';
  expertise?: {
    mainType: string;
    subType: string;
    description: string;
  };
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
  const [selectedMainType, setSelectedMainType] = useState<string>('');
  const [selectedSubType, setSelectedSubType] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Liste des types d'expertise principaux
  const expertTypes = {
    editor: "Monteur",
    designer: "Designer",
    thumbnailMaker: "Miniaturiste",
    soundDesigner: "Sound Designer",
    motionDesigner: "Motion Designer",
    videoEditor: "Réalisateur",
    photographer: "Photographe",
    colorist: "Coloriste"
  };

  // Liste des sous-types par type principal
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
    // ... autres sous-types ...
  };

  // Filtrer les experts en fonction de tous les critères
  const filteredExperts = useMemo(() => {
    let filtered = experts;

    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(expert => 
        expert.displayName.toLowerCase().includes(lowerCaseQuery) || 
        expert.description?.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Filtre par type principal d'expertise
    if (selectedMainType) {
      filtered = filtered.filter(expert => 
        expert.expertise?.mainType === selectedMainType
      );
    }

    // Filtre par sous-type d'expertise
    if (selectedSubType) {
      filtered = filtered.filter(expert => 
        expert.expertise?.subType === selectedSubType
      );
    }

    // Filtre par compétences
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(expert => 
        selectedSkills.every(skill => expert.skills?.includes(skill))
      );
    }

    return filtered;
  }, [experts, searchQuery, selectedMainType, selectedSubType, selectedSkills]);

  // Filtrer les compétences en fonction de la recherche
  const filteredSkills = useMemo(() => {
    if (!skillSearchQuery.trim()) {
      return EXPERT_SKILLS;
    }

    const query = skillSearchQuery.toLowerCase();
    const filtered: typeof EXPERT_SKILLS = {};

    Object.entries(EXPERT_SKILLS).forEach(([category, subcategories]) => {
      const filteredSubcategories = subcategories.map(subcat => ({
        name: subcat.name,
        skills: subcat.skills.filter(skill => 
          skill.toLowerCase().includes(query)
        )
      })).filter(subcat => subcat.skills.length > 0);

      if (filteredSubcategories.length > 0) {
        filtered[category] = filteredSubcategories;
      }
    });

    return filtered;
  }, [skillSearchQuery]);

  const handleSkillSelect = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSelectedMainType('');
    setSelectedSubType('');
    setSelectedSkills([]);
  };

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
            photoURL: expertData.photoURL || expertData.avatar || null,
            description: expertData.description || expertData.bio || 'Aucune description disponible',
            skills: Array.isArray(expertData.skills) ? expertData.skills : [],
            rating: typeof expertData.rating === 'number' ? expertData.rating : 0,
            projectCount: 0,
            role: 'expert' as const,
            expertise: expertData.expertise
          } as ExpertProfile);
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
                  photoURL: userData.photoURL || userData.avatar || null,
                  description: userData.description || userData.bio || 'Aucune biographie disponible',
                  skills: userData.skills || [],
                  rating: userData.rating || 0,
                  projectCount: 0, // On mettra à jour cette valeur plus tard
                  role: 'expert' as const,
                  expertise: userData.expertise
                } as ExpertProfile;
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
          photoURL: expertData.photoURL || expertData.avatar || null,
          description: expertData.description || expertData.bio || 'Aucune description disponible',
          skills: Array.isArray(expertData.skills) ? expertData.skills : [],
          rating: typeof expertData.rating === 'number' ? expertData.rating : 0,
          projectCount: 0,
          role: 'expert' as const,
          expertise: expertData.expertise
        } as ExpertProfile);
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
              Découvrez nos experts et leurs portfolios pour vos projets de collaboration.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => navigate('/profiles/creators')}
              variant="outline"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              Voir les créateurs de contenu
            </Button>
            
            {/* Bouton de filtres */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="relative border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                  {(selectedMainType || selectedSubType || selectedSkills.length > 0) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Spécialité</h4>
                    <Select
                      value={selectedMainType}
                      onValueChange={setSelectedMainType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les spécialités" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(expertTypes).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMainType && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Sous-spécialité</h4>
                      <Select
                        value={selectedSubType}
                        onValueChange={setSelectedSubType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les sous-spécialités" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(subTypes[selectedMainType] || {}).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Compétences</h4>
                    <div className="space-y-2">
                      {/* Barre de recherche des compétences */}
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={skillSearchQuery}
                          onChange={(e) => setSkillSearchQuery(e.target.value)}
                          placeholder="Rechercher une compétence..."
                          className="pl-8 bg-black/20 border-purple-500/30"
                        />
                        {skillSearchQuery && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-purple-900/20"
                            onClick={() => setSkillSearchQuery('')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Liste des compétences filtrées */}
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {Object.entries(filteredSkills).map(([category, subcategories]) => (
                          <div key={category}>
                            <h5 className="text-sm font-medium text-gray-400 mb-1">{category}</h5>
                            <div className="flex flex-wrap gap-1">
                              {subcategories.map(subcat => 
                                subcat.skills.map(skill => (
                                  <Badge
                                    key={skill}
                                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-purple-600"
                                    onClick={() => handleSkillSelect(skill)}
                                  >
                                    {skill}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                        {Object.keys(filteredSkills).length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-2">
                            Aucune compétence trouvée
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {(selectedMainType || selectedSubType || selectedSkills.length > 0) && (
                    <Button
                      variant="ghost"
                      className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={clearFilters}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Réinitialiser les filtres
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredExperts.map((expert) => (
                  <ProfileCard
                    key={expert.uid}
                    profile={expert}
                    onViewProfile={() => handleViewProfile(expert.uid)}
                    onContact={(name) => handleContact(expert.uid, name)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredExperts.length > 0 && hasMore && (
              <div className="flex justify-center mt-8 gap-4">
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
