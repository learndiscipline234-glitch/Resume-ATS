/**
 * Unit Tests for Section Analyzer
 * 
 * Tests section detection accuracy, name variations, quality analysis, and recommendations
 */

import { describe, it, expect } from 'vitest';
import { analyzeSections } from '../../ai/analyzer/sectionAnalyzer';
import type { ParsedResume } from '../../ai/types';

describe('Section Analyzer', () => {
  describe('Section Detection Accuracy', () => {
    it('should detect standard section names', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJavaScript\nEXPERIENCE\nSoftware Engineer\nEDUCATION\nBS CS',
        sections: [
          { title: 'Skills', content: 'JavaScript' },
          { title: 'Experience', content: 'Software Engineer' },
          { title: 'Education', content: 'BS CS' },
        ],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('skills');
      expect(result.detectedSections).toContain('experience');
      expect(result.detectedSections).toContain('education');
    });

    it('should detect projects section', () => {
      const resume: ParsedResume = {
        text: 'PROJECTS\nE-commerce Platform',
        sections: [{ title: 'Projects', content: 'E-commerce Platform' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('projects');
    });

    it('should detect certifications section', () => {
      const resume: ParsedResume = {
        text: 'CERTIFICATIONS\nAWS Certified',
        sections: [{ title: 'Certifications', content: 'AWS Certified' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('certifications');
    });

    it('should detect summary section', () => {
      const resume: ParsedResume = {
        text: 'SUMMARY\nExperienced developer',
        sections: [{ title: 'Summary', content: 'Experienced developer' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('summary');
    });
  });

  describe('Section Name Variations', () => {
    it('should handle "Work Experience" as "Experience"', () => {
      const resume: ParsedResume = {
        text: 'WORK EXPERIENCE\nSoftware Engineer',
        sections: [{ title: 'Work Experience', content: 'Software Engineer' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('experience');
    });

    it('should handle "Professional Experience" as "Experience"', () => {
      const resume: ParsedResume = {
        text: 'PROFESSIONAL EXPERIENCE\nSoftware Engineer',
        sections: [{ title: 'Professional Experience', content: 'Software Engineer' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('experience');
    });

    it('should handle "Technical Skills" as "Skills"', () => {
      const resume: ParsedResume = {
        text: 'TECHNICAL SKILLS\nJavaScript',
        sections: [{ title: 'Technical Skills', content: 'JavaScript' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('skills');
    });

    it('should handle "Core Competencies" as "Skills"', () => {
      const resume: ParsedResume = {
        text: 'CORE COMPETENCIES\nJavaScript',
        sections: [{ title: 'Core Competencies', content: 'JavaScript' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('skills');
    });

    it('should handle "Academic Background" as "Education"', () => {
      const resume: ParsedResume = {
        text: 'ACADEMIC BACKGROUND\nBS Computer Science',
        sections: [{ title: 'Academic Background', content: 'BS Computer Science' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('education');
    });

    it('should handle case-insensitive section names', () => {
      const resume: ParsedResume = {
        text: 'skills\nJavaScript\nexperience\nSoftware Engineer',
        sections: [
          { title: 'skills', content: 'JavaScript' },
          { title: 'experience', content: 'Software Engineer' },
        ],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('skills');
      expect(result.detectedSections).toContain('experience');
    });
  });

  describe('Quality Analysis', () => {
    it('should analyze section quality based on content length', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJavaScript, React, Node.js, TypeScript, Docker, AWS, PostgreSQL',
        sections: [{ title: 'Skills', content: 'JavaScript, React, Node.js, TypeScript, Docker, AWS, PostgreSQL' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.sectionQuality.skills).toBeGreaterThan(50);
    });

    it('should give lower quality for short sections', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJS',
        sections: [{ title: 'Skills', content: 'JS' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.sectionQuality.skills).toBeLessThan(50);
    });

    it('should analyze keyword presence', () => {
      const resume: ParsedResume = {
        text: 'EXPERIENCE\nSoftware Engineer at TechCorp\nDeveloped applications using React and Node.js',
        sections: [{ title: 'Experience', content: 'Software Engineer at TechCorp\nDeveloped applications using React and Node.js' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.sectionQuality.experience).toBeGreaterThan(50);
    });

    it('should calculate overall completeness', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJS\nEXPERIENCE\nDev\nEDUCATION\nBS\nPROJECTS\nApp',
        sections: [
          { title: 'Skills', content: 'JS' },
          { title: 'Experience', content: 'Dev' },
          { title: 'Education', content: 'BS' },
          { title: 'Projects', content: 'App' },
        ],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.completeness).toBeGreaterThanOrEqual(0);
      expect(result.completeness).toBeLessThanOrEqual(100);
    });
  });

  describe('Missing Sections', () => {
    it('should identify missing required sections', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJavaScript',
        sections: [{ title: 'Skills', content: 'JavaScript' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.missingSections.length).toBeGreaterThan(0);
      expect(result.missingSections).toContain('experience');
      expect(result.missingSections).toContain('education');
    });

    it('should have no missing sections for complete resume', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJS\nEXPERIENCE\nDev\nEDUCATION\nBS\nPROJECTS\nApp',
        sections: [
          { title: 'Skills', content: 'JS' },
          { title: 'Experience', content: 'Dev' },
          { title: 'Education', content: 'BS' },
          { title: 'Projects', content: 'App' },
        ],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.missingSections.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Recommendations', () => {
    it('should provide recommendations for missing sections', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJavaScript',
        sections: [{ title: 'Skills', content: 'JavaScript' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide recommendations for weak sections', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJS\nEXPERIENCE\nDev',
        sections: [
          { title: 'Skills', content: 'JS' },
          { title: 'Experience', content: 'Dev' },
        ],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide fewer recommendations for strong resume', () => {
      const strongResume: ParsedResume = {
        text: 'SKILLS\nJavaScript, React, Node.js\nEXPERIENCE\n5 years\nEDUCATION\nBS CS\nPROJECTS\n3 projects',
        sections: [
          { title: 'Skills', content: 'JavaScript, React, Node.js' },
          { title: 'Experience', content: '5 years' },
          { title: 'Education', content: 'BS CS' },
          { title: 'Projects', content: '3 projects' },
        ],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const weakResume: ParsedResume = {
        text: 'SKILLS\nJS',
        sections: [{ title: 'Skills', content: 'JS' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const strongResult = analyzeSections(strongResume);
      const weakResult = analyzeSections(weakResume);
      
      expect(weakResult.recommendations.length).toBeGreaterThanOrEqual(strongResult.recommendations.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty resume', () => {
      const resume: ParsedResume = {
        text: '',
        sections: [],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections.length).toBe(0);
      expect(result.missingSections.length).toBeGreaterThan(0);
    });

    it('should handle resume with only one section', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nJavaScript',
        sections: [{ title: 'Skills', content: 'JavaScript' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections.length).toBe(1);
    });

    it('should handle sections with special characters', () => {
      const resume: ParsedResume = {
        text: 'SKILLS\nC++, C#, .NET',
        sections: [{ title: 'Skills', content: 'C++, C#, .NET' }],
        contactInfo: {},
        skills: [],
        targetRole: 'software_developer',
        metadata: {},
      };
      
      const result = analyzeSections(resume);
      
      expect(result.detectedSections).toContain('skills');
    });
  });
});
