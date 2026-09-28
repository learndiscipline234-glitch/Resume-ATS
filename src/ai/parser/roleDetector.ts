import { skillDatabase } from '../../data/skills';

/**
 * Role Detection Result
 */
export interface RoleDetectionResult {
  detectedRole: string;
  confidence: number;
  alternativeRoles: string[];
  experienceLevel: string;
  roleScores: Record<string, number>;
}

/**
 * Role Detector Service
 * Detects target role from resume content
 */

export class RoleDetector {
  private roleKeywords: Map<string, string[]>;

  constructor() {
    this.roleKeywords = this.buildRoleKeywords();
  }

  /**
   * Build role-specific keywords for detection
   */
  private buildRoleKeywords(): Map<string, string[]> {
    const keywords = new Map<string, string[]>();

    // Software Developer
    keywords.set('software_developer', [
      'software developer',
      'software engineer',
      'full stack developer',
      'fullstack developer',
      'frontend developer',
      'backend developer',
      'web developer',
      'application developer',
      'programmer',
      'coding',
      'development',
      'javascript',
      'react',
      'node',
      'nodejs',
      'html',
      'css',
      'typescript',
      'angular',
      'vue',
      'web development',
      'frontend',
      'backend',
      'fullstack',
      'rest api',
      'graphql',
      'responsive design',
      'ui development',
    ]);

    // AI/ML Engineer
    keywords.set('aiml_engineer', [
      'machine learning',
      'artificial intelligence',
      'ai engineer',
      'ml engineer',
      'deep learning',
      'neural networks',
      'nlp',
      'natural language processing',
      'computer vision',
      'tensorflow',
      'pytorch',
      'keras',
      'scikit-learn',
      'transformer',
      'bert',
      'gpt',
      'llm',
      'large language model',
      'ai',
      'ml',
      'model training',
      'model deployment',
      'reinforcement learning',
      'supervised learning',
      'unsupervised learning',
    ]);

    // Data Scientist
    keywords.set('data_scientist', [
      'data scientist',
      'data science',
      'data analysis',
      'data analytics',
      'python',
      'pandas',
      'numpy',
      'matplotlib',
      'seaborn',
      'jupyter',
      'statistical analysis',
      'statistics',
      'data visualization',
      'machine learning',
      'predictive modeling',
      'data mining',
      'big data',
      'sql',
      'r programming',
      'tableau',
      'power bi',
      'data modeling',
      'feature engineering',
      'hypothesis testing',
    ]);

    // DevOps Engineer
    keywords.set('devops_engineer', [
      'devops',
      'devops engineer',
      'site reliability engineer',
      'sre',
      'infrastructure',
      'cloud engineer',
      'docker',
      'kubernetes',
      'k8s',
      'ci/cd',
      'continuous integration',
      'continuous deployment',
      'jenkins',
      'gitlab ci',
      'github actions',
      'terraform',
      'ansible',
      'aws',
      'azure',
      'gcp',
      'google cloud',
      'cloud infrastructure',
      'monitoring',
      'prometheus',
      'grafana',
      'linux',
      'bash',
      'scripting',
      'automation',
    ]);

    // Product Manager
    keywords.set('product_manager', [
      'product manager',
      'product management',
      'product owner',
      'product strategy',
      'roadmap',
      'product roadmap',
      'agile',
      'scrum',
      'user stories',
      'requirements gathering',
      'stakeholder management',
      'market research',
      'competitive analysis',
      'product launch',
      'go-to-market',
      'kpi',
      'metrics',
      'analytics',
      'user experience',
      'ux',
      'product development',
      'feature prioritization',
      'backlog management',
      'jira',
      'confluence',
    ]);

    return keywords;
  }

  /**
   * Detect target role from resume text
   */
  detectRole(text: string, extractedSkills: string[]): RoleDetectionResult {
    const lowerText = text.toLowerCase();
    const roleScores = new Map<string, number>();

    // Method 1: Keyword matching in text
    this.roleKeywords.forEach((keywords, role) => {
      let score = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          score += matches.length * 2; // Weight keyword matches
        }
      });
      roleScores.set(role, score);
    });

    // Method 2: Skill-based detection
    Object.entries(skillDatabase).forEach(([role, skillSet]) => {
      const roleSkillNames = new Set(skillSet.skills.map(s => s.name));
      const matchingSkills = extractedSkills.filter(skill => roleSkillNames.has(skill));
      
      const currentScore = roleScores.get(role) || 0;
      roleScores.set(role, currentScore + matchingSkills.length * 3); // Weight skill matches higher
    });

    // Method 3: Job title detection
    const jobTitleScore = this.detectFromJobTitles(text);
    jobTitleScore.forEach((score, role) => {
      const currentScore = roleScores.get(role) || 0;
      roleScores.set(role, currentScore + score * 5); // Weight job titles highest
    });

    // Find role with highest score
    let detectedRole = 'software_developer'; // Default
    let maxScore = 0;
    let allScores: Record<string, number> = {};

    roleScores.forEach((score, role) => {
      allScores[role] = score;
      if (score > maxScore) {
        maxScore = score;
        detectedRole = role;
      }
    });

    // Calculate confidence
    const totalScore = Array.from(roleScores.values()).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0;

    // Detect experience level
    const experienceLevel = this.detectExperienceLevel(text);

    // Log detection for debugging
    console.log('[RoleDetector] Detected Role:', detectedRole);
    console.log('[RoleDetector] Confidence:', confidence.toFixed(2));
    console.log('[RoleDetector] Experience Level:', experienceLevel);
    console.log('[RoleDetector] All Scores:', allScores);

    return {
      detectedRole,
      confidence,
      alternativeRoles: this.getAlternativeRoles(allScores, detectedRole),
      experienceLevel,
      roleScores: allScores,
    };
  }

  /**
   * Detect role from job titles in resume
   */
  private detectFromJobTitles(text: string): Map<string, number> {
    const scores = new Map<string, number>();
    const lines = text.split('\n');

    // Look for job title patterns
    const jobTitlePatterns = [
      /^[A-Z][a-z\s]+(?:Developer|Engineer|Scientist|Analyst)/i,
      /(?:Senior|Junior|Lead|Principal)\s+[A-Z][a-z\s]+(?:Developer|Engineer)/i,
    ];

    lines.forEach(line => {
      jobTitlePatterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) {
          const title = match[0].toLowerCase();
          
          // Match title to roles
          this.roleKeywords.forEach((keywords, role) => {
            if (keywords.some(keyword => title.includes(keyword))) {
              scores.set(role, (scores.get(role) || 0) + 1);
            }
          });
        }
      });
    });

    return scores;
  }

  /**
   * Detect experience level from resume
   */
  private detectExperienceLevel(text: string): string {
    const lowerText = text.toLowerCase();

    // Look for explicit experience mentions
    const experiencePatterns = [
      /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
      /experience:\s*(\d+)\+?\s*years?/gi,
    ];

    let maxYears = 0;
    experiencePatterns.forEach(pattern => {
      const matches = lowerText.matchAll(pattern);
      for (const match of matches) {
        const years = parseInt(match[1]);
        if (years > maxYears) {
          maxYears = years;
        }
      }
    });

    // Classify based on years
    if (maxYears === 0) {
      // Try to infer from job titles
      if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('principal')) {
        return 'Senior';
      } else if (lowerText.includes('junior') || lowerText.includes('intern') || lowerText.includes('trainee')) {
        return 'Entry Level';
      }
      return 'Mid Level'; // Default
    } else if (maxYears < 2) {
      return 'Entry Level';
    } else if (maxYears < 5) {
      return 'Mid Level';
    } else {
      return 'Senior';
    }
  }

  /**
   * Get alternative roles based on scores
   */
  private getAlternativeRoles(scores: Record<string, number>, detectedRole: string): string[] {
    const alternatives: string[] = [];
    const sortedRoles = Object.entries(scores)
      .filter(([role]) => role !== detectedRole)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2); // Top 2 alternatives

    sortedRoles.forEach(([role, score]) => {
      if (score > 0) {
        alternatives.push(role);
      }
    });

    return alternatives;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get all available roles
   */
  getAvailableRoles(): string[] {
    return Array.from(this.roleKeywords.keys());
  }

  /**
   * Validate if a role exists
   */
  isValidRole(role: string): boolean {
    return this.roleKeywords.has(role);
  }
}

// Export singleton instance
export const roleDetector = new RoleDetector();
