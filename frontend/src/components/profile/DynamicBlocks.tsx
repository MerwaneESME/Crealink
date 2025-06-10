import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, X, Youtube, Instagram, Video, ExternalLink, Image, Music, Upload } from 'lucide-react';
import { BlockData, BlockType } from '@/types/profile';
import { storageService } from '@/services/storageService';
import { useToast } from '@/components/ui/use-toast';

interface DynamicBlocksProps {
  blocks: BlockData[];
  onBlocksChange: (blocks: BlockData[]) => void;
  isEditing: boolean;
  onEditingChange: (isEditing: boolean) => void;
}

const GRID_SIZE = 3;
const BLOCK_WIDTH = 280;
const BLOCK_HEIGHT = 200;
const GRID_GAP = 16;

const BLOCK_TYPES = [
  { value: 'youtube', label: 'Vidéo YouTube', icon: Youtube },
  { value: 'social', label: 'Réseau Social', icon: Instagram },
  { value: 'link', label: 'Lien Web', icon: ExternalLink },
  { value: 'image', label: 'Image/Photo', icon: Image },
  { value: 'text', label: 'Texte/Note', icon: Music }
];

const SOCIAL_PLATFORMS = [
  { 
    value: 'youtube',
    label: 'YouTube',
    logo: '/logos/youtube.svg',
    styles: {
      container: 'bg-white',
      text: 'text-[#282828]',
      button: 'bg-[#FF0000] hover:bg-[#CC0000] text-white',
      buttonText: "S'abonner"
    }
  },
  { 
    value: 'instagram',
    label: 'Instagram',
    logo: '/logos/instagram.svg',
    styles: {
      container: 'bg-white',
      text: 'text-black',
      button: 'bg-[#0095F6] hover:bg-[#1877F2] text-white',
      buttonText: 'Suivre'
    }
  },
  { 
    value: 'tiktok',
    label: 'TikTok',
    logo: '/logos/tiktok.svg',
    styles: {
      container: 'bg-white',
      text: 'text-black',
      button: 'bg-[#FE2C55] hover:bg-[#EF2950] text-white',
      buttonText: 'Suivre'
    }
  },
  { 
    value: 'twitch',
    label: 'Twitch',
    logo: '/logos/twitch.svg',
    styles: {
      container: 'bg-[#0E0E10]',
      text: 'text-white',
      button: 'bg-[#9146FF] hover:bg-[#772CE8] text-white',
      buttonText: 'Suivre'
    }
  },
  { 
    value: 'x',
    label: 'X',
    logo: '/logos/x.svg',
    styles: {
      container: 'bg-white',
      text: 'text-black',
      button: 'bg-black hover:bg-gray-900 text-white',
      buttonText: 'Suivre'
    }
  }
];

const detectSocialPlatform = (url: string): { type: BlockType; platform?: typeof SOCIAL_PLATFORMS[number]['value'] } => {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return { type: 'youtube' };
  }
  if (urlLower.includes('instagram.com')) {
    return { type: 'social', platform: 'instagram' };
  }
  if (urlLower.includes('tiktok.com')) {
    return { type: 'social', platform: 'tiktok' };
  }
  if (urlLower.includes('twitch.tv')) {
    return { type: 'social', platform: 'twitch' };
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return { type: 'social', platform: 'x' };
  }
  
  return { type: 'link' };
};

const SocialIcon: React.FC<{ platform: string }> = ({ platform }) => {
  return (
    <div className="w-5 h-5 mr-2">
      <img
        src={`/logos/${platform}.svg`}
        alt={`Logo ${platform}`}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

const DynamicBlocks: React.FC<DynamicBlocksProps> = ({
  blocks,
  onBlocksChange,
  isEditing,
  onEditingChange
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [blockFormData, setBlockFormData] = useState({
    type: 'youtube' as BlockType,
    content: {
      title: '',
      text: '',
      url: '',
      platform: 'youtube' as 'youtube' | 'instagram' | 'tiktok' | 'twitch',
      backgroundColor: '#1a1a1a'
    }
  });

  const getPositionFromIndex = (index: number) => ({
    x: (index % GRID_SIZE) * (BLOCK_WIDTH + GRID_GAP),
    y: Math.floor(index / GRID_SIZE) * (BLOCK_HEIGHT + GRID_GAP)
  });

  const handleAddBlock = () => {
    if (selectedPosition === null) return;

    const newBlock: BlockData = {
      id: Date.now().toString(),
      type: blockFormData.type,
      content: blockFormData.content,
      position: getPositionFromIndex(selectedPosition)
    };

    onBlocksChange([...blocks, newBlock]);
    setShowAddBlock(false);
    setSelectedPosition(null);
    resetForm();
  };

  const resetForm = () => {
    setBlockFormData({
      type: 'youtube',
      content: {
        title: '',
        text: '',
        url: '',
        platform: 'youtube' as 'youtube' | 'instagram' | 'tiktok' | 'twitch',
        backgroundColor: '#1a1a1a'
      }
    });
  };

  const handleDeleteBlock = (id: string) => {
    onBlocksChange(blocks.filter(block => block.id !== id));
  };

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleUrlChange = (url: string) => {
    const { type, platform } = detectSocialPlatform(url);
    const validPlatform = (platform || blockFormData.content.platform || 'youtube') as 'youtube' | 'instagram' | 'tiktok' | 'twitch';
    
    setBlockFormData({
      ...blockFormData,
      type,
      content: {
        ...blockFormData.content,
        url,
        platform: validPlatform
      }
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const result = await storageService.uploadFile(file, 'blocks');
      setBlockFormData({
        ...blockFormData,
        content: { ...blockFormData.content, url: result.url }
      });
      toast({
        title: "Image téléchargée",
        description: "L'image a été téléchargée avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du téléchargement de l'image",
        variant: "destructive"
      });
    }
  };

  const renderBlock = (block: BlockData) => {
    const baseClasses = "relative w-full h-full rounded-lg overflow-hidden group shadow-lg transition-transform hover:scale-105";
    
    switch (block.type) {
      case 'youtube':
        const videoId = extractYouTubeId(block.content.url || '');
        return (
          <div className={`${baseClasses} bg-black`}>
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={block.content.title || "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-red-600 flex items-center justify-center text-white">
                <div className="text-center">
                  <Youtube className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">YouTube</p>
                  <p className="text-xs opacity-75">{block.content.title || 'Vidéo'}</p>
                </div>
              </div>
            )}
            {renderEditControls(block)}
          </div>
        );

      case 'social':
        const platform = SOCIAL_PLATFORMS.find(p => p.value === block.content.platform) || SOCIAL_PLATFORMS[0];
        return (
          <div className={`${baseClasses} ${platform.styles.container}`}>
            <div className="w-full h-full flex flex-col items-center justify-center p-6">
              {/* Logo de la plateforme */}
              <div className="w-16 h-16 mb-4">
                <img
                  src={platform.logo}
                  alt={`Logo ${platform.label}`}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Nom du compte */}
              <h3 className={`font-semibold text-lg mb-1 ${platform.styles.text}`}>
                {block.content.title || (platform.value === 'youtube' ? 'Ma chaîne YouTube' : 'Mon profil')}
              </h3>
              
              {/* Description optionnelle */}
              {block.content.text && (
                <p className={`text-sm opacity-75 text-center mb-4 ${platform.styles.text}`}>
                  {block.content.text}
                </p>
              )}

              {/* Bouton d'action */}
              <Button
                size="sm"
                className={`${platform.styles.button} font-medium px-6`}
                onClick={() => block.content.url && window.open(block.content.url, '_blank')}
              >
                {platform.styles.buttonText}
              </Button>
            </div>
            {renderEditControls(block)}
          </div>
        );

      case 'link':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-blue-600 to-purple-600`}>
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-4">
              <ExternalLink className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-center mb-2">{block.content.title || 'Lien'}</h3>
              <p className="text-xs opacity-75 text-center">{block.content.text}</p>
            </div>
            {renderEditControls(block)}
          </div>
        );

      case 'image':
        return (
          <div className={`${baseClasses} bg-gray-800`}>
            {block.content.url ? (
              <img 
                src={block.content.url} 
                alt={block.content.title || 'Image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Image className="w-12 h-12 mb-2" />
                <p className="text-sm">{block.content.title || 'Image'}</p>
              </div>
            )}
            {renderEditControls(block)}
          </div>
        );

      case 'text':
        return (
          <div 
            className={`${baseClasses} text-white p-4 flex flex-col justify-center`}
            style={{ backgroundColor: block.content.backgroundColor || '#1a1a1a' }}
          >
            <div className="text-center">
              {block.content.title && (
                <h3 className="font-semibold text-lg mb-2">{block.content.title}</h3>
              )}
              <p className="text-sm leading-relaxed">{block.content.text}</p>
            </div>
            {renderEditControls(block)}
          </div>
        );

      default:
        return null;
    }
  };

  const renderEditControls = (block: BlockData) => {
    if (!isEditing) return null;
    
    return (
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditingBlock(block.id)}
          className="h-8 w-8 bg-black/60 hover:bg-black/80"
        >
          <Pencil className="h-4 w-4 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteBlock(block.id)}
          className="h-8 w-8 bg-black/60 hover:bg-black/80"
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Grille 3x3 */}
      <div
        className={`grid grid-cols-3 gap-4 bg-black/20 rounded-lg p-6 ${
          isEditing ? 'ring-2 ring-purple-500/50' : ''
        }`}
        style={{
          minHeight: `${GRID_SIZE * (BLOCK_HEIGHT + GRID_GAP) - GRID_GAP}px`
        }}
      >
        {Array(GRID_SIZE * GRID_SIZE)
          .fill(null)
          .map((_, index) => {
            const position = getPositionFromIndex(index);
            const block = blocks.find(
              b => b.position.x === position.x && b.position.y === position.y
            );

            return (
              <div
                key={`cell-${index}`}
                className={`aspect-[4/3] rounded-lg ${
                  isEditing && !block ? 'border-2 border-dashed border-white/20 hover:border-purple-500/50' : ''
                }`}
                style={{
                  width: BLOCK_WIDTH,
                  height: BLOCK_HEIGHT
                }}
              >
                {block ? (
                  renderBlock(block)
                ) : (
                  isEditing && (
                    <Button
                      variant="ghost"
                      className="w-full h-full flex flex-col items-center justify-center hover:bg-white/5 text-white/60 hover:text-white/80"
                      onClick={() => {
                        setSelectedPosition(index);
                        setShowAddBlock(true);
                      }}
                    >
                      <Plus className="w-8 h-8 mb-2" />
                      <span className="text-sm">Ajouter</span>
                    </Button>
                  )
                )}
              </div>
            );
          })}
      </div>

      {/* Modal d'ajout/modification de bloc */}
      <Dialog
        open={showAddBlock || editingBlock !== null}
        onOpenChange={open => {
          if (!open) {
            setShowAddBlock(false);
            setEditingBlock(null);
            setSelectedPosition(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? "Modifier le bloc" : "Ajouter un bloc"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Type de bloc */}
            <div>
              <Label>Type de contenu</Label>
              <Select
                value={blockFormData.type}
                onValueChange={(value: BlockType) =>
                  setBlockFormData({
                    ...blockFormData,
                    type: value,
                    content: { ...blockFormData.content }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Titre */}
            <div>
              <Label>Titre</Label>
              <Input
                value={blockFormData.content.title}
                onChange={e =>
                  setBlockFormData({
                    ...blockFormData,
                    content: { ...blockFormData.content, title: e.target.value }
                  })
                }
                placeholder="Titre du bloc"
              />
            </div>

            {/* Champs spécifiques selon le type */}
            {blockFormData.type === 'youtube' && (
              <div>
                <Label>URL YouTube</Label>
                <Input
                  value={blockFormData.content.url}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}

            {blockFormData.type === 'social' && (
              <>
                <div>
                  <Label>Plateforme</Label>
                  <Select
                    value={blockFormData.content.platform}
                    onValueChange={value =>
                      setBlockFormData({
                        ...blockFormData,
                        content: { ...blockFormData.content, platform: value as 'youtube' | 'instagram' | 'tiktok' | 'twitch' }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une plateforme">
                        {blockFormData.content.platform && (
                          <div className="flex items-center">
                            <SocialIcon platform={blockFormData.content.platform} />
                            {SOCIAL_PLATFORMS.find(p => p.value === blockFormData.content.platform)?.label}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map(platform => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center">
                            <SocialIcon platform={platform.value} />
                            {platform.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>URL du profil</Label>
                  <Input
                    value={blockFormData.content.url}
                    onChange={e => handleUrlChange(e.target.value)}
                    placeholder="URL de votre profil"
                  />
                </div>
              </>
            )}

            {blockFormData.type === 'link' && (
              <>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={blockFormData.content.url}
                    onChange={e => handleUrlChange(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={blockFormData.content.text}
                    onChange={e =>
                      setBlockFormData({
                        ...blockFormData,
                        content: { ...blockFormData.content, text: e.target.value }
                      })
                    }
                    placeholder="Description du lien"
                  />
                </div>
              </>
            )}

            {blockFormData.type === 'text' && (
              <>
                <div>
                  <Label>Texte</Label>
                  <Textarea
                    value={blockFormData.content.text}
                    onChange={e =>
                      setBlockFormData({
                        ...blockFormData,
                        content: { ...blockFormData.content, text: e.target.value }
                      })
                    }
                    placeholder="Votre texte..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Couleur de fond</Label>
                  <Input
                    type="color"
                    value={blockFormData.content.backgroundColor || '#1a1a1a'}
                    onChange={e =>
                      setBlockFormData({
                        ...blockFormData,
                        content: { ...blockFormData.content, backgroundColor: e.target.value }
                      })
                    }
                  />
                </div>
              </>
            )}

            {blockFormData.type === 'image' && (
              <div className="space-y-4">
                <div>
                  <Label>Image</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 border-2 border-dashed border-purple-500/30 bg-black/30 hover:bg-purple-900/20 flex flex-col items-center justify-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6" />
                      <span>Cliquez pour choisir une image</span>
                      <span className="text-xs text-gray-400">ou glissez-déposez votre fichier ici</span>
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        value={blockFormData.content.url}
                        onChange={e => handleUrlChange(e.target.value)}
                        placeholder="... ou collez l'URL d'une image"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                {blockFormData.content.url && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-purple-500/20">
                    <img
                      src={blockFormData.content.url}
                      alt="Aperçu"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        className="text-white hover:text-white/80"
                        onClick={() => setBlockFormData({
                          ...blockFormData,
                          content: { ...blockFormData.content, url: '' }
                        })}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Supprimer l'image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddBlock(false);
                  setEditingBlock(null);
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleAddBlock}>
                {editingBlock ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicBlocks; 