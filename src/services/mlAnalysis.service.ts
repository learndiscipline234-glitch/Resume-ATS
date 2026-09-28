/**
 * ML Analysis Service
 * Orchestrates: skill extraction → role prediction → match calculation → DB storage
 * Always writes to job_matches (even in demo mode) so DBMS Analytics stays live.
 */

import { predictRole, getRoleDisplay, getAllRoles, getDataset } from '@/ai/ml/rolePredictor';
import { analyzeResume, SkillAnalysisResult } from '@/ai/ml/skillAnalyzer';
import { supabase } from '@/integrations/supabase/client';

export interface MLAnalysisRequest {
  resumeText: string;
  fileName:   string;
  targetRole: string;
  userId:     string;
}

export interface JobCompatibility {
  role:    string;
  display: string;
  score:   number; // 0–100 final score
}

export interface MLAnalysisResult {
  success:          boolean;
  predictedRole:    string;
  predictedDisplay: string;
  mlConfidence:     number;
  probabilities:    Record<string, number>;
  extractedSkills:  string[];
  matchedSkills:    string[];
  missingSkills:    string[];
  partialSkills:    Array<{ skill: string; similarity: number; matchedTo: string }>;
  matchPercentage:  number;
  mlScore:          number;
  fuzzyScore:       number;
  weightedScore:    number;
  finalScore:       number;
  confidence:       number;
  recommendations:  SkillAnalysisResult['recommendations'];
  jobCompatibility: JobCompatibility[];  // dynamic — all roles ranked by score
  resumeId?:        string;
  matchId?:         string;
  error?:           string;
}

// Fixed demo UUID — used when no real auth user is present
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export class MLAnalysisService {

  /**
   * Full ML pipeline:
   * 1. Predict role (TF-IDF + Naive Bayes)
   * 2. Extract skills + calculate match %
   * 3. Write to job_matches (always — demo or real user)
   * 4. Refresh materialized view
   */
  static async analyze(req: MLAnalysisRequest): Promise<MLAnalysisResult> {
    try {
      // Step 1: ML role prediction
      const prediction = predictRole(req.resumeText);

      // Step 2: Skill extraction + match for selected role
      const skillResult = analyzeResume(req.resumeText, req.targetRole);

      // Step 2b: Compute compatibility across ALL roles (dynamic job compatibility)
      const jobCompatibility: JobCompatibility[] = getDataset()
        .map(entry => {
          const r = analyzeResume(req.resumeText, entry.role);
          return { role: entry.role, display: entry.display, score: r.finalScore };
        })
        .sort((a, b) => b.score - a.score);

      const result: MLAnalysisResult = {
        success:          true,
        predictedRole:    prediction.predictedRole,
        predictedDisplay: getRoleDisplay(prediction.predictedRole),
        mlConfidence:     prediction.confidence,
        probabilities:    prediction.probabilities,
        extractedSkills:  skillResult.extractedSkills,
        matchedSkills:    skillResult.matchedSkills,
        missingSkills:    skillResult.missingSkills,
        partialSkills:    skillResult.partialSkills ?? [],
        matchPercentage:  skillResult.finalScore,
        mlScore:          skillResult.mlScore,
        fuzzyScore:       skillResult.fuzzyScore,
        weightedScore:    skillResult.weightedScore,
        finalScore:       skillResult.finalScore,
        confidence:       skillResult.confidence,
        recommendations:  skillResult.recommendations,
        jobCompatibility,
      };

      // Step 3: Always persist to job_matches
      const persistUserId = (req.userId && req.userId !== 'demo-user')
        ? req.userId
        : DEMO_USER_ID;

      try {
        const { data: matchRow } = await supabase
          .from('job_matches')
          .insert({
            user_id:          persistUserId,
            target_role:      req.targetRole,
            match_percentage: skillResult.matchPercentage,
            matched_skills:   skillResult.matchedSkills,
            missing_skills:   skillResult.missingSkills,
            recommendations:  skillResult.recommendations.map(r => ({
              skill:     r.skill,
              resources: r.resources,
            })),
            ml_result: {
              predicted_role: prediction.predictedRole,
              confidence:     prediction.confidence,
              ml_score:       skillResult.mlScore,
              fuzzy_score:    skillResult.fuzzyScore,
              final_score:    skillResult.finalScore,
              weighted_score: skillResult.weightedScore,
            },
          })
          .select('id')
          .single();

        if (matchRow) {
          result.matchId = matchRow.id;
          // Refresh materialized view (fire and forget)
          void supabase.rpc('refresh_top_job_matches');
        }
      } catch (dbErr) {
        console.warn('[MLAnalysis] DB write failed (continuing):', dbErr);
      }

      return result;

    } catch (err) {
      console.error('[MLAnalysis] Pipeline failed:', err);
      return {
        success:          false,
        predictedRole:    req.targetRole,
        predictedDisplay: getRoleDisplay(req.targetRole),
        mlConfidence:     0,
        probabilities:    {},
        extractedSkills:  [],
        matchedSkills:    [],
        missingSkills:    [],
        partialSkills:    [],
        matchPercentage:  0,
        mlScore:          0,
        fuzzyScore:       0,
        weightedScore:    0,
        finalScore:       0,
        confidence:       0,
        recommendations:  [],
        jobCompatibility: [],
        error:            err instanceof Error ? err.message : 'Analysis failed',
      };
    }
  }

  static async getUserMatchHistory(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('job_matches')
      .select('id, target_role, match_percentage, matched_skills, missing_skills, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return data ?? [];
  }

  static async calculateMatchFromDB(userId: string) {
    const { data, error } = await supabase.rpc('calculate_match', { p_user_id: userId });
    if (error) return [];
    return data ?? [];
  }

  static getAvailableRoles() {
    return getAllRoles();
  }
}
