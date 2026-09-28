import { useState, useCallback } from 'react';
import {
  setStoredAnalysis, setDetectedRole, getAnalysisHistory, setAnalysisHistory,
  STORAGE_KEYS,
} from '@/constants/storageKeys';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle, AlertCircle, ExternalLink, BookOpen, Target,
  ChevronRight, RotateCcw, Briefcase, Brain, Upload,
  FileText, Cpu, ScanText, Search, UploadCloud, CheckCircle2, Award, Download,
} from 'lucide-react';import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MLAnalysisService, MLAnalysisResult } from '@/services/mlAnalysis.service';
import { ResumeIntelligenceService } from '@/services/resumeIntelligence.service';
import { downloadAnalysisReport } from '@/services/resumeExport.service';
import { explainPrediction, ExplainabilityResult } from '@/ai/explainability/explainableAI';
import { getDataset, JobRoleEntry } from '@/ai/ml/rolePredictor';
import { FileProcessingService } from '@/lib/fileProcessingService';
import { parseResumeSections, scoreSections, ParsedSections, SectionScores } from '@/ai/parser/resumeSectionParser';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ── Role list from dataset ────────────────────────────────────────────────────
const ROLES: { key: string; label: string }[] = getDataset().map((e: JobRoleEntry) => ({
  key:   e.role,
  label: e.display,
}));

// ── Skill card ────────────────────────────────────────────────────────────────
function SkillCard({ skill, variant, resources }: {
  skill: string;
  variant: 'matched' | 'missing';
  resources?: { type: string; title: string; url: string; platform: string }[];
}) {
  const isMatched = variant === 'matched';
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm leading-relaxed ${
        isMatched ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isMatched
          ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
          : <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" />
        }
        <span className="font-medium truncate capitalize tracking-wide">{skill}</span>
      </div>
      {!isMatched && resources && resources.length > 0 && (
        <div className="flex gap-1 shrink-0 ml-2">
          {resources.filter(r => r.type === 'free').slice(0, 1).map(r => (
            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">
              <Badge variant="secondary" className="text-xs gap-1 cursor-pointer">
                <BookOpen className="h-2.5 w-2.5" /> Free
              </Badge>
            </a>
          ))}
          {resources.filter(r => r.type === 'paid').slice(0, 1).map(r => (
            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="text-xs gap-1 cursor-pointer">
                <ExternalLink className="h-2.5 w-2.5" /> Course
              </Badge>
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── ML Results view ───────────────────────────────────────────────────────────
function MLResultsView({ result, selectedRole, onReset }: {
  result: MLAnalysisResult;
  selectedRole: string;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  const [showExplain, setShowExplain] = useState(false);
  const roleLabel         = ROLES.find(r => r.key === selectedRole)?.label ?? selectedRole;
  const predictedLabel    = ROLES.find(r => r.key === result.predictedRole)?.label ?? result.predictedRole;
  const recMap = new Map(result.recommendations.map(r => [r.skill.toLowerCase(), r.resources]));

  // ── 100% Dynamic Explainable AI ──────────────────────────────────────────
  // Uses actual resume text from localStorage + real ML output
  const explain = showExplain ? (() => {
    // Get full resume text (not just skill names)
    let resumeText = result.extractedSkills.join(' ');
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RESUME_ANALYSIS);
      if (raw) {
        const parsed = JSON.parse(raw);
        const fullText = parsed?.parsedResume?.text ?? parsed?.mlResult?.resumeText ?? '';
        if (fullText.length > 50) resumeText = fullText;
      }
    } catch { /* use skill join fallback */ }

    return explainPrediction(
      resumeText,
      result.predictedRole,
      result.probabilities,
      result.extractedSkills,
      selectedRole,
      result.matchedSkills,
      result.missingSkills
    );
  })() : null;

  // ── FIX 2: Parse resume sections from stored text ─────────────────────────
  const { sections: parsedSections, sectionScores } = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RESUME_ANALYSIS);
      if (!raw) return { sections: null, sectionScores: null };
      const parsed = JSON.parse(raw);
      const fullText = parsed?.parsedResume?.text ?? '';
      if (!fullText || fullText.length < 50) return { sections: null, sectionScores: null };
      const sections = parseResumeSections(fullText);
      const scores   = scoreSections(sections, result.finalScore);
      return { sections, sectionScores: scores };
    } catch { return { sections: null, sectionScores: null }; }
  })();

  // ── Dynamic explanation text (per spec) ──────────────────────────────────
  const dynamicExplanation = (() => {
    const topSkills = result.matchedSkills.slice(0, 4);
    const missingSkills = result.missingSkills.slice(0, 3);
    const confidence = result.confidence ?? result.mlConfidence ?? 0;

    if (result.predictedRole === selectedRole) {
      return `Your resume strongly matches ${roleLabel} because of high presence of: ${
        topSkills.length > 0 ? topSkills.join(', ') : 'relevant technical skills'
      }. Confidence: ${confidence}%. Final score: ${result.finalScore}% (0.7 × ML + 0.3 × Fuzzy).`;
    } else {
      return `Your resume is closer to ${predictedLabel} (${confidence}% confidence) due to skills like ${
        topSkills.length > 0 ? topSkills.join(', ') : 'detected skills'
      }, but is missing ${
        missingSkills.length > 0 ? missingSkills.join(', ') : 'key skills'
      } required for ${roleLabel}. Final match score: ${result.finalScore}%.`;
    }
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-success" />
          <h2 className="text-xl font-semibold">ML Analysis Complete</h2>
          <Badge variant="secondary">{roleLabel}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/score')}>
            <Award className="h-4 w-4 mr-1" /> View Score
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => {
              try {
                const raw = localStorage.getItem(STORAGE_KEYS.RESUME_ANALYSIS);
                const analysis = raw ? JSON.parse(raw) : null;
                downloadAnalysisReport(result, analysis, selectedRole);
              } catch { /* ignore */ }
            }}
          >
            <Download className="h-4 w-4 mr-1" /> Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" /> Start Over
          </Button>
        </div>
      </div>

      {/* ML Prediction card */}
      <Card className="clean-card">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">ML + Soft Computing Analysis</span>
            <Badge variant="secondary" className="text-xs">
              TF-IDF + Naive Bayes + Fuzzy Logic
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface rounded-lg p-3 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">ML Score</p>
              <p className="text-2xl font-bold text-primary">{result.mlScore}%</p>
              <Progress value={result.mlScore} className="h-1 mt-1" />
              <p className="text-xs text-muted-foreground mt-1">TF-IDF match</p>
            </div>
            <div className="bg-surface rounded-lg p-3 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Fuzzy Score</p>
              <p className="text-2xl font-bold text-warning">{result.fuzzyScore}%</p>
              <Progress value={result.fuzzyScore} className="h-1 mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Levenshtein</p>
            </div>
            <div className="bg-surface rounded-lg p-3 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Final Score</p>
              <p className="text-2xl font-bold text-primary">{result.finalScore}%</p>
              <Progress value={result.finalScore} className="h-1 mt-1" />
              <p className="text-xs text-muted-foreground mt-1">0.7×ML + 0.3×Fuzzy</p>
            </div>
            <div className="bg-surface rounded-lg p-3 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-2xl font-bold text-success">{result.confidence}%</p>
              <Progress value={result.confidence} className="h-1 mt-1" />
              <p className="text-xs text-muted-foreground mt-1">ML confidence</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Predicted Role: <span className="font-medium text-purple-700">{result.predictedDisplay}</span></div>
            <div>Skills Extracted: <span className="font-medium">{result.extractedSkills.length}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* ── Explainable AI Panel ── */}
      <Card className="border-indigo-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-600" />
              Explainable AI — Why This Role?
            </CardTitle>
            <Button
              variant="ghost" size="sm"
              onClick={() => setShowExplain(!showExplain)}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              {showExplain ? 'Hide' : 'Show'} Explanation
            </Button>
          </div>
        </CardHeader>
        {showExplain && (
          <CardContent className="space-y-4">
            {/* ── Dynamic explanation (100% runtime-generated) ── */}
            <div className={`p-3 rounded-lg text-sm border ${
              result.predictedRole === selectedRole
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{dynamicExplanation}</span>
              </div>
            </div>

            {/* ── Role match status ── */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border bg-muted/30">
                <p className="text-muted-foreground mb-0.5">Selected Role</p>
                <p className="font-semibold capitalize">{roleLabel}</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${
                result.predictedRole === selectedRole
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <p className="text-muted-foreground mb-0.5">ML Predicted Role</p>
                <p className="font-semibold capitalize">{predictedLabel}</p>
                {result.predictedRole !== selectedRole && (
                  <p className="text-amber-600 text-xs mt-0.5">↑ Closest match to your resume</p>
                )}
              </div>
            </div>

            {explain && (
              <>
                {/* Role signals — dynamic per resume */}
                {explain.roleSignals.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Why {predictedLabel} Was Predicted
                    </p>
                    <div className="space-y-1">
                      {explain.roleSignals.map((signal, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-indigo-500 font-bold shrink-0">→</span>
                          <span>{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top contributing keywords — dynamic TF-IDF weights */}
                {explain.topKeywords.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Top Contributing Keywords (TF-IDF Weights)
                    </p>
                    <div className="space-y-1.5">
                      {explain.topKeywords.slice(0, 6).map(kw => (
                        <div key={kw.keyword} className="flex items-center gap-2">
                          <span className="text-xs font-medium capitalize w-28 shrink-0">{kw.keyword}</span>
                          <div className="flex-1 progress-enterprise">
                            <div className="progress-enterprise-fill" style={{ width: `${kw.contribution}%`, background: '#6366F1' }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{kw.contribution}%</span>
                          <Badge className="text-xs bg-indigo-100 text-indigo-700 shrink-0">{kw.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill confidence — dynamic per extracted skills */}
                {explain.skillConfidences.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Skill Confidence Scores (from your resume)
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {explain.skillConfidences.slice(0, 8).map(sc => (
                        <div key={sc.skill} className="flex items-center justify-between p-1.5 rounded text-xs"
                          style={{
                            background: sc.context === 'high' ? '#F0FDF4' : sc.context === 'medium' ? '#FFFBEB' : '#FEF2F2',
                            border: `1px solid ${sc.context === 'high' ? '#BBF7D0' : sc.context === 'medium' ? '#FDE68A' : '#FECACA'}`,
                          }}>
                          <span className="font-medium capitalize truncate">{sc.skill}</span>
                          <span className="font-bold ml-1 shrink-0"
                            style={{ color: sc.context === 'high' ? '#059669' : sc.context === 'medium' ? '#B45309' : '#DC2626' }}>
                            {sc.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision path — dynamic step count */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    ML Decision Path
                  </p>
                  <div className="space-y-1">
                    {explain.decisionPath.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        {step.replace(/^Step \d+: /, '')}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alternative roles — dynamic probabilities */}
                {explain.alternativeRoles.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Other Possible Roles (by probability)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {explain.alternativeRoles.map(r => (
                        <Badge key={r.role} className="text-xs bg-gray-100 text-gray-700">
                          {r.display} ({r.probability}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* ── FIX 3: Resume Strength Analysis Chart (replaces ML vs Fuzzy) ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Resume Strength Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Bar chart: component scores */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Component Breakdown (out of max)</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[
                    { name: 'Skills',     score: result.mlScore,    max: 40, fill: '#2563EB' },
                    { name: 'Projects',   score: sectionScores?.projectsScore   ?? 0, max: 25, fill: '#10B981' },
                    { name: 'Experience', score: sectionScores?.experienceScore ?? 0, max: 20, fill: '#F59E0B' },
                    { name: 'Education',  score: sectionScores?.educationScore  ?? 0, max: 15, fill: '#8B5CF6' },
                  ]}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 40]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v, n, p) => [`${v} / ${p.payload.max}`, n]} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {[
                      { fill: '#2563EB' }, { fill: '#10B981' },
                      { fill: '#F59E0B' }, { fill: '#8B5CF6' },
                    ].map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Skill distribution donut-style */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Skill Distribution</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[
                    { name: 'Matched',    count: result.matchedSkills.length,  fill: '#10B981' },
                    { name: 'Partial',    count: result.partialSkills?.length ?? 0, fill: '#F59E0B' },
                    { name: 'Missing',    count: result.missingSkills.length,  fill: '#EF4444' },
                  ]}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {[{ fill: '#10B981' }, { fill: '#F59E0B' }, { fill: '#EF4444' }].map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── FIX 2: Section Detection Results ── */}
      {parsedSections && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Section Detection — Parsed from Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Section scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Skills',     score: sectionScores?.skillsScore ?? 0,     max: 40, color: '#2563EB', count: parsedSections.skills.length },
                { label: 'Projects',   score: sectionScores?.projectsScore ?? 0,   max: 25, color: '#10B981', count: parsedSections.projects.length },
                { label: 'Experience', score: sectionScores?.experienceScore ?? 0, max: 20, color: '#F59E0B', count: parsedSections.experience.length },
                { label: 'Education',  score: sectionScores?.educationScore ?? 0,  max: 15, color: '#8B5CF6', count: parsedSections.education.length },
              ].map(({ label, score, max, color, count }) => (
                <div key={label} className="text-center p-3 rounded-lg border"
                  style={{ background: `${color}08`, borderColor: `${color}30` }}>
                  <p className="font-display text-xl font-bold" style={{ color }}>{score}/{max}</p>
                  <p className="text-xs font-semibold mt-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground">{count} detected</p>
                </div>
              ))}
            </div>

            {/* Projects detected */}
            {parsedSections.projects.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Projects Detected ({parsedSections.projects.length})
                </p>
                <div className="space-y-1.5">
                  {parsedSections.projects.slice(0, 4).map((p, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-100 text-xs">
                      <span className="font-semibold text-green-700 shrink-0">{i + 1}.</span>
                      <div>
                        <span className="font-medium">{p.name}</span>
                        {p.techStack.length > 0 && (
                          <span className="text-muted-foreground ml-1">— {p.techStack.slice(0, 4).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience detected */}
            {parsedSections.experience.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Experience Detected ({parsedSections.experience.length})
                </p>
                <div className="space-y-1.5">
                  {parsedSections.experience.slice(0, 3).map((e, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-100 text-xs">
                      <span className="font-semibold text-amber-700 shrink-0">{i + 1}.</span>
                      <div>
                        <span className="font-medium">{e.role}</span>
                        {e.company && <span className="text-muted-foreground"> @ {e.company}</span>}
                        {e.duration && <span className="text-muted-foreground ml-1">({e.duration})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education detected */}
            {parsedSections.education.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Education Detected ({parsedSections.education.length})
                </p>
                <div className="space-y-1.5">
                  {parsedSections.education.slice(0, 3).map((e, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-purple-50 border border-purple-100 text-xs">
                      <span className="font-semibold text-purple-700 shrink-0">{i + 1}.</span>
                      <div>
                        <span className="font-medium">{e.degree}</span>
                        {e.institution && <span className="text-muted-foreground"> — {e.institution}</span>}
                        {e.year && <span className="text-muted-foreground ml-1">({e.year})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No sections detected */}
            {parsedSections.projects.length === 0 && parsedSections.experience.length === 0 && parsedSections.education.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p>No structured sections detected. Ensure your resume has clear section headings like "Experience", "Projects", "Education".</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 text-center">
            <div className="text-3xl font-bold text-green-700">{result.finalScore}%</div>
            <p className="text-xs text-green-600 mt-1">Final Score</p>
            <Progress value={result.finalScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5 text-center">
            <div className="text-3xl font-bold text-blue-700">{result.matchedSkills.length}</div>
            <p className="text-xs text-blue-600 mt-1">Exact Match</p>
            {result.partialSkills?.length > 0 && (
              <p className="text-xs text-amber-600">+{result.partialSkills.length} partial</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-5 text-center">
            <div className="text-3xl font-bold text-orange-700">{result.missingSkills.length}</div>
            <p className="text-xs text-orange-600 mt-1">Missing</p>
          </CardContent>
        </Card>
      </div>

      {/* Matched skills */}
      {result.matchedSkills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <span>Matched Skills <span className="text-muted-foreground font-normal">({result.matchedSkills.length})</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="grid gap-2.5 sm:grid-cols-2"
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {result.matchedSkills.map(skill => (
                <SkillCard key={skill} skill={skill} variant="matched" />
              ))}
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* Partial skills (fuzzy matches) */}
      {result.partialSkills && result.partialSkills.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="h-4 w-4 text-amber-500">≈</span>
              Partial Matches — Fuzzy Logic ({result.partialSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Skills detected via fuzzy matching (Levenshtein similarity ≥ 50%).
            </p>
            <motion.div
              className="grid gap-2 sm:grid-cols-2"
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {result.partialSkills.map(ps => (
                <motion.div
                  key={ps.skill}
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-amber-50 border-amber-200 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-amber-500 font-bold shrink-0">≈</span>
                    <span className="font-medium truncate capitalize">{ps.skill}</span>
                    <span className="text-xs text-muted-foreground">via "{ps.matchedTo}"</span>
                  </div>
                  <Badge className="text-xs bg-amber-100 text-amber-700 shrink-0 ml-1">
                    {ps.similarity}%
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      )}

      {/* Missing skills with learning resources */}
      {result.missingSkills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
              <span>Skills to Learn <span className="text-muted-foreground font-normal">({result.missingSkills.length})</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Click Free or Course for learning resources.
            </p>
            <motion.div
              className="grid gap-2.5 sm:grid-cols-2"
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {result.missingSkills.map(skill => (
                <SkillCard
                  key={skill}
                  skill={skill}
                  variant="missing"
                  resources={recMap.get(skill.toLowerCase())}
                />
              ))}
            </motion.div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Upload widget ─────────────────────────────────────────────────────────────
type StageKey = 'uploading' | 'parsing' | 'extracting' | 'predicting' | 'complete';
const STEPS: Array<{ key: StageKey; label: string; Icon: React.ElementType }> = [
  { key: 'uploading',  label: 'Uploading',   Icon: UploadCloud },
  { key: 'parsing',   label: 'Parsing',      Icon: ScanText    },
  { key: 'extracting',label: 'Extracting',   Icon: Search      },
  { key: 'predicting',label: 'ML Predict',   Icon: Cpu         },
];

function UploadWidget({ targetRole, onComplete }: {
  targetRole: string;
  onComplete: (r: MLAnalysisResult) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [stage, setStage]           = useState<StageKey | null>(null);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState<string | null>(null);
  const [drag, setDrag]             = useState(false);
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    const valid = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'text/plain'];
    if (!valid.includes(file.type)) { setError('Upload a PDF, DOC, DOCX, or TXT file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return; }

    setProcessing(true); setError(null);
    setStage('uploading'); setProgress(10);

    try {
      // Extract text via existing FileProcessingService
      setStage('parsing'); setProgress(30);
      const fileResult = await FileProcessingService.processResumeFile(file, targetRole, true,
        (_step, _msg, pct) => {
          setProgress(Math.min(60, 10 + pct * 0.5));
          if (pct < 30) setStage('uploading');
          else if (pct < 55) setStage('parsing');
          else setStage('extracting');
        }
      );

      if (!fileResult.success) throw new Error(fileResult.error ?? 'Parsing failed');

      const ca = fileResult.comprehensiveAnalysis;
      setStage('complete'); setProgress(100);

      // Persist for other pages
      try {
        if (ca) {
          setStoredAnalysis(ca as any);
          setDetectedRole(ca.parsedResume.targetRole);
          const history = getAnalysisHistory();
          history.push({ score: ca.skillMatch.matchScore, date: new Date().toISOString() });
          setAnalysisHistory(history.slice(-10));
        }
      } catch (error) {
        console.error('[ResumeAnalyzer] Error saving to localStorage:', error);
      }

      toast({ title: 'Analysis complete!', description: `${ca?.skillMatch.matchScore ?? 0}% match for ${targetRole.replace(/_/g, ' ')}` });
      setTimeout(() => onComplete({
        success: true,
        predictedRole: ca?.parsedResume.targetRole ?? targetRole,
        predictedDisplay: ca?.parsedResume.targetRole?.replace(/_/g, ' ') ?? targetRole,
        mlConfidence: ca?.parsedResume.roleConfidence ?? 0,
        probabilities: {},
        extractedSkills: ca?.parsedResume.skills ?? [],
        matchedSkills: ca?.skillMatch.matchedSkills.map(s => s.skill) ?? [],
        missingSkills: ca?.skillMatch.missingSkills.map(s => s.skill) ?? [],
        partialSkills: [],
        matchPercentage: ca?.skillMatch.matchScore ?? 0,
        mlScore: ca?.skillMatch.matchScore ?? 0,
        fuzzyScore: 0,
        weightedScore: ca?.skillMatch.matchScore ?? 0,
        finalScore: ca?.skillMatch.matchScore ?? 0,
        confidence: ca?.parsedResume.roleConfidence ?? 0,
        recommendations: [],
        jobCompatibility: [],
      }), 600);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
      setStage(null);
      toast({ title: 'Failed', description: msg, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  }, [targetRole, onComplete, toast]);

  const stageOrder: StageKey[] = ['uploading', 'parsing', 'extracting', 'predicting', 'complete'];
  const currentIdx = stage ? stageOrder.indexOf(stage) : -1;

  return (
    <Card className={`border-dashed border-2 transition-colors ${drag ? 'border-primary bg-primary/5' : 'border-primary/20'}`}>
      <CardHeader><CardTitle className="text-center text-base">Upload Your Resume</CardTitle></CardHeader>
      <CardContent>
        <div
          className="text-center p-6"
          onDragEnter={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={e => { e.preventDefault(); setDrag(false); }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        >
          <input type="file" accept=".pdf,.doc,.docx,.txt" id="ml-upload" className="hidden"
            disabled={processing} onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          <label htmlFor="ml-upload" className="cursor-pointer block">
            <div className="flex flex-col items-center gap-3">
              {processing
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Upload className="h-10 w-10 text-primary" />
                  </motion.div>
                : <Upload className="h-10 w-10 text-primary" />
              }
              <p className="font-medium">{processing ? 'Processing…' : 'Drop resume here or click to browse'}</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT — max 10 MB</p>
              {!processing && <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> Choose File</Button>}
            </div>
          </label>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {stage && stage !== 'complete' && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  {STEPS.map((step, i) => {
                    const stepIdx = stageOrder.indexOf(step.key);
                    const isDone  = currentIdx >= stageOrder.length - 1 || stepIdx < currentIdx;
                    const isActive = stepIdx === currentIdx;
                    return (
                      <div key={step.key} className="flex items-center">
                        <div className="flex flex-col items-center gap-1">
                          <motion.div
                            animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                              isDone ? 'bg-green-500 border-green-500 text-white' :
                              isActive ? 'bg-primary border-primary text-white' :
                              'bg-white border-gray-200 text-gray-400'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="h-4 w-4" /> : <step.Icon className="h-3.5 w-3.5" />}
                          </motion.div>
                          <span className={`text-xs font-medium ${isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className="w-8 h-0.5 mx-1 mb-4 bg-gray-200 rounded overflow-hidden">
                            <motion.div className="h-full bg-primary" initial={{ width: '0%' }}
                              animate={{ width: isDone ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ResumeAnalyzer() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [result, setResult]             = useState<MLAnalysisResult | null>(null);

  const handleReset = () => { setResult(null); setSelectedRole(null); };

  if (result && selectedRole) {
    return (
      <div className="page-content max-w-3xl">
        <MLResultsView result={result} selectedRole={selectedRole} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="page-content max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}>
            <Brain className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">ML Resume Analyzer</h1>
            <p className="text-sm text-muted-foreground">
              Powered by TF-IDF vectorization + Naive Bayes classification.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3 p-3 rounded-lg border bg-muted/30">
          Select your target role, upload your resume — the ML model extracts skills, predicts your role, and calculates match %.
        </p>
      </div>

      {/* Role selection */}
      <div className="mb-6">
        <p className="section-label mb-3">Select Target Role</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROLES.map((role, i) => (
            <motion.button
              key={role.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedRole(role.key)}
              className={`role-card text-left ${selectedRole === role.key ? 'selected' : ''}`}
              aria-pressed={selectedRole === role.key}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: selectedRole === role.key ? 'var(--gradient-primary)' : 'hsl(var(--muted))',
                }}>
                <Briefcase className="h-4 w-4"
                  style={{ color: selectedRole === role.key ? 'white' : 'hsl(var(--muted-foreground))' }}
                  aria-hidden="true"
                />
              </div>
              <span className="font-medium text-sm flex-1">{role.label}</span>
              {selectedRole === role.key && (
                <ChevronRight className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">
                Analyzing for: <span className="text-primary font-semibold">{ROLES.find(r => r.key === selectedRole)?.label}</span>
              </span>
            </div>
            <UploadWidget targetRole={selectedRole} onComplete={setResult} />
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedRole && (
        <p className="text-center text-sm text-muted-foreground">↑ Select a role above to unlock the upload</p>
      )}
    </div>
  );
}
