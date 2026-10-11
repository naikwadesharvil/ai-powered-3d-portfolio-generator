import { saveAs } from 'file-saver';
import type { PortfolioData } from '../types/portfolio';
import {
  generateResumeHtml,
  generateResumeMarkdown,
  generateResumePlainText,
  type ResumeRenderOptions,
} from './resumeGenerator';
import { generateDocxBlob } from './docxGenerator';

const API_BASE = 'http://localhost:5000/api';

/**
 * Download professional ATS PDF
 * 1. Attempts server-side high-fidelity Puppeteer PDF generation
 * 2. Seamlessly falls back to client-side A4 print window if server unavailable
 */
export async function downloadResumePdf(
  portfolio: PortfolioData,
  options: ResumeRenderOptions = {}
): Promise<{ success: boolean; method: 'server' | 'print_fallback'; error?: string }> {
  const safeName = portfolio.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeName}_Resume.pdf`;

  try {
    const response = await fetch(`${API_BASE}/resume/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ portfolio, options }),
    });

    if (response.ok) {
      const blob = await response.blob();
      saveAs(blob, filename);
      return { success: true, method: 'server' };
    }
  } catch (err) {
    console.warn('Server PDF endpoint unreachable, invoking client-side print fallback:', err);
  }

  // Client-side fallback: Open standard formatted print dialog
  try {
    const html = generateResumeHtml(portfolio, options);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
      return { success: true, method: 'print_fallback' };
    }
  } catch (printErr) {
    console.error('Client print fallback failed:', printErr);
  }

  return { success: false, method: 'server', error: 'Failed to generate PDF' };
}

/**
 * Download standard, editable Microsoft Word (.docx) file
 */
export async function downloadResumeDocx(
  portfolio: PortfolioData,
  options: ResumeRenderOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const safeName = (portfolio.name || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_Resume.docx`;

    const blob = await generateDocxBlob(portfolio, options);
    saveAs(blob, filename);
    return { success: true };
  } catch (err) {
    console.error('Failed to generate DOCX:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Download ATS-ready Markdown file
 */
export function downloadResumeMarkdown(portfolio: PortfolioData): void {
  const safeName = portfolio.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeName}_Resume.md`;
  const content = generateResumeMarkdown(portfolio);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  saveAs(blob, filename);
}

/**
 * Copy pure plaintext ATS formatted text to clipboard
 */
export async function copyResumePlainText(portfolio: PortfolioData): Promise<boolean> {
  try {
    const text = generateResumePlainText(portfolio);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
