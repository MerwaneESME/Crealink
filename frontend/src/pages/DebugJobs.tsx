import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

const DebugJobs = () => {
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Tentative de connexion à Firestore pour récupérer les offres");
        const querySnapshot = await getDocs(collection(db, 'jobs'));
        console.log("Résultats obtenus:", querySnapshot.size, "documents");
        
        const jobs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Données brutes des offres:", jobs);
        setJobsData(jobs);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des offres:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10">Chargement des données...</div>;
  }

  if (error) {
    return (
      <div className="p-10">
        <h1 className="text-xl text-red-500 mb-4">Erreur lors du chargement des données</h1>
        <p>{error}</p>
        <div className="mt-4">
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Débogage des Offres</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>État de la connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Utilisateur connecté: {user ? 'Oui' : 'Non'}</p>
            {user && (
              <div className="mt-2">
                <p>ID: {user.uid}</p>
                <p>Rôle: {user.role}</p>
                <p>Email: {user.email}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Données des offres ({jobsData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsData.length === 0 ? (
              <p>Aucune offre trouvée dans la base de données.</p>
            ) : (
              <ul className="space-y-4">
                {jobsData.map(job => (
                  <li key={job.id} className="border border-gray-700 p-4 rounded-md">
                    <h3 className="font-bold">{job.title || 'Sans titre'}</h3>
                    <p className="text-sm text-gray-400">ID: {job.id}</p>
                    <p className="text-sm text-gray-400">Créateur: {job.creatorId}</p>
                    <p className="text-sm text-gray-400">Statut: {job.status || 'Non défini'}</p>
                    <p className="mt-2">{job.description?.substring(0, 100) || 'Pas de description'}...</p>
                    <div className="mt-2">
                      <Link 
                        to={`/jobs/${job.id}`}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Voir les détails
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <div className="flex space-x-4">
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/jobs">Page des offres</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DebugJobs; 