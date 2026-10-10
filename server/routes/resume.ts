import { Router, Request, Response } from 'express';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { generateResumeHtml } from '../../src/services/resumeGenerator.js';
import type { PortfolioData } from '../../src/types/portfolio.js';
import JSZip from 'jszip';

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

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm',
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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate HTML resume' });
  }
});
