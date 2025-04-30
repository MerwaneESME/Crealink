import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
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
  specialties?: string[];
  role?: string;
  email?: string;
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
        
        // Vérifier que c'est bien un expert
        if (expertData.role !== 'expert') {
          setError("Ce profil n'est pas celui d'un expert");
          setIsLoading(false);
          return;
        }
        
        setExpertProfile({
          uid: expertDoc.id,
          displayName: expertData.displayName,
          name: expertData.name,
          photoURL: expertData.photoURL,
          avatar: expertData.avatar,
          bio: expertData.bio,
          specialties: expertData.specialties || [],
          role: expertData.role,
          email: expertData.email
        });
        
        // Récupérer les projets de l'expert
        const expertProjects = await portfolioService.getExpertProjects(id);
        setProjects(expertProjects);
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
          <Button asChild>
            <Link to="/jobs">Retour aux offres</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="mb-6">
        <Link 
          to="/jobs" 
          className="text-sm text-gray-400 hover:text-purple-400 mb-4 inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour aux offres
        </Link>
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
                      <span className="text-3xl text-purple-300">
                        {(expertProfile.displayName || expertProfile.name || "?")[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl font-semibold">
                  {expertProfile.displayName || expertProfile.name || "Expert anonyme"}
                </CardTitle>
                <CardDescription className="text-purple-400">Expert</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expertProfile.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-1">À propos</h3>
                    <p className="text-gray-400 text-sm">{expertProfile.bio}</p>
                  </div>
                )}
                
                {expertProfile.specialties && expertProfile.specialties.length > 0 && (
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
              </CardContent>
              <CardFooter>
                {user?.role === 'creator' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={handleContactExpert}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contacter l'expert
                  </Button>
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
                      <img 
                        src={project.imageUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                      />
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
          </div>
        </div>
      )}
    </div>
  );
} 