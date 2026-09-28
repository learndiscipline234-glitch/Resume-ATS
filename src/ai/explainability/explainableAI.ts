/**
 * Explainable AI Module
 * Explains WHY a role was predicted and WHICH keywords contributed most
 */

import { getDataset, JobRoleEntry } from '../ml/rolePredictor';

export interface KeywordContribution {
  keyword: string;
  tfidfWeight: number;   // 0–1
  frequency: number;
  contribution: number;  // 0–100 (normalized)
  category: string;
}

export interface SkillConfidence {
  skill: string;
  confidence: number;    // 0–100
  frequency: number;
  tfidfWeight: number;
  context: 'high' | 'medium' | 'low';
  foundIn: string[];     // sections where found
}

export interface ExplainabilityResult {
  predictedRole: string;
  predictedDisplay: string;
  confidence: number;
  explanation: string;                    // Human-readable explanation
  topKeywords: KeywordContribution[];     // Top 10 contributing keywords
  skillConfidences: SkillConfidence[];    // Per-skill confidence
  roleSignals: string[];                  // Why this role was chosen
  alternativeRoles: Array<{ role: string; display: string; probability: number }>;
  decisionPath: string[];                 // Step-by-step reasoning
}

// ── Keyword frequency counter ─────────────────────────────────────────────────

function countKeywordFrequency(text: string, keyword: string): number {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'gi');
  return (text.match(pattern) || []).length;
}

// ── TF-IDF weight estimator (simplified) ─────────────────────────────────────

function estimateTFIDF(text: string, keyword: string, totalWords: number): number {
  const freq = countKeywordFrequency(text, keyword);
  if (freq === 0) return 0;
  const tf = freq / totalWords;
  // IDF approximation: rarer terms get higher weight
  const idf = Math.log(1 + 1 / (freq + 1)) + 1;
  return Math.min(1, tf * idf * 10);
}

// ── Section detector ──────────────────────────────────────────────────────────

function detectSections(text: string, skill: string): string[] {
  const sections: string[] = [];
  const lower = text.toLowerCase();
  const skillLower = skill.toLowerCase();

  const sectionPatterns = [
    { name: 'Skills',     pattern: /skills[\s\S]{0,500}/i },
    { name: 'Experience', pattern: /experience[\s\S]{0,1000}/i },
    { name: 'Projects',   pattern: /projects[\s\S]{0,800}/i },
    { name: 'Education',  pattern: /education[\s\S]{0,500}/i },
    { name: 'Summary',    pattern: /summary[\s\S]{0,300}/i },
  ];

  sectionPatterns.forEach(({ name, pattern }) => {
    const match = text.match(pattern);
    if (match && match[0].toLowerCase().includes(skillLower)) {
      sections.push(name);
    }
  });

  return sections.length > 0 ? sections : ['General'];
}

// ── Main explainability function ──────────────────────────────────────────────

export function explainPrediction(
  resumeText: string,
  predictedRole: string,
  probabilities: Record<string, number>,
  extractedSkills: string[],
  selectedRole?: string,   // the role the user selected (may differ from predicted)
  matchedSkills?: string[], // skills matched to selected role
  missingSkills?: string[]  // skills missing for selected role
): ExplainabilityResult {
  const dataset = getDataset();
  const entry = dataset.find((e: JobRoleEntry) => e.role === predictedRole);
  const selectedEntry = selectedRole ? dataset.find((e: JobRoleEntry) => e.role === selectedRole) : null;
  const words = resumeText.split(/\s+/).filter(w => w.length > 1);
  const totalWords = Math.max(1, words.length);

  // ── Top keywords contributing to prediction ────────────────────────────────
  const roleSkills = entry
    ? (entry.skills as unknown as Array<{ name: string; weight: number } | string>).map(s =>
        typeof s === 'string' ? { name: s, weight: 0.7 } : s
      )
    : [];

  const topKeywords: KeywordContribution[] = roleSkills
    .map(skill => {
      const freq = countKeywordFrequency(resumeText, skill.name);
      const tfidf = estimateTFIDF(resumeText, skill.name, totalWords);
      return {
        keyword: skill.name,
        tfidfWeight: tfidf,
        frequency: freq,
        contribution: Math.round(tfidf * skill.weight * 100),
        category: categorizeSkill(skill.name),
      };
    })
    .filter(k => k.frequency > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 10);

  // ── Skill confidence scores ────────────────────────────────────────────────
  const skillConfidences: SkillConfidence[] = extractedSkills.map(skill => {
    const freq = countKeywordFrequency(resumeText, skill);
    const tfidf = estimateTFIDF(resumeText, skill, totalWords);
    const confidence = Math.round(Math.min(100, (freq * 15 + tfidf * 60 + 25)));
    const foundIn = detectSections(resumeText, skill);

    return {
      skill,
      confidence,
      frequency: freq,
      tfidfWeight: Math.round(tfidf * 100) / 100,
      context: confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low',
      foundIn,
    };
  }).sort((a, b) => b.confidence - a.confidence);

  // ── Role signals ───────────────────────────────────────────────────────────
  const roleSignals: string[] = [];
  const topContributors = topKeywords.slice(0, 3).map(k => k.keyword);

  if (topContributors.length > 0) {
    roleSignals.push(`Strong presence of ${topContributors.join(', ')} — core ${entry?.display ?? predictedRole} skills`);
  }

  const highConfidenceSkills = skillConfidences.filter(s => s.confidence >= 70);
  if (highConfidenceSkills.length > 0) {
    roleSignals.push(`${highConfidenceSkills.length} skills detected with high confidence (≥70%)`);
  }

  const multiSectionSkills = skillConfidences.filter(s => s.foundIn.length > 1);
  if (multiSectionSkills.length > 0) {
    roleSignals.push(`${multiSectionSkills.length} skills appear in multiple resume sections (stronger signal)`);
  }

  // ── Alternative roles ──────────────────────────────────────────────────────
  const alternativeRoles = Object.entries(probabilities)
    .filter(([role]) => role !== predictedRole)
    .map(([role, prob]) => ({
      role,
      display: dataset.find((e: JobRoleEntry) => e.role === role)?.display ?? role,
      probability: Math.round(prob * 100),
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  // ── Decision path ──────────────────────────────────────────────────────────
  const decisionPath = [
    `Step 1: Extracted ${extractedSkills.length} skills from resume text using alias mapping`,
    `Step 2: TF-IDF vectorized resume → ${totalWords} tokens, ${topKeywords.length} role-relevant terms`,
    `Step 3: Naive Bayes classifier scored ${Object.keys(probabilities).length} roles`,
    `Step 4: Highest probability → ${entry?.display ?? predictedRole} (${Math.round((probabilities[predictedRole] ?? 0) * 100)}%)`,
    `Step 5: Fuzzy matching refined skill scores using Levenshtein similarity`,
    `Step 6: Final score = 0.7 × ML + 0.3 × Fuzzy`,
  ];

  // ── Human-readable explanation — 100% dynamic ────────────────────────────
  const topKw = topKeywords.slice(0, 3).map(k => k.keyword).join(', ');
  const confidence = Math.round((probabilities[predictedRole] ?? 0) * 100);
  const topMatched = (matchedSkills ?? extractedSkills).slice(0, 4);
  const topMissing = (missingSkills ?? []).slice(0, 3);
  const selectedDisplay = selectedEntry?.display ?? selectedRole ?? entry?.display ?? predictedRole;

  let explanation: string;

  if (!selectedRole || selectedRole === predictedRole) {
    // Predicted role matches selected role
    explanation = `Your resume strongly matches ${entry?.display ?? predictedRole} ` +
      `because of high presence of: ${topMatched.length > 0 ? topMatched.join(', ') : topKw || 'relevant technical skills'}. ` +
      `Confidence: ${confidence}%. ` +
      `TF-IDF analysis identified ${topKeywords.length} matching role-specific terms. ` +
      (alternativeRoles[0]
        ? `Second closest match: ${alternativeRoles[0].display} (${alternativeRoles[0].probability}%).`
        : '');
  } else {
    // Predicted role differs from selected role
    explanation = `Your resume is closer to ${entry?.display ?? predictedRole} ` +
      `(${confidence}% confidence) due to skills like ${
        topMatched.length > 0 ? topMatched.join(', ') : topKw || 'detected skills'
      }, but is missing ${
        topMissing.length > 0 ? topMissing.join(', ') : 'key skills'
      } required for ${selectedDisplay}. ` +
      `To improve your match for ${selectedDisplay}, focus on acquiring the missing skills listed below.`;
  }

  return {
    predictedRole,
    predictedDisplay: entry?.display ?? predictedRole,
    confidence,
    explanation,
    topKeywords,
    skillConfidences,
    roleSignals,
    alternativeRoles,
    decisionPath,
  };
}

// ── Skill categorizer ─────────────────────────────────────────────────────────

function categorizeSkill(skill: string): string {
  const s = skill.toLowerCase();
  if (['python', 'javascript', 'typescript', 'java', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'r', 'scala'].some(l => s.includes(l))) return 'Language';
  if (['react', 'vue', 'angular', 'next.js', 'django', 'flask', 'fastapi', 'spring', 'express'].some(f => s.includes(f))) return 'Framework';
  if (['sql', 'postgresql', 'mongodb', 'redis', 'mysql', 'sqlite', 'bigquery', 'snowflake'].some(d => s.includes(d))) return 'Database';
  if (['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'ci/cd', 'jenkins'].some(d => s.includes(d))) return 'DevOps';
  if (['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit', 'nlp', 'computer vision'].some(m => s.includes(m))) return 'ML/AI';
  if (['git', 'jira', 'figma', 'testing', 'agile', 'scrum'].some(t => s.includes(t))) return 'Tools';
  return 'Other';
}
