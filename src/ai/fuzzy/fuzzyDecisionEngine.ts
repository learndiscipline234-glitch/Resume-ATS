/**
 * Fuzzy Logic Decision Engine
 * 
 * Converts numeric scores into human-readable qualitative ratings and hiring recommendations
 * using fuzzy logic inference with trapezoidal and triangular membership functions.
 */

import type { 
  FuzzyInputs, 
  FuzzyDecisionResult, 
  FuzzyRating, 
  HiringRecommendation,
  MembershipFunction 
} from '../types';
import { getNeuroFuzzyConfig } from '../../config/neuroFuzzyConfig';

/**
 * Calculates membership degree for a value in a fuzzy set
 */
export function calculateMembership(
  value: number,
  membershipFn: MembershipFunction
): number {
  const { type, points } = membershipFn;
  
  if (type === 'triangular') {
    const [a, b, c] = points;
    if (value <= a || value >= c) return 0;
    if (value === b) return 1;
    if (value < b) return (value - a) / (b - a);
    return (c - value) / (c - b);
  }
  
  if (type === 'trapezoidal') {
    const [a, b, c, d] = points;
    if (value <= a || value >= d) return 0;
    if (value >= b && value <= c) return 1;
    if (value < b) return (value - a) / (b - a);
    return (d - value) / (d - c);
  }
  
  return 0;
}

/**
 * Sanitizes and validates fuzzy inputs, clamping to valid ranges
 */
function sanitizeInputs(inputs: Partial<FuzzyInputs>): FuzzyInputs {
  return {
    neuralScore: Math.max(0, Math.min(100, isFinite(inputs.neuralScore ?? 50) ? (inputs.neuralScore ?? 50) : 50)),
    skillMatchScore: Math.max(0, Math.min(100, isFinite(inputs.skillMatchScore ?? 50) ? (inputs.skillMatchScore ?? 50) : 50)),
    experienceYears: Math.max(0, Math.min(20, isFinite(inputs.experienceYears ?? 2) ? (inputs.experienceYears ?? 2) : 2)),
  };
}

// Membership functions for Skill Match (0-100)
const SKILL_MATCH_MF = {
  low:    { type: 'trapezoidal' as const, points: [0, 0, 30, 50] },
  medium: { type: 'triangular'  as const, points: [30, 50, 70] },
  high:   { type: 'trapezoidal' as const, points: [50, 70, 100, 100] },
};

// Membership functions for Experience (years)
const EXPERIENCE_MF = {
  junior: { type: 'trapezoidal' as const, points: [0, 0, 1, 3] },
  mid:    { type: 'triangular'  as const, points: [2, 4, 6] },
  senior: { type: 'trapezoidal' as const, points: [5, 7, 20, 20] },
};

// Membership functions for Neural Score (0-100)
const NEURAL_SCORE_MF = {
  poor:      { type: 'trapezoidal' as const, points: [0, 0, 30, 50] },
  average:   { type: 'triangular'  as const, points: [30, 50, 70] },
  good:      { type: 'triangular'  as const, points: [55, 70, 85] },
  excellent: { type: 'trapezoidal' as const, points: [70, 85, 100, 100] },
};

// Output rating numeric values for defuzzification
const RATING_VALUES: Record<FuzzyRating, number> = {
  Poor: 10,
  Average: 35,
  Good: 65,
  Excellent: 90,
};

/**
 * Applies fuzzy rules and returns weighted output scores
 * Rules encode domain knowledge about hiring decisions
 */
function applyFuzzyRules(
  skillLow: number, skillMedium: number, skillHigh: number,
  expJunior: number, expMid: number, expSenior: number,
  neuralPoor: number, neuralAverage: number, neuralGood: number, neuralExcellent: number
): Record<FuzzyRating, number> {
  const output: Record<FuzzyRating, number> = { Poor: 0, Average: 0, Good: 0, Excellent: 0 };

  // Rule 1: IF skillMatch is HIGH AND experience is SENIOR THEN Excellent
  output.Excellent = Math.max(output.Excellent, Math.min(skillHigh, expSenior));

  // Rule 2: IF skillMatch is HIGH AND experience is MID THEN Good
  output.Good = Math.max(output.Good, Math.min(skillHigh, expMid));

  // Rule 3: IF skillMatch is HIGH AND experience is JUNIOR THEN Average
  output.Average = Math.max(output.Average, Math.min(skillHigh, expJunior));

  // Rule 4: IF skillMatch is MEDIUM AND experience is SENIOR THEN Good
  output.Good = Math.max(output.Good, Math.min(skillMedium, expSenior));

  // Rule 5: IF skillMatch is MEDIUM AND experience is MID THEN Average
  output.Average = Math.max(output.Average, Math.min(skillMedium, expMid));

  // Rule 6: IF skillMatch is MEDIUM AND experience is JUNIOR THEN Poor
  output.Poor = Math.max(output.Poor, Math.min(skillMedium, expJunior));

  // Rule 7: IF skillMatch is LOW THEN Poor
  output.Poor = Math.max(output.Poor, skillLow);

  // Rule 8: IF neuralScore is EXCELLENT AND skillMatch is HIGH THEN Excellent
  output.Excellent = Math.max(output.Excellent, Math.min(neuralExcellent, skillHigh));

  // Rule 9: IF neuralScore is GOOD AND skillMatch is MEDIUM THEN Good
  output.Good = Math.max(output.Good, Math.min(neuralGood, skillMedium));

  // Rule 10: IF neuralScore is POOR THEN Poor
  output.Poor = Math.max(output.Poor, neuralPoor);

  // Rule 11: IF neuralScore is AVERAGE AND experience is MID THEN Average
  output.Average = Math.max(output.Average, Math.min(neuralAverage, expMid));

  // Rule 12: IF neuralScore is EXCELLENT AND experience is SENIOR THEN Excellent
  output.Excellent = Math.max(output.Excellent, Math.min(neuralExcellent, expSenior));

  return output;
}

/**
 * Defuzzify output using weighted average (centroid method)
 */
function defuzzify(output: Record<FuzzyRating, number>): { rating: FuzzyRating; confidence: number } {
  const totalWeight = Object.values(output).reduce((sum, w) => sum + w, 0);
  
  if (totalWeight === 0) {
    return { rating: 'Average', confidence: 0 };
  }

  // Weighted average of crisp output values
  const weightedSum = (Object.entries(output) as [FuzzyRating, number][])
    .reduce((sum, [rating, weight]) => sum + RATING_VALUES[rating] * weight, 0);
  
  const crispValue = weightedSum / totalWeight;
  const confidence = Math.min(1, totalWeight);

  // Map crisp value to rating
  let rating: FuzzyRating;
  if (crispValue >= 75) rating = 'Excellent';
  else if (crispValue >= 50) rating = 'Good';
  else if (crispValue >= 25) rating = 'Average';
  else rating = 'Poor';

  return { rating, confidence };
}

/**
 * Map fuzzy rating to hiring recommendation
 */
function ratingToRecommendation(rating: FuzzyRating): HiringRecommendation {
  switch (rating) {
    case 'Excellent': return 'Strong Candidate';
    case 'Good':      return 'Consider';
    case 'Average':   return 'Consider';
    case 'Poor':      return 'Reject';
  }
}

/**
 * Main fuzzy decision function
 * @param inputs Fuzzy input values
 * @returns FuzzyDecisionResult with rating and recommendation
 */
export function makeFuzzyDecision(inputs: Partial<FuzzyInputs>): FuzzyDecisionResult {
  const startTime = performance.now();

  const config = getNeuroFuzzyConfig();
  if (!config.fuzzy.enabled) {
    return {
      success: false,
      fuzzyRating: null,
      hiringRecommendation: null,
      confidence: 0,
      error: 'Fuzzy engine is disabled',
      processingTimeMs: performance.now() - startTime,
    };
  }

  try {
    const sanitized = sanitizeInputs(inputs);

    // Fuzzify inputs
    const skillLow    = calculateMembership(sanitized.skillMatchScore, SKILL_MATCH_MF.low);
    const skillMedium = calculateMembership(sanitized.skillMatchScore, SKILL_MATCH_MF.medium);
    const skillHigh   = calculateMembership(sanitized.skillMatchScore, SKILL_MATCH_MF.high);

    const expJunior = calculateMembership(sanitized.experienceYears, EXPERIENCE_MF.junior);
    const expMid    = calculateMembership(sanitized.experienceYears, EXPERIENCE_MF.mid);
    const expSenior = calculateMembership(sanitized.experienceYears, EXPERIENCE_MF.senior);

    const neuralPoor      = calculateMembership(sanitized.neuralScore, NEURAL_SCORE_MF.poor);
    const neuralAverage   = calculateMembership(sanitized.neuralScore, NEURAL_SCORE_MF.average);
    const neuralGood      = calculateMembership(sanitized.neuralScore, NEURAL_SCORE_MF.good);
    const neuralExcellent = calculateMembership(sanitized.neuralScore, NEURAL_SCORE_MF.excellent);

    // Apply rules
    const output = applyFuzzyRules(
      skillLow, skillMedium, skillHigh,
      expJunior, expMid, expSenior,
      neuralPoor, neuralAverage, neuralGood, neuralExcellent
    );

    // Defuzzify
    const { rating, confidence } = defuzzify(output);
    const recommendation = ratingToRecommendation(rating);

    return {
      success: true,
      fuzzyRating: rating,
      hiringRecommendation: recommendation,
      confidence,
      processingTimeMs: performance.now() - startTime,
    };
  } catch (error) {
    console.error('[FuzzyEngine] Decision failed:', error);
    return {
      success: false,
      fuzzyRating: null,
      hiringRecommendation: null,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: performance.now() - startTime,
    };
  }
}
