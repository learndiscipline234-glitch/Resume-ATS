import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Database, Brain, Zap, GitBranch, BarChart3,
  FileText, Briefcase, Search, Trophy, Layers, Award,
  TrendingUp, GraduationCap, Route, Users, MessageSquare,
  ArrowRight, Code2, Server, Globe,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const PAGES = [
  { name: 'Resume Analyzer',    route: '/resume',               icon: FileText,     desc: 'Upload PDF/DOCX/TXT → ML role prediction + skill match' },
  { name: 'Resume Score',       route: '/score',                icon: Award,        desc: 'Detailed score breakdown: Skills 40%, Projects 25%, Experience 20%, Education 15%' },
  { name: 'Resume Insights',    route: '/analytics',            icon: BarChart3,    desc: 'Radar chart, score timeline, job compatibility across all roles' },
  { name: 'Job Matching',       route: '/job-matching',         icon: Briefcase,    desc: 'Paste resume + JD → instant skill overlap analysis' },
  { name: 'Resume Ranking',     route: '/ranking',              icon: Trophy,       desc: 'Upload multiple resumes → ranked table with ML + fuzzy scores' },
  { name: 'Skill Gap',          route: '/skill-gap',            icon: Layers,       desc: 'Current → target role gap analysis with phased learning timeline' },
  { name: 'Search Resumes',     route: '/search',               icon: Search,       desc: 'PostgreSQL full-text search (tsvector + GIN index)' },
  { name: 'DBMS Analytics',     route: '/dbms-analytics',       icon: Database,     desc: 'Stored procedures, materialized views, JSONB queries, audit logs' },
  { name: 'Prod Analytics',     route: '/production-analytics', icon: TrendingUp,   desc: 'FastAPI backend charts: upload trend, role distribution, top skills' },
  { name: 'Career Roadmap',     route: '/roadmap',              icon: Route,        desc: 'Role-based step-by-step learning path with progress tracking' },
  { name: 'Courses',            route: '/courses',              icon: GraduationCap,desc: 'Personalized course recommender — gap-aware, 40+ skills' },
  { name: 'AI Career Mentor',   route: '/mentor',               icon: MessageSquare,desc: 'Skill analysis + career recommendations from resume data' },
  { name: 'Networking Hub',     route: '/networking',           icon: Users,        desc: 'LinkedIn bio generator + connection message templates' },
  { name: 'Architecture',       route: '/architecture',         icon: GitBranch,    desc: 'SVG system diagram + ADBMS features checklist' },
];

const ADBMS_FEATURES = [
  { label: 'Table Partitioning',   desc: 'job_matches_partitioned — monthly RANGE on created_at' },
  { label: 'Full-Text Search',     desc: 'tsvector + GIN index + plainto_tsquery() + ts_headline()' },
  { label: 'Stored Procedures',    desc: 'calculate_match(), get_skill_gap(), export_user_data()' },
  { label: 'Materialized Views',   desc: 'top_job_matches_view, skill_demand_analysis' },
  { label: 'Audit Triggers',       desc: 'trg_resume_insert_audit, trg_job_match_insert_audit' },
  { label: 'Resume Versioning',    desc: 'trg_resume_versioning — auto-version on raw_text change' },
  { label: 'JSONB + GIN Indexes',  desc: 'matched_skills, missing_skills stored as JSONB arrays' },
  { label: 'Row Level Security',   desc: 'Per-user data isolation on all tables' },
  { label: 'Query Optimization',   desc: '15+ composite indexes, EXPLAIN ANALYZE documented' },
  { label: 'Backup Functions',     desc: 'export_user_data() returns full JSONB dump' },
  { label: 'Analytics Views',      desc: 'daily_upload_stats, role_distribution, top_skills_view' },
  { label: 'Skill Gap Sessions',   desc: 'skill_gap_sessions + top_skill_gaps + role_transitions views' },
];

const ML_PIPELINE = [
  { step: '1', label: 'File Parsing',      desc: 'PDF (pdfjs-dist), DOCX (mammoth), TXT — browser-native' },
  { step: '2', label: 'Skill Extraction',  desc: '200+ alias mappings (React.js→react, sklearn→scikit-learn)' },
  { step: '3', label: 'TF-IDF Vectorizer', desc: 'Unigram + bigram, max 5000 features, sublinear TF' },
  { step: '4', label: 'Naive Bayes',       desc: 'Multinomial NB (α=0.1) — role classification' },
  { step: '5', label: 'Fuzzy Matching',    desc: 'Levenshtein + Jaccard similarity (threshold 0.85/0.50)' },
  { step: '6', label: 'Weighted Score',    desc: 'final = 0.7 × ML_score + 0.3 × Fuzzy_score' },
  { step: '7', label: 'Job Compatibility', desc: 'All 10 roles scored simultaneously → ranked list' },
];

const TECH_STACK = [
  { layer: 'Frontend',   items: ['React 18', 'Vite 7', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'shadcn/ui'] },
  { layer: 'Backend',    items: ['FastAPI', 'Python 3.11', 'asyncpg', 'pydantic', 'uvicorn'] },
  { layer: 'ML (Browser)', items: ['Custom TF-IDF', 'Naive Bayes (TS)', 'Fuzzy Matcher', 'Skill Extractor'] },
  { layer: 'ML (Server)', items: ['scikit-learn', 'pdfminer', 'python-docx', 'numpy'] },
  { layer: 'Database',   items: ['PostgreSQL 15', 'Supabase', 'JSONB', 'tsvector', 'GIN indexes'] },
  { layer: 'DevOps',     items: ['Docker', 'GitHub Actions', 'Vercel', 'Railway'] },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ProjectSummaryPage() {
  const navigate = useNavigate();

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay },
  });

  return (
    <div className="page-content max-w-6xl space-y-10">

      {/* Header */}
      <motion.div {...fadeUp()} className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ background: 'hsl(var(--primary) / 0.08)', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--primary) / 0.2)' }}>
          <Zap className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
          Production Platform — Full Feature Overview
        </div>
        <h1 className="font-display text-3xl font-bold">Next Step Career AI</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          Enterprise-grade resume intelligence platform with ML role prediction, ADBMS features,
          FastAPI backend, and 14 fully functional pages.
        </p>
        <div className="flex flex-wrap gap-2 justify-center pt-1">
          {['React 18', 'FastAPI', 'PostgreSQL', 'TF-IDF + Naive Bayes', 'Fuzzy Logic', 'Supabase', 'Docker'].map(t => (
            <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: '14',   label: 'App Pages',      sub: 'fully functional', color: '#2563EB' },
          { value: '17',   label: 'DB Migrations',  sub: 'SQL migrations',   color: '#8B5CF6' },
          { value: '12',   label: 'ADBMS Features', sub: 'implemented',      color: '#10B981' },
          { value: '200+', label: 'Skill Aliases',  sub: 'ML mappings',      color: '#F59E0B' },
        ].map(({ value, label, sub, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 + i * 0.06 }}
            className="metric-card"
          >
            <p className="stat-number" style={{ color }}>{value}</p>
            <p className="text-sm font-semibold mt-1">{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Pages grid */}
      <motion.div {...fadeUp(0.1)}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4" /> All Pages ({PAGES.length})
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PAGES.map((page, i) => (
            <motion.div
              key={page.route}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.03 }}
              className="flex items-start gap-3 p-3 border rounded-xl hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors"
              onClick={() => navigate(page.route)}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <page.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{page.name}</p>
                  <Badge variant="outline" className="text-xs font-mono">{page.route}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{page.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ML Pipeline */}
      <motion.div {...fadeUp(0.2)}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Brain className="h-4 w-4" /> ML Pipeline
        </h2>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-primary/20" />
          <div className="space-y-3">
            {ML_PIPELINE.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + i * 0.06 }}
                className="flex items-start gap-4 pl-2"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 z-10">
                  {step.step}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ADBMS Features */}
      <motion.div {...fadeUp(0.28)}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Database className="h-4 w-4" /> ADBMS Features (17 Migrations)
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {ADBMS_FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.30 + i * 0.04 }}
              className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-800">{f.label}</p>
                <p className="text-xs text-emerald-700 mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div {...fadeUp(0.36)}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Code2 className="h-4 w-4" /> Tech Stack
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECH_STACK.map((layer, i) => (
            <motion.div
              key={layer.layer}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 + i * 0.06 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    {layer.layer}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {layer.items.map(item => (
                      <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Backend API */}
      <motion.div {...fadeUp(0.44)}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Server className="h-4 w-4" /> FastAPI Backend Endpoints
        </h2>
        <Card>
          <CardContent className="pt-4">
            <div className="grid sm:grid-cols-2 gap-2 font-mono text-xs">
              {[
                ['POST', '/api/resume/analyze',          'Upload + parse + ML analysis'],
                ['GET',  '/api/resume/history/{user_id}','Resume upload history'],
                ['POST', '/api/match/job',               'Resume vs job description'],
                ['POST', '/api/match/rank',              'Multi-resume ranking'],
                ['GET',  '/api/search/resumes',          'Full-text search (tsvector)'],
                ['GET',  '/api/analytics/overview',      'KPI metrics'],
                ['GET',  '/api/analytics/role-distribution', 'Role pie chart data'],
                ['GET',  '/api/analytics/upload-trend',  'Upload trend (30 days)'],
                ['GET',  '/api/analytics/top-skills',    'Top skills frequency'],
                ['GET',  '/api/analytics/ml-vs-fuzzy',   'ML vs Fuzzy comparison'],
                ['GET',  '/api/backup/export/{user_id}', 'JSON data export'],
                ['GET',  '/health',                      'Health check'],
              ].map(([method, path, desc]) => (
                <div key={path} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                  <Badge className={`text-xs shrink-0 ${method === 'POST' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {method}
                  </Badge>
                  <div>
                    <p className="font-mono text-xs">{path}</p>
                    <p className="text-xs text-muted-foreground font-sans">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div {...fadeUp(0.5)} className="text-center space-y-3 pb-4">
        <p className="text-sm text-muted-foreground">Start with the Resume Analyzer to see the full ML pipeline in action</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={() => navigate('/resume')} className="gap-2">
            <FileText className="h-4 w-4" /> Analyze Resume
          </Button>
          <Button variant="outline" onClick={() => navigate('/salary-insights')} className="gap-2">
            <Database className="h-4 w-4" /> Salary Insights
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
            <GitBranch className="h-4 w-4" /> Dashboard
          </Button>
        </div>
      </motion.div>

    </div>
  );
}
