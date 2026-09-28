-- ============================================================
-- Migration 013: ML + Advanced DBMS Upgrade
-- New tables, JSONB columns, GIN indexes, views,
-- materialized views, stored procedures, triggers, RLS
-- ============================================================

-- ============================================================
-- 1. JOB ROLES TABLE (dataset-backed, replaces static TS files)
-- ============================================================
CREATE TABLE IF NOT EXISTS job_roles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key     TEXT        NOT NULL UNIQUE,
  display_name TEXT        NOT NULL,
  skills       JSONB       NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_roles_role_key ON job_roles (role_key);
CREATE INDEX IF NOT EXISTS idx_job_roles_skills_gin ON job_roles USING GIN (skills);

-- ============================================================
-- 2. RESUMES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name       TEXT        NOT NULL,
  raw_text        TEXT        NOT NULL,
  target_role     TEXT,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes (user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_target_role ON resumes (target_role);

-- ============================================================
-- 3. EXTRACTED SKILLS TABLE (JSONB storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS extracted_skills (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id        UUID        NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skills           JSONB       NOT NULL DEFAULT '[]',  -- array of skill strings
  predicted_role   TEXT,
  ml_confidence    NUMERIC(5,2),
  extracted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extracted_skills_resume_id ON extracted_skills (resume_id);
CREATE INDEX IF NOT EXISTS idx_extracted_skills_user_id   ON extracted_skills (user_id);
CREATE INDEX IF NOT EXISTS idx_extracted_skills_gin       ON extracted_skills USING GIN (skills);

-- ============================================================
-- 4. JOB MATCHES TABLE (ML results stored as JSONB)
-- ============================================================
CREATE TABLE IF NOT EXISTS job_matches (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id         UUID        REFERENCES resumes(id) ON DELETE CASCADE,
  target_role       TEXT        NOT NULL,
  match_percentage  NUMERIC(5,2) NOT NULL DEFAULT 0,
  matched_skills    JSONB       NOT NULL DEFAULT '[]',
  missing_skills    JSONB       NOT NULL DEFAULT '[]',
  recommendations   JSONB       NOT NULL DEFAULT '[]',
  ml_result         JSONB,      -- full ML output stored as JSONB
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_matches_user_id        ON job_matches (user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_target_role    ON job_matches (target_role);
CREATE INDEX IF NOT EXISTS idx_job_matches_match_pct      ON job_matches (match_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_job_matches_matched_gin    ON job_matches USING GIN (matched_skills);
CREATE INDEX IF NOT EXISTS idx_job_matches_missing_gin    ON job_matches USING GIN (missing_skills);

-- ============================================================
-- 5. VIEW: user_skill_summary_view
-- Shows user, role, match %, matched skills, missing skills
-- ============================================================
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

COMMENT ON VIEW user_skill_summary_view IS
  'Per-user, per-role skill match summary with latest matched/missing skills';

-- ============================================================
-- 6. MATERIALIZED VIEW: top_job_matches_view
-- Precomputed best job match per user
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS top_job_matches_view;

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

CREATE INDEX IF NOT EXISTS idx_top_job_matches_user    ON top_job_matches_view (user_id);
CREATE INDEX IF NOT EXISTS idx_top_job_matches_role    ON top_job_matches_view (target_role);
CREATE INDEX IF NOT EXISTS idx_top_job_matches_pct     ON top_job_matches_view (match_percentage DESC);

COMMENT ON MATERIALIZED VIEW top_job_matches_view IS
  'Precomputed best job match per user — refresh with: SELECT refresh_top_job_matches()';

-- ============================================================
-- 7. STORED PROCEDURE: calculate_match(user_id)
-- Computes latest match score and updates job_matches
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_match(p_user_id UUID)
RETURNS TABLE (
  target_role      TEXT,
  match_percentage NUMERIC,
  matched_count    INT,
  missing_count    INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    jm.target_role,
    jm.match_percentage,
    jsonb_array_length(jm.matched_skills)::INT AS matched_count,
    jsonb_array_length(jm.missing_skills)::INT  AS missing_count
  FROM job_matches jm
  WHERE jm.user_id = p_user_id
  ORDER BY jm.created_at DESC
  LIMIT 10;
END;
$$;

COMMENT ON FUNCTION calculate_match(UUID) IS
  'Returns latest match scores for a user across all analyzed roles';

-- ============================================================
-- 8. STORED PROCEDURE: get_skill_gap(user_id, role)
-- Returns missing skills for a specific role
-- ============================================================
CREATE OR REPLACE FUNCTION get_skill_gap(p_user_id UUID, p_role TEXT)
RETURNS TABLE (
  missing_skill TEXT,
  match_pct     NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    jsonb_array_elements_text(jm.missing_skills) AS missing_skill,
    jm.match_percentage
  FROM job_matches jm
  WHERE jm.user_id = p_user_id
    AND jm.target_role = p_role
  ORDER BY jm.created_at DESC
  LIMIT 1;
END;
$$;

-- ============================================================
-- 9. MATERIALIZED VIEW REFRESH FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_top_job_matches()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW top_job_matches_view;
END;
$$;

-- ============================================================
-- 10. TRIGGER: auto-log when resume is inserted
-- Writes to audit_logs automatically
-- ============================================================
CREATE OR REPLACE FUNCTION log_resume_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, new_values)
  VALUES (
    'resumes',
    'INSERT',
    NEW.id::TEXT,
    jsonb_build_object(
      'user_id',     NEW.user_id,
      'file_name',   NEW.file_name,
      'target_role', NEW.target_role,
      'text_length', length(NEW.raw_text),
      'uploaded_at', NEW.uploaded_at
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resume_insert_audit ON resumes;
CREATE TRIGGER trg_resume_insert_audit
  AFTER INSERT ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION log_resume_insert();

-- ============================================================
-- 11. TRIGGER: auto-log when job_match is inserted
-- ============================================================
CREATE OR REPLACE FUNCTION log_job_match_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (table_name, action, record_id, new_values)
  VALUES (
    'job_matches',
    'INSERT',
    NEW.id::TEXT,
    jsonb_build_object(
      'user_id',          NEW.user_id,
      'target_role',      NEW.target_role,
      'match_percentage', NEW.match_percentage,
      'matched_count',    jsonb_array_length(NEW.matched_skills),
      'missing_count',    jsonb_array_length(NEW.missing_skills)
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_match_insert_audit ON job_matches;
CREATE TRIGGER trg_job_match_insert_audit
  AFTER INSERT ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION log_job_match_insert();

-- ============================================================
-- 12. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE resumes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_roles       ENABLE ROW LEVEL SECURITY;

-- job_roles: readable by all authenticated users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='job_roles' AND policyname='Anyone can read job_roles') THEN
    CREATE POLICY "Anyone can read job_roles" ON job_roles FOR SELECT USING (true);
  END IF;
END $$;

-- resumes: users see only their own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='resumes' AND policyname='Users own resumes') THEN
    CREATE POLICY "Users own resumes" ON resumes USING (auth.uid() = user_id);
  END IF;
END $$;

-- extracted_skills: users see only their own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='extracted_skills' AND policyname='Users own extracted_skills') THEN
    CREATE POLICY "Users own extracted_skills" ON extracted_skills USING (auth.uid() = user_id);
  END IF;
END $$;

-- job_matches: users see only their own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='job_matches' AND policyname='Users own job_matches') THEN
    CREATE POLICY "Users own job_matches" ON job_matches USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 13. SEED job_roles from dataset
-- ============================================================
INSERT INTO job_roles (role_key, display_name, skills) VALUES
  ('software_developer',  'Software Developer',    '["javascript","typescript","react","node.js","html","css","git","rest api","sql","docker","aws","testing","graphql","tailwind css","postgresql","mongodb","ci/cd","webpack","npm","problem solving","agile","code review"]'),
  ('aiml_engineer',       'AI / ML Engineer',      '["python","tensorflow","pytorch","scikit-learn","numpy","pandas","machine learning","deep learning","nlp","computer vision","keras","mlops","jupyter","data preprocessing","model deployment","reinforcement learning","transformers","bert","llm","cuda","feature engineering","hyperparameter tuning","docker","git"]'),
  ('data_scientist',      'Data Scientist',         '["python","pandas","numpy","sql","statistics","machine learning","data visualization","tableau","matplotlib","seaborn","r","jupyter","scikit-learn","hypothesis testing","regression","data mining","big data","spark","power bi","excel","feature engineering","a/b testing","storytelling"]'),
  ('devops_engineer',     'DevOps Engineer',        '["docker","kubernetes","aws","ci/cd","terraform","ansible","linux","bash","git","jenkins","github actions","prometheus","grafana","nginx","helm","azure","gcp","python","monitoring","logging","security","networking","infrastructure as code"]'),
  ('product_manager',     'Product Manager',        '["product management","agile","scrum","jira","roadmapping","user research","sql","communication","figma","okrs","a/b testing","analytics","stakeholder management","confluence","market research","competitive analysis","user stories","backlog management","kpi","go-to-market","prioritization"]'),
  ('frontend_developer',  'Frontend Developer',     '["javascript","typescript","react","vue.js","angular","html","css","sass","tailwind css","webpack","vite","next.js","redux","graphql","rest api","git","testing","accessibility","responsive design","performance optimization","figma","npm"]'),
  ('backend_developer',   'Backend Developer',      '["node.js","python","java","go","sql","postgresql","mongodb","redis","rest api","graphql","docker","aws","microservices","authentication","authorization","ci/cd","git","testing","spring boot","django","fastapi","express","message queues"]'),
  ('data_engineer',       'Data Engineer',          '["python","sql","spark","hadoop","kafka","airflow","dbt","snowflake","bigquery","aws","etl","data warehousing","postgresql","mongodb","docker","git","scala","data modeling","data pipelines","streaming","batch processing"]'),
  ('cybersecurity_analyst','Cybersecurity Analyst', '["network security","penetration testing","siem","firewalls","vulnerability assessment","incident response","python","linux","wireshark","metasploit","kali linux","cryptography","compliance","risk assessment","forensics","ids/ips","owasp","ethical hacking","security auditing","bash"]'),
  ('cloud_architect',     'Cloud Architect',        '["aws","azure","gcp","terraform","kubernetes","docker","microservices","serverless","networking","security","cost optimization","high availability","disaster recovery","iam","vpc","load balancing","auto scaling","ci/cd","infrastructure as code","monitoring","devops","python"]')
ON CONFLICT (role_key) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      skills       = EXCLUDED.skills;
