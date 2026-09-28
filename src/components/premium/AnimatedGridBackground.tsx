import { motion } from 'framer-motion';
import { AnimatedGridBackgroundProps } from '@/types/premium.types';

const AnimatedGridBackground: React.FC<AnimatedGridBackgroundProps> = ({
  className = "",
  gridColor = "rgba(182, 255, 0, 0.1)",
  glowColor = "rgba(182, 255, 0, 0.2)"
}) => {
  return (
    <motion.div
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      animate={{
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg className="w-full h-full">
        <defs>
          <pattern
            id="grid-pattern"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="50"
              stroke={gridColor}
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="0"
              x2="50"
              y2="0"
              stroke={gridColor}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
        />
      </svg>
    </motion.div>
  );
};

export default AnimatedGridBackground;
