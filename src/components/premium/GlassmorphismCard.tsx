import { motion } from 'framer-motion';
import { GlassmorphismCardProps } from '@/types/premium.types';

const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  className = "",
  glowOnHover = true,
  icon,
  title,
  description
}) => {
  const baseClasses = [
    "relative",
    "backdrop-blur-md",
    "bg-[rgba(26,31,46,0.6)]",
    "border",
    "border-[rgba(182,255,0,0.2)]",
    "rounded-xl",
    "p-6",
    "transition-all",
    "duration-300"
  ];

  const hoverClasses = glowOnHover ? [
    "hover:border-[rgba(182,255,0,0.5)]",
    "hover:shadow-[0_0_30px_rgba(182,255,0,0.3)]",
    "hover:-translate-y-2"
  ] : [];

  const allClasses = [...baseClasses, ...hoverClasses, className].join(" ");

  return (
    <motion.div
      className={allClasses}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {icon && (
        <div className="mb-4 text-[#B6FF00]">
          {icon}
        </div>
      )}
      
      {title && (
        <h3 className="text-xl font-bold text-white mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-white/70 text-sm mb-4">
          {description}
        </p>
      )}
      
      {children}
    </motion.div>
  );
};

export default GlassmorphismCard;
