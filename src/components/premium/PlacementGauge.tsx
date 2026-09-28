import { motion } from 'framer-motion';
import { PlacementGaugeProps } from '@/types/premium.types';

const PlacementGauge: React.FC<PlacementGaugeProps> = ({
  probability,
  className = ""
}) => {
  // Validate probability is between 0-100
  const validProbability = Math.max(0, Math.min(100, probability));
  
  // Calculate gauge parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validProbability / 100) * circumference;
  
  // Determine color based on probability
  let gaugeColor = '#FF4444'; // Red for < 50%
  if (validProbability >= 75) {
    gaugeColor = '#B6FF00'; // Neon green for >= 75%
  } else if (validProbability >= 50) {
    gaugeColor = '#FFA500'; // Orange for 50-74%
  }
  
  return (
    <div className={`relative w-48 h-48 ${className}`}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          fill="none"
        />
        
        {/* Animated gauge circle */}
        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke={gaugeColor}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1.5,
            ease: "easeOut"
          }}
          style={{
            filter: `drop-shadow(0 0 10px ${gaugeColor})`
          }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-white">
            {validProbability}%
          </div>
          <div className="text-sm text-white/70">
            Placement Probability
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementGauge;
