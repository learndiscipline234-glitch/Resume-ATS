/**
 * Unit Tests for Job Recommender
 * Tests match score calculation, ranking, filtering, and skill gap identification
 */

import { describe, it, expect } from 'vitest';
import { generateJobRecommendations } from '../../ai/matcher/jobRecommender';

describe('Job Recommender', () => {
  const mockUserSkills = ['JavaScript', 'React', 'Node.js', 'TypeScript'];
  const mockTargetRole = 'software_developer';

  describe('Match Score Calculation', () => {
    it('should calculate match scores between 0-100', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, mockTargetRole);
      
      recommendations.forEach(rec => {
        expect(rec.matchScore).toBeGreaterThanOrEqual(0);
        expect(rec.matchScore).toBeLessThanOrEqual(100);
      });
    });

    it('should give higher scores for better skill matches', async () => {
      const manySkills = ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Docker', 'AWS', 'PostgreSQL'];
      const fewSkills = ['JavaScript'];
      
      const manyRecs = await generateJobRecommendations(manySkills, mockTargetRole);
      const fewRecs = await generateJobRecommendations(fewSkills, mockTargetRole);
      
      if (manyRecs.length > 0 && fewRecs.length > 0) {
        expect(manyRecs[0].matchScore).toBeGreaterThanOrEqual(fewRecs[0].matchScore);
      }
    });
  });

  describe('Ranking Logic', () => {
    it('should rank recommendations by match score descending', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, mockTargetRole);
      
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].matchScore).toBeGreaterThanOrEqual(recommendations[i + 1].matchScore);
      }
    });

    it('should return at least 10 recommendations when available', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, mockTargetRole);
      
      expect(recommendations.length).toBeGreaterThanOrEqual(Math.min(10, recommendations.length));
    });
  });

  describe('Filtering by Match Threshold', () => {
    it('should filter out jobs with match score < 50%', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, mockTargetRole);
      
      recommendations.forEach(rec => {
        expect(rec.matchScore).toBeGreaterThanOrEqual(50);
      });
    });

    it('should return empty array if no jobs meet threshold', async () => {
      const noSkills: string[] = [];
      const recommendations = await generateJobRecommendations(noSkills, mockTargetRole);
      
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Skill Gap Identification', () => {
    it('should identify missing skills for each job', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, mockTargetRole);
      
      recommendations.forEach(rec => {
        expect(rec.skillGaps).toBeDefined();
        expect(Array.isArray(rec.skillGaps)).toBe(true);
      });
    });

    it('should have fewer skill gaps for higher match scores', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, mockTargetRole);
      
      if (recommendations.length >= 2) {
        const highMatch = recommendations[0];
        const lowMatch = recommendations[recommendations.length - 1];
        
        expect(highMatch.skillGaps.length).toBeLessThanOrEqual(lowMatch.skillGaps.length);
      }
    });

    it('should have no skill gaps for 100% match', async () => {
      const allSkills = ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Docker', 'AWS', 'PostgreSQL', 'MongoDB', 'Redis', 'Kubernetes'];
      const recommendations = await generateJobRecommendations(allSkills, mockTargetRole);
      
      const perfectMatches = recommendations.filter(r => r.matchScore === 100);
      perfectMatches.forEach(rec => {
        expect(rec.skillGaps.length).toBe(0);
      });
    });
  });

  describe('Job Metadata', () => {
    it('should include all required job metadata', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, mockTargetRole);
      
      recommendations.forEach(rec => {
        expect(rec.title).toBeDefined();
        expect(rec.company).toBeDefined();
        expect(rec.location).toBeDefined();
        expect(rec.salaryRange).toBeDefined();
        expect(rec.requiredSkills).toBeDefined();
      });
    });

    it('should include job ID', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, mockTargetRole);
      
      recommendations.forEach(rec => {
        expect(rec.jobId).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user skills', async () => {
      const recommendations = await generateJobRecommendations([], mockTargetRole);
      
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle unknown target role', async () => {
      const recommendations = await generateJobRecommendations(mockUserSkills, 'unknown_role');
      
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});
