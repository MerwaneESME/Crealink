import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expertId = searchParams.get('expertId');
  const expertName = searchParams.get('expertName');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
  });

  // Détecter si l'utilisateur est arrivé avec des paramètres pour proposer une offre à un expert
  const isSelectingJobForExpert = !!expertId && !!expertName;

  useEffect(() => {
    if (isSelectingJobForExpert) {
      console.log('Mode sélection d\'offre pour expert:', { expertId, expertName });
      // Force l'onglet "Mes offres" à être actif
      const myJobsTab = document.querySelector('[data-state="inactive"][data-value="my-jobs"]') as HTMLElement;
      if (myJobsTab) {
        console.log('Activation de l\'onglet Mes offres');
        myJobsTab.click();
      }
    }
  }, [expertId, expertName, isSelectingJobForExpert]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  // Fonction pour proposer une offre à un expert
  const proposeJobToExpert = async (jobId: string) => {
    if (!user || !expertId) return;
    
    try {
      toast({
        title: 'Proposition en cours...',
        description: 'Veuillez patienter pendant que nous traitons votre demande',
      });
      
      console.log('Proposition d\'offre pour l\'expert:', expertId, 'job:', jobId);
      
      const proposalData = {
        jobId,
        expertId,
        creatorId: user.uid,
        creatorName: user.name || user.displayName || 'Utilisateur',
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        title: jobs.find(job => job.id === jobId)?.title || "Sans titre"
      };
      
      const proposalId = `${jobId}_${expertId}`;
      
      try {
        await setDoc(doc(db, 'job_proposals', proposalId), proposalData);
        
        toast({
          title: 'Proposition envoyée',
          description: 'Votre offre a été proposée avec succès',
        });
        
        navigate('/profiles');
      } catch (innerError: any) {
        console.error('Erreur lors de la sauvegarde de la proposition:', innerError);
        
        if (innerError.code === 'unavailable') {
          console.log('Tentative de sauvegarde locale...');
          try {
            const localProposals = JSON.parse(sessionStorage.getItem('pendingProposals') || '[]');
            localProposals.push({
              ...proposalData,
              id: proposalId,
              expertName,
              syncPending: true,
              syncAttempts: 0,
              lastSyncAttempt: new Date().toISOString()
            });
            sessionStorage.setItem('pendingProposals', JSON.stringify(localProposals));
            console.log('Proposition sauvegardée localement:', proposalId);
            
            setTimeout(() => {
              console.log('Tentative de synchronisation de la proposition en arrière-plan...');
              try {
                setDoc(doc(db, 'job_proposals', proposalId), proposalData)
                  .then(() => {
                    console.log('Synchronisation réussie en arrière-plan');
                    const storedProposals = JSON.parse(sessionStorage.getItem('pendingProposals') || '[]');
                    const updatedProposals = storedProposals.filter((p: any) => p.id !== proposalId);
                    sessionStorage.setItem('pendingProposals', JSON.stringify(updatedProposals));
                  })
                  .catch(err => {
                    console.log('Échec de la synchronisation en arrière-plan:', err);
                  });
              } catch (syncError) {
                console.error('Erreur lors de la tentative de synchronisation:', syncError);
              }
            }, 30000);
            
            navigate('/profiles');
          } catch (storageError) {
            console.error('Erreur de stockage local:', storageError);
            throw innerError;
          }
        } else {
          throw innerError;
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la proposition de l\'offre:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la proposition de l\'offre',
        variant: 'destructive',
      });
    }
  };

  const fetchJobs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Récupération des offres pour l\'utilisateur:', user.uid);
      
      let jobsQuery = query(
        collection(db, 'jobs'),
        where('creatorId', '==', user.uid)
      );
      
      let querySnapshot = await getDocs(jobsQuery);
      console.log('Nombre d\'offres trouvées:', querySnapshot.docs.length);
      
      if (querySnapshot.docs.length === 0 && isSelectingJobForExpert) {
        console.log('Aucune offre trouvée. Création d\'une offre d\'exemple...');
        
        const exampleJobData = {
          title: "Nouvelle collaboration",
          description: `Je souhaite collaborer avec vous sur un projet. Prenons contact pour en discuter plus en détail.`,
          budget: "À discuter",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          creatorId: user.uid,
          creatorName: user.name || user.displayName || "Utilisateur",
          createdAt: new Date().toISOString(),
          status: 'open'
        };
        
        const docRef = await addDoc(collection(db, 'jobs'), exampleJobData);
        console.log('Offre d\'exemple créée avec ID:', docRef.id);
        
        const jobsData = [{
          id: docRef.id,
          ...exampleJobData
        }] as Job[];
        
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setIsLoading(false);
        return;
      }
      
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      
      console.log('Données des offres:', jobsData);
      
      const sortedJobs = [...jobsData].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la récupération des annonces',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = jobs;
    
    // Filtre par terme de recherche
    if (searchTerm) {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(normalizedSearchTerm) || 
        job.description.toLowerCase().includes(normalizedSearchTerm)
      );
    }
    
    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }
    
    setFilteredJobs(filtered);
  }, [searchTerm, filterStatus, jobs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const jobData = {
        ...formData,
        creatorId: user.uid,
        creatorName: user.name || user.displayName || 'Utilisateur',
        createdAt: new Date().toISOString(),
        status: 'open'
      };
      
      await addDoc(collection(db, 'jobs'), jobData);
      
      toast({
        title: 'Annonce publiée',
        description: 'Votre annonce a été publiée avec succès',
      });
      
      setFormData({
        title: '',
        description: '',
        budget: '',
        deadline: '',
      });
      
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la publication de l\'annonce',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      
      toast({
        title: 'Annonce supprimée',
        description: 'L\'annonce a été supprimée avec succès',
      });
      
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la suppression de l\'annonce',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: 'open' | 'closed') => {
    if (!user) return;
    
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      await updateDoc(doc(db, 'jobs', jobId), { status: newStatus });
      
      toast({
        title: 'Statut mis à jour',
        description: `L'annonce est maintenant ${newStatus === 'open' ? 'ouverte' : 'fermée'}`,
      });
      
      fetchJobs();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la mise à jour du statut',
        variant: 'destructive',
      });
    }
  };

  if (!user || (user.role !== 'creator' && user.role !== 'influencer')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-black/50 border-purple-500/20">
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
              <CardDescription>
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {isSelectingJobForExpert ? 'Sélection d\'une offre' : 'Tableau de bord créateur'}
        </h1>
        
        {isSelectingJobForExpert && (
          <Card className="mb-6 bg-purple-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle>Sélection d'une offre pour {expertName}</CardTitle>
              <CardDescription>
                Choisissez l'une de vos offres ci-dessous pour la proposer à cet expert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-300">
                  {jobs.length === 0 
                    ? "Vous n'avez pas encore d'offres. Veuillez en créer une nouvelle." 
                    : "Cliquez sur le bouton 'Proposer' à côté de l'offre que vous souhaitez proposer."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profiles')}
                  className="self-start"
                >
                  Retour aux profils
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/50 border-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={`${filterStatus === 'all' ? 'bg-purple-900/40 text-white' : 'bg-black/50 border-purple-500/20'} hover:bg-purple-900/30`}
              >
                Toutes
              </Button>
              <Button 
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('open')}
                className={`${filterStatus === 'open' ? 'bg-purple-900/40 text-white' : 'bg-black/50 border-purple-500/20'} hover:bg-purple-900/30`}
              >
                Ouvertes
              </Button>
              <Button 
                variant={filterStatus === 'closed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('closed')}
                className={`${filterStatus === 'closed' ? 'bg-purple-900/40 text-white' : 'bg-black/50 border-purple-500/20'} hover:bg-purple-900/30`}
              >
                Fermées
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={isSelectingJobForExpert ? "my-jobs" : "publish"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-purple-900/10 border border-purple-500/20 p-1">
            <TabsTrigger 
              value="publish" 
              className="data-[state=active]:bg-purple-900/40 data-[state=active]:text-white"
            >
              Publier une annonce
            </TabsTrigger>
            <TabsTrigger 
              value="my-jobs" 
              className={`data-[state=active]:bg-purple-900/40 data-[state=active]:text-white ${
                isSelectingJobForExpert ? "animate-pulse bg-purple-900/30" : ""
              }`}
            >
              Mes annonces {isSelectingJobForExpert && <span className="ml-2 text-purple-400">⟵ Choisir ici</span>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="publish">
            <Card className="bg-purple-900/10 border-purple-500/20">
              <CardHeader>
                <CardTitle>Publier une annonce</CardTitle>
                <CardDescription>
                  Créez une nouvelle annonce pour trouver des experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de l'annonce</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Recherche expert en montage vidéo"
                      required
                      disabled={isSubmitting}
                      className="bg-black/50 border-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet et vos besoins"
                      required
                      className="min-h-[150px] bg-black/50 border-purple-500/20 focus:border-purple-500"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (€)</Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="text"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="Ex: 500"
                        required
                        disabled={isSubmitting}
                        className="bg-black/50 border-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Date limite</Label>
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        className="bg-black/50 border-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="my-jobs">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p>Chargement des annonces...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16">
                <Card className="max-w-md mx-auto bg-purple-900/10 border-purple-500/20">
                  <CardContent className="pt-6 pb-6">
                    <h3 className="text-xl font-semibold mb-2">Aucune offre disponible</h3>
                    <p className="text-gray-400 mb-6">
                      {searchTerm || filterStatus !== 'all'
                        ? "Aucune offre ne correspond à votre recherche."
                        : "Vous n'avez pas encore publié d'annonces."}
                    </p>
                    {!isSelectingJobForExpert && (
                      <Button 
                        onClick={() => {
                          const publishTab = document.querySelector('[data-state="inactive"][data-value="publish"]') as HTMLElement;
                          if (publishTab) publishTab.click();
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Créer une annonce
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                  <Card
                    key={job.id}
                    className="bg-purple-900/10 border-purple-500/20 hover:border-purple-500/40 flex flex-col"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold line-clamp-1">{job.title}</CardTitle>
                      <CardDescription className="text-gray-400 text-xs">
                        Publiée le {format(new Date(job.createdAt), 'dd MMMM yyyy', { locale: fr })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">{job.description}</p>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Budget: {job.budget}€</span>
                        <span>Échéance: {format(new Date(job.deadline), 'dd/MM/yyyy')}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-purple-500/20 flex justify-between gap-2">
                      {isSelectingJobForExpert ? (
                        <Button 
                          variant="default" 
                          onClick={() => proposeJobToExpert(job.id)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          disabled={job.status !== 'open'}
                        >
                          {job.status === 'open' ? (
                            <>
                              Proposer
                              <span className="ml-1">→</span>
                            </>
                          ) : 'Fermée'}
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(job.id, job.status)}
                            className={`flex-1 ${
                              job.status === 'open' 
                                ? 'text-green-500 border-green-500/20' 
                                : 'text-red-500 border-red-500/20'
                            }`}
                          >
                            {job.status === 'open' ? 'Ouverte' : 'Fermée'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-500 border-red-500/20"
                          >
                            Supprimer
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorDashboard; 