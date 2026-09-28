import { TrendingSkill, TrendingSkillsData, SkillCategory } from '../types';
import { skillDatabase } from '../../data/skills';

/**
 * Trending Skills Analyzer
 * Analyzes market trends and identifies trending skills
 */

export class TrendingSkillsAnalyzer {
  /**
   * Get trending skills for a specific role
   */
  getTrendingSkills(role: string, limit: number = 20): TrendingSkill[] {
    const roleSkillSet = skillDatabase[role];
    
    if (!roleSkillSet) {
      throw new Error(`Unknown role: ${role}`);
    }

    // Generate trending skills based on demand level and importance
    const trendingSkills: TrendingSkill[] = roleSkillSet.skills.map(skill => {
      const demandScore = this.calculateDemandScore(skill.demandLevel, skill.importance);
      const trend = this.determineTrend(skill.demandLevel);
      const growthRate = this.calculateGrowthRate(skill.demandLevel, trend);
      
      return {
        skill: skill.name,
        demandScore,
        trend,
        growthRate,
        relatedRoles: [role],
        category: skill.category,
        salaryImpact: this.estimateSalaryImpact(skill.importance, skill.demandLevel),
      };
    });

    // Sort by demand score (descending)
    trendingSkills.sort((a, b) => b.demandScore - a.demandScore);

    // Return top N skills
    return trendingSkills.slice(0, limit);
  }

  /**
   * Get trending skills across all roles
   */
  getAllTrendingSkills(limit: number = 20): TrendingSkill[] {
    const allSkills = new Map<string, TrendingSkill>();

    // Aggregate skills from all roles
    Object.entries(skillDatabase).forEach(([role, roleSkillSet]) => {
      roleSkillSet.skills.forEach(skill => {
        const skillName = skill.name;
        
        if (allSkills.has(skillName)) {
          // Skill exists, update related roles
          const existing = allSkills.get(skillName)!;
          if (!existing.relatedRoles.includes(role)) {
            existing.relatedRoles.push(role);
          }
          // Update demand score (take max)
          const newDemandScore = this.calculateDemandScore(skill.demandLevel, skill.importance);
          if (newDemandScore > existing.demandScore) {
            existing.demandScore = newDemandScore;
            existing.trend = this.determineTrend(skill.demandLevel);
            existing.growthRate = this.calculateGrowthRate(skill.demandLevel, existing.trend);
          }
        } else {
          // New skill
          const demandScore = this.calculateDemandScore(skill.demandLevel, skill.importance);
          const trend = this.determineTrend(skill.demandLevel);
          const growthRate = this.calculateGrowthRate(skill.demandLevel, trend);
          
          allSkills.set(skillName, {
            skill: skillName,
            demandScore,
            trend,
            growthRate,
            relatedRoles: [role],
            category: skill.category,
            salaryImpact: this.estimateSalaryImpact(skill.importance, skill.demandLevel),
          });
        }
      });
    });

    // Convert to array and sort
    const trendingSkills = Array.from(allSkills.values());
    trendingSkills.sort((a, b) => b.demandScore - a.demandScore);

    return trendingSkills.slice(0, limit);
  }

  /**
   * Get trending skills data with metadata
   */
  getTrendingSkillsData(role?: string, limit: number = 20): TrendingSkillsData {
    const skills = role 
      ? this.getTrendingSkills(role, limit)
      : this.getAllTrendingSkills(limit);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      role: role || 'All Roles',
      skills,
      period: {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString(),
      },
      lastUpdated: now.toISOString(),
    };
  }

  /**
   * Calculate demand score (0-100)
   */
  private calculateDemandScore(
    demandLevel: 'high' | 'medium' | 'low',
    importance: 'critical' | 'important' | 'nice-to-have'
  ): number {
    const demandScores = {
      high: 80,
      medium: 50,
      low: 30,
    };

    const importanceMultipliers = {
      critical: 1.25,
      important: 1.0,
      'nice-to-have': 0.8,
    };

    const baseScore = demandScores[demandLevel];
    const multiplier = importanceMultipliers[importance];

    return Math.min(Math.round(baseScore * multiplier), 100);
  }

  /**
   * Determine trend direction
   */
  private determineTrend(
    demandLevel: 'high' | 'medium' | 'low'
  ): 'rising' | 'stable' | 'declining' {
    // Simplified trend determination based on demand level
    // In a real system, this would analyze historical data
    
    if (demandLevel === 'high') {
      return 'rising';
    } else if (demandLevel === 'medium') {
      return 'stable';
    } else {
      return 'declining';
    }
  }

  /**
   * Calculate growth rate percentage
   */
  private calculateGrowthRate(
    demandLevel: 'high' | 'medium' | 'low',
    trend: 'rising' | 'stable' | 'declining'
  ): number {
    // Simplified growth rate calculation
    // In a real system, this would analyze historical data
    
    const baseRates = {
      rising: 15,
      stable: 0,
      declining: -10,
    };

    const demandMultipliers = {
      high: 1.5,
      medium: 1.0,
      low: 0.5,
    };

    const baseRate = baseRates[trend];
    const multiplier = demandMultipliers[demandLevel];

    return Math.round(baseRate * multiplier);
  }

  /**
   * Estimate salary impact
   */
  private estimateSalaryImpact(
    importance: 'critical' | 'important' | 'nice-to-have',
    demandLevel: 'high' | 'medium' | 'low'
  ): number {
    const importanceImpact = {
      critical: 15000,
      important: 10000,
      'nice-to-have': 5000,
    };

    const demandMultipliers = {
      high: 1.5,
      medium: 1.0,
      low: 0.7,
    };

    const baseImpact = importanceImpact[importance];
    const multiplier = demandMultipliers[demandLevel];

    return Math.round(baseImpact * multiplier);
  }

  /**
   * Get skills by trend direction
   */
  getSkillsByTrend(
    trend: 'rising' | 'stable' | 'declining',
    role?: string
  ): TrendingSkill[] {
    const skills = role 
      ? this.getTrendingSkills(role, 100)
      : this.getAllTrendingSkills(100);

    return skills.filter(skill => skill.trend === trend);
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(
    category: SkillCategory,
    role?: string
  ): TrendingSkill[] {
    const skills = role 
      ? this.getTrendingSkills(role, 100)
      : this.getAllTrendingSkills(100);

    return skills.filter(skill => skill.category === category);
  }

  /**
   * Compare skill trends between roles
   */
  compareRoleTrends(role1: string, role2: string): {
    commonSkills: TrendingSkill[];
    role1UniqueSkills: TrendingSkill[];
    role2UniqueSkills: TrendingSkill[];
  } {
    const role1Skills = this.getTrendingSkills(role1, 50);
    const role2Skills = this.getTrendingSkills(role2, 50);

    const role1SkillNames = new Set(role1Skills.map(s => s.skill));
    const role2SkillNames = new Set(role2Skills.map(s => s.skill));

    const commonSkills = role1Skills.filter(skill => role2SkillNames.has(skill.skill));
    const role1UniqueSkills = role1Skills.filter(skill => !role2SkillNames.has(skill.skill));
    const role2UniqueSkills = role2Skills.filter(skill => !role1SkillNames.has(skill.skill));

    return {
      commonSkills,
      role1UniqueSkills,
      role2UniqueSkills,
    };
  }

  /**
   * Get emerging skills (high growth rate)
   */
  getEmergingSkills(role?: string, limit: number = 10): TrendingSkill[] {
    const skills = role 
      ? this.getTrendingSkills(role, 100)
      : this.getAllTrendingSkills(100);

    // Filter for rising trend and sort by growth rate
    const emergingSkills = skills
      .filter(skill => skill.trend === 'rising')
      .sort((a, b) => b.growthRate - a.growthRate);

    return emergingSkills.slice(0, limit);
  }

  /**
   * Get high-value skills (high salary impact)
   */
  getHighValueSkills(role?: string, limit: number = 10): TrendingSkill[] {
    const skills = role 
      ? this.getTrendingSkills(role, 100)
      : this.getAllTrendingSkills(100);

    // Sort by salary impact
    const highValueSkills = skills
      .filter(skill => skill.salaryImpact !== undefined)
      .sort((a, b) => (b.salaryImpact || 0) - (a.salaryImpact || 0));

    return highValueSkills.slice(0, limit);
  }
}

// Export singleton instance
export const trendingSkillsAnalyzer = new TrendingSkillsAnalyzer();
