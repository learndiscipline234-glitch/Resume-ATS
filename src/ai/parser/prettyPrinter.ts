/**
 * Pretty Printer Module
 * 
 * Converts ParsedResume objects back into human-readable text format.
 * Used for round-trip validation: parse → print → parse
 * 
 * @module ai/parser/prettyPrinter
 */

import { ParsedResume, ResumeSection } from '../types';

/**
 * Configuration options for pretty printing
 */
export interface PrettyPrintOptions {
  /** Include section headers */
  includeSectionHeaders?: boolean;
  /** Line separator (default: \n) */
  lineSeparator?: string;
  /** Section separator (default: \n\n) */
  sectionSeparator?: string;
  /** Indent size for nested content */
  indentSize?: number;
}

/**
 * Default pretty print options
 */
const DEFAULT_OPTIONS: Required<PrettyPrintOptions> = {
  includeSectionHeaders: true,
  lineSeparator: '\n',
  sectionSeparator: '\n\n',
  indentSize: 2,
};

/**
 * Formats a ParsedResume object back into readable text format
 * 
 * This function reconstructs a resume from its parsed representation,
 * preserving all extracted information including contact details,
 * sections, and metadata.
 * 
 * @param parsedResume - The parsed resume object to format
 * @param options - Formatting options
 * @returns Formatted resume text
 * 
 * @example
 * ```typescript
 * const parsed = await resumeParser.parseResume(file);
 * const formatted = formatParsedResume(parsed);
 * console.log(formatted);
 * ```
 */
export function formatParsedResume(
  parsedResume: ParsedResume,
  options: PrettyPrintOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const parts: string[] = [];

  // Add contact information header
  if (parsedResume.name || parsedResume.email || parsedResume.phone) {
    const contactParts: string[] = [];
    
    if (parsedResume.name) {
      contactParts.push(parsedResume.name);
    }
    
    if (parsedResume.email) {
      contactParts.push(`Email: ${parsedResume.email}`);
    }
    
    if (parsedResume.phone) {
      contactParts.push(`Phone: ${parsedResume.phone}`);
    }
    
    parts.push(contactParts.join(opts.lineSeparator));
  }

  // Add target role if detected
  if (parsedResume.targetRole) {
    parts.push(`Target Role: ${parsedResume.targetRole}`);
  }

  // Add sections
  if (parsedResume.sections && parsedResume.sections.length > 0) {
    const formattedSections = parsedResume.sections
      .map(section => formatSection(section, opts))
      .filter(s => s.length > 0);
    
    if (formattedSections.length > 0) {
      parts.push(...formattedSections);
    }
  }

  // Add skills section if present
  if (parsedResume.skills && parsedResume.skills.length > 0) {
    const skillsSection = formatSkillsSection(parsedResume.skills, opts);
    if (skillsSection) {
      parts.push(skillsSection);
    }
  }

  // Join all parts with section separator
  return parts.join(opts.sectionSeparator);
}

/**
 * Formats a single resume section
 * 
 * @param section - The section to format
 * @param options - Formatting options
 * @returns Formatted section text
 */
function formatSection(
  section: ResumeSection,
  options: Required<PrettyPrintOptions>
): string {
  const parts: string[] = [];

  // Add section header
  if (options.includeSectionHeaders && section.title) {
    parts.push(section.title.toUpperCase());
    parts.push(''); // Empty line after header
  }

  // Add section content
  if (section.content) {
    // Split content into lines and clean up
    const lines = section.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    parts.push(...lines);
  }

  return parts.join(options.lineSeparator);
}

/**
 * Formats the skills section
 * 
 * @param skills - Array of skill names
 * @param options - Formatting options
 * @returns Formatted skills section
 */
function formatSkillsSection(
  skills: string[],
  options: Required<PrettyPrintOptions>
): string {
  const parts: string[] = [];

  if (options.includeSectionHeaders) {
    parts.push('SKILLS');
    parts.push(''); // Empty line after header
  }

  // Format skills as comma-separated list
  const skillsList = skills.join(', ');
  parts.push(skillsList);

  return parts.join(options.lineSeparator);
}

/**
 * Validates that a parsed resume can be round-tripped
 * 
 * This function checks if formatting and re-parsing a resume
 * produces equivalent data, ensuring no information is lost.
 * 
 * @param original - Original parsed resume
 * @param roundTripped - Resume after format → parse cycle
 * @returns Validation result with similarity score
 * 
 * @example
 * ```typescript
 * const original = await parser.parseResume(file);
 * const formatted = formatParsedResume(original);
 * const reparsed = await parser.parseResume(new File([formatted], 'test.txt'));
 * const validation = validateRoundTrip(original, reparsed);
 * console.log(`Similarity: ${validation.similarityScore}%`);
 * ```
 */
export function validateRoundTrip(
  original: ParsedResume,
  roundTripped: ParsedResume
): RoundTripValidation {
  const issues: string[] = [];
  let totalFields = 0;
  let matchedFields = 0;

  // Validate contact information
  totalFields += 3;
  if (original.name === roundTripped.name) matchedFields++;
  else issues.push(`Name mismatch: "${original.name}" vs "${roundTripped.name}"`);

  if (original.email === roundTripped.email) matchedFields++;
  else if (original.email || roundTripped.email) {
    issues.push(`Email mismatch: "${original.email}" vs "${roundTripped.email}"`);
  }

  if (original.phone === roundTripped.phone) matchedFields++;
  else if (original.phone || roundTripped.phone) {
    issues.push(`Phone mismatch: "${original.phone}" vs "${roundTripped.phone}"`);
  }

  // Validate target role
  totalFields++;
  if (original.targetRole === roundTripped.targetRole) matchedFields++;
  else if (original.targetRole || roundTripped.targetRole) {
    issues.push(`Target role mismatch: "${original.targetRole}" vs "${roundTripped.targetRole}"`);
  }

  // Validate skills
  totalFields++;
  const skillsMatch = validateArrayEquality(original.skills || [], roundTripped.skills || []);
  if (skillsMatch.isEqual) {
    matchedFields++;
  } else {
    issues.push(`Skills mismatch: ${skillsMatch.missing.length} missing, ${skillsMatch.extra.length} extra`);
  }

  // Validate sections
  totalFields++;
  const sectionsMatch = validateSectionsEquality(
    original.sections || [],
    roundTripped.sections || []
  );
  if (sectionsMatch.isEqual) {
    matchedFields++;
  } else {
    issues.push(`Sections mismatch: ${sectionsMatch.issues.join(', ')}`);
  }

  // Calculate similarity score
  const similarityScore = totalFields > 0 ? (matchedFields / totalFields) * 100 : 0;

  return {
    isValid: similarityScore >= 98, // 98% threshold for validation
    similarityScore,
    issues,
    dataLoss: issues.length > 0,
  };
}

/**
 * Round-trip validation result
 */
export interface RoundTripValidation {
  /** Whether the round-trip is valid (>= 98% similarity) */
  isValid: boolean;
  /** Similarity score (0-100) */
  similarityScore: number;
  /** List of validation issues */
  issues: string[];
  /** Whether any data was lost */
  dataLoss: boolean;
}

/**
 * Array equality validation result
 */
interface ArrayEqualityResult {
  isEqual: boolean;
  missing: string[];
  extra: string[];
}

/**
 * Validates equality between two string arrays
 */
function validateArrayEquality(arr1: string[], arr2: string[]): ArrayEqualityResult {
  const set1 = new Set(arr1.map(s => s.toLowerCase().trim()));
  const set2 = new Set(arr2.map(s => s.toLowerCase().trim()));

  const missing = arr1.filter(item => !set2.has(item.toLowerCase().trim()));
  const extra = arr2.filter(item => !set1.has(item.toLowerCase().trim()));

  return {
    isEqual: missing.length === 0 && extra.length === 0,
    missing,
    extra,
  };
}

/**
 * Sections equality validation result
 */
interface SectionsEqualityResult {
  isEqual: boolean;
  issues: string[];
}

/**
 * Validates equality between two section arrays
 */
function validateSectionsEquality(
  sections1: ResumeSection[],
  sections2: ResumeSection[]
): SectionsEqualityResult {
  const issues: string[] = [];

  if (sections1.length !== sections2.length) {
    issues.push(`Section count mismatch: ${sections1.length} vs ${sections2.length}`);
  }

  // Compare sections by title
  const titles1 = sections1.map(s => s.title?.toLowerCase().trim() || '');
  const titles2 = sections2.map(s => s.title?.toLowerCase().trim() || '');

  const missingTitles = titles1.filter(t => !titles2.includes(t));
  const extraTitles = titles2.filter(t => !titles1.includes(t));

  if (missingTitles.length > 0) {
    issues.push(`Missing sections: ${missingTitles.join(', ')}`);
  }

  if (extraTitles.length > 0) {
    issues.push(`Extra sections: ${extraTitles.join(', ')}`);
  }

  // Compare content similarity for matching sections
  sections1.forEach(section1 => {
    const matchingSection = sections2.find(
      s2 => s2.title?.toLowerCase().trim() === section1.title?.toLowerCase().trim()
    );

    if (matchingSection) {
      const content1 = (section1.content || '').toLowerCase().trim();
      const content2 = (matchingSection.content || '').toLowerCase().trim();

      // Simple content similarity check (exact match)
      if (content1 !== content2) {
        const similarity = calculateStringSimilarity(content1, content2);
        if (similarity < 0.95) {
          issues.push(`Content mismatch in section "${section1.title}": ${Math.round(similarity * 100)}% similar`);
        }
      }
    }
  });

  return {
    isEqual: issues.length === 0,
    issues,
  };
}

/**
 * Calculates similarity between two strings using Jaccard similarity
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;

  // Split into words
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Exports the pretty printer functions
 */
export const PrettyPrinter = {
  formatParsedResume,
  validateRoundTrip,
};

export default PrettyPrinter;
