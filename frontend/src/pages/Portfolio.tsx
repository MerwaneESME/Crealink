import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit2, Trash2, Image, Video, Music, Loader2, X, Eye, Plus, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { portfolioService, Project } from '@/services/portfolioService';
import { storageService, MediaFile } from '@/services/storageService';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Youtube } from 'lucide-react';
import { Upload } from 'lucide-react';

// Type de contenu pour le portfolio
type ContentType = 'youtube' | 'image' | 'audio' | 'other';

// Interface pour un élément de contenu
interface PortfolioItem {
  id: string;
  creatorId: string;
  type: ContentType;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

// Fonction pour extraire l'ID YouTube d'une URL
const getYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function Portfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [newContentDialogOpen, setNewContentDialogOpen] = useState(false);
  const [portfolioFormData, setPortfolioFormData] = useState({
    type: 'youtube' as ContentType,
    title: '',
    description: '',
    url: '',
    file: null as File | null
  });

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
      // Format typique : https://storage.googleapis.com/crealinkbucket2/projects/user123/filename.jpg
      const urlParts = mediaToRemove.url.split('/');
      
      // Trouver l'index de 'projects' dans l'URL
      const projectsIndex = urlParts.indexOf('projects');
      if (projectsIndex === -1) {
        console.error("Impossible de trouver le chemin projects dans l'URL:", mediaToRemove.url);
        throw new Error("Format d'URL non reconnu pour le fichier");
      }
      
      // Extraire tous les segments après 'projects'
      const storagePathParts = urlParts.slice(projectsIndex);
      const storagePath = storagePathParts.join('/');
      
      console.log("Chemin de stockage à supprimer:", storagePath);

      // Supprimer le fichier du stockage
      await storageService.deleteFile(storagePath);

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

  // Charger le portfolio de l'utilisateur
  const loadPortfolio = async () => {
    if (!user?.uid) return;
    
    setIsLoadingPortfolio(true);
    try {
      const portfolioQuery = query(
        collection(db, 'portfolio'),
        where('creatorId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(portfolioQuery);
      const items: PortfolioItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          creatorId: data.creatorId,
          type: data.type,
          title: data.title,
          description: data.description,
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      // Trier par date décroissante
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setPortfolioItems(items);
    } catch (error) {
      console.error("Erreur lors du chargement du portfolio:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre portfolio.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, [user]);

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPortfolioFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectType = (value: string) => {
    setPortfolioFormData(prev => ({
      ...prev,
      type: value as ContentType,
      file: null
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPortfolioFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const addPortfolioItem = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const { type, title, description, url, file } = portfolioFormData;
      
      if (!title) {
        throw new Error("Le titre est obligatoire");
      }
      
      let finalUrl = url;
      let thumbnailUrl = '';
      
      // Pour les types nécessitant un upload de fichier
      if ((type === 'image' || type === 'audio') && file) {
        const path = `projects/${user.uid}`;
        finalUrl = (await storageService.uploadFile(file, path)).url;
        
        // Générer une miniature pour les images
        if (type === 'image') {
          thumbnailUrl = finalUrl;
        }
      } else if (type === 'youtube') {
        // Pour YouTube, on vérifie et on formate l'URL
        const videoId = getYoutubeVideoId(url);
        if (!videoId) {
          throw new Error("URL YouTube invalide");
        }
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      
      // Ajouter à Firestore
      const newItem = {
        creatorId: user.uid,
        type,
        title,
        description,
        url: finalUrl,
        thumbnailUrl,
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'portfolio'), newItem);
      
      toast({
        title: "Contenu ajouté",
        description: "Votre contenu a été ajouté à votre portfolio.",
      });
      
      // Réinitialiser le formulaire
      setPortfolioFormData({
        type: 'youtube',
        title: '',
        description: '',
        url: '',
        file: null
      });
      
      // Recharger le portfolio
      loadPortfolio();
      
      // Fermer la boîte de dialogue
      setNewContentDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du contenu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePortfolioItem = async (itemId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'portfolio', itemId));
      
      // Mettre à jour la liste
      setPortfolioItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Contenu supprimé",
        description: "L'élément a été supprimé de votre portfolio.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cet élément.",
        variant: "destructive"
      });
    }
  };

  // Rendu d'un élément du portfolio
  const renderPortfolioItem = (item: PortfolioItem) => {
    switch (item.type) {
      case 'youtube':
        return (
          <div className="relative aspect-video rounded-md overflow-hidden bg-black">
            <iframe 
              width="100%" 
              height="100%" 
              src={item.url} 
              title={item.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        );
      
      case 'image':
        return (
          <div className="rounded-md overflow-hidden">
            <img 
              src={item.url} 
              alt={item.title} 
              className="w-full h-auto object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0MjI1NiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";
              }}
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="rounded-md overflow-hidden bg-purple-900/30 p-3">
            <div className="flex items-center gap-3 mb-2">
              <Music className="h-5 w-5 text-purple-400" />
              <p className="text-white">{item.title}</p>
            </div>
            <audio controls className="w-full">
              <source src={item.url} />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          </div>
        );
      
      default:
        return (
          <div className="rounded-md overflow-hidden bg-purple-900/20 p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-purple-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">{item.title}</h4>
                <p className="text-gray-300 text-sm">{item.description}</p>
                <Button 
                  variant="link" 
                  className="text-purple-400 p-0 h-auto mt-2"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  Consulter
                </Button>
              </div>
            </div>
          </div>
        );
    }
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
            Contenu
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
                <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
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
                <Button
                  variant="outline"
                  className="w-full mt-4 border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir
                </Button>
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

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
        <p className="text-gray-400 mb-6">Découvrez les créations de l'expert</p>

        <div className="flex justify-end mb-6">
          <Dialog open={newContentDialogOpen} onOpenChange={setNewContentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter du contenu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900 border-purple-500/20">
              <DialogHeader>
                <DialogTitle>Ajouter du contenu</DialogTitle>
                <DialogDescription>
                  Ajoutez une vidéo, une image ou un autre type de contenu à votre portfolio.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="contentType">Type de contenu</Label>
                  <Select onValueChange={handleSelectType} defaultValue="youtube">
                    <SelectTrigger className="bg-black/50 border-purple-500/20">
                      <SelectValue placeholder="Sélectionnez un type de contenu" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-purple-500/20">
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-red-500" />
                          <span>Vidéo YouTube</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-blue-500" />
                          <span>Image</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-green-500" />
                          <span>Fichier audio</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-500" />
                          <span>Autre lien</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={portfolioFormData.title}
                    onChange={handlePortfolioChange}
                    placeholder="Titre de votre contenu"
                    className="bg-black/50 border-purple-500/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnelle)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={portfolioFormData.description}
                    onChange={handlePortfolioChange}
                    placeholder="Décrivez votre contenu"
                    className="min-h-[80px] bg-black/50 border-purple-500/20"
                  />
                </div>
                
                {portfolioFormData.type === 'youtube' || portfolioFormData.type === 'other' ? (
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      name="url"
                      value={portfolioFormData.url}
                      onChange={handlePortfolioChange}
                      placeholder={
                        portfolioFormData.type === 'youtube' 
                          ? 'https://www.youtube.com/watch?v=...' 
                          : 'https://...'
                      }
                      className="bg-black/50 border-purple-500/20"
                    />
                    {portfolioFormData.type === 'youtube' && (
                      <p className="text-xs text-gray-400">Collez l'URL d'une vidéo YouTube</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file">Fichier {portfolioFormData.type === 'image' ? 'image' : 'audio'}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        accept={portfolioFormData.type === 'image' ? 'image/*' : 'audio/*'}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-dashed border-purple-500/30 bg-black/30 hover:bg-purple-900/20"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {portfolioFormData.file ? 'Changer de fichier' : 'Choisir un fichier'}
                      </Button>
                    </div>
                    {portfolioFormData.file && (
                      <p className="text-xs text-gray-400">
                        Fichier sélectionné: {portfolioFormData.file.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setNewContentDialogOpen(false)}
                  className="border-purple-500/20"
                >
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={addPortfolioItem}
                  disabled={isLoading}
                >
                  {isLoading ? "Ajout en cours..." : "Ajouter"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingPortfolio ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-400">Chargement du portfolio...</p>
          </div>
        ) : portfolioItems.length === 0 ? (
          <div className="text-center py-12 bg-black/20 rounded-md border border-purple-500/20">
            <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Votre portfolio est vide</h3>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
              Ajoutez vos vidéos YouTube, images, fichiers audio ou autres créations pour les présenter aux experts qui visitent votre profil.
            </p>
            <Button 
              onClick={() => setNewContentDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Ajouter ma première création
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioItems.map((item) => (
              <div key={item.id} className="relative group">
                <Card className="rounded-lg overflow-hidden bg-black/30 border border-purple-500/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/90 border-purple-500/20">
                          <DropdownMenuItem onClick={() => deletePortfolioItem(item.id)} className="text-red-500">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {item.description && (
                      <CardDescription>{item.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderPortfolioItem(item)}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}