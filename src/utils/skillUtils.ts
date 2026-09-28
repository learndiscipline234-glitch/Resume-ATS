import { SkillCategory } from '../ai/types';

/**
 * Skill Utilities
 * Helper functions for skill data processing and normalization
 */

/**
 * Normalize skill name to handle variations
 * Converts to lowercase, trims whitespace, and handles common variations
 * 
 * @param skillName - Raw skill name to normalize
 * @returns Normalized skill name
 * 
 * @example
 * normalizeSkillName('  JavaScript  ') // 'javascript'
 * normalizeSkillName('Node.js') // 'nodejs'
 * normalizeSkillName('React.JS') // 'reactjs'
 */
export function normalizeSkillName(skillName: string): string {
  if (!skillName || typeof skillName !== 'string') {
    return '';
  }

  return skillName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[.\-_]/g, '') // Remove dots, dashes, underscores
    .replace(/\s/g, ''); // Remove remaining spaces
}

/**
 * Categorize skills into predefined categories
 * Uses keyword matching to determine skill category
 * 
 * @param skills - Array of skill names to categorize
 * @returns Object mapping categories to skill arrays
 * 
 * @example
 * categorizeSkills(['Python', 'Leadership', 'Docker'])
 * // { technical: ['Python'], soft_skills: ['Leadership'], tools: ['Docker'] }
 */
export function categorizeSkills(skills: string[]): Record<SkillCategory, string[]> {
  const categorized: Record<SkillCategory, string[]> = {
    technical: [],
    soft_skills: [],
    tools: [],
    frameworks: [],
    languages: [],
    certifications: [],
  };

  if (!Array.isArray(skills)) {
    return categorized;
  }

  // Category keyword mappings
  const categoryKeywords: Record<SkillCategory, string[]> = {
    languages: [
      'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 
      'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell',
      'bash', 'powershell', 'sql', 'html', 'css'
    ],
    frameworks: [
      'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 
      'nextjs', 'nuxt', 'laravel', 'rails', 'aspnet', 'tensorflow', 'pytorch',
      'keras', 'scikit', 'pandas', 'numpy', 'jquery', 'bootstrap', 'tailwind'
    ],
    tools: [
      'git', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'jira',
      'confluence', 'slack', 'vscode', 'intellij', 'eclipse', 'postman',
      'figma', 'sketch', 'photoshop', 'illustrator', 'tableau', 'powerbi',
      'excel', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'vagrant'
    ],
    certifications: [
      'aws certified', 'azure certified', 'gcp certified', 'pmp', 'scrum master',
      'cissp', 'comptia', 'cisco', 'oracle certified', 'microsoft certified',
      'google certified', 'certified', 'certification'
    ],
    soft_skills: [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'adaptability', 'creativity', 'collaboration', 'presentation',
      'negotiation', 'conflict resolution', 'emotional intelligence', 'mentoring',
      'project management', 'agile', 'scrum', 'stakeholder management'
    ],
    technical: [
      'algorithm', 'data structure', 'database', 'api', 'rest', 'graphql',
      'microservices', 'cloud', 'devops', 'ci/cd', 'testing', 'debugging',
      'optimization', 'security', 'networking', 'system design', 'architecture',
      'machine learning', 'deep learning', 'ai', 'data analysis', 'statistics'
    ],
  };

  skills.forEach(skill => {
    const normalizedSkill = normalizeSkillName(skill);
    let categorized_flag = false;

    // Check each category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matchesCategory = keywords.some(keyword => 
        normalizedSkill.includes(normalizeSkillName(keyword)) ||
        normalizeSkillName(keyword).includes(normalizedSkill)
      );

      if (matchesCategory) {
        categorized[category as SkillCategory].push(skill);
        categorized_flag = true;
        break;
      }
    }

    // Default to technical if no match found
    if (!categorized_flag) {
      categorized.technical.push(skill);
    }
  });

  return categorized;
}

/**
 * Calculate skill importance score based on various factors
 * Higher scores indicate more important/valuable skills
 * 
 * @param skill - Skill name
 * @param context - Optional context object with additional factors
 * @returns Importance score (0-100)
 * 
 * @example
 * calculateSkillImportance('Python', { demandLevel: 'high', yearsExperience: 5 })
 * // Returns score like 85
 */
export function calculateSkillImportance(
  skill: string,
  context?: {
    demandLevel?: 'high' | 'medium' | 'low';
    yearsExperience?: number;
    isCritical?: boolean;
    trendDirection?: 'rising' | 'stable' | 'declining';
  }
): number {
  if (!skill || typeof skill !== 'string') {
    return 0;
  }

  let score = 50; // Base score

  // Adjust for demand level
  if (context?.demandLevel) {
    switch (context.demandLevel) {
      case 'high':
        score += 20;
        break;
      case 'medium':
        score += 10;
        break;
      case 'low':
        score -= 10;
        break;
    }
  }

  // Adjust for years of experience
  if (context?.yearsExperience !== undefined) {
    const experienceBonus = Math.min(context.yearsExperience * 3, 15);
    score += experienceBonus;
  }

  // Adjust for critical flag
  if (context?.isCritical) {
    score += 15;
  }

  // Adjust for trend direction
  if (context?.trendDirection) {
    switch (context.trendDirection) {
      case 'rising':
        score += 10;
        break;
      case 'stable':
        score += 0;
        break;
      case 'declining':
        score -= 10;
        break;
    }
  }

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Find similar skills based on name similarity
 * Useful for matching skill variations and aliases
 * 
 * @param skill - Skill to find matches for
 * @param skillList - List of skills to search in
 * @param threshold - Similarity threshold (0-1), default 0.7
 * @returns Array of similar skills
 */
export function findSimilarSkills(
  skill: string,
  skillList: string[],
  threshold: number = 0.7
): string[] {
  if (!skill || !Array.isArray(skillList)) {
    return [];
  }

  const normalizedSkill = normalizeSkillName(skill);
  const similar: string[] = [];

  skillList.forEach(candidateSkill => {
    const normalizedCandidate = normalizeSkillName(candidateSkill);
    
    // Skip if same skill
    if (normalizedSkill === normalizedCandidate) {
      return;
    }

    // Calculate simple similarity score
    const similarity = calculateStringSimilarity(normalizedSkill, normalizedCandidate);
    
    if (similarity >= threshold) {
      similar.push(candidateSkill);
    }
  });

  return similar;
}

/**
 * Calculate string similarity using Levenshtein distance
 * Returns value between 0 (completely different) and 1 (identical)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  // Check for substring match
  if (longer.includes(shorter) || shorter.includes(longer)) {
    return 0.8;
  }

  const distance = levenshteinDistance(str1, str2);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Deduplicate skills array, keeping unique normalized versions
 * 
 * @param skills - Array of skills that may contain duplicates
 * @returns Deduplicated array of skills
 */
export function deduplicateSkills(skills: string[]): string[] {
  if (!Array.isArray(skills)) {
    return [];
  }

  const seen = new Set<string>();
  const unique: string[] = [];

  skills.forEach(skill => {
    const normalized = normalizeSkillName(skill);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(skill);
    }
  });

  return unique;
}

/**
 * Sort skills by importance
 * 
 * @param skills - Array of skills to sort
 * @param importanceMap - Optional map of skill to importance score
 * @returns Sorted array of skills (highest importance first)
 */
export function sortSkillsByImportance(
  skills: string[],
  importanceMap?: Map<string, number>
): string[] {
  if (!Array.isArray(skills)) {
    return [];
  }

  return [...skills].sort((a, b) => {
    const scoreA = importanceMap?.get(normalizeSkillName(a)) ?? 50;
    const scoreB = importanceMap?.get(normalizeSkillName(b)) ?? 50;
    return scoreB - scoreA;
  });
}
