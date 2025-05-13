import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/contexts/AuthContext";

interface ProfileSettingsProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, open, onOpenChange }) => {
  const { updateUserProfile, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    displayName: user.displayName || '',
    email: user.email || '',
    phone: user.phone || '',
    useDisplayNameOnly: user.useDisplayNameOnly || false,
    showEmail: user.showEmail !== false, // Par défaut, montrer l'email
    showPhone: user.showPhone !== false, // Par défaut, montrer le téléphone
  });

  // Mettre à jour les champs quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setSettings({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        useDisplayNameOnly: user.useDisplayNameOnly || false,
        showEmail: user.showEmail !== false,
        showPhone: user.showPhone !== false,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log("Sauvegarde des paramètres:", settings);
      
      await updateUserProfile({
        displayName: settings.displayName,
        name: settings.displayName,
        email: settings.email,
        phone: settings.phone,
        useDisplayNameOnly: settings.useDisplayNameOnly,
        showEmail: settings.showEmail,
        showPhone: settings.showPhone
      }, user.uid);
      
      // Rafraîchir les données utilisateur
      await refreshUser();
      
      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres de confidentialité ont été enregistrés."
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour des paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-purple-950 text-white border-none max-w-md rounded-lg shadow-2xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-bold text-white">Paramètres de confidentialité</DialogTitle>
          <DialogDescription className="text-purple-200 mt-2">
            Configurez les informations personnelles que vous souhaitez rendre visibles sur votre profil.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-white text-sm font-medium">Nom d'affichage</Label>
            <Input 
              id="displayName" 
              name="displayName"
              value={settings.displayName}
              onChange={handleChange}
              className="bg-purple-900/60 border-purple-700 text-white focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">Adresse email</Label>
            <Input 
              id="email" 
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
              className="bg-purple-900/60 border-purple-700 text-white focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white text-sm font-medium">Numéro de téléphone</Label>
            <Input 
              id="phone" 
              name="phone"
              type="tel"
              value={settings.phone}
              onChange={handleChange}
              className="bg-purple-900/60 border-purple-700 text-white focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="useDisplayNameOnly" 
              checked={settings.useDisplayNameOnly}
              onCheckedChange={(checked) => 
                handleCheckboxChange('useDisplayNameOnly', checked as boolean)
              }
              className="border-purple-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <Label htmlFor="useDisplayNameOnly" className="text-white cursor-pointer">
              Utiliser uniquement le nom d'affichage (masquer le nom de famille)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showEmail" 
              checked={settings.showEmail}
              onCheckedChange={(checked) => 
                handleCheckboxChange('showEmail', checked as boolean)
              }
              className="border-purple-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <Label htmlFor="showEmail" className="text-white cursor-pointer">
              Afficher mon adresse email sur mon profil
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showPhone" 
              checked={settings.showPhone}
              onCheckedChange={(checked) => 
                handleCheckboxChange('showPhone', checked as boolean)
              }
              className="border-purple-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <Label htmlFor="showPhone" className="text-white cursor-pointer">
              Afficher mon numéro de téléphone sur mon profil
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium"
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings; 