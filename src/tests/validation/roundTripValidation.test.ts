/**
 * Round-Trip Validation Tests
 * 
 * Tests the parse → print → parse cycle to ensure data preservation
 * Validates that 98% of data is preserved through the round-trip
 * 
 * @module tests/validation/roundTripValidation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ResumeParser } from '../../ai/parser/resumeParser';
import { formatParsedResume, validateRoundTrip } from '../../ai/parser/prettyPrinter';
import { ParsedResume } from '../../ai/types';

describe('Round-Trip Validation Tests', () => {
  let resumeParser: ResumeParser;

  beforeAll(() => {
    resumeParser = new ResumeParser();
  });

  describe('Parse → Print → Parse Cycle', () => {
    it('should preserve all data through round-trip for simple resume', async () => {
      // Arrange: Create a simple resume
      const resumeText = `
John Doe
Email: john.doe@example.com
Phone: (555) 123-4567

SKILLS
JavaScript, TypeScript, React, Node.js, Python

EXPERIENCE
Software Engineer at Tech Corp
Developed web applications using React and Node.js
Implemented RESTful APIs and microservices

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2020
      `.trim();

      const file = new File([resumeText], 'resume.txt', { type: 'text/plain' });

      // Act: Parse → Print → Parse
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert: Validate round-trip
      const validation = validateRoundTrip(originalParsed, reparsed);
      
      expect(validation.isValid).toBe(true);
      expect(validation.similarityScore).toBeGreaterThanOrEqual(98);
      expect(validation.dataLoss).toBe(false);
      expect(validation.issues).toHaveLength(0);
    });

    it('should preserve contact information through round-trip', async () => {
      // Arrange
      const resumeText = `
Jane Smith
Email: jane.smith@email.com
Phone: +1-555-987-6543
      `.trim();

      const file = new File([resumeText], 'resume.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      expect(reparsed.name).toBe(originalParsed.name);
      expect(reparsed.email).toBe(originalParsed.email);
      expect(reparsed.phone).toBe(originalParsed.phone);
    });

    it('should preserve skills through round-trip', async () => {
      // Arrange
      const resumeText = `
SKILLS
Python, Machine Learning, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy
      `.trim();

      const file = new File([resumeText], 'resume.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      const validation = validateRoundTrip(originalParsed, reparsed);
      expect(validation.similarityScore).toBeGreaterThanOrEqual(95);
    });

    it('should preserve sections through round-trip', async () => {
      // Arrange
      const resumeText = `
EXPERIENCE
Senior Developer at ABC Company
Led team of 5 developers
Implemented CI/CD pipeline

EDUCATION
Master of Computer Science
Stanford University, 2018
      `.trim();

      const file = new File([resumeText], 'resume.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      expect(reparsed.sections).toBeDefined();
      expect(reparsed.sections?.length).toBeGreaterThan(0);
      
      const validation = validateRoundTrip(originalParsed, reparsed);
      expect(validation.similarityScore).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Data Preservation Validation', () => {
    it('should achieve 98% data preservation for complete resume', async () => {
      // Arrange: Create a comprehensive resume
      const resumeText = `
Michael Johnson
Email: michael.j@techmail.com
Phone: (555) 234-5678

Target Role: Software Developer

SKILLS
JavaScript, TypeScript, React, Vue.js, Node.js, Express, MongoDB, PostgreSQL, Docker, Kubernetes, AWS, Git

EXPERIENCE
Senior Software Engineer at Innovation Labs
- Architected and developed microservices using Node.js and Docker
- Led migration to Kubernetes cluster, improving scalability by 300%
- Mentored junior developers and conducted code reviews

Software Engineer at StartupCo
- Built responsive web applications using React and TypeScript
- Implemented RESTful APIs and GraphQL endpoints
- Optimized database queries, reducing response time by 50%

EDUCATION
Bachelor of Science in Computer Science
Massachusetts Institute of Technology, 2015
GPA: 3.8/4.0

CERTIFICATIONS
AWS Certified Solutions Architect
Kubernetes Administrator (CKA)
      `.trim();

      const file = new File([resumeText], 'resume.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      const validation = validateRoundTrip(originalParsed, reparsed);
      
      expect(validation.similarityScore).toBeGreaterThanOrEqual(98);
      expect(validation.isValid).toBe(true);
      
      // Log any issues for debugging
      if (validation.issues.length > 0) {
        console.log('Validation issues:', validation.issues);
      }
    });

    it('should log data loss when it occurs', async () => {
      // Arrange: Create a resume with special characters
      const resumeText = `
José García
Email: jose.garcia@email.com
Phone: +34-555-123-456

SKILLS
C++, C#, .NET, ASP.NET Core
      `.trim();

      const file = new File([resumeText], 'resume.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      const validation = validateRoundTrip(originalParsed, reparsed);
      
      if (validation.dataLoss) {
        console.log('Data loss detected:', validation.issues);
        expect(validation.issues.length).toBeGreaterThan(0);
      }
      
      // Should still achieve high similarity
      expect(validation.similarityScore).toBeGreaterThanOrEqual(90);
    });

    it('should flag resumes with low similarity for manual review', async () => {
      // Arrange: Create a complex resume with nested structures
      const resumeText = `
Dr. Sarah Williams, Ph.D.
Email: s.williams@research.edu
Phone: (555) 345-6789

RESEARCH INTERESTS
- Machine Learning & Deep Learning
- Natural Language Processing
- Computer Vision
- Reinforcement Learning

PUBLICATIONS
1. "Advanced Neural Networks for Image Recognition" - IEEE 2022
2. "Transformer Models in NLP" - ACL 2021
3. "Reinforcement Learning Applications" - NeurIPS 2020
      `.trim();

      const file = new File([resumeText], 'resume.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      const validation = validateRoundTrip(originalParsed, reparsed);
      
      if (validation.similarityScore < 98) {
        console.log('Resume flagged for manual review');
        console.log('Similarity score:', validation.similarityScore);
        console.log('Issues:', validation.issues);
        
        expect(validation.isValid).toBe(false);
      }
    });
  });

  describe('Format Options Validation', () => {
    it('should preserve data with different format options', async () => {
      // Arrange
      const resumeText = `
Alex Chen
Email: alex.chen@email.com

SKILLS
Java, Spring Boot, Hibernate, MySQL
      `.trim();

      const file = new File([resumeText], 'resume.txt', { type: 'text/plain' });

      // Act: Test with different format options
      const originalParsed = await resumeParser.parseResume(file);
      
      const formatted1 = formatParsedResume(originalParsed, {
        includeSectionHeaders: true,
        lineSeparator: '\n',
      });
      
      const formatted2 = formatParsedResume(originalParsed, {
        includeSectionHeaders: false,
        lineSeparator: '\n',
      });

      // Assert: Both should be parseable
      const reparsed1File = new File([formatted1], 'test1.txt', { type: 'text/plain' });
      const reparsed2File = new File([formatted2], 'test2.txt', { type: 'text/plain' });
      
      const reparsed1 = await resumeParser.parseResume(reparsed1File);
      const reparsed2 = await resumeParser.parseResume(reparsed2File);

      expect(reparsed1).toBeDefined();
      expect(reparsed2).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty resume', async () => {
      // Arrange
      const resumeText = '';
      const file = new File([resumeText], 'empty.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      const validation = validateRoundTrip(originalParsed, reparsed);
      expect(validation).toBeDefined();
    });

    it('should handle resume with only contact info', async () => {
      // Arrange
      const resumeText = `
John Smith
Email: john@email.com
      `.trim();

      const file = new File([resumeText], 'minimal.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      expect(reparsed.name).toBe(originalParsed.name);
      expect(reparsed.email).toBe(originalParsed.email);
    });

    it('should handle resume with special characters', async () => {
      // Arrange
      const resumeText = `
François Müller
Email: francois.muller@email.com

SKILLS
C++, C#, F#, R, SQL
      `.trim();

      const file = new File([resumeText], 'special.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      const validation = validateRoundTrip(originalParsed, reparsed);
      expect(validation.similarityScore).toBeGreaterThanOrEqual(90);
    });

    it('should handle resume with very long sections', async () => {
      // Arrange
      const longDescription = 'Developed and maintained ' + 'complex software systems '.repeat(50);
      const resumeText = `
EXPERIENCE
Senior Engineer
${longDescription}
      `.trim();

      const file = new File([resumeText], 'long.txt', { type: 'text/plain' });

      // Act
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);

      // Assert
      const validation = validateRoundTrip(originalParsed, reparsed);
      expect(validation.similarityScore).toBeGreaterThanOrEqual(95);
    });
  });

  describe('Performance Validation', () => {
    it('should complete round-trip within reasonable time', async () => {
      // Arrange
      const resumeText = `
Performance Test Resume
Email: test@email.com

SKILLS
${'JavaScript, '.repeat(50)}TypeScript

EXPERIENCE
${'Senior Developer\n'.repeat(20)}
      `.trim();

      const file = new File([resumeText], 'perf.txt', { type: 'text/plain' });

      // Act
      const startTime = Date.now();
      
      const originalParsed = await resumeParser.parseResume(file);
      const formatted = formatParsedResume(originalParsed);
      const reparsedFile = new File([formatted], 'reparsed.txt', { type: 'text/plain' });
      const reparsed = await resumeParser.parseResume(reparsedFile);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert: Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      
      const validation = validateRoundTrip(originalParsed, reparsed);
      expect(validation).toBeDefined();
    });
  });
});
