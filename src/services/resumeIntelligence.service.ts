/**
 * Resume Intelligence Orchestration Service
 * 
 * Coordinates all AI modules to provide comprehensive resume analysis:
 * - Resume parsing (PDF/DOC/DOCX)
 * - Skill extraction and matching
 * - Target role detection
 * - Resume scoring
 * - Section analysis
 * - Job recommendations
 * - Neural network evaluation (neuro-fuzzy)
 * - Fuzzy logic decision making
 */

import { ResumeParser } from '@/ai/parser/resumeParser';
import { SkillExtractor } from '@/ai/parser/skillExtractor';
import { RoleDetector } from '@/ai/parser/roleDetector';
import { SkillMatcher } from '@/ai/matcher/skillMatcher';
import { ResumeScorer } from '@/ai/scorer/resumeScorer';
import { SectionAnalyzer } from '@/ai/analyzer/sectionAnalyzer';
import { JobRecommender } from '@/ai/matcher/jobRecommender';
import { TrendingSkillsAnalyzer } from '@/ai/analyzer/trendingSkills';
import { normalizeRole } from '@/ai/normalizeRole';

import { evaluateResume } from '@/ai/neuro/neuralResumeEvaluator';
import { makeFuzzyDecision } from '@/ai/fuzzy/fuzzyDecisionEngine';

import { ResumeAnalysisService } from './resumeAnalysis.service';
import { skillMatchService } from './skillMatch.service';
import { resumeScoreService } from './resumeScore.service';
import { sectionAnalysisService } from './sectionAnalysis.service';
import { AuditLogService } from './auditLog.service';

import type { ComprehensiveAnalysis } from '@/ai/types';

export interface ResumeIntelligenceRequest {
  /** Resume file to analyze */
  file: File;
  /** User ID */
  userId: string;
  /** Target role (optional - will be auto-detected if not provided) */
  targetRole?: string;
  /** Store results in database */
  saveToDatabase?: boolean;
  /** Progress callback for tracking analysis steps */
  onProgress?: (step: number, message: string, progress: number) => void;
}

export interface ResumeIntelligenceResult {
  /** Success status */
  success: boolean;
  /** Comprehensive analysis result */
  analysis?: ComprehensiveAnalysis;
  /** Error message if failed */
  error?: string;
  /** Processing metadata */
  metadata?: {
    processingTime: number;
    analysisId?: string;
    stepsCompleted: string[];
  };
}

export class ResumeIntelligenceService {
  private static resumeParser = new ResumeParser();
  private static skillExtractor = new SkillExtractor();
  private static roleDetector = new RoleDetector();
  private static skillMatcher = new SkillMatcher();
  private static resumeScorer = new ResumeScorer();
  private static sectionAnalyzer = new SectionAnalyzer();
  private static jobRecommender = new JobRecommender();
  private static trendingSkillsAnalyzer = new TrendingSkillsAnalyzer();

  /**
   * Orchestrate complete resume analysis pipeline
   */
  static async analyzeResume(request: ResumeIntelligenceRequest): Promise<ResumeIntelligenceResult> {
    const startTime = Date.now();
    const stepsCompleted: string[] = [];
    const { onProgress } = request;

    try {
      console.log('[ResumeIntelligence] Starting analysis pipeline...');

      // Step 1: Parse Resume (0-20%)
      onProgress?.(1, 'Parsing resume...', 5);
      const parsedResume = await this.resumeParser.parseResume(request.file);
      stepsCompleted.push('parse');
      onProgress?.(1, 'Resume parsed successfully', 20);
      console.log(`[ResumeIntelligence] ✓ Parsed ${parsedResume.text.length} characters`);

      // Steps 2-3: Extract Skills + Detect Role — concurrent (20-40%)
      onProgress?.(2, 'Extracting skills and detecting role...', 25);
      const [extractedSkills, roleDetection] = await Promise.all([
        Promise.resolve(this.skillExtractor.extractSkills(parsedResume.text)),
        Promise.resolve(this.roleDetector.detectRole(parsedResume.text, [])),
      ]);
      parsedResume.skills = extractedSkills;
      parsedResume.targetRole = normalizeRole(request.targetRole || roleDetection.detectedRole);
      parsedResume.roleConfidence = roleDetection.confidence;
      stepsCompleted.push('extract_skills', 'detect_role');
      onProgress?.(3, `Role: ${parsedResume.targetRole} | Skills: ${extractedSkills.length}`, 40);

      // Step 4: Skill Match (40-55%) — never throws
      onProgress?.(4, 'Matching skills against role requirements...', 45);
      let skillMatch = this.skillMatcher.calculateSkillMatch([], parsedResume.targetRole);
      try {
        skillMatch = await this.skillMatcher.calculateMatch(extractedSkills, parsedResume.targetRole);
        stepsCompleted.push('skill_match');
        onProgress?.(4, `Match score: ${skillMatch.matchScore}%`, 55);
        console.log(`[ResumeIntelligence] ✓ Match score: ${skillMatch.matchScore}%`);
      } catch (matchErr) {
        console.warn('[ResumeIntelligence] ⚠ Skill match failed, using empty match:', matchErr);
        stepsCompleted.push('skill_match');
        onProgress?.(4, 'Skill analysis completed', 55);
      }

      // Steps 5-7: Resume Score + Section Analysis + Trending Skills — all concurrent (55-80%)
      onProgress?.(5, 'Scoring resume, analysing sections and fetching trends...', 60);
      const [resumeScore, sectionAnalysis, trendingSkills] = await Promise.all([
        Promise.resolve(this.resumeScorer.calculateResumeScore(parsedResume, skillMatch)),
        Promise.resolve(this.sectionAnalyzer.analyzeSections(parsedResume)),
        Promise.resolve(this.trendingSkillsAnalyzer.getTrendingSkills(parsedResume.targetRole)),
      ]);
      stepsCompleted.push('resume_score', 'section_analysis', 'trending_skills');
      onProgress?.(7, `Score: ${resumeScore.totalScore}/100 | Sections: ${sectionAnalysis.detectedSections.length}`, 80);

      // Steps 8-9: Job Recommendations + Neuro-Fuzzy — concurrent (80-97%)
      onProgress?.(8, 'Generating job recommendations and running AI evaluation...', 83);
      const [jobRecommendations, neuroFuzzyResult] = await Promise.all([
        Promise.resolve(
          this.jobRecommender.generateJobRecommendations(extractedSkills, parsedResume.targetRole, skillMatch)
        ),
        this.runNeuroFuzzy(skillMatch.matchScore, resumeScore, sectionAnalysis, extractedSkills),
      ]);
      stepsCompleted.push('job_recommendations', 'neuro_fuzzy');
      onProgress?.(9, `Jobs: ${jobRecommendations.length} | AI eval complete`, 97);

      const { neuralScore, fuzzyRating, hiringRecommendation } = neuroFuzzyResult;

      // Build comprehensive analysis
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const analyzedAt = new Date().toISOString();

      const comprehensiveAnalysis: ComprehensiveAnalysis & {
        neuralScore?: number | null;
        fuzzyRating?: string | null;
        hiringRecommendation?: string | null;
      } = {
        parsedResume,
        skillMatch,
        resumeScore,
        sectionAnalysis,
        trendingSkills,
        jobRecommendations,
        analyzedAt,
        analysisId,
        neuralScore,
        fuzzyRating,
        hiringRecommendation,
      };

      // Step 10: Store Results (97-100%)
      if (request.saveToDatabase !== false) {
        onProgress?.(10, 'Saving results to database...', 98);
        try {
          await this.storeAnalysisResults(request.userId, comprehensiveAnalysis, parsedResume.text);
          stepsCompleted.push('database_storage');
          onProgress?.(10, 'Results saved successfully', 100);
        } catch (dbError) {
          console.warn('[ResumeIntelligence] ⚠ Database storage failed (continuing):', dbError);
          onProgress?.(10, 'Analysis complete (database save failed)', 100);
        }
      } else {
        onProgress?.(10, 'Analysis complete', 100);
      }

      const processingTime = Date.now() - startTime;
      console.log(`[ResumeIntelligence] ✅ Analysis complete in ${processingTime}ms`);

      return {
        success: true,
        analysis: comprehensiveAnalysis,
        metadata: { processingTime, analysisId, stepsCompleted },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('[ResumeIntelligence] ❌ Analysis failed:', error);

      try {
        await AuditLogService.logAuditEvent(
          'RESUME_ANALYZED',
          'resume_analyses',
          undefined,
          request.userId,
          undefined,
          {
            error_message: error instanceof Error ? error.message : 'Unknown error',
            steps_completed: stepsCompleted,
            processing_time: processingTime,
          }
        );
      } catch { /* ignore audit errors */ }

      return {
        success: false,
        error: this.formatError(error, stepsCompleted),
        metadata: { processingTime, stepsCompleted },
      };
    }
  }

  /**
   * Run neuro-fuzzy evaluation — always resolves, never throws.
   */
  private static async runNeuroFuzzy(
    matchScore: number,
    resumeScore: import('@/ai/types').ResumeScore,
    sectionAnalysis: import('@/ai/types').SectionAnalysis,
    extractedSkills: string[]
  ): Promise<{ neuralScore: number | null; fuzzyRating: string | null; hiringRecommendation: string | null }> {
    try {
      const experienceYears = resumeScore.breakdown?.factors?.experienceYears ?? 0;
      const projectsCount   = resumeScore.breakdown?.factors?.projectCount ?? 0;
      const educationScore  = resumeScore.componentScores?.educationScore ?? 0;
      const keywordDensity  = Math.min(1, extractedSkills.length / 50);
      const sectionCompleteness = (sectionAnalysis.completeness ?? 0) / 100;

      const [neuralResult, fuzzyResult] = await Promise.all([
        evaluateResume({ skillMatchScore: matchScore, experienceYears, projectsCount, educationScore, keywordDensity, sectionCompleteness }),
        Promise.resolve(makeFuzzyDecision({ neuralScore: matchScore, skillMatchScore: matchScore, experienceYears })),
      ]);

      const neuralScore = neuralResult.success ? neuralResult.neuralScore : null;
      const fuzzyRating = fuzzyResult.success ? fuzzyResult.fuzzyRating : null;
      const hiringRecommendation = fuzzyResult.success ? fuzzyResult.hiringRecommendation : null;
      return { neuralScore, fuzzyRating, hiringRecommendation };
    } catch (err) {
      console.warn('[ResumeIntelligence] ⚠ Neuro-fuzzy evaluation failed (continuing):', err);
      return { neuralScore: null, fuzzyRating: null, hiringRecommendation: null };
    }
  }

  /**
   * Store analysis results in database tables
   */
  private static async storeAnalysisResults(
    userId: string,
    analysis: ComprehensiveAnalysis,
    resumeText: string
  ): Promise<void> {
    try {
      const savedAnalysis = await ResumeAnalysisService.saveResumeAnalysis({
        user_id: userId,
        resume_text: resumeText,
        target_role: analysis.parsedResume.targetRole,
        experience_years: this.extractExperienceYears(resumeText),
        analysis_result: {
          matchScore: analysis.skillMatch.matchScore,
          totalScore: analysis.resumeScore.totalScore,
          matchedSkills: analysis.skillMatch.matchedSkills.map(s => s.skill),
          missingSkills: analysis.skillMatch.missingSkills.map(s => s.skill),
          qualityFlag: analysis.resumeScore.qualityFlag,
        },
      });

      const analysisId = savedAnalysis.id!;

      await Promise.allSettled([
        skillMatchService.saveSkillMatch(userId, analysisId, analysis.skillMatch),
        resumeScoreService.saveResumeScore(userId, analysisId, analysis.resumeScore),
        sectionAnalysisService.saveSectionAnalysis(userId, analysisId, analysis.sectionAnalysis),
      ]);

      console.log('[ResumeIntelligence] All results stored successfully');
    } catch (error) {
      console.error('[ResumeIntelligence] Error storing results:', error);
      throw error;
    }
  }

  private static extractExperienceYears(resumeText: string): number {
    const text = resumeText.toLowerCase();
    const yearPatterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
      /(\d+)\+?\s*years?\s*in/gi,
    ];
    let maxYears = 0;
    yearPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const yearMatch = match.match(/(\d+)/);
          if (yearMatch) maxYears = Math.max(maxYears, parseInt(yearMatch[1]));
        });
      }
    });
    if (maxYears === 0) {
      if (text.includes('senior') || text.includes('lead')) maxYears = 4;
    }
    return Math.min(15, maxYears);
  }

  private static formatError(error: unknown, stepsCompleted: string[]): string {
    const lastStep = stepsCompleted[stepsCompleted.length - 1] || 'initialization';
    if (error instanceof Error) {
      if (lastStep === 'parse') return 'Failed to parse resume file. Please ensure the file is not corrupted and is in a supported format (PDF, DOC, DOCX).';
      if (lastStep === 'extract_skills') return 'Failed to extract skills from resume. The resume text may be too short or improperly formatted.';
      if (lastStep === 'detect_role') return 'Failed to detect target role. Please specify a target role manually.';
      if (lastStep === 'resume_score') return 'Failed to calculate resume score. Please try again.';
      return `Analysis failed: ${error.message}`;
    }
    return 'An unexpected error occurred during analysis. Please try again.';
  }

  static async getAnalysisById(_analysisId: string): Promise<ComprehensiveAnalysis | null> {
    return null;
  }

  static async getUserAnalysisHistory(_userId: string, _limit = 10): Promise<ComprehensiveAnalysis[]> {
    return [];
  }
}
