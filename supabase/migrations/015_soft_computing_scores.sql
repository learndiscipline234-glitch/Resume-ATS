-- ============================================================
-- Migration 015: Soft Computing Score Columns
-- Adds fuzzy_score and final_score to job_matches
-- Stores ML vs Fuzzy comparison data for DBMS Analytics
-- ============================================================

-- Add soft computing score columns
ALTER TABLE job_matches
  ADD COLUMN IF NOT EXISTS fuzzy_score  NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS final_score  NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS weighted_score NUMERIC(5,2);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_job_matches_final_score
  ON job_matches (final_score DESC);

-- Update existing rows: extract scores from ml_result JSONB
UPDATE job_matches
SET
  fuzzy_score    = (ml_result ->> 'fuzzy_score')::NUMERIC,
  final_score    = (ml_result ->> 'final_score')::NUMERIC,
  weighted_score = (ml_result ->> 'weighted_score')::NUMERIC
WHERE ml_result IS NOT NULL
  AND ml_result ? 'fuzzy_score';

-- View: ML vs Fuzzy comparison per role
CREATE OR REPLACE VIEW ml_vs_fuzzy_view AS
SELECT
  target_role,
  ROUND(AVG(match_percentage), 2)  AS avg_ml_score,
  ROUND(AVG(fuzzy_score), 2)       AS avg_fuzzy_score,
  ROUND(AVG(final_score), 2)       AS avg_final_score,
  ROUND(AVG(weighted_score), 2)    AS avg_weighted_score,
  COUNT(*)                         AS total_analyses
FROM job_matches
WHERE final_score IS NOT NULL
GROUP BY target_role
ORDER BY avg_final_score DESC;

COMMENT ON VIEW ml_vs_fuzzy_view IS
  'ML vs Fuzzy Logic score comparison per role — demonstrates Soft Computing integration';
