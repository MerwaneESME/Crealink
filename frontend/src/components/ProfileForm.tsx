import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProfileFormProps {
  initialData?: {
    name: string;
    profession: string;
    description: string;
  };
  onSuccess?: () => void;
}

const ProfileForm = ({ initialData, onSuccess }: ProfileFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    profession: initialData?.profession || '',
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, {
        ...formData,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="bg-black/50 border-purple-500/20 focus:border-purple-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profession">Profession</Label>
        <Input
          id="profession"
          name="profession"
          value={formData.profession}
          onChange={handleChange}
          required
          className="bg-black/50 border-purple-500/20 focus:border-purple-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="bg-black/50 border-purple-500/20 focus:border-purple-500 min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isLoading ? 'Enregistrement...' : 'Enregistrer le profil'}
      </Button>
    </form>
  );
};

export default ProfileForm; 