import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Mail, Briefcase, Music, Image, Eye, User, Calendar, Award } from 'lucide-react';
import { portfolioService, Project } from '@/services/portfolioService';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface ExpertProfile {
  uid: string;
  displayName?: string;
  name?: string;
  photoURL?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  specialties?: string[];
  role?: string;
  email?: string;
  experience?: string;
  education?: string;
  location?: string;
  joinDate?: string;
}

export default function ExpertPortfolio() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [expertProfile, setExpertProfile] = useState<ExpertProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          bio: expertData.bio || "Aucune biographie disponible",
          skills: Array.isArray(expertData.skills) ? expertData.skills : 
                 (typeof expertData.skills === 'string' ? expertData.skills.split(',').map(s => s.trim()) : []),
          specialties: expertData.specialties || expertData.skills || [],
          role: expertData.role,
          email: expertData.email,
          experience: expertData.experience,
          education: expertData.education,
          location: expertData.location || expertData.address,
          joinDate: expertData.createdAt ? 
                   (typeof expertData.createdAt === 'string' ? 
                    expertData.createdAt : 
                    expertData.createdAt.toDate?.().toISOString().split('T')[0] || 
                    new Date(expertData.createdAt).toISOString().split('T')[0])
                   : null
        });
        
        // Récupérer les projets de l'expert
        try {
          const expertProjects = await portfolioService.getExpertProjects(id);
          setProjects(expertProjects);
        } catch (projectError) {
          console.error("Erreur lors du chargement des projets:", projectError);
          // On ne bloque pas l'affichage si les projets ne se chargent pas
          setProjects([]);
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
    // Cette fonction pourrait rediriger vers la messagerie
    navigate('/messages', { state: { recipientId: id }});
  };
  
  const handleProposeOffer = () => {
    if (!id || !expertProfile) return;
    
    // Rediriger vers le dashboard du créateur avec les informations de l'expert
    navigate(`/creator-dashboard?expertId=${id}&expertName=${encodeURIComponent(expertProfile.displayName || 'Expert')}`);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-20 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement du portfolio de l'expert...</p>
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
          <Button onClick={() => navigate(-1)}>
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4">
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
      
      {expertProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            <Card className="border border-purple-500/20 bg-black/50">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 relative">
                  {expertProfile.photoURL || expertProfile.avatar ? (
                    <img 
                      src={expertProfile.photoURL || expertProfile.avatar} 
                      alt={expertProfile.displayName || expertProfile.name} 
                      className="w-32 h-32 rounded-full object-cover border-2 border-purple-500/30"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-purple-900/30 flex items-center justify-center border-2 border-purple-500/30">
                      <User className="h-16 w-16 text-purple-300" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl font-semibold">
                  {expertProfile.displayName || expertProfile.name || "Expert anonyme"}
                </CardTitle>
                <CardDescription className="text-purple-400">Expert</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bio */}
                {expertProfile.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-1">À propos</h3>
                    <p className="text-gray-400 text-sm">{expertProfile.bio}</p>
                  </div>
                )}
                
                {/* Compétences */}
                {(expertProfile.skills && expertProfile.skills.length > 0) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-1">Compétences</h3>
                    <div className="flex flex-wrap gap-2">
                      {expertProfile.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Spécialités (si différentes des compétences) */}
                {expertProfile.specialties && 
                 expertProfile.specialties.length > 0 && 
                 JSON.stringify(expertProfile.specialties) !== JSON.stringify(expertProfile.skills) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-1">Spécialités</h3>
                    <div className="flex flex-wrap gap-2">
                      {expertProfile.specialties.map((specialty, index) => (
                        <span 
                          key={index}
                          className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-md"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Informations supplémentaires */}
                <div className="space-y-2">
                  {expertProfile.experience && (
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium text-gray-300">Expérience</h4>
                        <p className="text-gray-400 text-xs">{expertProfile.experience}</p>
                      </div>
                    </div>
                  )}
                  
                  {expertProfile.education && (
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium text-gray-300">Formation</h4>
                        <p className="text-gray-400 text-xs">{expertProfile.education}</p>
                      </div>
                    </div>
                  )}
                  
                  {expertProfile.location && (
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium text-gray-300">Localisation</h4>
                        <p className="text-gray-400 text-xs">{expertProfile.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {expertProfile.joinDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium text-gray-300">Membre depuis</h4>
                        <p className="text-gray-400 text-xs">{
                          new Date(expertProfile.joinDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        }</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                {user && (user.role === 'creator' || user.role === 'influencer') && (
                  <>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handleProposeOffer}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Proposer une offre
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                      onClick={handleContactExpert}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Contacter l'expert
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Portfolio
            </h2>
            
            {projects.length === 0 ? (
              <Card className="border border-purple-500/20 bg-black/50 text-center py-8">
                <CardContent>
                  <p className="text-gray-400">Cet expert n'a pas encore de projets dans son portfolio.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden border border-purple-500/20 bg-black/50 hover:border-purple-500/50 transition-all">
                    <div className="h-48">
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
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>
                        {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 line-clamp-3">{project.description}</p>
                      
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="bg-purple-900/20 text-purple-300 text-xs px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                        onClick={() => navigate(`/project/${project.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir le projet
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 