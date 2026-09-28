import { supabase } from '../integrations/supabase/client';
import { SkillMatch } from '../ai/types';

/**
 * Skill Match Service
 * Manages skill match results in Supabase
 */

interface SkillMatchRow {
  id: string;
  user_id: string;
  resume_analysis_id: string;
  target_role: string;
  match_score: number;
  weighted_match_score: number;
  match_quality: string;
  matched_skills: string[];
  missing_skills: string[];
  created_at: string;
}

export class SkillMatchService {
  /**
   * Save skill match results
   */
  async saveSkillMatch(
    userId: string,
    resumeAnalysisId: string,
    skillMatch: SkillMatch
  ): Promise<string> {
    try {
      const matchData = {
        user_id: userId,
        resume_analysis_id: resumeAnalysisId,
        target_role: skillMatch.targetRole,
        match_score: skillMatch.matchScore,
        weighted_match_score: skillMatch.weightedMatchScore,
        match_quality: skillMatch.matchQuality,
        matched_skills: skillMatch.matchedSkills.map(s => s.skill),
        missing_skills: skillMatch.missingSkills.map(s => s.skill),
      };

      const { data, error } = await supabase
        .from('skill_matches')
        .insert(matchData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`Saved skill match ${data.id} for user ${userId}`);
      return data.id;
    } catch (error) {
      console.error('Error saving skill match:', error);
      throw error;
    }
  }

  /**
   * Get skill match history for user
   * Optimized with selective column fetching and pagination
   */
  async getSkillMatchHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<SkillMatchRow[]> {
    try {
      const { data, error } = await supabase
        .from('skill_matches')
        .select('id, target_role, match_score, weighted_match_score, match_quality, matched_skills, missing_skills, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching skill match history:', error);
      throw error;
    }
  }

  /**
   * Get skill match by ID
   */
  async getSkillMatchById(matchId: string): Promise<SkillMatchRow | null> {
    try {
      const { data, error } = await supabase
        .from('skill_matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching skill match:', error);
      throw error;
    }
  }

  /**
   * Get skill match for resume analysis
   */
  async getSkillMatchByResumeAnalysis(
    resumeAnalysisId: string
  ): Promise<SkillMatchRow | null> {
    try {
      const { data, error } = await supabase
        .from('skill_matches')
        .select('*')
        .eq('resume_analysis_id', resumeAnalysisId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching skill match by resume analysis:', error);
      throw error;
    }
  }

  /**
   * Get skill match statistics for user
   */
  async getSkillMatchStats(userId: string): Promise<{
    totalMatches: number;
    averageMatchScore: number;
    averageWeightedScore: number;
    topRole: string | null;
    recentImprovement: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('skill_matches')
        .select('match_score, weighted_match_score, target_role, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalMatches: 0,
          averageMatchScore: 0,
          averageWeightedScore: 0,
          topRole: null,
          recentImprovement: 0,
        };
      }

      // Calculate statistics
      const totalMatches = data.length;
      const averageMatchScore = Math.round(
        data.reduce((sum, row) => sum + row.match_score, 0) / totalMatches
      );
      const averageWeightedScore = Math.round(
        data.reduce((sum, row) => sum + row.weighted_match_score, 0) / totalMatches
      );

      // Find most common role
      const roleCounts: Record<string, number> = {};
      data.forEach(row => {
        roleCounts[row.target_role] = (roleCounts[row.target_role] || 0) + 1;
      });
      const topRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      // Calculate recent improvement (last 3 vs previous 3)
      let recentImprovement = 0;
      if (data.length >= 6) {
        const recent3 = data.slice(0, 3);
        const previous3 = data.slice(3, 6);
        const recentAvg = recent3.reduce((sum, row) => sum + row.weighted_match_score, 0) / 3;
        const previousAvg = previous3.reduce((sum, row) => sum + row.weighted_match_score, 0) / 3;
        recentImprovement = Math.round(recentAvg - previousAvg);
      }

      return {
        totalMatches,
        averageMatchScore,
        averageWeightedScore,
        topRole,
        recentImprovement,
      };
    } catch (error) {
      console.error('Error calculating skill match stats:', error);
      throw error;
    }
  }

  /**
   * Delete skill match
   */
  async deleteSkillMatch(matchId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('skill_matches')
        .delete()
        .eq('id', matchId);

      if (error) {
        throw error;
      }

      console.log(`Deleted skill match ${matchId}`);
    } catch (error) {
      console.error('Error deleting skill match:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const skillMatchService = new SkillMatchService();
