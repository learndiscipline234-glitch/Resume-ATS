import { supabase } from '../integrations/supabase/client';
import { ResumeScore } from '../ai/types';

/**
 * Resume Score Service
 * Manages resume scores in Supabase
 */

interface ResumeScoreRow {
  id: string;
  user_id: string;
  resume_analysis_id: string;
  total_score: number;
  skills_score: number;
  projects_score: number;
  experience_score: number;
  education_score: number;
  quality_flag: string;
  recommendations: string[];
  created_at: string;
}

export class ResumeScoreService {
  /**
   * Save resume score
   */
  async saveResumeScore(
    userId: string,
    resumeAnalysisId: string,
    resumeScore: ResumeScore
  ): Promise<string> {
    try {
      const scoreData = {
        user_id: userId,
        resume_analysis_id: resumeAnalysisId,
        total_score: resumeScore.totalScore,
        skills_score: resumeScore.componentScores.skillsScore,
        projects_score: resumeScore.componentScores.projectsScore,
        experience_score: resumeScore.componentScores.experienceScore,
        education_score: resumeScore.componentScores.educationScore,
        quality_flag: resumeScore.qualityFlag,
        recommendations: resumeScore.recommendations,
      };

      const { data, error } = await supabase
        .from('resume_scores')
        .insert(scoreData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`Saved resume score ${data.id} for user ${userId}`);
      return data.id;
    } catch (error) {
      console.error('Error saving resume score:', error);
      throw error;
    }
  }

  /**
   * Get score history for user
   * Optimized with selective column fetching and pagination
   */
  async getScoreHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ResumeScoreRow[]> {
    try {
      const { data, error } = await supabase
        .from('resume_scores')
        .select('id, total_score, skills_score, projects_score, experience_score, education_score, quality_flag, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching score history:', error);
      throw error;
    }
  }

  /**
   * Get score by ID
   */
  async getScoreById(scoreId: string): Promise<ResumeScoreRow | null> {
    try {
      const { data, error } = await supabase
        .from('resume_scores')
        .select('*')
        .eq('id', scoreId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching score:', error);
      throw error;
    }
  }

  /**
   * Get score for resume analysis
   */
  async getScoreByResumeAnalysis(
    resumeAnalysisId: string
  ): Promise<ResumeScoreRow | null> {
    try {
      const { data, error } = await supabase
        .from('resume_scores')
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
      console.error('Error fetching score by resume analysis:', error);
      throw error;
    }
  }

  /**
   * Get score statistics for user
   */
  async getScoreStats(userId: string): Promise<{
    totalScores: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    recentImprovement: number;
    qualityDistribution: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('resume_scores')
        .select('total_score, quality_flag, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalScores: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          recentImprovement: 0,
          qualityDistribution: {},
        };
      }

      // Calculate statistics
      const scores = data.map(row => row.total_score);
      const totalScores = scores.length;
      const averageScore = Math.round(
        scores.reduce((sum, score) => sum + score, 0) / totalScores
      );
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);

      // Calculate recent improvement (last 3 vs previous 3)
      let recentImprovement = 0;
      if (data.length >= 6) {
        const recent3 = data.slice(0, 3).map(row => row.total_score);
        const previous3 = data.slice(3, 6).map(row => row.total_score);
        const recentAvg = recent3.reduce((sum, score) => sum + score, 0) / 3;
        const previousAvg = previous3.reduce((sum, score) => sum + score, 0) / 3;
        recentImprovement = Math.round(recentAvg - previousAvg);
      }

      // Quality distribution
      const qualityDistribution: Record<string, number> = {};
      data.forEach(row => {
        const quality = row.quality_flag;
        qualityDistribution[quality] = (qualityDistribution[quality] || 0) + 1;
      });

      return {
        totalScores,
        averageScore,
        highestScore,
        lowestScore,
        recentImprovement,
        qualityDistribution,
      };
    } catch (error) {
      console.error('Error calculating score stats:', error);
      throw error;
    }
  }

  /**
   * Get component score trends
   */
  async getComponentTrends(
    userId: string,
    limit: number = 10
  ): Promise<{
    dates: string[];
    skillsScores: number[];
    projectsScores: number[];
    experienceScores: number[];
    educationScores: number[];
  }> {
    try {
      const { data, error } = await supabase
        .from('resume_scores')
        .select('skills_score, projects_score, experience_score, education_score, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          dates: [],
          skillsScores: [],
          projectsScores: [],
          experienceScores: [],
          educationScores: [],
        };
      }

      return {
        dates: data.map(row => new Date(row.created_at).toLocaleDateString()),
        skillsScores: data.map(row => row.skills_score),
        projectsScores: data.map(row => row.projects_score),
        experienceScores: data.map(row => row.experience_score),
        educationScores: data.map(row => row.education_score),
      };
    } catch (error) {
      console.error('Error fetching component trends:', error);
      throw error;
    }
  }

  /**
   * Delete resume score
   */
  async deleteResumeScore(scoreId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('resume_scores')
        .delete()
        .eq('id', scoreId);

      if (error) {
        throw error;
      }

      console.log(`Deleted resume score ${scoreId}`);
    } catch (error) {
      console.error('Error deleting resume score:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const resumeScoreService = new ResumeScoreService();
