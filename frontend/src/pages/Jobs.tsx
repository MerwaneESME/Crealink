import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  status: string;
  creatorId: string;
  createdAt: any;
  skills: string[];
}

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || 'all');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Remplacer par un appel API réel lorsque le backend sera prêt
        // const response = await jobsApi.getJobs({ 
        //   category: categoryFilter !== 'all' ? categoryFilter : undefined,
        //   search: searchTerm || undefined
        // });
        // setJobs(response.data.jobs);
        
        // En attendant l'implémentation de l'API, on simule un délai
        setTimeout(() => {
          setJobs([]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [categoryFilter, searchTerm]);

  // Filtrer les jobs en fonction des critères
  const filteredJobs = jobs.filter(job => {
    // Filtre par catégorie
    if (categoryFilter && categoryFilter !== 'all' && job.category !== categoryFilter) {
      return false;
    }
    
    // Filtre par recherche (dans le titre ou la description)
    if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !job.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCategoryFilter(value === 'all' ? '' : value);
    
    // Mettre à jour l'URL
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', value);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mettre à jour l'URL
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
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
              <Select value={activeTab} onValueChange={handleTabChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="editeur">Éditeurs vidéo</SelectItem>
                  <SelectItem value="graphiste">Graphistes</SelectItem>
                  <SelectItem value="developpeur">Développeurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit">Rechercher</Button>
          </form>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">Toutes les offres</TabsTrigger>
            <TabsTrigger value="editeur">Éditeurs vidéo</TabsTrigger>
            <TabsTrigger value="graphiste">Graphistes</TabsTrigger>
            <TabsTrigger value="developpeur">Développeurs</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="mb-2">
                        {job.status === 'open' ? 'Active' : 'Fermée'}
                      </Badge>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                    </div>
                    <Badge variant="outline">{job.category === 'editeur' ? 'Éditeur vidéo' : job.category === 'graphiste' ? 'Graphiste' : 'Développeur'}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CoinsIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.budget}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Publié le {formatDate(job.createdAt.seconds)}</span>
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
                  <Button className="w-full" asChild>
                    <Link to={`/jobs/${job.id}`}>Voir les détails</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <h3 className="text-xl font-medium mb-2">Aucune offre trouvée</h3>
            <p className="text-muted-foreground">
              {jobs.length === 0 
                ? "Il n'y a pas encore d'offres. Revenez plus tard ou publiez votre propre offre !" 
                : "Essayez de modifier vos critères de recherche"}
            </p>
            <Button className="mt-4" asChild>
              <Link to="/create-job">Publier une offre</Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Jobs; 