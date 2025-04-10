import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24 bg-gradient-to-b from-black to-purple-950/20 min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 blur-3xl -z-10"></div>
        <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
          À propos de CREALINK
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          CREALINK est une plateforme innovante qui connecte les créateurs de contenu avec des experts qualifiés pour donner vie à des projets exceptionnels.
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 blur-3xl -z-10"></div>
        <Card className="p-6 bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardContent>
            <h2 className="text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Notre Mission
            </h2>
            <p className="text-lg mb-6 text-gray-300">
              Nous croyons que chaque créateur mérite d'avoir accès aux meilleurs talents pour réaliser sa vision. Notre mission est de :
            </p>
            <ul className="list-disc list-inside space-y-3 text-lg text-gray-300">
              <li className="hover:text-purple-400 transition-colors">Faciliter la collaboration entre créateurs et experts</li>
              <li className="hover:text-pink-400 transition-colors">Promouvoir l'excellence dans la création de contenu</li>
              <li className="hover:text-blue-400 transition-colors">Créer une communauté d'entraide et de partage</li>
              <li className="hover:text-purple-400 transition-colors">Simplifier la gestion de projets créatifs</li>
            </ul>
          </CardContent>
        </Card>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-3 gap-6 mb-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 blur-3xl -z-10"></div>
        
        <Card className="p-6 bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Pour les Créateurs
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-purple-400 transition-colors">Accès à des experts qualifiés</li>
              <li className="hover:text-purple-400 transition-colors">Gestion simplifiée des projets</li>
              <li className="hover:text-purple-400 transition-colors">Système de messagerie intégré</li>
              <li className="hover:text-purple-400 transition-colors">Évaluation des collaborateurs</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="p-6 bg-black/40 backdrop-blur-sm border border-pink-500/20 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-blue-400">
              Pour les Experts
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-pink-400 transition-colors">Visibilité auprès des créateurs</li>
              <li className="hover:text-pink-400 transition-colors">Portfolio personnalisé</li>
              <li className="hover:text-pink-400 transition-colors">Gestion des disponibilités</li>
              <li className="hover:text-pink-400 transition-colors">Système de paiement sécurisé</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="p-6 bg-black/40 backdrop-blur-sm border border-blue-500/20 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
          <CardContent>
            <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Notre Technologie
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-blue-400 transition-colors">Interface moderne et intuitive</li>
              <li className="hover:text-blue-400 transition-colors">Sécurité des données</li>
              <li className="hover:text-blue-400 transition-colors">Support réactif</li>
              <li className="hover:text-blue-400 transition-colors">Mises à jour régulières</li>
            </ul>
          </CardContent>
        </Card>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 blur-3xl -z-10"></div>
        <h2 className="text-3xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
          Rejoignez l'Aventure
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-300">
          Prêt à donner vie à vos projets créatifs ? Rejoignez notre communauté grandissante de créateurs et d'experts.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300">
            <Link to="/register">S'inscrire</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-purple-500/30 text-white hover:bg-purple-900/30 hover:text-white transition-all duration-300">
            <Link to="/jobs">Voir les Offres</Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default About; 