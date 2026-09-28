import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import DashboardPreviewCard from './DashboardPreviewCard';
import { HeroSectionProps } from '@/types/premium.types';

const HeroSection: React.FC<HeroSectionProps> = ({
  onAnalyzeClick,
  onDashboardClick
}) => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20 relative">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Predict Your{' '}
            <span className="relative inline-block">
              <span className="text-[#B6FF00]">Career Future</span>
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-[#B6FF00]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{ transformOrigin: 'left' }}
              />
            </span>
            {' '}with{' '}
            <span className="text-[#B6FF00]">AI Precision</span>
          </h1>
          
          <p className="text-xl text-white/70 mb-8 leading-relaxed">
            AI-powered resume intelligence, placement probability prediction, 
            and skill gap analysis
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={onAnalyzeClick}
              className="px-8 py-4 bg-[#B6FF00] text-[#0B0F1A] rounded-lg font-bold text-lg hover:bg-[#a3e600] transition-all hover:shadow-[0_0_30px_rgba(182,255,0,0.5)] flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Analyze Resume Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={onDashboardClick}
              className="px-8 py-4 bg-transparent border-2 border-[#B6FF00] text-[#B6FF00] rounded-lg font-bold text-lg hover:bg-[#B6FF00]/10 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login (Optional)
              <Sparkles className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
        
        {/* Right: Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <DashboardPreviewCard
            placementProbability={87}
            skillGaps={['React Advanced Patterns', 'System Design', 'AWS Cloud']}
            trendingRoles={['Full Stack Dev', 'ML Engineer', 'DevOps']}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
