import { useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Award, CheckCircle2, AlertCircle, ArrowRight,
  FileText, Briefcase, GraduationCap, Code2, Lightbulb,
  TrendingUp, Star, Zap, RotateCcw, Download,
} from 'lucide-react';
import { downloadLastAnalysisReport, exportLastAnalysisAsPDF } from '@/services/resumeExport.service';
import { getTextShadow } from '@/utils/colorUtils';
import { getStoredAnalysis, getDetectedRole } from '@/constants/storageKeys';

function scoreColor(s: number): string {
  if (s >= 80) return '#22c55e';
  if (s >= 60) return '#3b82f6';
  if (s >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(s: number): string {
  if (s >= 80) return 'Excellent';
  if (s >= 60) return 'Good';
  if (s >= 40) return 'Fair';
  return 'Needs Work';
}

function scoreBg(s: number): string {
  if (s >= 80) return 'border-green-200 bg-green-50 text-green-700';
  if (s >= 60) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (s >= 40) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-red-200 bg-red-50 text-red-700';
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  // Count-up animation
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(spring, (v) => Math.round(v));

  // Animate the value on mount
  motionValue.set(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <motion.p className="text-4xl font-bold" style={{ color, textShadow: getTextShadow() }}>
          {displayValue}
        </motion.p>
        <p className="text-xs text-muted-foreground font-medium">/100</p>
      </div>
    </div>
  );
}

// ── Component score card ──────────────────────────────────────────────────────

function ComponentCard({
  label, score, contribution, weight, icon: Icon, delay, color,
}: {
  label: string; score: number; contribution: number;
  weight: string; icon: React.ElementType; delay: number; color: string;
}) {
  // Count-up animation
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(spring, (v) => Math.round(v));

  // Animate the value on mount
  motionValue.set(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="metric-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${color}12`, color }}>
          {weight}
        </span>
      </div>
      <motion.p className="stat-number" style={{ color, textShadow: getTextShadow() }}>
        {displayValue}
      </motion.p>
      <p className="text-sm font-semibold mt-1">{label}</p>
      <div className="progress-enterprise mt-2">
        <motion.div
          className="progress-enterprise-fill"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: delay + 0.2 }}
          style={{ background: color }}
        />
      </div>
      <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {contribution} / 100 total pts
      </p>
    </motion.div>
  );
}

// ── Recommendation card ───────────────────────────────────────────────────────

function RecommendationCard({ rec, index }: { rec: string; index: number }) {
  const isPositive = rec.toLowerCase().includes('excellent') ||
    rec.toLowerCase().includes('strong') ||
    rec.toLowerCase().includes('good') ||
    rec.toLowerCase().includes('great');

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
        isPositive
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}
    >
      {isPositive
        ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
        : <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
      }
      <span>{rec}</span>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ResumeScorePage() {
  const navigate = useNavigate();
  const analysis = useMemo(getStoredAnalysis, []);
  const role     = useMemo(() => getDetectedRole() ?? 'software_developer', []);

  const hasData = analysis !== null;

  // Single read path — validated by Zod in getStoredAnalysis
  const rs = analysis?.resumeScore;
  const cs = rs?.componentScores;
  const bd = rs?.breakdown;

  const totalScore = rs?.totalScore ?? 0;

  // Read contributions first — stored in breakdown
  const rawSkillsContrib   = bd?.skillsContribution;
  const rawProjectsContrib = bd?.projectsContribution;
  const rawExpContrib      = bd?.experienceContribution;
  const rawEduContrib      = bd?.educationContribution;

  // Read stored component scores
  const rawSkillsScore   = cs?.skillsScore      ?? 0;
  const rawProjectsScore = cs?.projectsScore    ?? 0;
  const rawExpScore      = cs?.experienceScore  ?? 0;
  const rawEduScore      = cs?.educationScore   ?? 0;

  // When stored score is 0 but a contribution exists, back-calculate the score
  const skillsScore     = rawSkillsScore   > 0 ? rawSkillsScore   : (rawSkillsContrib   ? Math.min(100, Math.round(rawSkillsContrib   / 0.40)) : 0);
  const projectsScore   = rawProjectsScore > 0 ? rawProjectsScore : (rawProjectsContrib ? Math.min(100, Math.round(rawProjectsContrib / 0.25)) : 0);
  const experienceScore = rawExpScore      > 0 ? rawExpScore      : (rawExpContrib      ? Math.min(100, Math.round(rawExpContrib      / 0.20)) : 0);
  const educationScore  = rawEduScore      > 0 ? rawEduScore      : (rawEduContrib      ? Math.min(100, Math.round(rawEduContrib      / 0.15)) : 0);

  // Weighted contributions — use stored or compute from (now-corrected) score
  const skillsContrib     = rawSkillsContrib   ?? Math.round(skillsScore     * 0.40);
  const projectsContrib   = rawProjectsContrib ?? Math.round(projectsScore   * 0.25);
  const experienceContrib = rawExpContrib      ?? Math.round(experienceScore * 0.20);
  const educationContrib  = rawEduContrib      ?? Math.round(educationScore  * 0.15);

  const recs: string[]     = rs?.recommendations ?? [];
  const qualityFlag        = rs?.qualityFlag ?? (totalScore >= 80 ? 'excellent' : totalScore >= 60 ? 'competitive' : 'needs_improvement');
  const factors            = bd?.factors ?? {};

  // ML scores
  const mlResult   = analysis?.mlResult;
  const mlScore    = mlResult?.mlScore    ?? 0;
  const fuzzyScore = mlResult?.fuzzyScore ?? 0;
  const finalScore = mlResult?.finalScore ?? 0;

  const roleLabel = role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  // Bar chart data
  const componentData = [
    { name: 'Skills',     score: skillsScore,     fill: scoreColor(skillsScore)     },
    { name: 'Projects',   score: projectsScore,   fill: scoreColor(projectsScore)   },
    { name: 'Experience', score: experienceScore, fill: scoreColor(experienceScore) },
    { name: 'Education',  score: educationScore,  fill: scoreColor(educationScore)  },
  ];

  // ML breakdown bar chart
  const mlData = [
    { name: 'ML Score',    value: mlScore,    fill: '#1e40af' },
    { name: 'Fuzzy Score', value: fuzzyScore, fill: '#f59e0b' },
    { name: 'Final Score', value: finalScore, fill: '#10b981' },
  ];

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay },
  });

  if (!hasData) {
    return (
      <div className="page-content max-w-2xl text-center py-20">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'hsl(var(--muted))' }}>
          <FileText className="h-8 w-8" style={{ color: 'hsl(var(--muted-foreground))' }} aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">No Resume Analyzed Yet</h1>
        <p className="text-muted-foreground mb-6">
          Upload and analyze your resume first to see your detailed score breakdown.
        </p>
        <Button onClick={() => navigate('/resume')} className="gradient-bg text-white gap-2">
          <ArrowRight className="h-4 w-4" aria-hidden="true" /> Analyze My Resume
        </Button>
      </div>
    );
  }

  return (
    <div className="page-content max-w-5xl space-y-8">

      {/* Header */}
      <motion.div {...fadeUp()} className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
            <Award className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Resume Score Breakdown</h1>
            <p className="text-sm text-muted-foreground">
              Detailed analysis for <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{roleLabel}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => { const ok = exportLastAnalysisAsPDF(); if (!ok) navigate('/resume'); }}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Print PDF
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => { const ok = downloadLastAnalysisReport(); if (!ok) navigate('/resume'); }}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export HTML
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/resume')} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Re-analyze
          </Button>
        </div>
      </motion.div>

      {/* Hero score + quality flag */}
      <motion.div {...fadeUp(0.05)}>
        <div className="ent-card p-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreRing score={totalScore} />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <span className="text-sm font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: `${scoreColor(totalScore)}18`,
                    color: scoreColor(totalScore),
                    border: `1px solid ${scoreColor(totalScore)}30`,
                  }}>
                  {scoreLabel(totalScore)}
                </span>
                {qualityFlag === 'excellent' && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: '#FEF3C718', color: '#B45309', border: '1px solid #FDE68A' }}>
                    <Star className="h-3 w-3" aria-hidden="true" /> Top Candidate
                  </span>
                )}
              </div>
              <p className="text-sm max-w-md" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {totalScore >= 80
                  ? 'Your resume is highly competitive. You have strong alignment with the target role.'
                  : totalScore >= 60
                  ? 'Good foundation. A few targeted improvements will make you significantly more competitive.'
                  : totalScore >= 40
                  ? 'Fair match. Focus on the skill gaps and project experience to boost your score.'
                  : 'Upload a more detailed resume or work on the key skill areas to improve your score.'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { label: 'Skills',     value: skillsContrib,     color: '#2563EB' },
                  { label: 'Projects',   value: projectsContrib,   color: '#8B5CF6' },
                  { label: 'Experience', value: experienceContrib, color: '#10B981' },
                  { label: 'Education',  value: educationContrib,  color: '#F59E0B' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-2 rounded-lg" style={{ background: `${color}0A` }}>
                    <p className="font-display text-xl font-bold" style={{ color, textShadow: getTextShadow() }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Component score cards */}
      <motion.div {...fadeUp(0.1)}>
        <p className="section-label mb-3 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" /> Component Scores
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ComponentCard label="Skills"     score={skillsScore}     contribution={skillsContrib}     weight="40%" icon={Code2}         delay={0.12} color="#2563EB" />
          <ComponentCard label="Projects"   score={projectsScore}   contribution={projectsContrib}   weight="25%" icon={Briefcase}     delay={0.16} color="#8B5CF6" />
          <ComponentCard label="Experience" score={experienceScore} contribution={experienceContrib} weight="20%" icon={TrendingUp}    delay={0.20} color="#10B981" />
          <ComponentCard label="Education"  score={educationScore}  contribution={educationContrib}  weight="15%" icon={GraduationCap} delay={0.24} color="#F59E0B" />
        </div>
      </motion.div>

      {/* Bar chart comparison */}
      <motion.div {...fadeUp(0.18)} className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Component Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={componentData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}`, 'Score']} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {componentData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" /> ML Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mlScore > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mlData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, '']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {mlData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>ML scores available after resume analysis</p>
                </div>
              </div>
            )}
            {mlScore > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-bold text-blue-600">{mlScore}%</p>
                  <p className="text-muted-foreground">TF-IDF</p>
                </div>
                <div>
                  <p className="font-bold text-amber-600">{fuzzyScore}%</p>
                  <p className="text-muted-foreground">Fuzzy</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-600">{finalScore}%</p>
                  <p className="text-muted-foreground">Final</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Scoring factors */}
      {Object.keys(factors).length > 0 && (
        <motion.div {...fadeUp(0.24)}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Scoring Factors
          </h2>
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { key: 'matchPercentage',    label: 'Skill Match %',       suffix: '%' },
                  { key: 'matchedSkillCount',  label: 'Skills Matched',      suffix: '' },
                  { key: 'missingSkillCount',  label: 'Skills Missing',      suffix: '' },
                  { key: 'experienceYears',    label: 'Experience (years)',  suffix: 'y' },
                  { key: 'projectCount',       label: 'Projects',            suffix: '' },
                  { key: 'certificationCount', label: 'Certifications',      suffix: '' },
                ].filter(f => factors[f.key] !== undefined).map(({ key, label, suffix }) => (
                  <div key={key} className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold" style={{ textShadow: getTextShadow() }}>{factors[key]}{suffix}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      {recs.length > 0 && (
        <motion.div {...fadeUp(0.28)}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" /> Recommendations
          </h2>
          <div className="space-y-2">
            {recs.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* No recommendations fallback */}
      {recs.length === 0 && (
        <motion.div {...fadeUp(0.28)}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" /> Improvement Tips
          </h2>
          <div className="space-y-2">
            {[
              totalScore < 80 && skillsScore < 70  && 'Add more technical skills relevant to your target role',
              totalScore < 80 && projectsScore < 60 && 'Include 2–3 detailed project descriptions with technologies used',
              totalScore < 80 && experienceScore < 60 && 'Expand your experience section with quantified achievements',
              totalScore < 80 && educationScore < 60 && 'Add certifications or relevant coursework to strengthen education',
              totalScore >= 80 && 'Your resume is strong — focus on tailoring it to specific job descriptions',
            ].filter(Boolean).map((tip, i) => (
              <RecommendationCard key={i} rec={tip as string} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA row */}
      <motion.div {...fadeUp(0.32)} className="grid sm:grid-cols-3 gap-3">
        <Button variant="outline" onClick={() => navigate('/skill-gap')} className="gap-2">
          <Zap className="h-4 w-4" /> Skill Gap Analysis
        </Button>
        <Button variant="outline" onClick={() => navigate('/analytics')} className="gap-2">
          <TrendingUp className="h-4 w-4" /> Full Insights
        </Button>
        <Button onClick={() => navigate('/resume')} className="gap-2 bg-primary text-white">
          <RotateCcw className="h-4 w-4" /> Re-analyze Resume
        </Button>
      </motion.div>


    </div>
  );
}
