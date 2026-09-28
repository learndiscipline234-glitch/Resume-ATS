-- Migration: Create section_analyses table
-- Description: Stores resume section analysis results with quality scores

-- Create section_analyses table
CREATE TABLE IF NOT EXISTS section_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_analysis_id UUID REFERENCES resume_analyses(id) ON DELETE CASCADE,
  detected_sections TEXT[] DEFAULT '{}',
  missing_sections TEXT[] DEFAULT '{}',
  completeness INTEGER NOT NULL CHECK (completeness >= 0 AND completeness <= 100),
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_section_analyses_user_id ON section_analyses(user_id);
CREATE INDEX idx_section_analyses_resume_analysis_id ON section_analyses(resume_analysis_id);
CREATE INDEX idx_section_analyses_created_at ON section_analyses(created_at DESC);
CREATE INDEX idx_section_analyses_completeness ON section_analyses(completeness DESC);

-- Enable Row Level Security
ALTER TABLE section_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own section analyses
CREATE POLICY "Users can read own section_analyses"
  ON section_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own section analyses
CREATE POLICY "Users can insert own section_analyses"
  ON section_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own section analyses
CREATE POLICY "Users can update own section_analyses"
  ON section_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own section analyses
CREATE POLICY "Users can delete own section_analyses"
  ON section_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE section_analyses IS 'Resume section analysis results with quality scores';
COMMENT ON COLUMN section_analyses.user_id IS 'User who owns this analysis';
COMMENT ON COLUMN section_analyses.resume_analysis_id IS 'Associated resume analysis';
COMMENT ON COLUMN section_analyses.detected_sections IS 'List of detected resume sections';
COMMENT ON COLUMN section_analyses.missing_sections IS 'List of missing important sections';
COMMENT ON COLUMN section_analyses.completeness IS 'Overall section completeness percentage (0-100)';
COMMENT ON COLUMN section_analyses.recommendations IS 'Section improvement recommendations (JSON array)';
