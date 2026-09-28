/**
 * Fuzzy Skill Matcher — Soft Computing Module
 * Uses Levenshtein distance + token overlap for fuzzy string similarity.
 * Replaces strict exact-match with graded membership values.
 *
 * Membership levels:
 *   Strong  (≥ 0.85) → exact or near-exact match
 *   Partial (≥ 0.50) → related / abbreviated / synonym
 *   Weak    (< 0.50) → no meaningful match
 */

// ── Levenshtein distance ──────────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ── Token overlap (Jaccard) ───────────────────────────────────────────────────
function tokenOverlap(a: string, b: string): number {
  const ta = new Set(a.split(/[\s.+#/-]+/).filter(Boolean));
  const tb = new Set(b.split(/[\s.+#/-]+/).filter(Boolean));
  let inter = 0;
  ta.forEach(t => { if (tb.has(t)) inter++; });
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Compute fuzzy similarity between two skill strings.
 * Returns a value in [0, 1].
 */
export function skillSimilarity(a: string, b: string): number {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (na === nb) return 1.0;

  // Levenshtein-based similarity
  const maxLen = Math.max(na.length, nb.length);
  const levSim = maxLen === 0 ? 1 : 1 - levenshtein(na, nb) / maxLen;

  // Token overlap
  const tokSim = tokenOverlap(na, nb);

  // Weighted combination
  return Math.max(levSim * 0.6 + tokSim * 0.4, tokSim);
}

// ── Membership thresholds ─────────────────────────────────────────────────────
export const FUZZY_STRONG  = 0.85;
export const FUZZY_PARTIAL = 0.50;

export type FuzzyMatchLevel = 'strong' | 'partial' | 'none';

export function fuzzyLevel(sim: number): FuzzyMatchLevel {
  if (sim >= FUZZY_STRONG)  return 'strong';
  if (sim >= FUZZY_PARTIAL) return 'partial';
  return 'none';
}

// ── Weighted skill entry ──────────────────────────────────────────────────────
export interface WeightedSkill {
  name:   string;
  weight: number; // 0–1
}

export interface FuzzyMatchResult {
  matchedSkills:  Array<{ skill: string; weight: number; similarity: number }>;
  partialSkills:  Array<{ skill: string; weight: number; similarity: number; matchedTo: string }>;
  missingSkills:  Array<{ skill: string; weight: number }>;
  fuzzyScore:     number; // 0–100
  weightedScore:  number; // 0–100 (weighted by skill importance)
}

/**
 * Fuzzy skill match between user skills and weighted required skills.
 *
 * @param userSkills     - skills extracted from resume
 * @param requiredSkills - weighted skills for the target role
 */
export function fuzzySkillMatch(
  userSkills: string[],
  requiredSkills: WeightedSkill[]
): FuzzyMatchResult {
  const matched:  FuzzyMatchResult['matchedSkills']  = [];
  const partial:  FuzzyMatchResult['partialSkills']  = [];
  const missing:  FuzzyMatchResult['missingSkills']  = [];

  let totalWeight   = 0;
  let weightedScore = 0;

  requiredSkills.forEach(req => {
    totalWeight += req.weight;

    // Find best fuzzy match among user skills
    let bestSim   = 0;
    let bestUser  = '';
    userSkills.forEach(us => {
      const sim = skillSimilarity(us, req.name);
      if (sim > bestSim) { bestSim = sim; bestUser = us; }
    });

    const level = fuzzyLevel(bestSim);

    if (level === 'strong') {
      matched.push({ skill: req.name, weight: req.weight, similarity: bestSim });
      weightedScore += req.weight * 1.0;
    } else if (level === 'partial') {
      partial.push({ skill: req.name, weight: req.weight, similarity: bestSim, matchedTo: bestUser });
      weightedScore += req.weight * bestSim; // partial credit
    } else {
      missing.push({ skill: req.name, weight: req.weight });
    }
  });

  const totalRequired = requiredSkills.length;
  const fuzzyScore = totalRequired === 0 ? 0
    : Math.round(((matched.length + partial.length * 0.5) / totalRequired) * 100);

  const weightedScorePct = totalWeight === 0 ? 0
    : Math.round((weightedScore / totalWeight) * 100);

  return {
    matchedSkills:  matched,
    partialSkills:  partial,
    missingSkills:  missing,
    fuzzyScore,
    weightedScore:  weightedScorePct,
  };
}
