-- ============================================================
-- Migration 014: Allow demo data inserts + read for analytics
-- Adds a policy so the DBMS Analytics page can seed and read
-- job_matches without requiring a real authenticated user.
-- ============================================================

-- Allow anyone to read job_matches (for analytics dashboard)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'job_matches' AND policyname = 'Anyone can read job_matches for analytics'
  ) THEN
    CREATE POLICY "Anyone can read job_matches for analytics"
      ON job_matches FOR SELECT USING (true);
  END IF;
END $$;

-- Allow anon/service role to insert demo data
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'job_matches' AND policyname = 'Allow demo inserts'
  ) THEN
    CREATE POLICY "Allow demo inserts"
      ON job_matches FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow reading audit_logs for the dashboard
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_logs' AND policyname = 'Anyone can read audit_logs'
  ) THEN
    CREATE POLICY "Anyone can read audit_logs"
      ON audit_logs FOR SELECT USING (true);
  END IF;
END $$;
