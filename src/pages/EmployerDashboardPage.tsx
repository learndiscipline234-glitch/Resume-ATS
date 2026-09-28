import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw, Download, TrendingUp, Users, FileText, Target,
  Database, BarChart3, Activity, ShieldCheck,
} from 'lucide-react';
import {
  getAnalyticsOverview, getRoleDistribution, getUploadTrend,
  getTopSkills, getMlVsFuzzy, downloadUserBackup, checkBackendHealth,
} from '@/services/backendApi.service';
import { AdvancedAnalyticsService } from '@/services/advancedAnalytics.service';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9', '#F97316', '#84CC16'];

function MetricCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${color}12`, color }}>Live</span>
      </div>
      <p className="stat-number" style={{ color }}>{value}</p>
      <p className="text-sm font-semibold mt-1">{title}</p>
      {sub && <p className="text-xs mt-0.5 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function EmployerDashboardPage() {
  const [overview, setOverview]       = useState<any>(null);
  const [roles, setRoles]             = useState<any[]>([]);
  const [trend, setTrend]             = useState<any[]>([]);
  const [skills, setSkills]           = useState<any[]>([]);
  const [mlFuzzy, setMlFuzzy]         = useState<any[]>([]);
  const [auditLogs, setAuditLogs]     = useState<any[]>([]);
  const [auditLoaded, setAuditLoaded] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab]     = useState<'overview' | 'skills' | 'dbms' | 'audit'>('overview');

  const load = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const online = await checkBackendHealth();
    setBackendOnline(online);

    if (online) {
      const [ov, rd, ut, ts, mf] = await Promise.allSettled([
        getAnalyticsOverview(), getRoleDistribution(),
        getUploadTrend(30), getTopSkills(10), getMlVsFuzzy(),
      ]);
      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (rd.status === 'fulfilled') setRoles(rd.value);
      if (ut.status === 'fulfilled') setTrend(ut.value);
      if (ts.status === 'fulfilled') setSkills(ts.value);
      if (mf.status === 'fulfilled') setMlFuzzy(mf.value);
    } else {
      const [stats, roleData, skillData] = await Promise.allSettled([
        AdvancedAnalyticsService.getUserResumeStats(),
        AdvancedAnalyticsService.getRoleMatchAnalytics(),
        AdvancedAnalyticsService.getSkillDemandAnalysis(undefined, 10),
      ]);
      if (stats.status === 'fulfilled' && stats.value) {
        setOverview({ total_resumes: stats.value.total_resumes, avg_match_score: stats.value.avg_match_score, total_skills: 0, total_analyses: stats.value.total_resumes });
      }
      if (roleData.status === 'fulfilled') {
        setRoles(roleData.value.map(r => ({ target_role: r.target_role, count: r.total_analyses, percentage: 0 })));
        setMlFuzzy(roleData.value.map(r => ({ target_role: r.target_role, avg_ml_score: r.avg_match_score, avg_fuzzy_score: r.avg_match_score, avg_final_score: r.avg_match_score })));
      }
      if (skillData.status === 'fulfilled') setSkills(skillData.value.map(s => ({ skill: s.skill, frequency: s.frequency })));
    }

    setLastUpdated(new Date());
    setLoading(false);
  };

  const loadAuditLogs = async () => {
    if (auditLoaded) return;
    const logs = await AdvancedAnalyticsService.getAuditLogs(20);
    setAuditLogs(logs);
    setAuditLoaded(true);
  };

  useEffect(() => { load(); }, []);

  const roleChartData = roles.map(r => ({
    name: r.target_role?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()).split(' ').slice(0, 2).join(' '),
    value: r.count ?? 0,
  }));

  const trendData = trend.map(t => ({
    date: new Date(t.upload_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    uploads: t.upload_count,
  }));

  const mlFuzzyData = mlFuzzy.slice(0, 6).map(r => ({
    role: r.target_role?.replace(/_/g, ' ').split(' ').slice(0, 2).join(' '),
    ml: Number(r.avg_ml_score ?? 0),
    fuzzy: Number(r.avg_fuzzy_score ?? 0),
    final: Number(r.avg_final_score ?? 0),
  }));

  const TABS = [
    { key: 'overview', label: 'Overview',    icon: BarChart3  },
    { key: 'skills',   label: 'Skills',      icon: TrendingUp },
    { key: 'dbms',     label: 'ML vs Fuzzy', icon: Database   },
    { key: 'audit',    label: 'Audit Logs',  icon: ShieldCheck },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" aria-hidden="true" />
          <p className="font-medium">Loading Employer Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content max-w-6xl space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0A1628, #1E3A5F)' }}>
            <BarChart3 className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Employer Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {backendOnline ? 'Live data from FastAPI backend' : 'Supabase direct queries (backend offline)'}
              {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={backendOnline ? 'badge-success' : 'badge-neutral'}>
            {backendOnline ? '● Backend Online' : '○ Browser Mode'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => load(true)} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm"
            onClick={() => downloadUserBackup('00000000-0000-0000-0000-000000000001')}
            className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Resumes"   value={overview?.total_resumes ?? '—'}              sub="uploaded"        icon={FileText}   color="#2563EB" />
        <MetricCard title="Avg Match Score" value={overview ? `${overview.avg_match_score}%` : '—'} sub="across all roles" icon={Target}  color="#10B981" />
        <MetricCard title="Skills Tracked"  value={overview?.total_skills ?? '—'}               sub="unique skills"   icon={TrendingUp} color="#8B5CF6" />
        <MetricCard title="Total Analyses"  value={overview?.total_analyses ?? '—'}             sub="job matches run" icon={Users}      color="#F59E0B" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === 'audit') loadAuditLogs(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center"
            style={{
              background: activeTab === tab.key ? 'hsl(var(--card))' : 'transparent',
              color: activeTab === tab.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
            }}
            aria-selected={activeTab === tab.key}
          >
            <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
          {/* Upload trend */}
          <div className="ent-card p-4">
            <p className="section-label mb-3 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> Upload Trend (30 days)
            </p>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="uploads" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No upload data yet</div>
            )}
          </div>

          {/* Role distribution */}
          <div className="ent-card p-4">
            <p className="section-label mb-3">Role Distribution</p>
            {roleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={roleChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {roleChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No role data yet</div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'skills' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ent-card p-4">
          <p className="section-label mb-3">Top 10 Skills Across All Resumes</p>
          {skills.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skills} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="frequency" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No skill data yet</div>
          )}
        </motion.div>
      )}

      {activeTab === 'dbms' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="ent-card p-4">
            <p className="section-label mb-3">ML vs Fuzzy Score by Role</p>
            {mlFuzzyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mlFuzzyData} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v, n) => [`${v}%`, n === 'ml' ? 'ML Score' : n === 'fuzzy' ? 'Fuzzy Score' : 'Final Score']} />
                  <Legend formatter={v => v === 'ml' ? 'ML Score' : v === 'fuzzy' ? 'Fuzzy Score' : 'Final Score'} />
                  <Bar dataKey="ml"    fill="#2563EB" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="fuzzy" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="final" fill="#10B981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No comparison data yet</div>
            )}
          </div>

          {/* Role performance table */}
          {mlFuzzy.length > 0 && (
            <div className="ent-card overflow-hidden">
              <div className="px-4 py-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                <p className="section-label">Role Performance Summary</p>
              </div>
              <div className="overflow-x-auto">
                <table className="ent-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th className="text-right">ML Score</th>
                      <th className="text-right">Fuzzy Score</th>
                      <th className="text-right">Final Score</th>
                      <th className="text-right">Analyses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mlFuzzy.map((r, i) => (
                      <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                        <td className="font-medium capitalize">{r.target_role?.replace(/_/g, ' ')}</td>
                        <td className="text-right font-semibold" style={{ color: '#2563EB' }}>{r.avg_ml_score ?? '—'}%</td>
                        <td className="text-right font-semibold" style={{ color: '#F59E0B' }}>{r.avg_fuzzy_score ?? '—'}%</td>
                        <td className="text-right font-bold" style={{ color: '#10B981' }}>{r.avg_final_score ?? '—'}%</td>
                        <td className="text-right text-muted-foreground">{r.total ?? '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'audit' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ent-card overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'hsl(var(--border))' }}>
            <p className="section-label flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Audit Log — Trigger Output
            </p>
            <Badge className="badge-neutral text-xs">{auditLogs.length} entries</Badge>
          </div>
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No audit entries yet — seed demo data to generate trigger events
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ent-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Table</th>
                    <th>Record ID</th>
                    <th className="text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, i) => (
                    <tr key={log.id ?? i}>
                      <td>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          log.action === 'INSERT' ? 'badge-success' :
                          log.action === 'UPDATE' ? 'badge-info' : 'badge-error'
                        }`}>{log.action}</span>
                      </td>
                      <td className="font-code text-xs">{log.table_name}</td>
                      <td className="font-code text-xs text-muted-foreground">
                        {log.record_id ? log.record_id.slice(0, 8) + '...' : '—'}
                      </td>
                      <td className="text-right text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
