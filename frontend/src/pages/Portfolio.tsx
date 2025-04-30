import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit2, Trash2, Image, Video, Music, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { portfolioService, Project } from '@/services/portfolioService';
import { storageService, MediaFile } from '@/services/storageService';

export default function Portfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    media: [],
    tags: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Récupérer les projets de l'expert connecté
  const fetchProjects = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const expertProjects = await portfolioService.getExpertProjects(user.uid);
      setProjects(expertProjects);
    } catch (err: any) {
      console.error("Erreur lors du chargement des projets:", err);
      setError("Impossible de charger vos projets. Veuillez réessayer plus tard.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos projets."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsSubmitting(true);
    try {
      const uploadedFiles: MediaFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Construire le chemin de base sans le nom de fichier
          const basePath = `projects/${user?.uid}`;

          // Télécharger le fichier avec le nouveau service
          const mediaFile = await storageService.uploadFile(file, basePath);
          uploadedFiles.push(mediaFile);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: `Erreur lors du téléchargement de ${file.name}: ${error.message}`
          });
          continue;
        }
      }

      if (uploadedFiles.length > 0) {
        // Mettre à jour le projet avec les nouveaux fichiers
        setCurrentProject(prev => ({
          ...prev,
          media: [...(prev.media || []), ...uploadedFiles]
        }));

        toast({
          title: "Fichiers téléchargés",
          description: `${uploadedFiles.length} fichier(s) téléchargé(s) avec succès`
        });
      }
    } catch (error: any) {
      console.error("Erreur lors du téléchargement des fichiers:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du téléchargement des fichiers"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMedia = async (mediaIndex: number) => {
    try {
      const mediaToRemove = currentProject.media?.[mediaIndex];
      if (!mediaToRemove) return;

      // Extraire le chemin du fichier à partir de l'URL
      const urlParts = mediaToRemove.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const path = `projects/${user?.uid}`;

      // Supprimer le fichier du stockage
      await storageService.deleteFile(`${path}/${fileName}`);

      // Mettre à jour le projet
      setCurrentProject(prev => ({
        ...prev,
        media: prev.media?.filter((_, index) => index !== mediaIndex) || []
      }));

      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été supprimé avec succès"
      });
    } catch (error: any) {
      console.error("Erreur lors de la suppression du fichier:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression du fichier"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        title: currentProject.title || '',
        description: currentProject.description || '',
        tags: currentProject.tags || [],
        media: currentProject.media || [],
        expertId: user.uid,
        expertName: user.displayName || 'Anonyme'
      };

      if (currentProject.id) {
        // Mise à jour du projet existant
        await portfolioService.updateProject(currentProject.id, projectData);
        toast({
          title: "Projet mis à jour",
          description: "Votre projet a été mis à jour avec succès"
        });
      } else {
        // Création d'un nouveau projet
        const newProject = await portfolioService.createProject(projectData);
        setCurrentProject(newProject);
        toast({
          title: "Projet créé",
          description: "Votre projet a été créé avec succès"
        });
      }

      // Rafraîchir la liste des projets
      fetchProjects();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde du projet:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la sauvegarde du projet"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return;
    }
    
    try {
      await portfolioService.deleteProject(id);
      setProjects(projects.filter(project => project.id !== id));
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé de votre portfolio."
      });
    } catch (err: any) {
      console.error("Erreur lors de la suppression du projet:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le projet. Veuillez réessayer."
      });
    }
  };

  const handleEdit = (project: Project) => {
    setCurrentProject({
      ...project,
      media: project.media || [],
      tags: project.tags || []
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentProject({
      title: '',
      description: '',
      media: [],
      tags: []
    });
    setIsEditing(false);
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() !== '' && !currentProject.tags?.includes(tagInput.trim())) {
      setCurrentProject({
        ...currentProject,
        tags: [...(currentProject.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setCurrentProject({
      ...currentProject,
      tags: currentProject.tags?.filter(t => t !== tag) || []
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement de votre portfolio...</p>
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
          <Button onClick={fetchProjects}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Mon Portfolio
          </h1>
          <p className="text-gray-400 mt-2">
            Présentez vos projets et mettez en avant votre expertise
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter un projet
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border border-purple-500/20 bg-black/50 text-center py-12">
          <CardContent>
            <p className="text-gray-400">Vous n'avez pas encore de projets dans votre portfolio.</p>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              variant="outline" 
              className="mt-4 border-purple-500/50 text-purple-400 hover:bg-purple-900/20"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter votre premier projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden border border-purple-500/20 bg-black/50 hover:border-purple-500/50 transition-all">
              <div className="relative h-48">
                {project.media && project.media.length > 0 ? (
                  project.media[0].type === 'image' ? (
                    <img 
                      src={project.media[0].url} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : project.media[0].type === 'video' ? (
                    <video 
                      src={project.media[0].url} 
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/20">
                      <Music className="h-12 w-12 text-purple-400" />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900/20">
                    <Image className="h-12 w-12 text-purple-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 bg-black/60 hover:bg-red-900/80 text-white hover:text-red-400"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">{project.description}</p>
                <div className="flex flex-wrap mt-4 gap-2">
                  {project.tags && project.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/90 border border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              {isEditing ? 'Modifier le projet' : 'Ajouter un projet'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Remplissez les informations de votre projet
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Titre du projet</Label>
              <Input 
                id="title" 
                value={currentProject.title} 
                onChange={(e) => setCurrentProject({...currentProject, title: e.target.value})}
                className="bg-black/60 border-purple-500/30 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={currentProject.description} 
                onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})}
                className="bg-black/60 border-purple-500/30 focus:border-purple-500 min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label>Médias</Label>
              <div className="mt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*,audio/*"
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter des médias
                </Button>
              </div>
              
              {currentProject.media && currentProject.media.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {currentProject.media.map((media, index) => (
                    <div key={index} className="relative group">
                      {media.type === 'image' ? (
                        <img 
                          src={media.url} 
                          alt={media.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : media.type === 'video' ? (
                        <video 
                          src={media.url}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-purple-900/20 rounded-lg">
                          <Music className="h-8 w-8 text-purple-400" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-black/60 hover:bg-red-900/80 text-white hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveMedia(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="bg-black/60 border-purple-500/30 focus:border-purple-500"
                  placeholder="Ajouter un tag"
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  className="border-purple-500/30 text-purple-400"
                >
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentProject.tags?.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1 bg-purple-900/30 text-purple-300 text-sm px-2 py-1 rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  isEditing ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}