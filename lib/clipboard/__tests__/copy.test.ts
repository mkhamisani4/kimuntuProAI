import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyAsMarkdown, copyAsPlainText, copyAsHTML } from '../copy';

// Mock toast
vi.mock('@/components/ai/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Clipboard Copy Utilities', () => {
  const mockSections = {
    'Executive Summary': 'This is the executive summary content.',
    'Market Analysis': 'This is the market analysis content.',
    'Financial Projections': 'Revenue projections for 12 months.',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(() => Promise.resolve()),
        write: vi.fn(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('copyAsMarkdown', () => {
    it('should copy sections as Markdown format', () => {
      copyAsMarkdown(mockSections);

      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

      const copiedText = (navigator.clipboard.writeText as any).mock.calls[0][0];

      // Check Markdown format
      expect(copiedText).toContain('## Executive Summary');
      expect(copiedText).toContain('This is the executive summary content.');
      expect(copiedText).toContain('## Market Analysis');
      expect(copiedText).toContain('This is the market analysis content.');
      expect(copiedText).toContain('## Financial Projections');
      expect(copiedText).toContain('Revenue projections for 12 months.');

      // Check double line breaks between sections
      expect(copiedText).toMatch(/## Executive Summary\n\nThis is the executive summary content\.\n\n## Market Analysis/);
    });

    it('should show success toast on successful copy', async () => {
      const { toast } = await import('@/components/ai/Toast');

      copyAsMarkdown(mockSections);

      expect(toast.success).toHaveBeenCalledWith('✓ Copied as Markdown');
    });

    it('should show error toast on clipboard failure', async () => {
      const { toast } = await import('@/components/ai/Toast');

      // Mock clipboard to throw error
      (navigator.clipboard.writeText as any).mockImplementationOnce(() => {
        throw new Error('Clipboard error');
      });

      copyAsMarkdown(mockSections);

      expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle empty sections', () => {
      copyAsMarkdown({});

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
    });
  });

  describe('copyAsPlainText', () => {
    it('should copy sections as plain text format', () => {
      copyAsPlainText(mockSections);

      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

      const copiedText = (navigator.clipboard.writeText as any).mock.calls[0][0];

      // Check plain text format (no ## markers)
      expect(copiedText).not.toContain('##');
      expect(copiedText).toContain('Executive Summary');
      expect(copiedText).toContain('This is the executive summary content.');
      expect(copiedText).toContain('Market Analysis');
      expect(copiedText).toContain('This is the market analysis content.');

      // Check separator between sections
      expect(copiedText).toContain('---');
    });

    it('should show success toast on successful copy', async () => {
      const { toast } = await import('@/components/ai/Toast');

      copyAsPlainText(mockSections);

      expect(toast.success).toHaveBeenCalledWith('✓ Copied as Plain Text');
    });

    it('should show error toast on clipboard failure', async () => {
      const { toast } = await import('@/components/ai/Toast');

      (navigator.clipboard.writeText as any).mockImplementationOnce(() => {
        throw new Error('Clipboard error');
      });

      copyAsPlainText(mockSections);

      expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard');
    });
  });

  describe('copyAsHTML', () => {
    it('should copy sections as HTML format using ClipboardItem', async () => {
      // Mock ClipboardItem
      global.ClipboardItem = vi.fn((data) => data) as any;

      await copyAsHTML(mockSections);

      expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
    });

    it('should fallback to writeText if ClipboardItem is not available', async () => {
      // Remove ClipboardItem
      (global as any).ClipboardItem = undefined;

      await copyAsHTML(mockSections);

      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

      const copiedText = (navigator.clipboard.writeText as any).mock.calls[0][0];

      // Check HTML structure
      expect(copiedText).toContain('<!DOCTYPE html>');
      expect(copiedText).toContain('<html>');
      expect(copiedText).toContain('<h1>KimuntuPro AI Assistant Results</h1>');
      expect(copiedText).toContain('<h2>Executive Summary</h2>');
      expect(copiedText).toContain('This is the executive summary content.');
    });

    it('should escape HTML special characters in content', async () => {
      (global as any).ClipboardItem = undefined;

      const sectionsWithHTML = {
        'Test Section': '<script>alert("XSS")</script> & "quotes"',
      };

      await copyAsHTML(sectionsWithHTML);

      const copiedText = (navigator.clipboard.writeText as any).mock.calls[0][0];

      // Check that HTML is escaped
      expect(copiedText).toContain('&lt;script&gt;');
      expect(copiedText).toContain('&amp;');
      expect(copiedText).toContain('&quot;');
      expect(copiedText).not.toContain('<script>alert');
    });

    it('should show success toast with ClipboardItem', async () => {
      const { toast } = await import('@/components/ai/Toast');
      global.ClipboardItem = vi.fn((data) => data) as any;

      await copyAsHTML(mockSections);

      expect(toast.success).toHaveBeenCalledWith('✓ Copied as HTML');
    });

    it('should show fallback success toast without ClipboardItem', async () => {
      const { toast } = await import('@/components/ai/Toast');
      (global as any).ClipboardItem = undefined;

      await copyAsHTML(mockSections);

      expect(toast.success).toHaveBeenCalledWith('✓ Copied as HTML (source code)');
    });

    it('should show error toast on clipboard failure', async () => {
      const { toast } = await import('@/components/ai/Toast');

      (navigator.clipboard.writeText as any).mockImplementationOnce(() => {
        throw new Error('Clipboard error');
      });

      (global as any).ClipboardItem = undefined;

      await copyAsHTML(mockSections);

      expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard');
    });
  });
});
