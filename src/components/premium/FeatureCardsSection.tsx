import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Map, Users } from 'lucide-react';
import GlassmorphismCard from './GlassmorphismCard';
import { FeatureCardsSectionProps } from '@/types/premium.types';

const FeatureCardsSection: React.FC<FeatureCardsSectionProps> = ({ features }) => {
  const navigate = useNavigate();

  // Default features if none provided
  const defaultFeatures = [
    {
      id: 'resume-intelligence',
      icon: <Brain className="w-8 h-8" />,
      title: 'Resume Intelligence',
      description: 'AI-powered analysis of your resume with actionable insights',
      route: '/resume'
    },
    {
      id: 'placement-predictor',
      icon: <Target className="w-8 h-8" />,
      title: 'Placement Predictor',
      description: 'Predict your placement probability with ML algorithms',
      route: '/analytics'
    },
    {
      id: 'career-planner',
      icon: <Map className="w-8 h-8" />,
      title: 'Career Path Planner',
      description: 'Personalized roadmap to your dream career',
      route: '/roadmap'
    },
    {
      id: 'networking-engine',
      icon: <Users className="w-8 h-8" />,
      title: 'Networking Engine',
      description: 'Connect with mentors and industry professionals',
      route: '/networking'
    }
  ];

  const featureList = features.length > 0 ? features : defaultFeatures;

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <section className="py-20 px-6 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Powerful Features for Your{' '}
            <span className="text-[#B6FF00]">Career Success</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Everything you need to accelerate your career journey
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1
              }}
              viewport={{ once: true }}
              onClick={() => handleCardClick(feature.route)}
              className="cursor-pointer"
            >
              <GlassmorphismCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                glowOnHover={true}
                className="h-full"
              >
                <div className="mt-4 flex items-center text-[#B6FF00] text-sm font-semibold">
                  Explore
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </GlassmorphismCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCardsSection;
