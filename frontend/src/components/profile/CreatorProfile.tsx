import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Youtube, Twitch, Instagram, Plus, Trash, Trash2, Image as ImageIcon, Music, FileText, Upload, Video, Info, Pencil, X, ExternalLink, MoreHorizontal, Star, User as UserIcon, Mail, Phone, Settings } from 'lucide-react';
import { User } from "@/contexts/AuthContext";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { storageService } from "@/services/storageService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

interface CreatorProfileProps {
  user: User;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  onOpenSettings: () => void;
}

// Fonction pour extraire l'ID YouTube d'une URL
const getYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CreatorProfile: React.FC<CreatorProfileProps> = ({ user, fileInputRef, onOpenSettings }) => {
  const { updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteNetwork, setFavoriteNetwork] = useState<'youtube' | 'twitch' | 'instagram' | null>(null);
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
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    description: '',
    youtube: '',
    twitch: '',
    instagram: '',
    publishingFrequency: '',
    challenges: '',
    previousCollaborations: '',
    neededServices: '',
    goals: '',
    skills: [] as string[],
    favoriteNetwork: null as 'youtube' | 'twitch' | 'instagram' | null
  });

  // Charger le portfolio de l'utilisateur
  const loadPortfolio = async () => {
    if (!user?.uid) return;
    
    setIsLoadingPortfolio(true);
    try {
      const portfolioQuery = query(
        collection(db, 'portfolio'),
        where('creatorId', '==', user.uid)
      );
      
      console.log("Chargement du portfolio pour l'utilisateur:", user.uid);
      const querySnapshot = await getDocs(portfolioQuery);
      console.log("Résultats obtenus:", querySnapshot.size);
      
      const items: PortfolioItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Document portfolio:", doc.id, data);
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
      console.log("Items triés:", items);
      setPortfolioItems(items);
    } catch (error) {
      console.error("Erreur détaillée lors du chargement du portfolio:", error);
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
    setFavoriteNetwork(user.favoriteNetwork || null);
    
    setFormData({
      fullName: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      description: user.description || user.bio || '',
      youtube: user.youtube || '',
      twitch: user.twitch || '',
      instagram: user.instagram || '',
      publishingFrequency: user.publishingFrequency || '',
      challenges: user.challenges || '',
      previousCollaborations: user.previousCollaborations || '',
      neededServices: user.neededServices || '',
      goals: user.goals || '',
      skills: Array.isArray(user.skills) ? user.skills : 
              typeof user.skills === 'string' ? user.skills.split(',').map(s => s.trim()) : [],
      favoriteNetwork: user.favoriteNetwork || null
    });
    
    // Charger le portfolio
    loadPortfolio();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      // Réinitialiser le fichier si on change de type
      file: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUserProfile(formData, user.uid);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        // Utiliser le même chemin que pour les experts (projects)
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
        console.log("Rendu d'image:", item.url);
        return (
          <div className="rounded-md overflow-hidden">
            <img 
              src={item.url} 
              alt={item.title} 
              className="w-full h-auto object-cover"
              loading="lazy"
              onError={(e) => {
                console.error("Erreur de chargement d'image:", e);
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <Card className="bg-purple-900/10 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Informations</CardTitle>
                <button 
                  onClick={onOpenSettings}
                  className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700/70 transition-colors"
                  aria-label="Paramètres du profil"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div 
                className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-purple-900/30 border-2 border-purple-500/30 relative group cursor-pointer"
                onClick={() => fileInputRef?.current?.click()}
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900/50">
                    <UserIcon className="h-16 w-16 text-purple-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
              <h2 className="text-xl font-bold text-white">
                {user.useDisplayNameOnly ? user.displayName : user.name || user.displayName}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-300">{user.rating || '0.0'}</span>
              </div>
              <p className="text-sm text-purple-300 mt-1 bg-purple-900/30 px-3 py-1 rounded-full">Créateur de contenu</p>
              
              <div className="mt-6 flex justify-center gap-3">
                {formData.youtube && (
                  <a 
                    href={formData.youtube.startsWith('http') ? formData.youtube : `https://${formData.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <Youtube size={20} />
                  </a>
                )}
                
                {formData.twitch && (
                  <a 
                    href={formData.twitch.startsWith('http') ? formData.twitch : `https://${formData.twitch}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    aria-label="Twitch"
                    title="Twitch"
                  >
                    <Twitch size={20} />
                  </a>
                )}
                
                {formData.instagram && (
                  <a 
                    href={formData.instagram.startsWith('http') ? formData.instagram : `https://${formData.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 text-white hover:from-pink-600 hover:to-yellow-600 transition-colors"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-white">Contact</h3>
                {user.showEmail !== false && user.email && (
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-purple-400" />
                    {user.email}
                  </p>
                )}
                {user.showPhone !== false && user.phone && (
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-purple-400" />
                    {user.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="flex w-full rounded-lg overflow-hidden bg-purple-900/10 border border-purple-500/20 p-0">
              <TabsTrigger 
                value="profile"
                className="flex-1 rounded-none py-3 text-white data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-purple-900/30 transition-colors"
              >
                Informations personnelles
              </TabsTrigger>
              <TabsTrigger 
                value="content"
                className="flex-1 rounded-none py-3 text-white data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-purple-900/30 transition-colors"
              >
                Contenu
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card className="bg-purple-900/10 border-purple-500/20">
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>
                    Gérez vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nom complet</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          disabled={!isEditing || isLoading}
                          className="bg-black/50 border-purple-500/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing || isLoading}
                          className="bg-black/50 border-purple-500/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing || isLoading}
                          className="bg-black/50 border-purple-500/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                        className="min-h-[100px] bg-black/50 border-purple-500/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Compétences</Label>
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <Badge 
                              key={index}
                              className="bg-purple-600 hover:bg-purple-700 cursor-pointer flex items-center gap-1"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  skills: formData.skills.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              {skill}
                              <span className="ml-1">×</span>
                            </Badge>
                          ))}
                          <div className="w-full mt-2">
                            <Input
                              id="newSkill"
                              placeholder="Ajouter une compétence et appuyer sur Entrée"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  const value = input.value.trim();
                                  if (value && !formData.skills.includes(value)) {
                                    setFormData({
                                      ...formData,
                                      skills: [...formData.skills, value]
                                    });
                                    input.value = '';
                                  }
                                }
                              }}
                              disabled={isLoading}
                              className="bg-black/50 border-purple-500/20"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.length > 0 ? (
                            formData.skills.map((skill, index) => (
                              <Badge key={index} className="bg-purple-600">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-400 italic">Aucune compétence renseignée</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      {isEditing ? (
                        <>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                            className="border-purple-500/20"
                            disabled={isLoading}
                          >
                            Annuler
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={isLoading}
                          >
                            {isLoading ? "Enregistrement..." : "Enregistrer"}
                          </Button>
                        </>
                      ) : (
                        <Button 
                          type="button" 
                          onClick={() => setIsEditing(true)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Modifier le profil
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content">
              <Card className="bg-purple-900/10 border-purple-500/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Contenu</CardTitle>
                      <CardDescription className="text-gray-400">
                        Présentez vos créations et votre contenu
                      </CardDescription>
                    </div>
                    
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
                                    <ImageIcon className="h-4 w-4 text-blue-500" />
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
                          
                          {/* Champ URL ou upload selon le type */}
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
                                  id="file"
                                  type="file"
                                  accept={portfolioFormData.type === 'image' ? 'image/*' : 'audio/*'}
                                  onChange={handleFileSelect}
                                  className="hidden"
                                />
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  onClick={() => document.getElementById('file')?.click()}
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
                </CardHeader>
                <CardContent>
                  {isLoadingPortfolio ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-8 h-8 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
                      <p className="ml-3 text-gray-400">Chargement de votre contenu...</p>
                    </div>
                  ) : portfolioItems.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 rounded-md border border-purple-500/20">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Aucun contenu disponible</h3>
                      <p className="text-gray-400 mb-4 max-w-md mx-auto">
                        Vous n'avez pas encore ajouté de contenu à votre portfolio.
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
                          <div className="rounded-lg overflow-hidden bg-black/30 border border-purple-500/20">
                            <div className="p-3 border-b border-purple-500/20 flex justify-between items-center">
                              <h3 className="font-medium text-white">{item.title}</h3>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-black/90 border-purple-500/20">
                                  <DropdownMenuItem onClick={() => deletePortfolioItem(item.id)} className="text-red-400 cursor-pointer">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            {item.description && (
                              <p className="text-sm text-gray-400 px-3 pt-1">{item.description}</p>
                            )}
                            
                            <div className="p-3">
                              {renderPortfolioItem(item)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile; 