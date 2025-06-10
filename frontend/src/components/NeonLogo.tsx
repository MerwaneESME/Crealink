import React from 'react';
import { cn } from '@/lib/utils';

interface NeonLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  onClick?: () => void;
}

const NeonLogo: React.FC<NeonLogoProps> = ({ 
  className, 
  size = 'md', 
  showText = true,
  onClick
}) => {
  // Définir les tailles
  const sizes = {
    xs: 'w-24',
    sm: 'w-32',
    md: 'w-40',
    lg: 'w-48',
    xl: 'w-56'
  };

  return (
    <div 
      className={cn(
        "relative group cursor-pointer flex flex-col items-center", 
        className
      )}
      onClick={onClick}
    >
      <div className="relative">
        {/* Logo avec effet néon */}
        <img 
          src="/images/logo-crealink.png" 
          alt="Crealink" 
          className={cn(
            "z-10 relative drop-shadow-lg transition-all duration-500",
            sizes[size]
          )}
        />
        
        {/* Effet néon psychédélique amélioré */}
        <div className={cn(
          "absolute inset-0 opacity-70 group-hover:opacity-90 transition-opacity duration-1000",
          "z-0 scale-150 animate-pulse-slow",
          sizes[size]
        )} 
        style={{
          filter: 'blur(25px) brightness(1.3)',
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%',
          background: 'radial-gradient(circle, rgba(175,82,222,0.7) 0%, rgba(233,30,99,0.5) 40%, rgba(88,37,205,0.3) 70%, rgba(63,81,181,0.1) 100%)',
          boxShadow: '0 0 30px 5px rgba(138,43,226,0.4), 0 0 50px 10px rgba(233,30,99,0.2)'
        }}
        />
      </div>
      
      {/* Texte Crealink (optionnel) */}
      {showText && (
        <span className="mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold text-xl">
          CREALINK
        </span>
      )}
    </div>
  );
};

export default NeonLogo; 