import { z } from 'zod';

/**
 * Centralized localStorage key names and Zod schemas
 * All app localStorage data goes through these constants
 */

// Key names
export const STORAGE_KEYS = {
  RESUME_ANALYSIS: 'resumeAnalysis',
  DETECTED_ROLE: 'detectedRole',
  ANALYSIS_HISTORY: 'analysisHistory',
} as const;

// Zod schemas for validation
export const ResumeComponentScoresSchema = z.object({
  skillsScore: z.number().min(0).max(100),
  projectsScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  educationScore: z.number().min(0).max(100),
});

export const ResumeBreakdownSchema = z.object({
  skillsContribution: z.number().optional(),
  projectsContribution: z.number().optional(),
  experienceContribution: z.number().optional(),
  educationContribution: z.number().optional(),
  factors: z.record(z.any()).optional(),
});

export const ResumeScoreSchema = z.object({
  totalScore: z.number().min(0).max(100),
  componentScores: ResumeComponentScoresSchema,
  breakdown: ResumeBreakdownSchema.optional(),
  qualityFlag: z.enum(['excellent', 'competitive', 'needs_improvement']).optional(),
  recommendations: z.array(z.string()).optional(),
});

export const SkillSchema = z.object({
  skill: z.string(),
  category: z.string().optional(),
  importance: z.enum(['critical', 'important', 'nice-to-have']).optional(),
});

export const SkillMatchSchema = z.object({
  matchScore: z.number().min(0).max(100),
  weightedMatchScore: z.number().min(0).max(100).optional(),
  matchedSkills: z.array(SkillSchema),
  missingSkills: z.array(SkillSchema),
  targetRole: z.string().optional(),
});

export const ParsedResumeSchema = z.object({
  text: z.string(),
  targetRole: z.string(),
  roleConfidence: z.number().optional(),
  skills: z.array(z.string()),
  sections: z.object({
    skills: z.object({ content: z.string(), qualityScore: z.number().optional() }).optional(),
    experience: z.object({ content: z.string(), qualityScore: z.number().optional() }).optional(),
    projects: z.object({ content: z.string(), qualityScore: z.number().optional() }).optional(),
    education: z.object({ content: z.string(), qualityScore: z.number().optional() }).optional(),
  }).optional(),
  experienceLevel: z.string().optional(),
});

export const ResumeAnalysisSchema = z.object({
  resumeScore: ResumeScoreSchema,
  skillMatch: SkillMatchSchema,
  parsedResume: ParsedResumeSchema,
  mlResult: z.object({
    mlScore: z.number().optional(),
    fuzzyScore: z.number().optional(),
    finalScore: z.number().optional(),
  }).optional(),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;
export type ResumeScore = z.infer<typeof ResumeScoreSchema>;
export type SkillMatch = z.infer<typeof SkillMatchSchema>;

/**
 * Safe read from localStorage with validation
 */
export function getStoredAnalysis(): ResumeAnalysis | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUME_ANALYSIS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return ResumeAnalysisSchema.parse(parsed);
  } catch (e) {
    console.warn('[StorageKeys] Invalid resume analysis in localStorage:', e);
    return null;
  }
}

/**
 * Safe write to localStorage
 */
export function setStoredAnalysis(analysis: Partial<ResumeAnalysis>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESUME_ANALYSIS, JSON.stringify(analysis));
  } catch (e) {
    console.error('[StorageKeys] Failed to save analysis:', e);
  }
}

/**
 * Safe read detected role
 */
export function getDetectedRole(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.DETECTED_ROLE) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Safe write detected role
 */
export function setDetectedRole(role: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DETECTED_ROLE, role);
  } catch (e) {
    console.error('[StorageKeys] Failed to save detected role:', e);
  }
}

/**
 * Safe read analysis history
 */
export function getAnalysisHistory(): Array<{ score: number; date: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return z.array(z.object({ score: z.number(), date: z.string() })).parse(parsed);
  } catch (e) {
    console.warn('[StorageKeys] Invalid analysis history in localStorage:', e);
    return [];
  }
}

/**
 * Safe write analysis history
 */
export function setAnalysisHistory(history: Array<{ score: number; date: string }>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('[StorageKeys] Failed to save analysis history:', e);
  }
}
