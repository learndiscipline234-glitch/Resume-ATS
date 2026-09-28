/**
 * Resume Ranking Engine
 * 
 * Evaluates multiple resumes through the full pipeline and ranks them
 * using a weighted combination of neural, skill match, and resume scores.
 * 
 * Final Score = 0.5 × neuralScore + 0.3 × skillMatchScore + 0.2 × resumeScore
 */

import type { RankedCandidate, RankingResult, RankingOptions, ComprehensiveAnalysis } from '../types';
import { evaluateResume } from '../neuro/neuralResumeEvaluator';
import { makeFuzzyDecision } from '../fuzzy/fuzzyDecisionEngine';
import { getNeuroFuzzyConfig } from '../../config/neuroFuzzyConfig';

export interface ResumeInput {
  /** Candidate identifier */
  candidateId: string;
  /** Candidate display name */
  candidateName: string;
  /** Pre-computed comprehensive analysis */
  analysis: ComprehensiveAnalysis;
}

/**
 * Calculate final weighted score
 */
export function calculateFinalScore(
  neuralScore: number,
  skillMatchScore: number,
  resumeScore: number,
  weights = { neural: 0.5, skillMatch: 0.3, resumeScore: 0.2 }
): number {
  return (
    weights.neural * neuralScore +
    weights.skillMatch * skillMatchScore +
    weights.resumeScore * resumeScore
  );
}

/**
 * Process a single resume through neuro-fuzzy evaluation
 */
async function processCandidate(
  input: ResumeInput,
  weights: { neural: number; skillMatch: number; resumeScore: number }
): Promise<RankedCandidate> {
  const { analysis } = input;
  const skillMatchScore = analysis.skillMatch?.matchScore ?? 0;
  const resumeScoreValue = analysis.resumeScore?.totalScore ?? 0;
  const experienceYears = analysis.resumeScore?.breakdown?.factors?.experienceYears ?? 0;
  const educationScore = analysis.resumeScore?.componentScores?.educationScore ?? 0;
  const sectionCompleteness = (analysis.sectionAnalysis?.completeness ?? 0) / 100;
  const projectsCount = analysis.resumeScore?.breakdown?.factors?.projectCount ?? 0;

  // Estimate keyword density from skill match
  const keywordDensity = Math.min(1, (analysis.parsedResume?.skills?.length ?? 0) / 50);

  // Run neural evaluator
  const neuralResult = await evaluateResume({
    skillMatchScore,
    experienceYears,
    projectsCount,
    educationScore,
    keywordDensity,
    sectionCompleteness,
  });

  const neuralScore = neuralResult.success && neuralResult.neuralScore !== null
    ? neuralResult.neuralScore
    : skillMatchScore; // fallback to skill match score

  // Run fuzzy decision
  const fuzzyResult = makeFuzzyDecision({
    neuralScore,
    skillMatchScore,
    experienceYears,
  });

  // Calculate final score
  const finalScore = calculateFinalScore(neuralScore, skillMatchScore, resumeScoreValue, weights);

  return {
    candidateId: input.candidateId,
    candidateName: input.candidateName,
    finalScore: Math.round(finalScore * 10) / 10,
    neuralScore: neuralResult.success ? neuralResult.neuralScore : null,
    fuzzyRating: fuzzyResult.success ? fuzzyResult.fuzzyRating : null,
    hiringRecommendation: fuzzyResult.success ? fuzzyResult.hiringRecommendation : null,
    rank: 0, // assigned after sorting
    skillMatchScore,
    resumeScore: resumeScoreValue,
    detectedRole: analysis.parsedResume?.targetRole ?? 'Unknown',
    experienceYears,
    fullAnalysis: analysis,
  };
}

/**
 * Rank multiple resumes by final score
 * @param inputs Array of resume inputs with pre-computed analyses
 * @param options Optional ranking configuration
 */
export async function rankResumes(
  inputs: ResumeInput[],
  options: RankingOptions = {}
): Promise<RankingResult> {
  const startTime = performance.now();

  const config = getNeuroFuzzyConfig();

  if (!config.ranking.enabled) {
    return {
      success: false,
      rankedCandidates: [],
      totalProcessed: 0,
      totalFailed: 0,
      processingTimeMs: performance.now() - startTime,
      error: 'Ranking engine is disabled',
    };
  }

  if (!inputs || inputs.length === 0) {
    return {
      success: true,
      rankedCandidates: [],
      totalProcessed: 0,
      totalFailed: 0,
      processingTimeMs: performance.now() - startTime,
    };
  }

  const weights = options.weights ?? config.ranking.weights;
  const batchSize = options.parallelBatchSize ?? config.ranking.parallelBatchSize;
  const maxResumes = config.ranking.maxResumes;

  const limitedInputs = inputs.slice(0, maxResumes);
  const candidates: RankedCandidate[] = [];
  let totalFailed = 0;

  // Process in batches
  for (let i = 0; i < limitedInputs.length; i += batchSize) {
    const batch = limitedInputs.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(input => processCandidate(input, weights))
    );

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        candidates.push(result.value);
      } else {
        totalFailed++;
        console.error(`[RankingEngine] Failed to process candidate ${batch[idx].candidateId}:`, result.reason);
        // Add failed candidate with error
        candidates.push({
          candidateId: batch[idx].candidateId,
          candidateName: batch[idx].candidateName,
          finalScore: 0,
          neuralScore: null,
          fuzzyRating: null,
          hiringRecommendation: null,
          rank: 0,
          skillMatchScore: 0,
          resumeScore: 0,
          detectedRole: 'Unknown',
          experienceYears: 0,
          fullAnalysis: batch[idx].analysis,
          processingError: result.reason instanceof Error ? result.reason.message : 'Processing failed',
        });
      }
    });
  }

  // Sort by final score descending
  candidates.sort((a, b) => b.finalScore - a.finalScore);

  // Assign ranks (failed candidates go to the bottom)
  candidates.forEach((candidate, index) => {
    candidate.rank = index + 1;
  });

  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    success: true,
    rankedCandidates: candidates,
    totalProcessed: candidates.length - totalFailed,
    totalFailed,
    processingTimeMs: performance.now() - startTime,
    batchId,
  };
}
