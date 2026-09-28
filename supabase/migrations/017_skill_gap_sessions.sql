-- ============================================================
-- Migration 017: Skill Gap Sessions
-- Persists skill gap analyses for history + analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS skill_gap_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_role    TEXT        NOT NULL,
  target_role     TEXT        NOT NULL,
  readiness_pct   NUMERIC(5,2) NOT NULL DEFAULT 0,
  matched_count   INT         NOT NULL DEFAULT 0,
  gap_count       INT         NOT NULL DEFAULT 0,
  gap_skills      JSONB       NOT NULL DEFAULT '[]',
  est_hours       INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sgs_user_id    ON skill_gap_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sgs_roles      ON skill_gap_sessions (from_role, target_role);
CREATE INDEX IF NOT EXISTS idx_sgs_created_at ON skill_gap_sessions (created_at DESC);

-- RLS
ALTER TABLE skill_gap_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='skill_gap_sessions' AND policyname='Users own skill_gap_sessions'
  ) THEN
    CREATE POLICY "Users own skill_gap_sessions"
      ON skill_gap_sessions USING (auth.uid() = user_id);
  END IF;
END $$;

-- View: most common skill gaps across all users
CREATE OR REPLACE VIEW top_skill_gaps AS
SELECT
  jsonb_array_elements_text(gap_skills) AS skill,
  COUNT(*)                              AS frequency,
  target_role
FROM skill_gap_sessions
GROUP BY skill, target_role
ORDER BY frequency DESC;

-- View: role transition popularity
CREATE OR REPLACE VIEW role_transitions AS
SELECT
  from_role,
  target_role,
  COUNT(*)                                    AS transition_count,
  ROUND(AVG(readiness_pct), 1)                AS avg_readiness,
  ROUND(AVG(est_hours), 0)                    AS avg_est_hours
FROM skill_gap_sessions
GROUP BY from_role, target_role
ORDER BY transition_count DESC;

COMMENT ON TABLE skill_gap_sessions IS 'Persisted skill gap analyses — current→target role transitions';
COMMENT ON VIEW top_skill_gaps       IS 'Most frequently identified skill gaps across all users';
COMMENT ON VIEW role_transitions     IS 'Most popular role transition paths with avg readiness';
