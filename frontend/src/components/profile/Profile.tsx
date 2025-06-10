import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Edit, Trash2, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { profileService } from '@/services/profileService';
import { BlockData, UnifiedProfile } from '@/types/profile';
import { EXPERT_SKILLS } from '@/constants/skills';
import type { SkillCategory } from '@/constants/skills';
import DynamicBlocks from './DynamicBlocks';
import ProfileSettings from './ProfileSettings';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProfileProps {
  user: UnifiedProfile;
  variant?: 'private' | 'public';
  onContact?: () => void;
}

// Ajout du mapping des spécialités
const SPECIALTY_TO_CATEGORY: Record<string, string> = {
  'photographer': 'Photo',
  'videographer': 'Vidéo',
  'sound_designer': 'Audio',
  'graphic_designer': 'Design',
  '3d_artist': '3D',
  'developer': 'Développement'
};

const Profile: React.FC<ProfileProps> = ({ user, variant = 'private', onContact }) => {
  const { updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  // États
  const [profileData, setProfileData] = useState<UnifiedProfile>(user);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingBlocks, setIsEditingBlocks] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Chargement initial des données
  useEffect(() => {
    if (user.uid) {
      loadProfileData();
    }
  }, [user.uid]);

  // Fonction centralisée de chargement des données
  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const [profileData, blocksData] = await Promise.all([
        profileService.getFullProfile(user.uid),
        profileService.getBlocks(user.uid)
      ]);
      
      setProfileData(profileData);
      setBlocks(blocksData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire unifié des mises à jour
  const handleUpdate = async (type: 'profile' | 'blocks', data: any) => {
    setIsLoading(true);
    try {
      if (type === 'profile') {
        await profileService.forceUpdateProfile(user.uid, data);
        setProfileData(prev => ({ ...prev, ...data }));
      } else {
        await profileService.saveBlocks(user.uid, data);
        setBlocks(data);
      }
      toast({
        title: "Succès",
        description: "Les modifications ont été enregistrées.",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des compétences
  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    const updatedSkills = [...(profileData.skills || []), newSkill.trim()];
    await handleUpdate('profile', { skills: updatedSkills });
    setNewSkill('');
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = (profileData.skills || []).filter(skill => skill !== skillToRemove);
    await handleUpdate('profile', { skills: updatedSkills });
  };

  const getRoleDisplayName = () => {
    switch (profileData.role) {
      case 'expert': return 'Expert';
      case 'creator': return 'Créateur';
      default: return 'Utilisateur';
    }
  };

  const getSpecialty = () => {
    if (profileData.role === 'expert' && profileData.expertise) {
      return {
        main: SPECIALTY_TO_CATEGORY[profileData.expertise.mainType] || profileData.expertise.mainType,
        sub: profileData.expertise.subType,
        level: profileData.expertise.level
      };
    } else if (profileData.role === 'creator' && profileData.creator) {
      return {
        main: SPECIALTY_TO_CATEGORY[profileData.creator.mainType] || profileData.creator.mainType,
        sub: profileData.creator.subType,
        level: null
      };
    }
    return null;
  };

  const mainExpertise = getSpecialty()?.main || '';
  const availableSkills = mainExpertise ? EXPERT_SKILLS[mainExpertise as keyof typeof EXPERT_SKILLS] : null;

  const getSkillSuggestions = (expertise: string | undefined, query: string): string[] => {
    if (!expertise || !EXPERT_SKILLS[expertise]) return [];
    
    const allSkills = EXPERT_SKILLS[expertise].flatMap(category => category.skills);
    return allSkills.filter(skill => 
      skill.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar gauche - Informations du profil */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-purple-500/20 text-white">
              <CardContent className="p-6 space-y-6">
                
                {/* Photo de profil et nom */}
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-purple-500/30">
                    {profileData.photoURL ? (
                      <img 
                        src={profileData.photoURL} 
                        alt={profileData.displayName || ''} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-4xl text-purple-300">
                          {profileData.displayName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profileData.displayName}</h2>
                    <p className="text-purple-300">{getRoleDisplayName()}</p>
                  </div>
                </div>

                {/* Spécialité et niveau */}
                {getSpecialty() && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Spécialité</h3>
                    <div className="space-y-1">
                      <p className="text-white font-medium">{getSpecialty()?.main}</p>
                      <p className="text-gray-400 text-sm">{getSpecialty()?.sub}</p>
                      {getSpecialty()?.level && (
                        <Badge variant="outline" className="text-xs bg-purple-500/20 border-purple-500/50">
                          Niveau {getSpecialty()?.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {profileData.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">À propos</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{profileData.description}</p>
                  </div>
                )}

                {/* Compétences */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Compétences</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills?.map((skill, index) => (
                      <div key={index} className="relative group">
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-gray-700/50 border-gray-600 text-gray-300 pr-6"
                        >
                          {skill}
                          {variant === 'private' && (
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {variant === 'private' && (
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between bg-black/50 border-gray-600 text-white"
                          >
                            {newSkill || "Ajouter une compétence..."}
                            <Plus className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[400px] p-0 max-h-[500px] overflow-y-auto"
                          align="start"
                          side="bottom"
                          sideOffset={5}
                          alignOffset={0}
                        >
                          <Command>
                            <CommandInput
                              placeholder="Rechercher une compétence..."
                              value={newSkill}
                              onValueChange={setNewSkill}
                              className="h-9"
                            />
                            <div className="border-t border-gray-700">
                              {availableSkills && availableSkills.map((category: SkillCategory) => (
                                <CommandGroup key={category.name} heading={category.name} className="px-2 py-2">
                                  <div className="grid grid-cols-2 gap-1">
                                    {category.skills
                                      .filter((skill: string) => 
                                        !newSkill || skill.toLowerCase().includes(newSkill.toLowerCase())
                                      )
                                      .map((skill: string) => (
                                        <CommandItem
                                          key={skill}
                                          value={skill}
                                          onSelect={(value) => {
                                            setNewSkill(value);
                                            handleAddSkill();
                                          }}
                                          className="cursor-pointer hover:bg-purple-500/20 rounded px-2 py-1 text-sm"
                                        >
                                          <div className="flex items-center">
                                            <Plus className="w-3 h-3 mr-2 text-purple-400" />
                                            <span className="truncate">{skill}</span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                  </div>
                                </CommandGroup>
                              ))}
                              {!availableSkills && (
                                <div className="px-4 py-6 text-center space-y-2">
                                  <p className="text-sm text-gray-400">
                                    {getSpecialty()?.main 
                                      ? `La spécialité "${getSpecialty()?.main}" n'est pas encore supportée pour les compétences.`
                                      : "Veuillez d'abord sélectionner votre spécialité dans les paramètres du profil."
                                    }
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSettings(true)}
                                    className="mt-2 text-purple-400 border-purple-400/20 hover:bg-purple-400/10"
                                  >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Modifier les paramètres
                                  </Button>
                                </div>
                              )}
                            </div>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {variant === 'private' && (
                  <div className="space-y-2 pt-4 border-t border-gray-700">
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(true)}
                      className="w-full text-sm bg-transparent border-gray-600 hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Modifier le profil
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-sm text-red-400 border-red-400/50 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer le compte
                    </Button>
                  </div>
                )}

                {/* Contact pour vue publique */}
                {variant === 'public' && onContact && (
                  <Button onClick={onContact} className="w-full">
                    Contacter
                  </Button>
                )}

              </CardContent>
            </Card>
          </div>

          {/* Zone principale - Grille de blocs 3x3 */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              
              {/* En-tête avec bouton modifier */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Zone personnalisable</h2>
                {variant === 'private' && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingBlocks(!isEditingBlocks)}
                    className="bg-black/20 hover:bg-black/40 border-purple-500/20"
                  >
                    {isEditingBlocks ? "Terminer" : "Modifier"}
                  </Button>
                )}
              </div>

              {/* Grille de blocs */}
              <DynamicBlocks
                blocks={blocks}
                onBlocksChange={(newBlocks) => handleUpdate('blocks', newBlocks)}
                isEditing={isEditingBlocks}
                onEditingChange={setIsEditingBlocks}
              />

            </div>
          </div>

        </div>
      </div>

      {/* Modal des paramètres */}
      <ProfileSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        profileData={profileData}
        onUpdate={(data) => handleUpdate('profile', data)}
      />
    </div>
  );
};

export default Profile; 