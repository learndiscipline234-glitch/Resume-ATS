/**
 * Resume Section Parser — FIX 2
 * 4-Step regex-based section detection and structured data extraction
 * Viva: "The parser uses regex-based heading detection to segment resume text
 * into semantic blocks, then extracts structured fields from each block
 * to compute section-level scores."
 */

// ── Step 1: Section heading patterns ─────────────────────────────────────────

const SECTION_PATTERNS: Array<{ key: string; pattern: RegExp }> = [
  { key: 'summary',        pattern: /^(summary|professional\s+summary|career\s+objective|objective|profile|about\s+me|personal\s+statement):?$/i },
  { key: 'experience',     pattern: /^(experience|work\s+experience|professional\s+experience|employment|employment\s+history|work\s+history|internship|internships|career|career\s+history|professional\s+background):?$/i },
  { key: 'education',      pattern: /^(education|educational\s+background|academic\s+background|academic\s+qualifications|qualifications|schooling|academics):?$/i },
  { key: 'skills',         pattern: /^(skills|technical\s+skills|core\s+competencies|competencies|technologies|expertise|key\s+skills|professional\s+skills|proficiencies|tools\s*[&|]\s*technologies):?$/i },
  { key: 'projects',       pattern: /^(projects|project\s+experience|personal\s+projects|academic\s+projects|key\s+projects|portfolio|notable\s+projects|side\s+projects|work\s+samples):?$/i },
  { key: 'certifications', pattern: /^(certifications?|certificates?|credentials?|licenses?|professional\s+certifications?|accreditations?):?$/i },
  // Terminators — content goes to 'misc' (not extracted, but stops bleeding into adjacent sections)
  { key: 'misc',           pattern: /^(achievements?|awards?|honors?|accomplishments?|recognition|publications?|activities|extra.?curricular|volunteer|leadership|languages?|interests?|hobbies|references?|additional\s+information):?$/i },
];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProjectEntry {
  name: string;
  techStack: string[];
  description: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}

export interface ParsedSections {
  projects:       ProjectEntry[];
  experience:     ExperienceEntry[];
  education:      EducationEntry[];
  skills:         string[];
  summary:        string;
  certifications: string[];
  rawBlocks:      Record<string, string>;
}

export interface SectionScores {
  projectsScore:   number;   // 0–25
  experienceScore: number;   // 0–20
  educationScore:  number;   // 0–15
  skillsScore:     number;   // 0–40 (from skill matching)
  totalDetected:   number;   // sections found
}

// ── Step 2: Split resume into content blocks ──────────────────────────────────

function splitIntoBlocks(text: string): Record<string, string> {
  const lines = text.split(/\n/);
  const blocks: Record<string, string> = {};
  let currentSection = 'header';
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line is a section heading (short line matching a pattern)
    if (trimmed.length <= 60) {
      let matched = false;
      for (const { key, pattern } of SECTION_PATTERNS) {
        if (pattern.test(trimmed)) {
          // Save previous block
          if (currentLines.length > 0) {
            blocks[currentSection] = (blocks[currentSection] ?? '') + '\n' + currentLines.join('\n');
          }
          currentSection = key as string;
          currentLines = [];
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }

    currentLines.push(line);
  }

  // Save last block
  if (currentLines.length > 0) {
    blocks[currentSection] = (blocks[currentSection] ?? '') + '\n' + currentLines.join('\n');
  }

  // ── Debug logging ────────────────────────────────────────────────────────────
  const detectedSections = Object.keys(blocks).filter(k => k !== 'header');
  console.log('[SectionParser] Detected sections:', detectedSections);
  console.log('[SectionParser] Block keys:', Object.keys(blocks));

  return blocks;
}

// ── Keyword-clustering fallback ────────────────────────────────────────────────
// Called when no section headings are found. Classifies lines by content.

const PROJECT_VERBS = /\b(developed|built|created|implemented|designed|deployed|architected|engineered|programmed|launched|integrated)\b/i;
const EXPERIENCE_ROLES = /\b(engineer|developer|analyst|manager|intern|lead|senior|junior|associate|director|consultant|specialist|coordinator)\b/i;
const DATE_RANGE = /(\w+\s+\d{4}|\d{4})\s*[-–—to]+\s*(\w+\s+\d{4}|\d{4}|present|current)/i;
const DEGREE_KEYWORDS = /\b(b\.?tech|b\.?e|b\.?sc|b\.?com|b\.?a|m\.?tech|m\.?sc|m\.?e|mba|phd|bachelor|master|doctorate|diploma|associate|engineering|science|arts|commerce)\b/i;

function clusterByKeywords(text: string): Record<string, string> {
  const lines = text.split('\n').filter(l => l.trim());
  const projectLines: string[] = [];
  const experienceLines: string[] = [];
  const educationLines: string[] = [];
  const skillLines: string[] = [];
  const otherLines: string[] = [];

  for (const line of lines) {
    const t = line.trim();
    if (DEGREE_KEYWORDS.test(t)) {
      educationLines.push(t);
    } else if (DATE_RANGE.test(t) && EXPERIENCE_ROLES.test(t)) {
      experienceLines.push(t);
    } else if (PROJECT_VERBS.test(t)) {
      projectLines.push(t);
    } else if (/github\.com|gitlab\.com|portfolio/i.test(t)) {
      projectLines.push(t);
    } else if (TECH_KEYWORDS.some(kw => t.toLowerCase().includes(kw)) && t.length < 100) {
      skillLines.push(t);
    } else {
      otherLines.push(t);
    }
  }

  const result: Record<string, string> = {};
  if (projectLines.length > 0)    result.projects    = projectLines.join('\n');
  if (experienceLines.length > 0) result.experience  = experienceLines.join('\n');
  if (educationLines.length > 0)  result.education   = educationLines.join('\n');
  if (skillLines.length > 0)      result.skills      = skillLines.join('\n');
  if (otherLines.length > 0)      result.header      = otherLines.join('\n');

  console.log('[SectionParser] Fallback clustering result:', Object.keys(result));
  return result;
}

// ── Step 3: Extract structured data per section ────────────�// Action verbs that appear at the START of description lines (not project titles)
const DESCRIPTION_VERBS = /^(developed|built|created|implemented|designed|deployed|architected|engineered|programmed|launched|integrated|solved|achieved|led|managed|reduced|increased|improved|optimized|automated|analyzed|trained|used|utilized|leveraged|worked|collaborated|maintained|contributed|performed|conducted|assisted|supported|tested|debugged|wrote|researched|gathered|built|configured|set\s+up|set\s*up|established)/i;

// Prefixes that indicate a descriptor line, not a project title (should not start new project)
const DESCRIPTOR_PREFIXES = /^(tech(?:nologies)?|tools?|stack|built\s+with|using|github|gitlab|link|description|role|languages?|frameworks?|duration|date|period|gpa|cgpa|percentage|grade)/i;

function extractProjects(block: string): ProjectEntry[] {
  if (!block.trim()) return [];

  const lines = block.split('\n').filter(l => l.trim());
  const projectChunks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Strip leading bullet/number to get the actual content
    const content = trimmed.replace(/^[•\-\*\d.)\s]+/, '').trim();

    const hasBullet   = /^[•\-\*]\s/.test(trimmed);
    const isNumbered  = /^\d+[.)\s]/.test(trimmed);

    // A PROJECT TITLE bullet: has a bullet AND the content does NOT start with an action verb
    // e.g. "• Next Step Career AI" → title ✓
    // e.g. "• Developed an interactive dashboard..." → description ✗
    const isProjectTitleBullet = (hasBullet || isNumbered)
      && !DESCRIPTION_VERBS.test(content)
      && !DESCRIPTOR_PREFIXES.test(content);

    // A standalone capitalized title with colon (e.g. "E-Commerce App:") but NOT
    // descriptor lines like "Tech Stack: ..." or "Technologies: ..."
    const isColonTitle = /^[A-Z][\w\s\-\/]+:/.test(trimmed)
      && trimmed.length < 70
      && !DESCRIPTION_VERBS.test(trimmed)
      && !DESCRIPTOR_PREFIXES.test(trimmed);

    if (isProjectTitleBullet || isColonTitle) {
      if (current.length > 0) projectChunks.push(current);
      current = [trimmed];
    } else if (trimmed) {
      // Everything else (descriptions, tech stacks, verbs) → part of current project
      current.push(trimmed);
    }
  }
  if (current.length > 0) projectChunks.push(current);

  // Fallback: if nothing split (no bullets at all), try splitting on blank lines,
  // then on capitalized short lines that don't have action verbs
  if (projectChunks.length <= 1 && lines.length > 2) {
    const altChunks: string[][] = [];
    let altCurrent: string[] = [];
    for (const line of lines) {
      const t = line.trim();
      // A "title" line: short, starts with capital, no action verb, no descriptor prefix
      const looksLikeTitle = t.length < 70
        && /^[A-Z]/.test(t)
        && !DESCRIPTION_VERBS.test(t)
        && !DESCRIPTOR_PREFIXES.test(t)
        && !/[@\d{10}]|https?:|github\.com/i.test(t);
      if (looksLikeTitle && altCurrent.length > 0) {
        altChunks.push(altCurrent);
        altCurrent = [t];
      } else if (t) {
        altCurrent.push(t);
      }
    }
    if (altCurrent.length > 0) altChunks.push(altCurrent);
    if (altChunks.length > projectChunks.length) {
      projectChunks.length = 0;
      projectChunks.push(...altChunks);
    }
  }

  const chunks = projectChunks.length > 0 ? projectChunks : lines.map(l => [l]);

  const projects: ProjectEntry[] = [];
  for (const chunk of chunks.slice(0, 12)) {
    const text = chunk.join(' ');
    if (text.length < 5) continue;

    // Project name = first line, stripped of bullets/numbers/trailing descriptors
    const rawName = chunk[0]
      .replace(/^[•\-\*\d.)\s]+/, '')    // strip bullet/number prefix
      .replace(/\s*[-–—|]\s*.*$/, '')     // strip " — description" suffixes
      .split(':')[0]                       // take the part before any colon
      .trim()
      .slice(0, 80);

    if (rawName.length < 3) continue;
    if (/^https?:\/\//i.test(rawName)) continue;
    if (DESCRIPTION_VERBS.test(rawName)) continue;  // skip if name is a verb phrase
    if (DESCRIPTOR_PREFIXES.test(rawName)) continue; // skip "Tech Stack" etc.

    // Extract tech stack from full chunk text
    const lowerText = text.toLowerCase();
    const techStack = TECH_KEYWORDS.filter(t => lowerText.includes(t));
    const techMatch = text.match(/(?:tech(?:nologies)?|stack|built\s+with|using|tools?)[:\s]+([^.\n]{3,80})/i);
    if (techMatch) {
      techMatch[1].split(/[,;|]/)
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 1 && t.length < 30)
        .forEach(t => { if (!techStack.includes(t)) techStack.push(t); });
    }

    projects.push({
      name:        rawName,
      techStack:   [...new Set(techStack)].slice(0, 8),
      description: chunk.slice(1).join(' ').trim().slice(0, 250),
    });
  }

  console.log('[SectionParser] Project chunks found:', projectChunks.length, '→ valid projects:', projects.length);
}

function extractExperience(block: string): ExperienceEntry[] {
  if (!block.trim()) return [];
  const entries: ExperienceEntry[] = [];
  const lines = block.split('\n').filter(l => l.trim());

  // Duration patterns
  const durationPattern = /(\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|present|current)/i;
  const dateRangePattern = /(\w+\s+\d{4}|\d{4})\s*[-–—to]+\s*(\w+\s+\d{4}|\d{4}|present|current)/i;

  // Group lines into experience entries
  const chunks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // New entry: line with company/role indicators
    if (
      /^[A-Z]/.test(trimmed) &&
      (durationPattern.test(trimmed) || /\b(engineer|developer|analyst|manager|intern|lead|senior|junior|associate)\b/i.test(trimmed))
    ) {
      if (current.length > 0) chunks.push(current);
      current = [trimmed];
    } else if (trimmed) {
      current.push(trimmed);
    }
  }
  if (current.length > 0) chunks.push(current);

  // Fallback: split by blank lines
  if (chunks.length === 0) {
    const text = block.trim();
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    paragraphs.forEach(p => chunks.push(p.split('\n').filter(l => l.trim())));
  }

  for (const chunk of chunks.slice(0, 8)) {
    if (chunk.length === 0) continue;
    const firstLine = chunk[0].trim();

    // Extract duration
    const durationMatch = firstLine.match(dateRangePattern) ?? chunk.join(' ').match(dateRangePattern);
    const duration = durationMatch ? durationMatch[0] : '';

    // Extract role and company
    const cleanFirst = firstLine.replace(dateRangePattern, '').trim();
    const parts = cleanFirst.split(/[,|@\-–—at]/i).map(p => p.trim()).filter(Boolean);
    const role    = parts[0] ?? cleanFirst;
    const company = parts[1] ?? '';

    entries.push({
      role:        role.slice(0, 80),
      company:     company.slice(0, 80),
      duration:    duration.slice(0, 40),
      description: chunk.slice(1).join(' ').trim().slice(0, 300),
    });
  }

  return entries.filter(e => e.role.length > 2);
}

function extractEducation(block: string): EducationEntry[] {
  if (!block.trim()) return [];
  const lines = block.split('\n').filter(l => l.trim());

  // Only match lines that explicitly contain a degree keyword — do NOT match
  // plain capitalized lines (that rule falsely caught header/contact lines).
  const degreeKeywords = /\b(b\.?tech|b\.?e\.?|b\.?sc|b\.?com|b\.?a\.?|m\.?tech|m\.?sc|m\.?e\.?|mba|ph\.?d|bachelor|master|doctorate|diploma|associate|engineering|computer\s+science|information\s+technology|b\.?c\.?a|m\.?c\.?a)\b/i;
  const yearPattern = /\b(19|20)\d{2}\b/;

  // Group lines into education entries — a new entry starts ONLY on a degree keyword match
  const chunks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip lines that look like contact info (email, phone, URLs)
    if (/[@+]|\d{10}|linkedin|github|http/i.test(trimmed) && trimmed.length < 100) continue;

    if (degreeKeywords.test(trimmed)) {
      if (current.length > 0) chunks.push(current);
      current = [trimmed];
    } else if (trimmed && current.length > 0) {
      // Only append to an education entry already started
      current.push(trimmed);
    }
  }
  if (current.length > 0) chunks.push(current);

  // Last-resort fallback: if no degree keywords found, grab lines with years
  if (chunks.length === 0) {
    const yearLines = lines.filter(l => yearPattern.test(l) && !/[@+]|\d{10}|linkedin|github|http/i.test(l));
    if (yearLines.length > 0) chunks.push(yearLines);
  }

  const entries: EducationEntry[] = [];
  for (const chunk of chunks.slice(0, 5)) {
    const text = chunk.join(' ');
    const yearMatch = text.match(/\b(19|20)\d{2}\b/g);
    const year = yearMatch ? yearMatch.join('–') : '';

    const degreeMatch = text.match(degreeKeywords);
    const degree = degreeMatch
      ? text.slice(0, text.indexOf(degreeMatch[0]) + degreeMatch[0].length + 40).trim()
      : chunk[0].trim();

    const institution = chunk.length > 1
      ? chunk[1].trim()
      : text.replace(degree, '').replace(year, '').trim().slice(0, 80);

    if (degree.length < 3 && institution.length < 3) continue;

    entries.push({
      degree:      degree.slice(0, 100),
      institution: institution.slice(0, 100),
      year:        year.slice(0, 20),
    });
  }

  return entries.filter(e => e.degree.length > 2 || e.institution.length > 2);
}

// ── Step 4: Score each section ────────────────────────────────────────────────

export function scoreSections(parsed: ParsedSections, skillMatchScore = 0): SectionScores {
  // Projects: 1-2 → 10 pts, 3-4 → 18 pts, 5+ → 25 pts
  let projectsScore = 0;
  if (parsed.projects.length >= 5)      projectsScore = 25;
  else if (parsed.projects.length >= 3) projectsScore = 18;
  else if (parsed.projects.length >= 1) projectsScore = 10;

  // Experience: 1 entry (internship) → 10 pts, 2+ (full-time) → 20 pts
  let experienceScore = 0;
  if (parsed.experience.length >= 2)      experienceScore = 20;
  else if (parsed.experience.length === 1) experienceScore = 10;

  // Education: degree detected → full 15 pts
  const educationScore = parsed.education.length > 0 ? 15 : 0;

  // Skills: derived from ML match score (0–40)
  const skillsScore = Math.round(Math.min(40, skillMatchScore * 0.4));

  const totalDetected = [
    parsed.projects.length > 0,
    parsed.experience.length > 0,
    parsed.education.length > 0,
    parsed.skills.length > 0,
    parsed.summary.length > 0,
  ].filter(Boolean).length;

  console.log('[SectionParser] Scores — projects:', projectsScore, '| experience:', experienceScore,
    '| education:', educationScore, '| skills:', skillsScore);

  return { projectsScore, experienceScore, educationScore, skillsScore, totalDetected };
}

// ── Main parser function ──────────────────────────────────────────────────────

export function parseResumeSections(resumeText: string): ParsedSections {
  // Step 2: Split into blocks
  let rawBlocks = splitIntoBlocks(resumeText);

  // Step 9: Fallback — if no section headings detected, use keyword clustering
  const detectedKeys = Object.keys(rawBlocks).filter(k => k !== 'header');
  if (detectedKeys.length === 0) {
    console.log('[SectionParser] No headings detected — falling back to keyword clustering');
    rawBlocks = clusterByKeywords(resumeText);
  }

  // Step 3: Extract structured data
  const projects   = extractProjects(rawBlocks.projects ?? '');
  const experience = extractExperience(rawBlocks.experience ?? '');
  const education  = extractEducation(rawBlocks.education ?? '');

  // Debug logging (requirement #8)
  console.log('[SectionParser] extracted_projects_count:', projects.length);
  console.log('[SectionParser] extracted_experience_count:', experience.length);
  console.log('[SectionParser] extracted_education_count:', education.length);
  console.log('[SectionParser] projects_block_chars:', (rawBlocks.projects ?? '').length);
  console.log('[SectionParser] experience_block_chars:', (rawBlocks.experience ?? '').length);
  console.log('[SectionParser] education_block_chars:', (rawBlocks.education ?? '').length);

  // Extract skills list
  const skillsBlock = rawBlocks.skills ?? '';
  const skills = skillsBlock
    .split(/[,\n•\-\*]/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 40)
    .slice(0, 30);

  // Extract summary
  const summary = (rawBlocks.summary ?? '').trim().slice(0, 500);

  // Extract certifications
  const certBlock = rawBlocks.certifications ?? '';
  const certifications = certBlock
    .split(/\n/)
    .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
    .filter(s => s.length > 3)
    .slice(0, 10);

  return {
    projects,
    experience,
    education,
    skills,
    summary,
    certifications,
    rawBlocks,
  };
}
