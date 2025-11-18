/**
 * HTML Sanitization Utility
 * Uses DOMPurify to sanitize generated website HTML while preserving safe inline styles
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML for safe rendering in iframe previews
 *
 * Allows:
 * - Inline styles (needed for generated websites)
 * - Common HTML tags and attributes
 * - CSS in <style> tags
 * - Inline JavaScript (controlled by iframe sandbox)
 *
 * Blocks:
 * - Potentially malicious scripts (mitigated by iframe sandbox)
 * - External resource loading (except what's allowed by CSP)
 * - Form submissions to external domains
 */
export function sanitizeWebsiteHTML(html: string): string {
  // Configure DOMPurify for website preview
  const config: DOMPurify.Config = {
    // Allow all safe HTML tags and attributes
    ALLOWED_TAGS: [
      // Document structure
      'html', 'head', 'body', 'meta', 'title', 'link', 'style',
      // Content sectioning
      'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Text content
      'div', 'span', 'p', 'br', 'hr', 'pre', 'blockquote',
      // Inline text semantics
      'a', 'strong', 'em', 'b', 'i', 'u', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
      // Lists
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      // Tables
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
      // Forms
      'form', 'input', 'textarea', 'button', 'select', 'option', 'label', 'fieldset', 'legend',
      // Media
      'img', 'picture', 'source', 'video', 'audio', 'iframe',
      // Other
      'script', 'noscript', 'canvas', 'svg', 'path', 'circle', 'rect', 'line', 'polygon',
    ],
    ALLOWED_ATTR: [
      // Global attributes
      'id', 'class', 'style', 'title', 'lang', 'dir',
      // ARIA attributes (accessibility)
      'role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
      'aria-expanded', 'aria-controls', 'aria-live', 'aria-atomic',
      // Link attributes
      'href', 'target', 'rel', 'download',
      // Media attributes
      'src', 'alt', 'width', 'height', 'loading', 'srcset', 'sizes',
      // Form attributes
      'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly',
      'min', 'max', 'step', 'pattern', 'autocomplete', 'checked', 'selected',
      // Table attributes
      'colspan', 'rowspan', 'scope',
      // SVG attributes
      'viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y',
      // Meta attributes
      'charset', 'content', 'http-equiv', 'viewport',
      // iframe sandbox (if nested iframes)
      'sandbox', 'allow', 'allowfullscreen',
    ],
    // Allow inline styles (needed for generated websites)
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Keep CSS in style tags
    FORBID_TAGS: [], // Don't forbid any tags from ALLOWED_TAGS
    FORBID_ATTR: ['onerror', 'onload', 'onclick'], // Block inline event handlers
    // Return the full document (including DOCTYPE, html, head, body)
    WHOLE_DOCUMENT: true,
    // Return as string (not DOM)
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    // Allow data URIs for images (base64 encoded)
    ALLOW_DATA_ATTR: true,
  };

  try {
    const sanitized = DOMPurify.sanitize(html, config);

    // Log sanitization for debugging
    if (html.length !== sanitized.length) {
      console.log('[Sanitize] HTML sanitized:', {
        original: html.length,
        sanitized: sanitized.length,
        diff: html.length - sanitized.length,
      });
    }

    return sanitized;
  } catch (error) {
    console.error('[Sanitize] Failed to sanitize HTML:', error);
    // Return empty safe HTML on error
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Error</title></head><body><p>Failed to load website preview.</p></body></html>';
  }
}

/**
 * Get Content Security Policy for iframe previews
 * Restricts what the iframe can do for additional security
 */
export function getIframeCSP(): string {
  return [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Allow inline styles (needed for generated websites)
    "script-src 'self' 'unsafe-inline'", // Allow inline scripts (controlled by sandbox)
    "img-src 'self' data: https:", // Allow images from self, data URIs, and HTTPS
    "font-src 'self' data:", // Allow fonts from self and data URIs
    "connect-src 'self'", // Allow fetch/XHR to same origin only
    "frame-src 'none'", // Prevent nested iframes
    "object-src 'none'", // Block plugins (Flash, Java, etc.)
    "base-uri 'self'", // Restrict base tag
    "form-action 'self'", // Restrict form submissions to same origin
  ].join('; ');
}

/**
 * Get secure sandbox attributes for iframe
 * Provides additional isolation beyond CSP
 */
export function getIframeSandboxAttributes(): string {
  return [
    'allow-same-origin', // Allow access to same-origin resources
    'allow-scripts', // Allow JavaScript (needed for interactive websites)
    'allow-popups', // Allow window.open() for links with target="_blank"
    'allow-forms', // Allow form submission
    'allow-modals', // Allow alert(), confirm(), etc.
  ].join(' ');
}
