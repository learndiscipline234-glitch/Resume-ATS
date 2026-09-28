import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PlacementGauge from './PlacementGauge';
import AnimatedKPI from './AnimatedKPI';
import GlassmorphismCard from './GlassmorphismCard';
import { AnalyticsPreviewSectionProps } from '@/types/premium.types';

const AnalyticsPreviewSection: React.FC<AnalyticsPreviewSectionProps> = ({
  barChartData,
  placementScore,
  skillHeatmapData,
  kpiData
}) => {
  // Default data if none provided
  const defaultBarChartData = [
    { label: 'Technical', value: 85 },
    { label: 'Soft Skills', value: 72 },
    { label: 'Experience', value: 68 },
    { label: 'Education', value: 90 },
  ];

  const defaultKPIData = [
    { label: 'Resumes Analyzed', value: 10000, suffix: '+' },
    { label: 'Avg Accuracy', value: 87, suffix: '%' },
    { label: 'Companies', value: 500, suffix: '+' },
    { label: 'User Satisfaction', value: 95, suffix: '%' },
  ];

  const chartData = barChartData.length > 0 ? barChartData : defaultBarChartData;
  const kpis = kpiData.length > 0 ? kpiData : defaultKPIData;

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
            Data-Driven{' '}
            <span className="text-[#B6FF00]">Career Insights</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Powerful analytics to guide your career decisions
          </p>
        </motion.div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <GlassmorphismCard title="Skill Assessment" glowOnHover={false}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(182, 255, 0, 0.1)" />
                  <XAxis 
                    dataKey="label" 
                    stroke="rgba(255, 255, 255, 0.5)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.5)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 31, 46, 0.9)',
                      border: '1px solid rgba(182, 255, 0, 0.3)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#B6FF00"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </GlassmorphismCard>
          </motion.div>

          {/* Placement Gauge */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <GlassmorphismCard title="Placement Probability" glowOnHover={false}>
              <div className="flex justify-center items-center py-8">
                <PlacementGauge probability={placementScore} />
              </div>
            </GlassmorphismCard>
          </motion.div>
        </div>

        {/* Skill Heatmap Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <GlassmorphismCard title="Skill Gap Heatmap" glowOnHover={false}>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[
                { skill: 'React', level: 90 },
                { skill: 'TypeScript', level: 85 },
                { skill: 'Node.js', level: 75 },
                { skill: 'AWS', level: 60 },
                { skill: 'Docker', level: 70 },
                { skill: 'GraphQL', level: 55 },
                { skill: 'MongoDB', level: 80 },
                { skill: 'Redis', level: 65 },
                { skill: 'Kubernetes', level: 50 },
                { skill: 'CI/CD', level: 75 },
                { skill: 'Testing', level: 85 },
                { skill: 'Security', level: 70 },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="relative p-4 rounded-lg text-center"
                  style={{
                    backgroundColor: `rgba(182, 255, 0, ${item.level / 100 * 0.3})`,
                    border: `1px solid rgba(182, 255, 0, ${item.level / 100 * 0.5})`
                  }}
                >
                  <div className="text-sm font-semibold text-white mb-1">{item.skill}</div>
                  <div className="text-xs text-[#B6FF00]">{item.level}%</div>
                </motion.div>
              ))}
            </div>
          </GlassmorphismCard>
        </motion.div>

        {/* KPI Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {kpis.map((kpi, index) => (
            <AnimatedKPI
              key={index}
              value={typeof kpi.value === 'number' ? kpi.value : 0}
              label={kpi.label}
              suffix={kpi.suffix || ''}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnalyticsPreviewSection;
