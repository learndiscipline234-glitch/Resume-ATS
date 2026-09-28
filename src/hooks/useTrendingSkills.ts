/**
 * useTrendingSkills Hook
 * Custom hook for fetching and managing trending skills data
 */

import { useState, useEffect, useCallback } from 'react';
import { TrendingSkillsService } from '../services/trendingSkills.service';

interface TrendingSkillData {
  skill: string;
  demandScore: number;
  trend: 'rising' | 'stable' | 'declining';
  growthRate: number;
  relatedRoles: string[];
  category: string;
}

interface UseTrendingSkillsResult {
  skills: TrendingSkillData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch trending skills for a specific role
 * @param role - Target role to fetch trending skills for (optional, fetches all if not provided)
 * @returns Trending skills, loading state, error, and refetch function
 */
export function useTrendingSkills(role?: string): UseTrendingSkillsResult {
  const [skills, setSkills] = useState<TrendingSkillData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrendingSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const trendingSkillsService = new TrendingSkillsService();
      const trendingSkills = role 
        ? await trendingSkillsService.getTrendingSkillsByRole(role)
        : await trendingSkillsService.getAllTrendingSkills();

      setSkills(trendingSkills);
    } catch (err) {
      console.error('Error fetching trending skills:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch trending skills'));
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchTrendingSkills();
  }, [fetchTrendingSkills]);

  return {
    skills,
    loading,
    error,
    refetch: fetchTrendingSkills,
  };
}

/**
 * Hook to fetch rising trending skills (skills with 'rising' trend direction)
 * @param role - Target role to fetch trending skills for (optional)
 * @returns Rising trending skills, loading state, error, and refetch function
 */
export function useRisingSkills(role?: string): UseTrendingSkillsResult {
  const [skills, setSkills] = useState<TrendingSkillData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRisingSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const trendingSkillsService = new TrendingSkillsService();
      const risingSkills = await trendingSkillsService.getTrendingSkillsByTrend('rising', role);

      setSkills(risingSkills);
    } catch (err) {
      console.error('Error fetching rising skills:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch rising skills'));
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchRisingSkills();
  }, [fetchRisingSkills]);

  return {
    skills,
    loading,
    error,
    refetch: fetchRisingSkills,
  };
}

/**
 * Hook to fetch top trending skills sorted by demand score
 * @param role - Target role to fetch trending skills for (optional)
 * @param limit - Maximum number of skills to return (default: 10)
 * @returns Top trending skills, loading state, error, and refetch function
 */
export function useTopTrendingSkills(
  role?: string,
  limit: number = 10
): UseTrendingSkillsResult {
  const [skills, setSkills] = useState<TrendingSkillData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopTrendingSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const trendingSkillsService = new TrendingSkillsService();
      const trendingSkills = role 
        ? await trendingSkillsService.getTrendingSkillsByRole(role, limit)
        : await trendingSkillsService.getAllTrendingSkills(limit);

      setSkills(trendingSkills);
    } catch (err) {
      console.error('Error fetching top trending skills:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch top trending skills'));
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [role, limit]);

  useEffect(() => {
    fetchTopTrendingSkills();
  }, [fetchTopTrendingSkills]);

  return {
    skills,
    loading,
    error,
    refetch: fetchTopTrendingSkills,
  };
}

/**
 * Hook to fetch emerging skills (high growth rate)
 * @param role - Target role to fetch emerging skills for (optional)
 * @param minGrowthRate - Minimum growth rate threshold (default: 10)
 * @returns Emerging skills, loading state, error, and refetch function
 */
export function useEmergingSkills(
  role?: string,
  minGrowthRate: number = 10
): UseTrendingSkillsResult {
  const [skills, setSkills] = useState<TrendingSkillData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmergingSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const trendingSkillsService = new TrendingSkillsService();
      const emergingSkills = await trendingSkillsService.getEmergingSkills(role);

      setSkills(emergingSkills);
    } catch (err) {
      console.error('Error fetching emerging skills:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch emerging skills'));
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [role, minGrowthRate]);

  useEffect(() => {
    fetchEmergingSkills();
  }, [fetchEmergingSkills]);

  return {
    skills,
    loading,
    error,
    refetch: fetchEmergingSkills,
  };
}
