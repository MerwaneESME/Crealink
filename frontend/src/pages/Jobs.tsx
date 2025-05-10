import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

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
}

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Commencer avec chargement actif
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  console.log("Rendu du composant Jobs", { user });

  useEffect(() => {
    console.log("useEffect Jobs", { user });
    fetchJobs();
  }, [user]); // user est optionnel ici car déjà vérifié par ProtectedRoute

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
          status: data.status || 'open'
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

  useEffect(() => {
    let filtered = jobs;
    
    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }
    
    setFilteredJobs(filtered);
  }, [searchTerm, filterStatus, jobs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (status: 'all' | 'open' | 'closed') => {
    setFilterStatus(status);
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
        
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Rechercher une offre..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('all')}
              >
                Toutes
              </Button>
              <Button 
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('open')}
              >
                Ouvertes
              </Button>
              <Button 
                variant={filterStatus === 'closed' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('closed')}
              >
                Fermées
              </Button>
            </div>
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
            <Card className="max-w-md mx-auto bg-black/30 border-purple-500/10">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-xl font-semibold mb-2">Aucune offre disponible</h3>
                <p className="text-gray-400 mb-6">
                  {user?.role === 'creator' 
                    ? "Vous pouvez créer une nouvelle offre depuis votre tableau de bord." 
                    : "Aucune offre n'est publiée pour le moment. Revenez bientôt !"}
                </p>
                
                {user?.role === 'creator' && (
                  <Link to="/creator-dashboard">
                    <Button>
                      Créer une offre
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto bg-black/30 border-purple-500/10">
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
                className="bg-black/30 border-purple-500/10 hover:border-purple-500/20 cursor-pointer"
                onClick={() => handleJobClick(job.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                  <CardDescription className="text-gray-400">{job.creatorName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{job.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-gray-400">{format(new Date(job.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
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