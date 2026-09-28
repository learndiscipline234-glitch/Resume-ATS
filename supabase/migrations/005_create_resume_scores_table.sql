-- Migration: Create resume_scores table
-- Description: Stores resume scoring results with component breakdowns

-- Create resume_scores table
CREATE TABLE IF NOT EXISTS resume_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_analysis_id UUID REFERENCES resume_analyses(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  skills_score INTEGER NOT NULL CHECK (skills_score >= 0 AND skills_score <= 100),
  projects_score INTEGER NOT NULL CHECK (projects_score >= 0 AND projects_score <= 100),
  experience_score INTEGER NOT NULL CHECK (experience_score >= 0 AND experience_score <= 100),
  education_score INTEGER NOT NULL CHECK (education_score >= 0 AND education_score <= 100),
  quality_flag TEXT NOT NULL CHECK (quality_flag IN ('excellent', 'competitive', 'needs_improvement')),
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_resume_scores_user_id ON resume_scores(user_id);
CREATE INDEX idx_resume_scores_resume_analysis_id ON resume_scores(resume_analysis_id);
CREATE INDEX idx_resume_scores_created_at ON resume_scores(created_at DESC);
CREATE INDEX idx_resume_scores_total_score ON resume_scores(total_score DESC);
CREATE INDEX idx_resume_scores_quality_flag ON resume_scores(quality_flag);

-- Enable Row Level Security
ALTER TABLE resume_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own scores
CREATE POLICY "Users can read own resume_scores"
  ON resume_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own scores
CREATE POLICY "Users can insert own resume_scores"
  ON resume_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "Users can update own resume_scores"
  ON resume_scores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scores
CREATE POLICY "Users can delete own resume_scores"
  ON resume_scores
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE resume_scores IS 'Resume scoring results with component breakdowns';
COMMENT ON COLUMN resume_scores.user_id IS 'User who owns this score';
COMMENT ON COLUMN resume_scores.resume_analysis_id IS 'Associated resume analysis';
COMMENT ON COLUMN resume_scores.total_score IS 'Overall resume score (0-100)';
COMMENT ON COLUMN resume_scores.skills_score IS 'Skills component score (40% weight)';
COMMENT ON COLUMN resume_scores.projects_score IS 'Projects component score (25% weight)';
COMMENT ON COLUMN resume_scores.experience_score IS 'Experience component score (20% weight)';
COMMENT ON COLUMN resume_scores.education_score IS 'Education component score (15% weight)';
COMMENT ON COLUMN resume_scores.quality_flag IS 'Score quality indicator';
COMMENT ON COLUMN resume_scores.recommendations IS 'Personalized improvement recommendations';
