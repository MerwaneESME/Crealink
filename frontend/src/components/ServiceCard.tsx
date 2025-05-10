
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

const ServiceCard = ({ title, description, icon, delay = 0 }: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className="glass-card rounded-xl p-6 hover:shadow-[0_0_15px_rgba(97,18,217,0.3)] transition-all duration-500 hover:-translate-y-1 group"
    >
      <div className="relative w-14 h-14 mb-6 rounded-lg bg-gradient-to-br from-crealink-purple/20 to-crealink-pink/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-crealink-purple/40 to-crealink-pink/40 transition-all duration-700"></div>
        <div className="relative z-10 text-crealink-pink group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-gradient transition-all duration-300">
        {title}
      </h3>
      
      <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
        {description}
      </p>
    </motion.div>
  );
};

export default ServiceCard;
