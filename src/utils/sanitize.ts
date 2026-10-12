/**
 * Security & Sanitization Utilities for Portfolios
 * Prevents Stored XSS, script injection, and malicious URL protocols (e.g. javascript:).
 */

/**
 * Validates and sanitizes URLs to ensure only secure protocols are rendered.
 * Strictly permits: http://, https://, mailto:, and relative internal anchors (#, /).
 * Neutralizes: javascript:, data:, vbscript:, and malformed URIs to '#'.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Reject protocol-relative URLs (e.g. //evil.com, /\\evil.com, \\evil.com)
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\') || trimmed.startsWith('/#')) {
    return '#';
  }

  // Allow anchor references and safe relative paths (e.g. #about, /p/123)
  if (trimmed.startsWith('#') || (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\'))) {
    return trimmed;
  }

  // Allow mailto: and tel:
  if (trimmed.toLowerCase().startsWith('mailto:')) {
    const cleanMailto = trimmed.replace(/[\r\n\t]/g, '');
    return cleanMailto;
  }
  if (trimmed.toLowerCase().startsWith('tel:')) {
    const cleanTel = trimmed.replace(/[\r\n\t]/g, '');
    return cleanTel;
  }

  // Allow strict http: and https: protocols only
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      return '#';
    }
  }

  // Any other scheme (javascript:, data:, vbscript:, etc.) or malformed URL is neutralized
  return '#';
}

/**
 * Escapes HTML characters in text to prevent raw HTML injection in server/template rendering.
 */
export function sanitizeHtmlText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
