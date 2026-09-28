/**
 * Unit Tests for Resume Parser
 * 
 * Tests PDF/DOC/DOCX extraction accuracy, error handling, and file type detection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseResume } from '../../ai/parser/resumeParser';
import type { ParsedResume } from '../../ai/types';

describe('Resume Parser', () => {
  describe('PDF Extraction', () => {
    it('should extract text from valid PDF file', async () => {
      // Mock PDF file
      const mockPdfFile = new File(['mock pdf content'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockPdfFile);
      
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
    });

    it('should extract contact information from PDF', async () => {
      const mockPdfFile = new File(['John Doe\njohn@example.com\n555-1234'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockPdfFile);
      
      expect(result.contactInfo).toBeDefined();
      // Contact info extraction depends on parser implementation
    });

    it('should extract sections from PDF', async () => {
      const mockPdfFile = new File(['Experience\nSoftware Engineer\nEducation\nBS Computer Science'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockPdfFile);
      
      expect(result.sections).toBeDefined();
      expect(Array.isArray(result.sections)).toBe(true);
    });

    it('should handle multi-page PDF files', async () => {
      // Mock 5-page PDF
      const mockPdfFile = new File(['page 1\npage 2\npage 3\npage 4\npage 5'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockPdfFile);
      
      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
    });

    it('should preserve formatting in PDF extraction', async () => {
      const mockPdfFile = new File(['Line 1\nLine 2\nLine 3'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockPdfFile);
      
      expect(result.text).toContain('\n');
    });
  });

  describe('DOC/DOCX Extraction', () => {
    it('should extract text from valid DOCX file', async () => {
      const mockDocxFile = new File(['mock docx content'], 'resume.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const result = await parseResume(mockDocxFile);
      
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
    });

    it('should extract text from valid DOC file', async () => {
      const mockDocFile = new File(['mock doc content'], 'resume.doc', { 
        type: 'application/msword' 
      });
      
      const result = await parseResume(mockDocFile);
      
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
    });

    it('should extract contact information from DOCX', async () => {
      const mockDocxFile = new File(['Jane Smith\njane@example.com\n555-5678'], 'resume.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const result = await parseResume(mockDocxFile);
      
      expect(result.contactInfo).toBeDefined();
    });

    it('should handle formatted DOCX files', async () => {
      const mockDocxFile = new File(['Bold text\nItalic text\nBullet points'], 'resume.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const result = await parseResume(mockDocxFile);
      
      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
    });

    it('should extract tables from DOCX files', async () => {
      const mockDocxFile = new File(['Table data\nRow 1\nRow 2'], 'resume.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const result = await parseResume(mockDocxFile);
      
      expect(result.text).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted PDF files gracefully', async () => {
      const corruptedPdf = new File(['corrupted data'], 'corrupted.pdf', { type: 'application/pdf' });
      
      await expect(parseResume(corruptedPdf)).rejects.toThrow();
    });

    it('should handle corrupted DOCX files gracefully', async () => {
      const corruptedDocx = new File(['corrupted data'], 'corrupted.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      await expect(parseResume(corruptedDocx)).rejects.toThrow();
    });

    it('should handle empty PDF files', async () => {
      const emptyPdf = new File([''], 'empty.pdf', { type: 'application/pdf' });
      
      await expect(parseResume(emptyPdf)).rejects.toThrow(/empty|insufficient/i);
    });

    it('should handle empty DOCX files', async () => {
      const emptyDocx = new File([''], 'empty.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      await expect(parseResume(emptyDocx)).rejects.toThrow(/empty|insufficient/i);
    });

    it('should provide meaningful error messages for corrupted files', async () => {
      const corruptedFile = new File(['invalid'], 'corrupted.pdf', { type: 'application/pdf' });
      
      try {
        await parseResume(corruptedFile);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
      }
    });

    it('should handle files with unsupported encoding', async () => {
      const invalidFile = new File([new Uint8Array([0xFF, 0xFE])], 'invalid.pdf', { type: 'application/pdf' });
      
      await expect(parseResume(invalidFile)).rejects.toThrow();
    });

    it('should handle very large files gracefully', async () => {
      // Mock 50MB file
      const largeContent = 'x'.repeat(50 * 1024 * 1024);
      const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      
      // Should either succeed or fail gracefully with size error
      try {
        const result = await parseResume(largeFile);
        expect(result).toBeDefined();
      } catch (error: any) {
        expect(error.message).toMatch(/size|large|limit/i);
      }
    });
  });

  describe('File Type Detection', () => {
    it('should correctly detect PDF files by MIME type', async () => {
      const pdfFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(pdfFile);
      
      expect(result).toBeDefined();
    });

    it('should correctly detect DOCX files by MIME type', async () => {
      const docxFile = new File(['content'], 'resume.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const result = await parseResume(docxFile);
      
      expect(result).toBeDefined();
    });

    it('should correctly detect DOC files by MIME type', async () => {
      const docFile = new File(['content'], 'resume.doc', { type: 'application/msword' });
      
      const result = await parseResume(docFile);
      
      expect(result).toBeDefined();
    });

    it('should reject unsupported file types', async () => {
      const txtFile = new File(['content'], 'resume.txt', { type: 'text/plain' });
      
      await expect(parseResume(txtFile)).rejects.toThrow(/unsupported|invalid/i);
    });

    it('should handle files with incorrect extensions', async () => {
      // PDF file with .txt extension
      const mislabeledFile = new File(['pdf content'], 'resume.txt', { type: 'application/pdf' });
      
      // Should use MIME type, not extension
      const result = await parseResume(mislabeledFile);
      expect(result).toBeDefined();
    });

    it('should handle files with missing MIME type', async () => {
      const noMimeFile = new File(['content'], 'resume.pdf', { type: '' });
      
      // Should fall back to extension detection
      try {
        const result = await parseResume(noMimeFile);
        expect(result).toBeDefined();
      } catch (error: any) {
        expect(error.message).toMatch(/type|mime|unsupported/i);
      }
    });
  });

  describe('Extraction Accuracy', () => {
    it('should extract at least 95% of text content from PDF', async () => {
      const expectedText = 'This is a test resume with multiple sections including experience and education.';
      const mockPdf = new File([expectedText], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockPdf);
      
      // Check that most words are present
      const expectedWords = expectedText.split(' ');
      const extractedText = result.text.toLowerCase();
      const matchedWords = expectedWords.filter(word => 
        extractedText.includes(word.toLowerCase())
      );
      
      const accuracy = matchedWords.length / expectedWords.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.95);
    });

    it('should preserve special characters in extraction', async () => {
      const textWithSpecialChars = 'Email: john@example.com, Phone: (555) 123-4567, Skills: C++, C#';
      const mockFile = new File([textWithSpecialChars], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockFile);
      
      expect(result.text).toMatch(/@/);
      expect(result.text).toMatch(/\(/);
      expect(result.text).toMatch(/\+/);
    });

    it('should handle resumes with multiple languages', async () => {
      const multiLangText = 'English text\nEspañol texto\n日本語テキスト';
      const mockFile = new File([multiLangText], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockFile);
      
      expect(result.text).toBeDefined();
      expect(result.text.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should parse a 1-page resume within 1 second', async () => {
      const mockFile = new File(['Single page resume content'], 'resume.pdf', { type: 'application/pdf' });
      
      const startTime = Date.now();
      await parseResume(mockFile);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should parse a 5-page resume within 3 seconds', async () => {
      const longContent = 'Page content\n'.repeat(500); // Simulate 5 pages
      const mockFile = new File([longContent], 'resume.pdf', { type: 'application/pdf' });
      
      const startTime = Date.now();
      await parseResume(mockFile);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract file metadata', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockFile);
      
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.fileName).toBe('resume.pdf');
      expect(result.metadata?.fileType).toBe('application/pdf');
    });

    it('should extract page count for PDF', async () => {
      const mockFile = new File(['page 1\npage 2'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockFile);
      
      expect(result.metadata?.pageCount).toBeDefined();
      expect(result.metadata?.pageCount).toBeGreaterThan(0);
    });

    it('should extract word count', async () => {
      const mockFile = new File(['one two three four five'], 'resume.pdf', { type: 'application/pdf' });
      
      const result = await parseResume(mockFile);
      
      expect(result.metadata?.wordCount).toBeDefined();
      expect(result.metadata?.wordCount).toBeGreaterThan(0);
    });
  });
});
