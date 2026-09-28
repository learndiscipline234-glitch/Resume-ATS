import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import {
  TrendingUp, Users, Brain, Database,
  Activity, Target, Award, AlertCircle, RefreshCw, FileText, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalPredictions: number;
  averageSuccessRate: number;
  topPerformingRoles: string[];
  trendingSkills: string[];
  recentActivity: number;
  totalAnalyses: number;
  averageScore: number;
  modelStats: { averageAccuracy: number; totalModels: number; activeModels: number };
  auditStats: { totalLogs: number };
  resumeScore?: {
    latestScore: number;
    componentScores: { skills: number; projects: number; experience: number; education: number };
    qualityFlag: string;
    recommendations: string[];
    scoreHistory: Array<{ date: string; score: number }>;
  };
  skillMatch?: {
    matchScore: number;
    weightedMatchScore: number;
    matchQuality: string;
    matchedSkills: string[];
    missingSkills: string[];
    targetRole: string;
  };
}

interface ChartData {
  rolePerformance: Array<{ role: string; successRate: number; predictions: number }>;
  skillTrends: Array<{ skill: string; demand: number; trend: string }>;
  activityTrend: Array<{ date: string; analyses: number; predictions: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  componentScores: Array<{ component: string; score: number; weight: number }>;
  skillDistribution: Array<{ category: string; count: number }>;
  scoreImprovement: Array<{ date: string; score: number }>;
}

const CHART_COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#38bdf8'];

const DEMO_STATS: DashboardStats = {
  totalPredictions: 247,
  averageSuccessRate: 0.78,
  topPerformingRoles: ['Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'ML Engineer', 'Frontend Developer'],
  trendingSkills: ['React', 'Python', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'Node.js', 'PostgreSQL'],
  recentActivity: 23,
  totalAnalyses: 189,
  averageScore: 76,
  modelStats: { averageAccuracy: 0.85, totalModels: 3, activeModels: 2 },
  auditStats: { totalLogs: 1247 },
  resumeScore: {
    latestScore: 82,
    componentScores: { skills: 85, projects: 78, experience: 80, education: 88 },
    qualityFlag: 'excellent',
    recommendations: [
      'Add more technical projects to showcase skills',
      'Include quantifiable achievements in experience section',
      'Consider adding certifications to boost credibility',
    ],
    scoreHistory: [
      { date: 'Jan 1', score: 65 },
      { date: 'Jan 15', score: 72 },
      { date: 'Feb 1', score: 75 },
      { date: 'Feb 15', score: 78 },
      { date: 'Mar 1', score: 82 },
    ],
  },
  skillMatch: {
    matchScore: 75,
    weightedMatchScore: 78,
    matchQuality: 'Good',
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    missingSkills: ['Kubernetes', 'AWS', 'GraphQL'],
    targetRole: 'Full Stack Developer',
  },
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs" style={{ background: 'rgba(10,10,18,0.95)' }}>
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] p-5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon, value, label, sub, accent = 'indigo' }: {
  icon: React.ReactNode; value: string | number; label: string; sub?: string; accent?: string;
}) {
  const accentMap: Record<string, { icon: string; glow: string; text: string }> = {
    indigo: { icon: 'bg-indigo-500/15 border-indigo-500/25', glow: '', text: 'text-indigo-400' },
    emerald: { icon: 'bg-emerald-500/15 border-emerald-500/25', glow: '', text: 'text-emerald-400' },
    violet: { icon: 'bg-violet-500/15 border-violet-500/25', glow: '', text: 'text-violet-400' },
    amber: { icon: 'bg-amber-500/15 border-amber-500/25', glow: '', text: 'text-amber-400' },
  };
  const a = accentMap[accent] ?? accentMap.indigo;
  return (
    <motion.div variants={item} whileHover={{ scale: 1.02 }}>
      <GlassCard className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${a.icon}`}>
          <span className={a.text}>{icon}</span>
        </div>
        <div>
          <p className="font-display text-xl font-bold text-white">{value}</p>
          <p className="font-sans text-xs text-white/50">{label}</p>
          {sub && <p className="font-sans text-xs text-white/30 mt-0.5">{sub}</p>}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const buildChartData = (s: DashboardStats): ChartData => ({
    rolePerformance: s.topPerformingRoles.slice(0, 5).map((role, i) => ({
      role: role.length > 14 ? role.slice(0, 14) + '…' : role,
      successRate: Math.round((0.9 - i * 0.08) * 100),
      predictions: 45 - i * 7,
    })),
    skillTrends: s.trendingSkills.slice(0, 8).map((skill, i) => ({
      skill,
      demand: 95 - i * 5,
      trend: i < 3 ? 'rising' : i < 6 ? 'stable' : 'declining',
    })),
    activityTrend: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
      date: d,
      analyses: [8, 14, 11, 18, 22, 9, 13][i],
      predictions: [4, 9, 7, 12, 15, 6, 8][i],
    })),
    scoreDistribution: [
      { range: '0–20%', count: 3 },
      { range: '21–40%', count: 8 },
      { range: '41–60%', count: 22 },
      { range: '61–80%', count: 41 },
      { range: '81–100%', count: 18 },
    ],
    componentScores: s.resumeScore ? [
      { component: 'Skills', score: s.resumeScore.componentScores.skills, weight: 40 },
      { component: 'Projects', score: s.resumeScore.componentScores.projects, weight: 25 },
      { component: 'Experience', score: s.resumeScore.componentScores.experience, weight: 20 },
      { component: 'Education', score: s.resumeScore.componentScores.education, weight: 15 },
    ] : [],
    skillDistribution: s.skillMatch ? [
      { category: 'Languages', count: 3 },
      { category: 'Frameworks', count: 2 },
      { category: 'Databases', count: 1 },
      { category: 'DevOps', count: 1 },
      { category: 'Cloud', count: 0 },
    ] : [],
    scoreImprovement: s.resumeScore?.scoreHistory ?? [],
  });

  const load = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setStats(DEMO_STATS);
    setChartData(buildChartData(DEMO_STATS));
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 mx-auto mb-4"
          />
          <p className="font-sans text-sm text-white/50">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 p-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <Activity className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
            <p className="font-sans text-sm text-white/40">Real-time insights · {lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">Demo Mode</span>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={load} size="sm" variant="outline" className="font-sans text-xs gap-1.5 rounded-xl border-white/[0.08] text-white/55 hover:text-white">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Brain className="h-4.5 w-4.5" />} value={stats?.totalPredictions ?? 0} label="Total Predictions" sub={`+${stats?.recentActivity} this week`} accent="indigo" />
        <StatCard icon={<Target className="h-4.5 w-4.5" />} value={`${Math.round((stats?.averageSuccessRate ?? 0) * 100)}%`} label="Success Rate" accent="emerald" />
        <StatCard icon={<Users className="h-4.5 w-4.5" />} value={stats?.totalAnalyses ?? 0} label="Total Analyses" sub={`Avg score: ${stats?.averageScore}%`} accent="violet" />
        <StatCard icon={<Award className="h-4.5 w-4.5" />} value={`${Math.round((stats?.modelStats?.averageAccuracy ?? 0) * 100)}%`} label="Model Accuracy" sub={`${stats?.modelStats?.activeModels} models active`} accent="amber" />
      </motion.div>

      {/* Resume Intelligence Row */}
      {stats?.resumeScore && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Resume Score */}
          <motion.div variants={item} whileHover={{ scale: 1.01 }}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-indigo-400" />
                <p className="font-display text-xs font-semibold text-white/60">Resume Score</p>
              </div>
              <p className="font-display text-3xl font-bold text-white">{stats.resumeScore.latestScore}<span className="text-lg text-white/30">/100</span></p>
              <div className="mt-3 h-1.5 rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.resumeScore.latestScore}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                />
              </div>
              <span className="mt-2 inline-block font-sans text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 capitalize">{stats.resumeScore.qualityFlag}</span>
            </GlassCard>
          </motion.div>

          {/* Skill Match */}
          <motion.div variants={item} whileHover={{ scale: 1.01 }}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <p className="font-display text-xs font-semibold text-white/60">Skill Match</p>
              </div>
              <p className="font-display text-3xl font-bold text-white">{stats.skillMatch?.weightedMatchScore}%</p>
              <p className="font-sans text-xs text-white/40 mt-1">{stats.skillMatch?.matchedSkills.length} skills matched</p>
              <div className="mt-3 h-1.5 rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.skillMatch?.weightedMatchScore}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              </div>
              <span className="mt-2 inline-block font-sans text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">{stats.skillMatch?.matchQuality}</span>
            </GlassCard>
          </motion.div>

          {/* Target Role */}
          <motion.div variants={item} whileHover={{ scale: 1.01 }}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-violet-400" />
                <p className="font-display text-xs font-semibold text-white/60">Target Role</p>
              </div>
              <p className="font-display text-lg font-bold text-white">{stats.skillMatch?.targetRole}</p>
              <p className="font-sans text-xs text-white/40 mt-1">{stats.skillMatch?.missingSkills.length} skills to learn</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {stats.skillMatch?.missingSkills.map(s => (
                  <span key={s} className="font-sans text-xs px-1.5 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">{s}</span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* Charts Row 1 */}
      <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <GlassCard>
            <p className="font-display text-sm font-semibold text-white mb-1">Role Performance</p>
            <p className="font-sans text-xs text-white/40 mb-4">Success rates by target role</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData?.rolePerformance} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="role" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="successRate" fill="#6366f1" radius={[4, 4, 0, 0]} name="Success %" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard>
            <p className="font-display text-sm font-semibold text-white mb-1">Activity Trends</p>
            <p className="font-sans text-xs text-white/40 mb-4">Daily analyses and predictions</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData?.activityTrend}>
                <defs>
                  <linearGradient id="gAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPredictions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
                <Area type="monotone" dataKey="analyses" stroke="#6366f1" fill="url(#gAnalyses)" strokeWidth={2} name="Analyses" />
                <Area type="monotone" dataKey="predictions" stroke="#34d399" fill="url(#gPredictions)" strokeWidth={2} name="Predictions" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Charts Row 2 — Resume Intelligence */}
      {chartData?.componentScores?.length > 0 && (
        <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div variants={item}>
            <GlassCard>
              <p className="font-display text-sm font-semibold text-white mb-1">Resume Component Scores</p>
              <p className="font-sans text-xs text-white/40 mb-4">Skills · Projects · Experience · Education</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.componentScores} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="component" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Score" />
                  <Bar dataKey="weight" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Weight %" />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <GlassCard>
              <p className="font-display text-sm font-semibold text-white mb-1">Score Improvement</p>
              <p className="font-sans text-xs text-white/40 mb-4">Resume score progress over time</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData.scoreImprovement}>
                  <defs>
                    <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Row */}
      <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trending Skills */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <p className="font-display text-sm font-semibold text-white mb-1">Trending Skills</p>
            <p className="font-sans text-xs text-white/40 mb-4">Market demand</p>
            <div className="space-y-3">
              {chartData?.skillTrends.slice(0, 6).map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.trend === 'rising' ? 'bg-emerald-400' : s.trend === 'stable' ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <span className="font-sans text-xs text-white/70 truncate">{s.skill}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${s.demand}%` }} />
                    </div>
                    <span className="font-sans text-xs text-white/35 w-7 text-right">{s.demand}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Score Distribution */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <p className="font-display text-sm font-semibold text-white mb-1">Score Distribution</p>
            <p className="font-sans text-xs text-white/40 mb-2">Analysis score ranges</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={chartData?.scoreDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="count" nameKey="range">
                  {chartData?.scoreDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* System Health */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <p className="font-display text-sm font-semibold text-white mb-1">System Health</p>
            <p className="font-sans text-xs text-white/40 mb-4">Platform status</p>
            <div className="space-y-3">
              {[
                { label: 'Status', value: <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1"><Activity className="h-3 w-3" />Online</span> },
                { label: 'Audit Logs', value: stats?.auditStats?.totalLogs.toLocaleString() },
                { label: 'Active Models', value: stats?.modelStats?.activeModels },
                { label: 'Recent Activity', value: stats?.recentActivity },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-sans text-xs text-white/50">{label}</span>
                  {typeof value === 'string' || typeof value === 'number'
                    ? <span className="font-display text-sm font-semibold text-white">{value}</span>
                    : value}
                </div>
              ))}
            </div>

            {/* Feature Pills */}
            <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-2">
              {[
                { icon: <Database className="h-3.5 w-3.5" />, label: 'Data Analytics' },
                { icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Trend Analysis' },
                { icon: <Brain className="h-3.5 w-3.5" />, label: 'ML Integration' },
                { icon: <Award className="h-3.5 w-3.5" />, label: 'Performance' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-indigo-400">{icon}</span>
                  <span className="font-sans text-xs text-white/50">{label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Recommendations */}
      {stats?.resumeScore?.recommendations && (
        <motion.div variants={item}>
          <GlassCard>
            <p className="font-display text-sm font-semibold text-white mb-4">AI Recommendations</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.resumeScore.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl p-3 bg-indigo-500/[0.05] border border-indigo-500/[0.12]">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-display text-xs font-bold text-indigo-400">{i + 1}</span>
                  </div>
                  <p className="font-sans text-xs text-white/65 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
