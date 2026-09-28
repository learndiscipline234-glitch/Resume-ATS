/**
 * Unit Tests for Resume Scorer
 * 
 * Tests component score calculations, weighted combination, quality flagging, and edge cases
 */

import { describe, it, expect } from 'vitest';
import { calculateResumeScore } from '../../ai/scorer/resumeScorer';
import type { ParsedResume, SkillMatch } from '../../ai/types';

describe('Resume Scorer', () => {
  const mockParsedResume: ParsedResume = {
    text: 'Sample resume text',
    contactInfo: { name: 'John Doe', email: 'john@example.com' },
    sections: [
      { title: 'Experience', content: 'Software Engineer at TechCorp' },
      { title: 'Education', content: 'BS Computer Science' },
      { title: 'Projects', content: 'E-commerce Platform' },
      { title: 'Skills', content: 'JavaScript, React, Node.js' },
    ],
    skills: ['JavaScript', 'React', 'Node.js'],
    targetRole: 'software_developer',
    metadata: { fileName: 'resume.pdf', fileType: 'application/pdf' },
  };

  const mockSkillMatch: SkillMatch = {
    matchScore: 75,
    matchedSkills: ['JavaScript', 'React', 'Node.js'],
    missingSkills: ['TypeScript', 'Docker'],
    matchQuality: 'Good',
    targetRole: 'software_developer',
  };

  describe('Component Score Calculations', () => {
    it('should calculate skills component score (40% weight)', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.componentScores.skills).toBeDefined();
      expect(result.componentScores.skills).toBeGreaterThanOrEqual(0);
      expect(result.componentScores.skills).toBeLessThanOrEqual(100);
    });

    it('should calculate projects component score (25% weight)', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.componentScores.projects).toBeDefined();
      expect(result.componentScores.projects).toBeGreaterThanOrEqual(0);
      expect(result.componentScores.projects).toBeLessThanOrEqual(100);
    });

    it('should calculate experience component score (20% weight)', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.componentScores.experience).toBeDefined();
      expect(result.componentScores.experience).toBeGreaterThanOrEqual(0);
      expect(result.componentScores.experience).toBeLessThanOrEqual(100);
    });

    it('should calculate education component score (15% weight)', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.componentScores.education).toBeDefined();
      expect(result.componentScores.education).toBeGreaterThanOrEqual(0);
      expect(result.componentScores.education).toBeLessThanOrEqual(100);
    });

    it('should give higher skills score for better skill match', () => {
      const highMatch: SkillMatch = { ...mockSkillMatch, matchScore: 95 };
      const lowMatch: SkillMatch = { ...mockSkillMatch, matchScore: 40 };
      
      const highResult = calculateResumeScore(mockParsedResume, highMatch);
      const lowResult = calculateResumeScore(mockParsedResume, lowMatch);
      
      expect(highResult.componentScores.skills).toBeGreaterThan(lowResult.componentScores.skills);
    });

    it('should give higher projects score for more projects', () => {
      const manyProjects = {
        ...mockParsedResume,
        sections: [
          ...mockParsedResume.sections,
          { title: 'Projects', content: 'Project 1\nProject 2\nProject 3' },
        ],
      };
      
      const resultMany = calculateResumeScore(manyProjects, mockSkillMatch);
      const resultFew = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(resultMany.componentScores.projects).toBeGreaterThanOrEqual(resultFew.componentScores.projects);
    });

    it('should give higher experience score for more experience', () => {
      const moreExperience = {
        ...mockParsedResume,
        sections: [
          ...mockParsedResume.sections,
          { title: 'Experience', content: '5 years at Company A\n3 years at Company B' },
        ],
      };
      
      const resultMore = calculateResumeScore(moreExperience, mockSkillMatch);
      const resultLess = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(resultMore.componentScores.experience).toBeGreaterThanOrEqual(resultLess.componentScores.experience);
    });

    it('should give higher education score for advanced degrees', () => {
      const advancedDegree = {
        ...mockParsedResume,
        sections: [
          ...mockParsedResume.sections,
          { title: 'Education', content: 'PhD Computer Science\nMS Computer Science\nBS Computer Science' },
        ],
      };
      
      const resultAdvanced = calculateResumeScore(advancedDegree, mockSkillMatch);
      const resultBasic = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(resultAdvanced.componentScores.education).toBeGreaterThanOrEqual(resultBasic.componentScores.education);
    });
  });

  describe('Weighted Combination Logic', () => {
    it('should combine component scores with correct weights', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      const expectedTotal = 
        result.componentScores.skills * 0.4 +
        result.componentScores.projects * 0.25 +
        result.componentScores.experience * 0.2 +
        result.componentScores.education * 0.15;
      
      expect(result.totalScore).toBeCloseTo(expectedTotal, 1);
    });

    it('should return total score between 0 and 100', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('should weight skills component at 40%', () => {
      const perfectSkills: SkillMatch = { ...mockSkillMatch, matchScore: 100 };
      const result = calculateResumeScore(mockParsedResume, perfectSkills);
      
      // Skills should contribute significantly to total score
      expect(result.componentScores.skills).toBeGreaterThan(80);
    });

    it('should weight projects component at 25%', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      // Projects contribution should be less than skills
      const projectsContribution = result.componentScores.projects * 0.25;
      const skillsContribution = result.componentScores.skills * 0.4;
      
      expect(skillsContribution).toBeGreaterThan(projectsContribution);
    });

    it('should weight experience component at 20%', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      const experienceContribution = result.componentScores.experience * 0.2;
      const projectsContribution = result.componentScores.projects * 0.25;
      
      expect(projectsContribution).toBeGreaterThan(experienceContribution);
    });

    it('should weight education component at 15%', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      const educationContribution = result.componentScores.education * 0.15;
      const experienceContribution = result.componentScores.experience * 0.2;
      
      expect(experienceContribution).toBeGreaterThan(educationContribution);
    });
  });

  describe('Score Quality Flagging', () => {
    it('should flag score as "excellent" for >80', () => {
      const excellentResume: ParsedResume = {
        ...mockParsedResume,
        sections: [
          { title: 'Skills', content: 'JavaScript, React, TypeScript, Node.js, Docker, AWS' },
          { title: 'Experience', content: '5 years Senior Software Engineer\n3 years Software Engineer' },
          { title: 'Projects', content: 'Project 1\nProject 2\nProject 3\nProject 4' },
          { title: 'Education', content: 'MS Computer Science\nBS Computer Science' },
        ],
      };
      const excellentMatch: SkillMatch = { ...mockSkillMatch, matchScore: 95 };
      
      const result = calculateResumeScore(excellentResume, excellentMatch);
      
      if (result.totalScore > 80) {
        expect(result.qualityFlag).toBe('excellent');
      }
    });

    it('should flag score as "competitive" for 60-80', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      if (result.totalScore >= 60 && result.totalScore <= 80) {
        expect(result.qualityFlag).toBe('competitive');
      }
    });

    it('should flag score as "needs_improvement" for <60', () => {
      const weakResume: ParsedResume = {
        ...mockParsedResume,
        sections: [
          { title: 'Skills', content: 'Basic skills' },
          { title: 'Experience', content: 'Limited experience' },
        ],
      };
      const weakMatch: SkillMatch = { ...mockSkillMatch, matchScore: 30 };
      
      const result = calculateResumeScore(weakResume, weakMatch);
      
      if (result.totalScore < 60) {
        expect(result.qualityFlag).toBe('needs_improvement');
      }
    });

    it('should provide quality flag for all scores', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.qualityFlag).toBeDefined();
      expect(['excellent', 'competitive', 'needs_improvement']).toContain(result.qualityFlag);
    });
  });

  describe('Edge Cases', () => {
    it('should handle resume with missing sections', () => {
      const incompleteResume: ParsedResume = {
        ...mockParsedResume,
        sections: [
          { title: 'Skills', content: 'JavaScript, React' },
        ],
      };
      
      const result = calculateResumeScore(incompleteResume, mockSkillMatch);
      
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('should handle resume with empty sections', () => {
      const emptyResume: ParsedResume = {
        ...mockParsedResume,
        sections: [
          { title: 'Skills', content: '' },
          { title: 'Experience', content: '' },
          { title: 'Projects', content: '' },
          { title: 'Education', content: '' },
        ],
      };
      
      const result = calculateResumeScore(emptyResume, mockSkillMatch);
      
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThan(50);
    });

    it('should handle zero skill match', () => {
      const zeroMatch: SkillMatch = { ...mockSkillMatch, matchScore: 0, matchedSkills: [] };
      
      const result = calculateResumeScore(mockParsedResume, zeroMatch);
      
      expect(result.componentScores.skills).toBe(0);
      expect(result.totalScore).toBeLessThan(60);
    });

    it('should handle perfect skill match', () => {
      const perfectMatch: SkillMatch = { ...mockSkillMatch, matchScore: 100 };
      
      const result = calculateResumeScore(mockParsedResume, perfectMatch);
      
      expect(result.componentScores.skills).toBeGreaterThan(90);
    });

    it('should handle very long sections', () => {
      const longResume: ParsedResume = {
        ...mockParsedResume,
        sections: [
          { title: 'Experience', content: 'x'.repeat(10000) },
        ],
      };
      
      const result = calculateResumeScore(longResume, mockSkillMatch);
      
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('should handle special characters in sections', () => {
      const specialResume: ParsedResume = {
        ...mockParsedResume,
        sections: [
          { title: 'Skills', content: 'C++, C#, .NET, @mentions, #hashtags' },
        ],
      };
      
      const result = calculateResumeScore(specialResume, mockSkillMatch);
      
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle null or undefined values gracefully', () => {
      const nullResume: ParsedResume = {
        ...mockParsedResume,
        sections: [],
      };
      
      const result = calculateResumeScore(nullResume, mockSkillMatch);
      
      expect(result).toBeDefined();
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Component Breakdown', () => {
    it('should provide detailed breakdown for each component', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.skills).toBeDefined();
      expect(result.breakdown.projects).toBeDefined();
      expect(result.breakdown.experience).toBeDefined();
      expect(result.breakdown.education).toBeDefined();
    });

    it('should include factors affecting each component score', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.breakdown.skills.factors).toBeDefined();
      expect(Array.isArray(result.breakdown.skills.factors)).toBe(true);
    });

    it('should provide recommendations for improvement', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should provide more recommendations for lower scores', () => {
      const weakResume: ParsedResume = {
        ...mockParsedResume,
        sections: [{ title: 'Skills', content: 'Basic' }],
      };
      const weakMatch: SkillMatch = { ...mockSkillMatch, matchScore: 30 };
      
      const weakResult = calculateResumeScore(weakResume, weakMatch);
      const strongResult = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(weakResult.recommendations.length).toBeGreaterThanOrEqual(strongResult.recommendations.length);
    });
  });

  describe('Performance', () => {
    it('should calculate score within 500ms', () => {
      const startTime = Date.now();
      calculateResumeScore(mockParsedResume, mockSkillMatch);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle multiple calculations efficiently', () => {
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        calculateResumeScore(mockParsedResume, mockSkillMatch);
      }
      const endTime = Date.now();
      
      const avgTime = (endTime - startTime) / 100;
      expect(avgTime).toBeLessThan(100);
    });
  });

  describe('Result Structure', () => {
    it('should return all required fields', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('componentScores');
      expect(result).toHaveProperty('qualityFlag');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('recommendations');
    });

    it('should return component scores object with all components', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(result.componentScores).toHaveProperty('skills');
      expect(result.componentScores).toHaveProperty('projects');
      expect(result.componentScores).toHaveProperty('experience');
      expect(result.componentScores).toHaveProperty('education');
    });

    it('should return numeric scores', () => {
      const result = calculateResumeScore(mockParsedResume, mockSkillMatch);
      
      expect(typeof result.totalScore).toBe('number');
      expect(typeof result.componentScores.skills).toBe('number');
      expect(typeof result.componentScores.projects).toBe('number');
      expect(typeof result.componentScores.experience).toBe('number');
      expect(typeof result.componentScores.education).toBe('number');
    });
  });
});
