import React from 'react';
import { motion } from 'framer-motion';
import { MLTrainingDashboard } from '@/components/MLTrainingDashboard';

export function MLTraining() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-light relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <MLTrainingDashboard />
        </motion.div>
      </div>
    </div>
  );
}
