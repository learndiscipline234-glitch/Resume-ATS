import { SkillData, JobRecommendation } from '../ai/types';

/**
 * Validation Utilities
 * Helper functions for validating resume files, skill data, and job data
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate resume file before processing
 * Checks file type, size, and basic integrity
 * 
 * @param file - File object to validate
 * @param options - Validation options
 * @returns Validation result
 * 
 * @example
 * validateResumeFile(file, { maxSizeMB: 5 })
 * // { isValid: true, errors: [], warnings: [] }
 */
export function validateResumeFile(
  file: File,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const {
    maxSizeMB = 10,
    allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  } = options || {};

  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors, warnings };
  }

  // Check file type
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  const isValidType = allowedTypes.includes(fileType) ||
    fileName.endsWith('.pdf') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx');

  if (!isValidType) {
    errors.push(`Invalid file type. Supported formats: PDF, DOC, DOCX. Received: ${fileType || 'unknown'}`);
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    errors.push(`File size exceeds maximum allowed size of ${maxSizeMB}MB. File size: ${fileSizeMB.toFixed(2)}MB`);
  }

  // Check minimum file size (avoid empty files)
  if (file.size < 100) {
    errors.push('File is too small. It may be empty or corrupted.');
  }

  // Warnings for large files
  if (fileSizeMB > maxSizeMB * 0.8 && fileSizeMB <= maxSizeMB) {
    warnings.push(`File size is large (${fileSizeMB.toFixed(2)}MB). Processing may take longer.`);
  }

  // Check file name
  if (!file.name || file.name.trim() === '') {
    warnings.push('File has no name or invalid name');
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.bat', '.sh', '.cmd', '.com', '.scr'];
  if (suspiciousExtensions.some(ext => fileName.endsWith(ext))) {
    errors.push('File type is not allowed for security reasons');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate skill data structure
 * Ensures skill data has required fields and valid values
 * 
 * @param skillData - Skill data object to validate
 * @returns Validation result
 * 
 * @example
 * validateSkillData({ name: 'Python', category: 'languages', ... })
 * // { isValid: true, errors: [], warnings: [] }
 */
export function validateSkillData(skillData: Partial<SkillData>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if skillData exists
  if (!skillData || typeof skillData !== 'object') {
    errors.push('Skill data is missing or invalid');
    return { isValid: false, errors, warnings };
  }

  // Validate name (required)
  if (!skillData.name || typeof skillData.name !== 'string') {
    errors.push('Skill name is required and must be a string');
  } else if (skillData.name.trim().length === 0) {
    errors.push('Skill name cannot be empty');
  } else if (skillData.name.length > 100) {
    warnings.push('Skill name is unusually long (>100 characters)');
  }

  // Validate category (required)
  const validCategories = ['technical', 'soft_skills', 'tools', 'frameworks', 'languages', 'certifications'];
  if (!skillData.category) {
    errors.push('Skill category is required');
  } else if (!validCategories.includes(skillData.category)) {
    errors.push(`Invalid skill category. Must be one of: ${validCategories.join(', ')}`);
  }

  // Validate demand level (required)
  const validDemandLevels = ['high', 'medium', 'low'];
  if (!skillData.demandLevel) {
    errors.push('Demand level is required');
  } else if (!validDemandLevels.includes(skillData.demandLevel)) {
    errors.push(`Invalid demand level. Must be one of: ${validDemandLevels.join(', ')}`);
  }

  // Validate importance (required)
  const validImportanceLevels = ['critical', 'important', 'nice-to-have'];
  if (!skillData.importance) {
    errors.push('Importance level is required');
  } else if (!validImportanceLevels.includes(skillData.importance)) {
    errors.push(`Invalid importance level. Must be one of: ${validImportanceLevels.join(', ')}`);
  }

  // Validate related skills (optional)
  if (skillData.relatedSkills !== undefined) {
    if (!Array.isArray(skillData.relatedSkills)) {
      errors.push('Related skills must be an array');
    } else if (skillData.relatedSkills.length > 50) {
      warnings.push('Large number of related skills (>50)');
    } else {
      // Check each related skill is a string
      skillData.relatedSkills.forEach((skill, index) => {
        if (typeof skill !== 'string') {
          errors.push(`Related skill at index ${index} must be a string`);
        }
      });
    }
  }

  // Validate aliases (optional)
  if (skillData.aliases !== undefined) {
    if (!Array.isArray(skillData.aliases)) {
      errors.push('Aliases must be an array');
    } else if (skillData.aliases.length > 20) {
      warnings.push('Large number of aliases (>20)');
    } else {
      // Check each alias is a string
      skillData.aliases.forEach((alias, index) => {
        if (typeof alias !== 'string') {
          errors.push(`Alias at index ${index} must be a string`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate job recommendation data
 * Ensures job data has required fields and valid values
 * 
 * @param jobData - Job recommendation object to validate
 * @returns Validation result
 * 
 * @example
 * validateJobData({ jobId: '123', title: 'Software Engineer', ... })
 * // { isValid: true, errors: [], warnings: [] }
 */
export function validateJobData(jobData: Partial<JobRecommendation>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if jobData exists
  if (!jobData || typeof jobData !== 'object') {
    errors.push('Job data is missing or invalid');
    return { isValid: false, errors, warnings };
  }

  // Validate jobId (required)
  if (!jobData.jobId || typeof jobData.jobId !== 'string') {
    errors.push('Job ID is required and must be a string');
  } else if (jobData.jobId.trim().length === 0) {
    errors.push('Job ID cannot be empty');
  }

  // Validate title (required)
  if (!jobData.title || typeof jobData.title !== 'string') {
    errors.push('Job title is required and must be a string');
  } else if (jobData.title.trim().length === 0) {
    errors.push('Job title cannot be empty');
  } else if (jobData.title.length > 200) {
    warnings.push('Job title is unusually long (>200 characters)');
  }

  // Validate company (required)
  if (!jobData.company || typeof jobData.company !== 'string') {
    errors.push('Company name is required and must be a string');
  } else if (jobData.company.trim().length === 0) {
    errors.push('Company name cannot be empty');
  }

  // Validate location (required)
  if (!jobData.location || typeof jobData.location !== 'string') {
    errors.push('Location is required and must be a string');
  } else if (jobData.location.trim().length === 0) {
    errors.push('Location cannot be empty');
  }

  // Validate salary range (required)
  if (!jobData.salaryRange) {
    errors.push('Salary range is required');
  } else {
    if (typeof jobData.salaryRange.min !== 'number' || jobData.salaryRange.min < 0) {
      errors.push('Salary minimum must be a non-negative number');
    }
    if (typeof jobData.salaryRange.max !== 'number' || jobData.salaryRange.max < 0) {
      errors.push('Salary maximum must be a non-negative number');
    }
    if (
      typeof jobData.salaryRange.min === 'number' &&
      typeof jobData.salaryRange.max === 'number' &&
      jobData.salaryRange.min > jobData.salaryRange.max
    ) {
      errors.push('Salary minimum cannot be greater than maximum');
    }
    if (!jobData.salaryRange.currency || typeof jobData.salaryRange.currency !== 'string') {
      errors.push('Salary currency is required');
    }
    const validPeriods = ['annual', 'monthly'];
    if (!jobData.salaryRange.period || !validPeriods.includes(jobData.salaryRange.period)) {
      errors.push(`Salary period must be one of: ${validPeriods.join(', ')}`);
    }
  }

  // Validate required skills (required)
  if (!jobData.requiredSkills) {
    errors.push('Required skills are required');
  } else if (!Array.isArray(jobData.requiredSkills)) {
    errors.push('Required skills must be an array');
  } else if (jobData.requiredSkills.length === 0) {
    warnings.push('Job has no required skills listed');
  } else if (jobData.requiredSkills.length > 50) {
    warnings.push('Large number of required skills (>50)');
  } else {
    // Check each skill is a string
    jobData.requiredSkills.forEach((skill, index) => {
      if (typeof skill !== 'string') {
        errors.push(`Required skill at index ${index} must be a string`);
      }
    });
  }

  // Validate match score (required)
  if (jobData.matchScore === undefined || jobData.matchScore === null) {
    errors.push('Match score is required');
  } else if (typeof jobData.matchScore !== 'number') {
    errors.push('Match score must be a number');
  } else if (jobData.matchScore < 0 || jobData.matchScore > 100) {
    errors.push('Match score must be between 0 and 100');
  }

  // Validate skill gaps (required)
  if (!jobData.skillGaps) {
    errors.push('Skill gaps are required');
  } else if (!Array.isArray(jobData.skillGaps)) {
    errors.push('Skill gaps must be an array');
  } else {
    jobData.skillGaps.forEach((gap, index) => {
      if (!gap.skill || typeof gap.skill !== 'string') {
        errors.push(`Skill gap at index ${index} must have a valid skill name`);
      }
      const validImportance = ['critical', 'important', 'nice-to-have'];
      if (!gap.importance || !validImportance.includes(gap.importance)) {
        errors.push(`Skill gap at index ${index} must have valid importance level`);
      }
    });
  }

  // Validate experience level (required)
  if (!jobData.experienceLevel || typeof jobData.experienceLevel !== 'string') {
    errors.push('Experience level is required and must be a string');
  }

  // Validate posted date (required)
  if (!jobData.postedDate || typeof jobData.postedDate !== 'string') {
    errors.push('Posted date is required and must be a string');
  } else {
    // Try to parse as date
    const date = new Date(jobData.postedDate);
    if (isNaN(date.getTime())) {
      errors.push('Posted date is not a valid date format');
    }
  }

  // Validate description (optional)
  if (jobData.description !== undefined) {
    if (typeof jobData.description !== 'string') {
      errors.push('Job description must be a string');
    } else if (jobData.description.length > 10000) {
      warnings.push('Job description is very long (>10000 characters)');
    }
  }

  // Validate apply URL (optional)
  if (jobData.applyUrl !== undefined) {
    if (typeof jobData.applyUrl !== 'string') {
      errors.push('Apply URL must be a string');
    } else {
      try {
        new URL(jobData.applyUrl);
      } catch {
        errors.push('Apply URL is not a valid URL');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate array of skills
 * 
 * @param skills - Array of skill names
 * @returns Validation result
 */
export function validateSkillArray(skills: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(skills)) {
    errors.push('Skills must be an array');
    return { isValid: false, errors, warnings };
  }

  if (skills.length === 0) {
    warnings.push('Skills array is empty');
  }

  if (skills.length > 100) {
    warnings.push('Large number of skills (>100)');
  }

  skills.forEach((skill, index) => {
    if (typeof skill !== 'string') {
      errors.push(`Skill at index ${index} must be a string`);
    } else if (skill.trim().length === 0) {
      errors.push(`Skill at index ${index} is empty`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate email format
 * 
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * 
 * @param url - URL string to validate
 * @returns True if valid URL format
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate score value
 * 
 * @param score - Score to validate
 * @param min - Minimum allowed value (default 0)
 * @param max - Maximum allowed value (default 100)
 * @returns Validation result
 */
export function validateScore(
  score: unknown,
  min: number = 0,
  max: number = 100
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof score !== 'number') {
    errors.push('Score must be a number');
    return { isValid: false, errors, warnings };
  }

  if (isNaN(score)) {
    errors.push('Score is NaN (Not a Number)');
    return { isValid: false, errors, warnings };
  }

  if (score < min) {
    errors.push(`Score ${score} is below minimum allowed value ${min}`);
  }

  if (score > max) {
    errors.push(`Score ${score} exceeds maximum allowed value ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate date string
 * 
 * @param dateString - Date string to validate
 * @returns Validation result
 */
export function validateDate(dateString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!dateString || typeof dateString !== 'string') {
    errors.push('Date must be a string');
    return { isValid: false, errors, warnings };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    errors.push('Invalid date format');
    return { isValid: false, errors, warnings };
  }

  // Check if date is in the future
  if (date > new Date()) {
    warnings.push('Date is in the future');
  }

  // Check if date is too old (more than 50 years ago)
  const fiftyYearsAgo = new Date();
  fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
  if (date < fiftyYearsAgo) {
    warnings.push('Date is more than 50 years in the past');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
