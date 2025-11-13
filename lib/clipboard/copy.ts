/**
 * Clipboard Copy Utilities
 * Provides functions to copy assistant results in various formats
 */

import { toast } from '@/components/ai/Toast';

/**
 * Copies sections as Markdown format
 * Format: ## Section Title\n\nContent\n\n
 */
export function copyAsMarkdown(sections: Record<string, string>): void {
  try {
    const markdown = Object.entries(sections)
      .map(([title, content]) => `## ${title}\n\n${content}`)
      .join('\n\n');

    navigator.clipboard.writeText(markdown);
    toast.success('✓ Copied as Markdown');
  } catch (error) {
    console.error('Failed to copy as Markdown:', error);
    toast.error('Failed to copy to clipboard');
  }
}

/**
 * Copies sections as plain text format
 * Format: Section Title\n\nContent\n\n
 */
export function copyAsPlainText(sections: Record<string, string>): void {
  try {
    const plainText = Object.entries(sections)
      .map(([title, content]) => `${title}\n\n${content}`)
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(plainText);
    toast.success('✓ Copied as Plain Text');
  } catch (error) {
    console.error('Failed to copy as Plain Text:', error);
    toast.error('Failed to copy to clipboard');
  }
}

/**
 * Copies sections as HTML format
 * Uses Clipboard API with HTML mime type
 */
export async function copyAsHTML(sections: Record<string, string>): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>KimuntuPro AI Assistant Results</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h2 {
      color: #10b981;
      border-bottom: 2px solid #10b981;
      padding-bottom: 8px;
      margin-top: 32px;
    }
    .section {
      margin-bottom: 32px;
    }
    .content {
      white-space: pre-wrap;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <h1>KimuntuPro AI Assistant Results</h1>
  ${Object.entries(sections)
    .map(([title, content]) => `
    <div class="section">
      <h2>${escapeHtml(title)}</h2>
      <div class="content">${escapeHtml(content)}</div>
    </div>
  `)
    .join('')}
</body>
</html>
    `.trim();

    // Try modern Clipboard API with HTML
    if (typeof ClipboardItem !== 'undefined') {
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      toast.success('✓ Copied as HTML');
    } else {
      // Fallback to plain text
      await navigator.clipboard.writeText(html);
      toast.success('✓ Copied as HTML (source code)');
    }
  } catch (error) {
    console.error('Failed to copy as HTML:', error);
    toast.error('Failed to copy to clipboard');
  }
}

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
