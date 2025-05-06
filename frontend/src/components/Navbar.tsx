import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Menu, X, Bell } from 'lucide-react';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Badge } from '@/components/ui/badge';
import NeonLogo from './NeonLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Gérer le changement de style au scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Écouter les nouvelles notifications pour les experts
  useEffect(() => {
    if (!user || user.role !== 'expert') return;

    // Écouter les propositions d'offres adressées à cet expert
    const q = query(
      collection(db, 'job_proposals'),
      where('expertId', '==', user.uid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(newNotifications);
      setNotificationCount(newNotifications.length);
    }, (error) => {
      console.error("Erreur lors de l'écoute des notifications:", error);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Déterminer si un lien est actif
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-md shadow-md shadow-purple-900/10 border-b border-purple-500/10' 
          : 'bg-transparent'
      }`}
    >
      {/* Effet de bordure néon en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo et Texte */}
          <div className="flex items-center">
            <Link to="/" aria-label="Accueil">
              <NeonLogo size="sm" showText={false} />
            </Link>
            <span className="ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 glow-text">CREALINK</span>
          </div>

          {/* Navigation principale - Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname === '/' 
                  ? 'text-purple-400' 
                  : 'text-gray-300'
              }`}
            >
              Accueil
            </Link>
            <Link 
              to="/jobs" 
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname.includes('/jobs') 
                  ? 'text-purple-400' 
                  : 'text-gray-300'
              }`}
            >
              Offres
            </Link>
            <Link 
              to="/profiles" 
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname.includes('/profiles') 
                  ? 'text-purple-400' 
                  : 'text-gray-300'
              }`}
            >
              Profils
            </Link>
            <Link 
              to="/about" 
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname.includes('/about') 
                  ? 'text-purple-400' 
                  : 'text-gray-300'
              }`}
            >
              À propos
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications pour les experts */}
                {user && user.role === 'expert' && (
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative text-gray-300 hover:text-purple-400"
                    >
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs" variant="destructive">
                          {notificationCount}
                        </Badge>
                      )}
                    </Button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-black/90 border border-purple-500/20 rounded-md shadow-lg overflow-hidden z-50">
                        <div className="p-3 border-b border-purple-500/20">
                          <h3 className="font-medium">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-sm text-gray-400">
                              Aucune notification
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div key={notification.id} className="p-3 border-b border-purple-500/10 hover:bg-purple-900/10">
                                <p className="text-sm font-medium">{notification.creatorName} vous a proposé une offre</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt.toDate()).toLocaleString()}
                                </p>
                                <div className="mt-2 flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    className="text-xs py-0 h-7 bg-purple-600 hover:bg-purple-700"
                                    onClick={() => navigate(`/jobs/${notification.jobId}`)}
                                  >
                                    Voir l'offre
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Menu dropdown utilisateur */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden">
                      <Avatar>
                        <AvatarImage src={user.photoURL || user.avatar || undefined} />
                        <AvatarFallback className="bg-purple-900/30">{getInitials(user.displayName || user.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black/90 border-purple-500/20">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.displayName || user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">Profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">Tableau de bord</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="cursor-pointer">Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-purple-900/30 border-0">
                    Se connecter
                  </Button>
                </Link>
                <Link to="/register">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
                    <Button className="relative bg-black hover:bg-black/80 text-white border-0">
                      S'inscrire
                    </Button>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Afficher les notifications et le menu utilisateur */}
          <div className="md:hidden flex items-center space-x-2">
            {user && user.role === 'expert' && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-300 hover:text-purple-400"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs" variant="destructive">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-black/90 border border-purple-500/20 rounded-md shadow-lg overflow-hidden z-50">
                    <div className="p-3 border-b border-purple-500/20">
                      <h3 className="font-medium">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-400">
                          Aucune notification
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-3 border-b border-purple-500/10 hover:bg-purple-900/10">
                            <p className="text-sm font-medium">{notification.creatorName} vous a proposé une offre</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt.toDate()).toLocaleString()}
                            </p>
                            <div className="mt-2 flex gap-2">
                              <Button 
                                size="sm" 
                                variant="default"
                                className="text-xs py-0 h-7 bg-purple-600 hover:bg-purple-700"
                                onClick={() => {
                                  navigate(`/jobs/${notification.jobId}`);
                                  setShowNotifications(false);
                                }}
                              >
                                Voir l'offre
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden">
                    <Avatar>
                      <AvatarImage src={user.photoURL || user.avatar || undefined} />
                      <AvatarFallback className="bg-purple-900/30">{getInitials(user.displayName || user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/90 border-purple-500/20">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.displayName || user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">Tableau de bord</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="cursor-pointer">Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Bouton menu mobile */}
            <button
              className="text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4 bg-black/90 backdrop-blur-md border-purple-500/10 border-t">
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname === '/' ? 'text-purple-400' : 'text-gray-300'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/jobs"
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname.includes('/jobs') ? 'text-purple-400' : 'text-gray-300'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Offres
            </Link>
            <Link
              to="/profiles"
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname.includes('/profiles') ? 'text-purple-400' : 'text-gray-300'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profils
            </Link>
            <Link
              to="/about"
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname.includes('/about') ? 'text-purple-400' : 'text-gray-300'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              À propos
            </Link>

            {user ? (
              <>
                <div className="h-[1px] bg-purple-500/20 my-2"></div>
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/profile"
                  className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profil
                </Link>
                <Link
                  to="/messages"
                  className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <div className="h-[1px] bg-purple-500/20 my-2"></div>
                <Link
                  to="/login"
                  className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-purple-400 hover:text-purple-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
