import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';

export function ArchitecturePage() {
  return (
    <div className="page-content max-w-6xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #475569, #1E293B)' }}>
          <GitBranch className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">System Architecture</h1>
          <p className="text-sm text-muted-foreground">
            Production-grade Resume Intelligence Platform — data flow diagram
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <svg viewBox="0 0 900 620" className="w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
              </marker>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* ── Layer labels ── */}
            <text x="20" y="55"  fontSize="11" fill="#94a3b8" fontWeight="600" fontFamily="Inter,sans-serif">FRONTEND</text>
            <text x="20" y="215" fontSize="11" fill="#94a3b8" fontWeight="600" fontFamily="Inter,sans-serif">BACKEND API</text>
            <text x="20" y="375" fontSize="11" fill="#94a3b8" fontWeight="600" fontFamily="Inter,sans-serif">ML / NLP LAYER</text>
            <text x="20" y="505" fontSize="11" fill="#94a3b8" fontWeight="600" fontFamily="Inter,sans-serif">DATABASE</text>

            {/* ── Layer backgrounds ── */}
            <rect x="10" y="60"  width="880" height="130" rx="12" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1" />
            <rect x="10" y="220" width="880" height="130" rx="12" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="10" y="380" width="880" height="110" rx="12" fill="#fdf4ff" stroke="#e9d5ff" strokeWidth="1" />
            <rect x="10" y="510" width="880" height="100" rx="12" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1" />

            {/* ── FRONTEND boxes ── */}
            {[
              { x: 40,  label: 'Dashboard',    sub: 'Metrics + Charts' },
              { x: 190, label: 'Resume Upload', sub: 'PDF/DOCX/TXT' },
              { x: 340, label: 'Job Matching',  sub: 'JD Comparison' },
              { x: 490, label: 'Search',        sub: 'Full-text' },
              { x: 640, label: 'Analytics',     sub: 'Recharts' },
              { x: 790, label: 'DBMS Page',     sub: 'Live DB Views' },
            ].map(b => (
              <g key={b.label}>
                <rect x={b.x} y="75" width="120" height="55" rx="8" fill="white" stroke="#1e40af" strokeWidth="1.5" filter="url(#shadow)" />
                <text x={b.x + 60} y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af" fontFamily="Inter,sans-serif">{b.label}</text>
                <text x={b.x + 60} y="116" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="Inter,sans-serif">{b.sub}</text>
              </g>
            ))}

            {/* ── BACKEND boxes ── */}
            {[
              { x: 40,  label: '/resume/analyze', sub: 'Upload + Parse' },
              { x: 210, label: '/match/job',       sub: 'JD Comparison' },
              { x: 380, label: '/search/resumes',  sub: 'FTS Query' },
              { x: 550, label: '/analytics',       sub: 'Aggregations' },
              { x: 720, label: '/backup/export',   sub: 'JSON Export' },
            ].map(b => (
              <g key={b.label}>
                <rect x={b.x} y="235" width="150" height="55" rx="8" fill="white" stroke="#10b981" strokeWidth="1.5" filter="url(#shadow)" />
                <text x={b.x + 75} y="260" textAnchor="middle" fontSize="10" fontWeight="600" fill="#059669" fontFamily="Inter,sans-serif">{b.label}</text>
                <text x={b.x + 75} y="276" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="Inter,sans-serif">{b.sub}</text>
              </g>
            ))}

            {/* ── ML boxes ── */}
            {[
              { x: 60,  label: 'TF-IDF Vectorizer',  sub: 'Unigram + Bigram' },
              { x: 260, label: 'Naive Bayes',         sub: 'Role Classifier' },
              { x: 460, label: 'Fuzzy Matcher',       sub: 'Levenshtein' },
              { x: 660, label: 'Skill Extractor',     sub: '200+ Aliases' },
            ].map(b => (
              <g key={b.label}>
                <rect x={b.x} y="395" width="170" height="55" rx="8" fill="white" stroke="#8b5cf6" strokeWidth="1.5" filter="url(#shadow)" />
                <text x={b.x + 85} y="420" textAnchor="middle" fontSize="10" fontWeight="600" fill="#7c3aed" fontFamily="Inter,sans-serif">{b.label}</text>
                <text x={b.x + 85} y="436" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="Inter,sans-serif">{b.sub}</text>
              </g>
            ))}

            {/* ── DB boxes ── */}
            {[
              { x: 40,  label: 'resumes',       sub: 'tsvector + GIN' },
              { x: 200, label: 'job_matches',   sub: 'Partitioned' },
              { x: 360, label: 'extracted_skills', sub: 'JSONB' },
              { x: 520, label: 'audit_logs',    sub: 'Triggers' },
              { x: 680, label: 'job_roles',     sub: 'Dataset' },
            ].map(b => (
              <g key={b.label}>
                <rect x={b.x} y="525" width="140" height="55" rx="8" fill="white" stroke="#f97316" strokeWidth="1.5" filter="url(#shadow)" />
                <text x={b.x + 70} y="550" textAnchor="middle" fontSize="10" fontWeight="600" fill="#ea580c" fontFamily="Inter,sans-serif">{b.label}</text>
                <text x={b.x + 70} y="566" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="Inter,sans-serif">{b.sub}</text>
              </g>
            ))}

            {/* ── Arrows: Frontend → Backend ── */}
            {[100, 250, 400, 550, 700].map(x => (
              <line key={x} x1={x} y1="130" x2={x} y2="233" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow)" />
            ))}

            {/* ── Arrows: Backend → ML ── */}
            {[115, 285, 455, 625].map(x => (
              <line key={x} x1={x} y1="290" x2={x} y2="393" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow)" />
            ))}

            {/* ── Arrows: Backend → DB ── */}
            {[115, 285, 455, 625, 750].map((x, i) => (
              <line key={i} x1={x} y1="290" x2={[110, 270, 430, 590, 750][i]} y2="523" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            ))}

            {/* ── Labels on arrows ── */}
            <text x="155" y="185" fontSize="9" fill="#64748b" fontFamily="Inter,sans-serif">HTTP/REST</text>
            <text x="155" y="345" fontSize="9" fill="#64748b" fontFamily="Inter,sans-serif">ML Pipeline</text>
            <text x="480" y="415" fontSize="9" fill="#64748b" fontFamily="Inter,sans-serif">SQL + JSONB</text>
          </svg>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { color: 'bg-blue-100 border-blue-400',   label: 'Frontend (React + Vite)' },
          { color: 'bg-emerald-100 border-emerald-400', label: 'Backend (FastAPI Python)' },
          { color: 'bg-purple-100 border-purple-400',  label: 'ML Layer (scikit-learn)' },
          { color: 'bg-orange-100 border-orange-400',  label: 'Database (PostgreSQL)' },
        ].map(l => (
          <div key={l.label} className={`flex items-center gap-2 p-3 rounded-lg border ${l.color}`}>
            <div className={`w-3 h-3 rounded-sm border-2 ${l.color}`} />
            <span className="text-xs font-medium">{l.label}</span>
          </div>
        ))}
      </div>

      {/* ADBMS features summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">ADBMS Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              'Table Partitioning (monthly)',
              'Full-Text Search (tsvector)',
              'GIN Indexes (JSONB)',
              'Stored Procedures',
              'Materialized Views',
              'Audit Triggers',
              'Row Level Security',
              'Resume Versioning',
              'Backup Functions',
              'Query Optimization',
              'Composite Indexes',
              'Analytics Views',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs p-2 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
