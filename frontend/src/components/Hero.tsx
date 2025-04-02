import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeroProps {
  videoId?: string;
}

const Hero = ({ videoId = "tDQGSf0XYqY" }: HeroProps) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Fond vidéo YouTube */}
        <div className="absolute inset-0 pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&playlist=${videoId}`}
            allow="autoplay; encrypted-media"
            className="absolute w-[300%] h-[300%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ border: 'none' }}
            title="YouTube video player"
          ></iframe>
        </div>
        
        {/* Overlay avec dégradé */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-pink-900/70 z-1"></div>
        
        {/* Effet de fondu en bas pour la transition avec "Nos services" */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-2"></div>
        
        {/* Effets lumineux */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-[120px] z-2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pink-500/20 blur-[120px] z-2"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-4 z-10 text-center"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 inline-block font-black"
            style={{
              WebkitTextStroke: "1px rgba(0,0,0,0.7)"
            }}
          >
            CREALINK
          </motion.span>
        </h1>
        
        <div className="overflow-hidden h-16">
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto"
            style={{ 
              textShadow: "1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)" 
            }}
          >
            Connectez des{" "}
            <span className="text-pink-500 font-semibold">créateurs passionnés</span> avec des{" "}
            <span className="text-purple-500 font-semibold">experts techniques</span>
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col md:flex-row gap-4 justify-center mt-8"
        >
          <Link to="/signup">
            <Button className="neon-button text-lg px-8 py-6">
              Rejoindre en tant que Créateur
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              variant="outline"
              className="neon-border rounded-full border border-white/20 text-white hover:bg-white/5 text-lg px-8 py-6"
            >
              Rejoindre en tant qu'Expert
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {showScrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <p className="text-white/50 text-sm mb-2">Scroll to explore</p>
          <ChevronDown className="text-white/50 animate-bounce" size={24} />
        </motion.div>
      )}
    </div>
  );
};

export default Hero;
