import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText, Target, CheckCircle2, XCircle, Lightbulb,
  Briefcase, TrendingUp, AlertCircle, Star, Zap, Award,
  ArrowUpRight, ArrowDownRight, Minus, BookOpen, ExternalLink,
} from 'lucide-react';
import { getResourcesForSkill } from '@/data/learningResources';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInsights() {
  try { const r = localStorage.getItem('lastAnalysisResult'); if (r) return JSON.parse(r); }
  catch { /* ignore */ }
  return null;
}
function getMLResult() {
  try { const r = localStorage.getItem('lastAnalysisResult'); if (!r) return null; return JSON.parse(r)?.mlResult ?? null; }
  catch { return null; }
}
function getRole(): string {
  try { return localStorage.getItem('lastDetectedRole') ?? 'software_developer'; }
  catch { return 'software_developer'; }
}
function getHistory(): Array<{ score: number; date: string }> {
  try { const r = localStorage.getItem('analysisHistory'); if (r) return JSON.parse(r); }
  catch { /* ignore */ }
  return [];
}
function roleLabel(r: string) {
  return r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function scoreColor(s: number) {
  if (s >= 80) return '#34d399';
  if (s >= 60) return '#818cf8';
  if (s >= 40) return '#fbbf24';
  return '#fb7185';
}
function scoreLabel(s: number) {
  if (s >= 80) return 'Excellent';
  if (s >= 60) return 'Good';
  if (s >= 40) return 'Fair';
  return 'Needs Work';
}

function buildRadarData(insights: any, role: string) {
  const rs = insights?.resumeScore?.componentScores;
  const sm = insights?.skillMatch;
  const defaults: Record<string, number[]> = {
    software_developer: [72, 65, 80, 58, 70],
    aiml_engineer:      [68, 75, 62, 80, 55],
    data_scientist:     [70, 78, 60, 75, 65],
    devops_engineer:    [65, 60, 75, 55, 80],
    product_manager:    [60, 55, 70, 65, 72],
  };
  const d = defaults[role] ?? defaults.software_developer;
  return [
    { category: 'Skills',     score: rs?.skillsScore     ?? d[0] },
    { category: 'Projects',   score: rs?.projectsScore   ?? d[1] },
    { category: 'Experience', score: rs?.experienceScore ?? d[2] },
    { category: 'Education',  score: rs?.educationScore  ?? d[3] },
    { category: 'Match',      score: sm?.matchScore      ?? d[4] },
  ];
}

function buildStrengthsWeaknesses(insights: any, matchedSkills: string[], missingSkills: string[]) {
  const rs = insights?.resumeScore;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (matchedSkills.length >= 5) strengths.push(`Strong skill alignment (${matchedSkills.length} matched)`);
  if (rs?.componentScores?.experienceScore >= 70) strengths.push('Solid experience section');
  if (rs?.componentScores?.projectsScore >= 70) strengths.push('Good project portfolio');
  if (rs?.componentScores?.educationScore >= 70) strengths.push('Strong educational background');
  if (rs?.totalScore >= 75) strengths.push('High overall resume quality');
  if (insights?.sectionAnalysis?.completeness >= 80) strengths.push('Well-structured resume sections');
  if (missingSkills.length >= 5) weaknesses.push(`${missingSkills.length} skill gaps to address`);
  if (rs?.componentScores?.experienceScore < 50) weaknesses.push('Experience section needs more detail');
  if (rs?.componentScores?.projectsScore < 50) weaknesses.push('Add more project examples');
  if (rs?.componentScores?.skillsScore < 50) weaknesses.push('Expand technical skills section');
  if (insights?.sectionAnalysis?.missingSections?.length > 2) weaknesses.push('Several resume sections missing');
  if (strengths.length === 0) strengths.push('Resume uploaded successfully', 'Analysis complete');
  if (weaknesses.length === 0) weaknesses.push('Upload resume for detailed feedback');
  return { strengths: strengths.slice(0, 4), weaknesses: weaknesses.slice(0, 4) };
}

// ── Chart dark theme tokens ────────────────────────────────────────────────────
const CHART_GRID  = 'rgba(255,255,255,0.07)';
const CHART_TICK  = { fontSize: 11, fill: 'rgba(255,255,255,0.35)' };
const CHART_TICK_SM = { fontSize: 9, fill: 'rgba(255,255,255,0.35)' };

// ── Animations ─────────────────────────────────────────────────────────────────
const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Main component ─────────────────────────────────────────────────────────────

export function ResumeInsightsPage() {
  const insights = useMemo(getInsights, []);
  const mlResult = useMemo(getMLResult, []);
  const role     = useMemo(getRole, []);
  const history  = useMemo(getHistory, []);

  const matchScore: number      = insights?.skillMatch?.matchScore ?? mlResult?.finalScore ?? 0;
  const totalScore: number      = insights?.resumeScore?.totalScore ?? 0;
  const matchedSkills: string[] = (insights?.skillMatch?.matchedSkills ?? mlResult?.matchedSkills ?? [])
    .map((s: any) => (typeof s === 'string' ? s : s.skill));
  const missingSkills: string[] = (insights?.skillMatch?.missingSkills ?? mlResult?.missingSkills ?? [])
    .map((s: any) => (typeof s === 'string' ? s : s.skill));

  const dynamicRecommendations = useMemo(() => {
    if (mlResult?.recommendations?.length > 0) {
      return mlResult.recommendations.slice(0, 8).map((r: any) => ({ skill: r.skill, resources: r.resources ?? [] }));
    }
    return missingSkills.slice(0, 8).map(skill => {
      const res = getResourcesForSkill(skill);
      const out: any[] = [];
      if (res.free) out.push({ type: 'free', ...res.free });
      if (res.paid) out.push({ type: 'paid', ...res.paid });
      return { skill, resources: out };
    });
  }, [mlResult, missingSkills]);

  const dynamicJobCompat = useMemo(() => {
    if (mlResult?.jobCompatibility?.length > 0) return mlResult.jobCompatibility;
    if (mlResult?.probabilities) {
      return Object.entries(mlResult.probabilities as Record<string, number>)
        .map(([r, prob]) => ({ role: r, display: r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), score: Math.round(prob * 100) }))
        .sort((a: any, b: any) => b.score - a.score).slice(0, 8);
    }
    return [];
  }, [mlResult]);

  const hasData   = insights !== null || mlResult !== null;
  const hasMLData = mlResult !== null;

  const radarData = useMemo(() => buildRadarData(insights, role), [insights, role]);
  const { strengths, weaknesses } = useMemo(
    () => buildStrengthsWeaknesses(insights, matchedSkills, missingSkills),
    [insights, matchedSkills, missingSkills]
  );

  const timelineData = useMemo(() => {
    const pts = history.map((h, i) => ({ label: `#${i + 1}`, score: h.score }));
    if (hasData) pts.push({ label: 'Now', score: matchScore });
    return pts.length > 0 ? pts : [{ label: 'Now', score: matchScore }];
  }, [history, hasData, matchScore]);

  const prevScore  = history.length > 0 ? history[history.length - 1].score : null;
  const scoreDelta = prevScore !== null ? matchScore - prevScore : null;
  const radialData = [{ name: 'Match', value: matchScore, fill: scoreColor(matchScore) }];
  const gapData    = [
    { name: 'Matched',  count: matchedSkills.length,          fill: '#34d399' },
    { name: 'Missing',  count: missingSkills.length,           fill: '#fb7185' },
    { name: 'To Learn', count: dynamicRecommendations.length,  fill: '#818cf8' },
  ];

  return (
    <motion.div
      className="page-content max-w-6xl space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
          <FileText className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Resume Insights</h1>
          <p className="font-sans text-sm text-white/40">Personalised analysis based on your uploaded resume</p>
        </div>
      </motion.div>

      {/* No-data banner */}
      {!hasData && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 p-4 bg-amber-500/8 border border-amber-500/25 rounded-xl"
        >
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="font-sans text-sm text-amber-300">
            No resume analysis found. Upload and analyse your resume first.{' '}
            Showing role-based defaults for <strong className="text-white/70">{roleLabel(role)}</strong>.
          </p>
        </motion.div>
      )}

      {/* KPI row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: `${matchScore}%`,       label: 'Match Score',    color: scoreColor(matchScore), sub: scoreLabel(matchScore) },
          { value: matchedSkills.length,   label: 'Matched Skills', color: '#34d399', sub: 'skills found' },
          { value: missingSkills.length,   label: 'Skill Gaps',     color: '#fb7185', sub: 'to address' },
          { value: totalScore || '—',      label: 'Resume Score',   color: '#818cf8', sub: 'out of 100' },
        ].map(({ value, label, color, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl border border-white/[0.07] p-4"
            style={{ background: 'rgba(255,255,255,0.025)' }}
          >
            <p className="font-display text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="font-display text-sm font-semibold text-white/70 mt-1">{label}</p>
            <p className="font-sans text-xs text-white/35 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Score delta */}
      {scoreDelta !== null && (
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          {scoreDelta > 0
            ? <><ArrowUpRight className="h-4 w-4 text-emerald-400" /><span className="font-sans text-sm text-emerald-400">+{scoreDelta}% improvement since last analysis</span></>
            : scoreDelta < 0
            ? <><ArrowDownRight className="h-4 w-4 text-rose-400" /><span className="font-sans text-sm text-rose-400">{scoreDelta}% vs last analysis</span></>
            : <><Minus className="h-4 w-4 text-white/35" /><span className="font-sans text-sm text-white/35">Same score as last analysis</span></>
          }
        </motion.div>
      )}

      {/* Charts row 1 */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Radial — match score */}
        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display text-sm font-semibold text-white">Skill Match Score</h3>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                startAngle={90} endAngle={-270} data={radialData}>
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.06)' }} />
                <Tooltip formatter={v => [`${v}%`, 'Match Score']}
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-4xl font-black" style={{ color: scoreColor(matchScore) }}>
                {matchScore}%
              </span>
              <span className="font-sans text-xs text-white/35 mt-1">{scoreLabel(matchScore)}</span>
            </div>
          </div>
          <p className="font-sans text-center text-xs text-white/35 mt-2">
            {matchScore >= 80 ? 'Excellent match for this role'
              : matchScore >= 60 ? 'Good match — a few gaps to close'
              : matchScore >= 40 ? 'Fair match — build key skills'
              : 'Upload your resume to see your score'}
          </p>
        </div>

        {/* Bar — skill gap */}
        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display text-sm font-semibold text-white">Skill Gap Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gapData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="name" tick={CHART_TICK} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={CHART_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {gapData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Charts row 2 */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Radar */}
        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-violet-400" />
            <h3 className="font-display text-sm font-semibold text-white">Skill Category Radar</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke={CHART_GRID} />
              <PolarAngleAxis dataKey="category" tick={CHART_TICK} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={CHART_TICK_SM} />
              <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} dot={{ r: 3, fill: '#818cf8' }} />
              <Tooltip formatter={v => [`${v}`, 'Score']}
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Line — timeline */}
        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-amber-400" />
            <h3 className="font-display text-sm font-semibold text-white">Score Timeline</h3>
          </div>
          {timelineData.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center gap-2">
              <TrendingUp className="h-8 w-8 text-white/15" />
              <p className="font-sans text-sm text-white/30">Upload more resumes to track progress</p>
              <p className="font-sans text-xs text-white/20">Your progress chart will appear here.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timelineData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis dataKey="label" tick={CHART_TICK} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={CHART_TICK} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`${v}%`, 'Match Score']}
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={60} stroke="rgba(129,140,248,0.5)" strokeDasharray="4 4"
                  label={{ value: 'Good', fontSize: 10, fill: 'rgba(129,140,248,0.6)' }} />
                <ReferenceLine y={80} stroke="rgba(52,211,153,0.5)" strokeDasharray="4 4"
                  label={{ value: 'Excellent', fontSize: 10, fill: 'rgba(52,211,153,0.6)' }} />
                <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#818cf8' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-emerald-400" />
            <h3 className="font-display text-sm font-semibold text-emerald-400">Strengths</h3>
          </div>
          <div className="space-y-2.5">
            {strengths.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="font-sans text-sm text-white/70">{s}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <h3 className="font-display text-sm font-semibold text-rose-400">Areas to Improve</h3>
          </div>
          <div className="space-y-2.5">
            {weaknesses.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                className="flex items-start gap-2"
              >
                <XCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                <span className="font-sans text-sm text-white/70">{w}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Matched / Missing skills */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h3 className="font-display text-sm font-semibold text-white">Matched Skills ({matchedSkills.length})</h3>
          </div>
          {matchedSkills.length === 0 ? (
            <p className="font-sans text-sm text-white/30">Upload your resume to see matched skills.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map(s => (
                <span key={s}
                  className="font-sans text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" />{s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-4 w-4 text-rose-400" />
            <h3 className="font-display text-sm font-semibold text-white">Missing Skills ({missingSkills.length})</h3>
          </div>
          {missingSkills.length === 0 ? (
            <p className="font-sans text-sm text-white/30">
              {hasData ? 'No critical gaps detected.' : 'Upload your resume to see gaps.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map(s => (
                <span key={s}
                  className="font-sans text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Skills to learn */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <h3 className="font-display text-sm font-semibold text-white">Skills to Learn</h3>
          {hasMLData && (
            <span className="ml-1 font-sans text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400">
              From your resume
            </span>
          )}
        </div>
        {dynamicRecommendations.length === 0 ? (
          <p className="font-sans text-sm text-white/30">
            Upload your resume to see personalised skill recommendations.
          </p>
        ) : (
          <>
            <p className="font-sans text-sm text-white/40 mb-3">
              Missing skills for <span className="text-white/65">{roleLabel(role)}</span> based on your resume.
            </p>
            <div className="space-y-2">
              {dynamicRecommendations.map((item, i) => {
                const freeRes = item.resources.find((r: any) => r.type === 'free');
                const paidRes = item.resources.find((r: any) => r.type === 'paid');
                return (
                  <div key={item.skill}
                    className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/15 bg-amber-500/5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 font-display text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <p className="font-sans text-sm text-white/70 capitalize flex-1 truncate">{item.skill}</p>
                    <div className="flex gap-1.5 shrink-0">
                      {freeRes && (
                        <a href={freeRes.url} target="_blank" rel="noopener noreferrer">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-1 font-sans text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 cursor-pointer"
                          >
                            <BookOpen className="h-2.5 w-2.5" /> Free
                          </motion.span>
                        </a>
                      )}
                      {paidRes && (
                        <a href={paidRes.url} target="_blank" rel="noopener noreferrer">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-1 font-sans text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 cursor-pointer"
                          >
                            <ExternalLink className="h-2.5 w-2.5" /> Course
                          </motion.span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>

      {/* Job role compatibility */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.07] p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-4 w-4 text-indigo-400" />
          <h3 className="font-display text-sm font-semibold text-white">Job Role Compatibility</h3>
          {hasMLData && (
            <span className="ml-1 font-sans text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              Computed from your resume
            </span>
          )}
        </div>
        {dynamicJobCompat.length === 0 ? (
          <p className="font-sans text-sm text-white/30">Upload your resume to see which roles suit you best.</p>
        ) : (
          <>
            <p className="font-sans text-sm text-white/40 mb-4">All roles ranked by how well your resume matches each one.</p>
            <div className="space-y-3">
              {dynamicJobCompat.map(({ role: r, display, score }: any, i: number) => (
                <div key={r}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="font-sans text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                          Best Match
                        </span>
                      )}
                      <span className="font-sans text-sm text-white/70">{display}</span>
                    </div>
                    <span className="font-display text-sm font-bold" style={{ color: scoreColor(score) }}>{score}%</span>
                  </div>
                  <Progress value={score} className="h-1.5 bg-white/[0.07]" />
                  {i < dynamicJobCompat.length - 1 && <Separator className="mt-3 bg-white/[0.05]" />}
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
