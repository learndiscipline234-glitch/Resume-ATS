import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Route, MessageSquare, TrendingUp, Users, ArrowRight,
  Target, Database, Briefcase, BarChart3, Bot,
  CheckCircle2, Clock, Zap, Award, Star, Search, Download,
  Trophy, GitBranch, Layers, ChevronRight, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getAnalyticsOverview, checkBackendHealth, downloadUserBackup } from '@/services/backendApi.service';
import { downloadLastAnalysisReport, exportLastAnalysisAsPDF } from '@/services/resumeExport.service';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getStoredAnalysis, getAnalysisHistory, getDetectedRole } from '@/constants/storageKeys';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLastAnalysis() { return getStoredAnalysis(); }
function getHistory(): Array<{ score: number; date: string }> { return getAnalysisHistory(); }
function getRole(): string { return getDetectedRole() ?? ''; }
function roleLabel(r: string) {
  return r ? r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Not set';
}
function scoreHex(s: number) {
  if (s >= 80) return '#10B981';
  if (s >= 60) return '#2563EB';
  if (s >= 40) return '#F59E0B';
  return '#EF4444';
}
function scoreLabel(s: number) {
  if (s >= 80) return 'Excellent';
  if (s >= 60) return 'Good';
  if (s >= 40) return 'Fair';
  return 'Needs Work';
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Quick actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { title: 'Resume Analyzer',  desc: 'Upload & run ML analysis',           icon: FileText,      href: '/resume',                color: '#2563EB' },
  { title: 'Resume Score',     desc: 'Detailed score breakdown',            icon: Award,         href: '/score',                 color: '#F59E0B' },
  { title: 'Resume Insights',  desc: 'Charts & skill breakdown',            icon: BarChart3,     href: '/analytics',             color: '#0EA5E9' },
  { title: 'Job Matching',     desc: 'Resume vs job description',           icon: Briefcase,     href: '/job-matching',          color: '#10B981' },
  { title: 'Skill Gap',        desc: 'Current → target role plan',          icon: Layers,        href: '/skill-gap',             color: '#8B5CF6' },
  { title: 'Resume Ranking',   desc: 'Rank multiple resumes',               icon: Trophy,        href: '/ranking',               color: '#F59E0B' },
  { title: 'Search Resumes',   desc: 'PostgreSQL full-text search',         icon: Search,        href: '/search',                color: '#0EA5E9' },
  { title: 'DBMS Analytics',   desc: 'Stored procs & live DB views',        icon: Database,      href: '/dbms-analytics',        color: '#6366F1' },
  { title: 'Prod Analytics',   desc: 'FastAPI backend charts',              icon: TrendingUp,    href: '/production-analytics',  color: '#EC4899' },
  { title: 'Career Roadmap',   desc: 'Step-by-step growth plan',            icon: Route,         href: '/roadmap',               color: '#F97316' },
  { title: 'AI Career Mentor', desc: 'Personalised career advice',          icon: MessageSquare, href: '/mentor',                color: '#A855F7' },
  { title: 'Architecture',     desc: 'System diagram & ADBMS checklist',   icon: GitBranch,     href: '/architecture',          color: '#64748B' },
];

// Filled by Supabase query; used as fallback while loading
const PLATFORM_STATS_FALLBACK = [
  { label: 'Resumes Analyzed', value: '—', icon: FileText,   color: '#2563EB' },
  { label: 'Avg Match Score',  value: '—', icon: TrendingUp, color: '#10B981' },
  { label: 'Analyses Run',     value: '—', icon: BarChart3,  color: '#F59E0B' },
  { label: 'Active Users',     value: '—', icon: Users,      color: '#8B5CF6' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon: Icon, color, delay }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="metric-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10">
          <Icon className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
        </div>
        <Badge variant="secondary" className="text-xs">
          Live
        </Badge>
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm font-semibold mt-1 text-foreground">{label}</p>
      <p className="text-xs mt-0.5 text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

function ActionCard({ action, index }: { action: typeof QUICK_ACTIONS[0]; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04, duration: 0.3 }}
      onClick={() => navigate(action.href)}
      className="clean-card text-left p-4 w-full group hover:shadow-soft-lg"
      aria-label={`Open ${action.title}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-primary/10">
          <action.icon className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{action.title}</p>
          <p className="text-xs mt-0.5 truncate text-muted-foreground">
            {action.desc}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
      </div>
    </motion.button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate  = useNavigate();
  const { isEmployer } = useAuth();
  const analysis  = useMemo(getLastAnalysis, []);

  // Employers should use the Employer Dashboard
  useEffect(() => {
    if (isEmployer) navigate('/employer', { replace: true });
  }, [isEmployer, navigate]);
  const history   = useMemo(getHistory, []);
  const role      = useMemo(getRole, []);

  const [liveMetrics, setLiveMetrics] = useState<{
    total_resumes: number; avg_match_score: number; total_skills: number; total_analyses: number;
  } | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [dbStats, setDbStats] = useState<typeof PLATFORM_STATS_FALLBACK | null>(null);

  useEffect(() => {
    checkBackendHealth().then(online => {
      setBackendOnline(online);
      if (online) getAnalyticsOverview().then(setLiveMetrics).catch(() => {});
    });
  }, []);

  useEffect(() => {
    async function loadDbStats() {
      try {
        const [analysesRes, scoresRes, usersRes] = await Promise.all([
          supabase.from('resume_analyses').select('id', { count: 'exact', head: true }),
          supabase.from('resume_scores').select('total_score'),
          supabase.from('user_profiles').select('user_id', { count: 'exact', head: true }),
        ]);
        const totalAnalyses = analysesRes.count ?? 0;
        const totalUsers = usersRes.count ?? 0;
        const scores = scoresRes.data ?? [];
        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((s, r) => s + (r.total_score ?? 0), 0) / scores.length)
          : 0;
        setDbStats([
          { label: 'Resumes Analyzed', value: totalAnalyses > 0 ? String(totalAnalyses) : '—', icon: FileText,   color: '#2563EB' },
          { label: 'Avg Match Score',  value: avgScore > 0 ? `${avgScore}%` : '—',              icon: TrendingUp, color: '#10B981' },
          { label: 'Analyses Run',     value: totalAnalyses > 0 ? String(totalAnalyses) : '—',  icon: BarChart3,  color: '#F59E0B' },
          { label: 'Active Users',     value: totalUsers > 0 ? String(totalUsers) : '—',        icon: Users,      color: '#8B5CF6' },
        ]);
      } catch { /* silently fall back */ }
    }
    loadDbStats();
  }, []);

  const hasAnalysis   = analysis !== null;
  const matchScore    = analysis?.skillMatch?.matchScore ?? analysis?.mlResult?.finalScore ?? 0;
  const totalScore    = analysis?.resumeScore?.totalScore ?? 0;
  const matchedCount  = (analysis?.skillMatch?.matchedSkills ?? analysis?.mlResult?.matchedSkills ?? []).length;
  const missingCount  = (analysis?.skillMatch?.missingSkills ?? analysis?.mlResult?.missingSkills ?? []).length;
  const analysisCount = history.length + (hasAnalysis ? 1 : 0);

  const prevScore = history.length >= 2 ? history[history.length - 2].score : null;
  const lastScore = history.length >= 1 ? history[history.length - 1].score : null;
  const trend = prevScore !== null && lastScore !== null ? lastScore - prevScore : null;

  const recentActivity = history.slice(-5).reverse().map((h, i) => ({
    label: `Resume analysis #${history.length - i}`,
    score: h.score,
    date: h.date,
  }));

  return (
    <div className="page-content max-w-6xl space-y-8">

      {/* ── Welcome banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="clean-card p-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Next Step Career AI
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Welcome back{role ? `, ${roleLabel(role).split(' ')[0]}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered resume intelligence · TF-IDF + Naive Bayes · PostgreSQL ADBMS
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/resume')} className="text-sm font-semibold">
              Analyze Resume <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/summary')} className="text-sm">
              Project Summary
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Your Progress ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="section-label flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" /> Your Progress
          </p>
          {hasAnalysis && (
            <button
              onClick={() => navigate('/score')}
              className="text-xs font-medium flex items-center gap-1 transition-colors hover:text-primary"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              View full score <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>

        {!hasAnalysis ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="clean-card p-10 text-center border-2 border-dashed border-border"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-primary/10">
              <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <p className="font-display font-semibold text-base mb-1">No analysis yet</p>
            <p className="text-sm mb-5 text-muted-foreground">
              Upload your resume to see your personal stats, skill gaps, and match score.
            </p>
            <Button onClick={() => navigate('/resume')}>
              Analyze My Resume <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                label="Match Score" value={`${matchScore}%`}
                sub={trend !== null ? (trend > 0 ? `↑ +${trend}% vs last` : trend < 0 ? `↓ ${trend}% vs last` : 'No change') : `${analysisCount} analyses`}
                icon={Target} color={scoreHex(matchScore)} delay={0.05}
              />
              <MetricCard
                label="Resume Score" value={`${totalScore}/100`}
                sub={scoreLabel(totalScore)}
                icon={Award} color={scoreHex(totalScore)} delay={0.1}
              />
              <MetricCard
                label="Skills Matched" value={matchedCount}
                sub={`${missingCount} gaps to close`}
                icon={CheckCircle2} color="#10B981" delay={0.15}
              />
              <MetricCard
                label="Target Role" value={roleLabel(role).split(' ')[0]}
                sub={roleLabel(role)}
                icon={Star} color="#8B5CF6" delay={0.2}
              />
            </div>

            {/* Progress bar */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Overall Match Progress</span>
                <span className="text-sm font-bold text-primary">
                  {matchScore}% — {scoreLabel(matchScore)}
                </span>
              </div>
              <Progress value={matchScore} className="h-2" />
              <div className="flex justify-between mt-2">
                {[
                  { pct: 0,  label: '0%' },
                  { pct: 40, label: '40% Fair' },
                  { pct: 60, label: '60% Good' },
                  { pct: 80, label: '80%+ Excellent' },
                ].map(m => (
                  <span key={m.pct} className="text-xs text-muted-foreground">
                    {m.label}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="section-label mb-4 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" /> Quick Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <ActionCard key={action.href} action={action} index={i} />
          ))}
        </div>
      </div>

      {/* ── Recent Activity + Platform Stats ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div>
          <p className="section-label mb-4 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Recent Activity
          </p>
          {recentActivity.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No activity yet — analyze a resume to get started
              </p>
            </Card>
          ) : (
            <Card className="divide-y divide-border">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center justify-between p-3 first:pt-4 last:pb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                      <FileText className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(item.date)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold">
                    {item.score}%
                  </Badge>
                </motion.div>
              ))}
            </Card>
          )}
        </div>

        {/* Platform Stats */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="section-label flex items-center gap-2">
              <Bot className="h-3.5 w-3.5" aria-hidden="true" /> Platform Stats
            </p>
            <Badge variant={backendOnline ? "success" : "secondary"} className="text-xs font-medium">
              {backendOnline ? 'Backend Online' : 'Browser Mode'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(liveMetrics ? [
              { label: 'Total Resumes',   value: liveMetrics.total_resumes,              icon: FileText,   color: '#2563EB' },
              { label: 'Avg Match Score', value: `${liveMetrics.avg_match_score}%`,      icon: Target,     color: '#10B981' },
              { label: 'Skills Tracked',  value: liveMetrics.total_skills,               icon: TrendingUp, color: '#F59E0B' },
              { label: 'Analyses Run',    value: liveMetrics.total_analyses,             icon: Users,      color: '#8B5CF6' },
            ] : (dbStats ?? PLATFORM_STATS_FALLBACK)).map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="clean-card p-4 text-center"
              >
                <div className="w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="font-display text-xl font-bold">{value}</p>
                <p className="text-xs mt-0.5 text-muted-foreground">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Export ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="clean-card p-4 flex items-center justify-between flex-wrap gap-3 border-2 border-dashed border-border"
      >
        <div>
          <p className="text-sm font-semibold">Export Your Data</p>
          <p className="text-xs mt-0.5 text-muted-foreground">
            Download your resume analysis as HTML report or full JSON backup
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => downloadLastAnalysisReport()}
            className="text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> HTML Report
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => exportLastAnalysisAsPDF()}
            className="text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> PDF Export
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => downloadUserBackup('00000000-0000-0000-0000-000000000001')}
            className="text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> JSON Backup
          </Button>
        </div>
      </motion.div>

    </div>
  );
}
