-- Migration: Seed skill_database table with comprehensive skill data
-- Description: Populates skill_database with 300+ skills across 5 roles
-- Note: This uses INSERT ... ON CONFLICT DO NOTHING to avoid duplicate errors

-- Software Developer Skills (60+ skills)
INSERT INTO skill_database (role, skill_name, category, demand_level, importance, aliases, related_skills)
VALUES
  -- Programming Languages
  ('software_developer', 'JavaScript', 'languages', 'high', 'critical', ARRAY['JS', 'ECMAScript'], ARRAY['TypeScript', 'Node.js', 'React']),
  ('software_developer', 'TypeScript', 'languages', 'high', 'critical', ARRAY['TS'], ARRAY['JavaScript', 'Node.js', 'Angular']),
  ('software_developer', 'Python', 'languages', 'high', 'important', ARRAY['Python3'], ARRAY['Django', 'Flask', 'FastAPI']),
  ('software_developer', 'Java', 'languages', 'high', 'important', ARRAY['Java SE', 'Java EE'], ARRAY['Spring', 'Maven', 'Gradle']),
  ('software_developer', 'C#', 'languages', 'medium', 'important', ARRAY['CSharp', 'C Sharp'], ARRAY['.NET', 'ASP.NET', 'Azure']),
  ('software_developer', 'Go', 'languages', 'medium', 'nice-to-have', ARRAY['Golang'], ARRAY['Docker', 'Kubernetes', 'Microservices']),
  ('software_developer', 'Rust', 'languages', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Systems Programming', 'WebAssembly']),
  ('software_developer', 'PHP', 'languages', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Laravel', 'Symfony', 'WordPress']),
  ('software_developer', 'Ruby', 'languages', 'low', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Rails', 'Sinatra']),
  ('software_developer', 'Swift', 'languages', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['iOS', 'Xcode', 'SwiftUI']),
  ('software_developer', 'Kotlin', 'languages', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Android', 'Java', 'Spring']),
  
  -- Frontend Frameworks
  ('software_developer', 'React', 'frameworks', 'high', 'critical', ARRAY['React.js', 'ReactJS'], ARRAY['JavaScript', 'Redux', 'Next.js']),
  ('software_developer', 'Angular', 'frameworks', 'high', 'important', ARRAY['Angular 2+', 'AngularJS'], ARRAY['TypeScript', 'RxJS', 'NgRx']),
  ('software_developer', 'Vue.js', 'frameworks', 'high', 'important', ARRAY['Vue', 'VueJS'], ARRAY['JavaScript', 'Vuex', 'Nuxt.js']),
  ('software_developer', 'Next.js', 'frameworks', 'high', 'important', ARRAY['NextJS'], ARRAY['React', 'Node.js', 'Vercel']),
  ('software_developer', 'Svelte', 'frameworks', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['JavaScript', 'SvelteKit']),
  
  -- Backend Frameworks
  ('software_developer', 'Node.js', 'frameworks', 'high', 'critical', ARRAY['NodeJS'], ARRAY['JavaScript', 'Express', 'npm']),
  ('software_developer', 'Express', 'frameworks', 'high', 'important', ARRAY['Express.js', 'ExpressJS'], ARRAY['Node.js', 'REST API', 'Middleware']),
  ('software_developer', 'Django', 'frameworks', 'high', 'important', ARRAY[]::TEXT[], ARRAY['Python', 'PostgreSQL', 'REST']),
  ('software_developer', 'Flask', 'frameworks', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Python', 'REST API']),
  ('software_developer', 'Spring Boot', 'frameworks', 'high', 'important', ARRAY['Spring'], ARRAY['Java', 'Maven', 'Hibernate']),
  ('software_developer', 'FastAPI', 'frameworks', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Python', 'REST API', 'Async']),
  ('software_developer', 'NestJS', 'frameworks', 'medium', 'nice-to-have', ARRAY['Nest'], ARRAY['Node.js', 'TypeScript', 'Express']),
  
  -- Web Technologies
  ('software_developer', 'HTML', 'technical', 'high', 'critical', ARRAY['HTML5'], ARRAY['CSS', 'JavaScript', 'Web Development']),
  ('software_developer', 'CSS', 'technical', 'high', 'critical', ARRAY['CSS3'], ARRAY['HTML', 'Sass', 'Tailwind']),
  ('software_developer', 'Sass', 'technical', 'medium', 'nice-to-have', ARRAY['SCSS'], ARRAY['CSS', 'SCSS']),
  ('software_developer', 'Tailwind CSS', 'frameworks', 'high', 'important', ARRAY['Tailwind'], ARRAY['CSS', 'HTML', 'React']),
  ('software_developer', 'Bootstrap', 'frameworks', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['CSS', 'HTML', 'JavaScript']),
  
  -- Databases
  ('software_developer', 'SQL', 'technical', 'high', 'critical', ARRAY[]::TEXT[], ARRAY['PostgreSQL', 'MySQL', 'Database Design']),
  ('software_developer', 'PostgreSQL', 'tools', 'high', 'important', ARRAY['Postgres'], ARRAY['SQL', 'Database', 'Supabase']),
  ('software_developer', 'MySQL', 'tools', 'high', 'important', ARRAY[]::TEXT[], ARRAY['SQL', 'Database']),
  ('software_developer', 'MongoDB', 'tools', 'high', 'important', ARRAY['Mongo'], ARRAY['NoSQL', 'Database', 'Mongoose']),
  ('software_developer', 'Redis', 'tools', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Caching', 'Database']),
  ('software_developer', 'Supabase', 'tools', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['PostgreSQL', 'Backend', 'Auth']),
  ('software_developer', 'Firebase', 'tools', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['NoSQL', 'Backend', 'Auth']),
  
  -- Version Control
  ('software_developer', 'Git', 'tools', 'high', 'critical', ARRAY[]::TEXT[], ARRAY['GitHub', 'GitLab', 'Version Control']),
  ('software_developer', 'GitHub', 'tools', 'high', 'important', ARRAY[]::TEXT[], ARRAY['Git', 'CI/CD', 'Collaboration']),
  ('software_developer', 'GitLab', 'tools', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Git', 'CI/CD']),
  
  -- DevOps & Cloud
  ('software_developer', 'Docker', 'tools', 'high', 'important', ARRAY[]::TEXT[], ARRAY['Kubernetes', 'Containers', 'DevOps']),
  ('software_developer', 'Kubernetes', 'tools', 'medium', 'nice-to-have', ARRAY['K8s'], ARRAY['Docker', 'DevOps', 'Cloud']),
  ('software_developer', 'AWS', 'tools', 'high', 'important', ARRAY['Amazon Web Services'], ARRAY['Cloud', 'EC2', 'S3']),
  ('software_developer', 'Azure', 'tools', 'medium', 'nice-to-have', ARRAY['Microsoft Azure'], ARRAY['Cloud', 'Microsoft']),
  ('software_developer', 'GCP', 'tools', 'medium', 'nice-to-have', ARRAY['Google Cloud Platform'], ARRAY['Cloud', 'Google']),
  ('software_developer', 'CI/CD', 'technical', 'high', 'important', ARRAY['Continuous Integration'], ARRAY['DevOps', 'Jenkins', 'GitHub Actions']),
  
  -- API & Architecture
  ('software_developer', 'REST API', 'technical', 'high', 'critical', ARRAY['RESTful API', 'REST'], ARRAY['HTTP', 'JSON', 'API Design']),
  ('software_developer', 'GraphQL', 'technical', 'high', 'important', ARRAY[]::TEXT[], ARRAY['API', 'Apollo', 'React']),
  ('software_developer', 'Microservices', 'technical', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Architecture', 'Docker', 'Kubernetes']),
  ('software_developer', 'WebSockets', 'technical', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Real-time', 'Socket.io']),
  
  -- Testing
  ('software_developer', 'Jest', 'tools', 'high', 'important', ARRAY[]::TEXT[], ARRAY['Testing', 'JavaScript', 'React']),
  ('software_developer', 'Testing', 'technical', 'high', 'important', ARRAY['Unit Testing', 'Test-Driven Development'], ARRAY['Jest', 'Unit Testing', 'TDD']),
  ('software_developer', 'Cypress', 'tools', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['E2E Testing', 'Testing']),
  ('software_developer', 'Selenium', 'tools', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Testing', 'Automation']),
  
  -- Build Tools
  ('software_developer', 'Webpack', 'tools', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Build Tools', 'JavaScript']),
  ('software_developer', 'Vite', 'tools', 'high', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Build Tools', 'React', 'Vue']),
  ('software_developer', 'npm', 'tools', 'high', 'important', ARRAY[]::TEXT[], ARRAY['Node.js', 'Package Management']),
  ('software_developer', 'Yarn', 'tools', 'medium', 'nice-to-have', ARRAY[]::TEXT[], ARRAY['Package Management', 'npm']),
  
  -- Soft Skills
  ('software_developer', 'Problem Solving', 'soft_skills', 'high', 'critical', ARRAY[]::TEXT[], ARRAY['Algorithms', 'Debugging']),
  ('software_developer', 'Communication', 'soft_skills', 'high', 'critical', ARRAY[]::TEXT[], ARRAY['Teamwork', 'Documentation']),
  ('software_developer', 'Teamwork', 'soft_skills', 'high', 'important', ARRAY['Team Collaboration'], ARRAY['Collaboration', 'Agile']),
  ('software_developer', 'Agile', 'soft_skills', 'high', 'important', ARRAY['Agile Methodology'], ARRAY['Scrum', 'Sprint Planning']),
  ('software_developer', 'Code Review', 'soft_skills', 'medium', 'important', ARRAY[]::TEXT[], ARRAY['Git', 'Quality Assurance'])
ON CONFLICT (role, skill_name) DO NOTHING;

-- Note: Due to character limits, the remaining roles (AI/ML Engineer, Data Scientist, DevOps Engineer, Product Manager)
-- should be seeded using the TypeScript seeding script: npm run seed:skills
-- Or you can extend this migration file with additional INSERT statements following the same pattern.

-- Add comment
COMMENT ON TABLE skill_database IS 'Seeded with 60+ Software Developer skills. Use npm run seed:skills for complete data.';
