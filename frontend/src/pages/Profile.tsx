import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';

// Types
interface UserProfile {
  displayName: string;
  email: string;
  bio: string;
  phone: string;
  website: string;
  skills: string[];
  categories: string[];
  location: string;
  hourlyRate: string;
  available: boolean;
  photoURL: string;
}

export default function Profile() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    bio: '',
    phone: '',
    website: '',
    skills: [],
    categories: [],
    location: '',
    hourlyRate: '',
    available: true,
    photoURL: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simuler un chargement depuis Firebase
    setLoading(true);
    
    // Délai artificiel pour simuler le chargement
    setTimeout(() => {
      // Données factices pour démonstration
      setProfile({
        displayName: currentUser?.displayName || 'Utilisateur',
        email: currentUser?.email || 'utilisateur@example.com',
        bio: 'Éditeur vidéo et graphiste avec 5 ans d\'expérience, spécialisé dans le montage de contenu gaming et la création de miniatures YouTube. J\'ai travaillé avec plusieurs créateurs de contenu pour optimiser leur présence sur YouTube et Twitch.',
        phone: '+33 6 12 34 56 78',
        website: 'www.monportfolio.com',
        skills: ['Premiere Pro', 'After Effects', 'Photoshop', 'Motion Design', 'YouTube SEO'],
        categories: ['editeur', 'graphiste'],
        location: 'Paris, France',
        hourlyRate: '30',
        available: true,
        photoURL: currentUser?.photoURL || ''
      });
      setLoading(false);
    }, 1000);
  }, [currentUser]);

  const handleProfileUpdate = () => {
    setIsSaving(true);
    
    // Simuler une mise à jour dans Firebase
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
    }, 1500);
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    
    if (!profile.skills.includes(skillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skillInput.trim()]
      });
    }
    
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill)
    });
  };

  const handleCategoryToggle = (category: string) => {
    if (profile.categories.includes(category)) {
      setProfile({
        ...profile,
        categories: profile.categories.filter(c => c !== category)
      });
    } else {
      setProfile({
        ...profile,
        categories: [...profile.categories, category]
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mon profil</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Carte de profil */}
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                    <AvatarFallback className="text-2xl">{getInitials(profile.displayName)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{profile.displayName}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Disponibilité</Label>
                    <Switch 
                      checked={profile.available} 
                      onCheckedChange={(checked) => setProfile({...profile, available: checked})}
                    />
                  </div>
                  <Badge className={profile.available ? 'bg-green-500' : 'bg-gray-500'}>
                    {profile.available ? 'Disponible' : 'Non disponible'}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Catégories</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.categories.map(category => (
                      <Badge key={category} variant="outline" className="capitalize">
                        {category === 'editeur' ? 'Éditeur vidéo' : 
                         category === 'graphiste' ? 'Graphiste' : 'Développeur'}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Localisation</Label>
                  <p>{profile.location || 'Non spécifiée'}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Taux horaire</Label>
                  <p>{profile.hourlyRate ? `${profile.hourlyRate}€/heure` : 'Non spécifié'}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Informations principales */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez vos informations de profil visibles par les autres utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom complet</Label>
                    <Input 
                      id="displayName" 
                      value={profile.displayName} 
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      value={profile.phone} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input 
                      id="website" 
                      value={profile.website} 
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input 
                      id="location" 
                      value={profile.location} 
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Taux horaire (€)</Label>
                    <Input 
                      id="hourlyRate" 
                      type="number" 
                      value={profile.hourlyRate} 
                      onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    rows={5} 
                    value={profile.bio} 
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Décrivez votre expérience, vos compétences et ce que vous pouvez offrir..."
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="skills">Compétences</Label>
                    <span className="text-xs text-gray-500">{profile.skills.length}/10</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Input 
                      id="skills" 
                      value={skillInput} 
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Ajouter une compétence"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddSkill}
                      disabled={!skillInput.trim() || profile.skills.length >= 10}
                    >
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button 
                          className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-1 -mr-1"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="lucide lucide-x"
                          >
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Catégories de services</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="editeur" 
                        checked={profile.categories.includes('editeur')} 
                        onCheckedChange={() => handleCategoryToggle('editeur')}
                      />
                      <Label htmlFor="editeur">Éditeur vidéo</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="graphiste" 
                        checked={profile.categories.includes('graphiste')} 
                        onCheckedChange={() => handleCategoryToggle('graphiste')}
                      />
                      <Label htmlFor="graphiste">Graphiste</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="developpeur" 
                        checked={profile.categories.includes('developpeur')} 
                        onCheckedChange={() => handleCategoryToggle('developpeur')}
                      />
                      <Label htmlFor="developpeur">Développeur</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleProfileUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>
                Gérez vos paramètres de compte et préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input id="confirm-password" type="password" />
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Préférences de notifications</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label htmlFor="email-notifs">Notifications par email</Label>
                      <p className="text-sm text-gray-500">Recevoir des emails pour les nouveaux messages et offres</p>
                    </div>
                    <Switch id="email-notifs" defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <Label htmlFor="marketing-notifs">Emails marketing</Label>
                      <p className="text-sm text-gray-500">Recevoir les dernières actualités et offres</p>
                    </div>
                    <Switch id="marketing-notifs" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive">Supprimer le compte</Button>
              <Button>Enregistrer</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mon portfolio</CardTitle>
              <CardDescription>
                Gérez vos projets et travaux pour les présenter aux employeurs potentiels
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex flex-col items-center justify-center text-center p-8">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Ajoutez vos projets</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md">
                Présentez vos meilleurs travaux pour attirer l'attention des employeurs potentiels. Cette fonctionnalité sera bientôt disponible.
              </p>
              <Button disabled>
                Bientôt disponible
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 