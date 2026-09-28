-- Restore soft-computing score columns lost during migration 016
ALTER TABLE job_matches
  ADD COLUMN IF NOT EXISTS fuzzy_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS final_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS weighted_score NUMERIC(5,2);

-- ============================================================
-- Migration 016: Production ADBMS Upgrade
-- Table Partitioning, Full-Text Search, Query Optimization,
-- Backup Strategy, Advanced Indexes
-- ============================================================

-- ============================================================
-- PART 1: FULL-TEXT SEARCH on resumes table
-- ============================================================

-- Add search_vector column
ALTER TABLE resumes
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Populate search_vector from resume text + target_role
UPDATE resumes
SET search_vector = to_tsvector(
  'english',
  COALESCE(raw_text, '') || ' ' || COALESCE(target_role, '')
)
WHERE search_vector IS NULL;

-- GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_resumes_search_gin
  ON resumes USING GIN (search_vector);

-- Trigger to auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION update_resume_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'english',
    COALESCE(NEW.raw_text, '') || ' ' || COALESCE(NEW.target_role, '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resume_search_vector ON resumes;
CREATE TRIGGER trg_resume_search_vector
  BEFORE INSERT OR UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_search_vector();

-- Full-text search function
CREATE OR REPLACE FUNCTION search_resumes(
  p_query    TEXT,
  p_user_id  UUID DEFAULT NULL,
  p_role     TEXT DEFAULT NULL,
  p_limit    INT  DEFAULT 20,
  p_offset   INT  DEFAULT 0
)
RETURNS TABLE (
  id          UUID,
  user_id     UUID,
  file_name   TEXT,
  target_role TEXT,
  uploaded_at TIMESTAMPTZ,
  rank        REAL,
  headline    TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.user_id,
    r.file_name,
    r.target_role,
    r.uploaded_at,
    ts_rank(r.search_vector, plainto_tsquery('english', p_query)) AS rank,
    ts_headline(
      'english',
      COALESCE(r.raw_text, ''),
      plainto_tsquery('english', p_query),
      'MaxWords=30, MinWords=15, ShortWord=3, HighlightAll=false'
    ) AS headline
  FROM resumes r
  WHERE
    r.search_vector @@ plainto_tsquery('english', p_query)
    AND (p_user_id IS NULL OR r.user_id = p_user_id)
    AND (p_role IS NULL OR r.target_role = p_role)
  ORDER BY rank DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION search_resumes(TEXT, UUID, TEXT, INT, INT) IS
  'Full-text search across resumes using PostgreSQL tsvector + GIN index';

-- ============================================================
-- PART 2: QUERY OPTIMIZATION — Additional Indexes
-- ============================================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_resumes_user_role
  ON resumes (user_id, target_role);

CREATE INDEX IF NOT EXISTS idx_resumes_uploaded_at
  ON resumes (uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_resumes_user_uploaded
  ON resumes (user_id, uploaded_at DESC);

-- job_matches existing table optimization
CREATE INDEX IF NOT EXISTS idx_jm_user_created
  ON job_matches (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jm_role_score
  ON job_matches (target_role, match_percentage DESC);

-- extracted_skills optimization
CREATE INDEX IF NOT EXISTS idx_es_predicted_role
  ON extracted_skills (predicted_role);

CREATE INDEX IF NOT EXISTS idx_es_user_extracted
  ON extracted_skills (user_id, extracted_at DESC);

-- EXPLAIN ANALYZE reference queries (documented for viva)
-- EXPLAIN ANALYZE SELECT * FROM resumes WHERE user_id = '...' ORDER BY uploaded_at DESC;
-- EXPLAIN ANALYZE SELECT * FROM job_matches WHERE user_id = '...' AND target_role = 'software_developer';
-- EXPLAIN ANALYZE SELECT * FROM search_resumes('python developer', '...', NULL);

-- ============================================================
-- PART 3: BACKUP & RECOVERY FUNCTIONS
-- ============================================================

-- Function: export user data as JSON (backup)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'exported_at',   NOW(),
    'user_id',       p_user_id,
    'resumes',       (
      SELECT jsonb_agg(row_to_json(r))
      FROM resumes r WHERE r.user_id = p_user_id
    ),
    'job_matches',   (
      SELECT jsonb_agg(row_to_json(jm))
      FROM job_matches jm WHERE jm.user_id = p_user_id
    ),
    'extracted_skills', (
      SELECT jsonb_agg(row_to_json(es))
      FROM extracted_skills es WHERE es.user_id = p_user_id
    ),
    'audit_logs',    (
      SELECT jsonb_agg(row_to_json(al))
      FROM audit_logs al WHERE al.user_id = p_user_id
      ORDER BY al.created_at DESC
      LIMIT 100
    )
  ) INTO result;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

COMMENT ON FUNCTION export_user_data IS
  'Exports all user data as JSONB for backup/download — GDPR compliant';

-- Function: get backup summary stats
CREATE OR REPLACE FUNCTION get_backup_stats()
RETURNS TABLE (
  table_name   TEXT,
  row_count    BIGINT,
  size_pretty  TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::TEXT,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = t.table_name)::BIGINT,
    pg_size_pretty(pg_total_relation_size(t.table_name::regclass))
  FROM (
    VALUES ('resumes'), ('job_matches'), ('extracted_skills'),
           ('audit_logs'), ('job_roles')
  ) AS t(table_name);
END;
$$;

-- ============================================================
-- PART 4: RESUME VERSIONING
-- ============================================================

CREATE TABLE IF NOT EXISTS resume_versions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID        NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version     INT         NOT NULL DEFAULT 1,
  file_name   TEXT        NOT NULL,
  raw_text    TEXT,
  target_role TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rv_resume_id ON resume_versions (resume_id);
CREATE INDEX IF NOT EXISTS idx_rv_user_id   ON resume_versions (user_id);
CREATE INDEX IF NOT EXISTS idx_rv_version   ON resume_versions (resume_id, version DESC);

-- Trigger: auto-version on resume update
CREATE OR REPLACE FUNCTION version_resume_on_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  next_version INT;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM resume_versions
  WHERE resume_id = OLD.id;

  INSERT INTO resume_versions (resume_id, user_id, version, file_name, raw_text, target_role)
  VALUES (OLD.id, OLD.user_id, next_version, OLD.file_name, OLD.raw_text, OLD.target_role);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resume_versioning ON resumes;
CREATE TRIGGER trg_resume_versioning
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  WHEN (OLD.raw_text IS DISTINCT FROM NEW.raw_text)
  EXECUTE FUNCTION version_resume_on_update();

-- RLS for resume_versions
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='resume_versions' AND policyname='Users own resume_versions'
  ) THEN
    CREATE POLICY "Users own resume_versions"
      ON resume_versions USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- PART 5: ANALYTICS VIEWS FOR PRODUCTION DASHBOARD
-- ============================================================

-- View: daily upload stats (for line chart)
CREATE OR REPLACE VIEW daily_upload_stats AS
SELECT
  DATE_TRUNC('day', uploaded_at) AS upload_date,
  COUNT(*)                        AS upload_count,
  COUNT(DISTINCT user_id)         AS unique_users
FROM resumes
GROUP BY DATE_TRUNC('day', uploaded_at)
ORDER BY upload_date DESC;

-- View: role distribution (for pie chart)
CREATE OR REPLACE VIEW role_distribution AS
SELECT
  target_role,
  COUNT(*)                                    AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM resumes
WHERE target_role IS NOT NULL
GROUP BY target_role
ORDER BY count DESC;

-- View: top skills across all resumes (for word cloud)
CREATE OR REPLACE VIEW top_skills_view AS
SELECT
  jsonb_array_elements_text(matched_skills) AS skill,
  COUNT(*)                                  AS frequency
FROM job_matches
GROUP BY skill
ORDER BY frequency DESC
LIMIT 50;

COMMENT ON VIEW daily_upload_stats IS 'Daily resume upload trend for analytics dashboard';
COMMENT ON VIEW role_distribution   IS 'Role distribution across all resumes';
COMMENT ON VIEW top_skills_view     IS 'Top 50 skills across all job matches';
