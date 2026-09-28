/**
 * Software Developer Skill Database
 * Comprehensive list of skills for software development roles
 */

import { RoleSkillSet, SkillData } from '../../ai/types';

const softwareDeveloperSkills: SkillData[] = [
  // Programming Languages
  { name: 'JavaScript', category: 'languages', demandLevel: 'high', importance: 'critical', relatedSkills: ['TypeScript', 'Node.js', 'React'], aliases: ['JS', 'ECMAScript'] },
  { name: 'TypeScript', category: 'languages', demandLevel: 'high', importance: 'critical', relatedSkills: ['JavaScript', 'Node.js', 'Angular'], aliases: ['TS'] },
  { name: 'Python', category: 'languages', demandLevel: 'high', importance: 'important', relatedSkills: ['Django', 'Flask', 'FastAPI'], aliases: ['Python3'] },
  { name: 'Java', category: 'languages', demandLevel: 'high', importance: 'important', relatedSkills: ['Spring', 'Maven', 'Gradle'], aliases: ['Java SE', 'Java EE'] },
  { name: 'C#', category: 'languages', demandLevel: 'medium', importance: 'important', relatedSkills: ['.NET', 'ASP.NET', 'Azure'], aliases: ['CSharp', 'C Sharp'] },
  { name: 'Go', category: 'languages', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Docker', 'Kubernetes', 'Microservices'], aliases: ['Golang'] },
  { name: 'Rust', category: 'languages', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Systems Programming', 'WebAssembly'], aliases: [] },
  { name: 'PHP', category: 'languages', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Laravel', 'Symfony', 'WordPress'], aliases: [] },
  { name: 'Ruby', category: 'languages', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Rails', 'Sinatra'], aliases: [] },
  { name: 'Swift', category: 'languages', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['iOS', 'Xcode', 'SwiftUI'], aliases: [] },
  { name: 'Kotlin', category: 'languages', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Android', 'Java', 'Spring'], aliases: [] },

  // Frontend Frameworks & Libraries
  { name: 'React', category: 'frameworks', demandLevel: 'high', importance: 'critical', relatedSkills: ['JavaScript', 'Redux', 'Next.js'], aliases: ['React.js', 'ReactJS'] },
  { name: 'Angular', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['TypeScript', 'RxJS', 'NgRx'], aliases: ['Angular 2+', 'AngularJS'] },
  { name: 'Vue.js', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['JavaScript', 'Vuex', 'Nuxt.js'], aliases: ['Vue', 'VueJS'] },
  { name: 'Next.js', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['React', 'Node.js', 'Vercel'], aliases: ['NextJS'] },
  { name: 'Svelte', category: 'frameworks', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['JavaScript', 'SvelteKit'], aliases: [] },

  // Backend Frameworks
  { name: 'Node.js', category: 'frameworks', demandLevel: 'high', importance: 'critical', relatedSkills: ['JavaScript', 'Express', 'npm'], aliases: ['NodeJS'] },
  { name: 'Express', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Node.js', 'REST API', 'Middleware'], aliases: ['Express.js', 'ExpressJS'] },
  { name: 'Django', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Python', 'PostgreSQL', 'REST'], aliases: [] },
  { name: 'Flask', category: 'frameworks', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Python', 'REST API'], aliases: [] },
  { name: 'Spring Boot', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['Java', 'Maven', 'Hibernate'], aliases: ['Spring'] },
  { name: 'FastAPI', category: 'frameworks', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Python', 'REST API', 'Async'], aliases: [] },
  { name: 'NestJS', category: 'frameworks', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Node.js', 'TypeScript', 'Express'], aliases: ['Nest'] },

  // Web Technologies
  { name: 'HTML', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['CSS', 'JavaScript', 'Web Development'], aliases: ['HTML5'] },
  { name: 'CSS', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['HTML', 'Sass', 'Tailwind'], aliases: ['CSS3'] },
  { name: 'Sass', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['CSS', 'SCSS'], aliases: ['SCSS'] },
  { name: 'Tailwind CSS', category: 'frameworks', demandLevel: 'high', importance: 'important', relatedSkills: ['CSS', 'HTML', 'React'], aliases: ['Tailwind'] },
  { name: 'Bootstrap', category: 'frameworks', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['CSS', 'HTML', 'JavaScript'], aliases: [] },

  // Databases
  { name: 'SQL', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['PostgreSQL', 'MySQL', 'Database Design'], aliases: [] },
  { name: 'PostgreSQL', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['SQL', 'Database', 'Supabase'], aliases: ['Postgres'] },
  { name: 'MySQL', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['SQL', 'Database'], aliases: [] },
  { name: 'MongoDB', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['NoSQL', 'Database', 'Mongoose'], aliases: ['Mongo'] },
  { name: 'Redis', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Caching', 'Database'], aliases: [] },
  { name: 'Supabase', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['PostgreSQL', 'Backend', 'Auth'], aliases: [] },
  { name: 'Firebase', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['NoSQL', 'Backend', 'Auth'], aliases: [] },

  // Version Control & Collaboration
  { name: 'Git', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['GitHub', 'GitLab', 'Version Control'], aliases: [] },
  { name: 'GitHub', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Git', 'CI/CD', 'Collaboration'], aliases: [] },
  { name: 'GitLab', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Git', 'CI/CD'], aliases: [] },

  // DevOps & Cloud
  { name: 'Docker', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Kubernetes', 'Containers', 'DevOps'], aliases: [] },
  { name: 'Kubernetes', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Docker', 'DevOps', 'Cloud'], aliases: ['K8s'] },
  { name: 'AWS', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Cloud', 'EC2', 'S3'], aliases: ['Amazon Web Services'] },
  { name: 'Azure', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Cloud', 'Microsoft'], aliases: ['Microsoft Azure'] },
  { name: 'GCP', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Cloud', 'Google'], aliases: ['Google Cloud Platform'] },
  { name: 'CI/CD', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['DevOps', 'Jenkins', 'GitHub Actions'], aliases: ['Continuous Integration'] },

  // API & Architecture
  { name: 'REST API', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['HTTP', 'JSON', 'API Design'], aliases: ['RESTful API', 'REST'] },
  { name: 'GraphQL', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['API', 'Apollo', 'React'], aliases: [] },
  { name: 'Microservices', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Architecture', 'Docker', 'Kubernetes'], aliases: [] },
  { name: 'WebSockets', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Real-time', 'Socket.io'], aliases: [] },

  // Testing
  { name: 'Jest', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Testing', 'JavaScript', 'React'], aliases: [] },
  { name: 'Testing', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Jest', 'Unit Testing', 'TDD'], aliases: ['Unit Testing', 'Test-Driven Development'] },
  { name: 'Cypress', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['E2E Testing', 'Testing'], aliases: [] },
  { name: 'Selenium', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Testing', 'Automation'], aliases: [] },

  // Build Tools & Package Managers
  { name: 'Webpack', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Build Tools', 'JavaScript'], aliases: [] },
  { name: 'Vite', category: 'tools', demandLevel: 'high', importance: 'nice-to-have', relatedSkills: ['Build Tools', 'React', 'Vue'], aliases: [] },
  { name: 'npm', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Node.js', 'Package Management'], aliases: [] },
  { name: 'Yarn', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Package Management', 'npm'], aliases: [] },

  // Soft Skills
  { name: 'Problem Solving', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Algorithms', 'Debugging'], aliases: [] },
  { name: 'Communication', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Teamwork', 'Documentation'], aliases: [] },
  { name: 'Teamwork', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Collaboration', 'Agile'], aliases: ['Team Collaboration'] },
  { name: 'Agile', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Scrum', 'Sprint Planning'], aliases: ['Agile Methodology'] },
  { name: 'Code Review', category: 'soft_skills', demandLevel: 'medium', importance: 'important', relatedSkills: ['Git', 'Quality Assurance'], aliases: [] },
];

export const softwareDeveloperSkillSet: RoleSkillSet = {
  role: 'software_developer',
  displayName: 'Software Developer',
  description: 'Full-stack and specialized software development roles requiring programming, frameworks, and system design skills',
  skills: softwareDeveloperSkills
};
