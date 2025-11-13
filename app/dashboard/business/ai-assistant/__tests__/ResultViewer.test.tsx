import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultViewer from '../ResultViewer';
import type { AssistantResult } from '../page';

// Mock Toast
vi.mock('@/components/ai/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock LoadingSkeleton
vi.mock('@/components/ai/LoadingSkeleton', () => ({
  default: () => <div data-testid="loading-skeleton">Loading Skeleton Mock</div>,
}));

// Mock SourceList
vi.mock('../SourceList', () => ({
  default: ({ sources }: { sources: any[] }) => (
    <div data-testid="source-list">
      {sources.map((source, i) => (
        <div key={i}>{source.title}</div>
      ))}
    </div>
  ),
}));

// Mock ExportDropdown
vi.mock('@/components/ai/ExportDropdown', () => ({
  default: ({ sections, metadata }: { sections: Record<string, string>; metadata: any }) => (
    <div data-testid="export-dropdown">
      Export Dropdown (sections: {Object.keys(sections).length}, assistant: {metadata.assistantType})
    </div>
  ),
}));

// Mock DataBadge
vi.mock('@/components/ai/DataBadge', () => ({
  default: ({ timestamp, isLive }: { timestamp?: string; isLive: boolean }) => (
    <div data-testid={isLive ? 'data-badge-live' : 'data-badge-knowledge'}>
      {isLive ? '🌐 Live Data' : '📚 Knowledge Base'}
      {timestamp && isLive && ` · ${timestamp}`}
    </div>
  ),
}));

describe('ResultViewer', () => {
  const mockResult: AssistantResult = {
    sections: {
      'Executive Summary': 'This is the executive summary content.',
      'Market Analysis': 'This is the market analysis content.',
      'Financial Projections': 'Revenue projections for 12 months.',
    },
    sources: [
      { title: 'Source 1', url: 'https://example.com/1', snippet: 'Snippet 1' },
      { title: 'Source 2', url: 'https://example.com/2', snippet: 'Snippet 2' },
    ],
    meta: {
      model: 'claude-3-opus',
      tokensIn: 1500,
      costCents: 45,
      latencyMs: 3500,
    },
  };

  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API
    const mockWriteText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading is true', () => {
      render(
        <ResultViewer
          result={null}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('does not show loading skeleton when isLoading is false', () => {
      render(
        <ResultViewer
          result={null}
          isLoading={false}
        />
      );

      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error UI when error is provided and no result', () => {
      render(
        <ResultViewer
          result={null}
          error={{ message: 'Failed to generate response', type: 'server' }}
        />
      );

      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
      expect(screen.getByText('Failed to generate response')).toBeInTheDocument();
    });

    it('shows retry button when onRetry is provided', () => {
      render(
        <ResultViewer
          result={null}
          error={{ message: 'Server error', type: 'server' }}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveTextContent('Try Again');
    });

    it('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ResultViewer
          result={null}
          error={{ message: 'Server error', type: 'server' }}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button when onRetry is not provided', () => {
      render(
        <ResultViewer
          result={null}
          error={{ message: 'Server error', type: 'server' }}
        />
      );

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('shows result when both error and result exist', () => {
      render(
        <ResultViewer
          result={mockResult}
          error={{ message: 'Some error', type: 'server' }}
        />
      );

      // Should show result, not error
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.queryByText('Generation Failed')).not.toBeInTheDocument();
    });
  });

  describe('Result Display', () => {
    it('returns null when no result and no loading/error', () => {
      const { container } = render(
        <ResultViewer
          result={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders result sections', () => {
      render(<ResultViewer result={mockResult} />);

      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Market Analysis')).toBeInTheDocument();
      expect(screen.getByText('Financial Projections')).toBeInTheDocument();
    });

    it('renders section content', () => {
      render(<ResultViewer result={mockResult} />);

      expect(screen.getByText('This is the executive summary content.')).toBeInTheDocument();
      expect(screen.getByText('This is the market analysis content.')).toBeInTheDocument();
      expect(screen.getByText('Revenue projections for 12 months.')).toBeInTheDocument();
    });

    it('renders metadata correctly', () => {
      render(<ResultViewer result={mockResult} />);

      expect(screen.getByText('claude-3-opus')).toBeInTheDocument();
      expect(screen.getByText('1500')).toBeInTheDocument();
      expect(screen.getByText('$0.4500')).toBeInTheDocument(); // 45 cents / 100 = $0.45
      expect(screen.getByText('3.50s')).toBeInTheDocument(); // 3500ms / 1000
    });

    it('renders sources when provided', () => {
      render(<ResultViewer result={mockResult} />);

      expect(screen.getByText('Sources')).toBeInTheDocument();
      expect(screen.getByTestId('source-list')).toBeInTheDocument();
      expect(screen.getByText('Source 1')).toBeInTheDocument();
      expect(screen.getByText('Source 2')).toBeInTheDocument();
    });

    it('does not render sources section when sources array is empty', () => {
      const resultNoSources = { ...mockResult, sources: [] };
      render(<ResultViewer result={resultNoSources} />);

      expect(screen.queryByText('Sources')).not.toBeInTheDocument();
      expect(screen.queryByTestId('source-list')).not.toBeInTheDocument();
    });

    it('filters out "Sources" from sections', () => {
      const resultWithSourcesSection = {
        ...mockResult,
        sections: {
          ...mockResult.sections,
          'Sources': 'This should be filtered',
        },
      };

      const { container } = render(<ResultViewer result={resultWithSourcesSection} />);

      // "Sources" should not appear as a section title in the sections area
      const sectionTitles = container.querySelectorAll('.pb-6 h3');
      const sourcesTitle = Array.from(sectionTitles).find(
        (el) => el.textContent === 'Sources'
      );

      // If "Sources" appears, it should be in the dedicated sources section at the bottom
      // not in the regular sections area
      expect(screen.queryByText('This should be filtered')).not.toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('renders copy button', () => {
      render(<ResultViewer result={mockResult} />);

      const copyButton = screen.getByTestId('copy-button');
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveTextContent('Copy to Clipboard');
    });

    it('copies content to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup();
      const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');

      render(<ResultViewer result={mockResult} />);

      const copyButton = screen.getByTestId('copy-button');
      await user.click(copyButton);

      expect(writeTextSpy).toHaveBeenCalledTimes(1);
      const copiedText = writeTextSpy.mock.calls[0][0];

      // Check that copied text includes section titles and content
      expect(copiedText).toContain('## Executive Summary');
      expect(copiedText).toContain('This is the executive summary content.');
      expect(copiedText).toContain('## Market Analysis');
      expect(copiedText).toContain('This is the market analysis content.');

      writeTextSpy.mockRestore();
    });
  });

  describe('Animations', () => {
    it('adds animate-fadeIn class to sections', () => {
      const { container } = render(<ResultViewer result={mockResult} />);

      const sections = container.querySelectorAll('.animate-fadeIn');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('adds staggered animation delays to sections', () => {
      const { container } = render(<ResultViewer result={mockResult} />);

      const sections = container.querySelectorAll('.animate-fadeIn');
      const firstSection = sections[0] as HTMLElement;
      const secondSection = sections[1] as HTMLElement;

      expect(firstSection.style.animationDelay).toBe('0ms');
      expect(secondSection.style.animationDelay).toBe('100ms');
    });
  });

  describe('Empty Sections', () => {
    it('shows message when no sections are returned', () => {
      const emptyResult = {
        ...mockResult,
        sections: {},
      };

      render(<ResultViewer result={emptyResult} />);

      expect(screen.getByText('No sections returned')).toBeInTheDocument();
    });
  });

  describe('Export Features', () => {
    it('renders ExportDropdown when result exists', () => {
      render(<ResultViewer result={mockResult} assistantType="streamlined_plan" />);

      const exportDropdown = screen.getByTestId('export-dropdown');
      expect(exportDropdown).toBeInTheDocument();
    });

    it('passes sections to ExportDropdown', () => {
      render(<ResultViewer result={mockResult} assistantType="market_analysis" />);

      const exportDropdown = screen.getByTestId('export-dropdown');
      expect(exportDropdown).toHaveTextContent('sections: 3');
    });

    it('passes assistant type to ExportDropdown', () => {
      render(<ResultViewer result={mockResult} assistantType="exec_summary" />);

      const exportDropdown = screen.getByTestId('export-dropdown');
      expect(exportDropdown).toHaveTextContent('assistant: exec_summary');
    });

    it('uses default assistant type if not provided', () => {
      render(<ResultViewer result={mockResult} />);

      const exportDropdown = screen.getByTestId('export-dropdown');
      expect(exportDropdown).toHaveTextContent('assistant: streamlined_plan');
    });

    it('does not render ExportDropdown when result is null', () => {
      render(<ResultViewer result={null} />);

      expect(screen.queryByTestId('export-dropdown')).not.toBeInTheDocument();
    });

    it('does not render ExportDropdown when loading', () => {
      render(<ResultViewer result={null} isLoading={true} />);

      expect(screen.queryByTestId('export-dropdown')).not.toBeInTheDocument();
    });

    it('does not render ExportDropdown when error exists without result', () => {
      render(<ResultViewer result={null} error={{ message: 'Error', type: 'server' }} />);

      expect(screen.queryByTestId('export-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('Data Badge', () => {
    it('renders live data badge when sources include web type', () => {
      const resultWithWebSources = {
        ...mockResult,
        sources: [
          { type: 'web' as const, title: 'Web Source', url: 'https://example.com', snippet: 'Test' },
        ],
        meta: {
          ...mockResult.meta,
          timestamp: new Date().toISOString(),
        },
      };

      render(<ResultViewer result={resultWithWebSources} />);

      expect(screen.getByTestId('data-badge-live')).toBeInTheDocument();
      expect(screen.getByText(/🌐 Live Data/)).toBeInTheDocument();
    });

    it('renders knowledge base badge when sources are only RAG type', () => {
      const resultWithRagSources = {
        ...mockResult,
        sources: [
          { type: 'rag' as const, title: 'RAG Source', snippet: 'Test' },
        ],
      };

      render(<ResultViewer result={resultWithRagSources} />);

      expect(screen.getByTestId('data-badge-knowledge')).toBeInTheDocument();
      expect(screen.getByText(/📚 Knowledge Base/)).toBeInTheDocument();
    });

    it('does not render badge when no sources present', () => {
      const resultNoSources = { ...mockResult, sources: [] };

      render(<ResultViewer result={resultNoSources} />);

      expect(screen.queryByTestId('data-badge-live')).not.toBeInTheDocument();
      expect(screen.queryByTestId('data-badge-knowledge')).not.toBeInTheDocument();
    });

    it('passes timestamp to DataBadge when available', () => {
      const timestamp = new Date().toISOString();
      const resultWithTimestamp = {
        ...mockResult,
        sources: [
          { type: 'web' as const, title: 'Web Source', url: 'https://example.com' },
        ],
        meta: {
          ...mockResult.meta,
          timestamp,
        },
      };

      render(<ResultViewer result={resultWithTimestamp} />);

      expect(screen.getByTestId('data-badge-live')).toBeInTheDocument();
    });

    it('shows live badge when sources have mixed RAG and web types', () => {
      const resultWithMixedSources = {
        ...mockResult,
        sources: [
          { type: 'rag' as const, title: 'RAG Source', snippet: 'Test' },
          { type: 'web' as const, title: 'Web Source', url: 'https://example.com' },
        ],
        meta: {
          ...mockResult.meta,
          timestamp: new Date().toISOString(),
        },
      };

      render(<ResultViewer result={resultWithMixedSources} />);

      // Should show live badge since at least one source is web
      expect(screen.getByTestId('data-badge-live')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has correct styling classes', () => {
      const { container } = render(<ResultViewer result={mockResult} />);

      const mainDiv = container.querySelector('.bg-white');
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv?.classList.contains('rounded-lg')).toBe(true);
      expect(mainDiv?.classList.contains('shadow-sm')).toBe(true);
    });
  });
});
