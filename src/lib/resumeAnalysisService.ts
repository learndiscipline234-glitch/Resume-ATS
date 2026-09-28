import { supabase } from '@/integrations/supabase/client';
import { SkillAnalysis } from '@/components/SkillAnalyzerCard';
import { MLTrainingService } from './mlTrainingService';

// This would typically be your actual LLM API endpoint
// For now, we'll use a mock implementation that follows the schema
const MOCK_ANALYSIS: SkillAnalysis = {
  user_skills: [
    { name: "Python", confidence: 0.92 },
    { name: "Data Analysis", confidence: 0.88 },
    { name: "Machine Learning", confidence: 0.75 },
    { name: "SQL", confidence: 0.65 },
    { name: "Pandas", confidence: 0.90 },
    { name: "React", confidence: 0.70 }
  ],
  suggested_skills: [
    {
      name: "Docker",
      priority: "high",
      reason: "Essential for modern development workflows and deployment",
      recommended_action: "Complete Docker Fundamentals course at https://www.udemy.com/course/docker-mastery/ and containerize 2-3 projects"
    },
    {
      name: "AWS",
      priority: "high", 
      reason: "Cloud skills are in high demand and can increase salary by 25%",
      recommended_action: "Start with AWS Free Tier at https://aws.amazon.com/free/, complete Solutions Architect Associate certification"
    },
    {
      name: "Kubernetes",
      priority: "medium",
      reason: "Container orchestration is becoming standard in production environments",
      recommended_action: "Learn Kubernetes basics at https://kubernetes.io/docs/tutorials/ and deploy a sample application"
    },
    {
      name: "GraphQL",
      priority: "medium",
      reason: "Modern API development skill that's growing in popularity",
      recommended_action: "Build a GraphQL API with Node.js and React frontend using https://graphql.org/learn/"
    },
    {
      name: "TypeScript",
      priority: "high",
      reason: "Type safety and better developer experience for large codebases",
      recommended_action: "Complete TypeScript course at https://www.udemy.com/course/typescript-course/ and migrate existing JavaScript projects"
    },
    {
      name: "Redis",
      priority: "low",
      reason: "Caching and session management for scalable applications",
      recommended_action: "Learn Redis basics at https://redis.io/docs/ and implement caching in your projects"
    }
  ],
  skills_chart: [
    { name: "Python", score: 85 },
    { name: "Data Analysis", score: 80 },
    { name: "Machine Learning", score: 75 },
    { name: "SQL", score: 65 },
    { name: "Pandas", score: 90 },
    { name: "React", score: 70 },
    { name: "Docker", score: 30 },
    { name: "AWS", score: 25 },
    { name: "Kubernetes", score: 15 },
    { name: "GraphQL", score: 20 }
  ],
  top_recommendations: [
    {
      title: "Add measurable achievements",
      details: "Convert job duties into quantifiable outcomes (e.g., 'reduced load time by 30%')",
      impact: "high"
    },
    {
      title: "Learn cloud technologies",
      details: "Add AWS or Azure experience to increase marketability",
      impact: "high"
    },
    {
      title: "Improve containerization skills",
      details: "Docker and Kubernetes are essential for modern development roles",
      impact: "medium"
    },
    {
      title: "Add project portfolio",
      details: "Include 3-5 key projects with live demos and GitHub links",
      impact: "medium"
    },
    {
      title: "Optimize resume keywords",
      details: "Include more industry-specific terms and technologies",
      impact: "low"
    }
  ],
  resume_elevator_pitch: "Data analyst with 3+ years building analytics pipelines and dashboards that improved decision-making and cut reporting time by 40%.",
  suggested_keywords: ["Python", "SQL", "Tableau", "ETL", "data pipeline", "Machine Learning", "AWS", "Docker"],
  summary_text: "This resume shows strong Python and analytics experience; add cloud technologies and quantify results to get more interviews for data roles.",
  metadata: {
    model_confidence: 0.86
  }
};

export interface ResumeAnalysisRequest {
  resume_text: string;
  target_role?: string;
  existing_skills?: string[];
  experience_years?: number;
  user_id?: string;
}

export class ResumeAnalysisService {
  /**
   * Analyze resume using LLM and return structured results
   * In production, this would call your actual LLM API
   */
  static async analyzeResume(request: ResumeAnalysisRequest): Promise<SkillAnalysis> {
    // TODO: Replace with actual LLM API call
    // For now, return mock data with some randomization
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    
    // Add some randomization to make it feel more realistic
    const randomizedAnalysis = this.randomizeAnalysis(MOCK_ANALYSIS);
    
    // Save analysis to database only if user_id is provided (optional in demo mode)
    if (request.user_id) {
      try {
        await this.saveAnalysisToDatabase(request.user_id, request, randomizedAnalysis);
      } catch (error) {
        console.warn('Failed to save analysis to database (demo mode continues):', error);
        // Continue without database storage in demo mode
      }
    }
    
    return randomizedAnalysis;
  }

  /**
   * Save analysis results to Supabase
   */
  private static async saveAnalysisToDatabase(
    userId: string, 
    request: ResumeAnalysisRequest, 
    analysis: SkillAnalysis
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
   * Add some randomization to make mock data feel more realistic
   */
  private static randomizeAnalysis(analysis: SkillAnalysis): SkillAnalysis {
    const randomizeScore = (score: number) => {
      const variation = Math.random() * 20 - 10; // ±10 points
      return Math.max(0, Math.min(100, Math.round(score + variation)));
    };

    const randomizeConfidence = (confidence: number) => {
      const variation = (Math.random() * 0.2 - 0.1); // ±0.1
      return Math.max(0, Math.min(1, confidence + variation));
    };

    return {
      ...analysis,
      user_skills: analysis.user_skills.map(skill => ({
        ...skill,
        confidence: randomizeConfidence(skill.confidence)
      })),
      skills_chart: analysis.skills_chart.map(skill => ({
        ...skill,
        score: randomizeScore(skill.score)
      })),
      metadata: {
        model_confidence: randomizeConfidence(analysis.metadata.model_confidence)
      }
    };
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

  /**
   * Get ML model prediction for resume analysis
   */
  static async getMLPrediction(resumeText: string, targetRole?: string): Promise<number> {
    try {
      // Get latest training results to check if model is available
      const latestResults = await MLTrainingService.getLatestTrainingResults();
      
      if (!latestResults) {
        console.warn('No trained model available, using default confidence');
        return 0.75; // Default confidence
      }

      // Extract features from resume text (same as training)
      const features = this.extractFeaturesFromResume(resumeText, targetRole);
      
      // For now, return a mock prediction based on features
      // In a real implementation, you would load the trained model and make predictions
      const mockPrediction = this.mockMLPrediction(features);
      
      return mockPrediction;
    } catch (error) {
      console.error('Error getting ML prediction:', error);
      return 0.75; // Fallback confidence
    }
  }

  /**
   * Extract features from resume text (same as training preprocessing)
   */
  private static extractFeaturesFromResume(resumeText: string, targetRole?: string): number[] {
    const text = resumeText.toLowerCase();
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;
    const hasEmail = text.includes('@') ? 1 : 0;
    const hasPhone = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text) ? 1 : 0;
    const hasLinkedIn = text.includes('linkedin') ? 1 : 0;
    const hasGithub = text.includes('github') ? 1 : 0;
    
    // Technical keywords
    const techKeywords = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker',
      'kubernetes', 'git', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql'
    ];
    
    const techKeywordCount = techKeywords.reduce((count, keyword) => {
      return count + (text.includes(keyword) ? 1 : 0);
    }, 0);

    // Estimate experience years from text
    const experienceYears = this.estimateExperienceYears(text);

    return [
      wordCount / 1000,
      charCount / 10000,
      hasEmail,
      hasPhone,
      hasLinkedIn,
      hasGithub,
      experienceYears / 10,
      techKeywordCount / 15
    ];
  }

  /**
   * Estimate experience years from resume text
   */
  private static estimateExperienceYears(text: string): number {
    const yearPattern = /(\d+)\+?\s*years?/gi;
    const matches = text.match(yearPattern);
    
    if (matches) {
      const years = matches.map(match => {
        const num = parseInt(match.replace(/\D/g, ''));
        return isNaN(num) ? 0 : num;
      });
      return Math.max(...years);
    }
    
    // Fallback: estimate based on keywords
    if (text.includes('senior') || text.includes('lead')) return 5;
    if (text.includes('mid') || text.includes('intermediate')) return 3;
    if (text.includes('junior') || text.includes('entry')) return 1;
    
    return 2; // Default
  }

  /**
   * Mock ML prediction based on features
   */
  private static mockMLPrediction(features: number[]): number {
    // Simple weighted sum as mock prediction
    const weights = [0.1, 0.05, 0.1, 0.05, 0.1, 0.1, 0.2, 0.3];
    const prediction = features.reduce((sum, feature, index) => {
      return sum + (feature * (weights[index] || 0));
    }, 0);
    
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, prediction));
  }

  /**
   * Enhanced analyze resume with ML predictions
   */
  static async analyzeResumeWithML(request: ResumeAnalysisRequest): Promise<SkillAnalysis> {
    // Get base analysis
    const baseAnalysis = await this.analyzeResume(request);
    
    // Get ML prediction for confidence
    const mlConfidence = await this.getMLPrediction(request.resume_text, request.target_role);
    
    // Enhance analysis with ML confidence
    const enhancedAnalysis: SkillAnalysis = {
      ...baseAnalysis,
      metadata: {
        model_confidence: mlConfidence
      }
    };
    
    // Save enhanced analysis to database only if user_id is provided (optional in demo mode)
    if (request.user_id) {
      try {
        await this.saveAnalysisToDatabase(request.user_id, request, enhancedAnalysis);
      } catch (error) {
        console.warn('Failed to save enhanced analysis to database (demo mode continues):', error);
        // Continue without database storage in demo mode
      }
    }
    
    return enhancedAnalysis;
  }
}
