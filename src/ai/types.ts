/**
 * Core TypeScript interfaces for AI Resume Intelligence Platform
 * Shared types used across all AI modules
 */

// ============================================================================
// Resume Parsing Types
// ============================================================================

export interface ParsedResume {
  /** Raw extracted text from resume */
  text: string;
  /** Extracted skills from resume */
  skills: string[];
  /** Detected sections in resume */
  sections: ResumeSections;
  /** Detected target role */
  targetRole: string;
  /** Confidence score for role detection (0-1) */
  roleConfidence: number;
  /** Experience level detected */
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive';
  /** Candidate name if detected */
  name?: string;
  /** Contact information if detected */
  contact?: ContactInfo;
  /** Metadata about parsing */
  metadata: ParsingMetadata;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ParsingMetadata {
  /** File name */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** File type (pdf, doc, docx) */
  fileType: string;
  /** Text length after extraction */
  textLength: number;
  /** Parsing timestamp */
  parsedAt: string;
  /** Parsing duration in milliseconds */
  parsingDuration: number;
}

export interface ResumeSections {
  skills?: SectionContent;
  projects?: SectionContent;
  experience?: SectionContent;
  education?: SectionContent;
  certifications?: SectionContent;
  summary?: SectionContent;
}

export interface SectionContent {
  /** Section text content */
  content: string;
  /** Section start position in text */
  startIndex: number;
  /** Section end position in text */
  endIndex: number;
  /** Section quality score (0-100) */
  qualityScore: number;
}

// ============================================================================
// Skill Matching Types
// ============================================================================

export interface SkillMatch {
  /** Skills present in both user profile and role requirements */
  matchedSkills: SkillWithImportance[];
  /** Required skills missing from user profile */
  missingSkills: SkillWithImportance[];
  /** Overall match percentage (0-100) */
  matchScore: number;
  /** Target role being matched against */
  targetRole: string;
  /** Weighted match score considering skill importance */
  weightedMatchScore: number;
  /** Match quality rating */
  matchQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface SkillWithImportance {
  /** Skill name */
  skill: string;
  /** Skill importance level */
  importance: 'critical' | 'important' | 'nice-to-have';
  /** Importance weight multiplier */
  weight: number;
  /** Skill category */
  category: SkillCategory;
}

export type SkillCategory = 
  | 'technical' 
  | 'soft_skills' 
  | 'tools' 
  | 'frameworks' 
  | 'languages' 
  | 'certifications';

// ============================================================================
// Resume Scoring Types
// ============================================================================

export interface ResumeScore {
  /** Total resume score (0-100) */
  totalScore: number;
  /** Component scores */
  componentScores: ComponentScores;
  /** Detailed score breakdown */
  breakdown: ScoreBreakdown;
  /** Score quality flag */
  qualityFlag: 'excellent' | 'competitive' | 'needs_improvement';
  /** Recommendations for improvement */
  recommendations: string[];
}

export interface ComponentScores {
  /** Skills component score (weighted 40%) */
  skillsScore: number;
  /** Projects component score (weighted 25%) */
  projectsScore: number;
  /** Experience component score (weighted 20%) */
  experienceScore: number;
  /** Education component score (weighted 15%) */
  educationScore: number;
}

export interface ScoreBreakdown {
  /** Skills contribution to total score */
  skillsContribution: number;
  /** Projects contribution to total score */
  projectsContribution: number;
  /** Experience contribution to total score */
  experienceContribution: number;
  /** Education contribution to total score */
  educationContribution: number;
  /** Detailed scoring factors */
  factors: ScoringFactors;
}

export interface ScoringFactors {
  /** Number of skills identified */
  skillCount: number;
  /** Skill diversity score */
  skillDiversity: number;
  /** Number of projects */
  projectCount: number;
  /** Project complexity score */
  projectComplexity: number;
  /** Years of experience */
  experienceYears: number;
  /** Experience relevance score */
  experienceRelevance: number;
  /** Education level score */
  educationLevel: number;
  /** Certifications count */
  certificationsCount: number;
}

// ============================================================================
// Section Analysis Types
// ============================================================================

export interface SectionAnalysis {
  /** Detected sections */
  detectedSections: string[];
  /** Missing required sections */
  missingSections: string[];
  /** Section quality scores */
  sectionQuality: Record<string, SectionQualityScore>;
  /** Overall section completeness (0-100) */
  completeness: number;
  /** Recommendations for improvement */
  recommendations: SectionRecommendation[];
}

export interface SectionQualityScore {
  /** Section name */
  section: string;
  /** Quality score (0-100) */
  score: number;
  /** Content length */
  contentLength: number;
  /** Keyword presence score */
  keywordScore: number;
  /** Structure score */
  structureScore: number;
  /** Issues identified */
  issues: string[];
}

export interface SectionRecommendation {
  /** Section name */
  section: string;
  /** Recommendation priority */
  priority: 'high' | 'medium' | 'low';
  /** Recommendation message */
  message: string;
  /** Suggested action */
  action: string;
}

// ============================================================================
// Trending Skills Types
// ============================================================================

export interface TrendingSkill {
  /** Skill name */
  skill: string;
  /** Market demand score (0-100) */
  demandScore: number;
  /** Trend direction */
  trend: 'rising' | 'stable' | 'declining';
  /** Growth rate percentage */
  growthRate: number;
  /** Related roles */
  relatedRoles: string[];
  /** Skill category */
  category: SkillCategory;
  /** Average salary impact */
  salaryImpact?: number;
}

export interface TrendingSkillsData {
  /** Target role */
  role: string;
  /** Top trending skills */
  skills: TrendingSkill[];
  /** Data period */
  period: {
    start: string;
    end: string;
  };
  /** Last updated timestamp */
  lastUpdated: string;
}

// ============================================================================
// Job Recommendation Types
// ============================================================================

export interface JobRecommendation {
  /** Unique job identifier */
  jobId: string;
  /** Job title */
  title: string;
  /** Company name */
  company: string;
  /** Job location */
  location: string;
  /** Salary range */
  salaryRange: SalaryRange;
  /** Required skills */
  requiredSkills: string[];
  /** Match score with user profile (0-100) */
  matchScore: number;
  /** Skill gaps */
  skillGaps: SkillGap[];
  /** Job description */
  description?: string;
  /** Experience level required */
  experienceLevel: string;
  /** Job posting date */
  postedDate: string;
  /** Application URL */
  applyUrl?: string;
}

export interface SalaryRange {
  /** Minimum salary */
  min: number;
  /** Maximum salary */
  max: number;
  /** Currency code */
  currency: string;
  /** Salary period (annual, monthly) */
  period: 'annual' | 'monthly';
}

export interface SkillGap {
  /** Missing skill name */
  skill: string;
  /** Skill importance for this job */
  importance: 'critical' | 'important' | 'nice-to-have';
  /** Learning resources */
  learningResources?: LearningResource[];
}

export interface LearningResource {
  /** Resource title */
  title: string;
  /** Resource URL */
  url: string;
  /** Resource type */
  type: 'course' | 'tutorial' | 'documentation' | 'book';
  /** Estimated learning time */
  estimatedTime?: string;
}

// ============================================================================
// Skill Database Types
// ============================================================================

export interface SkillData {
  /** Skill name */
  name: string;
  /** Skill category */
  category: SkillCategory;
  /** Demand level */
  demandLevel: 'high' | 'medium' | 'low';
  /** Related skills */
  relatedSkills: string[];
  /** Skill aliases/variations */
  aliases: string[];
  /** Importance for role */
  importance: 'critical' | 'important' | 'nice-to-have';
}

export interface RoleSkillSet {
  /** Role identifier */
  role: string;
  /** Role display name */
  displayName: string;
  /** Skills for this role */
  skills: SkillData[];
  /** Role description */
  description: string;
}

// ============================================================================
// Analysis Result Types
// ============================================================================

export interface ComprehensiveAnalysis {
  /** Parsed resume data */
  parsedResume: ParsedResume;
  /** Skill match results */
  skillMatch: SkillMatch;
  /** Resume score */
  resumeScore: ResumeScore;
  /** Section analysis */
  sectionAnalysis: SectionAnalysis;
  /** Trending skills for role */
  trendingSkills: TrendingSkill[];
  /** Job recommendations */
  jobRecommendations: JobRecommendation[];
  /** Analysis timestamp */
  analyzedAt: string;
  /** Analysis ID */
  analysisId: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AIError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error details */
  details?: any;
  /** Timestamp */
  timestamp: string;
}

// ============================================================================
// Neuro-Fuzzy Resume Ranking Types
// ============================================================================

/**
 * Input features for neural network resume evaluator
 */
export interface NeuralInputFeatures {
  /** Skill match percentage (0-100) */
  skillMatchScore: number;
  /** Years of professional experience (0-20+) */
  experienceYears: number;
  /** Number of projects mentioned (0-20+) */
  projectsCount: number;
  /** Education section quality score (0-100) */
  educationScore: number;
  /** Ratio of relevant keywords to total words (0-1) */
  keywordDensity: number;
  /** Fraction of expected sections present (0-1) */
  sectionCompleteness: number;
}

/**
 * Result from neural network evaluation
 */
export interface NeuralEvaluationResult {
  /** Whether evaluation succeeded */
  success: boolean;
  /** Neural network score (0-100) or null if failed */
  neuralScore: number | null;
  /** Error message if evaluation failed */
  error?: string;
  /** Time taken for evaluation in milliseconds */
  processingTimeMs: number;
}

/**
 * Fuzzy logic qualitative rating
 */
export type FuzzyRating = "Poor" | "Average" | "Good" | "Excellent";

/**
 * Hiring recommendation from fuzzy engine
 */
export type HiringRecommendation = "Reject" | "Consider" | "Strong Candidate";

/**
 * Input data for fuzzy logic decision engine
 */
export interface FuzzyInputs {
  /** Neural network score (0-100) */
  neuralScore: number;
  /** Skill match percentage (0-100) */
  skillMatchScore: number;
  /** Years of professional experience (0-20+) */
  experienceYears: number;
}

/**
 * Result from fuzzy logic decision making
 */
export interface FuzzyDecisionResult {
  /** Whether decision succeeded */
  success: boolean;
  /** Qualitative rating or null if failed */
  fuzzyRating: FuzzyRating | null;
  /** Hiring recommendation or null if failed */
  hiringRecommendation: HiringRecommendation | null;
  /** Confidence level (0-1) based on rule strengths */
  confidence: number;
  /** Error message if decision failed */
  error?: string;
  /** Time taken for decision in milliseconds */
  processingTimeMs: number;
}

/**
 * Membership function definition for fuzzy logic
 */
export interface MembershipFunction {
  /** Function type */
  type: 'triangular' | 'trapezoidal';
  /** Function points defining the shape */
  points: number[];
}

/**
 * Fuzzy variable definition
 */
export interface FuzzyVariable {
  /** Variable name */
  name: string;
  /** Value range [min, max] */
  range: [number, number];
  /** Fuzzy terms with membership functions */
  terms: Map<string, MembershipFunction>;
}

/**
 * Ranked candidate with all scores and metadata
 */
export interface RankedCandidate {
  /** Unique candidate identifier */
  candidateId: string;
  /** Candidate name */
  candidateName: string;
  /** Weighted final score (0-100) */
  finalScore: number;
  /** Neural network score or null if unavailable */
  neuralScore: number | null;
  /** Fuzzy logic rating or null if unavailable */
  fuzzyRating: FuzzyRating | null;
  /** Hiring recommendation or null if unavailable */
  hiringRecommendation: HiringRecommendation | null;
  /** Candidate rank (1 = best) */
  rank: number;
  /** Skill match percentage */
  skillMatchScore: number;
  /** Resume quality score */
  resumeScore: number;
  /** Detected target role */
  detectedRole: string;
  /** Years of experience */
  experienceYears: number;
  /** Full comprehensive analysis */
  fullAnalysis: ComprehensiveAnalysis;
  /** Error message if processing failed */
  processingError?: string;
}

/**
 * Result from ranking multiple resumes
 */
export interface RankingResult {
  /** Whether ranking succeeded */
  success: boolean;
  /** Sorted array of ranked candidates */
  rankedCandidates: RankedCandidate[];
  /** Number of successfully processed resumes */
  totalProcessed: number;
  /** Number of failed resumes */
  totalFailed: number;
  /** Total time taken for ranking in milliseconds */
  processingTimeMs: number;
  /** Batch identifier for this ranking operation */
  batchId?: string;
  /** Error message if ranking failed */
  error?: string;
}

/**
 * Options for ranking configuration
 */
export interface RankingOptions {
  /** Custom weights for final score calculation */
  weights?: {
    /** Neural score weight (default 0.5) */
    neural: number;
    /** Skill match score weight (default 0.3) */
    skillMatch: number;
    /** Resume score weight (default 0.2) */
    resumeScore: number;
  };
  /** Number of resumes to process in parallel (default 5) */
  parallelBatchSize?: number;
  /** Filter candidates for specific target role */
  targetRole?: string;
}

/**
 * Extended comprehensive analysis with neuro-fuzzy fields
 */
export interface EnhancedComprehensiveAnalysis extends ComprehensiveAnalysis {
  /** Neural network score (optional, null if unavailable) */
  neuralScore?: number | null;
  /** Fuzzy logic rating (optional, null if unavailable) */
  fuzzyRating?: FuzzyRating | null;
  /** Hiring recommendation (optional, null if unavailable) */
  hiringRecommendation?: HiringRecommendation | null;
  /** Candidate rank if part of batch (optional, null if not ranked) */
  candidateRank?: number | null;
  /** Final weighted score if ranked (optional, null if not ranked) */
  finalScore?: number | null;
  /** Batch identifier if part of ranking batch (optional) */
  batchId?: string | null;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AIConfig {
  /** Parser configuration */
  parser: {
    maxFileSize: number;
    supportedFormats: string[];
    timeout: number;
  };
  /** Matcher configuration */
  matcher: {
    minMatchThreshold: number;
    importanceWeights: {
      critical: number;
      important: number;
      niceToHave: number;
    };
  };
  /** Scorer configuration */
  scorer: {
    componentWeights: {
      skills: number;
      projects: number;
      experience: number;
      education: number;
    };
    qualityThresholds: {
      excellent: number;
      competitive: number;
    };
  };
}
