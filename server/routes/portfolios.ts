import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PortfolioDataSchema, normalizePortfolioData } from '../schemas/portfolioSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Portfolios storage directory
export const STORAGE_DIR = path.resolve(__dirname, '../../server/data/portfolios');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export const portfoliosRouter = Router();

// Rate Limiting for portfolio creation & deletion (100 requests per 15 min per IP; 1000 in tests)
const portfolioPublishLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : (Number(process.env.RATE_LIMIT_PORTFOLIO_MAX) || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Publication rate limit exceeded. Please wait 15 minutes before creating more portfolios.',
  },
});

/**
 * Validates token against a stored sha256 hash using timing-safe comparison
 */
function verifyOwnerToken(providedToken: string, storedHash: string): boolean {
  if (!providedToken || !storedHash) return false;
  try {
    const providedHash = crypto.createHash('sha256').update(providedToken.trim()).digest('hex');
    const bufProvided = Buffer.from(providedHash, 'utf8');
    const bufStored = Buffer.from(storedHash, 'utf8');
    if (bufProvided.length !== bufStored.length) return false;
    return crypto.timingSafeEqual(bufProvided, bufStored);
  } catch {
    return false;
  }
}

/**
 * Check for oversized base64 images without silently dropping them.
 * Returns array of field paths that exceed the ~200KB limit.
 */
function findOversizedBase64Images(obj: any, currentPath = ''): string[] {
  const oversized: string[] = [];
  if (typeof obj === 'string') {
    // 200KB binary is ~266,667 base64 chars
    if (obj.startsWith('data:image/') && obj.length > 270000) {
      oversized.push(currentPath || 'image');
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      oversized.push(...findOversizedBase64Images(item, `${currentPath}[${idx}]`));
    });
  } else if (obj !== null && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      oversized.push(...findOversizedBase64Images(val, nextPath));
    }
  }
  return oversized;
}

/**
 * Neutralizes dangerous URI schemes (e.g. javascript:) on link fields.
 * CRITICAL: Legitimate text like "C++ <T>" or "R&D" is preserved untouched without input mangling.
 */
function sanitizePortfolioPayload(data: any): any {
  if (typeof data === 'string') {
    const trimmedLower = data.trim().toLowerCase();
    // Neutralize dangerous javascript:, vbscript:, or protocol-relative schemes
    if (trimmedLower.startsWith('javascript:') || trimmedLower.startsWith('vbscript:')) {
      return '#';
    }
    return data;
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
 * Extract owner token from header, Authorization Bearer, query or body
 */
function extractOwnerToken(req: Request): string | null {
  const headerToken = req.headers['x-owner-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.trim();
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (req.body && typeof req.body.ownerToken === 'string' && req.body.ownerToken.trim()) {
    return req.body.ownerToken.trim();
  }
  if (req.query && typeof req.query.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }
  return null;
}

/**
 * POST /api/portfolios
 * Creates a new portfolio (returns slug + private owner token)
 * OR updates an existing portfolio in-place if slug + matching owner token is provided.
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

    // Guard: Check for oversized base64 images (do NOT silently drop!)
    const oversizedImages = findOversizedBase64Images(rawBody);
    if (oversizedImages.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Oversized Images',
        message: `Image(s) at ${oversizedImages.join(', ')} exceed 200KB limit. Downscale/compress images before publishing.`,
      });
    }

    // Sanitize dangerous schemes while preserving legitimate text like "C++ <T>" and "R&D"
    const sanitized = sanitizePortfolioPayload(rawBody);

    // Extract target slug & owner token if this is an update request
    const requestedSlug = typeof rawBody.slug === 'string' && rawBody.slug.trim() ? rawBody.slug.trim() : null;
    const providedOwnerToken = extractOwnerToken(req);

    // If client requested updating a specific slug:
    if (requestedSlug) {
      if (!/^[a-zA-Z0-9_-]{4,64}$/.test(requestedSlug)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Slug',
          message: 'Requested slug format is invalid.',
        });
      }

      const filePath = path.join(STORAGE_DIR, `${requestedSlug}.json`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Portfolio with this slug does not exist.',
        });
      }

      if (!providedOwnerToken) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Owner token required to update an existing portfolio.',
        });
      }

      const existingRecord = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!verifyOwnerToken(providedOwnerToken, existingRecord.ownerTokenHash)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Invalid owner token. You do not have permission to update this portfolio.',
        });
      }

      // Validate data with Zod (normalizing any legacy or flat properties)
      const normalized = normalizePortfolioData(sanitized);
      const parseResult = PortfolioDataSchema.safeParse(normalized);
      if (!parseResult.success) {
        const issues = parseResult.error.issues || (parseResult.error as any).errors || [];
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid portfolio data structure.',
          details: issues.map((e: any) => ({
            path: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
            message: e.message,
          })),
        });
      }

      // Update existing portfolio in-place, keeping the same slug and ownerTokenHash
      const updatedPortfolio = {
        ...parseResult.data,
        slug: requestedSlug,
        ownerTokenHash: existingRecord.ownerTokenHash,
        publishedAt: existingRecord.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(filePath, JSON.stringify(updatedPortfolio, null, 2), 'utf-8');

      return res.status(200).json({
        success: true,
        slug: requestedSlug,
        ownerToken: providedOwnerToken,
        url: `/p/${requestedSlug}`,
        publishedAt: updatedPortfolio.updatedAt,
        message: 'Portfolio updated successfully.',
      });
    }

    // INITIAL PUBLISH: Generate unguessable slug and private owner token
    const normalized = normalizePortfolioData(sanitized);
    const parseResult = PortfolioDataSchema.safeParse(normalized);
    if (!parseResult.success) {
      const issues = parseResult.error.issues || (parseResult.error as any).errors || [];
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid portfolio data structure.',
        details: issues.map((e: any) => ({
          path: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
          message: e.message,
        })),
      });
    }

    const validatedData = parseResult.data;
    const slug = crypto.randomBytes(6).toString('hex');
    const ownerToken = crypto.randomBytes(32).toString('hex');
    const ownerTokenHash = crypto.createHash('sha256').update(ownerToken).digest('hex');

    const filePath = path.join(STORAGE_DIR, `${slug}.json`);
    const portfolioToSave = {
      ...validatedData,
      slug,
      ownerTokenHash,
      publishedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(portfolioToSave, null, 2), 'utf-8');

    return res.status(201).json({
      success: true,
      slug,
      ownerToken, // Returned ONLY to the author upon creation
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
 * Public read-only endpoint. Slug alone grants read-only access.
 * OwnerTokenHash is strictly removed so private credentials are never exposed.
 */
portfoliosRouter.get('/:slug', async (req: Request, res: Response) => {
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
        message: 'Portfolio not found or has been unpublished.',
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const portfolio = JSON.parse(fileContent);

    // Security: Strip private owner token hash before returning public read-only record
    const { ownerTokenHash: _removed, ...publicPortfolio } = portfolio;

    return res.json({
      success: true,
      portfolio: publicPortfolio,
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
 * Requires valid owner token:
 * - Missing token -> 401 Unauthorized
 * - Invalid token -> 403 Forbidden
 * - Valid token -> 200 OK
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

    const providedOwnerToken = extractOwnerToken(req);
    if (!providedOwnerToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Owner token is required to unpublish this portfolio.',
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

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const portfolio = JSON.parse(fileContent);

    if (!verifyOwnerToken(providedOwnerToken, portfolio.ownerTokenHash)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Invalid owner token. You do not have permission to delete this portfolio.',
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
