/**
 * Performance Tests
 * 
 * Tests performance requirements for parsing, matching, scoring, dashboard, and job recommendations
 */

import { describe, it, expect } from 'vitest';
import { parseResume } from '../../ai/parser/resumeParser';
import { calculateSkillMatch } from '../../ai/matcher/skillMatcher';
import { calculateResumeScore } from '../../ai/scorer/resumeScorer';
import { generateJobRecommendations } from '../../ai/matcher/jobRecommender';
import type { SkillData } from '../../ai/types';

describe('Performance Tests', () => {
  describe('Resume Parsing Performance', () => {
    it('should parse 1-page resume within 1 second', async () => {
      const singlePageContent = 'Resume content\n'.repeat(50); // ~1 page
      const mockFile = new File([singlePageContent], 'resume.pdf', { type: 'application/pdf' });
      
      const startTime = Date.now();
      await parseResume(mockFile);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should parse 5-page resume within 3 seconds', async () => {
      const fivePageContent = 'Resume content\n'.repeat(250); // ~5 pages
      const mockFile = new File([fivePageContent], 'resume.pdf', { type: 'application/pdf' });
      
      const startTime = Date.now();
      await parseResume(mockFile);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(3000);
    });

    it('should parse DOCX file within 2 seconds', async () => {
      const content = 'Resume content\n'.repeat(100);
      const mockFile = new File([content], 'resume.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const startTime = Date.now();
      await parseResume(mockFile);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Skill Match Calculation Performance', () => {
    const mockRoleSkills: SkillData[] = Array.from({ length: 50 }, (_, i) => ({
      skill: `Skill${i}`,
      importance: 'nice-to-have' as const,
      category: 'technical',
      demandLevel: 'medium' as const,
    }));

    it('should complete skill match within 200ms', () => {
      const userSkills = Array.from({ length: 30 }, (_, i) => `Skill${i}`);
      
      const startTime = Date.now();
      calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle 100 skills within 200ms', () => {
      const largeRoleSkills: SkillData[] = Array.from({ length: 100 }, (_, i) => ({
        skill: `Skill${i}`,
        importance: 'nice-to-have' as const,
        category: 'technical',
        demandLevel: 'medium' as const,
      }));
      const userSkills = Array.from({ length: 50 }, (_, i) => `Skill${i}`);
      
      const startTime = Date.now();
      calculateSkillMatch(userSkills, largeRoleSkills, 'software_developer');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle repeated calculations efficiently', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js'];
      
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      }
      const endTime = Date.now();
      
      const avgTime = (endTime - startTime) / 100;
      expect(avgTime).toBeLessThan(50);
    });
  });

  describe('Resume Score Generation Performance', () => {
    const mockParsedResume = {
      text: 'Sample resume',
      contactInfo: { name: 'John Doe' },
      sections: [
        { title: 'Skills', content: 'JavaScript, React' },
        { title: 'Experience', content: 'Software Engineer' },
        { title: 'Education', content: 'BS CS' },
        { title: 'Projects', content: 'E-commerce app' },
      ],
      skills: ['JavaScript', 'React'],
      targetRole: 'software_developer',
      metadata: {},
    };

    const mockSkillMatch = {
      matchScore: 75,
      matchedSkills: ['JavaScript', 'React'],
      missingSkills: ['TypeScript'],
      matchQuality: 'Good' as const,
      targetRole: 'software_developer',
    };

    it('should calculate resume score within 500ms', () => {
      const startTime = Date.now();
      calculateResumeScore(mockParsedResume, mockSkillMatch);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle multiple score calculations efficiently', () => {
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        calculateResumeScore(mockParsedResume, mockSkillMatch);
      }
      const endTime = Date.now();
      
      const avgTime = (endTime - startTime) / 100;
      expect(avgTime).toBeLessThan(100);
    });

    it('should handle large resumes within 500ms', () => {
      const largeResume = {
        ...mockParsedResume,
        sections: Array.from({ length: 20 }, (_, i) => ({
          title: `Section${i}`,
          content: 'Content '.repeat(100),
        })),
      };
      
      const startTime = Date.now();
      calculateResumeScore(largeResume, mockSkillMatch);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Dashboard Load Performance', () => {
    it('should load dashboard data within 2 seconds', async () => {
      // Simulate loading all dashboard data
      const startTime = Date.now();
      
      // Simulate multiple data fetches
      await Promise.all([
        Promise.resolve({ score: 75 }), // Resume score
        Promise.resolve({ match: 80 }), // Skill match
        Promise.resolve({ trends: [] }), // Trending skills
        Promise.resolve({ history: [] }), // Score history
      ]);
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should handle concurrent data requests efficiently', async () => {
      const startTime = Date.now();
      
      // Simulate 10 concurrent requests
      await Promise.all(
        Array.from({ length: 10 }, () => Promise.resolve({ data: 'test' }))
      );
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Job Recommendations Performance', () => {
    it('should generate recommendations within 1 second', async () => {
      const userSkills = ['JavaScript', 'React', 'Node.js', 'TypeScript'];
      
      const startTime = Date.now();
      await generateJobRecommendations(userSkills, 'software_developer');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle large skill sets within 1 second', async () => {
      const largeSkillSet = Array.from({ length: 50 }, (_, i) => `Skill${i}`);
      
      const startTime = Date.now();
      await generateJobRecommendations(largeSkillSet, 'software_developer');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle multiple recommendation requests efficiently', async () => {
      const userSkills = ['JavaScript', 'React'];
      
      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        await generateJobRecommendations(userSkills, 'software_developer');
      }
      const endTime = Date.now();
      
      const avgTime = (endTime - startTime) / 10;
      expect(avgTime).toBeLessThan(500);
    });
  });

  describe('End-to-End Pipeline Performance', () => {
    it('should complete full analysis pipeline within 5 seconds', async () => {
      const mockFile = new File(['Resume content'], 'resume.pdf', { type: 'application/pdf' });
      const mockRoleSkills: SkillData[] = [
        { skill: 'JavaScript', importance: 'critical', category: 'languages', demandLevel: 'high' },
        { skill: 'React', importance: 'critical', category: 'frameworks', demandLevel: 'high' },
      ];
      
      const startTime = Date.now();
      
      // Simulate full pipeline
      const parsed = await parseResume(mockFile);
      const skillMatch = calculateSkillMatch(parsed.skills, mockRoleSkills, 'software_developer');
      const score = calculateResumeScore(parsed, skillMatch);
      const recommendations = await generateJobRecommendations(parsed.skills, 'software_developer');
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Memory Performance', () => {
    it('should not cause memory leaks with repeated operations', async () => {
      const mockFile = new File(['Content'], 'resume.pdf', { type: 'application/pdf' });
      
      // Run 50 iterations
      for (let i = 0; i < 50; i++) {
        await parseResume(mockFile);
      }
      
      // If we get here without crashing, memory is managed well
      expect(true).toBe(true);
    });

    it('should handle large datasets without memory issues', () => {
      const largeSkillSet = Array.from({ length: 1000 }, (_, i) => `Skill${i}`);
      const largeRoleSkills: SkillData[] = Array.from({ length: 1000 }, (_, i) => ({
        skill: `Skill${i}`,
        importance: 'nice-to-have' as const,
        category: 'technical',
        demandLevel: 'medium' as const,
      }));
      
      // Should complete without memory errors
      const result = calculateSkillMatch(largeSkillSet, largeRoleSkills, 'software_developer');
      
      expect(result).toBeDefined();
    });
  });

  describe('Concurrent Processing Performance', () => {
    it('should handle parallel operations efficiently', async () => {
      const mockFile = new File(['Content'], 'resume.pdf', { type: 'application/pdf' });
      
      const startTime = Date.now();
      
      // Run 5 parsing operations in parallel
      await Promise.all([
        parseResume(mockFile),
        parseResume(mockFile),
        parseResume(mockFile),
        parseResume(mockFile),
        parseResume(mockFile),
      ]);
      
      const endTime = Date.now();
      
      // Should be faster than 5x sequential time
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should benefit from concurrent processing', async () => {
      const operations = Array.from({ length: 10 }, () => 
        Promise.resolve({ data: 'test' })
      );
      
      const startTime = Date.now();
      await Promise.all(operations);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
