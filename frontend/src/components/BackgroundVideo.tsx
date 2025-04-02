import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BackgroundVideoProps {
  videoId?: string; // ID de la vidéo YouTube
}

const BackgroundVideo = ({ videoId = "tDQGSf0XYqY" }: BackgroundVideoProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative w-full min-h-[60vh] overflow-hidden"
    >
      {/* Overlay avec dégradé */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-pink-900/70 z-10"></div>
      
      {/* Overlay supérieur (dégradé vers le haut) */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background z-20"></div>
      
      {/* Vidéo YouTube en arrière-plan */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&playlist=${videoId}`}
          allow="autoplay; encrypted-media"
          className="absolute w-[300%] h-[300%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ border: 'none' }}
          title="YouTube video player"
        ></iframe>
      </div>
      
      {/* Contenu centré */}
      <div className="container mx-auto px-4 py-16 relative z-30">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
          >
            Transformez votre <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">présence en ligne</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl text-white/80 max-w-3xl mx-auto"
          >
            CREALINK vous connecte aux meilleurs talents du secteur pour propulser votre contenu vers de nouveaux sommets.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default BackgroundVideo; 