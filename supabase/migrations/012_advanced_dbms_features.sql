-- ============================================================
-- Migration 012: Advanced DBMS Features
-- Stored Procedures, Views, Materialized Views,
-- Indexes, Triggers, Audit Log Table
-- Safe: uses IF NOT EXISTS / OR REPLACE throughout
-- ============================================================

-- ============================================================
-- PART 0 — ENSURE audit_logs TABLE EXISTS
-- (Used by AuditLogService; created here if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  action      TEXT        NOT NULL,
  table_name  TEXT        NOT NULL,
  record_id   TEXT,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_logs' AND policyname = 'Users can view own audit logs'
  ) THEN
    CREATE POLICY "Users can view own audit logs"
      ON audit_logs FOR SELECT
      USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_logs' AND policyname = 'Service role can insert audit logs'
  ) THEN
    CREATE POLICY "Service role can insert audit logs"
      ON audit_logs FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- PART 1 — ADD match_score COLUMN (computed from JSONB)
-- resume_analyses stores match score inside analysis_result JSONB.
-- We add a generated column so SQL queries can use it directly.
-- ============================================================
ALTER TABLE resume_analyses
  ADD COLUMN IF NOT EXISTS match_score NUMERIC
    GENERATED ALWAYS AS (
      (analysis_result ->> 'matchScore')::NUMERIC
    ) STORED;

-- ============================================================
-- PART 2 — ADD detected_skills COLUMN (computed from JSONB)
-- Extracts matched skills array from analysis_result JSONB
-- so the materialized view can unnest it efficiently.
-- ============================================================
ALTER TABLE resume_analyses
  ADD COLUMN IF NOT EXISTS detected_skills JSONB
    GENERATED ALWAYS AS (
      COALESCE(analysis_result -> 'matchedSkills', '[]'::jsonb)
    ) STORED;

-- ============================================================
-- PART 3 — INDEX OPTIMIZATION
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_resume_user
  ON resume_analyses (user_id);

CREATE INDEX IF NOT EXISTS idx_resume_role
  ON resume_analyses (target_role);

CREATE INDEX IF NOT EXISTS idx_user_role
  ON resume_analyses (user_id, target_role);

CREATE INDEX IF NOT EXISTS idx_resume_match_score
  ON resume_analyses (match_score DESC);

CREATE INDEX IF NOT EXISTS idx_resume_created_at
  ON resume_analyses (created_at DESC);

-- ============================================================
-- PART 4 — STORED FUNCTION: get_user_resume_stats
-- Returns total_resumes, avg_match_score, highest_score
-- for a given user UUID.
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_resume_stats(user_uuid UUID)
RETURNS TABLE (
  total_resumes   INT,
  avg_match_score NUMERIC,
  highest_score   NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT                                          AS total_resumes,
    ROUND(AVG(match_score), 2)                            AS avg_match_score,
    MAX(match_score)                                      AS highest_score
  FROM resume_analyses
  WHERE user_id = user_uuid;
END;
$$;

COMMENT ON FUNCTION get_user_resume_stats(UUID) IS
  'Returns resume statistics (count, avg score, highest score) for a user';

-- ============================================================
-- PART 5 — VIEW: user_resume_summary
-- Per-user aggregated resume analytics.
-- ============================================================
CREATE OR REPLACE VIEW user_resume_summary AS
SELECT
  user_id,
  COUNT(*)                    AS total_resumes,
  ROUND(AVG(match_score), 2)  AS avg_score,
  MAX(match_score)            AS best_score,
  MIN(match_score)            AS lowest_score,
  COUNT(DISTINCT target_role) AS distinct_roles_analyzed,
  MAX(created_at)             AS last_analyzed_at
FROM resume_analyses
GROUP BY user_id;

COMMENT ON VIEW user_resume_summary IS
  'Aggregated resume analytics per user';

-- ============================================================
-- PART 6 — MATERIALIZED VIEW: skill_demand_analysis
-- Unnests detected_skills JSONB array to count skill frequency
-- per target role across all resume analyses.
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS skill_demand_analysis;

CREATE MATERIALIZED VIEW skill_demand_analysis AS
SELECT
  target_role,
  jsonb_array_elements_text(detected_skills) AS skill,
  COUNT(*)                                   AS frequency
FROM resume_analyses
WHERE detected_skills IS NOT NULL
  AND jsonb_array_length(detected_skills) > 0
GROUP BY target_role, skill
ORDER BY target_role, frequency DESC;

-- Index on the materialized view for fast lookups
CREATE INDEX IF NOT EXISTS idx_skill_demand_role
  ON skill_demand_analysis (target_role);

CREATE INDEX IF NOT EXISTS idx_skill_demand_skill
  ON skill_demand_analysis (skill);

CREATE INDEX IF NOT EXISTS idx_skill_demand_frequency
  ON skill_demand_analysis (frequency DESC);

COMMENT ON MATERIALIZED VIEW skill_demand_analysis IS
  'Skill frequency analysis per role — refresh with: REFRESH MATERIALIZED VIEW skill_demand_analysis';

-- ============================================================
-- PART 7 — AUDIT LOG TRIGGER
-- Automatically logs INSERT / UPDATE / DELETE on resume_analyses
-- into audit_logs without requiring application-level calls.
-- ============================================================
CREATE OR REPLACE FUNCTION log_resume_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, new_values, old_values)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW)::JSONB END,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD)::JSONB END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION log_resume_changes() IS
  'Trigger function: logs all resume_analyses mutations to audit_logs';

-- Drop and recreate trigger to ensure idempotency
DROP TRIGGER IF EXISTS audit_resume_changes ON resume_analyses;

CREATE TRIGGER audit_resume_changes
  AFTER INSERT OR UPDATE OR DELETE
  ON resume_analyses
  FOR EACH ROW
  EXECUTE FUNCTION log_resume_changes();

-- ============================================================
-- PART 8 — ANALYTICS HELPER FUNCTION
-- Supports the advanced analytics query:
--   SELECT target_role, AVG(match_score) ... GROUP BY target_role
-- Returns role-level match score statistics.
-- ============================================================
CREATE OR REPLACE FUNCTION get_role_match_analytics()
RETURNS TABLE (
  target_role       TEXT,
  avg_match_score   NUMERIC,
  max_match_score   NUMERIC,
  min_match_score   NUMERIC,
  total_analyses    BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ra.target_role,
    ROUND(AVG(ra.match_score), 2) AS avg_match_score,
    MAX(ra.match_score)           AS max_match_score,
    MIN(ra.match_score)           AS min_match_score,
    COUNT(*)                      AS total_analyses
  FROM resume_analyses ra
  WHERE ra.target_role IS NOT NULL
  GROUP BY ra.target_role
  ORDER BY avg_match_score DESC;
END;
$$;

COMMENT ON FUNCTION get_role_match_analytics() IS
  'Returns match score analytics grouped by target role';

-- ============================================================
-- PART 9 — MATERIALIZED VIEW REFRESH FUNCTION
-- Convenience wrapper to refresh skill_demand_analysis.
-- Call via: SELECT refresh_skill_demand_analysis();
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_skill_demand_analysis()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW skill_demand_analysis;
END;
$$;

COMMENT ON FUNCTION refresh_skill_demand_analysis() IS
  'Refreshes the skill_demand_analysis materialized view';

-- ============================================================
-- VERIFICATION QUERIES (commented out — run manually to confirm)
-- ============================================================
-- SELECT * FROM get_user_resume_stats('00000000-0000-0000-0000-000000000000');
-- SELECT * FROM user_resume_summary LIMIT 10;
-- SELECT * FROM skill_demand_analysis LIMIT 20;
-- SELECT * FROM get_role_match_analytics();
-- SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
