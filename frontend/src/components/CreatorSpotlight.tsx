
import { useState } from "react";
import { motion } from "framer-motion";
import { Tab } from "@/components/ui/tab";
import { cn } from "@/lib/utils";
import { Star, CheckCircle, Award } from "lucide-react";

interface CreatorSpotlightProps {
  currentTab: "creators" | "experts";
  setCurrentTab: (tab: "creators" | "experts") => void;
}

const CreatorSpotlight: React.FC<CreatorSpotlightProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const slideIn = {
    hidden: { opacity: 0, x: 30 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const creators = [
    {
      name: "Marie Laurent",
      role: "Lifestyle Creator",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      highlight: "2M+ abonnés",
      description: "A augmenté son engagement de 150% en 3 mois avec CREALINK",
      tags: ["Lifestyle", "Mode", "Voyage"],
    },
    {
      name: "Thomas Dubois",
      role: "Gaming Creator",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMG1hbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      highlight: "500K+ abonnés",
      description: "A doublé sa production de contenu avec notre réseau d'experts",
      tags: ["Gaming", "Tech", "Esports"],
    },
    {
      name: "Sarah Morel",
      role: "Beauty Creator",
      image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHByb2ZpbGUlMjBmZW1hbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      highlight: "1.5M+ abonnés",
      description: "A développé sa propre marque grâce à notre coaching stratégique",
      tags: ["Beauté", "Lifestyle", "Bien-être"],
    }
  ];

  const experts = [
    {
      name: "Lucas Mercier",
      role: "Monteur Vidéo",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fHByb2ZpbGUlMjBtYWxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
      highlight: "10+ ans d'expérience",
      description: "Spécialiste du montage dynamique et rythmé pour contenus viraux",
      tags: ["After Effects", "Premiere Pro", "DaVinci Resolve"],
    },
    {
      name: "Emma Bernard",
      role: "Scripwriter",
      image: "https://images.unsplash.com/photo-1619698574308-7a31bcb60885?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fHByb2ZpbGUlMjBmZW1hbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      highlight: "200+ scripts réalisés",
      description: "Développe des scripts engageants pour les niches lifestyle et beauté",
      tags: ["Storytelling", "Copywriting", "Scénarios"],
    },
    {
      name: "Mathieu Leroy",
      role: "Expert SEO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fHByb2ZpbGUlMjBtYWxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
      highlight: "30+ clients satisfaits",
      description: "A aidé des créateurs à multiplier leur trafic organique par 10",
      tags: ["SEO", "Analytics", "Growth Hacking"],
    }
  ];

  return (
    <section id="spotlights" className="py-20 px-4 container mx-auto relative">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
          La communauté CREALINK
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Découvrez les créateurs et experts qui réussissent sur notre plateforme.
        </p>
      </motion.div>

      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-full p-1 bg-black/40 backdrop-blur-lg border border-white/10">
          <button
            onClick={() => setCurrentTab("creators")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
              currentTab === "creators"
                ? "bg-gradient-to-r from-crealink-purple to-crealink-pink text-white shadow-lg"
                : "text-white/70 hover:text-white"
            )}
          >
            Créateurs
          </button>
          <button
            onClick={() => setCurrentTab("experts")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
              currentTab === "experts"
                ? "bg-gradient-to-r from-crealink-purple to-crealink-pink text-white shadow-lg"
                : "text-white/70 hover:text-white"
            )}
          >
            Experts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(currentTab === "creators" ? creators : experts).map((profile, index) => (
          <motion.div
            key={profile.name}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideIn}
            className="glass-card rounded-xl p-6 hover:shadow-[0_0_15px_rgba(97,18,217,0.3)] transition-all duration-500 group"
          >
            <div className="flex items-center mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-crealink-purple/50">
                <img 
                  src={profile.image} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-gradient transition-all duration-300">
                  {profile.name}
                </h3>
                <p className="text-sm text-white/70">{profile.role}</p>
                <div className="flex items-center mt-1">
                  {currentTab === "creators" ? (
                    <Star size={12} className="text-crealink-pink mr-1" />
                  ) : (
                    <CheckCircle size={12} className="text-crealink-purple mr-1" />
                  )}
                  <span className="text-xs font-medium text-white/80">{profile.highlight}</span>
                </div>
              </div>
              <div className="ml-auto">
                <Award size={20} className="text-crealink-pink opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <p className="text-white/80 text-sm mb-4">
              "{profile.description}"
            </p>

            <div className="flex flex-wrap gap-2">
              {profile.tags.map(tag => (
                <span 
                  key={tag}
                  className="text-xs py-1 px-3 rounded-full bg-white/5 text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CreatorSpotlight;
