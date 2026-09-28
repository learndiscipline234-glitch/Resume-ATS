-- Migration: Create skill_matches table
-- Description: Stores skill matching results with matched and missing skills

-- Create skill_matches table
CREATE TABLE IF NOT EXISTS skill_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_analysis_id UUID REFERENCES resume_analyses(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  weighted_match_score INTEGER NOT NULL CHECK (weighted_match_score >= 0 AND weighted_match_score <= 100),
  match_quality TEXT NOT NULL CHECK (match_quality IN ('Excellent', 'Good', 'Fair', 'Poor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_skill_matches_user_id ON skill_matches(user_id);
CREATE INDEX idx_skill_matches_resume_analysis_id ON skill_matches(resume_analysis_id);
CREATE INDEX idx_skill_matches_target_role ON skill_matches(target_role);
CREATE INDEX idx_skill_matches_match_score ON skill_matches(match_score DESC);
CREATE INDEX idx_skill_matches_weighted_match_score ON skill_matches(weighted_match_score DESC);
CREATE INDEX idx_skill_matches_match_quality ON skill_matches(match_quality);
CREATE INDEX idx_skill_matches_created_at ON skill_matches(created_at DESC);

-- Enable Row Level Security
ALTER TABLE skill_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own skill matches
CREATE POLICY "Users can read own skill_matches"
  ON skill_matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own skill matches
CREATE POLICY "Users can insert own skill_matches"
  ON skill_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own skill matches
CREATE POLICY "Users can update own skill_matches"
  ON skill_matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own skill matches
CREATE POLICY "Users can delete own skill_matches"
  ON skill_matches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE skill_matches IS 'Skill matching results with matched and missing skills';
COMMENT ON COLUMN skill_matches.user_id IS 'User who owns this match';
COMMENT ON COLUMN skill_matches.resume_analysis_id IS 'Associated resume analysis';
COMMENT ON COLUMN skill_matches.target_role IS 'Target role for matching';
COMMENT ON COLUMN skill_matches.matched_skills IS 'Skills that match role requirements';
COMMENT ON COLUMN skill_matches.missing_skills IS 'Skills missing from user profile';
COMMENT ON COLUMN skill_matches.match_score IS 'Basic match percentage (0-100)';
COMMENT ON COLUMN skill_matches.weighted_match_score IS 'Weighted match score considering importance (0-100)';
COMMENT ON COLUMN skill_matches.match_quality IS 'Match quality rating';
