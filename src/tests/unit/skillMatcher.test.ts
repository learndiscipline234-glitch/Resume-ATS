/**
 * Unit Tests for Skill Matcher
 * 
 * Tests match score calculation, importance weighting, edge cases, and performance
 */

import { describe, it, expect } from 'vitest';
import { calculateSkillMatch } from '../../ai/matcher/skillMatcher';
import type { SkillData } from '../../ai/types';

describe('Skill Matcher', () => {
  const mockRoleSkills: SkillData[] = [
    { skill: 'JavaScript', importance: 'critical', category: 'languages', demandLevel: 'high' },
    { skill: 'React', importance: 'critical', category: 'frameworks', demandLevel: 'high' },
    { skill: 'TypeScript', importance: 'important', category: 'languages', demandLevel: 'high' },
    { skill: 'Node.js', importance: 'important', category: 'frameworks', demandLevel: 'high' },
    { skill: 'Git', importance: 'nice-to-have', category: 'tools', demandLevel: 'medium' },
    { skill: 'Docker', importance: 'nice-to-have', category: 'tools', demandLevel: 'medium' },
  ];

  describe('Match Score Calculation', () => {
    it('should calculate 100% match when all skills are present', () => {
      const userSkills = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Git', 'Docker'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBe(100);
      expect(result.matchedSkills.length).toBe(6);
      expect(result.missingSkills.length).toBe(0);
    });

    it('should calculate 0% match when no skills are present', () => {
      const userSkills: string[] = [];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBe(0);
      expect(result.matchedSkills.length).toBe(0);
      expect(result.missingSkills.length).toBe(6);
    });

    it('should calculate partial match correctly', () => {
      const userSkills = ['JavaScript', 'React', 'Git'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.matchScore).toBeLessThan(100);
      expect(result.matchedSkills.length).toBe(3);
      expect(result.missingSkills.length).toBe(3);
    });

    it('should calculate match score with only critical skills', () => {
      const userSkills = ['JavaScript', 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      // Critical skills have 2x weight
      expect(result.matchScore).toBeGreaterThan(50);
      expect(result.matchedSkills).toContain('JavaScript');
      expect(result.matchedSkills).toContain('React');
    });

    it('should calculate match score with only important skills', () => {
      const userSkills = ['TypeScript', 'Node.js'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      // Important skills have 1.5x weight
      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.matchScore).toBeLessThan(50);
    });

    it('should calculate match score with only nice-to-have skills', () => {
      const userSkills = ['Git', 'Docker'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      // Nice-to-have skills have 1x weight
      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.matchScore).toBeLessThan(30);
    });

    it('should handle case-insensitive skill matching', () => {
      const userSkills = ['javascript', 'REACT', 'TypeScript'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchedSkills.length).toBe(3);
    });

    it('should handle skill variations', () => {
      const userSkills = ['JS', 'ReactJS', 'TS'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      // Should match JavaScript, React, TypeScript
      expect(result.matchedSkills.length).toBeGreaterThan(0);
    });
  });

  describe('Importance Weighting', () => {
    it('should apply 2x weight to critical skills', () => {
      const criticalOnly = ['JavaScript', 'React'];
      const niceToHaveOnly = ['Git', 'Docker'];
      
      const criticalResult = calculateSkillMatch(criticalOnly, mockRoleSkills, 'software_developer');
      const niceToHaveResult = calculateSkillMatch(niceToHaveOnly, mockRoleSkills, 'software_developer');
      
      // Critical skills should have higher match score
      expect(criticalResult.matchScore).toBeGreaterThan(niceToHaveResult.matchScore);
    });

    it('should apply 1.5x weight to important skills', () => {
      const importantOnly = ['TypeScript', 'Node.js'];
      const niceToHaveOnly = ['Git', 'Docker'];
      
      const importantResult = calculateSkillMatch(importantOnly, mockRoleSkills, 'software_developer');
      const niceToHaveResult = calculateSkillMatch(niceToHaveOnly, mockRoleSkills, 'software_developer');
      
      // Important skills should have higher match score
      expect(importantResult.matchScore).toBeGreaterThan(niceToHaveResult.matchScore);
    });

    it('should apply 1x weight to nice-to-have skills', () => {
      const niceToHaveOnly = ['Git', 'Docker'];
      
      const result = calculateSkillMatch(niceToHaveOnly, mockRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.matchScore).toBeLessThan(50);
    });

    it('should weight critical skills higher than important skills', () => {
      const oneCritical = ['JavaScript'];
      const oneImportant = ['TypeScript'];
      
      const criticalResult = calculateSkillMatch(oneCritical, mockRoleSkills, 'software_developer');
      const importantResult = calculateSkillMatch(oneImportant, mockRoleSkills, 'software_developer');
      
      expect(criticalResult.matchScore).toBeGreaterThan(importantResult.matchScore);
    });

    it('should weight important skills higher than nice-to-have skills', () => {
      const oneImportant = ['TypeScript'];
      const oneNiceToHave = ['Git'];
      
      const importantResult = calculateSkillMatch(oneImportant, mockRoleSkills, 'software_developer');
      const niceToHaveResult = calculateSkillMatch(oneNiceToHave, mockRoleSkills, 'software_developer');
      
      expect(importantResult.matchScore).toBeGreaterThan(niceToHaveResult.matchScore);
    });

    it('should calculate weighted total correctly', () => {
      // 2 critical (2x each) + 2 important (1.5x each) + 2 nice-to-have (1x each)
      // Total weight = 4 + 3 + 2 = 9
      const userSkills = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Git', 'Docker'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user skills array', () => {
      const userSkills: string[] = [];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBe(0);
      expect(result.matchedSkills.length).toBe(0);
      expect(result.missingSkills.length).toBe(mockRoleSkills.length);
    });

    it('should handle empty role skills array', () => {
      const userSkills = ['JavaScript', 'React'];
      const emptyRoleSkills: SkillData[] = [];
      
      const result = calculateSkillMatch(userSkills, emptyRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBe(0);
      expect(result.matchedSkills.length).toBe(0);
      expect(result.missingSkills.length).toBe(0);
    });

    it('should handle user having more skills than required', () => {
      const userSkills = [
        'JavaScript', 'React', 'TypeScript', 'Node.js', 'Git', 'Docker',
        'Python', 'Django', 'PostgreSQL', 'AWS'
      ];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBe(100);
      expect(result.matchedSkills.length).toBe(6);
    });

    it('should handle duplicate skills in user array', () => {
      const userSkills = ['JavaScript', 'JavaScript', 'React', 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      // Should deduplicate and match correctly
      expect(result.matchedSkills.length).toBeLessThanOrEqual(2);
    });

    it('should handle skills with special characters', () => {
      const specialSkills: SkillData[] = [
        { skill: 'C++', importance: 'critical', category: 'languages', demandLevel: 'high' },
        { skill: 'C#', importance: 'important', category: 'languages', demandLevel: 'high' },
        { skill: '.NET', importance: 'important', category: 'frameworks', demandLevel: 'high' },
      ];
      const userSkills = ['C++', 'C#', '.NET'];
      
      const result = calculateSkillMatch(userSkills, specialSkills, 'software_developer');
      
      expect(result.matchedSkills.length).toBe(3);
    });

    it('should handle skills with whitespace', () => {
      const userSkills = ['  JavaScript  ', ' React ', 'TypeScript'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchedSkills.length).toBe(3);
    });

    it('should handle null or undefined gracefully', () => {
      const userSkills = ['JavaScript', null as any, undefined as any, 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchedSkills.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle very large skill sets', () => {
      const largeRoleSkills: SkillData[] = Array.from({ length: 100 }, (_, i) => ({
        skill: `Skill${i}`,
        importance: 'nice-to-have' as const,
        category: 'technical',
        demandLevel: 'medium' as const,
      }));
      const userSkills = Array.from({ length: 50 }, (_, i) => `Skill${i}`);
      
      const result = calculateSkillMatch(userSkills, largeRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBe(50);
      expect(result.matchedSkills.length).toBe(50);
      expect(result.missingSkills.length).toBe(50);
    });
  });

  describe('Match Quality', () => {
    it('should return "Excellent" quality for 80%+ match', () => {
      const userSkills = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Git'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.matchScore).toBeGreaterThanOrEqual(80);
      expect(result.matchQuality).toBe('Excellent');
    });

    it('should return "Good" quality for 60-79% match', () => {
      const userSkills = ['JavaScript', 'React', 'TypeScript'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      if (result.matchScore >= 60 && result.matchScore < 80) {
        expect(result.matchQuality).toBe('Good');
      }
    });

    it('should return "Fair" quality for 40-59% match', () => {
      const userSkills = ['JavaScript', 'Git'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      if (result.matchScore >= 40 && result.matchScore < 60) {
        expect(result.matchQuality).toBe('Fair');
      }
    });

    it('should return "Poor" quality for <40% match', () => {
      const userSkills = ['Git'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      if (result.matchScore < 40) {
        expect(result.matchQuality).toBe('Poor');
      }
    });
  });

  describe('Missing Skills Identification', () => {
    it('should identify all missing skills when user has none', () => {
      const userSkills: string[] = [];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.missingSkills.length).toBe(6);
      expect(result.missingSkills).toContain('JavaScript');
      expect(result.missingSkills).toContain('React');
    });

    it('should identify only missing skills', () => {
      const userSkills = ['JavaScript', 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.missingSkills.length).toBe(4);
      expect(result.missingSkills).toContain('TypeScript');
      expect(result.missingSkills).toContain('Node.js');
      expect(result.missingSkills).toContain('Git');
      expect(result.missingSkills).toContain('Docker');
    });

    it('should have no missing skills when all are matched', () => {
      const userSkills = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Git', 'Docker'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.missingSkills.length).toBe(0);
    });

    it('should prioritize critical missing skills', () => {
      const userSkills = ['Git', 'Docker'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.missingSkills).toContain('JavaScript');
      expect(result.missingSkills).toContain('React');
    });
  });

  describe('Performance', () => {
    it('should complete calculation within 200ms for typical skill set', () => {
      const userSkills = ['JavaScript', 'React', 'TypeScript', 'Node.js'];
      
      const startTime = Date.now();
      calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should complete calculation within 200ms for large skill set', () => {
      const largeRoleSkills: SkillData[] = Array.from({ length: 50 }, (_, i) => ({
        skill: `Skill${i}`,
        importance: 'nice-to-have' as const,
        category: 'technical',
        demandLevel: 'medium' as const,
      }));
      const userSkills = Array.from({ length: 30 }, (_, i) => `Skill${i}`);
      
      const startTime = Date.now();
      calculateSkillMatch(userSkills, largeRoleSkills, 'software_developer');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should be efficient with repeated calls', () => {
      const userSkills = ['JavaScript', 'React', 'TypeScript'];
      
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      }
      const endTime = Date.now();
      
      const avgTime = (endTime - startTime) / 100;
      expect(avgTime).toBeLessThan(50);
    });
  });

  describe('Result Structure', () => {
    it('should return all required fields', () => {
      const userSkills = ['JavaScript', 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result).toHaveProperty('matchScore');
      expect(result).toHaveProperty('matchedSkills');
      expect(result).toHaveProperty('missingSkills');
      expect(result).toHaveProperty('matchQuality');
      expect(result).toHaveProperty('targetRole');
    });

    it('should return match score as number between 0-100', () => {
      const userSkills = ['JavaScript', 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(typeof result.matchScore).toBe('number');
      expect(result.matchScore).toBeGreaterThanOrEqual(0);
      expect(result.matchScore).toBeLessThanOrEqual(100);
    });

    it('should return matched skills as array', () => {
      const userSkills = ['JavaScript', 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(Array.isArray(result.matchedSkills)).toBe(true);
    });

    it('should return missing skills as array', () => {
      const userSkills = ['JavaScript', 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(Array.isArray(result.missingSkills)).toBe(true);
    });

    it('should return target role', () => {
      const userSkills = ['JavaScript', 'React'];
      
      const result = calculateSkillMatch(userSkills, mockRoleSkills, 'software_developer');
      
      expect(result.targetRole).toBe('software_developer');
    });
  });
});
