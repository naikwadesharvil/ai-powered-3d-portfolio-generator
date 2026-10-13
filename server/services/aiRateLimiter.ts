/**
 * AI Rate Limiter & Cost Control Service (Phase 7c)
 * Enforces per-IP and global daily caps on OpenAI endpoints via environment variables.
 * Falls back seamlessly to the accredited offline generator when quotas are reached.
 * Ensures zero secret or credential leakage in operational logs.
 */

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: 'global' | 'ip';
  current: number;
  limit: number;
}

class AiRateLimiterService {
  private currentDate: string = this.getUtcDateString();
  private globalUsage: number = 0;
  private ipUsage: Map<string, number> = new Map();

  private getUtcDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Retrieves the current global daily cap from environment or default (100).
   */
  public getGlobalCap(): number {
    const raw = process.env.OPENAI_DAILY_CAP_GLOBAL;
    if (raw !== undefined && raw !== '') {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return 100;
  }

  /**
   * Retrieves the per-IP daily cap from environment or default (20).
   */
  public getIpCap(): number {
    const raw = process.env.OPENAI_DAILY_CAP_IP;
    if (raw !== undefined && raw !== '') {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return 20;
  }

  /**
   * Checks and rolls over daily buckets when the date advances.
   */
  private checkRollover(): void {
    const today = this.getUtcDateString();
    if (today !== this.currentDate) {
      this.currentDate = today;
      this.globalUsage = 0;
      this.ipUsage.clear();
    }
  }

  /**
   * Checks whether the current request is allowed under daily quotas,
   * and increments counters if allowed.
   */
  public consumeQuota(clientIp: string): QuotaCheckResult {
    this.checkRollover();

    const globalCap = this.getGlobalCap();
    const ipCap = this.getIpCap();

    // 1. Check Global Cap
    if (globalCap > 0 && this.globalUsage >= globalCap) {
      return {
        allowed: false,
        reason: 'global',
        current: this.globalUsage,
        limit: globalCap,
      };
    }

    // 2. Check Per-IP Cap
    const currentIpCount = this.ipUsage.get(clientIp) || 0;
    if (ipCap > 0 && currentIpCount >= ipCap) {
      return {
        allowed: false,
        reason: 'ip',
        current: currentIpCount,
        limit: ipCap,
      };
    }

    // 3. Consume quota
    this.globalUsage++;
    this.ipUsage.set(clientIp, currentIpCount + 1);

    return {
      allowed: true,
      current: this.globalUsage,
      limit: globalCap,
    };
  }

  /**
   * Logs a quota exceeded notice without exposing API keys, prompt contents, or secrets.
   */
  public logCapExceeded(reason: 'global' | 'ip', current: number, limit: number, clientIp: string): void {
    const sanitizedIp = clientIp.replace(/[^a-zA-Z0-9.:]/g, '');
    console.warn(
      `[AI RateLimit Notice] Daily ${reason} OpenAI cap reached (${current}/${limit}) for client [${sanitizedIp}]. Falling back to offline generator.`
    );
  }

  /**
   * Generates a friendly message explaining the daily cap and seamless offline fallback.
   */
  public getFriendlyCapMessage(reason: 'global' | 'ip', limit: number): string {
    if (reason === 'global') {
      return `Daily AI capacity limit reached (${limit} requests/day system cap). Switched seamlessly to the offline engine — all features remain fully functional.`;
    }
    return `Daily personal AI generation limit reached (${limit} requests/day). Switched seamlessly to the offline engine — all features remain fully functional.`;
  }

  /**
   * Reset helper for testing environments.
   */
  public _resetForTesting(): void {
    this.currentDate = this.getUtcDateString();
    this.globalUsage = 0;
    this.ipUsage.clear();
  }
}

export const aiRateLimiter = new AiRateLimiterService();
