import { Router, Request, Response } from 'express';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { generateResumeHtml } from '../../src/services/resumeGenerator.js';
import { generateDocxBuffer } from '../../src/services/docxGenerator.js';
import type { PortfolioData } from '../../src/types/portfolio.js';

export const resumeRouter = Router();

// Locate standard Chromium/Chrome executable on Windows
function getChromePath(): string {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH || '',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

/**
 * POST /api/resume/pdf
 * Generates an authentic, publication-quality A4 vector PDF using Puppeteer
 */
resumeRouter.post('/pdf', async (req: Request, res: Response) => {
  try {
    let html = req.body.html;
    const portfolio: PortfolioData = req.body.portfolio;
    const options = req.body.options || {};

    if (!html && (!portfolio || !portfolio.name)) {
      return res.status(400).json({ error: 'Missing required portfolio data or HTML content' });
    }

    if (!html) {
      html = generateResumeHtml(portfolio, options);
    }
    const chromePath = getChromePath();

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    // Emulate print media for exact CSS print rules
    await page.emulateMediaType('print');

    const isCompact = options.template === 'compact';
    const marginSize = isCompact ? '10mm' : '15mm';

    // Check if content spans multiple pages (A4 height is ~1122px at 96 DPI)
    const isMultiPage = await page.evaluate(() => {
      const sheet = document.querySelector('.resume-sheet') || document.body;
      return sheet.scrollHeight > 1050;
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: isMultiPage,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 8pt; color: #64748b; width: 100%; text-align: right; padding-right: ${marginSize}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      margin: {
        top: marginSize,
        bottom: marginSize,
        left: marginSize,
        right: marginSize,
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    const safeBase = req.body.filename
      ? req.body.filename.replace(/\.pdf$/i, '')
      : (portfolio?.name ? portfolio.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Professional_Candidate');
    const filename = req.body.filename?.endsWith('.pdf') ? req.body.filename : `${safeBase}_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Server PDF generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate PDF resume',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/resume/docx
 * Generates an editable Microsoft Word document (.docx) using the docx library
 */
resumeRouter.post('/docx', async (req: Request, res: Response) => {
  try {
    const portfolio: PortfolioData = req.body.portfolio;
    const options = req.body.options || {};

    if (!portfolio || !portfolio.name) {
      return res.status(400).json({ error: 'Missing required portfolio data' });
    }

    const docxBuffer = await generateDocxBuffer(portfolio, options);

    const safeBase = req.body.filename
      ? req.body.filename.replace(/\.docx$/i, '')
      : portfolio.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = req.body.filename?.endsWith('.docx') ? req.body.filename : `${safeBase}_Resume.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', docxBuffer.length);

    return res.end(docxBuffer);
  } catch (error) {
    console.error('Server DOCX generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate DOCX resume',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/resume/html
 * Returns standard standalone styled HTML
 */
resumeRouter.post('/html', (req: Request, res: Response) => {
  try {
    const portfolio: PortfolioData = req.body.portfolio;
    const options = req.body.options || {};

    if (!portfolio || !portfolio.name) {
      return res.status(400).json({ error: 'Missing required portfolio data' });
    }

    const html = generateResumeHtml(portfolio, options);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch {
    return res.status(500).json({ error: 'Failed to generate HTML resume' });
  }
});
