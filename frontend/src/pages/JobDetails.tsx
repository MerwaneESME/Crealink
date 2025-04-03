import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { jobsApi } from '@/lib/api';

// Types
interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  status: string;
  creatorId: string;
  createdAt: any;
  skills: string[];
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Remplacer par un appel API réel lorsque le backend sera prêt
        // const response = await jobsApi.getJobById(id);
        // setJob(response.data);
        
        // En attendant l'implémentation de l'API, on simule un délai
        setTimeout(() => {
          setJob(null);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'offre:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = () => {
    if (!currentUser) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour postuler à cette offre.',
        variant: 'destructive',
      });
      return;
    }

    // Ici, nous simulons juste une postulation réussie
    toast({
      title: 'Candidature envoyée',
      description: 'Votre candidature a été envoyée avec succès.',
      variant: 'default',
    });
    
    setApplyModalOpen(false);
    setMessage('');
  };

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Offre non trouvée</h1>
          <p className="mb-8">Cette offre n'existe pas ou a été supprimée.</p>
          <Button asChild>
            <Link to="/jobs">Retour aux offres</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <div>
            <Link 
              to="/jobs" 
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
            >
              &larr; Retour aux offres
            </Link>
            <h1 className="text-3xl font-bold">{job.title}</h1>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Badge className="mb-2 mr-2">{job.status === 'open' ? 'Offre active' : 'Offre fermée'}</Badge>
            <Badge variant="outline">
              {job.category === 'editeur' ? 'Éditeur vidéo' : 
               job.category === 'graphiste' ? 'Graphiste' : 'Développeur'}
            </Badge>
          </div>
        </div>
        
        <p className="text-gray-500">Publiée le {formatDate(job.createdAt.seconds)}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{job.description}</p>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Compétences requises</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'offre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                <p className="font-semibold">{job.budget}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                <p>
                  {job.category === 'editeur' ? 'Éditeur vidéo' : 
                   job.category === 'graphiste' ? 'Graphiste' : 'Développeur'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date de publication</h3>
                <p>{formatDate(job.createdAt.seconds)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                disabled={job.status !== 'open' || job.creatorId === currentUser?.uid}
                onClick={() => setApplyModalOpen(true)}
              >
                {job.creatorId === currentUser?.uid ? 'Votre offre' : 'Postuler à cette offre'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>À propos de l'annonceur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  U
                </div>
                <div>
                  <h3 className="font-medium">Utilisateur</h3>
                  <p className="text-sm text-gray-500">Créateur de contenu</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Voir le profil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 