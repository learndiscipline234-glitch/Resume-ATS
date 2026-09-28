-- Migration: Create trending_skills table
-- Description: Stores trending skills data with market demand and growth metrics

-- Create trending_skills table
CREATE TABLE IF NOT EXISTS trending_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  target_role TEXT NOT NULL,
  demand_score INTEGER NOT NULL CHECK (demand_score >= 0 AND demand_score <= 100),
  trend_direction TEXT NOT NULL CHECK (trend_direction IN ('rising', 'stable', 'declining')),
  growth_rate INTEGER NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skill_name, target_role)
);

-- Create indexes for performance
CREATE INDEX idx_trending_skills_skill_name ON trending_skills(skill_name);
CREATE INDEX idx_trending_skills_target_role ON trending_skills(target_role);
CREATE INDEX idx_trending_skills_demand_score ON trending_skills(demand_score DESC);
CREATE INDEX idx_trending_skills_trend_direction ON trending_skills(trend_direction);
CREATE INDEX idx_trending_skills_growth_rate ON trending_skills(growth_rate DESC);
CREATE INDEX idx_trending_skills_period_end ON trending_skills(period_end DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_trending_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trending_skills_updated_at
  BEFORE UPDATE ON trending_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_trending_skills_updated_at();

-- Enable Row Level Security
ALTER TABLE trending_skills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read trending skills
CREATE POLICY "Allow authenticated users to read trending_skills"
  ON trending_skills
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to manage trending skills
CREATE POLICY "Allow service role to manage trending_skills"
  ON trending_skills
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE trending_skills IS 'Trending skills data with market demand and growth metrics';
COMMENT ON COLUMN trending_skills.skill_name IS 'Name of the trending skill';
COMMENT ON COLUMN trending_skills.target_role IS 'Target role for this skill';
COMMENT ON COLUMN trending_skills.demand_score IS 'Market demand score (0-100)';
COMMENT ON COLUMN trending_skills.trend_direction IS 'Trend direction (rising, stable, declining)';
COMMENT ON COLUMN trending_skills.growth_rate IS 'Growth rate percentage';
COMMENT ON COLUMN trending_skills.period_start IS 'Analysis period start date';
COMMENT ON COLUMN trending_skills.period_end IS 'Analysis period end date';
