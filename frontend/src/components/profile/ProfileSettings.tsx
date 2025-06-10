import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UnifiedProfile } from '@/types/profile';

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: UnifiedProfile;
  onUpdate: (data: Partial<UnifiedProfile>) => Promise<void>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  open,
  onOpenChange,
  profileData,
  onUpdate
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profileData.displayName || '',
    description: profileData.description || '',
    phone: profileData.phone || '',
    showEmail: profileData.showEmail || false,
    showPhone: profileData.showPhone || false
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onUpdate(formData);
      toast({
        title: "Succès",
        description: "Les paramètres ont été mis à jour.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Paramètres du profil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label>Nom d'affichage</Label>
              <Input
                value={formData.displayName}
                onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Une courte description de vous"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div>
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Votre numéro de téléphone"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Afficher l'email</Label>
              <Switch
                checked={formData.showEmail}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, showEmail: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Afficher le téléphone</Label>
              <Switch
                checked={formData.showPhone}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, showPhone: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings; 