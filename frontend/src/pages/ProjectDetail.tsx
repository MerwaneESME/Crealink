import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { portfolioService, Project } from '@/services/portfolioService';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Image, Video, Music } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedProject = await portfolioService.getProjectById(projectId);
        if (fetchedProject) {
          setProject(fetchedProject);
        } else {
          setError("Projet non trouvé");
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement du projet:", err);
        setError("Impossible de charger les détails du projet. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-20 px-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Erreur</h2>
          <p className="text-gray-300 mb-4">{error || "Projet non trouvé"}</p>
          <Button onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.uid === project.expertId;

  return (
    <div className="container mx-auto py-20 px-4">
      <Button 
        variant="ghost" 
        className="mb-6 text-gray-400 hover:text-white"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Partie gauche - Médias */}
        <div className="lg:col-span-2">
          <div className="bg-black/50 border border-purple-500/20 rounded-lg overflow-hidden">
            {project.media && project.media.length > 0 ? (
              <div>
                <div className="relative aspect-video">
                  {project.media[activeMediaIndex].type === 'image' ? (
                    <img 
                      src={project.media[activeMediaIndex].url} 
                      alt={project.title} 
                      className="w-full h-full object-contain"
                    />
                  ) : project.media[activeMediaIndex].type === 'video' ? (
                    <video 
                      src={project.media[activeMediaIndex].url} 
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/20">
                      <Music className="h-16 w-16 text-purple-400" />
                      <audio 
                        src={project.media[activeMediaIndex].url} 
                        controls 
                        className="mt-4 w-full max-w-md"
                      />
                    </div>
                  )}
                </div>

                {project.media.length > 1 && (
                  <div className="flex overflow-x-auto gap-2 p-4">
                    {project.media.map((media, index) => (
                      <button
                        key={index}
                        className={`min-w-[100px] h-[60px] border-2 rounded ${
                          index === activeMediaIndex 
                            ? 'border-purple-500' 
                            : 'border-transparent hover:border-purple-500/50'
                        }`}
                        onClick={() => setActiveMediaIndex(index)}
                      >
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={`Miniature ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : media.type === 'video' ? (
                          <div className="w-full h-full bg-black/80 rounded flex items-center justify-center">
                            <Video className="h-6 w-6 text-purple-400" />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-black/80 rounded flex items-center justify-center">
                            <Music className="h-6 w-6 text-purple-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full flex items-center justify-center bg-purple-900/20">
                <Image className="h-16 w-16 text-purple-400" />
              </div>
            )}
          </div>
        </div>

        {/* Partie droite - Informations */}
        <div className="lg:col-span-1">
          <div className="bg-black/50 border border-purple-500/20 rounded-lg p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
            <p className="text-gray-400 mb-6">{project.description}</p>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-purple-400 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {project.tags && project.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-purple-900/30 text-purple-300 text-sm px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-purple-400 mb-2">Expert</h2>
              <p className="text-white">{project.expertName}</p>
            </div>

            {isOwner && (
              <div className="mt-8">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => navigate('/portfolio')}
                >
                  Retour à mon portfolio
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 