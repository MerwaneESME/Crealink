import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Upload, BriefcaseIcon, StarIcon, CalendarIcon } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 mt-16 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accès non autorisé</CardTitle>
              <CardDescription>
                Vous devez être connecté pour accéder à cette page.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" asChild>
                <a href="/login">Se connecter</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dans une application réelle, vous téléchargeriez le fichier sur un serveur
      // Ici, nous simulons simplement un URL d'avatar
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          avatar: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        avatar: formData.avatar
      });
      
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la mise à jour du profil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'creator':
        return 'Créateur de contenu';
      case 'expert':
        return 'Expert';
      default:
        return 'Utilisateur';
    }
  };

  // Exemples de projets de l'utilisateur
  const userProjects = [
    {
      id: 'proj-1',
      title: 'Montage vidéo pour chaîne gaming',
      status: 'completed',
      date: '15 Mar 2025',
      client: 'GameMaster',
      rating: 5
    },
    {
      id: 'proj-2',
      title: 'Création de miniatures lifestyle',
      status: 'in-progress',
      date: '22 Mar 2025',
      client: 'LifestyleQueen',
      rating: null
    },
    {
      id: 'proj-3',
      title: 'Voix-off pour documentaires',
      status: 'completed',
      date: '10 Mar 2025',
      client: 'EduChannel',
      rating: 4
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          {/* En-tête du profil */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="h-8 w-8 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="sr-only" 
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{getRoleName(user.role)}</Badge>
                      {user.verified && (
                        <Badge variant="secondary">Vérifié</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-2">{user.bio}</p>
                  </div>
                  
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="mt-4 md:mt-0">
                      Modifier le profil
                    </Button>
                  ) : (
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userProjects.length} projets</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">4.8 (15 avis)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Formulaire d'édition */}
          {isEditing && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Modifier votre profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea 
                      id="bio" 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleInputChange} 
                      rows={4}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Onglets */}
          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList>
              <TabsTrigger value="projects">Projets</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Mes projets récents</h2>
              
              {userProjects.length > 0 ? (
                <div className="grid gap-4">
                  {userProjects.map((project) => (
                    <Card key={project.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                                {project.status === 'completed' ? 'Terminé' : 'En cours'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">Client: {project.client}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{project.date}</span>
                            {project.rating && (
                              <div className="flex items-center">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <StarIcon className="h-3 w-3 fill-primary text-primary" />
                                  <span>{project.rating}</span>
                                </Badge>
                              </div>
                            )}
                            <Button variant="outline" size="sm">Voir les détails</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Aucun projet pour le moment</h3>
                  <p className="text-muted-foreground mt-2">
                    Vous n'avez pas encore participé à des projets sur Crealink.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Aucun avis pour le moment</h3>
                <p className="text-muted-foreground mt-2">
                  Vous n'avez pas encore reçu d'avis sur votre travail.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="portfolio">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Portfolio vide</h3>
                <p className="text-muted-foreground mt-2">
                  Vous n'avez pas encore ajouté d'éléments à votre portfolio.
                </p>
                <Button className="mt-4">Ajouter un élément</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile; 