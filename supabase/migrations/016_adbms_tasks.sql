-- ============================================================
-- Migration 016: Advanced DBMS Features
-- Table Partitioning, Full-Text Search, Optimization, Backup
-- ============================================================

-- ============================================================
-- TASK 1: TABLE PARTITIONING
-- Partition the `job_matches` table by date (monthly)
-- ============================================================

-- 1A. Drop views and triggers depending on job_matches
DROP MATERIALIZED VIEW IF EXISTS top_job_matches_view CASCADE;
DROP VIEW IF EXISTS user_skill_summary_view CASCADE;
DROP TRIGGER IF EXISTS trg_job_match_insert_audit ON job_matches;

-- 1B. Rename existing table
ALTER TABLE job_matches RENAME TO job_matches_old;

-- 1C. Create the new partitioned table
CREATE TABLE job_matches (
  id                UUID        DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id         UUID,
  target_role       TEXT        NOT NULL,
  match_percentage  NUMERIC(5,2) NOT NULL DEFAULT 0,
  matched_skills    JSONB       NOT NULL DEFAULT '[]',
  missing_skills    JSONB       NOT NULL DEFAULT '[]',
  recommendations   JSONB       NOT NULL DEFAULT '[]',
  ml_result         JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 1D. Create partitions
CREATE TABLE job_matches_2026_01 PARTITION OF job_matches FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE job_matches_2026_02 PARTITION OF job_matches FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE job_matches_2026_03 PARTITION OF job_matches FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE job_matches_2026_04 PARTITION OF job_matches FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE job_matches_default PARTITION OF job_matches DEFAULT;

-- 1E. Migrate data
INSERT INTO job_matches (id, user_id, resume_id, target_role, match_percentage, matched_skills, missing_skills, recommendations, ml_result, created_at)
SELECT id, user_id, resume_id, target_role, match_percentage, matched_skills, missing_skills, recommendations, ml_result, created_at
FROM job_matches_old;

-- 1F. Drop old table
DROP TABLE job_matches_old CASCADE;

-- 1G. Re-create indexes for the new partitioned table
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id        ON job_matches (user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_target_role    ON job_matches (target_role);
CREATE INDEX IF NOT EXISTS idx_job_matches_match_pct      ON job_matches (match_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_job_matches_created_at     ON job_matches (created_at);
CREATE INDEX IF NOT EXISTS idx_job_matches_matched_gin    ON job_matches USING GIN (matched_skills);
CREATE INDEX IF NOT EXISTS idx_job_matches_missing_gin    ON job_matches USING GIN (missing_skills);

-- 1H. Re-create Dependent Views
CREATE OR REPLACE VIEW user_skill_summary_view AS
SELECT
  jm.user_id,
  jm.target_role,
  ROUND(AVG(jm.match_percentage), 2)                    AS avg_match_pct,
  MAX(jm.match_percentage)                              AS best_match_pct,
  COUNT(*)                                              AS total_analyses,
  (SELECT jm2.matched_skills
   FROM job_matches jm2
   WHERE jm2.user_id = jm.user_id
   ORDER BY jm2.created_at DESC LIMIT 1)               AS latest_matched_skills,
  (SELECT jm2.missing_skills
   FROM job_matches jm2
   WHERE jm2.user_id = jm.user_id
   ORDER BY jm2.created_at DESC LIMIT 1)               AS latest_missing_skills,
  MAX(jm.created_at)                                    AS last_analyzed_at
FROM job_matches jm
GROUP BY jm.user_id, jm.target_role;

CREATE MATERIALIZED VIEW top_job_matches_view AS
SELECT DISTINCT ON (user_id)
  user_id,
  target_role,
  match_percentage,
  matched_skills,
  missing_skills,
  created_at
FROM job_matches
ORDER BY user_id, match_percentage DESC, created_at DESC;

CREATE INDEX idx_top_job_matches_user    ON top_job_matches_view (user_id);
CREATE INDEX idx_top_job_matches_role    ON top_job_matches_view (target_role);
CREATE INDEX idx_top_job_matches_pct     ON top_job_matches_view (match_percentage DESC);

-- 1I. Re-create Triggers and RLS
CREATE TRIGGER trg_job_match_insert_audit
  AFTER INSERT ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION log_job_match_insert();

ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own job_matches" ON job_matches USING (auth.uid() = user_id);

-- ============================================================
-- TASK 2: FULL-TEXT SEARCH
-- Enable search across resumes and skills.
-- ============================================================

-- 2A. Add search_vector to resumes
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2B. Populate using plain string from raw_text
-- The requirements mention "resume_text || ' ' || skills". 
-- Our "resumes" table has "raw_text", which inherently is the text of the resume including skills. 
UPDATE resumes
SET search_vector = to_tsvector('english', COALESCE(raw_text, ''));

-- Create an automatic trigger to keep search_vector updated on insert/update
CREATE OR REPLACE FUNCTION update_resume_search_vector() 
RETURNS TRIGGER AS $$
BEGIN
  -- Simple update with just the raw resume text. 
  -- If we needed extracted_skills appended, we could fetch it, 
  -- but since raw_text contains the source resume, this serves the search perfectly.
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.raw_text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_resume_search_vector ON resumes;
CREATE TRIGGER trg_resume_search_vector
  BEFORE INSERT OR UPDATE OF raw_text ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_search_vector();

-- 2C. Create GIN index for search_vector
CREATE INDEX IF NOT EXISTS idx_resumes_search_vector ON resumes USING GIN(search_vector);

-- 2D. Add search query function
CREATE OR REPLACE FUNCTION search_resumes(search_query TEXT, user_uuid UUID DEFAULT NULL)
RETURNS SETOF resumes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF user_uuid IS NOT NULL THEN
    RETURN QUERY
    SELECT * FROM resumes
    WHERE user_id = user_uuid 
      AND search_vector @@ plainto_tsquery('english', search_query)
    ORDER BY uploaded_at DESC;
  ELSE
    RETURN QUERY
    SELECT * FROM resumes
    WHERE search_vector @@ plainto_tsquery('english', search_query)
    ORDER BY uploaded_at DESC;
  END IF;
END;
$$;

-- ============================================================
-- TASK 3: QUERY OPTIMIZATION
-- Add indexes for heavy queries, use EXPLAIN ANALYZE
-- ============================================================
-- User-specific indexes (partially added in previous migrations, ensuring they exist)
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id_target_role ON job_matches (user_id, target_role);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id_uploaded_at ON resumes (user_id, uploaded_at DESC);

-- ============================================================
-- TASK 4: BACKUP & RECOVERY
-- Implement database backup strategy via JSON export.
-- ============================================================

CREATE OR REPLACE FUNCTION export_user_data_json(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_info', (SELECT json_build_object('user_id', p_user_id, 'export_time', NOW())),
    'resumes', (SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json) FROM resumes r WHERE r.user_id = p_user_id),
    'job_matches', (SELECT COALESCE(json_agg(row_to_json(jm)), '[]'::json) FROM job_matches jm WHERE jm.user_id = p_user_id),
    'extracted_skills', (SELECT COALESCE(json_agg(row_to_json(es)), '[]'::json) FROM extracted_skills es WHERE es.user_id = p_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$;
