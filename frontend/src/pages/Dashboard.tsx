import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Tableau de bord</h1>
        <Button asChild>
          <Link to="/jobs/create">Créer une offre</Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="jobs">Mes offres</TabsTrigger>
          <TabsTrigger value="applications">Mes candidatures</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Offres publiées</CardTitle>
                <CardDescription>Vos offres d'emploi actives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <div className="mt-1 text-sm text-gray-500">Offres actives</div>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link to="/jobs">Voir mes offres</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Candidatures</CardTitle>
                <CardDescription>Vos demandes en attente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <div className="mt-1 text-sm text-gray-500">Candidatures envoyées</div>
                <Button variant="outline" className="mt-4 w-full">
                  Voir mes candidatures
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Vos conversations récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <div className="mt-1 text-sm text-gray-500">Messages non lus</div>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link to="/messages">Voir mes messages</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Les dernières actions sur votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Aucune activité récente.</p>
                <p className="mt-2">Commencez à explorer les offres ou publiez votre première offre.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Mes offres</CardTitle>
              <CardDescription>Les offres que vous avez publiées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Vous n'avez pas encore publié d'offres.</p>
                <Button className="mt-4" asChild>
                  <Link to="/jobs/create">Publier une offre</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Mes candidatures</CardTitle>
              <CardDescription>Les offres auxquelles vous avez postulé</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Vous n'avez pas encore postulé à des offres.</p>
                <Button className="mt-4" asChild>
                  <Link to="/jobs">Explorer les offres</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Mes messages</CardTitle>
              <CardDescription>Vos conversations récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Vous n'avez pas encore de messages.</p>
                <p className="mt-2">Les messages apparaîtront ici lorsque vous communiquerez avec d'autres utilisateurs.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 