import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import { MessageSquareText, Video, PenTool, TrendingUp, Zap, Trophy } from "lucide-react";
import Footer from "@/components/Footer";
import CreatorSpotlight from "@/components/CreatorSpotlight";

const Index = () => {
  const [currentTab, setCurrentTab] = useState<"creators" | "experts">("creators");

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // ID de la vidéo YouTube
  const youtubeVideoId = "tDQGSf0XYqY";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero videoId={youtubeVideoId} />
      
      {/* Services Section */}
      <section id="services" className="py-20 px-4 container mx-auto relative overflow-hidden">
        <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-purple-600/10 blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-pink-500/10 blur-[120px]"></div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">Nos Services</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            CREALINK connecte les créateurs de contenu avec les meilleurs experts du secteur pour amplifier votre présence en ligne.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard 
            title="Montage Vidéo" 
            description="Des montages professionnels qui captent l'attention et maximisent l'engagement de votre audience."
            icon={<Video size={24} />}
            delay={0.1}
          />
          <ServiceCard 
            title="Scriptwriting" 
            description="Des scripts percutants qui transforment vos idées en contenu viral et mémorable."
            icon={<PenTool size={24} />}
            delay={0.2}
          />
          <ServiceCard 
            title="Stratégie de Contenu" 
            description="Analyses approfondies et stratégies data-driven pour optimiser votre croissance."
            icon={<TrendingUp size={24} />}
            delay={0.3}
          />
          <ServiceCard 
            title="Cadrage & Direction" 
            description="Expertise en cadrage et direction pour une qualité visuelle professionnelle et distinctive."
            icon={<MessageSquareText size={24} />}
            delay={0.4}
          />
          <ServiceCard 
            title="Optimisation SEO" 
            description="Maximisez votre visibilité avec des stratégies SEO conçues spécifiquement pour les créateurs."
            icon={<Zap size={24} />}
            delay={0.5}
          />
          <ServiceCard 
            title="Coaching Créatif" 
            description="Accompagnement personnalisé pour développer votre style unique et votre présence sur les réseaux."
            icon={<Trophy size={24} />}
            delay={0.6}
          />
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 container mx-auto relative">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Comment ça marche</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Un processus simple pour connecter créateurs et experts en quelques étapes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-card rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-purple-600/10 rounded-full blur-xl group-hover:bg-purple-600/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Inscrivez-vous</h3>
              <p className="text-white/70">
                Créez un profil personnalisé en fonction de vos besoins ou de votre expertise.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="glass-card rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Trouvez votre match</h3>
              <p className="text-white/70">
                Explorez notre réseau d'experts qualifiés ou trouvez des projets créatifs passionnants.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="glass-card rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-purple-600/10 rounded-full blur-xl group-hover:bg-purple-600/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Collaborez</h3>
              <p className="text-white/70">
                Communiquez, créez et développez votre présence en ligne ensemble dans un environnement sécurisé.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Creator/Expert Spotlight Section */}
      <CreatorSpotlight currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* CTA Section */}
      <section className="py-20 px-4 container mx-auto relative">
        <div className="glass-card rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-500/20"></div>
          <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-purple-600/30 blur-[80px]"></div>
          <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-pink-500/30 blur-[80px]"></div>
          
          <div className="relative z-10 py-16 px-4 md:px-8 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
            >
              Prêt à faire passer votre contenu <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">au niveau supérieur</span> ?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/70 max-w-2xl mx-auto mb-8"
            >
              Rejoignez CREALINK dès aujourd'hui et connectez-vous avec les meilleurs talents du secteur.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="/signup" className="neon-button text-lg px-8 py-4">
                Rejoindre comme Créateur
              </a>
              <a href="/signup" className="neon-border rounded-full border border-white/20 text-white hover:bg-white/5 text-lg px-8 py-4">
                Rejoindre comme Expert
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
