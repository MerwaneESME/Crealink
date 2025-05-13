import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      console.log("Tentative de chargement de la vidéo...");
      video.load();
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Vidéo en lecture");
          })
          .catch(error => {
            console.error("Erreur de lecture:", error);
          });
      }
    }
  }, []);

  return (
    <div className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Conteneur de la vidéo */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => {
            console.log("Vidéo chargée avec succès");
            setIsVideoLoaded(true);
          }}
          onError={(e) => {
            console.error("Erreur de chargement de la vidéo:", e);
          }}
        >
          <source 
            src="/videos/backgroundvideo.mp4" 
            type="video/mp4"
          />
        </video>
      </div>

      {/* Overlay avec dégradé */}
      <div className="fixed inset-0 bg-gradient-to-r from-purple-900/70 to-pink-900/70"></div>
      
      {/* Effet de fondu en bas */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      
      {/* Effets lumineux */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-[120px]"></div>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pink-500/20 blur-[120px]"></div>

      {/* Contenu */}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
              Commencer maintenant
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" className="border-2 border-white/20 hover:bg-white/10 text-white px-8 py-6 text-lg">
              En savoir plus
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {showScrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-white/50 animate-bounce" />
        </motion.div>
      )}
    </div>
  );
};

export default Hero;
