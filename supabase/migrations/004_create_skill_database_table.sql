-- Migration: Create skill_database table
-- Description: Stores comprehensive skill data for all roles with metadata

-- Create skill_database table
CREATE TABLE IF NOT EXISTS skill_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  demand_level TEXT NOT NULL CHECK (demand_level IN ('high', 'medium', 'low')),
  importance TEXT NOT NULL CHECK (importance IN ('critical', 'important', 'nice-to-have')),
  aliases TEXT[] DEFAULT '{}',
  related_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, skill_name)
);

-- Create indexes for performance
CREATE INDEX idx_skill_database_role ON skill_database(role);
CREATE INDEX idx_skill_database_skill_name ON skill_database(skill_name);
CREATE INDEX idx_skill_database_demand_level ON skill_database(demand_level);
CREATE INDEX idx_skill_database_importance ON skill_database(importance);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_skill_database_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skill_database_updated_at
  BEFORE UPDATE ON skill_database
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_database_updated_at();

-- Enable Row Level Security
ALTER TABLE skill_database ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read skill data
CREATE POLICY "Allow authenticated users to read skill_database"
  ON skill_database
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert/update/delete
CREATE POLICY "Allow service role to manage skill_database"
  ON skill_database
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE skill_database IS 'Comprehensive skill database for all roles with metadata';
COMMENT ON COLUMN skill_database.role IS 'Target role (e.g., Software Developer, AI/ML Engineer)';
COMMENT ON COLUMN skill_database.skill_name IS 'Name of the skill';
COMMENT ON COLUMN skill_database.category IS 'Skill category (technical, frameworks, tools, etc.)';
COMMENT ON COLUMN skill_database.demand_level IS 'Market demand level (high, medium, low)';
COMMENT ON COLUMN skill_database.importance IS 'Importance for role (critical, important, nice-to-have)';
COMMENT ON COLUMN skill_database.aliases IS 'Alternative names for the skill';
COMMENT ON COLUMN skill_database.related_skills IS 'Related or complementary skills';
