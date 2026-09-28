import { skillDatabase } from '../../data/skills';
import { normalizeRole } from '../normalizeRole';
import { SkillMatch, SkillWithImportance, SkillData } from '../types';

/**
 * Skill Matcher Service
 * Compares user skills against role requirements with weighted scoring
 */

export class SkillMatcher {
  // Importance weight multipliers
  private readonly WEIGHTS = {
    critical: 2.0,
    important: 1.5,
    'nice-to-have': 1.0,
  };

  /**
   * Calculate skill match between user skills and target role
   */
  calculateSkillMatch(
    userSkills: string[],
    targetRole: string
  ): SkillMatch {
    const startTime = Date.now();

    // Normalize role to a valid database key
    targetRole = normalizeRole(targetRole);

    // Get role requirements from database
    let roleSkillSet = skillDatabase[targetRole];
    
    // Fallback to software_developer if role not found
    if (!roleSkillSet) {
      console.warn(`[SkillMatcher] Unknown role: ${targetRole}, falling back to software_developer`);
      roleSkillSet = skillDatabase['software_developer'];
      targetRole = 'software_developer';
    }
    
    // Final safety check — never throw, return empty match
    if (!roleSkillSet) {
      console.warn('[SkillMatcher] software_developer role not found in skill database, returning empty match');
      return {
        matchedSkills: [],
        missingSkills: [],
        matchScore: 0,
        targetRole,
        weightedMatchScore: 0,
        matchQuality: 'Poor',
      };
    }

    const requiredSkills = roleSkillSet.skills;

    // Normalize user skills for comparison
    const normalizedUserSkills = new Set(
      userSkills.map(skill => skill.toLowerCase().trim())
    );

    // Categorize skills
    const matchedSkills: SkillWithImportance[] = [];
    const missingSkills: SkillWithImportance[] = [];

    let totalWeightedScore = 0;
    let maxWeightedScore = 0;

    // Process each required skill
    requiredSkills.forEach(skillData => {
      const skillName = skillData.name;
      const importance = skillData.importance;
      const weight = this.WEIGHTS[importance];
      const category = skillData.category;

      maxWeightedScore += weight;

      // Check if user has this skill (including aliases)
      const hasSkill = this.userHasSkill(normalizedUserSkills, skillData);

      const skillWithImportance: SkillWithImportance = {
        skill: skillName,
        importance,
        weight,
        category,
      };

      if (hasSkill) {
        matchedSkills.push(skillWithImportance);
        totalWeightedScore += weight;
      } else {
        missingSkills.push(skillWithImportance);
      }
    });

    // Calculate match scores
    const matchScore = maxWeightedScore > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    const weightedMatchScore = maxWeightedScore > 0
      ? Math.round((totalWeightedScore / maxWeightedScore) * 100)
      : 0;

    // Determine match quality
    const matchQuality = this.determineMatchQuality(weightedMatchScore);

    // Performance check
    const duration = Date.now() - startTime;
    if (duration > 200) {
      console.warn(`Skill matching took ${duration}ms (target: 200ms)`);
    }

    return {
      matchedSkills,
      missingSkills,
      matchScore,
      targetRole,
      weightedMatchScore,
      matchQuality,
    };
  }

  /**
   * Check if user has a skill (including aliases)
   */
  private userHasSkill(
    userSkills: Set<string>,
    skillData: SkillData
  ): boolean {
    const skillName = skillData.name.toLowerCase().trim();
    
    // Check primary skill name
    if (userSkills.has(skillName)) {
      return true;
    }

    // Check aliases
    if (skillData.aliases) {
      for (const alias of skillData.aliases) {
        if (userSkills.has(alias.toLowerCase().trim())) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Determine match quality based on weighted score
   */
  private determineMatchQuality(
    weightedScore: number
  ): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
    if (weightedScore >= 80) return 'Excellent';
    if (weightedScore >= 60) return 'Good';
    if (weightedScore >= 40) return 'Fair';
    return 'Poor';
  }

  /**
   * Get skill gap analysis
   */
  getSkillGapAnalysis(skillMatch: SkillMatch): {
    criticalGaps: string[];
    importantGaps: string[];
    niceToHaveGaps: string[];
  } {
    const criticalGaps: string[] = [];
    const importantGaps: string[] = [];
    const niceToHaveGaps: string[] = [];

    skillMatch.missingSkills.forEach(skill => {
      switch (skill.importance) {
        case 'critical':
          criticalGaps.push(skill.skill);
          break;
        case 'important':
          importantGaps.push(skill.skill);
          break;
        case 'nice-to-have':
          niceToHaveGaps.push(skill.skill);
          break;
      }
    });

    return {
      criticalGaps,
      importantGaps,
      niceToHaveGaps,
    };
  }

  /**
   * Get matched skills by category
   */
  getMatchedSkillsByCategory(skillMatch: SkillMatch): Record<string, string[]> {
    const categorized: Record<string, string[]> = {};

    skillMatch.matchedSkills.forEach(skill => {
      const category = skill.category;
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(skill.skill);
    });

    return categorized;
  }

  /**
   * Calculate improvement potential
   */
  calculateImprovementPotential(skillMatch: SkillMatch): {
    currentScore: number;
    potentialScore: number;
    improvement: number;
    prioritySkills: string[];
  } {
    const currentScore = skillMatch.weightedMatchScore;
    
    // Calculate potential score if critical gaps are filled
    const criticalGaps = skillMatch.missingSkills.filter(
      s => s.importance === 'critical'
    );
    
    const criticalWeight = criticalGaps.reduce((sum, skill) => sum + skill.weight, 0);
    const totalWeight = skillMatch.matchedSkills.reduce((sum, skill) => sum + skill.weight, 0) +
                       skillMatch.missingSkills.reduce((sum, skill) => sum + skill.weight, 0);
    
    const potentialScore = totalWeight > 0
      ? Math.round(((skillMatch.matchedSkills.reduce((sum, skill) => sum + skill.weight, 0) + criticalWeight) / totalWeight) * 100)
      : 100;

    const improvement = potentialScore - currentScore;
    const prioritySkills = criticalGaps.map(s => s.skill);

    return {
      currentScore,
      potentialScore,
      improvement,
      prioritySkills,
    };
  }

  /**
   * Async wrapper for calculateSkillMatch (for compatibility)
   */
  async calculateMatch(
    userSkills: string[],
    targetRole: string
  ): Promise<SkillMatch> {
    return this.calculateSkillMatch(userSkills, targetRole);
  }

  /**
   * Get available roles
   */
  getAvailableRoles(): string[] {
    return Object.keys(skillDatabase);
  }

  /**
   * Validate role exists
   */
  isValidRole(role: string): boolean {
    return role in skillDatabase;
  }
}

// Export singleton instance
export const skillMatcher = new SkillMatcher();
