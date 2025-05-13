import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface BackgroundVideoProps {
  customVideo?: string; // Chemin vers une vidéo personnalisée
}

const BackgroundVideo = ({ customVideo = "/videos/backgroundvideo.mp4" }: BackgroundVideoProps) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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
      
      {/* Vidéo locale en arrière-plan */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <video
          src={customVideo}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute w-full h-full object-cover ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-1000`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
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