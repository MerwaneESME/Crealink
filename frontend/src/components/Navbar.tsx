import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur shadow-md" : "bg-background/30 backdrop-blur"
      }`}
    >
      <div className="container mx-auto py-4 px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold relative overflow-hidden group">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
            CREALINK
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Accueil
          </Link>
          <Link to="/jobs" className="text-foreground hover:text-primary transition-colors">
            Offres
          </Link>
          <Link to="/messages" className="text-foreground hover:text-primary transition-colors">
            Messages
          </Link>
          <Link to="/about" className="text-foreground hover:text-primary transition-colors">
            À Propos
          </Link>
        </nav>

        {/* Boutons (connexion, inscription, thème, profil) */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          
          {/* Si l'utilisateur est connecté, afficher le menu profil, sinon les boutons de connexion/inscription */}
          {isAuthenticated ? (
            <UserProfileDropdown />
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Inscription</Link>
              </Button>
            </>
          )}
        </div>

        {/* Menu mobile */}
        <div className="md:hidden flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          
          {isAuthenticated && <UserProfileDropdown />}
          
          <button className="text-foreground" onClick={toggleMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur p-4 border-t">
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className="text-foreground hover:text-primary py-2 transition-colors"
              onClick={toggleMenu}
            >
              Accueil
            </Link>
            <Link
              to="/jobs"
              className="text-foreground hover:text-primary py-2 transition-colors"
              onClick={toggleMenu}
            >
              Offres
            </Link>
            <Link
              to="/messages"
              className="text-foreground hover:text-primary py-2 transition-colors"
              onClick={toggleMenu}
            >
              Messages
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary py-2 transition-colors"
              onClick={toggleMenu}
            >
              À Propos
            </Link>
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-2">
                <Link to="/login" onClick={toggleMenu}>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link to="/register" onClick={toggleMenu}>
                  <Button className="w-full">
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
