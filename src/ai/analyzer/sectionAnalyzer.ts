import compromise from 'compromise';
import { SectionAnalysis, SectionQualityScore, SectionRecommendation, ParsedResume } from '../types';

/**
 * Section Analyzer Service
 * Analyzes resume sections for completeness and quality
 */

export class SectionAnalyzer {
  // Required sections for a complete resume
  private readonly REQUIRED_SECTIONS = ['skills', 'experience', 'education'];
  
  // Optional but recommended sections
  private readonly RECOMMENDED_SECTIONS = ['projects', 'certifications', 'summary'];

  // Section-specific keywords for quality assessment
  private readonly SECTION_KEYWORDS = {
    skills: ['proficient', 'experienced', 'expert', 'knowledge', 'familiar'],
    projects: ['developed', 'built', 'created', 'implemented', 'designed', 'deployed'],
    experience: ['managed', 'led', 'achieved', 'improved', 'increased', 'reduced'],
    education: ['degree', 'bachelor', 'master', 'university', 'college', 'gpa'],
    certifications: ['certified', 'certification', 'license', 'credential'],
    summary: ['professional', 'experienced', 'skilled', 'passionate', 'dedicated'],
  };

  /**
   * Analyze resume sections
   */
  analyzeSections(parsedResume: ParsedResume): SectionAnalysis {
    const detectedSections = this.getDetectedSections(parsedResume);
    const missingSections = this.getMissingSections(detectedSections);
    const sectionQuality = this.analyzeSectionQuality(parsedResume);
    const completeness = this.calculateCompleteness(detectedSections);
    const recommendations = this.generateRecommendations(
      detectedSections,
      missingSections,
      sectionQuality
    );

    return {
      detectedSections,
      missingSections,
      sectionQuality,
      completeness,
      recommendations,
    };
  }

  /**
   * Get list of detected sections
   */
  private getDetectedSections(parsedResume: ParsedResume): string[] {
    const sections: string[] = [];
    
    if (parsedResume.sections.skills) sections.push('skills');
    if (parsedResume.sections.projects) sections.push('projects');
    if (parsedResume.sections.experience) sections.push('experience');
    if (parsedResume.sections.education) sections.push('education');
    if (parsedResume.sections.certifications) sections.push('certifications');
    if (parsedResume.sections.summary) sections.push('summary');

    return sections;
  }

  /**
   * Get list of missing sections
   */
  private getMissingSections(detectedSections: string[]): string[] {
    const allImportantSections = [...this.REQUIRED_SECTIONS, ...this.RECOMMENDED_SECTIONS];
    return allImportantSections.filter(section => !detectedSections.includes(section));
  }

  /**
   * Analyze quality of each section
   */
  private analyzeSectionQuality(parsedResume: ParsedResume): Record<string, SectionQualityScore> {
    const quality: Record<string, SectionQualityScore> = {};

    // Analyze each detected section
    Object.entries(parsedResume.sections).forEach(([sectionName, sectionContent]) => {
      if (sectionContent) {
        quality[sectionName] = this.assessSectionQuality(
          sectionName,
          sectionContent.content
        );
      }
    });

    return quality;
  }

  /**
   * Assess quality of a single section
   */
  private assessSectionQuality(sectionName: string, content: string): SectionQualityScore {
    const contentLength = content.length;
    const issues: string[] = [];

    // Content length score (0-40 points)
    let lengthScore = 0;
    if (contentLength < 50) {
      lengthScore = 10;
      issues.push('Section is too short - add more details');
    } else if (contentLength < 150) {
      lengthScore = 20;
      issues.push('Section could be more detailed');
    } else if (contentLength < 300) {
      lengthScore = 30;
    } else {
      lengthScore = 40;
    }

    // Keyword presence score (0-30 points)
    const keywordScore = this.calculateKeywordScore(sectionName, content);
    if (keywordScore < 15) {
      issues.push('Use more action verbs and descriptive keywords');
    }

    // Structure score (0-30 points)
    const structureScore = this.calculateStructureScore(content);
    if (structureScore < 15) {
      issues.push('Improve formatting with bullet points or clear structure');
    }

    const totalScore = lengthScore + keywordScore + structureScore;

    return {
      section: sectionName,
      score: totalScore,
      contentLength,
      keywordScore,
      structureScore,
      issues,
    };
  }

  /**
   * Calculate keyword presence score
   */
  private calculateKeywordScore(sectionName: string, content: string): number {
    const keywords = this.SECTION_KEYWORDS[sectionName as keyof typeof this.SECTION_KEYWORDS] || [];
    const lowerContent = content.toLowerCase();
    
    let score = 0;
    keywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        score += 5;
      }
    });

    return Math.min(score, 30);
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(content: string): number {
    let score = 0;

    // Check for bullet points
    const hasBullets = /[•\-\*]/.test(content);
    if (hasBullets) score += 10;

    // Check for numbers/quantification
    const hasNumbers = /\d+/.test(content);
    if (hasNumbers) score += 10;

    // Check for proper capitalization
    const hasCapitalization = /[A-Z]/.test(content);
    if (hasCapitalization) score += 5;

    // Check for complete sentences
    const hasPeriods = /\./.test(content);
    if (hasPeriods) score += 5;

    return Math.min(score, 30);
  }

  /**
   * Calculate overall completeness percentage
   */
  private calculateCompleteness(detectedSections: string[]): number {
    const totalImportantSections = this.REQUIRED_SECTIONS.length + this.RECOMMENDED_SECTIONS.length;
    const detectedImportantSections = detectedSections.filter(section =>
      this.REQUIRED_SECTIONS.includes(section) || this.RECOMMENDED_SECTIONS.includes(section)
    ).length;

    return Math.round((detectedImportantSections / totalImportantSections) * 100);
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(
    detectedSections: string[],
    missingSections: string[],
    sectionQuality: Record<string, SectionQualityScore>
  ): SectionRecommendation[] {
    const recommendations: SectionRecommendation[] = [];

    // Recommendations for missing required sections
    missingSections.forEach(section => {
      if (this.REQUIRED_SECTIONS.includes(section)) {
        recommendations.push({
          section,
          priority: 'high',
          message: `Missing required section: ${section}`,
          action: `Add a ${section} section to your resume`,
        });
      } else if (this.RECOMMENDED_SECTIONS.includes(section)) {
        recommendations.push({
          section,
          priority: 'medium',
          message: `Missing recommended section: ${section}`,
          action: `Consider adding a ${section} section to strengthen your resume`,
        });
      }
    });

    // Recommendations for low-quality sections
    Object.entries(sectionQuality).forEach(([section, quality]) => {
      if (quality.score < 50) {
        recommendations.push({
          section,
          priority: 'high',
          message: `${section} section needs improvement (score: ${quality.score}/100)`,
          action: quality.issues.join('; '),
        });
      } else if (quality.score < 70) {
        recommendations.push({
          section,
          priority: 'medium',
          message: `${section} section could be enhanced (score: ${quality.score}/100)`,
          action: quality.issues.join('; '),
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations;
  }

  /**
   * Get section-specific improvement tips
   */
  getSectionTips(sectionName: string): string[] {
    const tips: Record<string, string[]> = {
      skills: [
        'List both technical and soft skills',
        'Group skills by category (e.g., Programming Languages, Frameworks, Tools)',
        'Include proficiency levels where relevant',
        'Keep the list concise and relevant to your target role',
      ],
      projects: [
        'Describe 3-5 significant projects',
        'Include project name, technologies used, and your role',
        'Highlight measurable outcomes and impact',
        'Link to GitHub or live demos if available',
      ],
      experience: [
        'List experiences in reverse chronological order',
        'Use action verbs to describe responsibilities',
        'Quantify achievements with numbers and metrics',
        'Focus on relevant experience for your target role',
      ],
      education: [
        'Include degree, institution, and graduation date',
        'Mention relevant coursework or academic achievements',
        'Include GPA if it\'s strong (3.5+)',
        'List honors, awards, or scholarships',
      ],
      certifications: [
        'List relevant professional certifications',
        'Include certification name, issuing organization, and date',
        'Prioritize industry-recognized certifications',
        'Keep certifications current and relevant',
      ],
      summary: [
        'Write a concise 2-3 sentence professional summary',
        'Highlight your key strengths and experience',
        'Tailor the summary to your target role',
        'Avoid generic statements - be specific',
      ],
    };

    return tips[sectionName] || [];
  }

  /**
   * Validate section name variations
   */
  normalizeSectionName(sectionName: string): string {
    const normalized = sectionName.toLowerCase().trim();
    
    // Map common variations to standard names
    const variations: Record<string, string> = {
      'technical skills': 'skills',
      'core competencies': 'skills',
      'work experience': 'experience',
      'professional experience': 'experience',
      'employment history': 'experience',
      'academic background': 'education',
      'qualifications': 'education',
      'certificates': 'certifications',
      'professional summary': 'summary',
      'objective': 'summary',
      'profile': 'summary',
    };

    return variations[normalized] || normalized;
  }
}

// Export singleton instance
export const sectionAnalyzer = new SectionAnalyzer();
