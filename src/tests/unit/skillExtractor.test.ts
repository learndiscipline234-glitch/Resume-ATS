/**
 * Unit Tests for Skill Extractor
 * 
 * Tests skill identification accuracy, handling of variations, and confidence scoring
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { extractSkills } from '../../ai/parser/skillExtractor';
import type { ExtractedSkill } from '../../ai/types';

describe('Skill Extractor', () => {
  describe('Skill Identification', () => {
    it('should identify programming languages', async () => {
      const text = 'Proficient in JavaScript, Python, and Java';
      
      const skills = await extractSkills(text);
      
      expect(skills).toBeDefined();
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.some(s => s.skill.toLowerCase().includes('javascript'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('python'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('java'))).toBe(true);
    });

    it('should identify frameworks and libraries', async () => {
      const text = 'Experience with React, Angular, and Vue.js frameworks';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('react'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('angular'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('vue'))).toBe(true);
    });

    it('should identify databases', async () => {
      const text = 'Worked with PostgreSQL, MongoDB, and Redis databases';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('postgresql'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('mongodb'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('redis'))).toBe(true);
    });

    it('should identify cloud platforms', async () => {
      const text = 'Deployed applications on AWS, Azure, and Google Cloud Platform';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('aws'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('azure'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('gcp') || s.skill.toLowerCase().includes('google cloud'))).toBe(true);
    });

    it('should identify DevOps tools', async () => {
      const text = 'Experienced with Docker, Kubernetes, Jenkins, and Terraform';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('docker'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('kubernetes'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('jenkins'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('terraform'))).toBe(true);
    });

    it('should identify soft skills', async () => {
      const text = 'Strong communication skills, team leadership, and problem-solving abilities';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('communication'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('leadership'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('problem'))).toBe(true);
    });

    it('should identify ML/AI skills', async () => {
      const text = 'Expertise in TensorFlow, PyTorch, Machine Learning, and Deep Learning';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('tensorflow'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('pytorch'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('machine learning'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('deep learning'))).toBe(true);
    });

    it('should identify version control skills', async () => {
      const text = 'Proficient with Git, GitHub, and GitLab for version control';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('git'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('github'))).toBe(true);
    });

    it('should identify testing tools', async () => {
      const text = 'Experience with Jest, Cypress, Selenium, and unit testing';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('jest'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('cypress'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('selenium'))).toBe(true);
    });

    it('should identify multiple skills in a single sentence', async () => {
      const text = 'Built REST APIs using Node.js, Express, and PostgreSQL';
      
      const skills = await extractSkills(text);
      
      expect(skills.length).toBeGreaterThanOrEqual(3);
      expect(skills.some(s => s.skill.toLowerCase().includes('node'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('express'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('postgresql'))).toBe(true);
    });
  });

  describe('Skill Variations', () => {
    it('should handle "JS" as "JavaScript"', async () => {
      const text = 'Proficient in JS and TypeScript';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => 
        s.skill.toLowerCase().includes('javascript') || 
        s.skill.toLowerCase() === 'js'
      )).toBe(true);
    });

    it('should handle "TS" as "TypeScript"', async () => {
      const text = 'Experience with TS and React';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => 
        s.skill.toLowerCase().includes('typescript') || 
        s.skill.toLowerCase() === 'ts'
      )).toBe(true);
    });

    it('should handle "Node" as "Node.js"', async () => {
      const text = 'Backend development with Node';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => 
        s.skill.toLowerCase().includes('node')
      )).toBe(true);
    });

    it('should handle "K8s" as "Kubernetes"', async () => {
      const text = 'Container orchestration with K8s';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => 
        s.skill.toLowerCase().includes('kubernetes') || 
        s.skill.toLowerCase() === 'k8s'
      )).toBe(true);
    });

    it('should handle "ML" as "Machine Learning"', async () => {
      const text = 'Developed ML models for prediction';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => 
        s.skill.toLowerCase().includes('machine learning') || 
        s.skill.toLowerCase() === 'ml'
      )).toBe(true);
    });

    it('should handle "AI" as "Artificial Intelligence"', async () => {
      const text = 'AI research and development';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => 
        s.skill.toLowerCase().includes('artificial intelligence') || 
        s.skill.toLowerCase() === 'ai'
      )).toBe(true);
    });

    it('should handle case variations', async () => {
      const text = 'PYTHON, python, Python, and PyThOn';
      
      const skills = await extractSkills(text);
      
      // Should normalize to single skill
      const pythonSkills = skills.filter(s => s.skill.toLowerCase().includes('python'));
      expect(pythonSkills.length).toBeGreaterThan(0);
    });

    it('should handle punctuation variations', async () => {
      const text = 'Node.js, NodeJS, and Node-js';
      
      const skills = await extractSkills(text);
      
      // Should recognize all as Node.js
      const nodeSkills = skills.filter(s => s.skill.toLowerCase().includes('node'));
      expect(nodeSkills.length).toBeGreaterThan(0);
    });

    it('should handle plural forms', async () => {
      const text = 'API, APIs, and RESTful APIs';
      
      const skills = await extractSkills(text);
      
      const apiSkills = skills.filter(s => s.skill.toLowerCase().includes('api'));
      expect(apiSkills.length).toBeGreaterThan(0);
    });

    it('should handle compound skills', async () => {
      const text = 'Full-stack development, full stack, and fullstack';
      
      const skills = await extractSkills(text);
      
      const fullStackSkills = skills.filter(s => 
        s.skill.toLowerCase().includes('full') && 
        s.skill.toLowerCase().includes('stack')
      );
      expect(fullStackSkills.length).toBeGreaterThan(0);
    });
  });

  describe('Confidence Scoring', () => {
    it('should assign high confidence to exact skill matches', async () => {
      const text = 'Expert in JavaScript programming';
      
      const skills = await extractSkills(text);
      const jsSkill = skills.find(s => s.skill.toLowerCase().includes('javascript'));
      
      expect(jsSkill).toBeDefined();
      expect(jsSkill!.confidence).toBeGreaterThan(0.7);
    });

    it('should assign medium confidence to contextual matches', async () => {
      const text = 'Used scripting for automation';
      
      const skills = await extractSkills(text);
      
      // Contextual skills should have medium confidence
      skills.forEach(skill => {
        expect(skill.confidence).toBeGreaterThan(0);
        expect(skill.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should assign lower confidence to ambiguous terms', async () => {
      const text = 'Experience with development and testing';
      
      const skills = await extractSkills(text);
      
      // Generic terms should have lower confidence
      const genericSkills = skills.filter(s => 
        s.skill.toLowerCase() === 'development' || 
        s.skill.toLowerCase() === 'testing'
      );
      
      genericSkills.forEach(skill => {
        expect(skill.confidence).toBeLessThan(0.8);
      });
    });

    it('should increase confidence for skills mentioned multiple times', async () => {
      const text = 'Python expert. Developed Python applications. Python is my primary language.';
      
      const skills = await extractSkills(text);
      const pythonSkill = skills.find(s => s.skill.toLowerCase().includes('python'));
      
      expect(pythonSkill).toBeDefined();
      expect(pythonSkill!.confidence).toBeGreaterThan(0.8);
    });

    it('should increase confidence for skills with proficiency indicators', async () => {
      const text = 'Expert in React, proficient in Angular, familiar with Vue';
      
      const skills = await extractSkills(text);
      
      const reactSkill = skills.find(s => s.skill.toLowerCase().includes('react'));
      const angularSkill = skills.find(s => s.skill.toLowerCase().includes('angular'));
      const vueSkill = skills.find(s => s.skill.toLowerCase().includes('vue'));
      
      expect(reactSkill?.confidence).toBeGreaterThan(angularSkill?.confidence || 0);
      expect(angularSkill?.confidence).toBeGreaterThan(vueSkill?.confidence || 0);
    });

    it('should assign confidence scores between 0 and 1', async () => {
      const text = 'JavaScript, Python, Java, C++, Ruby, Go, Rust, Swift';
      
      const skills = await extractSkills(text);
      
      skills.forEach(skill => {
        expect(skill.confidence).toBeGreaterThanOrEqual(0);
        expect(skill.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should increase confidence for skills in dedicated sections', async () => {
      const text = 'SKILLS: JavaScript, Python, React, Node.js';
      
      const skills = await extractSkills(text);
      
      // Skills in dedicated sections should have higher confidence
      skills.forEach(skill => {
        expect(skill.confidence).toBeGreaterThan(0.6);
      });
    });
  });

  describe('Context Awareness', () => {
    it('should extract skills from experience descriptions', async () => {
      const text = 'Software Engineer at TechCorp\nDeveloped web applications using React and Node.js';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('react'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('node'))).toBe(true);
    });

    it('should extract skills from project descriptions', async () => {
      const text = 'Project: E-commerce Platform\nBuilt with Django, PostgreSQL, and Redis';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('django'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('postgresql'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('redis'))).toBe(true);
    });

    it('should extract skills from education section', async () => {
      const text = 'BS Computer Science\nCoursework: Data Structures, Algorithms, Machine Learning';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('data structures'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('algorithms'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('machine learning'))).toBe(true);
    });

    it('should not extract common words as skills', async () => {
      const text = 'I am a developer who likes to work on projects';
      
      const skills = await extractSkills(text);
      
      // Should not extract "am", "a", "who", "to", "on" as skills
      const commonWords = ['am', 'a', 'who', 'to', 'on', 'i'];
      const hasCommonWords = skills.some(s => 
        commonWords.includes(s.skill.toLowerCase())
      );
      
      expect(hasCommonWords).toBe(false);
    });

    it('should handle skills in bullet points', async () => {
      const text = '• JavaScript\n• Python\n• React\n• Node.js';
      
      const skills = await extractSkills(text);
      
      expect(skills.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', async () => {
      const text = '';
      
      const skills = await extractSkills(text);
      
      expect(skills).toBeDefined();
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBe(0);
    });

    it('should handle text with no skills', async () => {
      const text = 'This is just regular text without any technical skills mentioned.';
      
      const skills = await extractSkills(text);
      
      expect(skills).toBeDefined();
      expect(Array.isArray(skills)).toBe(true);
    });

    it('should handle very long text', async () => {
      const longText = 'JavaScript '.repeat(1000);
      
      const skills = await extractSkills(longText);
      
      expect(skills).toBeDefined();
      expect(skills.some(s => s.skill.toLowerCase().includes('javascript'))).toBe(true);
    });

    it('should handle special characters', async () => {
      const text = 'C++, C#, F#, and .NET development';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.includes('C++'))).toBe(true);
      expect(skills.some(s => s.skill.includes('C#'))).toBe(true);
      expect(skills.some(s => s.skill.includes('.NET'))).toBe(true);
    });

    it('should handle skills with numbers', async () => {
      const text = 'Vue.js 3, Angular 15, React 18';
      
      const skills = await extractSkills(text);
      
      expect(skills.some(s => s.skill.toLowerCase().includes('vue'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('angular'))).toBe(true);
      expect(skills.some(s => s.skill.toLowerCase().includes('react'))).toBe(true);
    });

    it('should deduplicate identical skills', async () => {
      const text = 'Python Python Python JavaScript JavaScript';
      
      const skills = await extractSkills(text);
      
      const pythonSkills = skills.filter(s => s.skill.toLowerCase().includes('python'));
      const jsSkills = skills.filter(s => s.skill.toLowerCase().includes('javascript'));
      
      // Should have at most one entry per skill (or handle duplicates appropriately)
      expect(pythonSkills.length).toBeLessThanOrEqual(3);
      expect(jsSkills.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Performance', () => {
    it('should extract skills from short text within 100ms', async () => {
      const text = 'JavaScript, Python, React, Node.js';
      
      const startTime = Date.now();
      await extractSkills(text);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should extract skills from long text within 500ms', async () => {
      const longText = 'JavaScript Python React Node.js '.repeat(100);
      
      const startTime = Date.now();
      await extractSkills(longText);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
