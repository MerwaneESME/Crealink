import { useEffect, useState } from 'react';
import { jobsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CalendarIcon, SearchIcon, MapPinIcon, CoinsIcon, ClockIcon, TagIcon } from 'lucide-react';

// Types
interface Job {
  _id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    profileImage: string;
    role: string;
  };
  jobType: 'creator-post' | 'expert-post';
  category: string;
  budget: number;
  duration: string;
  location: string;
  skills: string[];
  status: string;
  createdAt: string;
  views: number;
}

// Données d'exemple
const sampleJobs: Job[] = [
  {
    _id: '1',
    title: 'Recherche monteur vidéo pour ma chaîne gaming',
    description: "Je recherche un monteur vidéo expérimenté pour éditer mes vidéos de gameplay. Vous devrez être à l'aise avec Premiere Pro et être capable de créer des montages dynamiques avec effets sonores et visuels.",
    creator: {
      name: 'GameMaster',
      profileImage: '',
      role: 'creator'
    },
    jobType: 'creator-post',
    category: 'editing',
    budget: 250,
    duration: '1-2 semaines',
    location: 'remote',
    skills: ['Premiere Pro', 'After Effects', 'Montage gaming'],
    status: 'open',
    createdAt: '2025-03-20T10:00:00.000Z',
    views: 124
  },
  {
    _id: '2',
    title: 'Expert en thumbnails pour chaîne lifestyle',
    description: "Je recherche un graphiste talentueux pour créer des miniatures attrayantes pour ma chaîne YouTube lifestyle. Vous devez avoir un bon sens du design et comprendre les tendances actuelles.",
    creator: {
      name: 'LifestyleQueen',
      profileImage: '',
      role: 'creator'
    },
    jobType: 'creator-post',
    category: 'thumbnail',
    budget: 100,
    duration: '2-3 jours',
    location: 'remote',
    skills: ['Photoshop', 'Design graphique', 'Composition'],
    status: 'open',
    createdAt: '2025-03-22T14:30:00.000Z',
    views: 98
  },
  {
    _id: '3',
    title: 'Proposition de services de montage vidéo professionnel',
    description: "Monteur vidéo professionnel avec 5 ans d'expérience propose ses services pour créer des montages de qualité. Spécialisé dans les vidéos lifestyle, voyage et beauté.",
    creator: {
      name: 'EditPro',
      profileImage: '',
      role: 'expert'
    },
    jobType: 'expert-post',
    category: 'editing',
    budget: 350,
    duration: '3-5 jours par vidéo',
    location: 'remote',
    skills: ['Premiere Pro', 'DaVinci Resolve', 'Color Grading', 'Sound Design'],
    status: 'open',
    createdAt: '2025-03-18T09:15:00.000Z',
    views: 156
  },
  {
    _id: '4',
    title: 'Photographe disponible pour shooting produits',
    description: "Photographe professionnel propose ses services pour des shootings de produits de haute qualité. Idéal pour les créateurs souhaitant mettre en valeur des produits dérivés ou des partenariats.",
    creator: {
      name: 'PhotoExpert',
      profileImage: '',
      role: 'expert'
    },
    jobType: 'expert-post',
    category: 'other',
    budget: 500,
    duration: '1 journée',
    location: 'hybrid',
    skills: ['Photographie produit', 'Lightroom', 'Retouche photo'],
    status: 'open',
    createdAt: '2025-03-21T11:45:00.000Z',
    views: 87
  },
  {
    _id: '5',
    title: 'Cherche scénariste pour nouvelle série de vidéos',
    description: "Je lance une nouvelle série sur ma chaîne et je recherche un scénariste pour m'aider à structurer le contenu et créer des scripts engageants. Thématique: vulgarisation scientifique.",
    creator: {
      name: 'ScienceFun',
      profileImage: '',
      role: 'creator'
    },
    jobType: 'creator-post',
    category: 'scriptwriting',
    budget: 300,
    duration: '2 semaines',
    location: 'remote',
    skills: ['Scénarisation', 'Vulgarisation', 'Storytelling'],
    status: 'open',
    createdAt: '2025-03-19T16:20:00.000Z',
    views: 112
  },
  {
    _id: '6',
    title: 'Animation 2D pour intro de chaîne',
    description: "Je propose mes services d'animation 2D pour créer des intros de chaîne YouTube personnalisées. Style moderne et dynamique, animations fluides garanties.",
    creator: {
      name: 'AnimationStudio',
      profileImage: '',
      role: 'expert'
    },
    jobType: 'expert-post',
    category: 'animation',
    budget: 450,
    duration: '1 semaine',
    location: 'remote',
    skills: ['After Effects', 'Animation 2D', 'Motion Graphics'],
    status: 'open',
    createdAt: '2025-03-17T13:10:00.000Z',
    views: 143
  },
  {
    _id: '7',
    title: 'Voix-off pour documentaires éducatifs',
    description: "Acteur voix-off propose ses services pour narration de documentaires, vidéos éducatives et explicatives. Voix posée, claire et professionnelle avec home studio équipé.",
    creator: {
      name: 'VoiceProStudio',
      profileImage: '',
      role: 'expert'
    },
    jobType: 'expert-post',
    category: 'voiceover',
    budget: 200,
    duration: '2-4 jours',
    location: 'remote',
    skills: ['Narration', 'Mixage audio', 'Diction claire'],
    status: 'open',
    createdAt: '2025-03-16T08:45:00.000Z',
    views: 78
  },
  {
    _id: '8',
    title: 'Recherche caméraman pour tournage événement',
    description: "Créateur de contenu cherche un caméraman professionnel pour filmer un événement sportif le 15 avril. Matériel fourni mais possibilité d'utiliser votre propre équipement.",
    creator: {
      name: 'SportVlogger',
      profileImage: '',
      role: 'creator'
    },
    jobType: 'creator-post',
    category: 'filming',
    budget: 400,
    duration: '1 journée',
    location: 'on-site',
    skills: ['Prise de vue', 'Stabilisation', 'Éclairage'],
    status: 'open',
    createdAt: '2025-03-23T10:30:00.000Z',
    views: 65
  },
  {
    _id: '9',
    title: 'Services de copywriting pour descriptions vidéo',
    description: "Rédacteur web spécialisé dans l'optimisation SEO propose ses services pour rédiger des descriptions YouTube percutantes et optimisées pour le référencement.",
    creator: {
      name: 'CopyExpert',
      profileImage: '',
      role: 'expert'
    },
    jobType: 'expert-post',
    category: 'other',
    budget: 150,
    duration: '2 jours',
    location: 'remote',
    skills: ['SEO', 'Copywriting', 'YouTube optimization'],
    status: 'open',
    createdAt: '2025-03-15T14:20:00.000Z',
    views: 92
  },
  {
    _id: '10',
    title: 'Besoin d\'aide pour chaîne culinaire',
    description: "Je lance une chaîne culinaire et recherche un expert pour m'aider sur tous les aspects techniques : tournage, éclairage, montage. Possibilité de collaboration à long terme.",
    creator: {
      name: 'ChefYouTube',
      profileImage: '',
      role: 'creator'
    },
    jobType: 'creator-post',
    category: 'filming',
    budget: 600,
    duration: '1 mois (temps partiel)',
    location: 'hybrid',
    skills: ['Filming', 'Lighting', 'Food photography', 'Editing'],
    status: 'open',
    createdAt: '2025-03-22T09:15:00.000Z',
    views: 147
  },
  {
    _id: '11',
    title: 'Sound designer pour série de podcasts',
    description: "Expert en sound design cherche créateurs de contenu pour améliorer la qualité audio de leurs podcasts. Services incluant mixage, mastering et habillage sonore personnalisé.",
    creator: {
      name: 'SoundSpecialist',
      profileImage: '',
      role: 'expert'
    },
    jobType: 'expert-post',
    category: 'other',
    budget: 300,
    duration: '1 semaine par épisode',
    location: 'remote',
    skills: ['Sound design', 'Mixing', 'Mastering', 'Podcast production'],
    status: 'open',
    createdAt: '2025-03-19T11:45:00.000Z',
    views: 112
  },
  {
    _id: '12',
    title: 'Recherche artiste 3D pour modélisation',
    description: "Créateur de contenu gaming cherche artiste 3D pour créer des modèles et animations pour intro et éléments graphiques. Style cartoon/low-poly préféré.",
    creator: {
      name: 'GamerPro',
      profileImage: '',
      role: 'creator'
    },
    jobType: 'creator-post',
    category: 'animation',
    budget: 500,
    duration: '2 semaines',
    location: 'remote',
    skills: ['Blender', '3D Modeling', 'Animation 3D', 'Texturing'],
    status: 'open',
    createdAt: '2025-03-21T15:30:00.000Z',
    views: 89
  }
];

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    // Filtrer les jobs selon les critères
    let filteredJobs = [...sampleJobs];
    
    if (currentTab === 'creator') {
      filteredJobs = filteredJobs.filter(job => job.jobType === 'creator-post');
    } else if (currentTab === 'expert') {
      filteredJobs = filteredJobs.filter(job => job.jobType === 'expert-post');
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) || 
        job.description.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.category === category);
    }

    setJobs(filteredJobs);
  }, [currentTab, searchTerm, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche est déjà gérée par l'effet useEffect
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Offres d'emploi</h1>
          <p className="text-muted-foreground">
            Trouvez des opportunités de collaboration avec des créateurs de contenu et des experts
          </p>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des offres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="editing">Montage</SelectItem>
                  <SelectItem value="filming">Tournage</SelectItem>
                  <SelectItem value="scriptwriting">Scénario</SelectItem>
                  <SelectItem value="thumbnail">Miniature</SelectItem>
                  <SelectItem value="voiceover">Voix-off</SelectItem>
                  <SelectItem value="animation">Animation</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit">Rechercher</Button>
          </form>
        </div>

        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">Toutes les offres</TabsTrigger>
            <TabsTrigger value="creator">Offres d'influenceurs</TabsTrigger>
            <TabsTrigger value="expert">Offres d'experts</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-destructive p-4">
            {error}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant={job.jobType === 'creator-post' ? 'default' : 'secondary'} className="mb-2">
                        {job.jobType === 'creator-post' ? 'Influenceur' : 'Expert'}
                      </Badge>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                    </div>
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CoinsIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.budget} €</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.duration}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.location === 'remote' ? 'À distance' : job.location === 'on-site' ? 'Sur site' : 'Hybride'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Publié le {formatDate(job.createdAt)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 3 && (
                      <Badge variant="outline">+{job.skills.length - 3}</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Voir l'offre</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <h3 className="text-xl font-medium mb-2">Aucune offre trouvée</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Jobs; 