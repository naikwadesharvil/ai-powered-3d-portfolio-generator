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

/**
 * Publish portfolio to the backend
 */
export async function publishPortfolio(data: PortfolioData): Promise<PublishResult> {
  try {
    const res = await fetchWithFallback('/api/portfolios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: body.error || `HTTP ${res.status}`,
        message: body.message || 'Failed to publish portfolio.',
      };
    }

    return {
      success: true,
      slug: body.slug,
      url: body.url,
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
 * Retrieve published portfolio by slug
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
 * Unpublish/remove published portfolio
 */
export async function unpublishPortfolio(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchWithFallback(`/api/portfolios/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: body.message || body.error || 'Failed to unpublish portfolio.',
      };
    }

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
