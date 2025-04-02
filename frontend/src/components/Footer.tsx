import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black/30 border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-crealink-purple to-crealink-pink flex items-center justify-center hover:shadow-[0_0_8px_rgba(97,18,217,0.3)] transition-shadow duration-300">
                  <span className="font-bold text-white text-xs">CL</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-gradient">CREALINK</span>
            </Link>
            <p className="text-white/60 text-sm mb-6">
              Connecter les créateurs et les experts pour créer du contenu exceptionnel.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-crealink-pink transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-white/60 hover:text-crealink-pink transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-white/60 hover:text-crealink-pink transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-white/60 hover:text-crealink-pink transition-colors">
                <Youtube size={18} />
              </a>
              <a href="#" className="text-white/60 hover:text-crealink-pink transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/60 hover:text-white transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/60 hover:text-white transition-colors text-sm">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-white/60 hover:text-white transition-colors text-sm">
                  Offres
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-white/60 hover:text-white transition-colors text-sm">
                  Messagerie
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Rejoindre</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/signup" className="text-white/60 hover:text-white transition-colors text-sm">
                  Pour les Créateurs
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-white/60 hover:text-white transition-colors text-sm">
                  Pour les Experts
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-white/60 hover:text-white transition-colors text-sm">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/60 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-white/60 text-sm">
                info@crealink.com
              </li>
              <li className="text-white/60 text-sm">
                Paris, France
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/contact" className="text-sm font-medium text-gradient">
                Contactez-nous →
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} CREALINK. Tous droits réservés.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-white/50 hover:text-white text-sm">
              Conditions d'utilisation
            </Link>
            <Link to="/privacy" className="text-white/50 hover:text-white text-sm">
              Politique de confidentialité
            </Link>
            <Link to="/cookies" className="text-white/50 hover:text-white text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
