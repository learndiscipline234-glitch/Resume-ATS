/**
 * Shared Resume Text Extractor — FIX 4 & 5
 * Unified utility for extracting text from PDF, DOCX, and TXT files.
 * Used by ATS Checker and Auto Improver — no duplicated logic.
 *
 * Viva: "The ATS checker supports both PDF and DOCX formats using
 * browser-compatible text extraction libraries, making it consistent
 * with industry-standard applicant tracking systems."
 */

import mammoth from 'mammoth';
import { parsePDF } from '@/ai/parser/pdfParser';

export type ExtractResult = {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'unknown';
  error?: string;
};

/**
 * Extract raw text from a resume file (PDF, DOCX, or TXT).
 * Browser-compatible — uses pdfjs-dist for PDF, mammoth for DOCX.
 */
export async function extractResumeText(file: File): Promise<ExtractResult> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';

  try {
    if (file.type === 'application/pdf' || ext === 'pdf') {
      const text = await parsePDF(file);
      return { text: text.trim(), fileName, fileType: 'pdf' };
    }

    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === 'docx'
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return { text: result.value.trim(), fileName, fileType: 'docx' };
    }

    if (file.type === 'text/plain' || ext === 'txt') {
      const text = await file.text();
      return { text: text.trim(), fileName, fileType: 'txt' };
    }

    // Fallback: try reading as text
    const text = await file.text();
    return { text: text.trim(), fileName, fileType: 'unknown' };

  } catch (err) {
    return {
      text: '',
      fileName,
      fileType: 'unknown',
      error: err instanceof Error ? err.message : 'Failed to extract text from file',
    };
  }
}

/**
 * Check if a file type is supported for resume extraction.
 */
export function isSupportedResumeFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  const supportedExts = ['pdf', 'docx', 'txt'];
  return supportedTypes.includes(file.type) || supportedExts.includes(ext);
}
