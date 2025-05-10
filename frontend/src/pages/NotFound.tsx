import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        
        <h2 className="text-3xl font-bold">Page non trouvée</h2>
        
        <p className="text-gray-500 dark:text-gray-400">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/jobs">Parcourir les offres</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
