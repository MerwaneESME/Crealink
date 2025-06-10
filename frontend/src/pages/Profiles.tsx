import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { profileService } from '@/services/profileService';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  uid: string;
  name: string;
  displayName: string;
  description: string;
  userId: string;
  role: 'expert' | 'creator';
  expertise?: {
    mainType: string;
    subType: string;
    description: string;
  };
  skills?: string[];
  photoURL?: string;
}

const Profiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const profilesList = await profileService.getAllProfiles() as Profile[];
      setProfiles(profilesList);
      setFilteredProfiles(profilesList);
    } catch (err) {
      console.error('Erreur lors de la récupération des profils:', err);
      setError('Erreur lors du chargement des profils');
      toast({
        title: "Erreur",
        description: "Impossible de charger les profils",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour normaliser le texte (enlever les accents, espaces, mettre en minuscules)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .trim();
  };

  useEffect(() => {
    if (searchTerm) {
      const normalizedSearchTerm = normalizeText(searchTerm);
      const filtered = profiles.filter(profile => {
        const searchableText = normalizeText([
          profile.name,
          profile.displayName,
          profile.description,
          ...(profile.skills || []),
          profile.expertise?.mainType,
          profile.expertise?.subType,
          profile.expertise?.description
        ].filter(Boolean).join(' '));
        
        return searchableText.includes(normalizedSearchTerm);
      });
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [searchTerm, profiles]);

  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  const handleContact = (name: string) => {
    // Implémenter la logique de contact ici
    toast({
      title: "Contact",
      description: `Contacter ${name}`,
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Profils</h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher un profil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-purple-900/10 border-purple-500/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-400">Chargement des profils...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
          <Button 
            onClick={fetchProfiles}
            variant="outline"
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searchTerm ? "Aucun profil ne correspond à votre recherche" : "Aucun profil disponible"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            // Filtrer les compétences pour éviter les doublons avec l'expertise
            const filteredSkills = profile.skills?.filter(skill => {
              if (!profile.expertise) return true;
              const expertiseTerms = [
                profile.expertise.mainType.toLowerCase(),
                profile.expertise.subType?.toLowerCase() || ''
              ];
              return !expertiseTerms.includes(skill.toLowerCase());
            });

            return (
              <ProfileCard
                key={profile.id}
                profile={{
                  uid: profile.uid,
                  photoURL: profile.photoURL,
                  displayName: profile.displayName || profile.name,
                  role: profile.role,
                  expertise: profile.expertise,
                  description: profile.description,
                  skills: filteredSkills
                }}
                onViewProfile={() => handleViewProfile(profile.id)}
                onContact={handleContact}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Profiles; 