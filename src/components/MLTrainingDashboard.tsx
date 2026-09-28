import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, BarChart3, TrendingUp, Clock, Database, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MLTrainingService, TrainingResult, TrainingConfig } from '@/lib/mlTrainingService';

interface TrainingStatus {
  isTraining: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
}

const STEPS = [
  { progress: 10, step: 'Fetching training data…' },
  { progress: 25, step: 'Preprocessing features…' },
  { progress: 40, step: 'Hyperparameter tuning…' },
  { progress: 70, step: 'Training neural network…' },
  { progress: 90, step: 'Evaluating model…' },
  { progress: 100, step: 'Saving results…' },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] p-5 ${className}`} style={{ background: 'rgba(255,255,255,0.02)' }}>
      {children}
    </div>
  );
}

function MetricRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="font-sans text-xs text-white/50">{label}</span>
      <span className={`font-display text-sm font-semibold ${accent ?? 'text-white'}`}>{value}</span>
    </div>
  );
}

function getAccent(value: number) {
  if (value >= 0.8) return 'text-emerald-400';
  if (value >= 0.6) return 'text-amber-400';
  return 'text-red-400';
}

function fmt(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function MLTrainingDashboard() {
  const [status, setStatus] = useState<TrainingStatus>({ isTraining: false, progress: 0, currentStep: '', error: null });
  const [results, setResults] = useState<TrainingResult | null>(null);
  const [config, setConfig] = useState<TrainingConfig>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    trainTestSplit: 0.8,
    modelType: 'neural_network',
  });

  useEffect(() => {
    MLTrainingService.getLatestTrainingResults()
      .then(r => setResults(r))
      .catch(() => {});
  }, []);

  const startTraining = async () => {
    setStatus({ isTraining: true, progress: 0, currentStep: 'Initializing pipeline…', error: null });
    try {
      for (const s of STEPS) {
        setStatus(p => ({ ...p, progress: s.progress, currentStep: s.step }));
        await new Promise(r => setTimeout(r, 900));
      }
      const result = await MLTrainingService.runTrainingPipeline(config);
      setResults(result);
      setStatus({ isTraining: false, progress: 100, currentStep: 'Training complete!', error: null });
      setTimeout(() => setStatus(p => ({ ...p, currentStep: '' })), 3000);
    } catch (e) {
      setStatus({ isTraining: false, progress: 0, currentStep: '', error: e instanceof Error ? e.message : 'Training failed' });
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">ML Training</h1>
            <p className="font-sans text-sm text-white/40">Train and improve model accuracy</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={startTraining}
            disabled={status.isTraining}
            className="font-sans gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-0"
          >
            {status.isTraining
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Play className="h-4 w-4" />}
            {status.isTraining ? 'Training…' : 'Start Training'}
          </Button>
        </motion.div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: <TrendingUp className="h-4 w-4" />, value: results ? `${(results.metrics.accuracy * 100).toFixed(1)}%` : '—', label: 'Accuracy', accent: 'indigo' },
          { icon: <BarChart3 className="h-4 w-4" />, value: results ? `${(results.metrics.f1Score * 100).toFixed(1)}%` : '—', label: 'F1 Score', accent: 'violet' },
          { icon: <Database className="h-4 w-4" />, value: results ? results.trainingDataSize.toString() : '—', label: 'Train Samples', accent: 'emerald' },
          { icon: <Clock className="h-4 w-4" />, value: results ? fmt(results.trainingTime) : '—', label: 'Train Time', accent: 'amber' },
        ].map(({ icon, value, label, accent }) => {
          const colors: Record<string, { icon: string; text: string }> = {
            indigo: { icon: 'bg-indigo-500/15 border-indigo-500/25', text: 'text-indigo-400' },
            violet: { icon: 'bg-violet-500/15 border-violet-500/25', text: 'text-violet-400' },
            emerald: { icon: 'bg-emerald-500/15 border-emerald-500/25', text: 'text-emerald-400' },
            amber: { icon: 'bg-amber-500/15 border-amber-500/25', text: 'text-amber-400' },
          };
          const c = colors[accent];
          return (
            <motion.div key={label} variants={item} whileHover={{ scale: 1.02 }}>
              <GlassCard className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${c.icon}`}>
                  <span className={c.text}>{icon}</span>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-white">{value}</p>
                  <p className="font-sans text-xs text-white/45">{label}</p>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Training Progress */}
      <AnimatePresence>
        {(status.isTraining || status.currentStep) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                {status.isTraining
                  ? <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                  : <CheckCircle className="h-4 w-4 text-emerald-400" />}
                <p className="font-display text-sm font-semibold text-white">
                  {status.isTraining ? 'Training in Progress' : 'Training Complete'}
                </p>
                <span className="ml-auto font-sans text-xs text-white/40">{status.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  animate={{ width: `${status.progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${status.isTraining ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                />
              </div>
              <p className="font-sans text-xs text-white/40 mt-2">{status.currentStep}</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {status.error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl border border-red-500/20 p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.05)' }}>
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-red-300">{status.error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results + Config */}
      <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Model Performance */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <p className="font-display text-sm font-semibold text-white">Model Performance</p>
            </div>
            {results ? (
              <div className="space-y-1">
                <MetricRow label="Accuracy" value={`${(results.metrics.accuracy * 100).toFixed(1)}%`} accent={getAccent(results.metrics.accuracy)} />
                <MetricRow label="Precision" value={`${(results.metrics.precision * 100).toFixed(1)}%`} accent={getAccent(results.metrics.precision)} />
                <MetricRow label="Recall" value={`${(results.metrics.recall * 100).toFixed(1)}%`} accent={getAccent(results.metrics.recall)} />
                <MetricRow label="F1 Score" value={`${(results.metrics.f1Score * 100).toFixed(1)}%`} accent={getAccent(results.metrics.f1Score)} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="h-8 w-8 text-white/15 mb-3" />
                <p className="font-sans text-xs text-white/30">No results yet</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Training Info */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-4 w-4 text-emerald-400" />
              <p className="font-display text-sm font-semibold text-white">Training Info</p>
            </div>
            {results ? (
              <div className="space-y-1">
                <MetricRow label="Train Samples" value={results.trainingDataSize.toString()} />
                <MetricRow label="Test Samples" value={results.testDataSize.toString()} />
                <MetricRow label="Training Time" value={fmt(results.trainingTime)} />
                <MetricRow label="Model Type" value={results.config.modelType.replace('_', ' ')} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Database className="h-8 w-8 text-white/15 mb-3" />
                <p className="font-sans text-xs text-white/30">Run a training session first</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Configuration */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-violet-400" />
              <p className="font-display text-sm font-semibold text-white">Configuration</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Model Type', key: 'modelType' as const, type: 'select', options: ['neural_network', 'random_forest', 'gradient_boost'] },
                { label: 'Learning Rate', key: 'learningRate' as const, type: 'number', step: 0.0001, min: 0.0001, max: 0.1 },
                { label: 'Batch Size', key: 'batchSize' as const, type: 'number', step: 8, min: 8, max: 256 },
                { label: 'Epochs', key: 'epochs' as const, type: 'number', step: 10, min: 10, max: 500 },
              ].map(({ label, key, type, options, ...rest }) => (
                <div key={key}>
                  <p className="font-sans text-xs text-white/45 mb-1">{label}</p>
                  {type === 'select' ? (
                    <select
                      value={config[key] as string}
                      onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
                      disabled={status.isTraining}
                      className="w-full rounded-xl px-3 py-1.5 font-sans text-xs bg-white/[0.04] border border-white/[0.08] text-white/75 focus:outline-none focus:border-indigo-500/40 disabled:opacity-40"
                    >
                      {options!.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={config[key] as number}
                      onChange={e => setConfig(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
                      disabled={status.isTraining}
                      {...rest}
                      className="w-full rounded-xl px-3 py-1.5 font-sans text-xs bg-white/[0.04] border border-white/[0.08] text-white/75 focus:outline-none focus:border-indigo-500/40 disabled:opacity-40"
                    />
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Training History */}
      <motion.div variants={item}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <p className="font-display text-sm font-semibold text-white">Training History</p>
          </div>
          {results ? (
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(99,102,241,0.04)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-white">Latest Training</p>
                  <p className="font-sans text-xs text-white/40">{new Date(results.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-semibold text-emerald-400">{(results.metrics.accuracy * 100).toFixed(1)}% Accuracy</p>
                <p className="font-sans text-xs text-white/40">F1: {(results.metrics.f1Score * 100).toFixed(1)}%</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Database className="h-10 w-10 text-white/10 mb-3" />
              <p className="font-sans text-sm text-white/30">No training history</p>
              <p className="font-sans text-xs text-white/20 mt-1">Start a session to see results here</p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
