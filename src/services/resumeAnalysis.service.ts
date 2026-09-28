import { supabase } from '@/integrations/supabase/client';

// Interfaces for resume analysis service
export interface ResumeAnalysis {
  id?: string;
  user_id: string;
  resume_text: string;
  target_role?: string;
  experience_years?: number;
  analysis_result: Record<string, any>;
  created_at?: string;
}

export interface ResumeAnalysisRequest {
  user_id: string;
  resume_text: string;
  target_role?: string;
  experience_years?: number;
  skills?: string[];
  education_level?: string;
  certifications?: string[];
}

export interface ResumeAnalysisResult {
  skill_match_score: number;
  missing_skills: string[];
  matched_skills: string[];
  recommendations: string[];
  salary_estimate: {
    min: number;
    max: number;
    average: number;
  };
  improvement_suggestions: Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  ats_score: number;
  readability_score: number;
}

export interface ResumeComparisonResult {
  user_analysis: ResumeAnalysis;
  benchmark_analysis: {
    average_score: number;
    top_percentile_score: number;
    common_skills: string[];
    success_factors: string[];
  };
  improvement_potential: number;
  competitive_position: 'top' | 'above_average' | 'average' | 'below_average';
}

export class ResumeAnalysisService {
  /**
   * Save a resume analysis to the database
   */
  static async saveResumeAnalysis(analysis: Omit<ResumeAnalysis, 'id' | 'created_at'>): Promise<ResumeAnalysis> {
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .insert({
          user_id: analysis.user_id,
          resume_text: analysis.resume_text,
          target_role: analysis.target_role,
          experience_years: analysis.experience_years,
          analysis_result: analysis.analysis_result
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving resume analysis:', error);
        throw new Error(`Failed to save resume analysis: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in saveResumeAnalysis:', error);
      throw error;
    }
  }

  /**
   * Get resume analysis by user ID
   */
  static async getResumeAnalysisByUser(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ResumeAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching resume analyses by user:', error);
        throw new Error(`Failed to fetch resume analyses: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getResumeAnalysisByUser:', error);
      throw error;
    }
  }

  /**
   * Get the latest resume analysis for a user
   */
  static async getLatestResumeAnalysis(userId: string): Promise<ResumeAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching latest resume analysis:', error);
        throw new Error(`Failed to fetch latest resume analysis: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestResumeAnalysis:', error);
      throw error;
    }
  }

  /**
   * Get resume analysis by ID
   */
  static async getResumeAnalysisById(analysisId: string): Promise<ResumeAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching resume analysis by ID:', error);
        throw new Error(`Failed to fetch resume analysis: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getResumeAnalysisById:', error);
      throw error;
    }
  }

  /**
   * Update resume analysis
   */
  static async updateResumeAnalysis(
    analysisId: string,
    updates: Partial<Pick<ResumeAnalysis, 'target_role' | 'experience_years' | 'analysis_result'>>
  ): Promise<ResumeAnalysis> {
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .update(updates)
        .eq('id', analysisId)
        .select()
        .single();

      if (error) {
        console.error('Error updating resume analysis:', error);
        throw new Error(`Failed to update resume analysis: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateResumeAnalysis:', error);
      throw error;
    }
  }

  /**
   * Delete resume analysis
   */
  static async deleteResumeAnalysis(analysisId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('resume_analyses')
        .delete()
        .eq('id', analysisId);

      if (error) {
        console.error('Error deleting resume analysis:', error);
        throw new Error(`Failed to delete resume analysis: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteResumeAnalysis:', error);
      throw error;
    }
  }

  /**
   * Get resume analyses by target role
   */
  static async getResumeAnalysesByRole(
    targetRole: string,
    limit: number = 50
  ): Promise<ResumeAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('target_role', targetRole)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching resume analyses by role:', error);
        throw new Error(`Failed to fetch resume analyses by role: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getResumeAnalysesByRole:', error);
      throw error;
    }
  }

  /**
   * Get resume analysis statistics for a user
   */
  static async getUserAnalysisStats(userId: string): Promise<{
    totalAnalyses: number;
    averageScore: number;
    improvementTrend: number;
    topTargetRole: string | null;
    lastAnalysisDate: string | null;
  }> {
    try {
      const analyses = await this.getResumeAnalysisByUser(userId, 100);

      if (analyses.length === 0) {
        return {
          totalAnalyses: 0,
          averageScore: 0,
          improvementTrend: 0,
          topTargetRole: null,
          lastAnalysisDate: null
        };
      }

      const totalAnalyses = analyses.length;
      
      // Calculate average score from analysis results
      const scores = analyses
        .map(a => a.analysis_result?.skill_match_score || a.analysis_result?.matchScore || 0)
        .filter(score => score > 0);
      
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;

      // Calculate improvement trend (compare first and last analysis)
      let improvementTrend = 0;
      if (scores.length >= 2) {
        const firstScore = scores[scores.length - 1]; // Oldest
        const lastScore = scores[0]; // Newest
        improvementTrend = lastScore - firstScore;
      }

      // Find most common target role
      const roleCounts = analyses.reduce((acc, analysis) => {
        if (analysis.target_role) {
          acc[analysis.target_role] = (acc[analysis.target_role] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topTargetRole = Object.entries(roleCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

      const lastAnalysisDate = analyses[0]?.created_at || null;

      return {
        totalAnalyses,
        averageScore,
        improvementTrend,
        topTargetRole,
        lastAnalysisDate
      };
    } catch (error) {
      console.error('Error in getUserAnalysisStats:', error);
      throw error;
    }
  }

  /**
   * Compare user's resume analysis with benchmarks
   */
  static async compareWithBenchmarks(
    userId: string,
    targetRole?: string
  ): Promise<ResumeComparisonResult | null> {
    try {
      const userAnalysis = await this.getLatestResumeAnalysis(userId);
      if (!userAnalysis) {
        return null;
      }

      // Get benchmark data from similar analyses
      let benchmarkQuery = supabase
        .from('resume_analyses')
        .select('analysis_result, target_role');

      if (targetRole || userAnalysis.target_role) {
        benchmarkQuery = benchmarkQuery.eq('target_role', targetRole || userAnalysis.target_role);
      }

      const { data: benchmarkData, error } = await benchmarkQuery.limit(100);

      if (error) {
        console.error('Error fetching benchmark data:', error);
        throw new Error(`Failed to fetch benchmark data: ${error.message}`);
      }

      const benchmarkAnalyses = benchmarkData || [];
      
      if (benchmarkAnalyses.length === 0) {
        // No benchmark data available
        return {
          user_analysis: userAnalysis,
          benchmark_analysis: {
            average_score: 0,
            top_percentile_score: 0,
            common_skills: [],
            success_factors: []
          },
          improvement_potential: 0,
          competitive_position: 'average'
        };
      }

      // Calculate benchmark statistics
      const benchmarkScores = benchmarkAnalyses
        .map(a => a.analysis_result?.skill_match_score || a.analysis_result?.matchScore || 0)
        .filter(score => score > 0)
        .sort((a, b) => b - a);

      const averageScore = benchmarkScores.reduce((sum, score) => sum + score, 0) / benchmarkScores.length;
      const topPercentileScore = benchmarkScores[Math.floor(benchmarkScores.length * 0.1)] || averageScore;

      // Extract common skills
      const allSkills: string[] = [];
      benchmarkAnalyses.forEach(analysis => {
        const skills = analysis.analysis_result?.matched_skills || 
                      analysis.analysis_result?.matchedSkills || 
                      [];
        allSkills.push(...skills);
      });

      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commonSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([skill]) => skill);

      // Determine user's competitive position
      const userScore = userAnalysis.analysis_result?.skill_match_score || 
                       userAnalysis.analysis_result?.matchScore || 0;
      
      let competitivePosition: 'top' | 'above_average' | 'average' | 'below_average' = 'average';
      
      if (userScore >= topPercentileScore) {
        competitivePosition = 'top';
      } else if (userScore >= averageScore * 1.1) {
        competitivePosition = 'above_average';
      } else if (userScore >= averageScore * 0.9) {
        competitivePosition = 'average';
      } else {
        competitivePosition = 'below_average';
      }

      const improvementPotential = Math.max(0, topPercentileScore - userScore);

      return {
        user_analysis: userAnalysis,
        benchmark_analysis: {
          average_score: averageScore,
          top_percentile_score: topPercentileScore,
          common_skills: commonSkills,
          success_factors: [
            'Strong technical skills alignment',
            'Relevant project experience',
            'Clear career progression',
            'Industry certifications'
          ]
        },
        improvement_potential: improvementPotential,
        competitive_position: competitivePosition
      };
    } catch (error) {
      console.error('Error in compareWithBenchmarks:', error);
      throw error;
    }
  }

  /**
   * Get trending skills from recent analyses
   */
  static async getTrendingSkills(
    targetRole?: string,
    daysBack: number = 30,
    limit: number = 20
  ): Promise<Array<{ skill: string; frequency: number; trend: 'rising' | 'stable' | 'declining' }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      let query = supabase
        .from('resume_analyses')
        .select('analysis_result, target_role, created_at')
        .gte('created_at', startDate.toISOString());

      if (targetRole) {
        query = query.eq('target_role', targetRole);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching trending skills data:', error);
        throw new Error(`Failed to fetch trending skills: ${error.message}`);
      }

      const analyses = data || [];
      
      // Extract all skills from analyses
      const skillFrequency: Record<string, number> = {};
      
      analyses.forEach(analysis => {
        const skills = [
          ...(analysis.analysis_result?.matched_skills || []),
          ...(analysis.analysis_result?.matchedSkills || []),
          ...(analysis.analysis_result?.user_skills?.map((s: any) => s.name) || [])
        ];
        
        skills.forEach(skill => {
          if (typeof skill === 'string' && skill.trim()) {
            skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
          }
        });
      });

      // Sort by frequency and return top skills
      const trendingSkills = Object.entries(skillFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([skill, frequency]) => ({
          skill,
          frequency,
          trend: (frequency > 5 ? 'rising' : frequency > 2 ? 'stable' : 'declining') as 'rising' | 'stable' | 'declining'
        }));

      return trendingSkills;
    } catch (error) {
      console.error('Error in getTrendingSkills:', error);
      throw error;
    }
  }

  /**
   * Get analysis insights for dashboard
   */
  static async getAnalysisInsights(): Promise<{
    totalAnalyses: number;
    analysesThisMonth: number;
    averageScore: number;
    topTargetRoles: Array<{ role: string; count: number }>;
    recentAnalyses: ResumeAnalysis[];
  }> {
    try {
      // Get all analyses
      const { data: allAnalyses, error: allError } = await supabase
        .from('resume_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('Error fetching all analyses:', allError);
        throw new Error(`Failed to fetch analyses: ${allError.message}`);
      }

      const analyses = allAnalyses || [];
      const totalAnalyses = analyses.length;

      // Get analyses from this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const analysesThisMonth = analyses.filter(
        a => new Date(a.created_at!) >= thisMonth
      ).length;

      // Calculate average score
      const scores = analyses
        .map(a => a.analysis_result?.skill_match_score || a.analysis_result?.matchScore || 0)
        .filter(score => score > 0);
      
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;

      // Get top target roles
      const roleCounts = analyses.reduce((acc, analysis) => {
        if (analysis.target_role) {
          acc[analysis.target_role] = (acc[analysis.target_role] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topTargetRoles = Object.entries(roleCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([role, count]) => ({ role, count: count as number }));

      // Get recent analyses
      const recentAnalyses = analyses.slice(0, 10);

      return {
        totalAnalyses,
        analysesThisMonth,
        averageScore,
        topTargetRoles,
        recentAnalyses
      };
    } catch (error) {
      console.error('Error in getAnalysisInsights:', error);
      throw error;
    }
  }
}