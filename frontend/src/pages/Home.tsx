import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

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
        {/* Vidéo d'arrière-plan - YouTube embed */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="relative w-full h-full">
            <iframe 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] ${videoLoaded ? 'opacity-70' : 'opacity-0'} transition-opacity duration-1000`}
              src="https://www.youtube.com/embed/tDQGSf0XYqY?autoplay=1&mute=1&controls=0&loop=1&playlist=tDQGSf0XYqY&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3"
              title="Background Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setVideoLoaded(true)}
            ></iframe>
            
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
              {/* CREALINK en néon */}
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-6 neon-text animate-neon-pulse text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                CREALINK
              </h1>
              
              {/* Slogan avec mots mis en évidence */}
              <p className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4">
                Connectez les <span className="text-purple-400 font-bold">créateurs</span> aux <span className="text-pink-500 font-bold">experts</span> dont ils ont besoin
              </p>
              
              <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Trouvez les talents techniques pour développer votre présence en ligne.
              </p>
              
              <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                  <Link to="/jobs">
                    <Button className="relative w-full px-8 py-3 text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 border-0">
                      Voir les offres
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to="/register">
                    <Button variant="outline" className="w-full px-8 py-3 text-base font-medium rounded-md border-purple-500 text-purple-100 hover:bg-purple-900/30 hover:text-white">
                      S'inscrire
                    </Button>
                  </Link>
                </div>
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
                <h3 className="mt-6 text-xl font-medium text-white">1. Publiez votre offre</h3>
                <p className="mt-2 text-base text-gray-400 text-center">
                  Décrivez votre projet, les compétences requises et votre budget.
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
                <h3 className="mt-6 text-xl font-medium text-white">2. Connectez-vous avec des experts</h3>
                <p className="mt-2 text-base text-gray-400 text-center">
                  Recevez des propositions d'experts qualifiés et discutez avec eux.
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
            <p className="mt-4 text-lg text-gray-400">
              Trouvez l'expert idéal pour votre projet
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Category 1 */}
            <Link to="/jobs?category=editeur" className="group block">
              <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-6 relative z-10">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Éditeurs Vidéo</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        Montage, animations, effets spéciaux
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Category 2 */}
            <Link to="/jobs?category=graphiste" className="group block">
              <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-6 relative z-10">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Graphistes</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        Logos, miniatures, bannières
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Category 3 */}
            <Link to="/jobs?category=developpeur" className="group block">
              <div className="relative bg-black/80 overflow-hidden shadow-lg shadow-purple-500/10 rounded-lg transition-all duration-300 group-hover:shadow-purple-500/30 border border-purple-500/20 group-hover:border-purple-500/50">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="p-6 relative z-10">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-900/30 rounded-md p-3 text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Développeurs</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        Sites web, applications, intégrations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
    </div>
  );
} 