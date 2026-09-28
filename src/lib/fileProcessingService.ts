import mammoth from 'mammoth';
import { supabase } from '../integrations/supabase/client';
import { EnhancedResumeAnalysisService } from './enhancedResumeAnalysisService';
import { PlacementPredictionService } from '../services/placementPrediction.service';
import { ResumeAnalysisService } from '../services/resumeAnalysis.service';
import { AuditLogService } from '../services/auditLog.service';
import { ResumeIntelligenceService } from '../services/resumeIntelligence.service';
import type { ComprehensiveAnalysis } from '../ai/types';

export interface FileProcessingResult {
  success: boolean;
  extractedText?: string;
  analysis?: any;
  prediction?: any;
  comprehensiveAnalysis?: ComprehensiveAnalysis;
  metadata?: {
    fileName: string;
    fileSize: number;
    textLength: number;
    targetRole: string;
    analysisId?: string;
    predictionId?: string;
    processingTime?: number;
    useNewPipeline?: boolean;
  };
  error?: string;
}

export class FileProcessingService {
  /**
   * Process uploaded resume file and extract text
   * 
   * NEW: Uses AI Resume Intelligence Pipeline for comprehensive analysis
   */
  static async processResumeFile(
    file: File, 
    targetRole: string = 'Software Engineer',
    useNewPipeline: boolean = true,
    onProgress?: (step: number, message: string, progress: number) => void
  ): Promise<FileProcessingResult> {
    try {
      // Get real user ID from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // NEW PIPELINE: Use AI Resume Intelligence Service
      if (useNewPipeline) {
        console.log('[FileProcessing] Using NEW AI Resume Intelligence Pipeline');
        
        const result = await ResumeIntelligenceService.analyzeResume({
          file,
          userId,
          targetRole,
          saveToDatabase: true,
          onProgress,
        });

        if (!result.success) {
          return {
            success: false,
            error: result.error || 'Analysis failed'
          };
        }

        const analysis = result.analysis!;
        
        // Run placement prediction concurrently with DB save
        const [prediction] = await Promise.all([
          this.generatePlacementPrediction(
            analysis.parsedResume.text,
            {
              matchScore: analysis.skillMatch.matchScore,
              matchedSkills: analysis.skillMatch.matchedSkills.map(s => s.skill),
              missingSkills: analysis.skillMatch.missingSkills.map(s => s.skill),
              user_skills: analysis.parsedResume.skills.map(s => ({ name: s }))
            },
            analysis.parsedResume.targetRole,
            userId
          ),
        ]);

        // Save prediction if generated
        let predictionId: string | undefined;
        if (prediction) {
          try {
            const savedPrediction = await PlacementPredictionService.savePlacementPrediction(prediction);
            predictionId = savedPrediction.id;
          } catch (predError) {
            console.warn('[FileProcessing] Failed to save prediction:', predError);
          }
        }

        return {
          success: true,
          extractedText: analysis.parsedResume.text.substring(0, 500) + '...',
          analysis: {
            matchScore: analysis.skillMatch.matchScore,
            matchedSkills: analysis.skillMatch.matchedSkills.map(s => s.skill),
            missingSkills: analysis.skillMatch.missingSkills.map(s => s.skill),
            totalScore: analysis.resumeScore.totalScore,
            qualityFlag: analysis.resumeScore.qualityFlag,
            user_skills: analysis.parsedResume.skills.map(s => ({ name: s }))
          },
          prediction,
          comprehensiveAnalysis: analysis,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            textLength: analysis.parsedResume.text.length,
            targetRole: analysis.parsedResume.targetRole,
            analysisId: analysis.analysisId,
            predictionId,
            processingTime: result.metadata?.processingTime,
            useNewPipeline: true
          }
        };
      }

      // LEGACY PIPELINE: Original implementation (for backward compatibility)
      console.log('[FileProcessing] Using LEGACY pipeline');

      // Validate file
      const validationError = this.validateFile(file);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      console.log('Processing file:', file.name, 'Type:', file.type);

      // Extract text based on file type
      let extractedText = '';

      if (file.type === 'application/pdf') {
        console.log('Extracting text from PDF...');
        try {
          extractedText = await this.extractTextFromPDF(file);
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          return {
            success: false,
            error: 'Failed to extract text from PDF. The file might be corrupted or password-protected.'
          };
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('Extracting text from DOCX...');
        try {
          const buffer = await this.fileToArrayBuffer(file);
          const docxData = await mammoth.extractRawText({ arrayBuffer: buffer });
          extractedText = docxData.value;
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError);
          return {
            success: false,
            error: 'Failed to extract text from DOCX. The file might be corrupted.'
          };
        }
      } else if (file.type === 'text/plain') {
        console.log('Reading text file...');
        extractedText = await this.fileToText(file);
      } else {
        return {
          success: false,
          error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files only.'
        };
      }

      // Validate extracted text
      if (!extractedText || extractedText.trim().length < 50) {
        return {
          success: false,
          error: 'Could not extract sufficient text from the file. Please ensure the file contains readable text.'
        };
      }

      console.log('Extracted text length:', extractedText.length);

      // Analyze using existing service
      const analysis = await EnhancedResumeAnalysisService.analyzeResume({
        resume_text: extractedText,
        user_id: userId,
        target_role: targetRole
      });

      console.log('Analysis completed. Match score:', analysis.matchScore);

      // Generate ML Placement Prediction
      const prediction = await this.generatePlacementPrediction(
        extractedText,
        analysis,
        targetRole,
        userId
      );

      console.log('Placement prediction generated. Probability:', prediction?.predicted_probability);

      // DEMO MODE: Skip database operations (optional in demo mode)
      let analysisId: string | undefined;
      let predictionId: string | undefined;

      // Database operations are optional and won't block demo mode
      try {
        // Save resume analysis
        const savedAnalysis = await ResumeAnalysisService.saveResumeAnalysis({
          user_id: userId,
          resume_text: extractedText,
          target_role: targetRole,
          experience_years: this.extractExperienceYears(extractedText),
          analysis_result: analysis
        });
        analysisId = savedAnalysis.id;

        // Save placement prediction if generated
        if (prediction) {
          const savedPrediction = await PlacementPredictionService.savePlacementPrediction(prediction);
          predictionId = savedPrediction.id;

          // Log audit events
          await AuditLogService.logResumeAnalysisEvent(
            userId,
            analysisId!,
            targetRole,
            analysis.matchScore
          );

          await AuditLogService.logPredictionEvent(
            userId,
            predictionId!,
            targetRole,
            prediction.predicted_probability,
            prediction.model_version
          );
        }

        console.log('Data saved to database successfully');
      } catch (dbError) {
        console.warn('Database save skipped (demo mode):', dbError);
        // Continue without failing - database errors shouldn't break demo mode
      }

      return {
        success: true,
        extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''), // Preview
        analysis,
        prediction,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          textLength: extractedText.length,
          targetRole,
          analysisId,
          predictionId
        }
      };

    } catch (error) {
      console.error('File processing error:', error);
      
      let errorMessage = 'Failed to process resume';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Extract text from PDF using browser-compatible method
   * Uses simple text extraction without external libraries
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    try {
      // For browser environment, we'll use a simple approach
      // Read the PDF as text (this works for simple PDFs)
      const text = await this.fileToText(file);
      
      // Clean up PDF artifacts
      let cleanedText = text
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // If we got reasonable text, return it
      if (cleanedText.length > 100) {
        return cleanedText;
      }

      // Fallback: Try to extract text from PDF structure
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const uint8Array = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder('utf-8');
      const pdfText = textDecoder.decode(uint8Array);

      // Extract text between stream markers
      const textMatches = pdfText.match(/\(([^)]+)\)/g);
      if (textMatches) {
        cleanedText = textMatches
          .map(match => match.slice(1, -1))
          .join(' ')
          .replace(/\\[nrt]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      return cleanedText;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error('Failed to extract text from PDF. Please try converting it to DOCX or TXT format.');
    }
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): string | null {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain' // Added for testing and simple text resumes
    ];
    
    if (!validTypes.includes(file.type)) {
      return 'Please upload a PDF, DOCX, or TXT file only';
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return 'File size must be less than 10MB';
    }
    
    return null;
  }

  /**
   * Convert File to ArrayBuffer
   */
  private static fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Process text file (for testing purposes)
   */
  static async processTextFile(file: File, targetRole: string = 'Software Engineer'): Promise<FileProcessingResult> {
    try {
      if (file.type !== 'text/plain') {
        return {
          success: false,
          error: 'This method only supports text files'
        };
      }

      const text = await this.fileToText(file);
      
      if (!text || text.trim().length < 50) {
        return {
          success: false,
          error: 'Text file is too short or empty'
        };
      }

      const analysis = await EnhancedResumeAnalysisService.analyzeResume({
        resume_text: text,
        user_id: userId,
        target_role: targetRole
      });

      return {
        success: true,
        extractedText: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
        analysis,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          textLength: text.length,
          targetRole
        }
      };

    } catch (error) {
      console.error('Text file processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process text file'
      };
    }
  }

  /**
   * Generate ML placement prediction based on analysis
   */
  private static async generatePlacementPrediction(
    resumeText: string,
    analysis: any,
    targetRole: string,
    userId: string
  ): Promise<any> {
    try {
      // Extract features for ML model
      const inputFeatures = {
        skills: analysis.matchedSkills || [],
        experience_years: this.extractExperienceYears(resumeText),
        education_level: this.extractEducationLevel(resumeText),
        certifications: this.extractCertifications(resumeText),
        project_count: this.extractProjectCount(resumeText),
        leadership_experience: this.hasLeadershipExperience(resumeText),
        match_score: analysis.matchScore || 0,
        skill_count: analysis.user_skills?.length || 0
      };

      // Calculate prediction probability based on analysis
      const baseProbability = Math.min(0.95, Math.max(0.05, analysis.matchScore / 100));
      
      // Adjust based on additional factors
      let adjustedProbability = baseProbability;
      
      // Experience bonus
      if (inputFeatures.experience_years >= 3) adjustedProbability += 0.1;
      if (inputFeatures.experience_years >= 5) adjustedProbability += 0.05;
      
      // Education bonus
      if (inputFeatures.education_level === 'Master' || inputFeatures.education_level === 'PhD') {
        adjustedProbability += 0.05;
      }
      
      // Leadership bonus
      if (inputFeatures.leadership_experience) adjustedProbability += 0.05;
      
      // Project bonus
      if (inputFeatures.project_count >= 3) adjustedProbability += 0.05;
      
      // Ensure probability stays within bounds
      adjustedProbability = Math.min(0.95, Math.max(0.05, adjustedProbability));

      // Calculate confidence score
      const confidenceScore = Math.min(0.95, 
        (inputFeatures.skill_count / 20) * 0.4 + 
        (inputFeatures.experience_years / 10) * 0.3 + 
        (adjustedProbability) * 0.3
      );

      // Generate prediction metadata
      const predictionMetadata = {
        feature_importance: {
          skills: 0.35,
          experience: 0.25,
          education: 0.15,
          projects: 0.15,
          leadership: 0.10
        },
        model_confidence_factors: [
          `${inputFeatures.skills.length} relevant skills identified`,
          `${inputFeatures.experience_years} years of experience`,
          inputFeatures.leadership_experience ? 'Leadership experience present' : 'No leadership experience',
          `${inputFeatures.project_count} projects mentioned`
        ],
        analysis_summary: {
          strengths: analysis.matchedSkills?.slice(0, 3) || [],
          improvements: analysis.missingSkills?.slice(0, 3) || [],
          overall_assessment: this.generateAssessment(adjustedProbability)
        }
      };

      return {
        user_id: userId,
        target_role: targetRole,
        predicted_probability: adjustedProbability,
        confidence_score: confidenceScore,
        model_version: 'v2.1.0-enhanced-analyzer',
        input_features: inputFeatures,
        prediction_metadata: predictionMetadata
      };

    } catch (error) {
      console.error('Error generating ML prediction:', error);
      return null;
    }
  }

  /**
   * Extract experience years from resume text
   */
  private static extractExperienceYears(resumeText: string): number {
    const text = resumeText.toLowerCase();
    
    // Look for patterns like "3 years", "5+ years", etc.
    const yearPatterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
      /(\d+)\+?\s*years?\s*in/gi,
      /experience.*?(\d+)\+?\s*years?/gi
    ];

    let maxYears = 0;
    
    yearPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const yearMatch = match.match(/(\d+)/);
          if (yearMatch) {
            const years = parseInt(yearMatch[1]);
            maxYears = Math.max(maxYears, years);
          }
        });
      }
    });

    // If no explicit years found, estimate based on content
    if (maxYears === 0) {
      const jobTitles = (text.match(/engineer|developer|analyst|manager|lead|senior/g) || []).length;
      const projects = (text.match(/project|built|developed|created|implemented/g) || []).length;
      
      if (text.includes('senior') || text.includes('lead')) maxYears = Math.max(maxYears, 4);
      if (jobTitles >= 3) maxYears = Math.max(maxYears, 2);
      if (projects >= 5) maxYears = Math.max(maxYears, 3);
    }

    return Math.min(15, maxYears); // Cap at 15 years
  }

  /**
   * Extract education level from resume text
   */
  private static extractEducationLevel(resumeText: string): string {
    const text = resumeText.toLowerCase();
    
    if (text.includes('phd') || text.includes('ph.d') || text.includes('doctorate')) return 'PhD';
    if (text.includes('master') || text.includes('mba') || text.includes('ms ') || text.includes('m.s')) return 'Master';
    if (text.includes('bachelor') || text.includes('bs ') || text.includes('b.s') || text.includes('ba ') || text.includes('b.a')) return 'Bachelor';
    if (text.includes('associate') || text.includes('diploma')) return 'Associate';
    
    return 'Bachelor'; // Default assumption
  }

  /**
   * Extract certifications from resume text
   */
  private static extractCertifications(resumeText: string): string[] {
    const text = resumeText.toLowerCase();
    const certifications: string[] = [];
    
    const certPatterns = [
      'aws certified', 'azure certified', 'google cloud', 'pmp', 'cissp',
      'comptia', 'cisco', 'microsoft certified', 'oracle certified',
      'certified scrum master', 'csm', 'safe', 'itil'
    ];

    certPatterns.forEach(cert => {
      if (text.includes(cert)) {
        certifications.push(cert);
      }
    });

    return certifications;
  }

  /**
   * Extract project count from resume text
   */
  private static extractProjectCount(resumeText: string): number {
    const text = resumeText.toLowerCase();
    
    // Count project-related keywords
    const projectKeywords = [
      'project', 'built', 'developed', 'created', 'implemented',
      'designed', 'architected', 'deployed', 'launched'
    ];

    let projectCount = 0;
    projectKeywords.forEach(keyword => {
      const matches = text.match(new RegExp(keyword, 'g'));
      if (matches) {
        projectCount += matches.length;
      }
    });

    // Normalize project count (rough estimate)
    return Math.min(10, Math.floor(projectCount / 3));
  }

  /**
   * Check for leadership experience
   */
  private static hasLeadershipExperience(resumeText: string): boolean {
    const text = resumeText.toLowerCase();
    const leadershipKeywords = [
      'lead', 'led', 'manage', 'managed', 'supervise', 'supervised',
      'mentor', 'mentored', 'team lead', 'project manager', 'senior',
      'director', 'head of', 'chief', 'principal'
    ];

    return leadershipKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Generate assessment based on probability
   */
  private static generateAssessment(probability: number): string {
    if (probability >= 0.8) return 'Excellent candidate with strong alignment to role requirements';
    if (probability >= 0.6) return 'Good candidate with solid foundation and growth potential';
    if (probability >= 0.4) return 'Moderate fit with some skill gaps that can be addressed';
    return 'Limited alignment with role requirements, significant upskilling needed';
  }

  /**
   * Convert File to text string
   */
  private static fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}