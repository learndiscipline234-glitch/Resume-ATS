/**
 * Product Manager Skill Database
 * Comprehensive list of skills for product management roles
 */

import { RoleSkillSet, SkillData } from '../../ai/types';

const productManagerSkills: SkillData[] = [
  // Product Management Core
  { name: 'Product Strategy', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Roadmapping', 'Vision', 'Market Analysis'], aliases: [] },
  { name: 'Product Roadmapping', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Strategy', 'Planning', 'Prioritization'], aliases: ['Roadmapping'] },
  { name: 'Product Lifecycle', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Launch', 'Growth', 'Maturity'], aliases: ['Product Lifecycle Management'] },
  { name: 'Product Vision', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Strategy', 'Leadership'], aliases: [] },
  { name: 'Feature Prioritization', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['RICE', 'MoSCoW', 'Backlog Management'], aliases: ['Prioritization'] },
  { name: 'Go-to-Market Strategy', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Launch', 'Marketing', 'Sales'], aliases: ['GTM'] },

  // Agile & Methodologies
  { name: 'Agile', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Scrum', 'Kanban', 'Sprint Planning'], aliases: ['Agile Methodology'] },
  { name: 'Scrum', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Agile', 'Sprint', 'Ceremonies'], aliases: [] },
  { name: 'Kanban', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Agile', 'Workflow'], aliases: [] },
  { name: 'Lean', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['MVP', 'Waste Reduction'], aliases: ['Lean Methodology'] },
  { name: 'Sprint Planning', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Scrum', 'Agile', 'Backlog'], aliases: [] },
  { name: 'Backlog Management', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Prioritization', 'User Stories'], aliases: [] },

  // User Research & Analysis
  { name: 'User Research', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Interviews', 'Surveys', 'Usability Testing'], aliases: [] },
  { name: 'User Interviews', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['User Research', 'Qualitative Research'], aliases: [] },
  { name: 'Surveys', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['User Research', 'Quantitative Research'], aliases: [] },
  { name: 'Usability Testing', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['User Research', 'UX'], aliases: [] },
  { name: 'A/B Testing', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Experimentation', 'Data Analysis'], aliases: ['Split Testing'] },
  { name: 'User Personas', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['User Research', 'Segmentation'], aliases: ['Personas'] },
  { name: 'Customer Journey Mapping', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['UX', 'User Research'], aliases: [] },

  // Data & Analytics
  { name: 'Data Analysis', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['SQL', 'Excel', 'Metrics'], aliases: [] },
  { name: 'SQL', category: 'languages', demandLevel: 'high', importance: 'important', relatedSkills: ['Data Analysis', 'Database'], aliases: [] },
  { name: 'Excel', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Data Analysis', 'Spreadsheets'], aliases: ['Microsoft Excel'] },
  { name: 'Google Analytics', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Analytics', 'Web Analytics'], aliases: ['GA'] },
  { name: 'Mixpanel', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Analytics', 'Product Analytics'], aliases: [] },
  { name: 'Amplitude', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Analytics', 'Product Analytics'], aliases: [] },
  { name: 'Tableau', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Data Visualization', 'BI'], aliases: [] },
  { name: 'Metrics & KPIs', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Data Analysis', 'OKRs'], aliases: ['Key Performance Indicators'] },
  { name: 'OKRs', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Goal Setting', 'Metrics'], aliases: ['Objectives and Key Results'] },

  // Product Tools
  { name: 'Jira', category: 'tools', demandLevel: 'high', importance: 'critical', relatedSkills: ['Agile', 'Project Management'], aliases: [] },
  { name: 'Confluence', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Documentation', 'Collaboration'], aliases: [] },
  { name: 'Figma', category: 'tools', demandLevel: 'high', importance: 'important', relatedSkills: ['Design', 'Prototyping', 'Collaboration'], aliases: [] },
  { name: 'Miro', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Collaboration', 'Whiteboarding'], aliases: [] },
  { name: 'Notion', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Documentation', 'Collaboration'], aliases: [] },
  { name: 'Asana', category: 'tools', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Project Management', 'Task Management'], aliases: [] },
  { name: 'Trello', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Project Management', 'Kanban'], aliases: [] },
  { name: 'ProductBoard', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Product Management', 'Roadmapping'], aliases: [] },
  { name: 'Aha!', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Product Management', 'Roadmapping'], aliases: [] },

  // Design & UX
  { name: 'UX Design', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['User Research', 'Wireframing', 'Prototyping'], aliases: ['User Experience'] },
  { name: 'UI Design', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Design', 'Visual Design'], aliases: ['User Interface'] },
  { name: 'Wireframing', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['UX', 'Prototyping', 'Figma'], aliases: [] },
  { name: 'Prototyping', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['UX', 'Figma', 'Design'], aliases: [] },
  { name: 'Design Thinking', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Innovation', 'Problem Solving'], aliases: [] },

  // Technical Understanding
  { name: 'Technical Acumen', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['APIs', 'Software Development'], aliases: [] },
  { name: 'APIs', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['REST', 'Integration'], aliases: ['API'] },
  { name: 'Software Development Lifecycle', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Agile', 'Development'], aliases: ['SDLC'] },
  { name: 'HTML/CSS', category: 'languages', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Web', 'Frontend'], aliases: [] },
  { name: 'Git', category: 'tools', demandLevel: 'low', importance: 'nice-to-have', relatedSkills: ['Version Control'], aliases: [] },

  // Business & Strategy
  { name: 'Business Strategy', category: 'technical', demandLevel: 'high', importance: 'critical', relatedSkills: ['Market Analysis', 'Competitive Analysis'], aliases: [] },
  { name: 'Market Analysis', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Research', 'Competitive Analysis'], aliases: ['Market Research'] },
  { name: 'Competitive Analysis', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Market Analysis', 'Strategy'], aliases: [] },
  { name: 'Business Model', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Strategy', 'Revenue'], aliases: ['Business Model Canvas'] },
  { name: 'Pricing Strategy', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Business Model', 'Revenue'], aliases: [] },
  { name: 'Financial Analysis', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Business', 'ROI'], aliases: [] },
  { name: 'ROI Analysis', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Financial Analysis', 'Metrics'], aliases: ['Return on Investment'] },

  // Frameworks & Methodologies
  { name: 'RICE Framework', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Prioritization', 'Scoring'], aliases: ['RICE'] },
  { name: 'MoSCoW', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['Prioritization'], aliases: ['MoSCoW Method'] },
  { name: 'Jobs to be Done', category: 'technical', demandLevel: 'medium', importance: 'nice-to-have', relatedSkills: ['User Research', 'Framework'], aliases: ['JTBD'] },
  { name: 'Value Proposition', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Strategy', 'Positioning'], aliases: [] },
  { name: 'MVP', category: 'technical', demandLevel: 'high', importance: 'important', relatedSkills: ['Lean', 'Product Launch'], aliases: ['Minimum Viable Product'] },

  // Soft Skills
  { name: 'Communication', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Presentation', 'Stakeholder Management'], aliases: [] },
  { name: 'Stakeholder Management', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Communication', 'Influence'], aliases: [] },
  { name: 'Leadership', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Team Management', 'Influence'], aliases: [] },
  { name: 'Problem Solving', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Critical Thinking', 'Analysis'], aliases: [] },
  { name: 'Critical Thinking', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Problem Solving', 'Analysis'], aliases: [] },
  { name: 'Negotiation', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Communication', 'Influence'], aliases: [] },
  { name: 'Presentation Skills', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Communication', 'Public Speaking'], aliases: [] },
  { name: 'Collaboration', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Teamwork', 'Communication'], aliases: ['Teamwork'] },
  { name: 'Empathy', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['User Research', 'Communication'], aliases: [] },
  { name: 'Decision Making', category: 'soft_skills', demandLevel: 'high', importance: 'critical', relatedSkills: ['Critical Thinking', 'Analysis'], aliases: [] },
  { name: 'Time Management', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Prioritization', 'Organization'], aliases: [] },
  { name: 'Adaptability', category: 'soft_skills', demandLevel: 'high', importance: 'important', relatedSkills: ['Flexibility', 'Change Management'], aliases: [] },
];

export const productManagerSkillSet: RoleSkillSet = {
  role: 'product_manager',
  displayName: 'Product Manager',
  description: 'Product management roles requiring strategy, user research, data analysis, stakeholder management, and cross-functional leadership',
  skills: productManagerSkills
};
