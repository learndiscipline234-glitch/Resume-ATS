import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, TrendingUp, Users, FileText, Target } from 'lucide-react';
import {
  getAnalyticsOverview, getRoleDistribution, getUploadTrend,
  getTopSkills, getMlVsFuzzy, downloadUserBackup, checkBackendHealth,
} from '@/services/backendApi.service';
import {
  AdvancedAnalyticsService,
} from '@/services/advancedAnalytics.service';

const COLORS = ['#1e40af', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

function MetricCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <Card className={`border ${color}`}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium opacity-70 mb-1">{title}</p>
            <div className="text-3xl font-bold">{value}</div>
            {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
          </div>
          <Icon className="h-6 w-6 opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductionAnalyticsPage() {
  const [overview, setOverview]       = useState<any>(null);
  const [roles, setRoles]             = useState<any[]>([]);
  const [trend, setTrend]             = useState<any[]>([]);
  const [skills, setSkills]           = useState<any[]>([]);
  const [mlFuzzy, setMlFuzzy]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const online = await checkBackendHealth();
    setBackendOnline(online);

    if (online) {
      // Live data from FastAPI backend
      const [ov, rd, ut, ts, mf] = await Promise.allSettled([
        getAnalyticsOverview(),
        getRoleDistribution(),
        getUploadTrend(30),
        getTopSkills(10),
        getMlVsFuzzy(),
      ]);
      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (rd.status === 'fulfilled') setRoles(rd.value);
      if (ut.status === 'fulfilled') setTrend(ut.value);
      if (ts.status === 'fulfilled') setSkills(ts.value);
      if (mf.status === 'fulfilled') setMlFuzzy(mf.value);
    } else {
      // Fallback: Supabase direct queries
      const [stats, roleData, skillData] = await Promise.allSettled([
        AdvancedAnalyticsService.getUserResumeStats(),
        AdvancedAnalyticsService.getRoleMatchAnalytics(),
        AdvancedAnalyticsService.getSkillDemandAnalysis(undefined, 10),
      ]);
      if (stats.status === 'fulfilled' && stats.value) {
        setOverview({
          total_resumes:   stats.value.total_resumes,
          avg_match_score: stats.value.avg_match_score,
          total_skills:    0,
          total_analyses:  stats.value.total_resumes,
        });
      }
      if (roleData.status === 'fulfilled') {
        setRoles(roleData.value.map(r => ({
          target_role: r.target_role,
          count: r.total_analyses,
          percentage: 0,
        })));
        setMlFuzzy(roleData.value.map(r => ({
          target_role: r.target_role,
          avg_ml_score: r.avg_match_score,
          avg_fuzzy_score: r.avg_match_score,
          avg_final_score: r.avg_match_score,
        })));
      }
      if (skillData.status === 'fulfilled') {
        setSkills(skillData.value.map(s => ({ skill: s.skill, frequency: s.frequency })));
      }
    }

    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const roleChartData = roles.map(r => ({
    name: r.target_role?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()).split(' ').slice(0, 2).join(' '),
    value: r.count ?? r.total_analyses ?? 0,
  }));

  const trendData = trend.map(t => ({
    date: new Date(t.upload_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    uploads: t.upload_count,
  }));

  const mlFuzzyData = mlFuzzy.slice(0, 6).map(r => ({
    role: r.target_role?.replace(/_/g, ' ').split(' ').slice(0, 2).join(' '),
    ml:    Number(r.avg_ml_score ?? 0),
    fuzzy: Number(r.avg_fuzzy_score ?? 0),
    final: Number(r.avg_final_score ?? 0),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="font-medium">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #EC4899, #F97316)' }}>
            <TrendingUp className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {backendOnline ? 'Live data from FastAPI backend' : 'Supabase direct queries (backend offline)'}
            </p>
            {lastUpdated && <p className="text-xs text-muted-foreground mt-0.5">Updated: {lastUpdated.toLocaleTimeString()}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={backendOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
            {backendOnline ? '● Backend Online' : '○ Browser Mode'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => load(true)}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => downloadUserBackup('00000000-0000-0000-0000-000000000001')}
            className="border-blue-300 text-blue-700"
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Resumes"    value={overview?.total_resumes ?? '—'}   sub="uploaded"        icon={FileText}   color="border-blue-200 bg-blue-50 text-blue-700" />
        <MetricCard title="Avg Match Score"  value={overview ? `${overview.avg_match_score}%` : '—'} sub="across all roles" icon={Target} color="border-emerald-200 bg-emerald-50 text-emerald-700" />
        <MetricCard title="Skills Tracked"   value={overview?.total_skills ?? '—'}    sub="unique skills"   icon={TrendingUp} color="border-purple-200 bg-purple-50 text-purple-700" />
        <MetricCard title="Total Analyses"   value={overview?.total_analyses ?? '—'}  sub="job matches run" icon={Users}      color="border-amber-200 bg-amber-50 text-amber-700" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Upload Trend (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="uploads" stroke="#1e40af" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No upload data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role distribution pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
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
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No role data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top skills */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top 10 Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={skills} layout="vertical" margin={{ left: 70, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="skill" type="category" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                No skill data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* ML vs Fuzzy comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ML vs Fuzzy Score by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {mlFuzzyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mlFuzzyData} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v, n) => [`${v}%`, n === 'ml' ? 'ML Score' : n === 'fuzzy' ? 'Fuzzy Score' : 'Final Score']} />
                  <Legend formatter={v => v === 'ml' ? 'ML Score' : v === 'fuzzy' ? 'Fuzzy Score' : 'Final Score'} />
                  <Bar dataKey="ml"    name="ml"    fill="#1e40af" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="fuzzy" name="fuzzy" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="final" name="final" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                No comparison data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role performance table */}
      {mlFuzzy.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Role Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="text-left py-2 pr-4">Role</th>
                  <th className="text-right py-2 pr-4">ML Score</th>
                  <th className="text-right py-2 pr-4">Fuzzy Score</th>
                  <th className="text-right py-2 pr-4">Final Score</th>
                  <th className="text-right py-2">Analyses</th>
                </tr>
              </thead>
              <tbody>
                {mlFuzzy.map((r, i) => (
                  <motion.tr key={i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="py-2 pr-4 font-medium capitalize">
                      {r.target_role?.replace(/_/g, ' ')}
                    </td>
                    <td className="text-right py-2 pr-4 text-blue-600">{r.avg_ml_score ?? '—'}%</td>
                    <td className="text-right py-2 pr-4 text-amber-600">{r.avg_fuzzy_score ?? '—'}%</td>
                    <td className="text-right py-2 pr-4 text-emerald-600 font-bold">{r.avg_final_score ?? '—'}%</td>
                    <td className="text-right py-2 text-muted-foreground">{r.total ?? '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
