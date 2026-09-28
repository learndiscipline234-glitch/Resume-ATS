/**
 * ATS (Applicant Tracking System) Compatibility Checker
 * Analyzes resume for ATS-friendliness: keywords, sections, formatting
 */

export interface ATSIssue {
  type: 'error' | 'warning' | 'info';
  category: 'keywords' | 'sections' | 'formatting' | 'length';
  message: string;
  suggestion: string;
}

export interface ATSSectionCheck {
  name: string;
  present: boolean;
  score: number;
}

export interface ATSResult {
  score: number;           // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: ATSIssue[];
  suggestions: string[];
  sectionChecks: ATSSectionCheck[];
  keywordDensity: number;  // %
  readabilityScore: number;
  passLikelihood: 'High' | 'Medium' | 'Low';
  breakdown: {
    keywords: number;
    sections: number;
    formatting: number;
    length: number;
  };
}

// ── ATS keyword patterns ──────────────────────────────────────────────────────

const ATS_REQUIRED_SECTIONS = [
  { name: 'Contact Info',   patterns: ['email', '@', 'phone', 'linkedin', 'github'],       weight: 15 },
  { name: 'Summary',        patterns: ['summary', 'objective', 'profile', 'about'],         weight: 10 },
  { name: 'Experience',     patterns: ['experience', 'employment', 'work history', 'career'], weight: 25 },
  { name: 'Education',      patterns: ['education', 'degree', 'university', 'college', 'bachelor', 'master'], weight: 20 },
  { name: 'Skills',         patterns: ['skills', 'technical skills', 'competencies', 'technologies'], weight: 20 },
  { name: 'Projects',       patterns: ['projects', 'portfolio', 'work samples'],             weight: 10 },
];

const ATS_FORMATTING_ISSUES = [
  { pattern: /[^\x00-\x7F]/g,          message: 'Special/unicode characters detected',    suggestion: 'Replace special characters with ASCII equivalents' },
  { pattern: /\t/g,                     message: 'Tab characters found',                   suggestion: 'Use spaces instead of tabs for alignment' },
  { pattern: /_{3,}/g,                  message: 'Underline formatting detected',           suggestion: 'Avoid underlines — use bold for emphasis instead' },
  { pattern: /\|/g,                     message: 'Pipe characters used for layout',         suggestion: 'Use plain text layout without pipe separators' },
];

const ATS_POWER_VERBS = [
  'achieved', 'built', 'created', 'delivered', 'designed', 'developed',
  'engineered', 'implemented', 'improved', 'increased', 'launched', 'led',
  'managed', 'optimized', 'reduced', 'scaled', 'shipped', 'solved',
];

const ATS_QUANTIFIER_PATTERNS = [
  /\d+%/,           // percentages
  /\$[\d,]+/,       // dollar amounts
  /\d+[kKmM]/,      // thousands/millions
  /\d+\s*(users|customers|clients|employees|team members)/i,
  /\d+\s*(projects|features|services|applications)/i,
];

// ── Main checker ──────────────────────────────────────────────────────────────

export function checkATS(resumeText: string, targetRole?: string): ATSResult {
  const text = resumeText.toLowerCase();
  const issues: ATSIssue[] = [];
  const suggestions: string[] = [];

  // ── 1. Section checks ──────────────────────────────────────────────────────
  const sectionChecks: ATSSectionCheck[] = ATS_REQUIRED_SECTIONS.map(section => {
    const present = section.patterns.some(p => text.includes(p));
    return {
      name: section.name,
      present,
      score: present ? section.weight : 0,
    };
  });

  const sectionScore = sectionChecks.reduce((sum, s) => sum + s.score, 0);
  const missingSections = sectionChecks.filter(s => !s.present);

  missingSections.forEach(s => {
    issues.push({
      type: s.name === 'Experience' || s.name === 'Skills' ? 'error' : 'warning',
      category: 'sections',
      message: `Missing "${s.name}" section`,
      suggestion: `Add a clearly labeled "${s.name}" section — ATS systems scan for these headers`,
    });
  });

  // ── 2. Keyword density ─────────────────────────────────────────────────────
  const words = resumeText.split(/\s+/).filter(w => w.length > 2);
  const wordCount = words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const keywordDensity = wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) : 0;

  let keywordsScore = 0;
  if (wordCount < 200) {
    issues.push({ type: 'error', category: 'length', message: 'Resume is too short', suggestion: 'Aim for 400–700 words for optimal ATS parsing' });
    keywordsScore = 20;
  } else if (wordCount > 1000) {
    issues.push({ type: 'warning', category: 'length', message: 'Resume may be too long', suggestion: 'Keep to 1–2 pages (400–700 words) for best ATS results' });
    keywordsScore = 60;
  } else {
    keywordsScore = 80;
  }

  // Power verbs check
  const verbsFound = ATS_POWER_VERBS.filter(v => text.includes(v));
  if (verbsFound.length < 3) {
    issues.push({
      type: 'warning',
      category: 'keywords',
      message: `Only ${verbsFound.length} action verbs found`,
      suggestion: 'Use strong action verbs: achieved, built, delivered, engineered, optimized, scaled',
    });
    keywordsScore = Math.max(0, keywordsScore - 15);
  } else {
    keywordsScore = Math.min(100, keywordsScore + 10);
  }

  // Quantifiers check
  const quantifiersFound = ATS_QUANTIFIER_PATTERNS.filter(p => p.test(resumeText));
  if (quantifiersFound.length === 0) {
    issues.push({
      type: 'warning',
      category: 'keywords',
      message: 'No quantified achievements found',
      suggestion: 'Add metrics: "Improved performance by 40%", "Managed team of 8 engineers"',
    });
    keywordsScore = Math.max(0, keywordsScore - 10);
  }

  // ── 3. Formatting checks ───────────────────────────────────────────────────
  let formattingScore = 100;
  ATS_FORMATTING_ISSUES.forEach(({ pattern, message, suggestion }) => {
    if (pattern.test(resumeText)) {
      issues.push({ type: 'warning', category: 'formatting', message, suggestion });
      formattingScore -= 15;
    }
  });

  // Check for tables (pipe characters)
  if ((resumeText.match(/\|/g) || []).length > 3) {
    issues.push({
      type: 'error',
      category: 'formatting',
      message: 'Table formatting detected',
      suggestion: 'ATS systems cannot parse tables — use plain text lists instead',
    });
    formattingScore -= 20;
  }

  // Check for email
  if (!/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText)) {
    issues.push({
      type: 'error',
      category: 'formatting',
      message: 'No email address found',
      suggestion: 'Include your email address in the contact section',
    });
    formattingScore -= 20;
  }

  formattingScore = Math.max(0, formattingScore);

  // ── 4. Length score ────────────────────────────────────────────────────────
  const lengthScore = wordCount >= 200 && wordCount <= 800 ? 100
    : wordCount < 100 ? 20
    : wordCount < 200 ? 50
    : wordCount > 1200 ? 60
    : 80;

  // ── 5. Readability ─────────────────────────────────────────────────────────
  const avgWordsPerSentence = wordCount / Math.max(1, (resumeText.match(/[.!?]/g) || []).length);
  const readabilityScore = avgWordsPerSentence < 20 ? 90 : avgWordsPerSentence < 30 ? 70 : 50;

  // ── 6. Final score ─────────────────────────────────────────────────────────
  const breakdown = {
    keywords:   Math.round(keywordsScore),
    sections:   Math.round(sectionScore),
    formatting: Math.round(formattingScore),
    length:     Math.round(lengthScore),
  };

  const score = Math.round(
    breakdown.keywords   * 0.30 +
    breakdown.sections   * 0.35 +
    breakdown.formatting * 0.25 +
    breakdown.length     * 0.10
  );

  const grade: ATSResult['grade'] =
    score >= 85 ? 'A' :
    score >= 70 ? 'B' :
    score >= 55 ? 'C' :
    score >= 40 ? 'D' : 'F';

  const passLikelihood: ATSResult['passLikelihood'] =
    score >= 70 ? 'High' :
    score >= 50 ? 'Medium' : 'Low';

  // ── 7. Suggestions ─────────────────────────────────────────────────────────
  if (score < 70) suggestions.push('Use a simple, single-column layout for best ATS compatibility');
  if (verbsFound.length < 5) suggestions.push('Start each bullet point with a strong action verb');
  if (quantifiersFound.length < 2) suggestions.push('Quantify your achievements with numbers and percentages');
  if (missingSections.length > 0) suggestions.push(`Add missing sections: ${missingSections.map(s => s.name).join(', ')}`);
  suggestions.push('Save your resume as a .docx or plain .pdf (not scanned image)');
  suggestions.push('Use standard fonts: Arial, Calibri, or Times New Roman');
  if (targetRole) suggestions.push(`Include keywords from the ${targetRole} job description`);

  return {
    score,
    grade,
    issues,
    suggestions,
    sectionChecks,
    keywordDensity,
    readabilityScore,
    passLikelihood,
    breakdown,
  };
}
