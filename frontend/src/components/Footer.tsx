import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Youtube, Github } from "lucide-react";
import NeonLogo from './NeonLogo';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-purple-900/20">
      {/* Effet de bordure néon en haut */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20"></div>
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6 items-start">
          {/* Logo et description */}
          <div className="col-span-2 space-y-3">
            <Link to="/" className="block">
              <NeonLogo size="xs" />
            </Link>
            <p className="text-gray-400 text-xs">
              Connectez les créateurs aux experts dont ils ont besoin pour développer leur présence en ligne.
            </p>
          </div>
          
          {/* Explorer */}
          <div className="col-span-1">
            <h3 className="text-xs font-medium text-white mb-2">Explorer</h3>
            <ul className="space-y-1">
              <li><Link to="/jobs" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">Toutes les offres</Link></li>
              <li><Link to="/jobs?category=editeur" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">Éditeurs vidéo</Link></li>
              <li><Link to="/jobs?category=graphiste" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">Graphistes</Link></li>
              <li><Link to="/jobs?category=developpeur" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">Développeurs</Link></li>
            </ul>
          </div>
          
          {/* Informations */}
          <div className="col-span-1">
            <h3 className="text-xs font-medium text-white mb-2">Informations</h3>
            <ul className="space-y-1">
              <li><Link to="/about" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">À propos</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">Contact</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Légal */}
          <div className="col-span-1">
            <h3 className="text-xs font-medium text-white mb-2">Légal</h3>
            <ul className="space-y-1">
              <li><Link to="/cgu" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors text-xs">Politique de confidentialité</Link></li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div className="col-span-1">
            <h3 className="text-xs font-medium text-white mb-2">Suivez-nous</h3>
            <div className="flex space-x-3 text-gray-400">
              <a href="#" className="hover:text-purple-400 transition-colors"><Twitter size={14} /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Instagram size={14} /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Youtube size={14} /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Github size={14} /></a>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-purple-900/20">
          <p className="text-gray-500 text-xs text-center">
            &copy; {new Date().getFullYear()} CREALINK. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
