/**
 * Unit Tests for Trending Skills Engine
 * Tests trend calculation, ranking algorithm, and trend direction determination
 */

import { describe, it, expect } from 'vitest';
import { getTrendingSkills } from '../../ai/analyzer/trendingSkills';

describe('Trending Skills Engine', () => {
  describe('Trend Calculation', () => {
    it('should calculate demand scores between 0-100', async () => {
      const skills = await getTrendingSkills('software_developer');
      
      skills.forEach(skill => {
        expect(skill.demandScore).toBeGreaterThanOrEqual(0);
        expect(skill.demandScore).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate growth rates', async () => {
      const skills = await getTrendingSkills('software_developer');
      
      skills.forEach(skill => {
        expect(skill.growthRate).toBeDefined();
        expect(typeof skill.growthRate).toBe('number');
      });
    });

    it('should return top 20 skills by default', async () => {
      const skills = await getTrendingSkills('software_developer');
      
      expect(skills.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Ranking Algorithm', () => {
    it('should rank skills by demand score descending', async () => {
      const skills = await getTrendingSkills('software_developer');
      
      for (let i = 0; i < skills.length - 1; i++) {
        expect(skills[i].demandScore).toBeGreaterThanOrEqual(skills[i + 1].demandScore);
      }
    });

    it('should prioritize high-demand skills', async () => {
      const skills = await getTrendingSkills('software_developer');
      
      if (skills.length > 0) {
        expect(skills[0].demandScore).toBeGreaterThan(50);
      }
    });
  });

  describe('Trend Direction', () => {
    it('should determine trend direction (rising/stable/declining)', async () => {
      const skills = await getTrendingSkills('software_developer');
      
      skills.forEach(skill => {
        expect(['rising', 'stable', 'declining']).toContain(skill.trendDirection);
      });
    });

    it('should mark skills with positive growth as rising', async () => {
      const skills = await getTrendingSkills('software_developer');
      
      const risingSkills = skills.filter(s => s.trendDirection === 'rising');
      risingSkills.forEach(skill => {
        expect(skill.growthRate).toBeGreaterThan(0);
      });
    });

    it('should mark skills with negative growth as declining', async () => {
      const skills = await getTrendingSkills('software_developer');
      
      const decliningSkills = skills.filter(s => s.trendDirection === 'declining');
      decliningSkills.forEach(skill => {
        expect(skill.growthRate).toBeLessThan(0);
      });
    });
  });

  describe('Role-Specific Trends', () => {
    it('should return different trends for different roles', async () => {
      const devSkills = await getTrendingSkills('software_developer');
      const aiSkills = await getTrendingSkills('aiml_engineer');
      
      expect(devSkills).not.toEqual(aiSkills);
    });

    it('should return all roles when no role specified', async () => {
      const allSkills = await getTrendingSkills();
      
      expect(allSkills.length).toBeGreaterThan(0);
    });
  });
});
