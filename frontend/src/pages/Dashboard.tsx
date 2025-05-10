import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { jobService, Job } from "@/services/jobService";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const allJobs = await jobService.getAllJobs();
        // Filtrer pour n'afficher que les offres de l'utilisateur connecté
        const userJobs = allJobs.filter(job => job.creatorId === user?.uid);
        setJobs(userJobs);
      } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchJobs();
    }
  }, [user]);

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await jobService.deleteJob(jobId);
        setJobs(jobs.filter(job => job.id !== jobId));
      } catch (error) {
        console.error("Erreur lors de la suppression de l'offre:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
        <div className="container mx-auto px-4 py-8">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes Offres d'Emploi</h1>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link to="/jobs/new">Créer une nouvelle offre</Link>
          </Button>
        </div>

        <Card className="bg-black/50 border-purple-500/20">
          <CardHeader>
            <CardTitle>Liste des offres</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Vous n'avez pas encore créé d'offres d'emploi.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de publication</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        {job.jobType === 'fixed' ? 'Forfait' : 'À l\'heure'}
                      </TableCell>
                      <TableCell>{job.budget}€</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          job.status === 'open' 
                            ? "bg-green-500/20 text-green-400" 
                            : job.status === 'in_progress'
                            ? "bg-blue-500/20 text-blue-400"
                            : job.status === 'completed'
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}>
                          {job.status === 'open' ? 'Ouverte' :
                           job.status === 'in_progress' ? 'En cours' :
                           job.status === 'completed' ? 'Terminée' : 'Annulée'}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-purple-500/20"
                            asChild
                          >
                            <Link to={`/jobs/${job.id}`}>Voir</Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-purple-500/20"
                            asChild
                          >
                            <Link to={`/jobs/${job.id}/edit`}>Modifier</Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-500/20 text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 