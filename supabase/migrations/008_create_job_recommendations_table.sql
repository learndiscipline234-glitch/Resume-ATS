-- Migration: Create job_recommendations table
-- Description: Stores personalized job recommendations with match scores

-- Create job_recommendations table
CREATE TABLE IF NOT EXISTS job_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min INTEGER NOT NULL,
  salary_max INTEGER NOT NULL,
  salary_currency TEXT NOT NULL DEFAULT 'USD',
  required_skills TEXT[] DEFAULT '{}',
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  skill_gaps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Create indexes for performance
CREATE INDEX idx_job_recommendations_user_id ON job_recommendations(user_id);
CREATE INDEX idx_job_recommendations_job_id ON job_recommendations(job_id);
CREATE INDEX idx_job_recommendations_match_score ON job_recommendations(match_score DESC);
CREATE INDEX idx_job_recommendations_company ON job_recommendations(company);
CREATE INDEX idx_job_recommendations_location ON job_recommendations(location);
CREATE INDEX idx_job_recommendations_created_at ON job_recommendations(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_job_recommendations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_recommendations_updated_at
  BEFORE UPDATE ON job_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_job_recommendations_updated_at();

-- Enable Row Level Security
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own job recommendations
CREATE POLICY "Users can read own job_recommendations"
  ON job_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own job recommendations
CREATE POLICY "Users can insert own job_recommendations"
  ON job_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own job recommendations
CREATE POLICY "Users can update own job_recommendations"
  ON job_recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own job recommendations
CREATE POLICY "Users can delete own job_recommendations"
  ON job_recommendations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE job_recommendations IS 'Personalized job recommendations with match scores';
COMMENT ON COLUMN job_recommendations.user_id IS 'User who owns this recommendation';
COMMENT ON COLUMN job_recommendations.job_id IS 'Unique job identifier';
COMMENT ON COLUMN job_recommendations.title IS 'Job title';
COMMENT ON COLUMN job_recommendations.company IS 'Company name';
COMMENT ON COLUMN job_recommendations.location IS 'Job location';
COMMENT ON COLUMN job_recommendations.salary_min IS 'Minimum salary';
COMMENT ON COLUMN job_recommendations.salary_max IS 'Maximum salary';
COMMENT ON COLUMN job_recommendations.salary_currency IS 'Salary currency code';
COMMENT ON COLUMN job_recommendations.required_skills IS 'Required skills for the job';
COMMENT ON COLUMN job_recommendations.match_score IS 'Match score with user profile (0-100)';
COMMENT ON COLUMN job_recommendations.skill_gaps IS 'Skill gaps analysis (JSON array)';
