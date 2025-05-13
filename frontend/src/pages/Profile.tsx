import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { storageService } from "@/services/storageService";
import CreatorProfile from "@/components/profile/CreatorProfile";
import ExpertProfile from "@/components/profile/ExpertProfile";
import ProfileSettings from "@/components/profile/ProfileSettings";
import { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewType, setViewType] = useState<'creator' | 'expert'>('creator');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // Définir le type de vue en fonction du rôle actuel de l'utilisateur
    if (user && (user.role === 'creator' || user.role === 'influencer')) {
      setViewType('creator');
    } else {
      setViewType('expert');
    }
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    try {
      // Upload de la photo
      const photoURL = await storageService.uploadProfilePhoto(file, user.uid);
      
      // Mise à jour du profil utilisateur avec la nouvelle URL de la photo
      await updateUserProfile({
        photoURL,
        avatar: photoURL
      }, user.uid);
      
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès. La page va être rechargée.",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la photo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Afficher le composant de profil en fonction du rôle de l'utilisateur */}
        {user.role === 'creator' || user.role === 'influencer' ? (
          <CreatorProfile 
            user={user} 
            fileInputRef={fileInputRef}
            onOpenSettings={() => setSettingsOpen(true)} 
          />
        ) : (
          <ExpertProfile 
            user={user} 
            fileInputRef={fileInputRef} 
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        
        {/* Modal des paramètres */}
        <ProfileSettings 
          user={user}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
        
        {/* Input caché pour gérer l'upload de photo */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handlePhotoChange}
          aria-label="Changer la photo de profil"
        />
      </div>
    </div>
  );
};

export default Profile; 