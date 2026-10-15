import { Router, Request, Response } from 'express';
import {
  GeneratePortfolioInputSchema,
  RewriteSectionInputSchema,
  RecommendationsInputSchema,
  ChatInputSchema,
  normalizePortfolioData,
} from '../schemas/portfolioSchema.js';
import { OpenAiService } from '../services/openaiService.js';
import { AiEngine } from '../../src/services/aiEngine.ts';
import { aiRateLimiter } from '../services/aiRateLimiter.js';

export const aiRouter = Router();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

/**
 * POST /api/ai/generate-portfolio
 * Generates role-tailored portfolio via OpenAI or accredited offline fallback
 */
aiRouter.post('/generate-portfolio', async (req: Request, res: Response) => {
  const parseResult = GeneratePortfolioInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    const flattened = parseResult.error.flatten();
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'The submitted portfolio generator details failed validation.',
      fieldErrors: flattened.fieldErrors,
      details: flattened,
    });
  }

  const {
    name,
    branch,
    customBranchName,
    interests,
    role,
    persona,
    discipline,
    skills,
    projects,
    education,
    experiences,
    achievements,
    currentProfile,
  } = parseResult.data;

  const targetPersona = persona || role || 'student';
  const targetDiscipline = discipline || branch || 'cs_it';
  const clientIp = getClientIp(req);

  let capHitInfo: { reason: 'global' | 'ip'; limit: number } | null = null;

  // Check if live OpenAI is available and quota permits
  if (OpenAiService.isOpenAiConfigured()) {
    const quota = aiRateLimiter.consumeQuota(clientIp);
    if (!quota.allowed && quota.reason) {
      aiRateLimiter.logCapExceeded(quota.reason, quota.current, quota.limit, clientIp);
      capHitInfo = { reason: quota.reason, limit: quota.limit };
    } else {
      try {
        const generated = await OpenAiService.generatePortfolio(parseResult.data);

        // Strict Fact Provenance:
        // Verified user projects are preserved as verified (isAiIdea: false).
        // AI-generated suggestions are strictly tagged as suggestions (isAiIdea: true).
        const verifiedUserProjects = (projects && projects.length > 0)
          ? projects.map((p) => ({ ...p, isAiIdea: false }))
          : (currentProfile?.projects?.filter((p) => !p.isAiIdea) || []);

        const aiSuggestions = (generated.projects || []).map((p, idx) => ({
          ...p,
          id: `ai-proj-${idx + 1}`,
          tags: p.tools || ['Engineering'],
          tools: p.tools || ['Engineering'],
          bullets: p.bullets || [],
          demoUrl: '#',
          githubUrl: '#',
          isAiIdea: true,
        }));

        const rawMerged = {
          ...(currentProfile || {}),
          persona: targetPersona,
          discipline: targetDiscipline,
          disciplineName: customBranchName || currentProfile?.branchName || '',
          name: name.trim() || currentProfile?.name?.trim() || '',
          branch: targetDiscipline,
          branchName: customBranchName || currentProfile?.branchName || '',
          tagline: generated.tagline,
          shortBio: generated.shortBio,
          fullBio: generated.fullBio,
          targetRole: generated.targetRole,
          role: targetPersona,
          skills: generated.skills && generated.skills.length > 0
            ? generated.skills
            : (skills && skills.length > 0 ? skills : (currentProfile?.skills || [])),
          projects: [...verifiedUserProjects, ...aiSuggestions],
          education: education && education.length > 0 ? education : (currentProfile?.education || []),
          experiences: experiences && experiences.length > 0 ? experiences : (currentProfile?.experiences || []),
          bentoStats: generated.bentoStats || currentProfile?.bentoStats,
          careerRecommendations: generated.careerRecommendations || currentProfile?.careerRecommendations,
        };

        const normalized = normalizePortfolioData(rawMerged);

        return res.json({
          success: true,
          source: 'ai',
          liveAi: true,
          isFallback: false,
          model: OpenAiService.getModel(),
          portfolio: normalized,
          improvementSuggestions: generated.improvementSuggestions || [],
          message: `Successfully generated via OpenAI (${OpenAiService.getModel()}) with Structured Outputs`,
        });
      } catch (err: any) {
        console.warn('[OpenAI Generation Warning] Failed to generate via live OpenAI, falling back to offline engine:', err?.message || err);
        // Fall through to offline fallback
      }
    }
  }

  // Accredited Offline Fact-Governed Fallback
  const fallbackRaw = AiEngine.generatePortfolioFromAutopilot({
    name,
    branch: targetDiscipline as any,
    customBranchName,
    interests,
    role: targetPersona,
    skills,
    projects,
    education,
    experiences,
    achievements,
    currentProfile,
  });

  const mergedFallback = {
    ...fallbackRaw,
    branch: targetDiscipline,
    discipline: targetDiscipline,
    disciplineName: customBranchName || fallbackRaw.branchName,
    branchName: customBranchName || fallbackRaw.branchName,
  };

  const normalizedFallback = normalizePortfolioData(mergedFallback);

  return res.json({
    success: true,
    source: 'fallback',
    liveAi: false,
    isFallback: true,
    capHit: !!capHitInfo,
    capReason: capHitInfo?.reason,
    model: 'offline_heuristic_v1',
    portfolio: normalizedFallback,
    improvementSuggestions: capHitInfo
      ? [
          aiRateLimiter.getFriendlyCapMessage(capHitInfo.reason, capHitInfo.limit),
          'Supply specific metrics and project links to improve presentation strength.',
        ]
      : [
          'Supply specific metrics and project links to improve presentation strength.',
          'Configure OPENAI_API_KEY in server/.env to unlock dynamic real-time synthesis.',
        ],
    message: capHitInfo
      ? aiRateLimiter.getFriendlyCapMessage(capHitInfo.reason, capHitInfo.limit)
      : 'Generated with the offline engine; connect AI for richer results',
  });
});

/**
 * POST /api/ai/rewrite-section
 * Rewrites section content in a chosen tone
 */
aiRouter.post('/rewrite-section', async (req: Request, res: Response) => {
  const parseResult = RewriteSectionInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid rewrite parameters',
      details: parseResult.error.flatten(),
    });
  }

  const { section, content, tone } = parseResult.data;
  const clientIp = getClientIp(req);
  let capHitInfo: { reason: 'global' | 'ip'; limit: number } | null = null;

  if (OpenAiService.isOpenAiConfigured()) {
    const quota = aiRateLimiter.consumeQuota(clientIp);
    if (!quota.allowed && quota.reason) {
      aiRateLimiter.logCapExceeded(quota.reason, quota.current, quota.limit, clientIp);
      capHitInfo = { reason: quota.reason, limit: quota.limit };
    } else {
      try {
        const result = await OpenAiService.rewriteSection(parseResult.data);
        return res.json({
          liveAi: true,
          isFallback: false,
          model: OpenAiService.getModel(),
          section,
          tone,
          rewritten: result.rewritten,
          explanation: result.explanation || `Rewritten in ${tone} tone using OpenAI.`,
        });
      } catch (err: any) {
        console.warn('[OpenAI Rewrite Warning] Failed live rewrite, falling back to offline tone transformer:', err?.message || err);
      }
    }
  }

  // Offline Tone Transformer Fallback
  let rewritten = typeof content === 'string' ? content : JSON.stringify(content);
  let explanation = '';

  if (tone === 'concise') {
    rewritten = rewritten.replace(/\b(very|extremely|highly|quite|in order to|moreover)\b/gi, '').replace(/\s+/g, ' ').trim();
    explanation = 'Condensed text to focus strictly on essential keywords and core impact.';
  } else if (tone === 'technical') {
    rewritten = `${rewritten} [Engineered with modular patterns, decoupled telemetry, and resilient micro-architecture]`;
    explanation = 'Infused systems architecture framing and technical delivery context.';
  } else if (tone === 'impactful') {
    rewritten = `${rewritten} — Delivers measurable operational efficiency, verified benchmarks, and robust user adoption.`;
    explanation = 'Elevated language to emphasize outcomes, validation, and engineering rigor.';
  } else if (tone === 'creative') {
    rewritten = `At the intersection of design precision and modern engineering: ${rewritten}`;
    explanation = 'Framed with creative editorial perspective.';
  } else {
    // professional
    explanation = 'Polished into professional executive phrasing.';
  }

  return res.json({
    liveAi: false,
    isFallback: true,
    capHit: !!capHitInfo,
    capReason: capHitInfo?.reason,
    model: 'offline_transformer',
    section,
    tone,
    rewritten,
    explanation: capHitInfo
      ? `${aiRateLimiter.getFriendlyCapMessage(capHitInfo.reason, capHitInfo.limit)} ${explanation}`
      : explanation,
  });
});

/**
 * POST /api/ai/recommendations
 * Analyzes portfolio completeness and recommends role-specific sections & priority
 */
aiRouter.post('/recommendations', async (req: Request, res: Response) => {
  const parseResult = RecommendationsInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid recommendation parameters',
      details: parseResult.error.flatten(),
    });
  }

  const { profile, role } = parseResult.data;
  const clientIp = getClientIp(req);
  let capHitInfo: { reason: 'global' | 'ip'; limit: number } | null = null;

  if (OpenAiService.isOpenAiConfigured()) {
    const quota = aiRateLimiter.consumeQuota(clientIp);
    if (!quota.allowed && quota.reason) {
      aiRateLimiter.logCapExceeded(quota.reason, quota.current, quota.limit, clientIp);
      capHitInfo = { reason: quota.reason, limit: quota.limit };
    } else {
      try {
        const recs = await OpenAiService.getRecommendations(parseResult.data);
        return res.json({
          liveAi: true,
          isFallback: false,
          model: OpenAiService.getModel(),
          ...recs,
        });
      } catch (err: any) {
        console.warn('[OpenAI Recommendations Warning] Falling back to rule-based recommendation matrix:', err?.message || err);
      }
    }
  }

  // Role-Based Deterministic Recommendation Matrix
  const roleRecommendations: Record<string, { recommendedSections: string[]; priorityOrder: string[]; suggestions: string[] }> = {
    student: {
      recommendedSections: ['hero', 'welcome', 'about', 'skills', 'education', 'projects', 'certifications', 'publications', 'contact'],
      priorityOrder: ['hero', 'welcome', 'about', 'projects', 'education', 'skills', 'certifications', 'publications', 'contact'],
      suggestions: [
        'Prioritize academic capstone projects and hackathons near the top.',
        'Feature GitHub repositories with clear READMEs and architecture diagrams.',
        'Include certifications from recognized industry providers (DeepLearning.AI, AWS, Google).',
      ],
    },
    job_seeker: {
      recommendedSections: ['hero', 'welcome', 'about', 'skills', 'experience', 'projects', 'certifications', 'contact'],
      priorityOrder: ['hero', 'welcome', 'about', 'projects', 'experience', 'skills', 'certifications', 'contact'],
      suggestions: [
        'Ensure target job title is prominent in the hero headline.',
        'Include measurable metrics in project bullet points (latency reduction, accuracy %, active users).',
        'Place a direct resume download button within first viewport.',
      ],
    },
    professional: {
      recommendedSections: ['hero', 'welcome', 'about', 'experience', 'projects', 'skills', 'certifications', 'contact'],
      priorityOrder: ['hero', 'welcome', 'about', 'experience', 'projects', 'skills', 'certifications', 'contact'],
      suggestions: [
        'Highlight distributed architecture, system scalability, and team leadership.',
        'Focus on business impact and high-availability operational metrics.',
        'Use Obsidian Stealth theme for executive presentation.',
      ],
    },
    freelancer: {
      recommendedSections: ['hero', 'welcome', 'about', 'services', 'projects', 'testimonials', 'contact'],
      priorityOrder: ['hero', 'welcome', 'services', 'projects', 'testimonials', 'about', 'contact'],
      suggestions: [
        'Place Services & Pricing above extensive biography.',
        'Detail clear deliverables and turnaround timelines for each service package.',
        'Display verified client testimonials and a direct calendar booking CTA.',
      ],
    },
  };

  const matrix = roleRecommendations[role] || roleRecommendations.student;
  const missingCriticalInfo: string[] = [];

  if (!profile.email) missingCriticalInfo.push('Contact email address');
  if (!profile.location) missingCriticalInfo.push('Geographical location');
  if (!profile.projects || profile.projects.length === 0) missingCriticalInfo.push('At least two showcased projects');
  if (!profile.github && role !== 'freelancer') missingCriticalInfo.push('GitHub profile link');
  if (!profile.linkedin) missingCriticalInfo.push('LinkedIn profile link');

  return res.json({
    liveAi: false,
    isFallback: true,
    capHit: !!capHitInfo,
    capReason: capHitInfo?.reason,
    model: 'offline_rule_matrix',
    recommendedSections: matrix.recommendedSections,
    priorityOrder: matrix.priorityOrder,
    improvementSuggestions: capHitInfo
      ? [aiRateLimiter.getFriendlyCapMessage(capHitInfo.reason, capHitInfo.limit), ...matrix.suggestions]
      : matrix.suggestions,
    missingCriticalInfo,
  });
});

/**
 * POST /api/ai/chat
 * Conversational Co-Pilot for natural language portfolio modifications
 */
aiRouter.post('/chat', async (req: Request, res: Response) => {
  const parseResult = ChatInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid chat parameters',
      details: parseResult.error.flatten(),
    });
  }

  const { instruction, currentProfile } = parseResult.data;
  const clientIp = getClientIp(req);
  let capHitInfo: { reason: 'global' | 'ip'; limit: number } | null = null;

  if (OpenAiService.isOpenAiConfigured()) {
    const quota = aiRateLimiter.consumeQuota(clientIp);
    if (!quota.allowed && quota.reason) {
      aiRateLimiter.logCapExceeded(quota.reason, quota.current, quota.limit, clientIp);
      capHitInfo = { reason: quota.reason, limit: quota.limit };
    } else {
      try {
        const result = await OpenAiService.chatEdit(parseResult.data);
        return res.json({
          liveAi: true,
          isFallback: false,
          model: OpenAiService.getModel(),
          updatedProfile: result.updatedProfile,
          explanation: result.explanation,
          changesSummary: result.changesSummary || 'Applied requested edits via OpenAI.',
          suggestedFollowUp: result.suggestedFollowUp,
        });
      } catch (err: any) {
        console.warn('[OpenAI Chat Warning] Falling back to offline conversational parser:', err?.message || err);
      }
    }
  }

  // Deterministic Offline Conversational Parser Fallback
  const result = AiEngine.applyConversationalInstruction(currentProfile as any, instruction);

  return res.json({
    liveAi: false,
    isFallback: true,
    capHit: !!capHitInfo,
    capReason: capHitInfo?.reason,
    model: 'offline_nlp_parser',
    updatedProfile: result.updatedProfile,
    explanation: capHitInfo
      ? `${aiRateLimiter.getFriendlyCapMessage(capHitInfo.reason, capHitInfo.limit)} ${result.explanation}`
      : result.explanation,
    changesSummary: `Executed instruction: "${instruction}"`,
    suggestedFollowUp: result.suggestedFollowUp,
  });
});
