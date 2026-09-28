/**
 * useResumeScore Hook
 * Custom hook for fetching and managing resume score data
 */

import { useState, useEffect, useCallback } from 'react';
import { ResumeScoreService } from '../services/resumeScore.service';

interface ResumeScoreData {
  id: string;
  userId: string;
  resumeAnalysisId: string;
  totalScore: number;
  skillsScore: number;
  projectsScore: number;
  experienceScore: number;
  educationScore: number;
  qualityFlag: 'excellent' | 'competitive' | 'needs_improvement';
  recommendations: string[];
  createdAt: string;
}

interface UseResumeScoreResult {
  score: ResumeScoreData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch resume score data for a user
 * @param userId - User ID to fetch score for
 * @returns Resume score data, loading state, error, and refetch function
 */
export function useResumeScore(userId: string | null): UseResumeScoreResult {
  const [score, setScore] = useState<ResumeScoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchScore = useCallback(async () => {
    if (!userId) {
      setScore(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resumeScoreService = new ResumeScoreService();
      const history = await resumeScoreService.getScoreHistory(userId, 1);

      if (history && history.length > 0) {
        const latestScore = history[0];
        setScore({
          id: latestScore.id,
          userId: latestScore.user_id,
          resumeAnalysisId: latestScore.resume_analysis_id || '',
          totalScore: latestScore.total_score,
          skillsScore: latestScore.skills_score,
          projectsScore: latestScore.projects_score,
          experienceScore: latestScore.experience_score,
          educationScore: latestScore.education_score,
          qualityFlag: latestScore.quality_flag as 'excellent' | 'competitive' | 'needs_improvement',
          recommendations: latestScore.recommendations || [],
          createdAt: latestScore.created_at,
        });
      } else {
        setScore(null);
      }
    } catch (err) {
      console.error('Error fetching resume score:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch resume score'));
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score,
    loading,
    error,
    refetch: fetchScore,
  };
}

/**
 * Hook to fetch resume score history for a user
 * @param userId - User ID to fetch history for
 * @param limit - Maximum number of scores to fetch (default: 10)
 * @returns Array of resume scores, loading state, error, and refetch function
 */
export function useResumeScoreHistory(
  userId: string | null,
  limit: number = 10
): {
  scores: ResumeScoreData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [scores, setScores] = useState<ResumeScoreData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setScores([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resumeScoreService = new ResumeScoreService();
      const history = await resumeScoreService.getScoreHistory(userId, limit);

      const formattedScores = history.map((item) => ({
        id: item.id,
        userId: item.user_id,
        resumeAnalysisId: item.resume_analysis_id || '',
        totalScore: item.total_score,
        skillsScore: item.skills_score,
        projectsScore: item.projects_score,
        experienceScore: item.experience_score,
        educationScore: item.education_score,
        qualityFlag: item.quality_flag as 'excellent' | 'competitive' | 'needs_improvement',
        recommendations: item.recommendations || [],
        createdAt: item.created_at,
      }));

      setScores(formattedScores);
    } catch (err) {
      console.error('Error fetching resume score history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch resume score history'));
      setScores([]);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    scores,
    loading,
    error,
    refetch: fetchHistory,
  };
}
