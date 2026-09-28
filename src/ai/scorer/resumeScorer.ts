import { ResumeScore, ComponentScores, ScoreBreakdown, ScoringFactors, ParsedResume, SkillMatch } from '../types';

/**
 * Resume Scorer Service
 * Calculates comprehensive resume scores with weighted components
 */

export class ResumeScorer {
  // Component weights (must sum to 100%)
  private readonly COMPONENT_WEIGHTS = {
    skills: 0.40,      // 40%
    projects: 0.25,    // 25%
    experience: 0.20,  // 20%
    education: 0.15,   // 15%
  };

  // Quality thresholds
  private readonly QUALITY_THRESHOLDS = {
    excellent: 80,
    competitive: 60,
  };

  /**
   * Calculate comprehensive resume score
   */
  calculateResumeScore(
    parsedResume: ParsedResume,
    skillMatch: SkillMatch
  ): ResumeScore {
    // Calculate component scores
    const skillsScore = this.calculateSkillsScore(skillMatch);
    const projectsScore = this.calculateProjectsScore(parsedResume);
    const experienceScore = this.calculateExperienceScore(parsedResume);
    const educationScore = this.calculateEducationScore(parsedResume);

    const componentScores: ComponentScores = {
      skillsScore,
      projectsScore,
      experienceScore,
      educationScore,
    };

    // Calculate weighted contributions
    const skillsContribution = skillsScore * this.COMPONENT_WEIGHTS.skills;
    const projectsContribution = projectsScore * this.COMPONENT_WEIGHTS.projects;
    const experienceContribution = experienceScore * this.COMPONENT_WEIGHTS.experience;
    const educationContribution = educationScore * this.COMPONENT_WEIGHTS.education;

    // Calculate total score
    const totalScore = Math.round(
      skillsContribution +
      projectsContribution +
      experienceContribution +
      educationContribution
    );

    // Calculate scoring factors
    const factors = this.calculateScoringFactors(parsedResume, skillMatch);

    // Create breakdown
    const breakdown: ScoreBreakdown = {
      skillsContribution: Math.round(skillsContribution),
      projectsContribution: Math.round(projectsContribution),
      experienceContribution: Math.round(experienceContribution),
      educationContribution: Math.round(educationContribution),
      factors,
    };

    // Determine quality flag
    const qualityFlag = this.determineQualityFlag(totalScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      componentScores,
      factors,
      qualityFlag
    );

    return {
      totalScore,
      componentScores,
      breakdown,
      qualityFlag,
      recommendations,
    };
  }

  /**
   * Calculate skills component score (0-100)
   */
  private calculateSkillsScore(skillMatch: SkillMatch): number {
    // Base score from weighted match — fall back to matchScore if weightedMatchScore is 0
    let score = skillMatch.weightedMatchScore > 0
      ? skillMatch.weightedMatchScore
      : skillMatch.matchScore;

    // Bonus for skill diversity (up to +10 points)
    const matchedCount = skillMatch.matchedSkills.length;
    
    if (matchedCount >= 15) {
      score += 10;
    } else if (matchedCount >= 10) {
      score += 7;
    } else if (matchedCount >= 5) {
      score += 5;
    }

    // Penalty for critical missing skills (-5 points each, max -20)
    const criticalMissing = skillMatch.missingSkills.filter(
      s => s.importance === 'critical'
    ).length;
    score -= Math.min(criticalMissing * 5, 20);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate projects component score (0-100)
   * Dynamic scoring based on actual project count and quality
   */
  private calculateProjectsScore(parsedResume: ParsedResume): number {
    const projectsSection = parsedResume.sections.projects;
    const resumeText = parsedResume.text || '';

    // If no section detected, fall back to scanning full resume text
    const content = projectsSection?.content ?? this.extractProjectsFromText(resumeText);

    if (!content || content.length === 0) {
      return 0;
    }

    let score = 0;

    // Project count (up to 50 points) - dynamic based on actual count
    const projectCount = this.estimateProjectCount(content);
    if (projectCount >= 5) {
      score += 50;
    } else if (projectCount >= 4) {
      score += 40;
    } else if (projectCount >= 3) {
      score += 30;
    } else if (projectCount >= 2) {
      score += 20;
    } else if (projectCount >= 1) {
      score += 10;
    }

    // Content quality (up to 30 points)
    const qualityScore = projectsSection?.qualityScore ?? this.calculateSectionQuality(content);
    score += qualityScore * 0.3;

    // Content length score (up to 20 points)
    const contentLength = content.length;
    if (contentLength > 1000) {
      score += 20;
    } else if (contentLength > 500) {
      score += 15;
    } else if (contentLength > 200) {
      score += 10;
    } else if (contentLength > 100) {
      score += 5;
    }

    return Math.round(Math.min(100, score));
  }

  /**
   * Fallback: extract project-like content from full resume text
   */
  private extractProjectsFromText(text: string): string {
    if (!text) return '';
    const lower = text.toLowerCase();
    const projectKeywords = ['developed', 'built', 'created', 'implemented', 'designed', 'deployed', 'github', 'project'];
    const lines = text.split('\n');
    const projectLines = lines.filter(line => {
      const l = line.toLowerCase();
      return projectKeywords.some(kw => l.includes(kw));
    });
    return projectLines.join('\n');
  }

  /**
   * Calculate experience component score (0-100)
   * Includes internships and dynamic scoring based on actual experience
   */
  private calculateExperienceScore(parsedResume: ParsedResume): number {
    const experienceSection = parsedResume.sections.experience;
    const resumeText = parsedResume.text || '';

    // If no section detected, fall back to scanning full resume text
    const content = experienceSection?.content ?? this.extractExperienceFromText(resumeText);

    if (!content || content.length === 0) {
      return 0;
    }

    let score = 0;
    const lowerContent = content.toLowerCase();
    const lowerText = resumeText.toLowerCase();

    // Check for internships (include in experience)
    const hasInternship = lowerText.includes('intern') || 
                        lowerText.includes('internship') || 
                        lowerText.includes('trainee') ||
                        lowerText.includes('internship program');

    // Experience count estimation (up to 40 points)
    const expCount = this.estimateExperienceCount(content);
    if (hasInternship) {
      // Bonus for having internship experience
      score += 10;
    }
    if (expCount >= 4) {
      score += 40;
    } else if (expCount >= 3) {
      score += 30;
    } else if (expCount >= 2) {
      score += 20;
    } else if (expCount >= 1) {
      score += 10;
    }

    // Experience level score (up to 30 points)
    switch (parsedResume.experienceLevel) {
      case 'Executive':
        score += 30;
        break;
      case 'Senior Level':
        score += 25;
        break;
      case 'Mid Level':
        score += 20;
        break;
      case 'Entry Level':
        score += 15;
        break;
    }

    // Content quality (up to 20 points)
    const qualityScore = experienceSection?.qualityScore ?? this.calculateSectionQuality(content);
    score += qualityScore * 0.2;

    // Content richness with action verbs (up to 10 points)
    const actionVerbs = ['developed', 'implemented', 'managed', 'led', 'created', 'designed', 'achieved', 'improved'];
    const verbCount = actionVerbs.filter(verb => lowerContent.includes(verb)).length;
    score += Math.min(verbCount * 2, 10);

    return Math.round(Math.min(100, score));
  }

  /**
   * Fallback: extract experience-like content from full resume text
   */
  private extractExperienceFromText(text: string): string {
    if (!text) return '';
    const experienceKeywords = ['intern', 'engineer', 'developer', 'analyst', 'manager', 'worked', 'employed', 'company', 'organization'];
    const lines = text.split('\n');
    const expLines = lines.filter(line => {
      const l = line.toLowerCase();
      return experienceKeywords.some(kw => l.includes(kw));
    });
    return expLines.join('\n');
  }

  /**
   * Calculate education component score (0-100)
   * Requirements:
   * - 10th standard mentioned = 33% of education score
   * - 12th standard mentioned = 33% of education score
   * - College/Graduation with marks = 33% of education score
   * - If only 1 mentioned = proportional score
   */
  private calculateEducationScore(parsedResume: ParsedResume): number {
    const educationSection = parsedResume.sections.education;
    const certificationsSection = parsedResume.sections.certifications;
    const resumeText = parsedResume.text || '';

    // If no section detected, fall back to scanning full resume text
    const eduContent = educationSection?.content ?? this.extractEducationFromText(resumeText);
    const lowerText = resumeText.toLowerCase();

    // Check for 10th standard (33%)
    const has10th = lowerText.includes('10th') || 
                   lowerText.includes('10th grade') || 
                   lowerText.includes('class 10') ||
                   lowerText.includes('ssc') ||
                   lowerText.includes('secondary school');

    // Check for 12th standard (33%)
    const has12th = lowerText.includes('12th') || 
                   lowerText.includes('12th grade') || 
                   lowerText.includes('class 12') ||
                   lowerText.includes('hsc') ||
                   lowerText.includes('higher secondary') ||
                   lowerText.includes('intermediate');

    // Check for College/Graduation with marks (33%)
    const hasCollege = lowerText.includes('bachelor') || 
                      lowerText.includes('b.tech') || 
                      lowerText.includes('btech') || 
                      lowerText.includes('b.e') || 
                      lowerText.includes('b.sc') ||
                      lowerText.includes('bsc') ||
                      lowerText.includes('master') || 
                      lowerText.includes('msc') || 
                      lowerText.includes('mba') ||
                      lowerText.includes('phd') || 
                      lowerText.includes('doctorate') ||
                      lowerText.includes('college') || 
                      lowerText.includes('university') ||
                      lowerText.includes('institute') ||
                      lowerText.includes('graduation') ||
                      lowerText.includes('degree');

    // Check if marks/CGPA/GPA are mentioned (for college score)
    const hasMarks = lowerText.includes('cgpa') || 
                    lowerText.includes('gpa') || 
                    lowerText.includes('percentage') || 
                    lowerText.includes('%') ||
                    lowerText.includes('marks') ||
                    lowerText.includes('score');

    let score = 0;
    let componentsFound = 0;

    // 10th standard: 33% (33 points)
    if (has10th) {
      score += 33;
      componentsFound++;
    }

    // 12th standard: 33% (33 points)
    if (has12th) {
      score += 33;
      componentsFound++;
    }

    // College/Graduation: 33% (33 points) - only if marks are mentioned
    if (hasCollege && hasMarks) {
      score += 33;
      componentsFound++;
    } else if (hasCollege) {
      // College without marks: partial credit (20 points)
      score += 20;
      componentsFound++;
    }

    // If only 1 component found, scale up to 100
    if (componentsFound === 1) {
      score = Math.min(100, score * 3);
    }
    // If 2 components found, scale up proportionally
    else if (componentsFound === 2) {
      score = Math.min(100, score * 1.5);
    }

    // Certifications bonus (up to 10 additional points)
    const certContent = certificationsSection?.content ?? '';
    if (certContent) {
      const certCount = this.estimateCertificationCount(certContent);
      if (certCount >= 3) {
        score += 10;
      } else if (certCount >= 1) {
        score += 5;
      }
    }

    return Math.round(Math.min(100, score));
  }

  /**
   * Fallback: extract education-like content from full resume text
   */
  private extractEducationFromText(text: string): string {
    if (!text) return '';
    const eduKeywords = ['bachelor', 'master', 'phd', 'b.tech', 'btech', 'b.e', 'msc', 'mba', 'university', 'college', 'institute', 'degree', 'cgpa', 'gpa', 'graduation'];
    const lines = text.split('\n');
    const eduLines = lines.filter(line => {
      const l = line.toLowerCase();
      return eduKeywords.some(kw => l.includes(kw));
    });
    return eduLines.join('\n');
  }

  /**
   * Calculate section quality score (mirrors parser logic, used as fallback)
   */
  private calculateSectionQuality(content: string): number {
    let score = 0;
    const length = content.length;
    if (length > 500) score += 40;
    else if (length > 200) score += 30;
    else if (length > 100) score += 20;
    else score += 10;
    if (/[•\-\*]/.test(content)) score += 15;
    if (/\d/.test(content)) score += 15;
    const keywords = ['developed', 'implemented', 'managed', 'created', 'designed', 'led', 'achieved'];
    const keywordCount = keywords.filter(kw => content.toLowerCase().includes(kw)).length;
    score += Math.min(keywordCount * 5, 30);
    return Math.min(score, 100);
  }

  /**
   * Calculate detailed scoring factors
   */
  private calculateScoringFactors(
    parsedResume: ParsedResume,
    skillMatch: SkillMatch
  ): ScoringFactors {
    const skillCount = skillMatch.matchedSkills.length;
    
    // Calculate skill diversity (unique categories)
    const categories = new Set(skillMatch.matchedSkills.map(s => s.category));
    const skillDiversity = Math.round((categories.size / 6) * 100); // 6 possible categories

    const projectCount = this.estimateProjectCount(
      parsedResume.sections.projects?.content || ''
    );

    const projectComplexity = this.estimateProjectComplexity(
      parsedResume.sections.projects?.content || ''
    );

    const experienceYears = this.estimateExperienceYears(parsedResume);

    const experienceRelevance = this.calculateExperienceRelevance(
      parsedResume,
      skillMatch
    );

    const educationLevel = this.calculateEducationLevel(parsedResume);

    const certificationsCount = this.estimateCertificationCount(
      parsedResume.sections.certifications?.content || ''
    );

    return {
      skillCount,
      skillDiversity,
      projectCount,
      projectComplexity,
      experienceYears,
      experienceRelevance,
      educationLevel,
      certificationsCount,
    };
  }

  /**
   * Estimate project count from content
   */
  private estimateProjectCount(content: string): number {
    if (!content) return 0;
    
    // Count bullet points or numbered items
    const bullets = (content.match(/[•\-\*]\s/g) || []).length;
    const numbers = (content.match(/^\d+\./gm) || []).length;
    
    return Math.max(bullets, numbers, 1);
  }

  /**
   * Estimate experience count from content
   */
  private estimateExperienceCount(content: string): number {
    if (!content) return 0;
    
    // Count bullet points or numbered items in experience section
    const bullets = (content.match(/[•\-\*]\s/g) || []).length;
    const numbers = (content.match(/^\d+\./gm) || []).length;
    
    // Also count job title keywords
    const jobKeywords = ['engineer', 'developer', 'analyst', 'manager', 'lead', 'director', 'intern', 'trainee'];
    const jobCount = jobKeywords.filter(kw => content.toLowerCase().includes(kw)).length;
    
    return Math.max(bullets, numbers, Math.floor(jobCount / 2), 1);
  }

  /**
   * Estimate project complexity
   */
  private estimateProjectComplexity(content: string): number {
    if (!content) return 0;
    
    const complexityKeywords = [
      'architecture', 'scalable', 'distributed', 'microservices',
      'optimization', 'algorithm', 'machine learning', 'ai',
      'cloud', 'deployment', 'ci/cd', 'testing'
    ];
    
    const lowerContent = content.toLowerCase();
    const keywordCount = complexityKeywords.filter(kw => lowerContent.includes(kw)).length;
    
    return Math.round((keywordCount / complexityKeywords.length) * 100);
  }

  /**
   * Estimate years of experience
   */
  private estimateExperienceYears(parsedResume: ParsedResume): number {
    const experienceMap = {
      'Entry Level': 1,
      'Mid Level': 3,
      'Senior Level': 7,
      'Executive': 12,
    };
    
    return experienceMap[parsedResume.experienceLevel] || 0;
  }

  /**
   * Calculate experience relevance
   */
  private calculateExperienceRelevance(
    parsedResume: ParsedResume,
    skillMatch: SkillMatch
  ): number {
    const experienceContent = parsedResume.sections.experience?.content.toLowerCase() || '';
    
    if (!experienceContent) return 0;
    
    // Check how many matched skills appear in experience section
    const matchedSkillsInExperience = skillMatch.matchedSkills.filter(skill =>
      experienceContent.includes(skill.skill.toLowerCase())
    ).length;
    
    const totalMatchedSkills = skillMatch.matchedSkills.length;
    
    return totalMatchedSkills > 0
      ? Math.round((matchedSkillsInExperience / totalMatchedSkills) * 100)
      : 0;
  }

  /**
   * Calculate education level score
   */
  private calculateEducationLevel(parsedResume: ParsedResume): number {
    const educationContent = parsedResume.sections.education?.content.toLowerCase() || '';
    
    if (!educationContent) return 0;
    
    if (educationContent.includes('phd') || educationContent.includes('doctorate')) {
      return 100;
    } else if (educationContent.includes('master') || educationContent.includes('msc') || educationContent.includes('mba')) {
      return 80;
    } else if (educationContent.includes('bachelor') || educationContent.includes('bsc') || educationContent.includes('btech')) {
      return 60;
    } else if (educationContent.includes('diploma') || educationContent.includes('associate')) {
      return 40;
    }
    
    return 20;
  }

  /**
   * Estimate certification count
   */
  private estimateCertificationCount(content: string): number {
    if (!content) return 0;
    
    const bullets = (content.match(/[•\-\*]\s/g) || []).length;
    const lines = content.split('\n').filter(line => line.trim().length > 10).length;
    
    return Math.max(bullets, Math.floor(lines / 2), 0);
  }

  /**
   * Determine quality flag
   */
  private determineQualityFlag(
    totalScore: number
  ): 'excellent' | 'competitive' | 'needs_improvement' {
    if (totalScore >= this.QUALITY_THRESHOLDS.excellent) {
      return 'excellent';
    } else if (totalScore >= this.QUALITY_THRESHOLDS.competitive) {
      return 'competitive';
    } else {
      return 'needs_improvement';
    }
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(
    componentScores: ComponentScores,
    factors: ScoringFactors,
    qualityFlag: string
  ): string[] {
    const recommendations: string[] = [];

    // Skills recommendations
    if (componentScores.skillsScore < 70) {
      if (factors.skillCount < 10) {
        recommendations.push('Add more relevant technical skills to your resume');
      }
      if (factors.skillDiversity < 50) {
        recommendations.push('Diversify your skill set across different categories');
      }
    }

    // Projects recommendations
    if (componentScores.projectsScore < 60) {
      if (factors.projectCount < 3) {
        recommendations.push('Include at least 3-5 significant projects');
      }
      if (factors.projectComplexity < 40) {
        recommendations.push('Highlight technical complexity and impact of your projects');
      }
    }

    // Experience recommendations
    if (componentScores.experienceScore < 60) {
      if (factors.experienceRelevance < 50) {
        recommendations.push('Emphasize relevant experience that showcases your skills');
      }
      recommendations.push('Use strong action verbs to describe your achievements');
    }

    // Education recommendations
    if (componentScores.educationScore < 50) {
      if (factors.certificationsCount === 0) {
        recommendations.push('Consider adding relevant certifications to strengthen your profile');
      }
    }

    // General recommendations based on quality
    if (qualityFlag === 'needs_improvement') {
      recommendations.push('Focus on quantifiable achievements and measurable impact');
      recommendations.push('Ensure your resume is well-structured with clear sections');
    }

    return recommendations;
  }
}

// Export singleton instance
export const resumeScorer = new ResumeScorer();
