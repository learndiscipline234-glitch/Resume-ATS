/**
 * useSkillMatch Hook
 * Custom hook for fetching and managing skill match data
 */

import { useState, useEffect, useCallback } from 'react';
import { SkillMatchService } from '../services/skillMatch.service';

interface SkillMatchData {
  id: string;
  userId: string;
  resumeAnalysisId: string;
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
  weightedMatchScore: number;
  matchQuality: string;
  createdAt: string;
}

interface UseSkillMatchResult {
  skillMatch: SkillMatchData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch skill match data for a user
 * @param userId - User ID to fetch skill match for
 * @returns Skill match data, loading state, error, and refetch function
 */
export function useSkillMatch(userId: string | null): UseSkillMatchResult {
  const [skillMatch, setSkillMatch] = useState<SkillMatchData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSkillMatch = useCallback(async () => {
    if (!userId) {
      setSkillMatch(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const skillMatchService = new SkillMatchService();
      const history = await skillMatchService.getSkillMatchHistory(userId, 1);

      if (history && history.length > 0) {
        const latest = history[0];
        setSkillMatch({
          id: latest.id,
          userId: latest.user_id,
          resumeAnalysisId: latest.resume_analysis_id,
          targetRole: latest.target_role,
          matchedSkills: latest.matched_skills || [],
          missingSkills: latest.missing_skills || [],
          matchScore: latest.match_score,
          weightedMatchScore: latest.weighted_match_score,
          matchQuality: latest.match_quality,
          createdAt: latest.created_at,
        });
      } else {
        setSkillMatch(null);
      }
    } catch (err) {
      console.error('Error fetching skill match:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch skill match'));
      setSkillMatch(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSkillMatch();
  }, [fetchSkillMatch]);

  return {
    skillMatch,
    loading,
    error,
    refetch: fetchSkillMatch,
  };
}

/**
 * Hook to fetch skill match history for a user
 * @param userId - User ID to fetch history for
 * @param limit - Maximum number of matches to fetch (default: 10)
 * @returns Array of skill matches, loading state, error, and refetch function
 */
export function useSkillMatchHistory(
  userId: string | null,
  limit: number = 10
): {
  matches: SkillMatchData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [matches, setMatches] = useState<SkillMatchData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const skillMatchService = new SkillMatchService();
      const history = await skillMatchService.getSkillMatchHistory(userId, limit);

      const formattedMatches = history.map((item) => ({
        id: item.id,
        userId: item.user_id,
        resumeAnalysisId: item.resume_analysis_id,
        targetRole: item.target_role,
        matchedSkills: item.matched_skills || [],
        missingSkills: item.missing_skills || [],
        matchScore: item.match_score,
        weightedMatchScore: item.weighted_match_score,
        matchQuality: item.match_quality,
        createdAt: item.created_at,
      }));

      setMatches(formattedMatches);
    } catch (err) {
      console.error('Error fetching skill match history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch skill match history'));
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    matches,
    loading,
    error,
    refetch: fetchHistory,
  };
}

/**
 * Hook to fetch skill match by target role
 * @param userId - User ID to fetch skill match for
 * @param targetRole - Target role to filter by
 * @returns Skill match data for the specified role, loading state, error, and refetch function
 */
export function useSkillMatchByRole(
  userId: string | null,
  targetRole: string | null
): UseSkillMatchResult {
  const [skillMatch, setSkillMatch] = useState<SkillMatchData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSkillMatchByRole = useCallback(async () => {
    if (!userId || !targetRole) {
      setSkillMatch(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const skillMatchService = new SkillMatchService();
      const history = await skillMatchService.getSkillMatchHistory(userId, 50);

      // Filter by target role and get the most recent
      const roleMatches = history.filter((match) => match.target_role === targetRole);

      if (roleMatches && roleMatches.length > 0) {
        const latest = roleMatches[0];
        setSkillMatch({
          id: latest.id,
          userId: latest.user_id,
          resumeAnalysisId: latest.resume_analysis_id,
          targetRole: latest.target_role,
          matchedSkills: latest.matched_skills || [],
          missingSkills: latest.missing_skills || [],
          matchScore: latest.match_score,
          weightedMatchScore: latest.weighted_match_score,
          matchQuality: latest.match_quality,
          createdAt: latest.created_at,
        });
      } else {
        setSkillMatch(null);
      }
    } catch (err) {
      console.error('Error fetching skill match by role:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch skill match by role'));
      setSkillMatch(null);
    } finally {
      setLoading(false);
    }
  }, [userId, targetRole]);

  useEffect(() => {
    fetchSkillMatchByRole();
  }, [fetchSkillMatchByRole]);

  return {
    skillMatch,
    loading,
    error,
    refetch: fetchSkillMatchByRole,
  };
}
