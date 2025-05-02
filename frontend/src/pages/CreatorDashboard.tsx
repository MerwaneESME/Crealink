import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { storageService } from '@/services/storageService';

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
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
  });

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('creatorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(jobsQuery);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      
      setJobs(jobsData);
    } catch (error: any) {
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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    try {
      const photoURL = await storageService.uploadProfilePhoto(file, user.uid);
      await updateUserProfile({
        photoURL
      }, user.uid);
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la photo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'creator') {
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
          Tableau de bord créateur
        </h1>
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div 
              className="w-32 h-32 cursor-pointer relative"
              onClick={handlePhotoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePhotoClick();
                }
              }}
              aria-label="Changer la photo de profil"
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={user.photoURL || undefined} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <span className="text-white text-sm">Changer la photo</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePhotoChange}
              aria-label="Sélectionner une photo de profil"
              title="Sélectionner une photo de profil"
            />
          </div>
        </div>

        <Tabs defaultValue="publish" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="publish">Publier une annonce</TabsTrigger>
            <TabsTrigger value="my-jobs">Mes annonces</TabsTrigger>
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
                  Gérez vos annonces publiées
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorDashboard; 