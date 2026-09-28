import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, DollarSign, Briefcase, MapPin, BarChart2, Zap,
  ChevronDown, RefreshCw, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseConfigured } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SalaryRow {
  id: string;
  role: string;
  location: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  min_salary: number;
  max_salary: number;
  median_salary: number;
  currency: string;
  source?: string;
  year: number;
}

interface TrendRow {
  id: string;
  role?: string;
  skill_name: string;
  demand_score: number;
  hiring_volume?: number;
  yoy_growth_pct?: number;
  period: string;
}

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_SALARY: SalaryRow[] = [
  // Software Developer
  { id: 'd1', role: 'Software Developer', location: 'Bangalore', experience_level: 'entry',     min_salary: 400000,  max_salary: 700000,  median_salary: 550000,  currency: 'INR', year: 2025 },
  { id: 'd2', role: 'Software Developer', location: 'Bangalore', experience_level: 'mid',       min_salary: 900000,  max_salary: 1600000, median_salary: 1200000, currency: 'INR', year: 2025 },
  { id: 'd3', role: 'Software Developer', location: 'Bangalore', experience_level: 'senior',    min_salary: 1800000, max_salary: 3000000, median_salary: 2400000, currency: 'INR', year: 2025 },
  { id: 'd4', role: 'Software Developer', location: 'Bangalore', experience_level: 'executive', min_salary: 3500000, max_salary: 7000000, median_salary: 5000000, currency: 'INR', year: 2025 },
  { id: 'd5', role: 'Software Developer', location: 'Hyderabad', experience_level: 'entry',     min_salary: 350000,  max_salary: 650000,  median_salary: 500000,  currency: 'INR', year: 2025 },
  { id: 'd6', role: 'Software Developer', location: 'Hyderabad', experience_level: 'mid',       min_salary: 800000,  max_salary: 1400000, median_salary: 1100000, currency: 'INR', year: 2025 },
  { id: 'd7', role: 'Software Developer', location: 'Hyderabad', experience_level: 'senior',    min_salary: 1600000, max_salary: 2800000, median_salary: 2200000, currency: 'INR', year: 2025 },
  { id: 'd8', role: 'Software Developer', location: 'Mumbai',    experience_level: 'entry',     min_salary: 450000,  max_salary: 750000,  median_salary: 600000,  currency: 'INR', year: 2025 },
  { id: 'd9', role: 'Software Developer', location: 'Mumbai',    experience_level: 'mid',       min_salary: 1000000, max_salary: 1700000, median_salary: 1300000, currency: 'INR', year: 2025 },
  // AI/ML Engineer
  { id: 'd10', role: 'AI/ML Engineer', location: 'Bangalore', experience_level: 'entry',     min_salary: 600000,  max_salary: 1000000, median_salary: 800000,  currency: 'INR', year: 2025 },
  { id: 'd11', role: 'AI/ML Engineer', location: 'Bangalore', experience_level: 'mid',       min_salary: 1400000, max_salary: 2500000, median_salary: 1900000, currency: 'INR', year: 2025 },
  { id: 'd12', role: 'AI/ML Engineer', location: 'Bangalore', experience_level: 'senior',    min_salary: 2800000, max_salary: 5000000, median_salary: 3800000, currency: 'INR', year: 2025 },
  { id: 'd13', role: 'AI/ML Engineer', location: 'Bangalore', experience_level: 'executive', min_salary: 6000000, max_salary: 12000000, median_salary: 9000000, currency: 'INR', year: 2025 },
  { id: 'd14', role: 'AI/ML Engineer', location: 'Hyderabad', experience_level: 'mid',       min_salary: 1200000, max_salary: 2200000, median_salary: 1700000, currency: 'INR', year: 2025 },
  // Data Scientist
  { id: 'd15', role: 'Data Scientist', location: 'Bangalore', experience_level: 'entry',  min_salary: 550000,  max_salary: 900000,  median_salary: 720000,  currency: 'INR', year: 2025 },
  { id: 'd16', role: 'Data Scientist', location: 'Bangalore', experience_level: 'mid',    min_salary: 1200000, max_salary: 2200000, median_salary: 1700000, currency: 'INR', year: 2025 },
  { id: 'd17', role: 'Data Scientist', location: 'Bangalore', experience_level: 'senior', min_salary: 2400000, max_salary: 4500000, median_salary: 3400000, currency: 'INR', year: 2025 },
  { id: 'd18', role: 'Data Scientist', location: 'Mumbai',    experience_level: 'mid',    min_salary: 1100000, max_salary: 2000000, median_salary: 1550000, currency: 'INR', year: 2025 },
  // DevOps Engineer
  { id: 'd19', role: 'DevOps Engineer', location: 'Bangalore', experience_level: 'entry',  min_salary: 500000,  max_salary: 800000,  median_salary: 650000,  currency: 'INR', year: 2025 },
  { id: 'd20', role: 'DevOps Engineer', location: 'Bangalore', experience_level: 'mid',    min_salary: 1100000, max_salary: 1900000, median_salary: 1500000, currency: 'INR', year: 2025 },
  { id: 'd21', role: 'DevOps Engineer', location: 'Bangalore', experience_level: 'senior', min_salary: 2000000, max_salary: 3500000, median_salary: 2700000, currency: 'INR', year: 2025 },
  // Product Manager
  { id: 'd22', role: 'Product Manager', location: 'Bangalore', experience_level: 'entry',     min_salary: 700000,  max_salary: 1200000, median_salary: 950000,  currency: 'INR', year: 2025 },
  { id: 'd23', role: 'Product Manager', location: 'Bangalore', experience_level: 'mid',       min_salary: 1500000, max_salary: 2800000, median_salary: 2200000, currency: 'INR', year: 2025 },
  { id: 'd24', role: 'Product Manager', location: 'Bangalore', experience_level: 'senior',    min_salary: 3000000, max_salary: 6000000, median_salary: 4500000, currency: 'INR', year: 2025 },
  { id: 'd25', role: 'Product Manager', location: 'Mumbai',    experience_level: 'mid',       min_salary: 1400000, max_salary: 2600000, median_salary: 2000000, currency: 'INR', year: 2025 },
];

const DEMO_TRENDS: TrendRow[] = [
  { id: 't1',  skill_name: 'Python',          demand_score: 95, hiring_volume: 12400, yoy_growth_pct: 22.5, period: '2025-Q1' },
  { id: 't2',  skill_name: 'React',           demand_score: 88, hiring_volume: 9800,  yoy_growth_pct: 15.2, period: '2025-Q1' },
  { id: 't3',  skill_name: 'AWS',             demand_score: 91, hiring_volume: 11200, yoy_growth_pct: 28.1, period: '2025-Q1' },
  { id: 't4',  skill_name: 'Machine Learning',demand_score: 87, hiring_volume: 7600,  yoy_growth_pct: 35.4, period: '2025-Q1' },
  { id: 't5',  skill_name: 'TypeScript',      demand_score: 82, hiring_volume: 8200,  yoy_growth_pct: 42.0, period: '2025-Q1' },
  { id: 't6',  skill_name: 'Docker',          demand_score: 79, hiring_volume: 7100,  yoy_growth_pct: 19.8, period: '2025-Q1' },
  { id: 't7',  skill_name: 'Kubernetes',      demand_score: 74, hiring_volume: 5400,  yoy_growth_pct: 31.2, period: '2025-Q1' },
  { id: 't8',  skill_name: 'SQL',             demand_score: 85, hiring_volume: 10100, yoy_growth_pct: 8.5,  period: '2025-Q1' },
  { id: 't9',  skill_name: 'Node.js',         demand_score: 76, hiring_volume: 7800,  yoy_growth_pct: 12.3, period: '2025-Q1' },
  { id: 't10', skill_name: 'Generative AI',   demand_score: 93, hiring_volume: 5100,  yoy_growth_pct: 185.0, period: '2025-Q1' },
  { id: 't11', skill_name: 'Go',              demand_score: 68, hiring_volume: 3200,  yoy_growth_pct: 24.7, period: '2025-Q1' },
  { id: 't12', skill_name: 'Terraform',       demand_score: 71, hiring_volume: 3900,  yoy_growth_pct: 38.6, period: '2025-Q1' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function lpa(n: number): string {
  const l = n / 100000;
  return l >= 10 ? `${Math.round(l)}L` : `${l.toFixed(1)}L`;
}

const EXP_ORDER = ['entry', 'mid', 'senior', 'executive'];
const EXP_LABEL: Record<string, string> = { entry: 'Entry (0-2y)', mid: 'Mid (3-5y)', senior: 'Senior (6-10y)', executive: 'Lead (10y+)' };
const EXP_SHORT: Record<string, string> = { entry: 'Entry', mid: 'Mid', senior: 'Senior', executive: 'Lead' };

const ROLES = Array.from(new Set(DEMO_SALARY.map(d => d.role)));
const LOCATIONS = ['All', ...Array.from(new Set(DEMO_SALARY.map(d => d.location))).sort()];
const EXP_LEVELS = ['All', 'entry', 'mid', 'senior', 'executive'];

// ── Chart theme ────────────────────────────────────────────────────────────────

const CHART_GRID  = 'rgba(255,255,255,0.06)';
const CHART_TICK  = { fontSize: 11, fill: 'rgba(255,255,255,0.35)' };
const CHART_TOOLTIP_STYLE = {
  background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12,
};
const BAR_COLORS = ['#818cf8', '#a78bfa', '#34d399'];
const DEMAND_GRADIENT = ['#6366f1', '#818cf8', '#a78bfa'];

// ── Animations ─────────────────────────────────────────────────────────────────

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function SkeletonBlock({ h = 'h-48' }: { h?: string }) {
  return (
    <motion.div
      className={`${h} w-full rounded-2xl border border-white/[0.06]`}
      style={{ background: 'rgba(255,255,255,0.025)' }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function SalaryInsightsPage() {
  const [salaryData, setSalaryData]   = useState<SalaryRow[]>([]);
  const [trendData, setTrendData]     = useState<TrendRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isDemo, setIsDemo]           = useState(false);

  const [selectedRole, setSelectedRole]     = useState(ROLES[0]);
  const [selectedLoc, setSelectedLoc]       = useState('All');
  const [selectedExp, setSelectedExp]       = useState('All');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setSalaryData(DEMO_SALARY);
      setTrendData(DEMO_TRENDS);
      setIsDemo(true);
      setLoading(false);
      return;
    }
    try {
      const [salRes, trendRes] = await Promise.all([
        supabase.from('salary_data').select('*').order('role').order('experience_level'),
        supabase.from('market_trends').select('*').order('demand_score', { ascending: false }),
      ]);
      if (!salRes.error && salRes.data && salRes.data.length > 0) {
        setSalaryData(salRes.data as SalaryRow[]);
      } else {
        setSalaryData(DEMO_SALARY); setIsDemo(true);
      }
      if (!trendRes.error && trendRes.data && trendRes.data.length > 0) {
        setTrendData(trendRes.data as TrendRow[]);
      } else {
        setTrendData(DEMO_TRENDS);
      }
    } catch {
      setSalaryData(DEMO_SALARY); setTrendData(DEMO_TRENDS); setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────

  const roleOptions = useMemo(() => Array.from(new Set(salaryData.map(d => d.role))), [salaryData]);
  const locOptions  = useMemo(() => ['All', ...Array.from(new Set(salaryData.map(d => d.location))).sort()], [salaryData]);

  const filtered = useMemo(() => salaryData.filter(d => {
    if (d.role !== selectedRole) return false;
    if (selectedLoc !== 'All' && d.location !== selectedLoc) return false;
    if (selectedExp !== 'All' && d.experience_level !== selectedExp) return false;
    return true;
  }), [salaryData, selectedRole, selectedLoc, selectedExp]);

  const expChartData = useMemo(() => {
    const byExp = EXP_ORDER.map(exp => {
      const rows = salaryData.filter(d => d.role === selectedRole && d.experience_level === exp &&
        (selectedLoc === 'All' || d.location === selectedLoc));
      if (rows.length === 0) return null;
      const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      return {
        name: EXP_SHORT[exp],
        min:    Math.round(avg(rows.map(r => r.min_salary)) / 100000),
        median: Math.round(avg(rows.map(r => r.median_salary)) / 100000),
        max:    Math.round(avg(rows.map(r => r.max_salary)) / 100000),
      };
    }).filter(Boolean);
    return byExp as { name: string; min: number; median: number; max: number }[];
  }, [salaryData, selectedRole, selectedLoc]);

  const roleCompData = useMemo(() => {
    return roleOptions.map(role => {
      const rows = salaryData.filter(d => d.role === role && d.experience_level === 'mid');
      if (rows.length === 0) return null;
      const median = Math.round(rows.reduce((a, b) => a + b.median_salary, 0) / rows.length / 100000);
      return { name: role.split(' ').map(w => w[0]).join(''), fullName: role, median };
    }).filter(Boolean).sort((a: any, b: any) => b.median - a.median) as { name: string; fullName: string; median: number }[];
  }, [salaryData, roleOptions]);

  const kpiData = useMemo(() => {
    if (filtered.length === 0) {
      const fallback = salaryData.filter(d => d.role === selectedRole);
      if (fallback.length === 0) return { median: 0, min: 0, max: 0, growth: 0 };
      const med = Math.round(fallback.reduce((a, b) => a + b.median_salary, 0) / fallback.length);
      const mn  = Math.min(...fallback.map(d => d.min_salary));
      const mx  = Math.max(...fallback.map(d => d.max_salary));
      return { median: med, min: mn, max: mx, growth: 18.5 };
    }
    const med  = Math.round(filtered.reduce((a, b) => a + b.median_salary, 0) / filtered.length);
    const mn   = Math.min(...filtered.map(d => d.min_salary));
    const mx   = Math.max(...filtered.map(d => d.max_salary));
    return { median: med, min: mn, max: mx, growth: 18.5 };
  }, [filtered, salaryData, selectedRole]);

  const topTrends = useMemo(() => [...trendData].sort((a, b) => b.demand_score - a.demand_score).slice(0, 8), [trendData]);
  const topGrowth = useMemo(() => [...trendData].filter(t => t.yoy_growth_pct != null).sort((a, b) => (b.yoy_growth_pct ?? 0) - (a.yoy_growth_pct ?? 0)).slice(0, 6), [trendData]);

  return (
    <motion.div
      className="page-content max-w-6xl space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">Salary & Market Insights</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-sans text-sm text-white/40">Indian tech salaries, 2025</p>
              {isDemo && (
                <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/35">
                  Demo data
                </span>
              )}
            </div>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button variant="outline" onClick={loadData} size="sm"
            className="font-sans gap-1.5 rounded-xl border-white/[0.08] text-white/55 hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        {/* Role */}
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="pl-9 pr-8 py-2 font-sans text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/75 focus:outline-none focus:border-indigo-500/40 appearance-none cursor-pointer"
          >
            {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
        </div>

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          <select
            value={selectedLoc}
            onChange={e => setSelectedLoc(e.target.value)}
            className="pl-9 pr-8 py-2 font-sans text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/75 focus:outline-none focus:border-indigo-500/40 appearance-none cursor-pointer"
          >
            {locOptions.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
        </div>

        {/* Experience */}
        <div className="relative">
          <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          <select
            value={selectedExp}
            onChange={e => setSelectedExp(e.target.value)}
            className="pl-9 pr-8 py-2 font-sans text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/75 focus:outline-none focus:border-indigo-500/40 appearance-none cursor-pointer"
          >
            {EXP_LEVELS.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : EXP_LABEL[l]}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
        </div>
      </motion.div>

      {/* KPI row */}
      {loading ? (
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} h="h-24" />)}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <DollarSign className="h-4 w-4" />, value: lpa(kpiData.median), label: 'Median Salary', sub: 'per year', color: 'text-indigo-400', iconBg: 'bg-indigo-500/10 border-indigo-500/25' },
            { icon: <TrendingUp className="h-4 w-4" />,  value: `${lpa(kpiData.min)}–${lpa(kpiData.max)}`, label: 'Salary Range', sub: 'min to max', color: 'text-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/25' },
            { icon: <ArrowUpRight className="h-4 w-4" />, value: `+${kpiData.growth}%`, label: 'YoY Growth', sub: 'industry avg', color: 'text-emerald-400', iconBg: 'bg-emerald-500/10 border-emerald-500/25' },
            { icon: <Zap className="h-4 w-4" />,         value: topTrends[0]?.skill_name ?? 'Python', label: 'Hottest Skill', sub: `${topTrends[0]?.demand_score ?? 95}/100 demand`, color: 'text-amber-400', iconBg: 'bg-amber-500/10 border-amber-500/25' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="rounded-2xl border border-white/[0.07] p-4"
              style={{ background: 'rgba(255,255,255,0.025)' }}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center border mb-3 ${kpi.iconBg} ${kpi.color}`}>
                {kpi.icon}
              </div>
              <p className={`font-display text-xl font-bold ${kpi.color} truncate`}>{kpi.value}</p>
              <p className="font-display text-xs font-semibold text-white/60 mt-1">{kpi.label}</p>
              <p className="font-sans text-xs text-white/30 mt-0.5">{kpi.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Charts row 1: Salary by Experience + Role Comparison */}
      {loading ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkeletonBlock h="h-64" />
          <SkeletonBlock h="h-64" />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Salary by Experience */}
          <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="font-display text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              {selectedRole} — Salary by Level
              <span className="font-sans text-xs text-white/30 ml-auto">(₹ LPA)</span>
            </h3>
            {expChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 font-sans text-sm text-white/25">No data for filters</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={expChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="name" tick={CHART_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${v}L`} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: any, name: string) => [`₹${v}L`, name.charAt(0).toUpperCase() + name.slice(1)]}
                  />
                  <Bar dataKey="min"    name="min"    fill={BAR_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="median" name="median" fill={BAR_COLORS[1]} radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="max"    name="max"    fill={BAR_COLORS[2]} radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center gap-4 mt-2 justify-center">
              {[['#818cf8', 'Min'], ['#a78bfa', 'Median'], ['#34d399', 'Max']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5 font-sans text-xs text-white/40">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{l}
                </div>
              ))}
            </div>
          </div>

          {/* Role Comparison (mid level) */}
          <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="font-display text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-violet-400" />
              Mid-Level Salary by Role
              <span className="font-sans text-xs text-white/30 ml-auto">(₹ LPA)</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={roleCompData} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" tick={CHART_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${v}L`} />
                <YAxis type="category" dataKey="name" tick={CHART_TICK} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelFormatter={(_: any, payload: any) => payload?.[0]?.payload?.fullName ?? ''}
                  formatter={(v: any) => [`₹${v}L`, 'Median Salary']}
                />
                <Bar dataKey="median" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {roleCompData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${240 + i * 20}, 70%, ${65 - i * 4}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Charts row 2: Skill Demand + Growth */}
      {loading ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkeletonBlock h="h-64" />
          <SkeletonBlock h="h-64" />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Skill demand bars */}
          <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="font-display text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Top Skills by Demand
            </h3>
            <div className="space-y-2.5">
              {topTrends.map((t, i) => (
                <motion.div
                  key={t.skill_name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex items-center gap-3"
                >
                  <span className="font-sans text-xs text-white/45 w-20 sm:w-28 shrink-0 truncate">{t.skill_name}</span>
                  <div className="flex-1">
                    <Progress value={t.demand_score} className="h-1.5 bg-white/[0.06]" />
                  </div>
                  <span className="font-display text-xs font-bold text-indigo-400 w-8 text-right shrink-0">
                    {t.demand_score}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* YoY Growth */}
          <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="font-display text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              Fastest Growing Skills
              <span className="font-sans text-xs text-white/30 ml-auto">YoY %</span>
            </h3>
            <div className="space-y-2.5">
              {topGrowth.map((t, i) => {
                const growth = t.yoy_growth_pct ?? 0;
                const isHigh = growth > 50;
                return (
                  <motion.div
                    key={t.skill_name}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.015)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-display font-bold ${
                        isHigh ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="font-sans text-sm text-white/70">{t.skill_name}</span>
                    </div>
                    <span className={`font-display text-sm font-bold ${isHigh ? 'text-emerald-400' : 'text-indigo-400'} flex items-center gap-0.5`}>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {growth >= 100 ? `${Math.round(growth)}%` : `${growth.toFixed(1)}%`}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Salary table by experience */}
      {!loading && expChartData.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/[0.07] overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.015)' }}
        >
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display text-sm font-semibold text-white">
              {selectedRole} — Full Salary Table
              {selectedLoc !== 'All' && <span className="font-sans font-normal text-white/40 ml-2">({selectedLoc})</span>}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Experience Level', 'Min (LPA)', 'Median (LPA)', 'Max (LPA)', 'Range'].map(h => (
                    <th key={h} className="px-5 py-3 font-sans text-xs font-semibold text-white/35 uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expChartData.map((row, i) => (
                  <motion.tr
                    key={row.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-5 py-3 font-display text-sm font-semibold text-white">{EXP_LABEL[EXP_ORDER[i]]}</td>
                    <td className="px-5 py-3 font-sans text-sm text-white/55">{row.min}L</td>
                    <td className="px-5 py-3 font-display text-sm font-bold text-indigo-400">{row.median}L</td>
                    <td className="px-5 py-3 font-sans text-sm text-white/55">{row.max}L</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={(row.median / row.max) * 100} className="h-1.5 w-24 bg-white/[0.06]" />
                        <span className="font-sans text-xs text-white/30">{row.min}–{row.max}L</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div variants={itemVariants}>
        <p className="font-sans text-xs text-white/20 text-center">
          Salary data based on Indian tech market 2025. Figures in INR per year. Actual compensation may vary based on company, skills, and negotiation.
        </p>
      </motion.div>
    </motion.div>
  );
}
