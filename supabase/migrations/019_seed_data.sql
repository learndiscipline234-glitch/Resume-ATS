-- ════════════════════════════════════════════════════════════════════
-- Migration 019: Seed data — Resume Templates, Skill Assessments,
--                Salary Data, Market Trends
-- ════════════════════════════════════════════════════════════════════
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING for all rows
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Resume Templates ───────────────────────────────────────────────────────

insert into public.resume_templates (id, name, description, structure, styles, is_public)
values
  (
    '11111111-0000-0000-0000-000000000001',
    'Modern',
    'Clean two-column layout with indigo accents — ideal for tech roles',
    '{"sections": ["contact","summary","skills","experience","projects","education","certifications"]}',
    '{"primaryColor": "#6366f1", "fontHeading": "DM Sans", "fontBody": "IBM Plex Sans", "layout": "two-column"}',
    true
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    'Classic',
    'Traditional single-column format preferred by ATS and large enterprises',
    '{"sections": ["contact","summary","experience","education","skills","certifications"]}',
    '{"primaryColor": "#1e293b", "fontHeading": "Georgia", "fontBody": "Arial", "layout": "single-column"}',
    true
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    'Minimal',
    'Whitespace-focused design with subtle typography — great for design and product roles',
    '{"sections": ["contact","summary","skills","experience","projects","education"]}',
    '{"primaryColor": "#64748b", "fontHeading": "Inter", "fontBody": "Inter", "layout": "minimal"}',
    true
  ),
  (
    '11111111-0000-0000-0000-000000000004',
    'Corporate',
    'Formal executive template for senior-level and management positions',
    '{"sections": ["contact","summary","experience","achievements","education","skills"]}',
    '{"primaryColor": "#0f172a", "fontHeading": "Merriweather", "fontBody": "Source Sans Pro", "layout": "corporate"}',
    true
  )
on conflict (id) do nothing;


-- ── 2. Skill Assessments ──────────────────────────────────────────────────────

insert into public.skill_assessments (id, skill_name, role, difficulty, time_limit_sec, questions)
values
  -- JavaScript
  (
    '22222222-0000-0000-0000-000000000001',
    'JavaScript',
    'Frontend Developer',
    'intermediate',
    120,
    '[
      {"question":"What does typeof null return?","options":["null","undefined","object","number"],"correct":2},
      {"question":"Which method creates a new array by calling a function on every element?","options":[".forEach()",".map()",".filter()",".reduce()"],"correct":1},
      {"question":"What is a closure?","options":["A way to close browser tabs","A function with access to its outer scope","A loop type","An error handler"],"correct":1},
      {"question":"What does the spread operator (...) do?","options":["Combines two strings","Expands iterables into individual elements","Creates a deep copy","Declares a variable"],"correct":1},
      {"question":"Which is NOT a valid way to declare a variable in modern JS?","options":["let x = 1","const x = 1","var x = 1","int x = 1"],"correct":3}
    ]'::jsonb
  ),
  -- React
  (
    '22222222-0000-0000-0000-000000000002',
    'React',
    'Frontend Developer',
    'intermediate',
    120,
    '[
      {"question":"What hook is used for side effects?","options":["useState","useEffect","useReducer","useMemo"],"correct":1},
      {"question":"What is the virtual DOM?","options":["A copy of the real DOM in memory","A CSS framework","A React component","A browser API"],"correct":0},
      {"question":"How do you correctly update state?","options":["state.value = 5","this.state = {value:5}","setState({value:5}) or setter function","state = 5"],"correct":2},
      {"question":"What does React.memo() do?","options":["Stores data in localStorage","Prevents unnecessary re-renders","Creates a memo UI","Allocates memory"],"correct":1},
      {"question":"Purpose of keys in React lists?","options":["Styling elements","Helps React identify changed items","Sorting items","Creating unique URLs"],"correct":1}
    ]'::jsonb
  ),
  -- Python
  (
    '22222222-0000-0000-0000-000000000003',
    'Python',
    'Software Developer',
    'beginner',
    90,
    '[
      {"question":"Which keyword defines a function in Python?","options":["function","func","def","define"],"correct":2},
      {"question":"What is a list comprehension?","options":["A way to understand lists","A concise way to create lists","A sorting algorithm","A debugging tool"],"correct":1},
      {"question":"What does pip stand for?","options":["Python Install Package","Pip Installs Packages","Package Index Python","Python Interface Platform"],"correct":1},
      {"question":"Which is an immutable data type?","options":["list","dict","set","tuple"],"correct":3},
      {"question":"Output of print(type([]))?","options":["<class array>","<class list>","<class tuple>","<class set>"],"correct":1}
    ]'::jsonb
  ),
  -- SQL
  (
    '22222222-0000-0000-0000-000000000004',
    'SQL',
    'Database Developer',
    'intermediate',
    120,
    '[
      {"question":"Which clause filters groups?","options":["WHERE","HAVING","FILTER","GROUP BY"],"correct":1},
      {"question":"Which JOIN returns all rows from both tables?","options":["INNER JOIN","LEFT JOIN","RIGHT JOIN","FULL OUTER JOIN"],"correct":3},
      {"question":"What does ACID stand for?","options":["Atomicity Consistency Isolation Durability","Add Create Insert Delete","Access Control Index Data","Automatic Concurrent Isolated Distributed"],"correct":0},
      {"question":"How do you add a column to an existing table?","options":["INSERT INTO","ADD COLUMN","ALTER TABLE ... ADD","UPDATE TABLE"],"correct":2},
      {"question":"What is a primary key?","options":["First column in a table","Unique identifier for each row","Most important data","An encryption key"],"correct":1}
    ]'::jsonb
  ),
  -- Docker
  (
    '22222222-0000-0000-0000-000000000005',
    'Docker',
    'DevOps Engineer',
    'intermediate',
    120,
    '[
      {"question":"What is a Docker image?","options":["A running container instance","A read-only template to create containers","A Docker network","A volume mount"],"correct":1},
      {"question":"Which command lists running containers?","options":["docker images","docker ps","docker run","docker build"],"correct":1},
      {"question":"What is docker-compose used for?","options":["Building images","Managing multi-container applications","Pushing to registry","Creating volumes"],"correct":1},
      {"question":"What is a Dockerfile?","options":["A configuration file for compose","A script to build a Docker image","A network config","A volume definition"],"correct":1},
      {"question":"Which flag detaches a container to run in background?","options":["-i","-t","-d","-p"],"correct":2}
    ]'::jsonb
  ),
  -- Machine Learning
  (
    '22222222-0000-0000-0000-000000000006',
    'Machine Learning',
    'AI/ML Engineer',
    'advanced',
    150,
    '[
      {"question":"What is overfitting?","options":["Model performs well on training but poorly on unseen data","Model is too simple","Model has high bias","Model needs more data"],"correct":0},
      {"question":"Which algorithm is best for classification with linearly separable data?","options":["K-Means","Linear Regression","Support Vector Machine","DBSCAN"],"correct":2},
      {"question":"What does the learning rate control?","options":["Number of epochs","Step size in gradient descent","Model architecture","Data batch size"],"correct":1},
      {"question":"What is cross-validation used for?","options":["Feature engineering","Estimating model performance on unseen data","Data augmentation","Hyperparameter search"],"correct":1},
      {"question":"What is the vanishing gradient problem?","options":["Gradients become too large","Gradients become too small to effectively update weights","Loss increases during training","Overfitting in deep networks"],"correct":1}
    ]'::jsonb
  )
on conflict (id) do nothing;


-- ── 3. Salary Data (Indian tech market, 2025) ─────────────────────────────────

insert into public.salary_data (role, location, experience_level, min_salary, max_salary, median_salary, currency, source, year)
values
  -- Software Developer — Bangalore
  ('Software Developer', 'Bangalore', 'entry',     400000,  700000,  550000,  'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Software Developer', 'Bangalore', 'mid',       900000,  1600000, 1200000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Software Developer', 'Bangalore', 'senior',    1800000, 3000000, 2400000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Software Developer', 'Bangalore', 'executive', 3500000, 7000000, 5000000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  -- Software Developer — Hyderabad
  ('Software Developer', 'Hyderabad', 'entry',     350000,  650000,  500000,  'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Software Developer', 'Hyderabad', 'mid',       800000,  1400000, 1100000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Software Developer', 'Hyderabad', 'senior',    1600000, 2800000, 2200000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  -- Software Developer — Mumbai
  ('Software Developer', 'Mumbai',    'entry',     450000,  750000,  600000,  'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Software Developer', 'Mumbai',    'mid',       1000000, 1700000, 1300000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  -- AI/ML Engineer — Bangalore
  ('AI/ML Engineer', 'Bangalore', 'entry',     600000,   1000000,  800000,  'INR', 'Glassdoor/LinkedIn', 2025),
  ('AI/ML Engineer', 'Bangalore', 'mid',       1400000,  2500000,  1900000, 'INR', 'Glassdoor/LinkedIn', 2025),
  ('AI/ML Engineer', 'Bangalore', 'senior',    2800000,  5000000,  3800000, 'INR', 'Glassdoor/LinkedIn', 2025),
  ('AI/ML Engineer', 'Bangalore', 'executive', 6000000,  12000000, 9000000, 'INR', 'Glassdoor/LinkedIn', 2025),
  -- AI/ML Engineer — Hyderabad
  ('AI/ML Engineer', 'Hyderabad', 'mid',       1200000,  2200000,  1700000, 'INR', 'Glassdoor/LinkedIn', 2025),
  -- Data Scientist
  ('Data Scientist', 'Bangalore', 'entry',  550000,  900000,  720000,  'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Data Scientist', 'Bangalore', 'mid',    1200000, 2200000, 1700000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Data Scientist', 'Bangalore', 'senior', 2400000, 4500000, 3400000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  ('Data Scientist', 'Mumbai',    'mid',    1100000, 2000000, 1550000, 'INR', 'Glassdoor/AmbitionBox', 2025),
  -- DevOps Engineer
  ('DevOps Engineer', 'Bangalore', 'entry',  500000,  800000,  650000,  'INR', 'Glassdoor/LinkedIn', 2025),
  ('DevOps Engineer', 'Bangalore', 'mid',    1100000, 1900000, 1500000, 'INR', 'Glassdoor/LinkedIn', 2025),
  ('DevOps Engineer', 'Bangalore', 'senior', 2000000, 3500000, 2700000, 'INR', 'Glassdoor/LinkedIn', 2025),
  -- Product Manager
  ('Product Manager', 'Bangalore', 'entry',     700000,  1200000, 950000,  'INR', 'Glassdoor/LinkedIn', 2025),
  ('Product Manager', 'Bangalore', 'mid',       1500000, 2800000, 2200000, 'INR', 'Glassdoor/LinkedIn', 2025),
  ('Product Manager', 'Bangalore', 'senior',    3000000, 6000000, 4500000, 'INR', 'Glassdoor/LinkedIn', 2025),
  ('Product Manager', 'Mumbai',    'mid',       1400000, 2600000, 2000000, 'INR', 'Glassdoor/LinkedIn', 2025);


-- ── 4. Market Trends (Q1 2025) ────────────────────────────────────────────────

insert into public.market_trends (skill_name, demand_score, hiring_volume, yoy_growth_pct, period)
values
  ('Python',          95, 12400, 22.5,  '2025-Q1'),
  ('React',           88,  9800, 15.2,  '2025-Q1'),
  ('AWS',             91, 11200, 28.1,  '2025-Q1'),
  ('Machine Learning',87,  7600, 35.4,  '2025-Q1'),
  ('TypeScript',      82,  8200, 42.0,  '2025-Q1'),
  ('Docker',          79,  7100, 19.8,  '2025-Q1'),
  ('Kubernetes',      74,  5400, 31.2,  '2025-Q1'),
  ('SQL',             85, 10100,  8.5,  '2025-Q1'),
  ('Node.js',         76,  7800, 12.3,  '2025-Q1'),
  ('Generative AI',   93,  5100, 185.0, '2025-Q1'),
  ('Go',              68,  3200, 24.7,  '2025-Q1'),
  ('Terraform',       71,  3900, 38.6,  '2025-Q1'),
  ('Java',            80,  9500,  5.2,  '2025-Q1'),
  ('Spring Boot',     72,  6700, 10.8,  '2025-Q1'),
  ('PostgreSQL',      77,  5900, 17.4,  '2025-Q1'),
  ('Redis',           65,  3400, 21.1,  '2025-Q1'),
  ('FastAPI',         69,  3800, 58.3,  '2025-Q1'),
  ('Next.js',         75,  6200, 47.9,  '2025-Q1'),
  ('LLMs',            89,  4300, 220.0, '2025-Q1'),
  ('RAG',             82,  2900, 310.0, '2025-Q1'),
  ('Vector Databases',76,  2100, 280.0, '2025-Q1'),
  ('MLOps',           71,  2700, 67.4,  '2025-Q1'),
  ('Rust',            58,  1800, 34.2,  '2025-Q1'),
  ('Flutter',         64,  4200, 18.9,  '2025-Q1'),
  ('GraphQL',         62,  3600,  9.7,  '2025-Q1');
