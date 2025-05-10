import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NeonLogo from '../components/NeonLogo';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Liste des corps de métier disponibles
const METIERS = [
  'Développement Web',
  'Design Graphique',
  'Marketing Digital',
  'Production Vidéo',
  'Photographie',
  'Rédaction',
  'Montage Vidéo',
  'Animation 3D',
  'Motion Design',
  'Community Management',
  'SEO/SEA',
  'Autre'
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Simuler un temps de chargement pour les animations
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section avec vidéo en fond */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center bg-black text-white">
        {/* Vidéo d'arrière-plan - Fichier local */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="relative w-full h-full">
            <video 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] ${videoLoaded ? 'opacity-70' : 'opacity-0'} transition-opacity duration-1000 object-cover`}
              src="/videos/backgroundvideo.mp4"
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
            />
            
            {/* Overlay pour assombrir la vidéo - moins d'opacité */}
            <div className="absolute inset-0 bg-black opacity-40"></div>
          </div>
        </div>

        {/* Effet de grille à la Tron */}
        <div className="absolute inset-0 z-0 bg-grid-pattern opacity-20"></div>

        {/* Effet néon sur les bords */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
        <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-pink-500 to-transparent opacity-50"></div>
        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-pink-500 to-transparent opacity-50"></div>

        {/* Contenu du hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}`}>
              
              {/* Slogan avec mots mis en évidence - adapté selon le rôle */}
              {user ? (
                <p className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4">
                  {user.role === 'expert' ? (
                    <>Trouvez les <span className="text-purple-400 font-bold">créateurs</span> qui ont besoin de vous</>
                  ) : (
                    <>Trouvez les <span className="text-pink-500 font-bold">experts</span> dont vous avez besoin</>
                  )}
                </p>
              ) : (
                <>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4">
                    Connectez les <span className="text-purple-400 font-bold">créateurs</span> aux <span className="text-pink-500 font-bold">experts</span> dont ils ont besoin
                  </p>
                  <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Trouvez les talents techniques pour développer votre présence en ligne.
                  </p>
                </>
              )}
              
              <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                  <Link to="/jobs">
                    <Button className="relative w-full px-8 py-3 text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 border-0">
                      Voir les offres
                    </Button>
                  </Link>
                </div>
                {!user && (
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/register">
                      <Button variant="outline" className="w-full px-8 py-3 text-base font-medium rounded-md border-purple-500 text-purple-100 hover:bg-purple-900/30 hover:text-white">
                        S'inscrire
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Éléments décoratifs néon flottants */}
        <div className="absolute top-1/4 left-10 w-8 h-8 rounded-full bg-purple-500/20 blur-xl animate-float"></div>
        <div className="absolute bottom-1/3 right-10 w-12 h-12 rounded-full bg-pink-500/20 blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/4 w-16 h-16 rounded-full bg-blue-500/20 blur-xl animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-10 h-10 rounded-full bg-purple-500/20 blur-xl animate-float-reverse"></div>
        
        {/* Transition effet au bas de la section hero */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent z-10"></div>
      </section>

      {/* Features Section - avec effet de transition en haut */}
      <section className="relative py-16 bg-black/95">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Comment ça fonctionne
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Une plateforme simple et efficace pour connecter créateurs et experts
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center bg-black/80 p-6 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-900/30 text-purple-400 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-white">
                  {user?.role === 'expert' ? '1. Parcourez les offres' : '1. Publiez votre offre'}
                </h3>
                <p className="mt-2 text-base text-gray-400 text-center">
                  {user?.role === 'expert' 
                    ? 'Trouvez des projets qui correspondent à vos compétences'
                    : 'Décrivez votre projet, les compétences requises et votre budget'}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center bg-black/80 p-6 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-900/30 text-purple-400 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-white">
                  {user?.role === 'expert' ? '2. Connectez vous avec des créateurs' : '2. Connectez-vous avec des experts'}
                </h3>
                <p className="mt-2 text-base text-gray-400 text-center">
                  {user?.role === 'expert'
                    ? 'Proposez vos services aux créateurs qui vous intéressent'
                    : 'Recevez des propositions d\'experts qualifiés et discutez avec eux'}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center bg-black/80 p-6 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-900/30 text-purple-400 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-white">3. Collaborez et réussissez</h3>
                <p className="mt-2 text-base text-gray-400 text-center">
                  Travaillez ensemble et développez votre présence en ligne.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-black/90 relative">
        <div className="absolute inset-0 z-0 opacity-5 bg-[url('/images/grid-pattern.svg')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Catégories d'experts
            </h2>
            {!user && (
              <p className="mt-4 text-lg text-gray-400">
                Trouvez l'expert idéal pour votre projet
              </p>
            )}
          </div>

          <div className="mt-10 relative">
            {/* Flèche gauche */}
            <button 
              onClick={() => {
                const container = document.getElementById('categories-container');
                if (container) {
                  const scrollAmount = 300;
                  const currentScroll = container.scrollLeft;
                  const maxScroll = container.scrollWidth - container.clientWidth;
                  
                  if (currentScroll <= 0) {
                    // Si on est au début, on va à la fin
                    container.scrollTo({ left: maxScroll, behavior: 'smooth' });
                  } else {
                    // Sinon on défile normalement vers la gauche
                    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                  }
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/80 p-2 rounded-full border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
              title="Défiler vers la gauche"
            >
              <ChevronLeft className="h-6 w-6 text-purple-400" />
            </button>

            {/* Container des catégories avec défilement */}
            <div 
              id="categories-container"
              className="flex overflow-x-auto gap-4 pb-4 px-16 mx-auto max-w-[1200px] scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Catégorie 1 - Développement Web */}
              <Link 
                to="/jobs?category=developpement-web"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Développement Web</h3>
                        <p className="text-sm text-gray-400">
                          Sites web, applications, intégrations et solutions techniques sur mesure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 2 - Design Graphique */}
              <Link 
                to="/jobs?category=design-graphique"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Design Graphique</h3>
                        <p className="text-sm text-gray-400">
                          Logos, identité visuelle, supports de communication et créations graphiques
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 3 - Production Vidéo */}
              <Link 
                to="/jobs?category=production-video"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Production Vidéo</h3>
                        <p className="text-sm text-gray-400">
                          Montage, animations, effets spéciaux et production audiovisuelle
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 4 - Marketing Digital */}
              <Link 
                to="/jobs?category=marketing-digital"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Marketing Digital</h3>
                        <p className="text-sm text-gray-400">
                          Stratégie marketing, réseaux sociaux, publicité en ligne
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 5 - Photographie */}
              <Link 
                to="/jobs?category=photographie"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Photographie</h3>
                        <p className="text-sm text-gray-400">
                          Photos professionnelles, retouche, direction artistique
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 6 - Rédaction */}
              <Link 
                to="/jobs?category=redaction"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Rédaction</h3>
                        <p className="text-sm text-gray-400">
                          Contenu web, articles, scripts et textes créatifs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 7 - Animation 3D */}
              <Link 
                to="/jobs?category=animation-3d"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Animation 3D</h3>
                        <p className="text-sm text-gray-400">
                          Modélisation 3D, animation, rendu et effets spéciaux
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 8 - Motion Design */}
              <Link 
                to="/jobs?category=motion-design"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Motion Design</h3>
                        <p className="text-sm text-gray-400">
                          Animations graphiques, transitions et effets visuels
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 9 - Community Management */}
              <Link 
                to="/jobs?category=community-management"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Community Management</h3>
                        <p className="text-sm text-gray-400">
                          Gestion de communauté, modération et engagement social
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 10 - SEO/SEA */}
              <Link 
                to="/jobs?category=seo-sea"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">SEO/SEA</h3>
                        <p className="text-sm text-gray-400">
                          Référencement naturel, publicité en ligne et optimisation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Catégorie 11 - Autre */}
              <Link 
                to="/jobs?category=autre"
                className="group block flex-shrink-0"
              >
                <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50 w-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-4 relative z-10">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">Autre</h3>
                        <p className="text-sm text-gray-400">
                          Autres compétences et services créatifs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Flèche droite */}
            <button 
              onClick={() => {
                const container = document.getElementById('categories-container');
                if (container) {
                  const scrollAmount = 300;
                  const currentScroll = container.scrollLeft;
                  const maxScroll = container.scrollWidth - container.clientWidth;
                  
                  if (currentScroll >= maxScroll) {
                    // Si on est à la fin, on retourne au début
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                  } else {
                    // Sinon on défile normalement vers la droite
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                  }
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/80 p-2 rounded-full border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
              title="Défiler vers la droite"
            >
              <ChevronRight className="h-6 w-6 text-purple-400" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section - affiché uniquement si l'utilisateur n'est pas connecté */}
      {!user && (
        <section className="relative bg-black py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20"></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">
                Prêt à démarrer votre projet ?
              </h2>
              <p className="mt-4 text-lg text-purple-200">
                Rejoignez notre communauté de créateurs et d'experts dès aujourd'hui
              </p>
              <div className="mt-8">
                <div className="inline-block relative group mx-3 mb-3">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                  <Link to="/register">
                    <Button variant="secondary" size="lg" className="relative bg-black text-white hover:bg-black/80 border-0">
                      S'inscrire gratuitement
                    </Button>
                  </Link>
                </div>
                <Link to="/jobs">
                  <Button variant="outline" size="lg" className="mx-3 bg-transparent border-purple-500 text-purple-100 hover:bg-purple-900/30 hover:text-white mb-3">
                    Parcourir les offres
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 