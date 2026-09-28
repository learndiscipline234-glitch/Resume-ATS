import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Parse PDF file and extract text content using pdfjs-dist (browser-compatible).
 * Uses Y-coordinate grouping to reconstruct proper line breaks from PDF text items.
 *
 * @param file - The PDF file to parse
 * @returns Promise<string> - Extracted text with proper newline-based line structure
 */
export async function parsePDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Group text items by their Y position (items on the same visual line share the same Y)
      const lineMap = new Map<number, string[]>();

      for (const item of textContent.items as any[]) {
        if (!item.str || !item.str.trim()) continue;
        // Round Y to nearest 3px bucket to group items on the same visual line
        const y = Math.round(item.transform[5] / 3) * 3;
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y)!.push(item.str);
      }

      // Sort by Y descending (PDF coordinate system: Y grows upward, so higher Y = top of page)
      const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
      const lines = sortedYs
        .map(y => lineMap.get(y)!.join(' ').trim())
        .filter(l => l.length > 0);

      pageTexts.push(lines.join('\n'));
    }

    const result = pageTexts.join('\n');
    console.log('[PDFParser] Extracted', result.split('\n').length, 'lines from', pdf.numPages, 'page(s)');
    console.log('[PDFParser] First 10 lines:', result.split('\n').slice(0, 10));
    return result.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
