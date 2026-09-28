import { supabase } from '@/integrations/supabase/client';

// Interfaces for analytics service
export interface SkillAnalytics {
  id?: string;
  skill_name: string;
  target_role: string;
  demand_score: number;
  salary_impact: number;
  learning_difficulty: number;
  market_trend: 'rising' | 'stable' | 'declining';
  related_skills: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PlacementAnalytics {
  id?: string;
  target_role: string;
  total_predictions: number;
  successful_placements: number;
  average_probability: number;
  success_rate: number;
  top_skills: string[];
  salary_range: {
    min: number;
    max: number;
    average: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface SkillTrendData {
  skill_name: string;
  demand_score: number;
  trend: 'rising' | 'stable' | 'declining';
  growth_rate: number;
  related_roles: string[];
}

export interface PlacementTrendData {
  role: string;
  success_rate: number;
  average_probability: number;
  total_predictions: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface RoleAnalytics {
  role: string;
  totalCandidates: number;
  averageSuccessRate: number;
  topSkills: Array<{ skill: string; importance: number }>;
  salaryRange: { min: number; max: number; average: number };
  demandLevel: 'high' | 'medium' | 'low';
}

export class AnalyticsService {
  /**
   * Get skill analytics for a specific role or all roles
   */
  static async getSkillAnalytics(role?: string): Promise<SkillAnalytics[]> {
    try {
      let query = supabase
        .from('skill_analytics')
        .select('*')
        .order('demand_score', { ascending: false });

      if (role) {
        query = query.eq('target_role', role);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching skill analytics:', error);
        throw new Error(`Failed to fetch skill analytics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSkillAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get placement analytics for all roles or specific role
   */
  static async getPlacementAnalytics(role?: string): Promise<PlacementAnalytics[]> {
    try {
      let query = supabase
        .from('placement_analytics')
        .select('*')
        .order('success_rate', { ascending: false });

      if (role) {
        query = query.eq('target_role', role);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching placement analytics:', error);
        throw new Error(`Failed to fetch placement analytics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPlacementAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get placement trends over time
   */
  static async getPlacementTrends(
    startDate?: string,
    endDate?: string,
    role?: string
  ): Promise<PlacementTrendData[]> {
    try {
      // Build the query to get placement predictions with date filtering
      let query = supabase
        .from('placement_predictions')
        .select('target_role, predicted_probability, confidence_score, created_at');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      if (role) {
        query = query.eq('target_role', role);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching placement trends:', error);
        throw new Error(`Failed to fetch placement trends: ${error.message}`);
      }

      // Process the data to calculate trends
      const roleGroups = (data || []).reduce((acc, prediction) => {
        const role = prediction.target_role;
        if (!acc[role]) {
          acc[role] = [];
        }
        acc[role].push(prediction);
        return acc;
      }, {} as Record<string, any[]>);

      const trends: PlacementTrendData[] = Object.entries(roleGroups).map(([role, predictions]) => {
        const totalPredictions = (predictions as any[]).length;
        const averageProbability = (predictions as any[]).reduce((sum, p) => sum + p.predicted_probability, 0) / totalPredictions;
        const successRate = (predictions as any[]).filter(p => p.predicted_probability > 0.7).length / totalPredictions;

        // Simple trend calculation (could be enhanced with time-series analysis)
        const trend = successRate > 0.6 ? 'improving' : successRate > 0.4 ? 'stable' : 'declining';

        return {
          role,
          success_rate: successRate,
          average_probability: averageProbability,
          total_predictions: totalPredictions,
          trend: trend as 'improving' | 'stable' | 'declining'
        };
      });

      return trends;
    } catch (error) {
      console.error('Error in getPlacementTrends:', error);
      throw error;
    }
  }

  /**
   * Get skill trends and demand analysis
   */
  static async getSkillTrends(limit: number = 20): Promise<SkillTrendData[]> {
    try {
      const { data, error } = await supabase
        .from('skill_analytics')
        .select('skill_name, demand_score, market_trend, related_skills')
        .order('demand_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching skill trends:', error);
        throw new Error(`Failed to fetch skill trends: ${error.message}`);
      }

      // Get related roles for each skill from placement predictions
      const skillTrends: SkillTrendData[] = await Promise.all(
        (data || []).map(async (skill) => {
          // Get roles where this skill is commonly found
          const { data: roleData } = await supabase
            .from('placement_predictions')
            .select('target_role')
            .contains('input_features', { skills: [skill.skill_name] })
            .limit(10);

          const relatedRoles = [...new Set((roleData || []).map(r => r.target_role))];

          return {
            skill_name: skill.skill_name,
            demand_score: skill.demand_score,
            trend: skill.market_trend,
            growth_rate: this.calculateGrowthRate(skill.market_trend),
            related_roles: relatedRoles
          };
        })
      );

      return skillTrends;
    } catch (error) {
      console.error('Error in getSkillTrends:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive role analytics
   */
  static async getRoleAnalytics(role: string): Promise<RoleAnalytics | null> {
    try {
      // Get placement data for the role
      const { data: placementData, error: placementError } = await supabase
        .from('placement_predictions')
        .select('predicted_probability, input_features')
        .eq('target_role', role);

      if (placementError) {
        console.error('Error fetching placement data for role analytics:', placementError);
        throw new Error(`Failed to fetch placement data: ${placementError.message}`);
      }

      if (!placementData || placementData.length === 0) {
        return null;
      }

      const totalCandidates = placementData.length;
      const averageSuccessRate = placementData.reduce((sum, p) => sum + p.predicted_probability, 0) / totalCandidates;

      // Extract skills from input features
      const allSkills: string[] = [];
      placementData.forEach(p => {
        if (p.input_features?.skills) {
          allSkills.push(...p.input_features.skills);
        }
      });

      // Count skill frequency
      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([skill, count]) => ({
          skill,
          importance: count / totalCandidates
        }));

      // Get salary data from placement analytics
      const { data: salaryData } = await supabase
        .from('placement_analytics')
        .select('salary_range')
        .eq('target_role', role)
        .single();

      const salaryRange = salaryData?.salary_range || { min: 0, max: 0, average: 0 };

      // Determine demand level based on success rate and candidate count
      let demandLevel: 'high' | 'medium' | 'low' = 'low';
      if (averageSuccessRate > 0.7 && totalCandidates > 50) {
        demandLevel = 'high';
      } else if (averageSuccessRate > 0.5 || totalCandidates > 20) {
        demandLevel = 'medium';
      }

      return {
        role,
        totalCandidates,
        averageSuccessRate,
        topSkills,
        salaryRange,
        demandLevel
      };
    } catch (error) {
      console.error('Error in getRoleAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get dashboard summary statistics
   */
  static async getDashboardStats(): Promise<{
    totalPredictions: number;
    averageSuccessRate: number;
    topPerformingRoles: string[];
    trendingSkills: string[];
    recentActivity: number;
  }> {
    try {
      // Get total predictions
      const { count: totalPredictions, error: countError } = await supabase
        .from('placement_predictions')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting prediction count:', countError);
        throw new Error(`Failed to get prediction count: ${countError.message}`);
      }

      // Get average success rate
      const { data: predictionData, error: predictionError } = await supabase
        .from('placement_predictions')
        .select('predicted_probability');

      if (predictionError) {
        console.error('Error fetching predictions for stats:', predictionError);
        throw new Error(`Failed to fetch predictions: ${predictionError.message}`);
      }

      const averageSuccessRate = predictionData && predictionData.length > 0
        ? predictionData.reduce((sum, p) => sum + p.predicted_probability, 0) / predictionData.length
        : 0;

      // Get top performing roles
      const placementAnalytics = await this.getPlacementAnalytics();
      const topPerformingRoles = placementAnalytics
        .sort((a, b) => b.success_rate - a.success_rate)
        .slice(0, 5)
        .map(p => p.target_role);

      // Get trending skills
      const skillAnalytics = await this.getSkillAnalytics();
      const trendingSkills = skillAnalytics
        .filter(s => s.market_trend === 'rising')
        .sort((a, b) => b.demand_score - a.demand_score)
        .slice(0, 5)
        .map(s => s.skill_name);

      // Get recent activity (predictions in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentActivity, error: recentError } = await supabase
        .from('placement_predictions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) {
        console.error('Error getting recent activity:', recentError);
        throw new Error(`Failed to get recent activity: ${recentError.message}`);
      }

      return {
        totalPredictions: totalPredictions || 0,
        averageSuccessRate,
        topPerformingRoles,
        trendingSkills,
        recentActivity: recentActivity || 0
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }

  /**
   * Get user-specific dashboard summary statistics
   */
  static async getUserDashboardStats(userId: string): Promise<{
    totalPredictions: number;
    averageSuccessRate: number;
    topPerformingRoles: string[];
    trendingSkills: string[];
    recentActivity: number;
  }> {
    try {
      // Get total predictions for user
      const { count: totalPredictions, error: countError } = await supabase
        .from('placement_predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        console.error('Error getting user prediction count:', countError);
        throw new Error(`Failed to get user prediction count: ${countError.message}`);
      }

      // Get average success rate for user
      const { data: predictionData, error: predictionError } = await supabase
        .from('placement_predictions')
        .select('predicted_probability')
        .eq('user_id', userId);

      if (predictionError) {
        console.error('Error fetching user predictions for stats:', predictionError);
        throw new Error(`Failed to fetch user predictions: ${predictionError.message}`);
      }

      const averageSuccessRate = predictionData && predictionData.length > 0
        ? predictionData.reduce((sum, p) => sum + p.predicted_probability, 0) / predictionData.length
        : 0;

      // Get user's top roles (from their predictions)
      const { data: roleData, error: roleError } = await supabase
        .from('placement_predictions')
        .select('target_role, predicted_probability')
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error fetching user roles:', roleError);
        throw new Error(`Failed to fetch user roles: ${roleError.message}`);
      }

      // Calculate average probability per role for this user
      const roleStats = roleData?.reduce((acc: any, pred) => {
        if (!acc[pred.target_role]) {
          acc[pred.target_role] = { total: 0, count: 0 };
        }
        acc[pred.target_role].total += pred.predicted_probability;
        acc[pred.target_role].count += 1;
        return acc;
      }, {}) || {};

      const topPerformingRoles = Object.entries(roleStats)
        .map(([role, stats]: [string, any]) => ({
          role,
          avgProbability: stats.total / stats.count
        }))
        .sort((a, b) => b.avgProbability - a.avgProbability)
        .slice(0, 5)
        .map(r => r.role);

      // Get trending skills (global data since user-specific trending is complex)
      const skillAnalytics = await this.getSkillAnalytics();
      const trendingSkills = skillAnalytics
        .filter(s => s.market_trend === 'rising')
        .sort((a, b) => b.demand_score - a.demand_score)
        .slice(0, 5)
        .map(s => s.skill_name);

      // Get recent activity for user (predictions in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentActivity, error: recentError } = await supabase
        .from('placement_predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) {
        console.error('Error getting user recent activity:', recentError);
        throw new Error(`Failed to get user recent activity: ${recentError.message}`);
      }

      return {
        totalPredictions: totalPredictions || 0,
        averageSuccessRate,
        topPerformingRoles,
        trendingSkills,
        recentActivity: recentActivity || 0
      };
    } catch (error) {
      console.error('Error in getUserDashboardStats:', error);
      throw error;
    }
  }

  /**
   * Get skill gap analysis for a specific role
   */
  static async getSkillGapAnalysis(role: string): Promise<{
    criticalSkills: Array<{ skill: string; gap_percentage: number }>;
    emergingSkills: Array<{ skill: string; growth_rate: number }>;
    recommendations: string[];
  }> {
    try {
      // Get skill analytics for the role
      const skillAnalytics = await this.getSkillAnalytics(role);
      
      // Get placement predictions to analyze skill gaps
      const { data: predictions, error } = await supabase
        .from('placement_predictions')
        .select('input_features, predicted_probability')
        .eq('target_role', role);

      if (error) {
        console.error('Error fetching predictions for skill gap analysis:', error);
        throw new Error(`Failed to fetch predictions: ${error.message}`);
      }

      // Analyze skill gaps
      const skillPresence: Record<string, { present: number; total: number }> = {};
      
      (predictions || []).forEach(p => {
        const skills = p.input_features?.skills || [];
        skillAnalytics.forEach(sa => {
          if (!skillPresence[sa.skill_name]) {
            skillPresence[sa.skill_name] = { present: 0, total: 0 };
          }
          skillPresence[sa.skill_name].total++;
          if (skills.includes(sa.skill_name)) {
            skillPresence[sa.skill_name].present++;
          }
        });
      });

      const criticalSkills = Object.entries(skillPresence)
        .map(([skill, data]) => ({
          skill,
          gap_percentage: ((data.total - data.present) / data.total) * 100
        }))
        .filter(s => s.gap_percentage > 50)
        .sort((a, b) => b.gap_percentage - a.gap_percentage)
        .slice(0, 10);

      const emergingSkills = skillAnalytics
        .filter(s => s.market_trend === 'rising')
        .map(s => ({
          skill: s.skill_name,
          growth_rate: this.calculateGrowthRate(s.market_trend)
        }))
        .slice(0, 5);

      const recommendations = [
        `Focus on ${criticalSkills[0]?.skill || 'core skills'} - highest skill gap identified`,
        `Consider learning ${emergingSkills[0]?.skill || 'trending skills'} for future opportunities`,
        `Build projects showcasing ${role} skills to improve placement probability`
      ];

      return {
        criticalSkills,
        emergingSkills,
        recommendations
      };
    } catch (error) {
      console.error('Error in getSkillGapAnalysis:', error);
      throw error;
    }
  }

  /**
   * Helper method to calculate growth rate from trend
   */
  private static calculateGrowthRate(trend: 'rising' | 'stable' | 'declining'): number {
    switch (trend) {
      case 'rising':
        return Math.random() * 20 + 10; // 10-30% growth
      case 'stable':
        return Math.random() * 10 - 5; // -5% to +5% growth
      case 'declining':
        return -(Math.random() * 15 + 5); // -5% to -20% growth
      default:
        return 0;
    }
  }

  /**
   * Get comparative analytics between roles
   */
  static async getComparativeRoleAnalytics(roles: string[]): Promise<Array<{
    role: string;
    successRate: number;
    averageSalary: number;
    demandScore: number;
    skillComplexity: number;
  }>> {
    try {
      const comparativeData = await Promise.all(
        roles.map(async (role) => {
          const roleAnalytics = await this.getRoleAnalytics(role);
          const placementAnalytics = await this.getPlacementAnalytics(role);
          
          const roleData = placementAnalytics[0];
          
          return {
            role,
            successRate: roleAnalytics?.averageSuccessRate || 0,
            averageSalary: roleData?.salary_range?.average || 0,
            demandScore: roleAnalytics?.demandLevel === 'high' ? 90 : 
                        roleAnalytics?.demandLevel === 'medium' ? 60 : 30,
            skillComplexity: roleAnalytics?.topSkills?.length || 0
          };
        })
      );

      return comparativeData;
    } catch (error) {
      console.error('Error in getComparativeRoleAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get resume score data for user
   */
  static async getResumeScoreData(userId: string): Promise<{
    latestScore: number;
    componentScores: { skills: number; projects: number; experience: number; education: number };
    qualityFlag: string;
    recommendations: string[];
    scoreHistory: Array<{ date: string; score: number }>;
  } | null> {
    try {
      // Get latest resume score
      const { data: latestScoreData, error: scoreError } = await supabase
        .from('resume_scores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (scoreError && scoreError.code !== 'PGRST116') {
        console.error('Error fetching resume score:', scoreError);
        throw new Error(`Failed to fetch resume score: ${scoreError.message}`);
      }

      if (!latestScoreData) {
        return null;
      }

      // Get score history (last 10 scores)
      const { data: historyData, error: historyError } = await supabase
        .from('resume_scores')
        .select('total_score, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (historyError) {
        console.error('Error fetching score history:', historyError);
      }

      const scoreHistory = (historyData || []).map(item => ({
        date: new Date(item.created_at).toLocaleDateString(),
        score: item.total_score
      }));

      return {
        latestScore: latestScoreData.total_score,
        componentScores: {
          skills: latestScoreData.skills_score,
          projects: latestScoreData.projects_score,
          experience: latestScoreData.experience_score,
          education: latestScoreData.education_score
        },
        qualityFlag: latestScoreData.quality_flag,
        recommendations: latestScoreData.recommendations || [],
        scoreHistory
      };
    } catch (error) {
      console.error('Error in getResumeScoreData:', error);
      throw error;
    }
  }

  /**
   * Get skill match data for user
   */
  static async getSkillMatchData(userId: string): Promise<{
    matchScore: number;
    weightedMatchScore: number;
    matchQuality: string;
    matchedSkills: string[];
    missingSkills: string[];
    targetRole: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('skill_matches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching skill match:', error);
        throw new Error(`Failed to fetch skill match: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return {
        matchScore: data.match_score,
        weightedMatchScore: data.weighted_match_score,
        matchQuality: data.match_quality,
        matchedSkills: data.matched_skills || [],
        missingSkills: data.missing_skills || [],
        targetRole: data.target_role
      };
    } catch (error) {
      console.error('Error in getSkillMatchData:', error);
      throw error;
    }
  }

  /**
   * Get component scores data for visualization
   */
  static async getComponentScoresData(userId: string): Promise<Array<{
    component: string;
    score: number;
    weight: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('resume_scores')
        .select('skills_score, projects_score, experience_score, education_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching component scores:', error);
        throw new Error(`Failed to fetch component scores: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return [
        { component: 'Skills', score: data.skills_score, weight: 40 },
        { component: 'Projects', score: data.projects_score, weight: 25 },
        { component: 'Experience', score: data.experience_score, weight: 20 },
        { component: 'Education', score: data.education_score, weight: 15 }
      ];
    } catch (error) {
      console.error('Error in getComponentScoresData:', error);
      throw error;
    }
  }

  /**
   * Get trending skills by role from database
   */
  static async getTrendingSkillsByRole(role?: string): Promise<Array<{
    skillName: string;
    demandScore: number;
    trendDirection: string;
    growthRate: number;
  }>> {
    try {
      let query = supabase
        .from('trending_skills')
        .select('skill_name, demand_score, trend_direction, growth_rate')
        .order('demand_score', { ascending: false })
        .limit(20);

      if (role) {
        query = query.eq('target_role', role);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching trending skills:', error);
        throw new Error(`Failed to fetch trending skills: ${error.message}`);
      }

      return (data || []).map(item => ({
        skillName: item.skill_name,
        demandScore: item.demand_score,
        trendDirection: item.trend_direction,
        growthRate: item.growth_rate
      }));
    } catch (error) {
      console.error('Error in getTrendingSkillsByRole:', error);
      throw error;
    }
  }

  /**
   * Get skill distribution by category for user
   */
  static async getSkillDistribution(userId: string): Promise<Array<{
    category: string;
    count: number;
  }>> {
    try {
      // Get user's matched skills
      const { data: matchData, error: matchError } = await supabase
        .from('skill_matches')
        .select('matched_skills')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (matchError && matchError.code !== 'PGRST116') {
        console.error('Error fetching skill match for distribution:', matchError);
        throw new Error(`Failed to fetch skill match: ${matchError.message}`);
      }

      if (!matchData || !matchData.matched_skills) {
        return [];
      }

      // Get skill categories from skill_database
      const { data: skillData, error: skillError } = await supabase
        .from('skill_database')
        .select('skill_name, category')
        .in('skill_name', matchData.matched_skills);

      if (skillError) {
        console.error('Error fetching skill categories:', skillError);
        throw new Error(`Failed to fetch skill categories: ${skillError.message}`);
      }

      // Count skills by category
      const categoryCount = (skillData || []).reduce((acc, skill) => {
        acc[skill.category] = (acc[skill.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count
      }));
    } catch (error) {
      console.error('Error in getSkillDistribution:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
