import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Mail, User, Star, Youtube, Film, Music, FileText, Instagram, Twitch, Phone } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Badge } from "@/components/ui/badge";

interface CreatorProfile {
  uid: string;
  displayName?: string;
  name?: string;
  photoURL?: string;
  avatar?: string;
  bio?: string;
  description?: string;
  skills?: string[];
  specialties?: string[];
  role?: string;
  videosPerWeek?: number;
  youtube?: string;
  twitch?: string;
  instagram?: string;
  favoriteNetwork?: string;
  lookingFor?: string;
  joinDate?: string;
  email?: string;
  phone?: string;
  showEmail?: boolean;
  showPhone?: boolean;
}

// Types de contenu supportés
type ContentType = 'youtube' | 'image' | 'audio' | 'text' | 'other';

// Interface pour un élément de contenu
interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string | Date;
}

// Ajoutez interface PortfolioItem et modifiez le code pour traiter les items de contenu
interface PortfolioItem extends ContentItem {
  [key: string]: any;
}

// Fonction d'extraction d'ID de YouTube
const getYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function CreatorPortfolio() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Récupérer le profil du créateur
        const creatorDoc = await getDoc(doc(db, 'users', id));
        
        if (!creatorDoc.exists()) {
          setError("Ce créateur n'existe pas");
          setIsLoading(false);
          return;
        }
        
        const creatorData = creatorDoc.data();
        
        // Vérifier que c'est bien un créateur
        if (creatorData.role !== 'creator' && creatorData.role !== 'influencer') {
          setError("Ce profil n'est pas celui d'un créateur de contenu");
          setIsLoading(false);
          return;
        }
        
        // Normaliser les données
        setCreatorProfile({
          uid: creatorDoc.id,
          displayName: creatorData.displayName || creatorData.name || "Créateur anonyme",
          name: creatorData.name || creatorData.displayName,
          photoURL: creatorData.photoURL || creatorData.avatar,
          avatar: creatorData.avatar || creatorData.photoURL,
          description: creatorData.description || creatorData.bio || "Aucune description disponible",
          bio: creatorData.bio || creatorData.description,
          skills: Array.isArray(creatorData.skills) ? creatorData.skills : 
                 (typeof creatorData.skills === 'string' ? creatorData.skills.split(',').map(s => s.trim()) : []),
          specialties: creatorData.specialties || creatorData.skills || [],
          role: creatorData.role,
          videosPerWeek: creatorData.videosPerWeek,
          youtube: creatorData.youtube || creatorData.socials?.youtube || '',
          twitch: creatorData.twitch || creatorData.socials?.twitch || '',
          instagram: creatorData.instagram || creatorData.socials?.instagram || '',
          favoriteNetwork: creatorData.favoriteNetwork,
          lookingFor: creatorData.lookingFor,
          email: creatorData.email,
          phone: creatorData.phone,
          showEmail: creatorData.showEmail,
          showPhone: creatorData.showPhone,
          joinDate: creatorData.createdAt ? 
                   (typeof creatorData.createdAt === 'string' ? 
                    creatorData.createdAt : 
                    creatorData.createdAt.toDate?.().toISOString().split('T')[0] || 
                    new Date(creatorData.createdAt).toISOString().split('T')[0])
                   : null
        });
        
        // Charger le contenu du créateur depuis Firestore
        try {
          const contentQuery = query(
            collection(db, 'portfolio'),
            where('creatorId', '==', creatorDoc.id)
          );
          
          const contentSnapshot = await getDocs(contentQuery);
          
          if (!contentSnapshot.empty) {
            const contentItems: ContentItem[] = [];
            contentSnapshot.forEach(doc => {
              const data = doc.data();
              contentItems.push({
                id: doc.id,
                type: data.type || 'other',
                title: data.title || 'Sans titre',
                description: data.description,
                url: data.url,
                thumbnailUrl: data.thumbnailUrl,
                createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date()
              });
            });
            setContent(contentItems);
          } else {
            setContent([]);
          }
        } catch (contentError) {
          console.error("Erreur lors du chargement du contenu:", contentError);
          setContent([]);
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les informations. Veuillez réessayer plus tard.");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations du créateur de contenu."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCreatorData();
  }, [id, toast]);
  
  const handleContactCreator = () => {
    if (!id || !creatorProfile) return;
    navigate(`/messages?recipient=${id}&name=${encodeURIComponent(creatorProfile.displayName || 'Créateur')}`);
  };

  // Fonction de rendu pour un élément de contenu selon son type
  const renderContentItem = (item: ContentItem) => {
    switch (item.type) {
      case 'youtube':
        const videoId = getYoutubeVideoId(item.url);
        return (
          <div className="aspect-video rounded-md overflow-hidden bg-black max-h-[240px]">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${videoId}`} 
              title={item.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        );
      
      case 'image':
        return (
          <>
            <img 
              src={item.url} 
              alt={item.title} 
              className="aspect-video rounded-md object-cover cursor-pointer max-h-[200px] transition-transform hover:scale-105"
              loading="lazy"
              onClick={() => setOpenImage(item.url)}
            />
            {openImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
                onClick={() => setOpenImage(null)}
              >
                <img
                  src={openImage}
                  alt="Agrandissement"
                  className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg"
                  onClick={e => e.stopPropagation()}
                />
                <button
                  className="absolute top-8 right-8 text-white text-3xl"
                  onClick={() => setOpenImage(null)}
                >
                  &times;
                </button>
              </div>
            )}
          </>
        );
      
      case 'audio':
        return (
          <div className="bg-purple-900/40 rounded-lg p-4 flex flex-col items-center max-h-[120px]">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Music className="h-5 w-5 text-purple-400" />
              Musique
            </h3>
            <audio controls className="w-full mt-2">
              <source src={item.url} />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <p className="text-gray-300 text-sm mt-2">{item.title}</p>
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
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            <p className="text-gray-400 ml-4">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto py-20">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Erreur</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost"
            className="text-sm text-gray-400 hover:text-purple-400 mb-4 inline-flex items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <div className="relative">
              <h1 className="text-3xl font-bold">
                Informations
              </h1>
            </div>
            
            <div className="flex flex-col items-center mt-8 mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-purple-900/30 border-2 border-purple-500/30">
                {creatorProfile?.photoURL ? (
                  <img 
                    src={creatorProfile.photoURL} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900/50">
                    <User className="h-16 w-16 text-purple-300" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {creatorProfile?.displayName}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-300">0.0</span>
              </div>
              <p className="text-sm text-purple-300 mt-1">Créateur de contenu</p>
              
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Spécialités</h3>
                <div className="flex flex-wrap gap-2">
                  {(creatorProfile?.skills || []).map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {!creatorProfile?.skills?.length && <p className="text-gray-400 text-sm">Aucune spécialité renseignée</p>}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Réseaux sociaux</h3>
                <div className="space-y-2">
                  {creatorProfile?.youtube && (
                    <a 
                      href={creatorProfile.youtube.startsWith('http') ? creatorProfile.youtube : `https://${creatorProfile.youtube}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Youtube className="h-5 w-5 text-red-500" />
                      <span>YouTube</span>
                    </a>
                  )}
                  {creatorProfile?.twitch && (
                    <a 
                      href={creatorProfile.twitch.startsWith('http') ? creatorProfile.twitch : `https://${creatorProfile.twitch}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <Twitch className="h-5 w-5 text-purple-500" />
                      <span>Twitch</span>
                    </a>
                  )}
                  {creatorProfile?.instagram && (
                    <a 
                      href={creatorProfile.instagram.startsWith('http') ? creatorProfile.instagram : `https://${creatorProfile.instagram}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-pink-400 transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {!creatorProfile?.youtube && !creatorProfile?.twitch && !creatorProfile?.instagram && (
                    <p className="text-sm text-gray-500">Aucun réseau social renseigné</p>
                  )}
                </div>
              </div>
            
              <div className="mt-6 space-y-2">
                <h3 className="text-md font-medium">Contact</h3>
                {creatorProfile?.showEmail !== false && creatorProfile?.email && (
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-purple-400" />
                    <a href={`mailto:${creatorProfile.email}`} className="text-white hover:text-purple-300">
                      {creatorProfile.email}
                    </a>
                  </p>
                )}
                {creatorProfile?.showPhone !== false && creatorProfile?.phone && (
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-purple-400" />
                    <a href={`tel:${creatorProfile.phone}`} className="text-white hover:text-purple-300">
                      {creatorProfile.phone}
                    </a>
                  </p>
                )}
                
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-purple-700 to-pink-500 hover:from-purple-800 hover:to-pink-600 text-white"
                  onClick={handleContactCreator}
                >
                  Contacter
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/4">
            <Tabs defaultValue="presentation" className="w-full">
              <TabsList className="flex w-full rounded-lg overflow-hidden bg-purple-900/10 border border-purple-500/20 p-0">
                <TabsTrigger 
                  value="presentation"
                  className="flex-1 rounded-none py-3 text-white data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-purple-900/30 transition-colors"
                >
                  Présentation
                </TabsTrigger>
                <TabsTrigger 
                  value="contenu"
                  className="flex-1 rounded-none py-3 text-white data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-purple-900/30 transition-colors"
                >
                  Contenu
                </TabsTrigger>
                <TabsTrigger 
                  value="specialites"
                  className="flex-1 rounded-none py-3 text-white data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-purple-900/30 transition-colors"
                >
                  Spécialités
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="presentation" className="mt-6">
                <Card className="bg-purple-900/10 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-2xl">Présentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      {creatorProfile?.description || "Aucune description disponible pour ce créateur de contenu."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contenu" className="mt-6">
                <Card className="bg-purple-900/10 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-2xl">Contenu</CardTitle>
                    <CardDescription>
                      Découvrez les dernières créations de {creatorProfile?.displayName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {content.length > 0 ? (
                      <Tabs defaultValue="all">
                        <div className="border-b border-gray-800 mb-6">
                          <TabsList className="bg-transparent">
                            <TabsTrigger value="all" className="data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-400">Tout</TabsTrigger>
                            <TabsTrigger value="videos" className="data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-400">Vidéos</TabsTrigger>
                            <TabsTrigger value="images" className="data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-400">Images</TabsTrigger>
                            <TabsTrigger value="audio" className="data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-400">Audio</TabsTrigger>
                          </TabsList>
                        </div>
                        
                        {/* Affichage de tous les types de contenu */}
                        <TabsContent value="all" className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {content.map(item => (
                              <div key={item.id} className="flex flex-col space-y-2">
                                {renderContentItem(item)}
                                <div>
                                  <h4 className="text-white font-medium">{item.title}</h4>
                                  {item.description && (
                                    <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        {/* Affichage des vidéos */}
                        <TabsContent value="videos">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {content.filter(item => item.type === 'youtube').map(item => (
                              <div key={item.id} className="flex flex-col space-y-2">
                                {renderContentItem(item)}
                                <div>
                                  <h4 className="text-white font-medium">{item.title}</h4>
                                  {item.description && (
                                    <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {content.filter(item => item.type === 'youtube').length === 0 && (
                              <p className="text-gray-400 col-span-2">Aucune vidéo disponible</p>
                            )}
                          </div>
                        </TabsContent>
                        
                        {/* Affichage des images */}
                        <TabsContent value="images">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {content.filter(item => item.type === 'image').map(item => (
                              <div key={item.id} className="flex flex-col space-y-2">
                                {renderContentItem(item)}
                                <div>
                                  <h4 className="text-white font-medium">{item.title}</h4>
                                  {item.description && (
                                    <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {content.filter(item => item.type === 'image').length === 0 && (
                              <p className="text-gray-400 col-span-2">Aucune image disponible</p>
                            )}
                          </div>
                        </TabsContent>
                        
                        {/* Affichage des fichiers audio */}
                        <TabsContent value="audio">
                          <div className="grid grid-cols-1 gap-4">
                            {content.filter(item => item.type === 'audio').map(item => (
                              <div key={item.id} className="flex flex-col space-y-2">
                                {renderContentItem(item)}
                                {item.description && (
                                  <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                                )}
                              </div>
                            ))}
                            {content.filter(item => item.type === 'audio').length === 0 && (
                              <p className="text-gray-400">Aucun fichier audio disponible</p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-center py-12">
                        <Film className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-300">Aucun contenu disponible</h2>
                        <p className="text-gray-500 mt-2">
                          Ce créateur n'a pas encore ajouté de contenu à son portfolio.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specialites" className="mt-6">
                <Card className="bg-purple-900/10 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-2xl">Spécialités</CardTitle>
                    <CardDescription>Les domaines d'expertise du créateur</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(creatorProfile?.skills && creatorProfile.skills.length > 0) ? (
                      <div className="flex flex-wrap gap-2">
                        {creatorProfile.skills.map((skill, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="bg-purple-900/30 text-purple-300 border-purple-500/30 text-base py-2 px-4"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">Aucune spécialité renseignée</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 