import type { PortfolioData } from '../types/portfolio';

async function fetchWithFallback(url: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    // If relative fetch fails (e.g. preview without proxy), try direct port 5000
    if (url.startsWith('/api')) {
      const fallbackUrl = `http://localhost:5000${url}`;
      return await fetch(fallbackUrl, options);
    }
    throw err;
  }
}

export interface PublishResult {
  success: boolean;
  slug?: string;
  ownerToken?: string;
  url?: string;
  publishedAt?: string;
  error?: string;
  message?: string;
}

export interface FetchPortfolioResult {
  success: boolean;
  portfolio?: PortfolioData;
  error?: string;
}

// ============================================================================
// Safe LocalStorage Storage for Owner Tokens (with strict try/catch)
// ============================================================================

const OWNER_TOKEN_PREFIX = 'portfolio_owner_token_';
const LAST_SLUG_KEY = 'portfolio_last_published_slug';

export function getStoredOwnerToken(slug: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(`${OWNER_TOKEN_PREFIX}${slug}`);
  } catch {
    return null;
  }
}

export function storeOwnerToken(slug: string, token: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(`${OWNER_TOKEN_PREFIX}${slug}`, token);
    window.localStorage.setItem(LAST_SLUG_KEY, slug);
  } catch (err) {
    console.warn('[LocalStorage] Could not store owner token:', err);
  }
}

export function clearStoredOwnerToken(slug: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(`${OWNER_TOKEN_PREFIX}${slug}`);
    if (window.localStorage.getItem(LAST_SLUG_KEY) === slug) {
      window.localStorage.removeItem(LAST_SLUG_KEY);
    }
  } catch (err) {
    console.warn('[LocalStorage] Could not clear owner token:', err);
  }
}

export function getLastPublishedSlug(): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(LAST_SLUG_KEY);
  } catch {
    return null;
  }
}

/**
 * Publish portfolio to the backend.
 * If slug & ownerToken are provided (or found in localStorage), updates the existing portfolio.
 * Otherwise, creates a new portfolio and returns slug + ownerToken.
 */
export async function publishPortfolio(
  data: PortfolioData,
  ownerToken?: string | null,
  targetSlug?: string | null
): Promise<PublishResult> {
  try {
    // Resolve token and slug from parameters or localStorage
    const slugToUse = targetSlug || getLastPublishedSlug();
    const tokenToUse = ownerToken || (slugToUse ? getStoredOwnerToken(slugToUse) : null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (tokenToUse) {
      headers['X-Owner-Token'] = tokenToUse;
    }

    const payload: any = { ...data };
    if (slugToUse && tokenToUse) {
      payload.slug = slugToUse;
      payload.ownerToken = tokenToUse;
    }

    const res = await fetchWithFallback('/api/portfolios', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: body.error || `HTTP ${res.status}`,
        message: body.message || 'Failed to publish portfolio.',
      };
    }

    const finalSlug = body.slug || slugToUse;
    const finalToken = body.ownerToken || tokenToUse;

    if (finalSlug && finalToken) {
      storeOwnerToken(finalSlug, finalToken);
    }

    return {
      success: true,
      slug: finalSlug,
      ownerToken: finalToken,
      url: body.url || `/p/${finalSlug}`,
      publishedAt: body.publishedAt,
      message: body.message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Network Error',
      message: err?.message || 'Could not connect to publishing server.',
    };
  }
}

/**
 * Retrieve published portfolio by slug (public read-only)
 */
export async function getPublishedPortfolio(slug: string): Promise<FetchPortfolioResult> {
  try {
    const res = await fetchWithFallback(`/api/portfolios/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: body.message || body.error || 'Portfolio not found.',
      };
    }

    return {
      success: true,
      portfolio: body.portfolio,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error fetching portfolio.',
    };
  }
}

/**
 * Unpublish/remove published portfolio. Requires owner token.
 */
export async function unpublishPortfolio(
  slug: string,
  ownerToken?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const tokenToUse = ownerToken || getStoredOwnerToken(slug);
    const headers: Record<string, string> = {};
    if (tokenToUse) {
      headers['X-Owner-Token'] = tokenToUse;
    }

    const res = await fetchWithFallback(`/api/portfolios/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      headers,
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: body.message || body.error || 'Failed to unpublish portfolio.',
      };
    }

    clearStoredOwnerToken(slug);

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error during unpublish.',
    };
  }
}
