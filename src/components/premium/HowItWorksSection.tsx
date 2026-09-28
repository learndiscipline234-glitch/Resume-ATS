import { motion } from 'framer-motion';
import { Upload, Cpu, TrendingUp } from 'lucide-react';
import { HowItWorksSectionProps } from '@/types/premium.types';

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ steps }) => {
  // Default steps if none provided
  const defaultSteps = [
    {
      number: 1,
      title: 'Upload Resume',
      description: 'Upload your resume or paste your content for instant analysis',
      icon: <Upload className="w-12 h-12" />
    },
    {
      number: 2,
      title: 'AI Analysis',
      description: 'Our AI engine analyzes your skills, experience, and career trajectory',
      icon: <Cpu className="w-12 h-12" />
    },
    {
      number: 3,
      title: 'Career Optimization',
      description: 'Get personalized recommendations and actionable insights for success',
      icon: <TrendingUp className="w-12 h-12" />
    }
  ];

  const stepList = steps.length > 0 ? steps : defaultSteps;

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
            How It <span className="text-[#B6FF00]">Works</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Three simple steps to accelerate your career
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#B6FF00]/30 to-transparent" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {stepList.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15
                }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Step Number Circle */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-[#B6FF00]/10 border-2 border-[#B6FF00] flex items-center justify-center backdrop-blur-sm">
                      <span className="text-3xl font-bold text-[#B6FF00]">
                        {step.number}
                      </span>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-[#B6FF00]/20 blur-xl -z-10" />
                  </div>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4 text-[#B6FF00]">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (Desktop only, not on last step) */}
                {index < stepList.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-6 text-[#B6FF00]/50">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
