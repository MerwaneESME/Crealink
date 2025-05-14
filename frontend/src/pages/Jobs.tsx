import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  status: 'open' | 'closed';
  metier?: string;
}

// Liste des corps de métier disponibles
const METIERS = [
  'Développement Web',
  'Design Graphique',
  'Marketing Digital',
  'Production Vidéo',
  'Photographie',
  'Rédaction',
  'Montage Vidéo',
  'Animation 3D',
  'Motion Design',
  'Community Management',
  'SEO/SEA',
  'Autre'
];

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [selectedMetiers, setSelectedMetiers] = useState<string[]>([]);
  const [searchParams] = useSearchParams();

  console.log("Rendu du composant Jobs", { user });

  // Utilisation de useMemo pour les jobs filtrés
  const computedFilteredJobs = useMemo(() => {
    let filtered = jobs;
    
    if (searchTerm) {
      const normalizedSearchTerm = normalizeText(searchTerm);
      filtered = filtered.filter(job => 
        normalizeText(job.title).includes(normalizedSearchTerm) || 
        normalizeText(job.description).includes(normalizedSearchTerm)
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    if (selectedMetiers.length > 0) {
      filtered = filtered.filter(job => 
        selectedMetiers.includes(job.metier || 'Autre')
      );
    }
    
    return filtered;
  }, [searchTerm, filterStatus, selectedMetiers, jobs]);

  useEffect(() => {
    setFilteredJobs(computedFilteredJobs);
  }, [computedFilteredJobs]);

  useEffect(() => {
    if (!user) return;
    fetchJobs();
  }, [user]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      const categoryName = category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      setSelectedMetiers([categoryName]);
    }
  }, [searchParams]);

  const fetchJobs = async () => {
    console.log("Début fetchJobs");
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Tentative de récupération des offres...");
      let jobsQuery = collection(db, 'jobs');
      const querySnapshot = await getDocs(jobsQuery);
      
      console.log(`Nombre d'offres trouvées: ${querySnapshot.docs.length}`);
      
      const jobsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Vérifier si createdAt existe et est un timestamp Firestore
        let createdAtISO;
        try {
          // S'assurer que createdAt est bien un timestamp
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAtISO = data.createdAt.toDate().toISOString();
          } else {
            // Fallback si ce n'est pas un timestamp
            createdAtISO = new Date().toISOString();
            console.warn(`Le champ createdAt de l'offre ${doc.id} n'est pas un timestamp valide`);
          }
        } catch (err) {
          console.error(`Erreur de conversion de createdAt pour l'offre ${doc.id}:`, err);
          createdAtISO = new Date().toISOString();
        }
        
        return {
          id: doc.id,
          title: data.title || 'Sans titre',
          description: data.description || 'Aucune description',
          budget: data.budget || 'Non spécifié',
          deadline: data.deadline || 'Non spécifiée',
          createdAt: createdAtISO,
          creatorId: data.creatorId || '',
          creatorName: data.creatorName || 'Utilisateur anonyme',
          status: data.status || 'open',
          metier: data.metier || undefined
        };
      });
      
      console.log("Données des offres récupérées avec succès");
      setJobs(jobsList);
      setFilteredJobs(jobsList);
    } catch (err: any) {
      console.error("Erreur lors du chargement des offres:", err);
      let errorMessage = "Impossible de charger les offres d'emploi.";
      
      // Afficher des messages d'erreur plus précis
      if (err.code === 'permission-denied') {
        errorMessage = "Accès refusé à la collection 'jobs'. Vérifiez les règles de sécurité Firestore.";
      } else if (err.code === 'not-found') {
        errorMessage = "La collection 'jobs' n'existe pas encore.";
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      console.log("Fin fetchJobs");
    }
  };

  // Fonction pour normaliser le texte (enlever les accents, espaces, mettre en minuscules)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
      .replace(/\s+/g, '') // Enlève tous les espaces
      .trim();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (status: 'all' | 'open' | 'closed') => {
    setFilterStatus(status);
  };

  const handleMetierChange = (metier: string) => {
    setSelectedMetiers(prev => {
      if (prev.includes(metier)) {
        return prev.filter(m => m !== metier);
      } else {
        return [...prev, metier];
      }
    });
  };

  const handleJobClick = (jobId: string) => {
    console.log("Navigation vers la page de détails de l'offre, ID:", jobId);
    navigate(`/jobs/${jobId}`);
  };

  console.log("Avant rendu JSX", { isLoading, error, jobsLength: jobs.length });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Offres
        </h1>
        
        <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 bg-black/50 border-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('all')}
                className={`${filterStatus === 'all' ? 'bg-purple-900/40 text-white' : 'bg-black/50 border-purple-500/20'} hover:bg-purple-900/30`}
              >
                Toutes
              </Button>
              <Button 
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('open')}
                className={`${filterStatus === 'open' ? 'bg-purple-900/40 text-white' : 'bg-black/50 border-purple-500/20'} hover:bg-purple-900/30`}
              >
                Ouvertes
              </Button>
              <Button 
                variant={filterStatus === 'closed' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('closed')}
                className={`${filterStatus === 'closed' ? 'bg-purple-900/40 text-white' : 'bg-black/50 border-purple-500/20'} hover:bg-purple-900/30`}
              >
                Fermées
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between bg-black/50 border-purple-500/20">
                  <span>Corps de métier</span>
                  <ChevronDown className="h-4 w-4" />
                  {selectedMetiers.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-purple-600">
                      {selectedMetiers.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-4 bg-black/90 border-purple-500/20">
                <div className="space-y-2">
                  {METIERS.map((metier) => (
                    <div key={metier} className="flex items-center space-x-2">
                      <Checkbox
                        id={metier}
                        checked={selectedMetiers.includes(metier)}
                        onCheckedChange={() => handleMetierChange(metier)}
                      />
                      <label
                        htmlFor={metier}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {metier}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {selectedMetiers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMetiers([])}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
          
          {user?.role === 'creator' && (
            <div className="flex justify-end">
              <Link to="/creator-dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Gérer mes offres
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Chargement des offres...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto bg-purple-900/10 border-purple-500/20">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-xl font-semibold mb-2">Aucune offre disponible</h3>
                <p className="text-gray-400 mb-6">
                  {user?.role === 'creator' 
                    ? "Vous pouvez créer une nouvelle offre depuis votre tableau de bord." 
                    : "Aucune offre n'est publiée pour le moment. Revenez bientôt !"}
                </p>
                
                {user?.role === 'creator' && (
                  <Link to="/creator-dashboard">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Créer une offre
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto bg-purple-900/10 border-purple-500/20">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-xl font-semibold mb-2">Aucune offre correspondante</h3>
                <p className="text-gray-400 mb-6">
                  Aucune offre ne correspond à votre recherche. Essayez un autre terme ou filtre.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <Card
                key={job.id}
                className="bg-purple-900/10 border-purple-500/20 hover:border-purple-500/40 cursor-pointer flex flex-col h-[280px]"
                onClick={() => handleJobClick(job.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-1">{job.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-xs">{job.creatorName}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-grow overflow-hidden">
                  <p className="text-gray-400 text-sm line-clamp-5">{job.description}</p>
                </CardContent>
                <CardFooter className="pt-2 pb-2 flex justify-between mt-auto border-t border-purple-500/20 bg-purple-900/20">
                  <p className="text-gray-400 text-xs">{format(new Date(job.createdAt), 'dd/MM/yyyy')}</p>
                  <p className={`text-sm font-semibold ${job.status === 'open' ? 'text-green-500' : 'text-red-500'}`}>
                    {job.status === 'open' ? 'Ouvert' : 'Fermé'}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;