import { supabase } from '../integrations/supabase/client';
import { TrendingSkill, TrendingSkillsData } from '../ai/types';
import { trendingSkillsAnalyzer } from '../ai/analyzer/trendingSkills';

/**
 * Trending Skills Service
 * Manages trending skills data in Supabase
 */

interface TrendingSkillRow {
  id: string;
  skill_name: string;
  target_role: string;
  demand_score: number;
  trend_direction: string;
  growth_rate: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export class TrendingSkillsService {
  /**
   * Update trending skills data (should be run weekly)
   */
  async updateTrendingSkills(role?: string): Promise<void> {
    try {
      console.log(`Updating trending skills for ${role || 'all roles'}...`);

      // Get trending skills data
      const trendingData = trendingSkillsAnalyzer.getTrendingSkillsData(role);

      // Store in database
      await this.storeTrendingData(trendingData);

      console.log(`Updated ${trendingData.skills.length} trending skills`);
    } catch (error) {
      console.error('Error updating trending skills:', error);
      throw error;
    }
  }

  /**
   * Store trending skills data in Supabase
   */
  async storeTrendingData(trendingData: TrendingSkillsData): Promise<void> {
    try {
      const rows = trendingData.skills.map(skill => ({
        skill_name: skill.skill,
        target_role: trendingData.role,
        demand_score: skill.demandScore,
        trend_direction: skill.trend,
        growth_rate: skill.growthRate,
        period_start: trendingData.period.start,
        period_end: trendingData.period.end,
      }));

      const { error } = await supabase
        .from('trending_skills')
        .upsert(rows, {
          onConflict: 'skill_name,target_role',
        });

      if (error) {
        throw error;
      }

      console.log(`Stored ${rows.length} trending skills in database`);
    } catch (error) {
      console.error('Error storing trending data:', error);
      throw error;
    }
  }

  /**
   * Get trending skills by role from database
   */
  async getTrendingSkillsByRole(
    role: string,
    limit: number = 20
  ): Promise<TrendingSkill[]> {
    try {
      const { data, error } = await supabase
        .from('trending_skills')
        .select('*')
        .eq('target_role', role)
        .order('demand_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        // Fallback to analyzer if no data in database
        return trendingSkillsAnalyzer.getTrendingSkills(role, limit);
      }

      return data.map(row => this.transformRowToTrendingSkill(row));
    } catch (error) {
      console.error('Error fetching trending skills by role:', error);
      // Fallback to analyzer
      return trendingSkillsAnalyzer.getTrendingSkills(role, limit);
    }
  }

  /**
   * Get all trending skills from database
   */
  async getAllTrendingSkills(limit: number = 20): Promise<TrendingSkill[]> {
    try {
      const { data, error } = await supabase
        .from('trending_skills')
        .select('*')
        .order('demand_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        // Fallback to analyzer if no data in database
        return trendingSkillsAnalyzer.getAllTrendingSkills(limit);
      }

      return data.map(row => this.transformRowToTrendingSkill(row));
    } catch (error) {
      console.error('Error fetching all trending skills:', error);
      // Fallback to analyzer
      return trendingSkillsAnalyzer.getAllTrendingSkills(limit);
    }
  }

  /**
   * Get trending skills by trend direction
   */
  async getTrendingSkillsByTrend(
    trend: 'rising' | 'stable' | 'declining',
    role?: string,
    limit: number = 20
  ): Promise<TrendingSkill[]> {
    try {
      let query = supabase
        .from('trending_skills')
        .select('*')
        .eq('trend_direction', trend)
        .order('demand_score', { ascending: false })
        .limit(limit);

      if (role) {
        query = query.eq('target_role', role);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        // Fallback to analyzer
        return trendingSkillsAnalyzer.getSkillsByTrend(trend, role);
      }

      return data.map(row => this.transformRowToTrendingSkill(row));
    } catch (error) {
      console.error('Error fetching trending skills by trend:', error);
      // Fallback to analyzer
      return trendingSkillsAnalyzer.getSkillsByTrend(trend, role);
    }
  }

  /**
   * Get emerging skills (high growth rate)
   */
  async getEmergingSkills(role?: string, limit: number = 10): Promise<TrendingSkill[]> {
    try {
      let query = supabase
        .from('trending_skills')
        .select('*')
        .eq('trend_direction', 'rising')
        .order('growth_rate', { ascending: false })
        .limit(limit);

      if (role) {
        query = query.eq('target_role', role);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        // Fallback to analyzer
        return trendingSkillsAnalyzer.getEmergingSkills(role, limit);
      }

      return data.map(row => this.transformRowToTrendingSkill(row));
    } catch (error) {
      console.error('Error fetching emerging skills:', error);
      // Fallback to analyzer
      return trendingSkillsAnalyzer.getEmergingSkills(role, limit);
    }
  }

  /**
   * Transform database row to TrendingSkill
   */
  private transformRowToTrendingSkill(row: any): TrendingSkill {
    return {
      skill: row.skill_name,
      demandScore: row.demand_score,
      trend: row.trend_direction,
      growthRate: row.growth_rate,
      relatedRoles: [row.target_role],
      category: 'technical', // Default category
    };
  }

  /**
   * Delete old trending skills data
   */
  async deleteOldTrendingData(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('trending_skills')
        .delete()
        .lt('period_end', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      console.log(`Deleted trending skills data older than ${daysOld} days`);
    } catch (error) {
      console.error('Error deleting old trending data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const trendingSkillsService = new TrendingSkillsService();
