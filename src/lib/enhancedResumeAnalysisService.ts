import { supabase } from '@/integrations/supabase/client';
import { SkillAnalysis } from '@/components/SkillAnalyzerCard';
import { RoleDataService } from './roleDataService';

export interface ResumeAnalysisRequest {
  resume_text: string;
  target_role?: string;
  existing_skills?: string[];
  experience_years?: number;
  user_id?: string;
}

export interface EnhancedSkillAnalysis {
  user_skills: Array<{
    name: string;
    confidence: number;
  }>;
  suggested_skills: Array<{
    name: string;
    priority: "high" | "medium" | "low";
    reason: string;
    recommended_action: string;
  }>;
  skills_chart: Array<{
    name: string;
    score: number;
  }>;
  top_recommendations: Array<{
    title: string;
    details: string;
    impact: "low" | "medium" | "high";
  }>;
  resume_elevator_pitch: string;
  suggested_keywords: string[];
  summary_text: string;
  metadata: {
    model_confidence: number;
  };
  // Enhanced fields
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  recommendations: string[];
  criticalMissingSkills: string[];
  importantMissingSkills: string[];
}

export class EnhancedResumeAnalysisService {
  /**
   * Analyze resume with comprehensive skill gap analysis
   */
  static async analyzeResume(request: ResumeAnalysisRequest): Promise<EnhancedSkillAnalysis> {
    try {
      // Extract skills from resume text
      const extractedSkills = await this.extractSkillsFromResume(request.resume_text);
      
      // Get role-specific analysis if target role is provided
      let roleAnalysis = null;
      if (request.target_role) {
        roleAnalysis = RoleDataService.calculateSkillMatchScore(
          extractedSkills,
          request.target_role
        );
      }

      // Build comprehensive analysis result
      const analysis = await this.buildAnalysisResult(
        request,
        extractedSkills,
        roleAnalysis
      );

      // Save to database if user_id is provided
      if (request.user_id) {
        await this.saveAnalysisToDatabase(request.user_id, request, analysis);
      }

      return analysis;
    } catch (error) {
      console.error('Error in enhanced resume analysis:', error);
      throw error;
    }
  }

  /**
   * Extract skills from resume text using pattern matching and AI-like analysis
   */
  private static async extractSkillsFromResume(resumeText: string): Promise<string[]> {
    const text = resumeText.toLowerCase();
    const extractedSkills: string[] = [];

    // Comprehensive skill patterns
    const skillPatterns = {
      // Programming Languages
      programming: [
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust',
        'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
        'dart', 'elixir', 'clojure', 'haskell', 'f#', 'ocaml'
      ],
      
      // Web Technologies
      web: [
        'html', 'css', 'react', 'vue', 'angular', 'node.js', 'express',
        'django', 'flask', 'spring', 'laravel', 'rails', 'next.js', 'nuxt.js',
        'svelte', 'ember', 'backbone', 'jquery', 'bootstrap', 'tailwind'
      ],
      
      // Databases
      databases: [
        'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle',
        'sql server', 'cassandra', 'dynamodb', 'elasticsearch', 'neo4j',
        'couchdb', 'mariadb', 'firebase', 'supabase'
      ],
      
      // Cloud & DevOps
      cloud: [
        'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
        'terraform', 'ansible', 'jenkins', 'gitlab ci', 'github actions',
        'azure devops', 'circleci', 'travis ci', 'heroku', 'vercel',
        'netlify', 'digitalocean', 'linode'
      ],
      
      // Data Science & ML
      dataScience: [
        'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras',
        'matplotlib', 'seaborn', 'plotly', 'jupyter', 'r', 'spark',
        'hadoop', 'kafka', 'airflow', 'mlflow', 'kubeflow', 'sagemaker'
      ],
      
      // Mobile Development
      mobile: [
        'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
        'android studio', 'xcode', 'swift', 'kotlin', 'java'
      ],
      
      // Tools & Frameworks
      tools: [
        'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
        'slack', 'trello', 'asana', 'notion', 'figma', 'sketch',
        'adobe xd', 'postman', 'insomnia', 'swagger', 'graphql'
      ],
      
      // Testing
      testing: [
        'jest', 'mocha', 'chai', 'cypress', 'selenium', 'junit',
        'pytest', 'rspec', 'testng', 'cucumber', 'appium', 'detox'
      ],
      
      // Soft Skills
      softSkills: [
        'leadership', 'communication', 'teamwork', 'problem solving',
        'analytical thinking', 'project management', 'agile', 'scrum',
        'mentoring', 'collaboration', 'time management', 'adaptability'
      ]
    };

    // Extract skills using pattern matching
    Object.values(skillPatterns).forEach(skillGroup => {
      skillGroup.forEach(skill => {
        if (text.includes(skill)) {
          extractedSkills.push(skill);
        }
      });
    });

    // Extract skills from common phrases
    const skillPhrases = [
      { pattern: /(\d+)\+?\s*years?\s*(?:of\s*)?experience\s*(?:in\s*)?([a-zA-Z\s]+)/gi, extract: (match: RegExpMatchArray) => match[2] },
      { pattern: /proficient\s*(?:in\s*)?([a-zA-Z\s,]+)/gi, extract: (match: RegExpMatchArray) => match[1] },
      { pattern: /expertise\s*(?:in\s*)?([a-zA-Z\s,]+)/gi, extract: (match: RegExpMatchArray) => match[1] },
      { pattern: /skilled\s*(?:in\s*)?([a-zA-Z\s,]+)/gi, extract: (match: RegExpMatchArray) => match[1] },
      { pattern: /knowledge\s*(?:of\s*)?([a-zA-Z\s,]+)/gi, extract: (match: RegExpMatchArray) => match[1] }
    ];

    skillPhrases.forEach(({ pattern, extract }) => {
      const matches = resumeText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const extracted = extract(match);
          if (extracted) {
            // Split by comma and clean up
            const skills = extracted.split(',').map(s => s.trim().toLowerCase());
            skills.forEach(skill => {
              if (skill.length > 2 && skill.length < 50) {
                extractedSkills.push(skill);
              }
            });
          }
        });
      }
    });

    // Remove duplicates and clean up
    const uniqueSkills = [...new Set(extractedSkills)]
      .filter(skill => skill.length > 1)
      .map(skill => skill.trim())
      .filter(skill => !this.isCommonWord(skill));

    return uniqueSkills;
  }

  /**
   * Check if a word is too common to be considered a skill
   */
  private static isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'within', 'without',
      'experience', 'years', 'work', 'job', 'role', 'position', 'company',
      'team', 'project', 'development', 'management', 'analysis', 'design',
      'implementation', 'testing', 'deployment', 'maintenance', 'support'
    ];
    return commonWords.includes(word.toLowerCase());
  }

  /**
   * Build comprehensive analysis result
   */
  private static async buildAnalysisResult(
    request: ResumeAnalysisRequest,
    extractedSkills: string[],
    roleAnalysis: any
  ): Promise<EnhancedSkillAnalysis> {
    const targetRole = request.target_role || 'Software Engineer';
    
    // Get role-specific skills and recommendations
    const roleSkills = RoleDataService.getAllSkillsForRole(targetRole);
    const roleSkillNames = roleSkills.map(skill => skill.name);
    
    // Calculate match score and missing skills
    const matchAnalysis = roleAnalysis || RoleDataService.calculateSkillMatchScore(extractedSkills, targetRole);
    
    console.log('buildAnalysisResult debug:', {
      extractedSkills: extractedSkills.slice(0, 3),
      targetRole,
      matchAnalysis: matchAnalysis ? {
        matchedSkills: matchAnalysis.matchedSkills?.slice(0, 3),
        matchedSkillsType: typeof matchAnalysis.matchedSkills?.[0],
        missingSkills: matchAnalysis.missingSkills?.slice(0, 3),
        matchScore: matchAnalysis.matchScore
      } : null
    });
    
    // Generate skill recommendations
    const skillRecommendations = RoleDataService.getSkillRecommendations(targetRole, matchAnalysis?.missingSkills || []);
    
    // Build skills chart with both user and role skills
    const skillsChart = this.buildSkillsChart(extractedSkills, roleSkillNames, matchAnalysis);
    
    // Generate top recommendations
    const topRecommendations = this.generateTopRecommendations(matchAnalysis, targetRole);
    
    // Generate elevator pitch
    const elevatorPitch = this.generateElevatorPitch(extractedSkills, targetRole, request.experience_years);
    
    // Generate suggested keywords
    const suggestedKeywords = this.generateSuggestedKeywords(targetRole, matchAnalysis?.missingSkills || []);
    
    // Generate summary
    const summary = this.generateSummary(matchAnalysis, targetRole, extractedSkills.length);

    return {
      user_skills: extractedSkills.map(skill => ({
        name: skill,
        confidence: this.calculateSkillConfidence(skill, request.resume_text)
      })),
      suggested_skills: skillRecommendations.map(rec => ({
        name: rec.skill,
        priority: rec.priority,
        reason: rec.reason,
        recommended_action: rec.recommendedAction
      })),
      skills_chart: skillsChart,
      top_recommendations: topRecommendations,
      resume_elevator_pitch: elevatorPitch,
      suggested_keywords: suggestedKeywords,
      summary_text: summary,
      metadata: {
        model_confidence: this.calculateModelConfidence(matchAnalysis?.matchScore || 0, extractedSkills.length)
      },
      // Enhanced fields
      matchedSkills: matchAnalysis?.matchedSkills || [],
      missingSkills: matchAnalysis?.missingSkills || [],
      matchScore: matchAnalysis?.matchScore || 0,
      recommendations: skillRecommendations.map(rec => rec.recommendedAction),
      criticalMissingSkills: matchAnalysis?.criticalMissing || [],
      importantMissingSkills: matchAnalysis?.importantMissing || []
    };
  }

  /**
   * Build skills chart with user and role skills
   */
  private static buildSkillsChart(
    userSkills: string[],
    roleSkills: string[],
    matchAnalysis: any
  ): Array<{ name: string; score: number }> {
    const chart: Array<{ name: string; score: number }> = [];
    
    // Ensure matchAnalysis has the required arrays
    const matchedSkills = matchAnalysis?.matchedSkills || [];
    const missingSkills = matchAnalysis?.missingSkills || [];
    
    // Add user skills with high scores
    userSkills.forEach(skill => {
      const isMatched = matchedSkills.includes(skill);
      chart.push({
        name: skill,
        score: isMatched ? Math.floor(Math.random() * 20) + 70 : Math.floor(Math.random() * 30) + 40
      });
    });
    
    // Add missing skills with low scores
    missingSkills.forEach((skill: string) => {
      chart.push({
        name: skill,
        score: Math.floor(Math.random() * 20) + 10
      });
    });
    
    return chart;
  }

  /**
   * Calculate skill confidence based on resume text
   */
  private static calculateSkillConfidence(skill: string, resumeText: string): number {
    const text = resumeText.toLowerCase();
    const skillLower = skill.toLowerCase();
    
    // Higher confidence if skill appears multiple times or with strong indicators
    const occurrences = (text.match(new RegExp(skillLower, 'g')) || []).length;
    const strongIndicators = ['expert', 'proficient', 'experienced', 'skilled', 'advanced'].some(indicator => 
      text.includes(`${indicator} in ${skillLower}`) || text.includes(`${skillLower} ${indicator}`)
    );
    
    let confidence = 0.5; // Base confidence
    
    if (occurrences > 1) confidence += 0.2;
    if (strongIndicators) confidence += 0.3;
    if (occurrences > 3) confidence += 0.1;
    
    return Math.min(0.95, Math.max(0.3, confidence));
  }

  /**
   * Calculate model confidence based on match score and skill count
   */
  private static calculateModelConfidence(matchScore: number, skillCount: number): number {
    const scoreConfidence = matchScore / 100;
    const countConfidence = Math.min(1, skillCount / 20); // More skills = higher confidence
    return (scoreConfidence + countConfidence) / 2;
  }

  /**
   * Generate top recommendations
   */
  private static generateTopRecommendations(matchAnalysis: any, targetRole: string): Array<{
    title: string;
    details: string;
    impact: "low" | "medium" | "high";
  }> {
    const recommendations = [];
    
    if (matchAnalysis.criticalMissing.length > 0) {
      recommendations.push({
        title: `Learn Critical Skills: ${matchAnalysis.criticalMissing.slice(0, 3).join(', ')}`,
        details: `These skills are essential for ${targetRole} roles and should be prioritized`,
        impact: "high" as const
      });
    }
    
    if (matchAnalysis.matchScore < 50) {
      recommendations.push({
        title: 'Focus on Core Competencies',
        details: 'Strengthen your foundation in key areas before expanding to advanced topics',
        impact: "high" as const
      });
    }
    
    if (matchAnalysis.importantMissing.length > 0) {
      recommendations.push({
        title: `Add Important Skills: ${matchAnalysis.importantMissing.slice(0, 2).join(', ')}`,
        details: 'These skills will significantly improve your job prospects',
        impact: "medium" as const
      });
    }
    
    recommendations.push({
      title: 'Build Portfolio Projects',
      details: 'Create 2-3 projects showcasing your skills in your target role',
      impact: "medium" as const
    });
    
    recommendations.push({
      title: 'Quantify Your Achievements',
      details: 'Add specific metrics and measurable outcomes to your resume',
      impact: "low" as const
    });
    
    return recommendations.slice(0, 5);
  }

  /**
   * Generate elevator pitch
   */
  private static generateElevatorPitch(skills: string[], targetRole: string, experienceYears?: number): string {
    const years = experienceYears || 2;
    const topSkills = skills.slice(0, 3).join(', ');
    
    return `${targetRole} with ${years}+ years of experience in ${topSkills}. Passionate about building scalable solutions and driving technical innovation.`;
  }

  /**
   * Generate suggested keywords
   */
  private static generateSuggestedKeywords(targetRole: string, missingSkills: string[]): string[] {
    const roleSkills = RoleDataService.getAllSkillsForRole(targetRole);
    const criticalKeywords = RoleDataService.getCriticalSkillsForRole(targetRole);
    
    return [
      ...criticalKeywords.slice(0, 5).map(skill => skill.name),
      ...roleSkills.slice(0, 5).map(s => s.name),
      ...missingSkills.slice(0, 3)
    ].slice(0, 10);
  }

  /**
   * Generate analysis summary
   */
  private static generateSummary(matchAnalysis: any, targetRole: string, skillCount: number): string {
    const matchScore = matchAnalysis.matchScore;
    const matchedCount = matchAnalysis.matchedSkills.length;
    const missingCount = matchAnalysis.missingSkills.length;
    
    if (matchScore >= 80) {
      return `Strong match for ${targetRole} role with ${matchedCount} relevant skills identified. Consider adding ${missingCount} additional skills to further enhance your profile.`;
    } else if (matchScore >= 60) {
      return `Good foundation for ${targetRole} role with ${matchedCount} skills. Focus on learning ${matchAnalysis.criticalMissing.slice(0, 2).join(' and ')} to improve your match score.`;
    } else if (matchScore >= 40) {
      return `Moderate match for ${targetRole} role. Prioritize learning critical skills like ${matchAnalysis.criticalMissing.slice(0, 3).join(', ')} to strengthen your profile.`;
    } else {
      return `Limited match for ${targetRole} role. Consider focusing on fundamental skills and building a stronger foundation before targeting this role.`;
    }
  }

  /**
   * Save analysis results to Supabase
   */
  private static async saveAnalysisToDatabase(
    userId: string,
    request: ResumeAnalysisRequest,
    analysis: EnhancedSkillAnalysis
  ) {
    try {
      // Save the analysis result
      const { error: analysisError } = await supabase
        .from('resume_analyses')
        .insert({
          user_id: userId,
          resume_text: request.resume_text,
          target_role: request.target_role || null,
          experience_years: request.experience_years || null,
          analysis_result: analysis
        });

      if (analysisError) {
        console.error('Error saving analysis:', analysisError);
        return;
      }

      // Save user skills
      const userSkillsData = analysis.user_skills.map(skill => ({
        user_id: userId,
        skill_name: skill.name,
        confidence: skill.confidence,
        score: analysis.skills_chart.find(s => s.name === skill.name)?.score || null
      }));

      const { error: skillsError } = await supabase
        .from('user_skills')
        .insert(userSkillsData);

      if (skillsError) {
        console.error('Error saving user skills:', skillsError);
      }

      // Save skill suggestions
      const suggestionsData = analysis.suggested_skills.map(skill => ({
        user_id: userId,
        skill_name: skill.name,
        priority: skill.priority,
        reason: skill.reason,
        recommended_action: skill.recommended_action
      }));

      const { error: suggestionsError } = await supabase
        .from('skill_suggestions')
        .insert(suggestionsData);

      if (suggestionsError) {
        console.error('Error saving skill suggestions:', suggestionsError);
      }

    } catch (error) {
      console.error('Error saving to database:', error);
    }
  }

  /**
   * Get user's saved skills
   */
  static async getUserSkills(userId: string) {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user skills:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get user's skill suggestions
   */
  static async getSkillSuggestions(userId: string) {
    const { data, error } = await supabase
      .from('skill_suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching skill suggestions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Add a skill to user's profile
   */
  static async addUserSkill(userId: string, skillName: string, confidence: number = 0.5) {
    const { data, error } = await supabase
      .from('user_skills')
      .insert({
        user_id: userId,
        skill_name: skillName,
        confidence: confidence,
        score: Math.round(confidence * 100)
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding user skill:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get user's recent analyses
   */
  static async getRecentAnalyses(userId: string, limit: number = 5) {
    const { data, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent analyses:', error);
      return [];
    }

    return data || [];
  }
}
