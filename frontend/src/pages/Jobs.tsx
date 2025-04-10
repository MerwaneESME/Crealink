import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  status: 'open' | 'closed';
}

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(jobsQuery);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      
      setJobs(jobsData);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la récupération des annonces',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (status: 'all' | 'open' | 'closed') => {
    setFilterStatus(status);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Annonces
        </h1>
        
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une annonce..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('all')}
              >
                Toutes
              </Button>
              <Button 
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('open')}
              >
                Ouvertes
              </Button>
              <Button 
                variant={filterStatus === 'closed' ? 'default' : 'outline'}
                onClick={() => handleFilterChange('closed')}
              >
                Fermées
              </Button>
            </div>
          </div>
          
          {user?.role === 'creator' && (
            <div className="flex justify-end">
              <Link to="/creator-dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Gérer mes annonces
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Chargement des annonces...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-8">Aucune annonce ne correspond à votre recherche</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <Card key={job.id} className="bg-black/30 border-purple-500/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription>
                        Par {job.creatorName} • Publiée le {format(new Date(job.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </CardDescription>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        job.status === 'open' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {job.status === 'open' ? 'Ouverte' : 'Fermée'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 line-clamp-3">{job.description}</p>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="font-medium">Budget: {job.budget}€</span>
                    <span>Date limite: {format(new Date(job.deadline), 'dd/MM/yyyy')}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  {user && job.status === 'open' && (
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Postuler
                    </Button>
                  )}
                  {!user && (
                    <Link to="/login" className="w-full">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Connectez-vous pour postuler
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs; 