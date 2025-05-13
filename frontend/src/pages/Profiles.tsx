import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  name: string;
  description: string;
  profession: string;
  userId: string;
}

const Profiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const profilesRef = collection(db, 'profiles');
      const snapshot = await getDocs(profilesRef);
      const profilesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Profile[];
      
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
      .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
      .replace(/\s+/g, '') // Enlève tous les espaces
      .trim();
  };

  useEffect(() => {
    if (searchTerm) {
      const normalizedSearchTerm = normalizeText(searchTerm);
      const filtered = profiles.filter(profile => 
        normalizeText(profile.name).includes(normalizedSearchTerm) || 
        normalizeText(profile.description).includes(normalizedSearchTerm) ||
        normalizeText(profile.profession).includes(normalizedSearchTerm)
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [searchTerm, profiles]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Profils
        </h1>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un profil..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 bg-black/50 border-purple-500/20 focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-black/80 rounded-lg p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-white mb-2">{profile.name}</h2>
              <p className="text-purple-400 mb-2">{profile.profession}</p>
              <p className="text-gray-400">{profile.description}</p>
            </div>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            Aucun profil trouvé
          </div>
        )}
      </div>
    </div>
  );
};

export default Profiles; 