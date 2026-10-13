import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from server/.env if present, or root .env
if (fs.existsSync(path.resolve('server/.env'))) {
  dotenv.config({ path: path.resolve('server/.env') });
} else if (fs.existsSync(path.resolve('.env'))) {
  dotenv.config({ path: path.resolve('.env') });
} else {
  dotenv.config();
}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthRouter } from './routes/health.js';
import { aiRouter } from './routes/ai.js';
import { resumeRouter } from './routes/resume.js';
import { portfoliosRouter } from './routes/portfolios.js';
import { OpenAiService } from './services/openaiService.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Security: Helmet HTTP Headers hardening
app.use(
  helmet({
    contentSecurityPolicy: false, // Permissive for local 2D canvas, Vite dev server & assets
    crossOriginEmbedderPolicy: false,
  })
);

// Disallow server technology identification header
app.disable('x-powered-by');

// CORS Configuration: Whitelisted explicit origins only (never '*' wildcard)
const configuredOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const CORS_ALLOWED_ORIGINS = Array.from(
  new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    ...configuredOrigins,
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, same-origin, or internal server-side requests)
      if (!origin) {
        return callback(null, true);
      }
      if (CORS_ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      // Strictly reject disallowed origins (never wildcard '*')
      return callback(new Error(`CORS blocked for origin: ${origin}. Not in allowed whitelist.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Owner-Token'],
  })
);

// Payload size limits: Apply 2MB limit strictly to POST /api/portfolios; keep 1MB for all other routes
const json1mb = express.json({ limit: '1mb' });
const json2mb = express.json({ limit: '2mb' });

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && (req.path === '/api/portfolios' || req.originalUrl === '/api/portfolios')) {
    return json2mb(req, res, next);
  }
  return json1mb(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request Timeout Middleware (45s timeout guard)
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(45000, () => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        error: 'Gateway Timeout',
        message: 'The request took too long to complete. Please try again.',
      });
    }
  });
  next();
});

// Tiered Rate Limiting: Strict limiter for AI generation endpoint
const aiGenerateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'AI generation limit reached for this session. Please wait a few moments before generating again.',
  },
});
app.use('/api/ai/generate-portfolio', aiGenerateLimiter);

// Global API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP. Please wait a few minutes before trying again.',
  },
});
app.use('/api/', generalLimiter);

// Request Logging (sanitized: never log secrets or sensitive request bodies)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Mount Routes
app.use('/api/health', healthRouter);
app.use('/api/ai', aiRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/portfolios', portfoliosRouter);

// Production Static Assets & SPA Fallback
const distPath = path.resolve(process.env.DIST_PATH || 'dist');
if (fs.existsSync(distPath)) {
  // Serve static assets from dist/
  app.use(express.static(distPath));

  // SPA fallback for client-side routing (e.g., /p/:slug refresh support)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    const indexHtml = path.join(distPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
} else {
  // Informational endpoint when dist/ has not been built
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      service: 'AI-Powered 3D Portfolio Generator Backend',
      version: '2.0.0',
      status: 'online',
      openAiConfigured: OpenAiService.isOpenAiConfigured(),
      model: OpenAiService.isOpenAiConfigured() ? OpenAiService.getModel() : 'offline_fallback',
      healthCheck: '/api/health',
      notice: 'Production bundle not found in dist/. Run `npm run build` to serve the full web client.',
    });
  });
}

// Strict 404 for unknown /api routes (preventing HTML fallback on failed API calls)
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.path} does not exist.`,
  });
});

// Global Safe Error Handler: Unified Consistent Error Format
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Internal Error Handler]', err?.message || err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({
    success: false,
    error: err?.name || 'Internal Server Error',
    message: err?.message || 'An unexpected error occurred during request processing.',
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log('=====================================================');
  console.log(`🚀 AI Portfolio Generator API Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 OpenAI Status: ${OpenAiService.isOpenAiConfigured() ? `Active (${OpenAiService.getModel()})` : 'Offline Fallback Engine'}`);
  console.log('=====================================================');
});

export { app, server };
