import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Github } from "lucide-react";
import NeonLogo from './NeonLogo';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-purple-900/20">
      {/* Effet de bordure néon en haut */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20"></div>
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="block">
              <NeonLogo size="sm" />
            </Link>
            <p className="text-gray-400 text-sm">
              Connectez les créateurs aux experts dont ils ont besoin pour développer leur présence en ligne.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-purple-400 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                <Youtube size={18} />
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Explorer</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Toutes les offres
                </Link>
              </li>
              <li>
                <Link to="/jobs?category=editeur" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Éditeurs vidéo
                </Link>
              </li>
              <li>
                <Link to="/jobs?category=graphiste" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Graphistes
                </Link>
              </li>
              <li>
                <Link to="/jobs?category=developpeur" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Développeurs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Informations</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cgu" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-purple-900/20 pt-8">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} CREALINK. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
