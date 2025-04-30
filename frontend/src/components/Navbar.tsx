import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              CREALINK
            </span>
          </Link>

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

          {/* Boutons d'action - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-purple-500/20">
                      <AvatarImage src={user.photoURL || user.avatar || ''} alt={user.displayName || user.name} />
                      <AvatarFallback className="bg-purple-900/30 text-purple-200">
                        {getInitials(user.displayName || user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/90 text-white border border-purple-500/20 mt-1 backdrop-blur-md">
                  <DropdownMenuItem asChild>
                    <Link 
                      to={user.role === 'expert' ? '/portfolio' : '/creator-dashboard'} 
                      className="cursor-pointer hover:bg-purple-900/30"
                    >
                      {user.role === 'expert' ? 'Portfolio' : 'Tableau de bord'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer hover:bg-purple-900/30">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="cursor-pointer hover:bg-purple-900/30">Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  >
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

          {/* Bouton menu mobile */}
          <button
            className="md:hidden text-white"
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
            >
              Accueil
            </Link>
            <Link
              to="/jobs"
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname.includes('/jobs') ? 'text-purple-400' : 'text-gray-300'
              }`}
            >
              Offres
            </Link>
            <Link
              to="/about"
              className={`text-sm hover:text-purple-400 transition-colors ${
                location.pathname.includes('/about') ? 'text-purple-400' : 'text-gray-300'
              }`}
            >
              À propos
            </Link>

            {user ? (
              <>
                <div className="h-[1px] bg-purple-500/20 my-2"></div>
                <Link
                  to={user.role === 'expert' ? '/portfolio' : '/creator-dashboard'}
                  className="text-sm text-gray-300"
                >
                  {user.role === 'expert' ? 'Portfolio' : 'Tableau de bord'}
                </Link>
                <Link
                  to="/profile"
                  className="text-sm text-gray-300"
                >
                  Mon profil
                </Link>
                <Link
                  to="/messages"
                  className="text-sm text-gray-300"
                >
                  Messages
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-400"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <div className="h-[1px] bg-purple-500/20 my-2"></div>
                <Link
                  to="/login"
                  className="text-sm text-gray-300"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-gray-300"
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
