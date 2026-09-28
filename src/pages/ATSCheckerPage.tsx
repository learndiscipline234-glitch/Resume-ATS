import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2, XCircle, AlertCircle, Upload, ShieldCheck,
  TrendingUp, FileText, Lightbulb, ChevronDown, ChevronUp,
  Info,
} from 'lucide-react';
import { checkATS, ATSResult, ATSIssue } from '@/ai/ats/atsChecker';
import { getDataset } from '@/ai/ml/rolePredictor';
import { extractResumeText, isSupportedResumeFile } from '@/lib/resumeTextExtractor';
import { getTextShadow } from '@/utils/colorUtils';

const ROLES = getDataset().map(e => ({ key: e.role, label: e.display }));

function gradeColor(grade: string) {
  if (grade === 'A') return '#10B981';
  if (grade === 'B') return '#2563EB';
  if (grade === 'C') return '#F59E0B';
  if (grade === 'D') return '#F97316';
  return '#EF4444';
}

function issueIcon(type: ATSIssue['type']) {
  if (type === 'error')   return <XCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />;
  if (type === 'warning') return <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />;
  return <Info className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />;
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const color = gradeColor(grade);
  const r = 60;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      <svg width="160" height="160" className="-rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
        <motion.circle
          cx="80" cy="80" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-4xl font-bold" style={{ color, textShadow: getTextShadow() }}>{score}</p>
        <p className="text-xs text-muted-foreground font-medium">/ 100</p>
        <p className="font-display text-xl font-bold mt-0.5" style={{ color, textShadow: getTextShadow() }}>Grade {grade}</p>
      </div>
    </div>
  );
}

export function ATSCheckerPage() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult]         = useState<ATSResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [drag, setDrag]             = useState(false);
  const [fileError, setFileError]   = useState('');

  // Load from localStorage if available
  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem('lastAnalysisResult');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const text = parsed?.parsedResume?.text ?? parsed?.mlResult?.resumeText ?? '';
      if (text) { setResumeText(text); setUploadedFile('Last Analysis'); }
    } catch { /* ignore */ }
  };

  // Handle file upload — PDF, DOCX, or TXT
  const handleFileUpload = useCallback(async (file: File) => {
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
  }, []);

  const handleCheck = () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const r = checkATS(resumeText, targetRole || undefined);
      setResult(r);
      setLoading(false);
    }, 400);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    handleFileUpload(file);
  }, [handleFileUpload]);

  const errorCount   = result?.issues.filter(i => i.type === 'error').length ?? 0;
  const warningCount = result?.issues.filter(i => i.type === 'warning').length ?? 0;

  return (
    <div className="page-content max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}>
          <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">ATS Compatibility Checker</h1>
          <p className="text-sm text-muted-foreground">
            Check if your resume will pass Applicant Tracking Systems used by top companies
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Left: Input */}
        <div className="space-y-4">
          {/* Role selector */}
          <div className="ent-card p-4">
            <p className="section-label mb-2">Target Role (optional)</p>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              aria-label="Select target role"
            >
              <option value="">Any role</option>
              {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>

          {/* Resume input — text paste + file upload */}
          <div
            className={`upload-zone p-4 ${drag ? 'drag-over' : ''}`}
            onDragEnter={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={e => { e.preventDefault(); setDrag(false); }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="section-label flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
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
              className="min-h-[240px] font-code text-xs resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
              value={resumeText}
              onChange={e => { setResumeText(e.target.value); setUploadedFile(''); }}
              aria-label="Resume text input"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={loadFromStorage}
              className="text-xs gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Load Last Analysis
            </Button>
            <Button
              className="flex-1 gradient-bg text-white font-semibold"
              onClick={handleCheck}
              disabled={loading || !resumeText.trim()}
            >
              {loading ? 'Checking...' : 'Check ATS Compatibility'}
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
              {/* Score gauge */}
              <div className="ent-card p-5 flex flex-col items-center gap-4">
                <ScoreGauge score={result.score} grade={result.grade} />
                <div className="grid grid-cols-3 gap-3 w-full text-center">
                  <div>
                    <p className="font-display text-xl font-bold text-red-500" style={{ textShadow: getTextShadow() }}>{errorCount}</p>
                    <p className="text-xs text-muted-foreground">Errors</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-amber-500" style={{ textShadow: getTextShadow() }}>{warningCount}</p>
                    <p className="text-xs text-muted-foreground">Warnings</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold"
                      style={{ color: result.passLikelihood === 'High' ? '#10B981' : result.passLikelihood === 'Medium' ? '#F59E0B' : '#EF4444', textShadow: getTextShadow() }}>
                      {result.passLikelihood}
                    </p>
                    <p className="text-xs text-muted-foreground">Pass Likelihood</p>
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="ent-card p-4">
                <p className="section-label mb-3">Score Breakdown</p>
                {[
                  { label: 'Sections',   score: result.breakdown.sections,   color: '#2563EB' },
                  { label: 'Keywords',   score: result.breakdown.keywords,   color: '#10B981' },
                  { label: 'Formatting', score: result.breakdown.formatting, color: '#8B5CF6' },
                  { label: 'Length',     score: result.breakdown.length,     color: '#F59E0B' },
                ].map(({ label, score, color }) => (
                  <div key={label} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{label}</span>
                      <span className="font-bold" style={{ color }}>{score}%</span>
                    </div>
                    <div className="progress-enterprise">
                      <motion.div
                        className="progress-enterprise-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Section checks */}
              <div className="ent-card p-4">
                <p className="section-label mb-3">Section Detection</p>
                <div className="space-y-1.5">
                  {result.sectionChecks.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {s.present
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                          : <XCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
                        }
                        <span className={s.present ? 'font-medium' : 'text-muted-foreground'}>{s.name}</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: s.present ? '#10B981' : '#EF4444' }}>
                        {s.present ? `+${s.score}pts` : '0pts'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] text-center">
              <div>
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'hsl(var(--muted))' }}>
                  <ShieldCheck className="h-8 w-8" style={{ color: 'hsl(var(--muted-foreground))' }} aria-hidden="true" />
                </div>
                <p className="text-sm font-medium">Paste your resume and click Check</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  We'll analyze ATS compatibility in seconds
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Issues list */}
      {result && result.issues.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-label mb-3 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> Issues Found ({result.issues.length})
          </p>
          <div className="space-y-2">
            {result.issues.map((issue, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="ent-card overflow-hidden"
              >
                <button
                  className="w-full flex items-start gap-3 p-3 text-left"
                  onClick={() => setExpandedIssue(expandedIssue === i ? null : i)}
                  aria-expanded={expandedIssue === i}
                >
                  {issueIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{issue.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{issue.category}</p>
                  </div>
                  {expandedIssue === i
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  }
                </button>
                <AnimatePresence>
                  {expandedIssue === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 pt-1 border-t text-sm"
                        style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--muted) / 0.3)' }}>
                        <p className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                          {issue.suggestion}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggestions */}
      {result && result.suggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="section-label mb-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Improvement Suggestions
          </p>
          <div className="ent-card p-4 space-y-2">
            {result.suggestions.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-start gap-2.5 text-sm"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                  style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                  {i + 1}
                </div>
                {s}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
