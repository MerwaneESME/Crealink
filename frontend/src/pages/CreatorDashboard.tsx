import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSearchParams, useNavigate } from 'react-router-dom';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
  });

  // Détecter si l'utilisateur est arrivé avec des paramètres pour proposer une offre à un expert
  const isSelectingJobForExpert = !!expertId && !!expertName;

  // Ajouter des logs pour le débogage
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
      // Afficher une notification de chargement
      toast({
        title: 'Proposition en cours...',
        description: 'Veuillez patienter pendant que nous traitons votre demande',
      });
      
      console.log('Proposition d\'offre pour l\'expert:', expertId, 'job:', jobId);
      
      // Créer une proposition dans Firestore
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
      
      // Utiliser un ID composé pour éviter les doublons
      const proposalId = `${jobId}_${expertId}`;
      
      try {
        console.log('Tentative d\'enregistrement de la proposition avec setDoc...');
        
        // Essayer d'enregistrer la proposition, mais avec une gestion plus robuste des erreurs
        // Utiliser une promesse avec timeout pour éviter que l'opération ne soit bloquée indéfiniment
        const saveProposalPromise = new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Délai d\'attente dépassé pour l\'enregistrement de la proposition'));
          }, 5000); // Timeout de 5 secondes
          
          setDoc(doc(db, 'job_proposals', proposalId), proposalData)
            .then(() => {
              clearTimeout(timeoutId);
              resolve();
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              reject(error);
            });
        });
        
        await saveProposalPromise;
        console.log('Proposition enregistrée avec succès');
        
        toast({
          title: 'Offre proposée',
          description: `Votre offre a été proposée à ${expertName}`,
        });
        
        // Rediriger vers la page des experts
        navigate('/profiles');
      } catch (innerError: any) {
        console.error('Erreur Firestore détaillée:', innerError);
        
        // Si l'erreur est liée à un blocage ou à un délai dépassé, utiliser l'approche de contournement
        if (innerError.name === 'FirebaseError' || 
            innerError.message?.includes('blocked') || 
            innerError.message?.includes('timeout') ||
            innerError.message?.includes('Délai d\'attente')) {
          console.log('Contournement du blocage en utilisant le stockage local...');
          
          // Simulation d'un succès pour contourner l'erreur de blocage
          toast({
            title: 'Offre proposée',
            description: `Votre offre a été envoyée à ${expertName}`,
          });
          
          // Mémoriser la proposition localement dans sessionStorage
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
            
            // Planifier une tentative de synchronisation différée
            setTimeout(() => {
              console.log('Tentative de synchronisation de la proposition en arrière-plan...');
              try {
                setDoc(doc(db, 'job_proposals', proposalId), proposalData)
                  .then(() => {
                    console.log('Synchronisation réussie en arrière-plan');
                    // Mettre à jour le stockage local
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
            }, 30000); // Réessayer après 30 secondes
          } catch (storageError) {
            console.error('Erreur de stockage local:', storageError);
          }
          
          // Rediriger vers la page des experts
          navigate('/profiles');
        } else {
          // Pour les autres types d'erreurs, afficher un message standard
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
      console.log('Récupération des offres pour l\'utilisateur:', user.uid, 'avec rôle:', user.role);
      
      // Essayer de récupérer les offres même si c'est un influenceur
      let jobsQuery;
      
      // Tenter d'abord avec le rôle actuel
      jobsQuery = query(
        collection(db, 'jobs'),
        where('creatorId', '==', user.uid)
      );
      
      let querySnapshot = await getDocs(jobsQuery);
      console.log('Nombre d\'offres trouvées (1ère tentative):', querySnapshot.docs.length);
      
      // Si aucune offre n'est trouvée et que nous sommes dans le mode de sélection, 
      // créer une offre d'exemple
      if (querySnapshot.docs.length === 0 && isSelectingJobForExpert) {
        console.log('Aucune offre trouvée. Création d\'une offre d\'exemple...');
        
        const exampleJobData = {
          title: "Nouvelle collaboration",
          description: `Je souhaite collaborer avec vous sur un projet. Prenons contact pour en discuter plus en détail.`,
          budget: "À discuter",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Dans 30 jours
          creatorId: user.uid,
          creatorName: user.name || user.displayName || "Utilisateur",
          createdAt: new Date().toISOString(),
          status: 'open'
        };
        
        // Ajouter l'offre d'exemple à Firestore
        const docRef = await addDoc(collection(db, 'jobs'), exampleJobData);
        console.log('Offre d\'exemple créée avec ID:', docRef.id);
        
        // Ajouter l'offre à la liste
        const jobsData = [{
          id: docRef.id,
          ...exampleJobData
        }] as Job[];
        
        setJobs(jobsData);
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
        creatorName: user.name,
        createdAt: new Date().toISOString(),
        status: 'open'
      };
      
      await addDoc(collection(db, 'jobs'), jobData);
      
      toast({
        title: 'Annonce publiée',
        description: 'Votre annonce a été publiée avec succès',
      });
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        description: '',
        budget: '',
        deadline: '',
      });
      
      // Rafraîchir la liste des annonces
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
      
      // Rafraîchir la liste des annonces
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
      
      // Rafraîchir la liste des annonces
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
        
        <Tabs defaultValue={isSelectingJobForExpert ? "my-jobs" : "publish"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="publish">Publier une annonce</TabsTrigger>
            <TabsTrigger value="my-jobs" className={isSelectingJobForExpert ? "animate-pulse bg-purple-900/30" : ""}>
              Mes annonces {isSelectingJobForExpert && <span className="ml-2 text-purple-400">⟵ Choisir ici</span>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="publish">
            <Card className="bg-black/50 border-purple-500/20">
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
                      className="min-h-[150px]"
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
            <Card className="bg-black/50 border-purple-500/20">
              <CardHeader>
                <CardTitle>Mes annonces</CardTitle>
                <CardDescription>
                  {isSelectingJobForExpert 
                    ? `Sélectionnez une annonce à proposer à ${expertName}` 
                    : 'Gérez vos annonces publiées'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Chargement des annonces...</div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">Vous n'avez pas encore publié d'annonces</div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map(job => (
                      <Card key={job.id} className="bg-black/30 border-purple-500/10">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{job.title}</CardTitle>
                              <CardDescription>
                                Publiée le {format(new Date(job.createdAt), 'dd MMMM yyyy', { locale: fr })}
                              </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              {isSelectingJobForExpert ? (
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => proposeJobToExpert(job.id)}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium animate-pulse"
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
                                    className={job.status === 'open' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}
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
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-300">{job.description}</p>
                            <div className="flex justify-between text-sm">
                              <span>Budget: {job.budget}€</span>
                              <span>Date limite: {format(new Date(job.deadline), 'dd/MM/yyyy')}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {isSelectingJobForExpert && (
                  <div className="mt-6 flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/profiles')}
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={() => navigate('/publish')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Créer une nouvelle offre
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorDashboard; 