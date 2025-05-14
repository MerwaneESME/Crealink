import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Briefcase, Star, FileText, Music, Youtube, Instagram, Twitch, Image as ImageIcon, User as UserIcon, Plus, X, Mail, Phone, Settings, MoreHorizontal, Trash2 } from 'lucide-react';
import { User } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DialogFooter } from "@/components/ui/dialog";
import { storageService } from "@/services/storageService";

interface ExpertProfileProps {
  user: User;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  onOpenSettings: () => void;
}

interface PortfolioItem {
  id: string;
  createdAt?: any;
  [key: string]: any;
}

const ExpertProfile: React.FC<ExpertProfileProps> = ({ user, fileInputRef, onOpenSettings }) => {
  const { updateUserProfile, refreshUser } = useAuth();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    description: user.description || '',
    phone: user.phone || '',
    skills: Array.isArray(user.skills) ? user.skills : [],
    expertise: user.expertise || [],
    experiences: user.experiences || [],
    socials: {
      youtube: user.youtube || '',
      instagram: user.instagram || '',
      linkedin: user.linkedin || '',
      twitter: user.twitter || ''
    }
  });

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [portfolioForm, setPortfolioForm] = useState({
    type: 'youtube' as 'youtube' | 'image' | 'audio' | 'other',
    title: '',
    description: '',
    url: '',
    file: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Préparer les données à sauvegarder
      const dataToSave = {
        ...formData,
        youtube: formData.socials.youtube,
        instagram: formData.socials.instagram,
        twitter: formData.socials.twitter,
        linkedin: formData.socials.linkedin,
        // Ajouter d'autres champs explicites
        displayName: formData.displayName,
        description: formData.description,
        bio: formData.description, // Ajouter bio pour compatibilité
        skills: formData.skills,
        phone: formData.phone,
        updatedAt: new Date().toISOString()
      };
      
      await updateUserProfile(dataToSave);
      // Forcer un rafraîchissement complet des données
      await refreshUser();
      
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
        variant: "default",
      });
      setEditing(false);
      
      // Ajouter un petit délai puis recharger la page pour afficher les changements
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      });
      console.error("Erreur lors de la mise à jour du profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfolio = async () => {
    if (!user?.uid) return;
    
    setIsLoadingPortfolio(true);
    try {
      const portfolioQuery = query(
        collection(db, 'portfolio'),
        where('creatorId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(portfolioQuery);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];
      
      items.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      });
      setPortfolioItems(items);
    } catch (error) {
      console.error("Erreur lors du chargement du portfolio:", error);
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    setFormData({
      displayName: user.displayName || '',
      description: user.description || '',
      phone: user.phone || '',
      skills: Array.isArray(user.skills) ? user.skills : [],
      expertise: user.expertise || [],
      experiences: user.experiences || [],
      socials: {
        youtube: user.youtube || '',
        instagram: user.instagram || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || ''
      }
    });
    
    loadPortfolio();
  }, [user]);

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

  const handleAddSkill = (skill: string) => {
    if (!skill.trim() || formData.skills.includes(skill.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skill.trim()]
    }));
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handlePortfolioInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPortfolioForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectContentType = (value: string) => {
    setPortfolioForm(prev => ({
      ...prev,
      type: value as 'youtube' | 'image' | 'audio' | 'other',
      file: null
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPortfolioForm(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const getYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddPortfolioItem = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const { type, title, description, url, file } = portfolioForm;
      
      if (!title) {
        throw new Error("Le titre est obligatoire");
      }
      
      let finalUrl = url;
      let thumbnailUrl = '';
      
      if ((type === 'image' || type === 'audio') && file) {
        const path = `projects/${user.uid}`;
        finalUrl = (await storageService.uploadFile(file, path)).url;
        
        if (type === 'image') {
          thumbnailUrl = finalUrl;
        }
      } else if (type === 'youtube') {
        const videoId = getYoutubeVideoId(url);
        if (!videoId) {
          throw new Error("URL YouTube invalide");
        }
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      
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
        description: "Votre contenu a été ajouté avec succès.",
        variant: "default",
      });
      setPortfolioForm({
        type: 'youtube',
        title: '',
        description: '',
        url: '',
        file: null
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du contenu.",
        variant: "destructive",
      });
      console.error("Erreur lors de l'ajout du contenu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePortfolioItem = async (id: string) => {
    setIsLoading(true);
    try {
      await updateUserProfile({
        id: id,
        deleted: true
      });
      await refreshUser();
      
      toast({
        title: "Contenu supprimé",
        description: "Votre contenu a été supprimé avec succès.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du contenu.",
        variant: "destructive",
      });
      console.error("Erreur lors de la suppression du contenu:", error);
    } finally {
      setIsLoading(false);
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
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-purple-900/30 border-2 border-purple-500/30">
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
              </div>
              <h2 className="text-xl font-bold text-white">
                {user?.useDisplayNameOnly ? user.displayName : user.name || user.displayName}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-300">{user.rating || '0.0'}</span>
              </div>
              <p className="text-sm text-purple-300 mt-1 bg-purple-900/30 px-3 py-1 rounded-full">Expert</p>
              
              <div className="mt-6 flex justify-center gap-3">
                {formData.socials.youtube && (
                  <a 
                    href={formData.socials.youtube.startsWith('http') ? formData.socials.youtube : `https://${formData.socials.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <Youtube size={20} />
                  </a>
                )}
                
                {formData.socials.instagram && (
                  <a 
                    href={formData.socials.instagram.startsWith('http') ? formData.socials.instagram : `https://${formData.socials.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 text-white hover:from-pink-600 hover:to-yellow-600 transition-colors"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                )}
                
                {formData.socials.twitter && (
                  <a 
                    href={formData.socials.twitter.startsWith('http') ? formData.socials.twitter : `https://${formData.socials.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    aria-label="Twitter"
                    title="Twitter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </a>
                )}
                
                {formData.socials.linkedin && (
                  <a 
                    href={formData.socials.linkedin.startsWith('http') ? formData.socials.linkedin : `https://${formData.socials.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                )}
              </div>
              
              <div className="mt-6 space-y-2">
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
                Profil
              </TabsTrigger>
              <TabsTrigger 
                value="skills"
                className="flex-1 rounded-none py-3 text-white data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-purple-900/30 transition-colors"
              >
                Compétences
              </TabsTrigger>
              <TabsTrigger 
                value="portfolio"
                className="flex-1 rounded-none py-3 text-white data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-purple-900/30 transition-colors"
              >
                Portfolio
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card className="bg-purple-900/10 border-purple-500/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">À propos</CardTitle>
                    {!editing ? (
                      <Button onClick={() => setEditing(true)} className="bg-purple-600 hover:bg-purple-700">Modifier</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditing(false)} className="border-purple-500/20">Annuler</Button>
                        <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                          {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!editing ? (
                    <p className="text-gray-300 whitespace-pre-line">{formData.description || 'Aucune description renseignée'}</p>
                  ) : (
                    <Textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      placeholder="Parlez de vous, de vos compétences..."
                      className="min-h-[150px] bg-black/50 border-purple-500/20 text-white"
                    />
                  )}
                  {editing && (
                    <div className="space-y-4 mt-4">
                      <h3 className="text-sm font-medium text-white">Réseaux sociaux</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="youtube" className="text-white">YouTube</Label>
                          <Input
                            id="youtube"
                            value={formData.socials.youtube}
                            onChange={(e) => setFormData({
                              ...formData,
                              socials: {
                                ...formData.socials,
                                youtube: e.target.value
                              }
                            })}
                            placeholder="Lien YouTube"
                            className="bg-black/50 border-purple-500/20 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="instagram" className="text-white">Instagram</Label>
                          <Input
                            id="instagram"
                            value={formData.socials.instagram}
                            onChange={(e) => setFormData({
                              ...formData,
                              socials: {
                                ...formData.socials,
                                instagram: e.target.value
                              }
                            })}
                            placeholder="Lien Instagram"
                            className="bg-black/50 border-purple-500/20 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="twitter" className="text-white">Twitter</Label>
                          <Input
                            id="twitter"
                            value={formData.socials.twitter}
                            onChange={(e) => setFormData({
                              ...formData,
                              socials: {
                                ...formData.socials,
                                twitter: e.target.value
                              }
                            })}
                            placeholder="Lien Twitter"
                            className="bg-black/50 border-purple-500/20 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={formData.socials.linkedin}
                            onChange={(e) => setFormData({
                              ...formData,
                              socials: {
                                ...formData.socials,
                                linkedin: e.target.value
                              }
                            })}
                            placeholder="Lien LinkedIn"
                            className="bg-black/50 border-purple-500/20 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="skills" className="mt-6">
              <Card className="bg-purple-900/10 border-purple-500/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Compétences</CardTitle>
                    {!editing ? (
                      <Button onClick={() => setEditing(true)} className="bg-purple-600 hover:bg-purple-700">Modifier</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditing(false)} className="border-purple-500/20">Annuler</Button>
                        <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                          {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge 
                            key={index}
                            className="bg-purple-600 hover:bg-purple-700 cursor-pointer flex items-center gap-1"
                            onClick={() => handleRemoveSkill(index)}
                          >
                            {skill}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <Label htmlFor="newSkill" className="text-white mb-2 block">Ajouter une compétence</Label>
                        <div className="flex gap-2">
                          <Input
                            id="newSkill"
                            placeholder="ex: Montage vidéo, Photoshop, etc."
                            className="bg-black/50 border-purple-500/20 text-white"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                handleAddSkill(input.value);
                                input.value = '';
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => {
                              const input = document.getElementById('newSkill') as HTMLInputElement;
                              if (input) {
                                handleAddSkill(input.value);
                                input.value = '';
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">Appuyez sur Entrée ou sur le bouton + pour ajouter une compétence</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {formData.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <Badge 
                              key={index}
                              className="bg-purple-900/30 text-purple-300 hover:bg-purple-800/50 border-none"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-black/20 rounded-md border border-purple-500/20">
                          <p className="text-gray-400">Aucune compétence renseignée</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="portfolio" className="mt-6">
              <Card className="bg-purple-900/10 border-purple-500/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Portfolio</CardTitle>
                      <CardDescription className="text-gray-400">
                        Découvrez les créations de l'expert
                      </CardDescription>
                    </div>
                    
                    {user && user.uid === user.uid && (
                      <Dialog>
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
                              <Select onValueChange={handleSelectContentType} defaultValue="youtube">
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
                                value={portfolioForm.title}
                                onChange={handlePortfolioInputChange}
                                placeholder="Titre de votre contenu"
                                className="bg-black/50 border-purple-500/20"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="description">Description (optionnelle)</Label>
                              <Textarea
                                id="description"
                                name="description"
                                value={portfolioForm.description}
                                onChange={handlePortfolioInputChange}
                                placeholder="Décrivez votre contenu"
                                className="min-h-[80px] bg-black/50 border-purple-500/20"
                              />
                            </div>
                            
                            {portfolioForm.type === 'youtube' || portfolioForm.type === 'other' ? (
                              <div className="space-y-2">
                                <Label htmlFor="url">URL</Label>
                                <Input
                                  id="url"
                                  name="url"
                                  value={portfolioForm.url}
                                  onChange={handlePortfolioInputChange}
                                  placeholder={
                                    portfolioForm.type === 'youtube' 
                                      ? 'https://www.youtube.com/watch?v=...' 
                                      : 'https://...'
                                  }
                                  className="bg-black/50 border-purple-500/20"
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor="file">Fichier {portfolioForm.type === 'image' ? 'image' : 'audio'}</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    ref={fileInputRef}
                                    id="file"
                                    type="file"
                                    accept={portfolioForm.type === 'image' ? 'image/*' : 'audio/*'}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                  />
                                  <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={() => fileInputRef?.current?.click()}
                                    className="w-full border-dashed border-purple-500/30 bg-black/30 hover:bg-purple-900/20"
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {portfolioForm.file ? 'Changer de fichier' : 'Choisir un fichier'}
                                  </Button>
                                </div>
                                {portfolioForm.file && (
                                  <p className="text-xs text-gray-400">
                                    Fichier sélectionné: {portfolioForm.file.name}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => document.querySelector<HTMLButtonElement>('button[data-state="open"].dialog-close')?.click()}
                              className="border-purple-500/20"
                            >
                              Annuler
                            </Button>
                            <Button 
                              type="button" 
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={handleAddPortfolioItem}
                              disabled={isLoading}
                            >
                              {isLoading ? "Ajout en cours..." : "Ajouter"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingPortfolio ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-8 h-8 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
                      <p className="ml-3 text-gray-400">Chargement du portfolio...</p>
                    </div>
                  ) : portfolioItems.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 rounded-md border border-purple-500/20">
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Aucun contenu disponible</h3>
                      <p className="text-gray-400 mb-4 max-w-md mx-auto">
                        {user && user.uid === user.uid ? 
                          "Vous n'avez pas encore ajouté de contenu à votre portfolio." : 
                          "Cet expert n'a pas encore ajouté de contenu à son portfolio."
                        }
                      </p>
                      {user && user.uid === user.uid && (
                        <Button 
                          onClick={() => document.querySelector<HTMLButtonElement>('button[data-state="closed"].dialog-trigger')?.click()}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Ajouter ma première création
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {portfolioItems.map((item) => (
                        <div key={item.id} className="relative group">
                          <div className="rounded-lg overflow-hidden bg-black/30 border border-purple-500/20">
                            <div className="p-3 border-b border-purple-500/20 flex justify-between items-center">
                              <h3 className="font-medium text-white">{item.title}</h3>
                              
                              {user && user.uid === user.uid && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-black/90 border-purple-500/20">
                                    <DropdownMenuItem onClick={() => handleDeletePortfolioItem(item.id)} className="text-red-400 cursor-pointer">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
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

export default ExpertProfile; 