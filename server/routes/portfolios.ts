import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PortfolioDataSchema } from '../schemas/portfolioSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Portfolios storage directory
const STORAGE_DIR = path.resolve(__dirname, '../../server/data/portfolios');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export const portfoliosRouter = Router();

// Strict Rate Limiting for portfolio creation & deletion (20 requests per 15 min per IP)
const portfolioPublishLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Publication rate limit exceeded. Please wait 15 minutes before creating more portfolios.',
  },
});

/**
 * Recursively strip base64 image strings larger than 200KB (approx 266,666 chars)
 * to prevent storage bloat or DoS attacks.
 */
function stripLargeBase64Images(obj: any): any {
  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/') && obj.length > 200000) {
      return ''; // Strip oversized base64
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripLargeBase64Images);
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      cleaned[key] = stripLargeBase64Images(val);
    }
    return cleaned;
  }
  return obj;
}

/**
 * Sanitize text fields and URLs to prevent stored XSS
 */
function sanitizePortfolioPayload(data: any): any {
  if (typeof data === 'string') {
    // Neutralize dangerous javascript: and data: text schemes
    if (data.trim().toLowerCase().startsWith('javascript:')) {
      return '#';
    }
    // Remove inline <script> tags
    return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizePortfolioPayload);
  }
  if (data !== null && typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      cleaned[key] = sanitizePortfolioPayload(val);
    }
    return cleaned;
  }
  return data;
}

/**
 * POST /api/portfolios
 * Validate PortfolioData with Zod, cap size, strip large base64, generate unguessable slug, and save.
 */
portfoliosRouter.post('/', portfolioPublishLimiter, async (req: Request, res: Response) => {
  try {
    const rawBody = req.body;

    // Check payload size limit (max 2MB)
    const payloadLength = JSON.stringify(rawBody).length;
    if (payloadLength > 2 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'Payload Too Large',
        message: 'Portfolio data exceeds 2MB limit.',
      });
    }

    // Strip oversized base64 images
    const base64Cleaned = stripLargeBase64Images(rawBody);

    // Sanitize malicious scripts & schemes
    const sanitized = sanitizePortfolioPayload(base64Cleaned);

    // Validate using Zod
    const parseResult = PortfolioDataSchema.safeParse(sanitized);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid portfolio data structure.',
        details: parseResult.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const validatedData = parseResult.data;

    // Generate unguessable 12-char cryptographically random slug
    const slug = crypto.randomBytes(6).toString('hex');
    const filePath = path.join(STORAGE_DIR, `${slug}.json`);

    // Attach publish metadata
    const portfolioToSave = {
      ...validatedData,
      slug,
      publishedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(portfolioToSave, null, 2), 'utf-8');

    return res.status(201).json({
      success: true,
      slug,
      url: `/p/${slug}`,
      publishedAt: portfolioToSave.publishedAt,
      message: 'Portfolio published successfully.',
    });
  } catch (err: any) {
    console.error('[Portfolio Publish Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Publish Failed',
      message: err?.message || 'Failed to publish portfolio.',
    });
  }
});

/**
 * GET /api/portfolios/:slug
 * Retrieve published portfolio by slug.
 */
portfoliosRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Validate slug format: alphanumeric or hyphens/underscores, 4-64 chars
    if (!slug || !/^[a-zA-Z0-9_-]{4,64}$/.test(slug)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Slug',
        message: 'Slug format is invalid.',
      });
    }

    const filePath = path.join(STORAGE_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Portfolio not found or has been unpublished.',
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const portfolio = JSON.parse(fileContent);

    return res.json({
      success: true,
      portfolio,
    });
  } catch (err: any) {
    console.error('[Portfolio Fetch Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Fetch Failed',
      message: err?.message || 'Failed to retrieve portfolio.',
    });
  }
});

/**
 * DELETE /api/portfolios/:slug
 * Unpublish/remove portfolio by slug.
 */
portfoliosRouter.delete('/:slug', portfolioPublishLimiter, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug || !/^[a-zA-Z0-9_-]{4,64}$/.test(slug)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Slug',
        message: 'Slug format is invalid.',
      });
    }

    const filePath = path.join(STORAGE_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Portfolio not found or already unpublished.',
      });
    }

    fs.unlinkSync(filePath);

    return res.json({
      success: true,
      message: 'Portfolio unpublished successfully.',
    });
  } catch (err: any) {
    console.error('[Portfolio Unpublish Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Unpublish Failed',
      message: err?.message || 'Failed to unpublish portfolio.',
    });
  }
});
