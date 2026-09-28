import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Trophy, ChevronDown, ChevronUp, X } from 'lucide-react';
import { analyzeResume } from '@/ai/ml/skillAnalyzer';
import { getDataset } from '@/ai/ml/rolePredictor';

const ROLES = getDataset().map(e => ({ key: e.role, label: e.display }));

function scoreColor(s: number) {
  if (s >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (s >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-rose-600 bg-rose-50 border-rose-200';
}

function medalColor(rank: number) {
  if (rank === 1) return 'text-yellow-500';
  if (rank === 2) return 'text-slate-400';
  if (rank === 3) return 'text-amber-600';
  return 'text-muted-foreground';
}

export function MultiResumeRankingPage() {
  const [files, setFiles]           = useState<Array<{ name: string; text: string }>>([]);
  const [targetRole, setTargetRole] = useState('software_developer');
  const [rankings, setRankings]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [expanded, setExpanded]     = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      ['text/plain', 'application/pdf'].includes(f.type)
    );
    dropped.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setFiles(prev => [...prev, { name: f.name, text: reader.result as string }]);
      reader.readAsText(f);
    });
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setFiles(prev => [...prev, { name: f.name, text: reader.result as string }]);
      reader.readAsText(f);
    });
  };

  const handleRank = () => {
    if (files.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      const results = files.map(f => {
        const r = analyzeResume(f.text, targetRole);
        return {
          name:          f.name,
          predictedRole: r.predictedRole,
          matchScore:    r.finalScore,
          matchedSkills: r.matchedSkills.slice(0, 5),
          missingSkills: r.missingSkills,
          mlScore:       r.mlScore,
          fuzzyScore:    r.fuzzyScore,
        };
      }).sort((a, b) => b.matchScore - a.matchScore)
        .map((r, i) => ({ ...r, rank: i + 1 }));
      setRankings(results);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="page-content max-w-5xl space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
            <Trophy className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Multi-Resume Ranking</h1>
            <p className="text-sm text-muted-foreground">
              Upload multiple resumes and rank them against a single job role.
            </p>
          </div>
        </div>
      </div>

      {/* Config */}
      <div className="ent-card p-5 space-y-4">
        <div>
          <label className="section-label mb-2 block">Target Role</label>
          <select
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            aria-label="Select target role"
          >
            {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>

        {/* Drop zone */}
        <div
          className="upload-zone p-8 text-center"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('multi-upload')?.click()}
          role="button"
          aria-label="Upload resume files"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('multi-upload')?.click()}
        >
          <input id="multi-upload" type="file" multiple accept=".txt,.pdf" className="hidden" onChange={handleFileInput} />
          <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'hsl(var(--primary) / 0.08)' }}>
            <Upload className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold">Drop resumes here or click to browse</p>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>TXT or PDF — multiple files supported</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-1.5">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg text-sm"
                style={{ background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border))' }}>
                <span className="truncate text-sm font-medium">{f.name}</span>
                <button
                  onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                  aria-label={`Remove ${f.name}`}
                  className="ml-2 p-0.5 rounded transition-colors hover:text-red-500"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          className="w-full gradient-bg text-white font-semibold"
          onClick={handleRank}
          disabled={loading || files.length === 0}
        >
          {loading ? 'Ranking...' : `Rank ${files.length} Resume${files.length !== 1 ? 's' : ''}`}
        </Button>
      </div>

      {/* Rankings table */}
      {rankings.length > 0 && (
        <div className="ent-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            <p className="font-display font-semibold text-sm">
              Rankings — {ROLES.find(r => r.key === targetRole)?.label}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Resume</th>
                  <th>Predicted Role</th>
                  <th className="text-right">Match %</th>
                  <th>Top Skills</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r, i) => (
                  <>
                    <motion.tr
                      key={r.name}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="cursor-pointer"
                      onClick={() => setExpanded(expanded === r.name ? null : r.name)}
                    >
                      <td>
                        <span className={`font-bold text-base ${medalColor(r.rank)}`}>#{r.rank}</span>
                      </td>
                      <td className="font-medium truncate max-w-[160px]">{r.name}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                          style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                          {r.predictedRole.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="progress-enterprise w-16">
                            <div className="progress-enterprise-fill" style={{ width: `${r.matchScore}%` }} />
                          </div>
                          <span className={`font-bold text-sm border rounded px-1.5 py-0.5 ${scoreColor(r.matchScore)}`}>
                            {r.matchScore}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {r.matchedSkills.map((s: string) => (
                            <span key={s} className="badge-success text-xs px-1.5 py-0.5 rounded-full capitalize font-medium">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-right">
                        {expanded === r.name
                          ? <ChevronUp className="h-4 w-4 ml-auto" style={{ color: 'hsl(var(--muted-foreground))' }} aria-hidden="true" />
                          : <ChevronDown className="h-4 w-4 ml-auto" style={{ color: 'hsl(var(--muted-foreground))' }} aria-hidden="true" />
                        }
                      </td>
                    </motion.tr>
                    {expanded === r.name && (
                      <tr key={`${r.name}-detail`} style={{ background: 'hsl(var(--primary) / 0.03)' }}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="section-label mb-1">ML Score</p>
                              <p className="font-display text-xl font-bold" style={{ color: '#2563EB' }}>{r.mlScore}%</p>
                            </div>
                            <div>
                              <p className="section-label mb-1">Fuzzy Score</p>
                              <p className="font-display text-xl font-bold" style={{ color: '#F59E0B' }}>{r.fuzzyScore}%</p>
                            </div>
                            <div>
                              <p className="section-label mb-1">Missing Skills</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {r.missingSkills.slice(0, 6).map((s: string) => (
                                  <span key={s} className="badge-error text-xs px-1.5 py-0.5 rounded-full capitalize font-medium">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
