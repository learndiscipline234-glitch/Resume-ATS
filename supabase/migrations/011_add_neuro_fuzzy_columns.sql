-- Migration: Add neuro-fuzzy columns to resume_analyses table
-- Adds neural_score, fuzzy_rating, hiring_recommendation, candidate_rank, final_score, batch_id

ALTER TABLE resume_analyses
  ADD COLUMN IF NOT EXISTS neural_score      REAL         CHECK (neural_score IS NULL OR (neural_score >= 0 AND neural_score <= 100)),
  ADD COLUMN IF NOT EXISTS fuzzy_rating      VARCHAR(20)  CHECK (fuzzy_rating IS NULL OR fuzzy_rating IN ('Poor', 'Average', 'Good', 'Excellent')),
  ADD COLUMN IF NOT EXISTS hiring_recommendation VARCHAR(30) CHECK (hiring_recommendation IS NULL OR hiring_recommendation IN ('Reject', 'Consider', 'Strong Candidate')),
  ADD COLUMN IF NOT EXISTS candidate_rank    INTEGER      CHECK (candidate_rank IS NULL OR candidate_rank >= 1),
  ADD COLUMN IF NOT EXISTS final_score       REAL         CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 100)),
  ADD COLUMN IF NOT EXISTS batch_id          UUID;

-- Index for batch lookups
CREATE INDEX IF NOT EXISTS idx_resume_analyses_batch_id ON resume_analyses (batch_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_candidate_rank ON resume_analyses (candidate_rank);

-- Ranking batches table
CREATE TABLE IF NOT EXISTS ranking_batches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_resumes     INTEGER NOT NULL DEFAULT 0,
  processed_resumes INTEGER NOT NULL DEFAULT 0,
  failed_resumes    INTEGER NOT NULL DEFAULT 0,
  processing_time_ms INTEGER,
  target_role       VARCHAR(100),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for ranking_batches
ALTER TABLE ranking_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ranking batches"
  ON ranking_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ranking batches"
  ON ranking_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);
