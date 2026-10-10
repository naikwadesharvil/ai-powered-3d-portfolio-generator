import type { PortfolioData, UserRole } from '../types/portfolio';
import { AiEngine } from './aiEngine.ts';

export interface ServerHealth {
  status: string;
  hasOpenAiKey: boolean;
  model: string;
  configuredEngine: string;
}

export interface AiGenerationResult {
  liveAi: boolean;
  isFallback: boolean;
  model: string;
  portfolio: PortfolioData;
  improvementSuggestions?: string[];
  message: string;
}

export interface AiRewriteResult {
  liveAi: boolean;
  isFallback: boolean;
  model: string;
  section: string;
  tone: string;
  rewritten: any;
  explanation: string;
}

export interface AiRecommendationsResult {
  liveAi: boolean;
  isFallback: boolean;
  model: string;
  recommendedSections: string[];
  priorityOrder: string[];
  improvementSuggestions: string[];
  missingCriticalInfo: string[];
}

export interface AiChatResult {
  liveAi: boolean;
  isFallback: boolean;
  model: string;
  updatedProfile: PortfolioData;
  explanation: string;
  changesSummary: string;
  suggestedFollowUp?: string;
}

export class AiApiClient {
  /**
   * Health check to detect backend server and OpenAI status
   */
  static async checkHealth(): Promise<ServerHealth> {
    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        return {
          status: 'online',
          hasOpenAiKey: Boolean(data.hasOpenAiKey),
          model: data.model || 'gpt-4o',
          configuredEngine: data.configuredEngine || 'Backend API',
        };
      }
    } catch {
      // Backend not running or unreachable
    }

    return {
      status: 'offline',
      hasOpenAiKey: false,
      model: 'offline_heuristic_v1',
      configuredEngine: 'Offline Heuristic Engine',
    };
  }

  /**
   * Generate portfolio via backend OpenAI API or accredited offline fallback
   */
  static async generatePortfolio(params: {
    name: string;
    branch?: any;
    customBranchName?: string;
    interests: string;
    role: UserRole;
    skills?: any[];
    projects?: any[];
    education?: any[];
    experiences?: any[];
    achievements?: any[];
    currentProfile?: PortfolioData;
  }): Promise<AiGenerationResult> {
    try {
      const res = await fetch('/api/ai/generate-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (res.ok) {
        const data = await res.json();
        return {
          liveAi: Boolean(data.liveAi),
          isFallback: Boolean(data.isFallback),
          model: data.model || 'gpt-4o',
          portfolio: data.portfolio,
          improvementSuggestions: data.improvementSuggestions,
          message: data.message || 'Generated portfolio successfully.',
        };
      }
    } catch (err) {
      console.warn('[AI API Client] Backend unreachable, falling back to client engine:', err);
    }

    // Client-side fallback
    const fallbackPortfolio = AiEngine.generatePortfolioFromAutopilot(params);
    return {
      liveAi: false,
      isFallback: true,
      model: 'client_offline_engine',
      portfolio: fallbackPortfolio,
      improvementSuggestions: ['Configure backend and OPENAI_API_KEY for dynamic real-time model synthesis.'],
      message: 'Generated using client-side offline fact-governed engine.',
    };
  }

  /**
   * Rewrite specific section with chosen tone
   */
  static async rewriteSection(params: {
    section: string;
    content: any;
    tone: 'professional' | 'creative' | 'concise' | 'impactful' | 'technical';
    instruction?: string;
    role?: UserRole;
  }): Promise<AiRewriteResult> {
    try {
      const res = await fetch('/api/ai/rewrite-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          liveAi: Boolean(data.liveAi),
          isFallback: Boolean(data.isFallback),
          model: data.model,
          section: data.section,
          tone: data.tone,
          rewritten: data.rewritten,
          explanation: data.explanation,
        };
      }
    } catch (err) {
      console.warn('[AI API Client] Rewrite request failed, using client fallback:', err);
    }

    // Client fallback
    let contentStr = typeof params.content === 'string' ? params.content : JSON.stringify(params.content);
    if (params.tone === 'concise') {
      contentStr = contentStr.replace(/\b(very|extremely|highly|quite)\b/gi, '').trim();
    } else if (params.tone === 'impactful') {
      contentStr = `${contentStr} — Delivers verified performance benchmarks and operational reliability.`;
    }

    return {
      liveAi: false,
      isFallback: true,
      model: 'client_offline_transformer',
      section: params.section,
      tone: params.tone,
      rewritten: contentStr,
      explanation: `Rewritten in ${params.tone} tone via offline rules.`,
    };
  }

  /**
   * Fetch recommendations for sections and priorities
   */
  static async getRecommendations(params: {
    profile: PortfolioData;
    role: UserRole;
  }): Promise<AiRecommendationsResult> {
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          liveAi: Boolean(data.liveAi),
          isFallback: Boolean(data.isFallback),
          model: data.model,
          recommendedSections: data.recommendedSections,
          priorityOrder: data.priorityOrder,
          improvementSuggestions: data.improvementSuggestions,
          missingCriticalInfo: data.missingCriticalInfo,
        };
      }
    } catch (err) {
      console.warn('[AI API Client] Recommendations request failed, using client fallback:', err);
    }

    return {
      liveAi: false,
      isFallback: true,
      model: 'client_offline_rules',
      recommendedSections: ['hero', 'welcome', 'about', 'skills', 'projects', 'contact'],
      priorityOrder: ['hero', 'welcome', 'about', 'projects', 'skills', 'contact'],
      improvementSuggestions: ['Ensure quantifiable project achievements are listed.'],
      missingCriticalInfo: params.profile.email ? [] : ['Contact email address'],
    };
  }

  /**
   * Chat with AI Co-Pilot for conversational modifications
   */
  static async chat(params: {
    instruction: string;
    currentProfile: PortfolioData;
    messageHistory?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  }): Promise<AiChatResult> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(25000),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          liveAi: Boolean(data.liveAi),
          isFallback: Boolean(data.isFallback),
          model: data.model,
          updatedProfile: data.updatedProfile,
          explanation: data.explanation,
          changesSummary: data.changesSummary,
          suggestedFollowUp: data.suggestedFollowUp,
        };
      }
    } catch (err) {
      console.warn('[AI API Client] Chat request failed, using client fallback:', err);
    }

    const fallback = AiEngine.applyConversationalInstruction(params.currentProfile, params.instruction);
    return {
      liveAi: false,
      isFallback: true,
      model: 'client_offline_nlp',
      updatedProfile: fallback.updatedProfile,
      explanation: fallback.explanation,
      changesSummary: `Executed: "${params.instruction}"`,
      suggestedFollowUp: fallback.suggestedFollowUp,
    };
  }
}
