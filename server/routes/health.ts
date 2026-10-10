import { Router, Request, Response } from 'express';
import { OpenAiService } from '../services/openaiService.js';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const hasKey = OpenAiService.isOpenAiConfigured();
  const model = OpenAiService.getModel();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    hasOpenAiKey: hasKey,
    model: hasKey ? model : 'offline_fallback',
    configuredEngine: hasKey ? `OpenAI (${model})` : 'Offline Fact-Governed Engine',
  });
});
