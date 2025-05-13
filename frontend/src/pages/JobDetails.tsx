import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

console.log("Chargement du composant JobDetails");

// Types
interface Job {
  id: string;
  title: string;
  description: string;
  budget: string | number;
  deadline: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  status: 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';
}

export default function JobDetails() {
  console.log("Rendu du composant JobDetails");
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log("ID de l'offre :", id);
  console.log("Utilisateur connecté :", user);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) {
        console.log("ID manquant, impossible de charger l'offre");
        return;
      }
      
      console.log("Début du chargement des détails de l'offre, ID:", id);
      setLoading(true);
      try {
        console.log("Tentative de récupération du document depuis Firestore");
        const jobRef = doc(db, 'jobs', id);
        const jobDoc = await getDoc(jobRef);
        
        console.log("Résultat de la requête:", jobDoc.exists() ? "Document trouvé" : "Document non trouvé");
        
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          console.log("Données de l'offre:", jobData);
          
          // Normaliser les données pour s'assurer qu'elles correspondent à notre interface
          const normalizedJob = {
            id: jobDoc.id,
            title: jobData.title || "Sans titre",
            description: jobData.description || "",
            budget: jobData.budget || "Non spécifié",
            deadline: jobData.deadline || new Date().toISOString(),
            createdAt: jobData.createdAt || new Date().toISOString(),
            creatorId: jobData.creatorId || "",
            creatorName: jobData.creatorName || "Anonyme",
            status: jobData.status || "open"
          };
          
          console.log("Données normalisées:", normalizedJob);
          setJob(normalizedJob as Job);
        } else {
          console.log("Aucune offre trouvée avec cet ID");
          setJob(null);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des détails de l\'offre:', error);
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de charger les détails de l\'offre',
          variant: 'destructive',
        });
        setJob(null);
      } finally {
        setLoading(false);
        console.log("Chargement terminé, état :", { loading: false, job: job ? "présent" : "absent" });
      }
    };

    fetchJobDetails();
  }, [id, toast]);

  const handleApply = () => {
    toast({
      title: 'Candidature envoyée',
      description: 'Votre candidature a été envoyée avec succès.',
    });
  };

  console.log("État avant rendu :", { loading, job });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-black/30 border-purple-500/10 p-8">
            <CardContent className="space-y-6 pt-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Offre non trouvée</h1>
              <p className="mb-8 text-gray-300">Cette offre n'existe pas ou a été supprimée.</p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/jobs">Retour aux offres</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isJobCreator = user?.uid === job.creatorId;
  console.log("Affichage des détails de l'offre");

  // Fonction pour formater la date de manière sécurisée
  const formatDate = (dateString: string, formatPattern: string) => {
    try {
      return dateString ? format(new Date(dateString), formatPattern, { locale: fr }) : 'Date non spécifiée';
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return 'Date invalide';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
            <div>
              <Link 
                to="/jobs" 
                className="text-sm text-gray-400 hover:text-purple-400 mb-2 inline-block"
              >
                &larr; Retour aux offres
              </Link>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {job.title}
              </h1>
            </div>
            
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 text-sm rounded-full ${
                job.status === 'open' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {job.status === 'open' ? 'Ouverte' : 'Fermée'}
              </span>
            </div>
          </div>
          
          <p className="text-gray-400">Publiée le {formatDate(job.createdAt, 'dd MMMM yyyy')}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/30 border-purple-500/10">
              <CardHeader>
                <CardTitle>Description du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-line">{job.description}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-black/30 border-purple-500/10">
              <CardHeader>
                <CardTitle>Détails de l'offre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Budget</h3>
                  <p className="font-semibold text-white">{job.budget}€</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Date limite</h3>
                  <p className="text-white">{formatDate(job.deadline, 'dd/MM/yyyy')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Créateur</h3>
                  <p className="text-white">{job.creatorName}</p>
                </div>
              </CardContent>
              <CardFooter>
                {user?.role === 'expert' && job.status === 'open' && !isJobCreator && (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={handleApply}
                  >
                    Postuler à cette offre
                  </Button>
                )}
                
                {isJobCreator && (
                  <Link to="/creator-dashboard" className="w-full">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Gérer mes offres
                    </Button>
                  </Link>
                )}
                
                {user?.role === 'creator' && !isJobCreator && (
                  <p className="text-center text-gray-400 text-sm w-full">
                    Vous pouvez consulter cette offre mais ne pouvez pas y postuler en tant que créateur.
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 