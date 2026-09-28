import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Database, RefreshCw, AlertCircle, CheckCircle2, TrendingUp,
  FileText, Target, Activity, Layers, ShieldCheck, BarChart2,
  Sparkles, Clock, ChevronDown, ChevronUp, Award,
  Download, Search, Filter, FileJson
} from 'lucide-react';
import {
  AdvancedAnalyticsService,
  type UserResumeStats,
  type SkillDemandEntry,
  type RoleMatchAnalytics,
  type AuditLogEntry,
  type TopJobMatch,
  type ResumeSearchEntry,
} from '@/services/advancedAnalytics.service';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7'];

function fmtRole(r: string) {
  return r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function scoreColor(s: number) {
  if (s >= 80) return 'text-green-600';
  if (s >= 60) return 'text-blue-600';
  if (s >= 40) return 'text-amber-500';
  return 'text-red-500';
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, color = 'blue' }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string;
}) {
  const palette: Record<string, string> = {
    blue:   'border-blue-200 bg-blue-50 text-blue-700',
    green:  'border-green-200 bg-green-50 text-green-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    amber:  'border-amber-200 bg-amber-50 text-amber-700',
  };
  return (
    <Card className={`border ${palette[color]}`}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium opacity-70 mb-1">{title}</p>
            <div className="text-3xl font-bold">{value}</div>
            {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
          </div>
          <Icon className="h-6 w-6 opacity-60" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── DBMS badge ────────────────────────────────────────────────────────────────
function DBMSBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
      active ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
    }`}>
      {active ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {label}
    </div>
  );
}

// ── Action badge ──────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    INSERT: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${map[action] ?? 'bg-gray-100 text-gray-600'}`}>
      {action}
    </span>
  );
}

// ── Audit log panel ───────────────────────────────────────────────────────────
function AuditLogPanel({ logs, loading, onRefresh }: {
  logs: AuditLogEntry[]; loading: boolean; onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Audit Log — Trigger Output
            <Badge variant="secondary" className="text-xs">{logs.length} entries</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Auto-populated by <code className="bg-muted px-1 rounded">trg_resume_insert_audit</code> and <code className="bg-muted px-1 rounded">trg_job_match_insert_audit</code> triggers.
        </p>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No audit entries yet — seed demo data to generate trigger events.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div key={log.id}
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/40 transition-colors"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  >
                    <ActionBadge action={log.action} />
                    <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
                      {log.table_name}
                      {log.record_id && <span className="ml-1 opacity-50">#{log.record_id.slice(0, 8)}</span>}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{fmtTime(log.created_at)}</span>
                    {expanded === log.id ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {expanded === log.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <pre className="text-xs bg-gray-950 text-gray-300 p-3 overflow-x-auto leading-relaxed">
                          {JSON.stringify(log.new_values ?? log.old_values, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function DBMSAnalyticsPage() {
  const [userStats, setUserStats]           = useState<UserResumeStats | null>(null);
  const [roleAnalytics, setRoleAnalytics]   = useState<RoleMatchAnalytics[]>([]);
  const [skillDemand, setSkillDemand]       = useState<SkillDemandEntry[]>([]);
  const [missingSkills, setMissingSkills]   = useState<{ skill: string; count: number }[]>([]);
  const [topMatches, setTopMatches]         = useState<TopJobMatch[]>([]);
  const [auditLogs, setAuditLogs]           = useState<AuditLogEntry[]>([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [auditLoading, setAuditLoading]     = useState(false);
  const [seeding, setSeeding]               = useState(false);
  const [seedMsg, setSeedMsg]               = useState('');
  const [selectedRole, setSelectedRole]     = useState('');
  const [lastUpdated, setLastUpdated]       = useState<Date | null>(null);
  const [dbmsStatus, setDbmsStatus]         = useState({
    storedProc: false, view: false, matView: false,
    indexes: true, trigger: false, analytics: false,
  });

  // Search & Download States
  const [searchQuery, setSearchQuery]           = useState('');
  const [searchRoleFilter, setSearchRoleFilter] = useState('');
  const [searchResults, setSearchResults]       = useState<ResumeSearchEntry[]>([]);
  const [isSearching, setIsSearching]           = useState(false);
  const [isDownloading, setIsDownloading]       = useState(false);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    const logs = await AdvancedAnalyticsService.getAuditLogs(25);
    setAuditLogs(logs);
    setDbmsStatus(s => ({ ...s, trigger: logs.length > 0 }));
    setAuditLoading(false);
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [stats, roles, skills, missing, top] = await Promise.all([
        AdvancedAnalyticsService.getUserResumeStats(),
        AdvancedAnalyticsService.getRoleMatchAnalytics(),
        AdvancedAnalyticsService.getSkillDemandAnalysis(selectedRole || undefined, 12),
        AdvancedAnalyticsService.getMissingSkillsDistribution(10),
        AdvancedAnalyticsService.getTopJobMatches(),
      ]);
      setUserStats(stats);
      setRoleAnalytics(roles);
      setSkillDemand(skills);
      setMissingSkills(missing);
      setTopMatches(top);
      setDbmsStatus({
        storedProc: stats !== null,
        view:       roles.length > 0,
        matView:    top.length > 0,
        indexes:    true,
        trigger:    auditLogs.length > 0,
        analytics:  roles.length > 0,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('[DBMSAnalytics] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRole, auditLogs.length]);

  useEffect(() => { load(); }, []);

  const handleSeedDemoData = async () => {
    setSeeding(true); setSeedMsg('');
    const result = await AdvancedAnalyticsService.seedDemoData();
    if (result.skipped) {
      setSeedMsg('Data already exists — skipped. Click Reload to refresh charts.');
    } else if (result.inserted > 0) {
      setSeedMsg(`✓ Inserted ${result.inserted} demo records. Refreshing…`);
      await load(true);
      await loadAuditLogs();
      setSeedMsg(`✓ ${result.inserted} records seeded. All charts updated from real DB.`);
    } else {
      setSeedMsg('Insert failed — run migration 014_demo_data_policy.sql in Supabase first.');
    }
    setSeeding(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await AdvancedAnalyticsService.refreshSkillDemandAnalysis();
    await load(true);
    await loadAuditLogs();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const res = await AdvancedAnalyticsService.searchResumes(searchQuery, 'demo-user', searchRoleFilter);
    setSearchResults(res);
    setIsSearching(false);
  };

  const handleDownloadBackup = async () => {
    setIsDownloading(true);
    const data = await AdvancedAnalyticsService.exportUserData('demo-user');
    setIsDownloading(false);
    
    if (!data) {
      setSeedMsg('Export failed. Check database connection and functions.');
      return;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analyzer-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSeedMsg('✓ Database export downloaded successfully.');
  };

  // Chart data
  const roleChartData = roleAnalytics.map(r => ({
    role: fmtRole(r.target_role).split(' ').slice(0, 2).join(' '),
    avg:  Number(r.avg_match_score),
    max:  Number(r.max_match_score),
    min:  Number(r.min_match_score),
  }));
  const skillChartData   = skillDemand.slice(0, 10).map(s => ({ skill: s.skill, frequency: s.frequency }));
  const roleDistribution = roleAnalytics.map(r => ({ name: fmtRole(r.target_role).split(' ')[0], value: r.total_analyses }));
  const missingChartData = missingSkills.map(s => ({ skill: s.skill, count: s.count }));
  const uniqueRoles      = [...new Set(skillDemand.map(s => s.target_role))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="font-medium">Loading DBMS Analytics…</p>
          <p className="text-sm text-muted-foreground mt-1">Querying stored procedures, views & JSONB tables</p>
        </div>
      </div>
    );
  }

  const hasData = roleAnalytics.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            <Database className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Advanced DBMS Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Real-time data from stored procedures, materialized views, JSONB queries & triggers
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-0.5">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline" size="sm"
            onClick={handleDownloadBackup}
            disabled={isDownloading}
            className="text-xs gap-1.5"
          >
            <Download className={`h-3.5 w-3.5 ${isDownloading ? 'animate-bounce' : ''}`} aria-hidden="true" />
            {isDownloading ? 'Exporting...' : 'Download Data'}
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={handleSeedDemoData}
            disabled={seeding || refreshing}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Sparkles className={`h-4 w-4 mr-1 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding…' : 'Seed Demo Data'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Seed feedback */}
      <AnimatePresence>
        {seedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-3 rounded-lg text-sm border ${
              seedMsg.startsWith('✓') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {seedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No data state */}
      {!hasData && (
        <Card className="border-dashed border-2 border-amber-300 bg-amber-50/30">
          <CardContent className="py-10 text-center">
            <Database className="h-12 w-12 mx-auto mb-3 text-amber-500 opacity-60" />
            <p className="font-semibold text-amber-700 mb-1">No data in database yet</p>
            <p className="text-sm text-amber-600 mb-4">
              First run <code className="bg-amber-100 px-1 rounded">014_demo_data_policy.sql</code> in Supabase, then click Seed Demo Data.
            </p>
            <Button onClick={handleSeedDemoData} disabled={seeding} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Sparkles className="h-4 w-4 mr-1" /> Seed Demo Data Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* DBMS Feature Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Advanced DBMS Features Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <DBMSBadge label="Stored Procedure"  active={dbmsStatus.storedProc} />
            <DBMSBadge label="View"              active={dbmsStatus.view} />
            <DBMSBadge label="Materialized View" active={dbmsStatus.matView} />
            <DBMSBadge label="GIN Indexes"       active={dbmsStatus.indexes} />
            <DBMSBadge label="Audit Triggers"    active={dbmsStatus.trigger} />
            <DBMSBadge label="Analytics Query"   active={dbmsStatus.analytics} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Run migrations 012, 013, 014, 016 in Supabase SQL editor, then seed data to activate all features.
          </p>
        </CardContent>
      </Card>

      {/* Full-Text Search Block */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Full-Text Resume Search (tsvector + GIN Index)
            </div>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
              PostgreSQL <code className="ml-1 px-1 bg-white/50 rounded">@@ plainto_tsquery()</code>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Keywords</label>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g. 'react developer' or 'aws docker'" 
                className="w-full text-sm border rounded-md px-3 py-2 bg-background focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="w-[180px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center justify-between">
                <span>Filter by Role</span>
                <Filter className="h-3 w-3" />
              </label>
              <select 
                value={searchRoleFilter} 
                onChange={e => setSearchRoleFilter(e.target.value)}
                className="w-full text-sm border rounded-md px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(r => <option key={r} value={r}>{fmtRole(r)}</option>)}
              </select>
            </div>
            <Button type="submit" disabled={isSearching} className="gap-2">
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Found {searchResults.length} {searchResults.length === 1 ? 'resume' : 'resumes'}
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {searchResults.map((res: ResumeSearchEntry) => (
                    <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-3 rounded-lg text-sm border border-border/50 gap-2">
                      <div>
                        <p className="font-medium flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> {res.file_name || 'Resume Document'}</p>
                        <p className="text-xs text-muted-foreground mt-1">Target Role: <span className="font-medium">{fmtRole(res.target_role)}</span></p>
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px] bg-background">
                        {new Date(res.uploaded_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {searchQuery && !isSearching && searchResults.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t text-sm text-muted-foreground text-center">
                No matching resumes found by full-text search.
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {hasData && (
        <>
          {/* Stored Procedure — aggregate stats */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Stored Procedure — calculate_match() / Aggregate Stats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Total Resumes Analyzed" value={userStats?.total_resumes ?? roleAnalytics.reduce((s, r) => s + r.total_analyses, 0)} sub="from job_matches table" icon={FileText} color="blue" />
              <StatCard title="Average Match Score"    value={userStats ? `${userStats.avg_match_score}%` : `${Math.round(roleAnalytics.reduce((s, r) => s + r.avg_match_score, 0) / roleAnalytics.length)}%`} sub="across all roles" icon={Target} color="green" />
              <StatCard title="Highest Score Achieved" value={userStats ? `${userStats.highest_score}%` : `${Math.max(...roleAnalytics.map(r => r.max_match_score))}%`} sub="best match recorded" icon={Award} color="purple" />
            </div>
          </div>

          {/* Analytics Query — role leaderboard */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <BarChart2 className="h-4 w-4" /> Analytics Query — AVG(match_percentage) GROUP BY target_role
            </h2>
            <Card>
              <CardContent className="pt-5">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roleChartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v, n) => [`${v}%`, n === 'avg' ? 'Avg Score' : n === 'max' ? 'Max' : 'Min']} />
                    <Legend />
                    <Bar dataKey="avg" name="avg" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max" name="max" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min" name="min" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* JSONB Skill Demand + Role Distribution */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Activity className="h-4 w-4" /> JSONB Query — Skill Frequency from matched_skills[]
              </h2>
              {uniqueRoles.length > 0 && (
                <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                  className="text-xs border rounded px-2 py-1 bg-background">
                  <option value="">All Roles</option>
                  {uniqueRoles.map(r => <option key={r} value={r}>{fmtRole(r)}</option>)}
                </select>
              )}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Top Matched Skills (JSONB)</CardTitle></CardHeader>
                <CardContent>
                  {skillChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={skillChartData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="skill" type="category" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip />
                        <Bar dataKey="frequency" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="py-10 text-center text-muted-foreground text-sm">No skill data.</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Analyses by Role</CardTitle></CardHeader>
                <CardContent>
                  {roleDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                          {roleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="py-10 text-center text-muted-foreground text-sm">No data.</div>}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Missing skills distribution */}
          {missingChartData.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Skill Gap Distribution — missing_skills[] JSONB
              </h2>
              <Card>
                <CardContent className="pt-5">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={missingChartData} layout="vertical" margin={{ top: 0, right: 20, left: 90, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="skill" type="category" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Materialized View — top_job_matches_view */}
          {topMatches.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" /> Materialized View — top_job_matches_view
              </h2>
              <Card>
                <CardContent className="pt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs uppercase">
                        <th className="text-left py-2 pr-4">Target Role</th>
                        <th className="text-right py-2 pr-4">Match Score</th>
                        <th className="text-right py-2 pr-4">Matched</th>
                        <th className="text-right py-2">Missing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMatches.map((r, i) => (
                        <motion.tr key={i}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          <td className="py-2 pr-4 font-medium">{fmtRole(r.target_role)}</td>
                          <td className="text-right py-2 pr-4">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={Number(r.match_percentage)} className="w-16 h-1.5" />
                              <span className={`font-bold ${scoreColor(Number(r.match_percentage))}`}>
                                {r.match_percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-2 pr-4 text-green-600 font-medium">
                            {Array.isArray(r.matched_skills) ? r.matched_skills.length : 0}
                          </td>
                          <td className="text-right py-2 text-red-500">
                            {Array.isArray(r.missing_skills) ? r.missing_skills.length : 0}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Role analytics table */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <BarChart2 className="h-4 w-4" /> View — Role Performance Summary
            </h2>
            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase">
                      <th className="text-left py-2 pr-4">Target Role</th>
                      <th className="text-right py-2 pr-4">Avg Score</th>
                      <th className="text-right py-2 pr-4">Max</th>
                      <th className="text-right py-2 pr-4">Min</th>
                      <th className="text-right py-2">Analyses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleAnalytics.map((r, i) => (
                      <motion.tr key={r.target_role}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="py-2 pr-4 font-medium">{fmtRole(r.target_role)}</td>
                        <td className="text-right py-2 pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={Number(r.avg_match_score)} className="w-16 h-1.5" />
                            <span className={`font-bold ${scoreColor(Number(r.avg_match_score))}`}>{r.avg_match_score}%</span>
                          </div>
                        </td>
                        <td className="text-right py-2 pr-4 text-green-600 font-medium">{r.max_match_score}%</td>
                        <td className="text-right py-2 pr-4 text-orange-500">{r.min_match_score}%</td>
                        <td className="text-right py-2"><Badge variant="secondary">{r.total_analyses}</Badge></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Audit Log */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Trigger — audit_resume_changes / trg_job_match_insert_audit
        </h2>
        <AuditLogPanel logs={auditLogs} loading={auditLoading} onRefresh={loadAuditLogs} />
      </div>

      {/* SQL Reference */}
      <Card className="bg-gray-950 text-gray-100 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400 font-mono">SQL Reference — ADBMS Concepts</CardTitle>
        </CardHeader>
        <CardContent className="font-mono text-xs space-y-1.5 text-gray-300">
          <p><span className="text-purple-400">-- Stored Procedure</span></p>
          <p>SELECT * FROM <span className="text-yellow-300">calculate_match</span>(<span className="text-green-300">'user-uuid'</span>);</p>
          <p className="pt-1"><span className="text-purple-400">-- Analytics Query (GROUP BY)</span></p>
          <p>SELECT target_role, <span className="text-cyan-300">AVG</span>(match_percentage) FROM job_matches <span className="text-cyan-300">GROUP BY</span> target_role <span className="text-cyan-300">ORDER BY</span> 2 <span className="text-cyan-300">DESC</span>;</p>
          <p className="pt-1"><span className="text-purple-400">-- JSONB Query (GIN index)</span></p>
          <p>SELECT <span className="text-cyan-300">jsonb_array_elements_text</span>(matched_skills) AS skill, <span className="text-cyan-300">COUNT</span>(*) FROM job_matches <span className="text-cyan-300">GROUP BY</span> skill;</p>
          <p className="pt-1"><span className="text-purple-400">-- Materialized View</span></p>
          <p>SELECT * FROM <span className="text-yellow-300">top_job_matches_view</span> ORDER BY match_percentage <span className="text-cyan-300">DESC</span>;</p>
          <p className="pt-1"><span className="text-purple-400">-- Refresh Materialized View</span></p>
          <p>SELECT <span className="text-yellow-300">refresh_top_job_matches</span>();</p>
          <p className="pt-1"><span className="text-purple-400">-- Audit Log (trigger output)</span></p>
          <p>SELECT * FROM <span className="text-yellow-300">audit_logs</span> ORDER BY created_at <span className="text-cyan-300">DESC</span> LIMIT 20;</p>
        </CardContent>
      </Card>
    </div>
  );
}
