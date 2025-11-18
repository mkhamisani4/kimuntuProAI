/**
 * Tests for HTML Sanitization Utility
 */

import { sanitizeWebsiteHTML, getIframeCSP, getIframeSandboxAttributes } from '../sanitize';

describe('sanitizeWebsiteHTML', () => {
  it('should preserve safe HTML structure', () => {
    const html = '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes to safe HTML
    expect(result).toContain('<html>');
    expect(result).toContain('<head>');
    expect(result).toContain('<body>');
    expect(result).toContain('<h1>Hello</h1>');
  });

  it('should preserve inline styles', () => {
    const html = '<div style="color: red; background: blue;">Styled content</div>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('style=');
    expect(result).toContain('color');
  });

  it('should preserve CSS in style tags', () => {
    const html = '<style>.test { color: red; }</style><div class="test">Content</div>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('<style>');
    expect(result).toContain('.test');
    expect(result).toContain('color: red');
  });

  it('should block inline event handlers', () => {
    const html = '<button onclick="alert(\'XSS\')">Click me</button>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).not.toContain('onclick');
    expect(result).toContain('<button');
    expect(result).toContain('Click me');
  });

  it('should preserve semantic HTML5 tags', () => {
    const html = '<header><nav><a href="#">Link</a></nav></header><main><article>Content</article></main><footer>Footer</footer>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('<header>');
    expect(result).toContain('<nav>');
    expect(result).toContain('<main>');
    expect(result).toContain('<article>');
    expect(result).toContain('<footer>');
  });

  it('should preserve ARIA attributes for accessibility', () => {
    const html = '<button aria-label="Close" role="button">X</button>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('aria-label');
    expect(result).toContain('role=');
  });

  it('should allow data URIs for images', () => {
    const html = '<img src="data:image/png;base64,iVBORw0KGgo=" alt="Test">';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('data:image/png');
    expect(result).toContain('base64');
  });

  it('should preserve SVG elements', () => {
    const html = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('<svg');
    expect(result).toContain('viewBox');
    expect(result).toContain('<circle');
  });

  it('should handle invalid HTML gracefully', () => {
    const html = '<div><p>Unclosed paragraph';
    const result = sanitizeWebsiteHTML(html);

    // Should return the same HTML, not throw
    expect(result).toBe(html);
    expect(typeof result).toBe('string');
  });

  it('should handle empty input', () => {
    const result = sanitizeWebsiteHTML('');

    expect(result).toBe('');
    expect(typeof result).toBe('string');
  });

  it('should return safe HTML on error', () => {
    // Pass invalid input that might cause sanitization to fail
    const result = sanitizeWebsiteHTML(null as any);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Failed to load website preview');
  });

  it('should preserve form elements', () => {
    const html = '<form><input type="text" name="email" placeholder="Email" required><button type="submit">Submit</button></form>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('<form>');
    expect(result).toContain('<input');
    expect(result).toContain('type="text"');
    expect(result).toContain('required');
    expect(result).toContain('<button');
  });

  it('should preserve meta tags', () => {
    const html = '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('<meta');
    expect(result).toContain('charset');
    expect(result).toContain('viewport');
  });

  it('should remove multiple event handlers', () => {
    const html = '<div onclick="alert(1)" onmouseover="alert(2)" onerror="alert(3)">Test</div>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onmouseover');
    expect(result).not.toContain('onerror');
    expect(result).toContain('<div');
    expect(result).toContain('Test');
  });

  it('should preserve complex CSS with gradients and transforms', () => {
    const html = '<style>body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); transform: rotate(45deg); }</style>';
    const result = sanitizeWebsiteHTML(html);

    expect(result).toBe(html); // No changes
    expect(result).toContain('linear-gradient');
    expect(result).toContain('transform');
  });
});

describe('getIframeCSP', () => {
  it('should return a valid CSP string', () => {
    const csp = getIframeCSP();

    expect(csp).toBeTruthy();
    expect(typeof csp).toBe('string');
    expect(csp).toContain('default-src');
    expect(csp).toContain('style-src');
    expect(csp).toContain('script-src');
  });

  it('should allow inline styles', () => {
    const csp = getIframeCSP();

    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('should allow inline scripts', () => {
    const csp = getIframeCSP();

    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  });

  it('should block nested iframes', () => {
    const csp = getIframeCSP();

    expect(csp).toContain("frame-src 'none'");
  });

  it('should block plugins', () => {
    const csp = getIframeCSP();

    expect(csp).toContain("object-src 'none'");
  });

  it('should allow data URIs for images', () => {
    const csp = getIframeCSP();

    expect(csp).toContain('img-src');
    expect(csp).toContain('data:');
  });

  it('should restrict form submissions', () => {
    const csp = getIframeCSP();

    expect(csp).toContain("form-action 'self'");
  });
});

describe('getIframeSandboxAttributes', () => {
  it('should return sandbox attributes string', () => {
    const sandbox = getIframeSandboxAttributes();

    expect(sandbox).toBeTruthy();
    expect(typeof sandbox).toBe('string');
  });

  it('should allow same-origin', () => {
    const sandbox = getIframeSandboxAttributes();

    expect(sandbox).toContain('allow-same-origin');
  });

  it('should allow scripts', () => {
    const sandbox = getIframeSandboxAttributes();

    expect(sandbox).toContain('allow-scripts');
  });

  it('should allow popups for target=_blank links', () => {
    const sandbox = getIframeSandboxAttributes();

    expect(sandbox).toContain('allow-popups');
  });

  it('should allow forms', () => {
    const sandbox = getIframeSandboxAttributes();

    expect(sandbox).toContain('allow-forms');
  });

  it('should allow modals', () => {
    const sandbox = getIframeSandboxAttributes();

    expect(sandbox).toContain('allow-modals');
  });

  it('should not allow downloads by default', () => {
    const sandbox = getIframeSandboxAttributes();

    expect(sandbox).not.toContain('allow-downloads');
  });

  it('should not allow pointer lock', () => {
    const sandbox = getIframeSandboxAttributes();

    expect(sandbox).not.toContain('allow-pointer-lock');
  });
});
