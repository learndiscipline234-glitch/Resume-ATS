import { motion } from 'framer-motion';
import { Shield, FileText, GitBranch, Database } from 'lucide-react';
import GlassmorphismCard from './GlassmorphismCard';
import { DBMSSecuritySectionProps } from '@/types/premium.types';

const DBMSSecuritySection: React.FC<DBMSSecuritySectionProps> = ({
  features,
  layout = 'grid'
}) => {
  // Default features if none provided
  const defaultFeatures = [
    {
      id: 'row-level-security',
      title: 'Row-Level Security',
      description: 'Fine-grained access control ensuring users only see their own data',
      icon: <Shield className="w-8 h-8" />
    },
    {
      id: 'audit-logging',
      title: 'Audit Logging',
      description: 'Comprehensive logging of all database operations for compliance',
      icon: <FileText className="w-8 h-8" />
    },
    {
      id: 'model-versioning',
      title: 'Model Versioning',
      description: 'Track and manage different versions of ML models with full history',
      icon: <GitBranch className="w-8 h-8" />
    },
    {
      id: 'indexed-queries',
      title: 'Indexed Queries',
      description: 'Optimized database queries with intelligent indexing for speed',
      icon: <Database className="w-8 h-8" />
    }
  ];

  const featureList = features.length > 0 ? features : defaultFeatures;

  return (
    <section className="py-20 px-6 relative bg-[#0B0F1A]/50">
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
            Enterprise-Grade{' '}
            <span className="text-[#B6FF00]">Security & Performance</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Built on robust database architecture with advanced security features
          </p>
        </motion.div>

        {/* Features Grid */}
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
            >
              <GlassmorphismCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                glowOnHover={true}
                className="h-full"
              >
                {/* Empty children - content is in props */}
              </GlassmorphismCard>
            </motion.div>
          ))}
        </div>

        {/* Additional Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#B6FF00]/10 border border-[#B6FF00]/30 rounded-full">
            <Shield className="w-5 h-5 text-[#B6FF00]" />
            <span className="text-white/90 font-semibold">
              SOC 2 Compliant • GDPR Ready • 99.9% Uptime
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DBMSSecuritySection;
