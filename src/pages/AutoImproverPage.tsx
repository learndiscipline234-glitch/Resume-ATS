import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Wand2, CheckCircle2, AlertCircle, ArrowRight, Copy,
  TrendingUp, FileText, Lightbulb, Zap, RefreshCw, Upload,
} from 'lucide-react';
import { getDataset } from '@/ai/ml/rolePredictor';
import { extractSkillsFromText } from '@/ai/ml/skillAnalyzer';
import { getResourcesForSkill } from '@/data/learningResources';
import { extractResumeText, isSupportedResumeFile } from '@/lib/resumeTextExtractor';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Improvement {
  type: 'keyword' | 'phrasing' | 'structure' | 'quantify' | 'ats';
  priority: 'high' | 'medium' | 'low';
  original?: string;
  suggestion: string;
  reason: string;
}

interface ImproverResult {
  improvements: Improvement[];
  missingKeywords: string[];
  improvedSummary: string;
  scoreEstimate: number;
  beforeScore: number;
  afterScore: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLES = getDataset().map(e => ({ key: e.role, label: e.display }));

const WEAK_PHRASES: Array<{ weak: string; strong: string }> = [
  { weak: 'responsible for',    strong: 'led / managed / owned' },
  { weak: 'helped with',        strong: 'contributed to / collaborated on' },
  { weak: 'worked on',          strong: 'developed / built / engineered' },
  { weak: 'was involved in',    strong: 'drove / spearheaded / delivered' },
  { weak: 'did',                strong: 'implemented / executed / achieved' },
  { weak: 'made',               strong: 'created / designed / built' },
  { weak: 'good at',            strong: 'proficient in / expert in' },
  { weak: 'familiar with',      strong: 'experienced with / skilled in' },
  { weak: 'knowledge of',       strong: 'expertise in / proficiency in' },
  { weak: 'assisted',           strong: 'supported / enabled / facilitated' },
  { weak: 'tried to',           strong: 'successfully / effectively' },
  { weak: 'various',            strong: 'specific technologies (list them)' },
];

const POWER_VERBS = [
  'Achieved', 'Built', 'Created', 'Delivered', 'Designed', 'Developed',
  'Engineered', 'Implemented', 'Improved', 'Increased', 'Launched', 'Led',
  'Managed', 'Optimized', 'Reduced', 'Scaled', 'Shipped', 'Solved',
  'Streamlined', 'Transformed',
];

const QUANTIFIER_PATTERNS = [
  /\d+%/,
  /\$[\d,]+/,
  /\d+[kKmM]/,
  /\d+\s*(users|customers|clients|employees|team members)/i,
  /\d+\s*(projects|features|services|applications)/i,
  /\d+x/,
];

function analyzeAndImprove(text: string, targetRole: string): ImproverResult {
  const improvements: Improvement[] = [];
  const lower = text.toLowerCase();
  const dataset = getDataset();
  const entry = dataset.find(e => e.role === targetRole);

  // ── 1. Missing keywords ────────────────────────────────────────────────────
  const roleSkills = entry
    ? (entry.skills as unknown as Array<{ name: string; weight: number } | string>)
        .map(s => typeof s === 'string' ? { name: s, weight: 0.7 } : s)
        .filter(s => s.weight >= 0.8)
        .map(s => s.name)
    : [];

  const extractedSkills = extractSkillsFromText(text);
  const extractedSet = new Set(extractedSkills.map(s => s.toLowerCase()));
  const missingKeywords = roleSkills.filter(s => !extractedSet.has(s.toLowerCase())).slice(0, 8);

  missingKeywords.forEach(kw => {
    improvements.push({
      type: 'keyword',
      priority: 'high',
      suggestion: `Add "${kw}" to your skills or experience section`,
      reason: `"${kw}" is a high-weight skill for ${entry?.display ?? targetRole} roles`,
    });
  });

  // ── 2. Weak phrasing ───────────────────────────────────────────────────────
  WEAK_PHRASES.forEach(({ weak, strong }) => {
    if (lower.includes(weak)) {
      improvements.push({
        type: 'phrasing',
        priority: 'medium',
        original: `"${weak}"`,
        suggestion: `Replace "${weak}" with ${strong}`,
        reason: 'Weak phrases reduce impact — use strong action verbs instead',
      });
    }
  });

  // ── 3. Missing quantifiers ─────────────────────────────────────────────────
  const hasQuantifiers = QUANTIFIER_PATTERNS.some(p => p.test(text));
  if (!hasQuantifiers) {
    improvements.push({
      type: 'quantify',
      priority: 'high',
      suggestion: 'Add measurable achievements: "Improved performance by 40%", "Managed team of 8 engineers", "Reduced load time by 2s"',
      reason: 'Quantified achievements are 3× more impactful to recruiters and ATS systems',
    });
  }

  // ── 4. Missing sections ────────────────────────────────────────────────────
  if (!lower.includes('summary') && !lower.includes('objective') && !lower.includes('profile')) {
    improvements.push({
      type: 'structure',
      priority: 'medium',
      suggestion: 'Add a 2–3 sentence Professional Summary at the top',
      reason: 'Recruiters spend 6 seconds on a resume — a strong summary captures attention immediately',
    });
  }

  if (!lower.includes('project') && !lower.includes('portfolio')) {
    improvements.push({
      type: 'structure',
      priority: 'medium',
      suggestion: 'Add a Projects section with 2–3 relevant projects',
      reason: 'Projects demonstrate practical skills and are critical for technical roles',
    });
  }

  // ── 5. Power verbs check ───────────────────────────────────────────────────
  const verbsFound = POWER_VERBS.filter(v => lower.includes(v.toLowerCase()));
  if (verbsFound.length < 3) {
    improvements.push({
      type: 'phrasing',
      priority: 'medium',
      suggestion: `Start bullet points with power verbs: ${POWER_VERBS.slice(0, 6).join(', ')}`,
      reason: `Only ${verbsFound.length} action verbs found — aim for 5+ to show impact`,
    });
  }

  // ── 6. ATS formatting ─────────────────────────────────────────────────────
  if ((text.match(/\|/g) || []).length > 3) {
    improvements.push({
      type: 'ats',
      priority: 'high',
      suggestion: 'Remove table/pipe formatting — use plain text lists',
      reason: 'ATS systems cannot parse tables and will reject your resume',
    });
  }

  if (!/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    improvements.push({
      type: 'ats',
      priority: 'high',
      suggestion: 'Add your email address to the contact section',
      reason: 'Missing contact information will cause ATS rejection',
    });
  }

  // ── 7. Generate improved summary ──────────────────────────────────────────
  const roleDisplay = entry?.display ?? targetRole.replace(/_/g, ' ');
  const topSkills = extractedSkills.slice(0, 4).join(', ');
  const improvedSummary = topSkills
    ? `Results-driven ${roleDisplay} with expertise in ${topSkills}. Proven track record of delivering high-quality solutions and driving measurable business impact. Passionate about ${roleDisplay.toLowerCase()} best practices and continuous improvement.`
    : `Motivated ${roleDisplay} with strong technical skills and a passion for building impactful solutions. Experienced in delivering projects on time and collaborating effectively with cross-functional teams.`;

  // ── 8. Score estimate ──────────────────────────────────────────────────────
  const wordCount = text.split(/\s+/).length;
  const beforeScore = Math.min(85, Math.max(20,
    (extractedSkills.length * 3) +
    (hasQuantifiers ? 15 : 0) +
    (verbsFound.length * 3) +
    (wordCount > 200 ? 10 : 0)
  ));
  const afterScore = Math.min(95, beforeScore + improvements.filter(i => i.priority === 'high').length * 5 + 10);

  return {
    improvements: improvements.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }),
    missingKeywords,
    improvedSummary,
    scoreEstimate: afterScore,
    beforeScore,
    afterScore,
  };
}

// ── Priority badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const styles = {
    high:   'badge-error',
    medium: 'badge-warning',
    low:    'badge-neutral',
  };
  return <span className={`${styles[priority]} text-xs px-2 py-0.5 rounded-full font-semibold capitalize`}>{priority}</span>;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AutoImproverPage() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('software_developer');
  const [result, setResult]         = useState<ImproverResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState('');
  const [fileError, setFileError]   = useState('');
  const [copied, setCopied]         = useState(false);

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem('lastAnalysisResult');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const text = parsed?.parsedResume?.text ?? '';
      const role = localStorage.getItem('lastDetectedRole') ?? 'software_developer';
      if (text) { setResumeText(text); setTargetRole(role); setUploadedFile('Last Analysis'); }
    } catch { /* ignore */ }
  };

  const handleFileUpload = async (file: File) => {
    setFileError('');
    if (!isSupportedResumeFile(file)) {
      setFileError('Unsupported file type. Please upload PDF, DOCX, or TXT.');
      return;
    }
    setExtracting(true);
    const result = await extractResumeText(file);
    setExtracting(false);
    if (result.error || !result.text) {
      setFileError(result.error ?? 'Could not extract text from file.');
      return;
    }
    setResumeText(result.text);
    setUploadedFile(file.name);
  };

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(analyzeAndImprove(resumeText, targetRole));
      setLoading(false);
    }, 600);
  };

  const handleCopySummary = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.improvedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highCount   = result?.improvements.filter(i => i.priority === 'high').length ?? 0;
  const mediumCount = result?.improvements.filter(i => i.priority === 'medium').length ?? 0;

  return (
    <div className="page-content max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
          <Wand2 className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Auto Resume Improver</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered suggestions: missing keywords, better phrasing, quantified achievements
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Left: Input */}
        <div className="space-y-4">
          <div className="ent-card p-4">
            <p className="section-label mb-2">Target Role</p>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              aria-label="Target role"
            >
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>

          <div className="ent-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                {uploadedFile ? `File: ${uploadedFile}` : 'Resume Text'}
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                  aria-label="Upload resume file"
                />
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors hover:bg-muted/50 flex items-center gap-1.5"
                  style={{ borderColor: 'hsl(var(--border))' }}>
                  <Upload className="h-3 w-3" aria-hidden="true" />
                  {extracting ? 'Extracting...' : 'Upload PDF/DOCX'}
                </span>
              </label>
            </div>
            {fileError && (
              <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {fileError}
              </p>
            )}
            <Textarea
              placeholder="Paste your resume text here, or upload a PDF/DOCX file above..."
              className="min-h-[260px] font-code text-xs resize-none"
              value={resumeText}
              onChange={e => { setResumeText(e.target.value); setUploadedFile(''); }}
              aria-label="Resume text"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadFromStorage} className="text-xs gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Load Last Analysis
            </Button>
            <Button
              className="flex-1 gradient-bg text-white font-semibold"
              onClick={handleAnalyze}
              disabled={loading || !resumeText.trim()}
            >
              {loading ? 'Analyzing...' : 'Analyze & Improve'}
            </Button>
          </div>
        </div>

        {/* Right: Results */}
        <AnimatePresence>
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Score improvement */}
              <div className="ent-card p-4">
                <p className="section-label mb-3">Score Improvement Estimate</p>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold text-red-500">{result.beforeScore}</p>
                    <p className="text-xs text-muted-foreground">Before</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold text-emerald-500">{result.afterScore}</p>
                    <p className="text-xs text-muted-foreground">After fixes</p>
                  </div>
                  <div className="flex-1">
                    <div className="progress-enterprise">
                      <motion.div
                        className="progress-enterprise-fill"
                        initial={{ width: `${result.beforeScore}%` }}
                        animate={{ width: `${result.afterScore}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">
                      +{result.afterScore - result.beforeScore} points potential gain
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="badge-error text-xs px-2 py-0.5 rounded-full font-semibold">{highCount} High Priority</span>
                  <span className="badge-warning text-xs px-2 py-0.5 rounded-full font-semibold">{mediumCount} Medium</span>
                </div>
              </div>

              {/* Missing keywords */}
              {result.missingKeywords.length > 0 && (
                <div className="ent-card p-4">
                  <p className="section-label mb-2 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-amber-500" /> Missing High-Priority Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map(kw => {
                      const res = getResourcesForSkill(kw);
                      return (
                        <div key={kw} className="flex items-center gap-1">
                          <span className="badge-error text-xs px-2 py-0.5 rounded-full font-medium capitalize">{kw}</span>
                          {res.free && (
                            <a href={res.free.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline">Learn</a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Improved summary */}
              <div className="ent-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="section-label flex items-center gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Suggested Professional Summary
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleCopySummary} className="text-xs gap-1">
                    <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm leading-relaxed p-3 rounded-lg"
                  style={{ background: 'hsl(var(--muted) / 0.4)', color: 'hsl(var(--foreground))' }}>
                  {result.improvedSummary}
                </p>
              </div>

              {/* All improvements */}
              <div className="ent-card p-4">
                <p className="section-label mb-3 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" /> All Improvements ({result.improvements.length})
                </p>
                <div className="space-y-2.5">
                  {result.improvements.map((imp, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-3 p-3 rounded-lg border text-sm"
                      style={{
                        background: imp.priority === 'high' ? '#FEF2F2' : imp.priority === 'medium' ? '#FFFBEB' : 'hsl(var(--muted) / 0.3)',
                        borderColor: imp.priority === 'high' ? '#FECACA' : imp.priority === 'medium' ? '#FDE68A' : 'hsl(var(--border))',
                      }}
                    >
                      {imp.priority === 'high'
                        ? <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                        : <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <PriorityBadge priority={imp.priority} />
                          <span className="text-xs text-muted-foreground capitalize">{imp.type}</span>
                        </div>
                        <p className="font-medium text-xs">{imp.suggestion}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{imp.reason}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] text-center">
              <div>
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'hsl(var(--muted))' }}>
                  <Wand2 className="h-8 w-8" style={{ color: 'hsl(var(--muted-foreground))' }} aria-hidden="true" />
                </div>
                <p className="text-sm font-medium">Paste your resume and click Analyze</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  We'll suggest missing keywords, better phrasing, and quantified achievements
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
