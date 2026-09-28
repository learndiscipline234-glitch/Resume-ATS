import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';
import PlacementGauge from './PlacementGauge';
import GlassmorphismCard from './GlassmorphismCard';
import { DashboardPreviewCardProps } from '@/types/premium.types';

const DashboardPreviewCard: React.FC<DashboardPreviewCardProps> = ({
  placementProbability,
  skillGaps,
  trendingRoles,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Orbit glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[#B6FF00]/20 blur-xl"
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          width: '120%',
          height: '120%',
          left: '-10%',
          top: '-10%',
        }}
      />
      
      {/* Main card with floating animation */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        <GlassmorphismCard className="p-8" glowOnHover={false}>
          {/* Placement Gauge */}
          <div className="flex justify-center mb-6">
            <PlacementGauge probability={placementProbability} />
          </div>
          
          {/* Skill Gaps Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B6FF00]" />
              Skill Gaps to Address
            </h4>
            <div className="space-y-2">
              {skillGaps.slice(0, 3).map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-white/70 bg-white/5 rounded-lg px-3 py-2"
                >
                  <div className="w-2 h-2 rounded-full bg-[#B6FF00]" />
                  {skill}
                </div>
              ))}
            </div>
          </div>
          
          {/* Trending Roles Section */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#B6FF00]" />
              Trending Roles
            </h4>
            <div className="flex flex-wrap gap-2">
              {trendingRoles.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-medium bg-[#B6FF00]/10 text-[#B6FF00] rounded-full border border-[#B6FF00]/30"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>
    </div>
  );
};

export default DashboardPreviewCard;
