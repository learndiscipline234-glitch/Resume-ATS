import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2, XCircle, AlertCircle, Upload, Briefcase,
  Target, TrendingUp, BookOpen, ExternalLink,
} from 'lucide-react';
import { analyzeResume } from '@/ai/ml/skillAnalyzer';
import { extractSkillsFromText } from '@/ai/ml/skillAnalyzer';
import { getResourcesForSkill } from '@/data/learningResources';

function scoreColor(s: number) {
  if (s >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-200' };
  if (s >= 50) return { text: 'text-amber-600',   bg: 'bg-amber-500',   ring: 'ring-amber-200'   };
  return              { text: 'text-rose-600',     bg: 'bg-rose-500',    ring: 'ring-rose-200'    };
}

function ScoreCircle({ score }: { score: number }) {
  const c = scoreColor(score);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className={`relative w-36 h-36 flex items-center justify-center rounded-full ring-4 ${c.ring}`}>
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <motion.circle
          cx="72" cy="72" r={r} fill="none"
          stroke={score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#e11d48'}
          strokeWidth="10"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center z-10">
        <p className={`text-3xl font-bold ${c.text}`}>{score}%</p>
        <p className="text-xs text-muted-foreground">Match</p>
      </div>
    </div>
  );
}

export function JobMatchingPage() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText]         = useState('');
  const [result, setResult]         = useState<any>(null);
  const [loading, setLoading]       = useState(false);

  const handleMatch = () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const resumeSkills = extractSkillsFromText(resumeText);
      const jdSkills     = extractSkillsFromText(jdText);
      const resumeSet    = new Set(resumeSkills.map(s => s.toLowerCase()));
      const jdSet        = new Set(jdSkills.map(s => s.toLowerCase()));
      const matched      = [...resumeSet].filter(s => jdSet.has(s));
      const missing      = [...jdSet].filter(s => !resumeSet.has(s));
      const extra        = [...resumeSet].filter(s => !jdSet.has(s));
      const pct          = jdSet.size > 0 ? Math.round(matched.length / jdSet.size * 100) : 0;
      setResult({ matched, missing, extra, pct, resumeSkills, jdSkills });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="page-content max-w-6xl space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}>
            <Briefcase className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Job Matching Engine</h1>
            <p className="text-sm text-muted-foreground">
              Paste your resume and a job description to see how well you match.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: inputs */}
        <div className="space-y-4">
          <div className="ent-card p-4">
            <p className="section-label mb-3 flex items-center gap-2">
              <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Your Resume
            </p>
            <Textarea
              placeholder="Paste your resume text here..."
              className="min-h-[200px] font-code text-xs resize-none"
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              aria-label="Resume text"
            />
          </div>

          <div className="ent-card p-4">
            <p className="section-label mb-3 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" /> Job Description
            </p>
            <Textarea
              placeholder="Paste the job description here..."
              className="min-h-[200px] font-code text-xs resize-none"
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              aria-label="Job description text"
            />
          </div>

          <Button
            className="w-full gradient-bg text-white font-semibold"
            onClick={handleMatch}
            disabled={loading || !resumeText.trim() || !jdText.trim()}
          >
            {loading ? 'Analyzing...' : 'Analyze Match'}
          </Button>
        </div>

        {/* Right: results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Score circle */}
              <div className="ent-card p-6 flex flex-col items-center gap-4">
                <ScoreCircle score={result.pct} />
                <div className="grid grid-cols-3 gap-4 w-full text-center">
                  <div>
                    <p className="stat-number" style={{ color: '#10B981', fontSize: '1.75rem' }}>{result.matched.length}</p>
                    <p className="text-xs text-muted-foreground">Matched</p>
                  </div>
                  <div>
                    <p className="stat-number" style={{ color: '#EF4444', fontSize: '1.75rem' }}>{result.missing.length}</p>
                    <p className="text-xs text-muted-foreground">Missing</p>
                  </div>
                  <div>
                    <p className="stat-number" style={{ color: '#2563EB', fontSize: '1.75rem' }}>{result.jdSkills.length}</p>
                    <p className="text-xs text-muted-foreground">JD Skills</p>
                  </div>
                </div>
              </div>

              {/* Skill comparison */}
              <div className="ent-card p-4 space-y-4">
                <p className="section-label">Skill Comparison</p>
                {/* Matched */}
                {result.matched.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                      style={{ color: '#059669' }}>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Matched ({result.matched.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matched.map((s: string) => (
                        <span key={s} className="badge-success text-xs px-2 py-0.5 rounded-full capitalize font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Missing */}
                {result.missing.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                      style={{ color: '#DC2626' }}>
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Missing ({result.missing.length})
                    </p>
                    <div className="space-y-1.5">
                      {result.missing.slice(0, 8).map((s: string) => {
                        const res = getResourcesForSkill(s);
                        return (
                          <div key={s} className="flex items-center justify-between p-2 rounded-lg border text-xs"
                            style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
                            <span className="font-medium capitalize">{s}</span>
                            <div className="flex gap-1">
                              {res.free && (
                                <a href={res.free.url} target="_blank" rel="noopener noreferrer">
                                  <span className="badge-info text-xs px-2 py-0.5 rounded-full cursor-pointer flex items-center gap-1">
                                    <BookOpen className="h-2.5 w-2.5" aria-hidden="true" /> Free
                                  </span>
                                </a>
                              )}
                              {res.paid && (
                                <a href={res.paid.url} target="_blank" rel="noopener noreferrer">
                                  <span className="text-xs px-2 py-0.5 rounded-full cursor-pointer flex items-center gap-1"
                                    style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                                    <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" /> Course
                                  </span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <div className="flex items-center justify-center h-full min-h-[300px] text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'hsl(var(--muted))' }}>
                <Target className="h-8 w-8" style={{ color: 'hsl(var(--muted-foreground))' }} aria-hidden="true" />
              </div>
              <p className="text-sm font-medium">Paste your resume and job description</p>
              <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                then click Analyze Match to see your score
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
