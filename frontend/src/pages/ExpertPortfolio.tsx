import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Mail, Briefcase, Music, Image as ImageIcon, Eye, User, Calendar, Award, Star, Settings, Phone, Youtube, Instagram, FileText } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Badge } from "@/components/ui/badge";

interface ExpertProfile {
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
  email?: string;
  phone?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  experience?: string;
  education?: string;
  location?: string;
  joinDate?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
}

interface PortfolioItem {
  id: string;
  createdAt?: any;
  [key: string]: any;
}

export default function ExpertPortfolio() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [expertProfile, setExpertProfile] = useState<ExpertProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpertData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Récupérer le profil de l'expert
        const expertDoc = await getDoc(doc(db, 'users', id));
        
        if (!expertDoc.exists()) {
          setError("Cet expert n'existe pas");
          setIsLoading(false);
          return;
        }
        
        const expertData = expertDoc.data();
        console.log("Données brutes de l'expert:", expertData);
        
        // Vérifier que c'est bien un expert
        if (expertData.role !== 'expert') {
          setError("Ce profil n'est pas celui d'un expert");
          setIsLoading(false);
          return;
        }
        
        // Normaliser les données pour gérer les différents formats possibles
        setExpertProfile({
          uid: expertDoc.id,
          displayName: expertData.displayName || expertData.name || "Expert anonyme",
          name: expertData.name || expertData.displayName,
          photoURL: expertData.photoURL || expertData.avatar,
          avatar: expertData.avatar || expertData.photoURL,
          bio: expertData.bio || expertData.description || "Aucune biographie disponible",
          description: expertData.description || expertData.bio || "Aucune description disponible",
          skills: Array.isArray(expertData.skills) ? expertData.skills : 
                 (typeof expertData.skills === 'string' ? expertData.skills.split(',').map(s => s.trim()) : []),
          specialties: expertData.specialties || expertData.skills || [],
          role: expertData.role,
          email: expertData.email,
          phone: expertData.phone,
          showEmail: expertData.showEmail,
          showPhone: expertData.showPhone,
          experience: expertData.experience,
          education: expertData.education,
          location: expertData.location || expertData.address,
          joinDate: expertData.createdAt ? 
                   (typeof expertData.createdAt === 'string' ? 
                    expertData.createdAt : 
                    expertData.createdAt.toDate?.().toISOString().split('T')[0] || 
                    new Date(expertData.createdAt).toISOString().split('T')[0])
                   : null,
          instagram: expertData.instagram || expertData.socials?.instagram || '',
          youtube: expertData.youtube || expertData.socials?.youtube || '',
          twitter: expertData.twitter || expertData.socials?.twitter || '',
          linkedin: expertData.linkedin || expertData.socials?.linkedin || ''
        });
        
        // Récupérer le portfolio de l'expert
        try {
          const portfolioQuery = query(
            collection(db, 'portfolio'),
            where('creatorId', '==', id)
          );
          
          const querySnapshot = await getDocs(portfolioQuery);
          const items: PortfolioItem[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          items.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return (b.createdAt as any).toDate().getTime() - (a.createdAt as any).toDate().getTime();
          });
          setPortfolioItems(items);
        } catch (portfolioError) {
          console.error("Erreur lors du chargement du portfolio:", portfolioError);
          setPortfolioItems([]);
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les informations. Veuillez réessayer plus tard.");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations de l'expert."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExpertData();
  }, [id, toast]);
  
  const handleContactExpert = () => {
    if (!id || !expertProfile) return;
    navigate(`/messages?recipient=${id}&name=${encodeURIComponent(expertProfile.displayName || 'Expert')}`);
  };

  const renderPortfolioItem = (item: PortfolioItem) => {
    switch (item.type) {
      case 'youtube':
        return (
          <div className="aspect-video rounded-md overflow-hidden bg-black max-h-[240px]">
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
          <>
            <img
              src={item.url}
              alt={item.title}
              className="aspect-video rounded-md object-cover cursor-pointer max-h-[200px] transition-transform hover:scale-105"
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
          <div className="bg-purple-900/40 rounded-lg p-4 flex flex-col items-center">
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
      <div className="min-h-screen bg-black pt-24">
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
      <div className="min-h-screen bg-black pt-24">
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
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <div className="relative">
              <h1 className="text-3xl font-bold">
                Informations
              </h1>
            </div>
            
            <div className="flex flex-col items-center mt-8 mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-purple-900/30 border-2 border-purple-500/30">
                {expertProfile?.photoURL ? (
                  <img 
                    src={expertProfile.photoURL} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                    />
                  ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900/50">
                      <User className="h-16 w-16 text-purple-300" />
                    </div>
                  )}
                </div>
              <h2 className="text-xl font-bold text-white">
                {expertProfile?.displayName}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-300">0.0</span>
              </div>
              <p className="text-sm text-purple-300 mt-1 bg-purple-900/30 px-3 py-1 rounded-full">Expert</p>
              
              <div className="mt-6 flex justify-center gap-3">
                {expertProfile?.youtube && (
                  <a 
                    href={expertProfile.youtube.startsWith('http') ? expertProfile.youtube : `https://${expertProfile.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <Youtube size={20} />
                  </a>
                )}
                
                {expertProfile?.instagram && (
                  <a 
                    href={expertProfile.instagram.startsWith('http') ? expertProfile.instagram : `https://${expertProfile.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 text-white hover:from-pink-600 hover:to-yellow-600 transition-colors"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                )}
                
                {expertProfile?.twitter && (
                  <a 
                    href={expertProfile.twitter.startsWith('http') ? expertProfile.twitter : `https://${expertProfile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    aria-label="Twitter"
                    title="Twitter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </a>
                )}
                
                {expertProfile?.linkedin && (
                  <a 
                    href={expertProfile.linkedin.startsWith('http') ? expertProfile.linkedin : `https://${expertProfile.linkedin}`}
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
                {expertProfile?.showEmail !== false && expertProfile?.email && (
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-purple-400" />
                    <a href={`mailto:${expertProfile.email}`} className="text-white hover:text-purple-300">
                      {expertProfile.email}
                    </a>
                  </p>
                )}
                {expertProfile?.showPhone !== false && expertProfile?.phone && (
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-purple-400" />
                    <a href={`tel:${expertProfile.phone}`} className="text-white hover:text-purple-300">
                      {expertProfile.phone}
                    </a>
                  </p>
                )}
                
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-purple-700 to-pink-500 hover:from-purple-800 hover:to-pink-600 text-white"
                  onClick={handleContactExpert}
                >
                  Contacter
                </Button>
              </div>
            </div>
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
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-2xl">À propos</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-lg font-semibold text-purple-300 mb-2">
                        <span className="inline-block w-6 text-center">🎬</span>
                        <p>{expertProfile?.displayName} | Monteur Vidéo & Motion Designer</p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-300 mb-4">
                        <span className="inline-block w-6 text-center">🚀</span>
                        <p>Créateur d'émotions à travers l'image</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 whitespace-pre-line">
                      {expertProfile?.description}
                    </p>

                    {/* Mon expertise */}
                    <div className="mt-10">
                      <h3 className="flex items-center text-lg font-semibold mb-4 text-white">
                        <span className="inline-block w-6 text-center mr-2 text-purple-400">💠</span>
                        Mon expertise :
                      </h3>
                      <div className="pl-8 space-y-2 text-gray-300">
                        <p>✓ Montage (Adobe Premiere Pro, DaVinci Resolve)</p>
                        <p>✓ Motion Design (After Effects)</p>
                        <p>✓ Étalonnage & Sound Design</p>
                        <p>✓ Formats : Court-métrage, documentaire, corporate, YouTube</p>
                      </div>
                    </div>

                    {/* Mon parcours */}
                    <div className="mt-10">
                      <h3 className="flex items-center text-lg font-semibold mb-4 text-white">
                        <span className="inline-block w-6 text-center mr-2 text-purple-400">👨‍💼</span>
                        Mon parcours :
                      </h3>
                      <div className="pl-8 space-y-2 text-gray-300">
                        <p>Assistant monteur – Studio Lumière (2019 – 2021) → Participation à des projets télévisuels et publicitaires.</p>
                        <p>Formation : BTS Audiovisuel, option Montage (Lyon, 2018)</p>
                      </div>
                    </div>

                    {/* Ce que je recherche */}
                    <div className="mt-10">
                      <h3 className="flex items-center text-lg font-semibold mb-4 text-white">
                        <span className="inline-block w-6 text-center mr-2 text-purple-400">🎯</span>
                        Ce que je recherche :
                      </h3>
                      <div className="pl-8 space-y-2 text-gray-300">
                        <p>Des projets stimulants où je peux apporter ma touche créative ! Que ce soit pour un clip, une série web ou une pub, discutons-en.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="skills" className="mt-6">
                <Card className="bg-purple-900/10 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Compétences</CardTitle>
                  </CardHeader>
                <CardContent>
                    {expertProfile?.skills && expertProfile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {expertProfile.skills.map((skill, index) => (
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
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="portfolio" className="mt-6">
                <Card className="bg-purple-900/10 border-purple-500/20">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-white">Portfolio</CardTitle>
                      <CardDescription className="text-gray-400">
                        Découvrez les créations de l'expert
                      </CardDescription>
                    </div>
                    </CardHeader>
                    <CardContent>
                    {portfolioItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolioItems.map((item, index) => (
                          <div 
                            key={item.id || index} 
                            className={`bg-black/20 rounded-lg overflow-hidden border border-purple-800/20 hover:border-purple-500/50 transition-all ${item.type === 'audio' ? 'md:col-span-2' : ''}`}
                          >
                            <div className="p-2">
                              {renderPortfolioItem(item)}
                              <div className="pt-2">
                                <h3 className="font-semibold text-white">{item.title}</h3>
                                {item.description && (
                                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                    ) : (
                      <div className="text-center py-8 bg-black/20 rounded-md border border-purple-500/20">
                        <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-300">Aucun projet dans le portfolio</h3>
                        <p className="text-gray-400 mt-1">Cet expert n'a pas encore ajouté de projets à son portfolio.</p>
                      </div>
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