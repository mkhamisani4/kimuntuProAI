/**
 * Unit tests for RecentActivity component
 * Tests rendering, loading states, and navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RecentActivity from '../RecentActivity';
import type { AssistantResult } from '@kimuntupro/db';

// Mock the database module
vi.mock('@kimuntupro/db', () => ({
  getRecentResults: vi.fn(),
}));

// Mock Next.js router (already mocked in vitest.setup.ts, but we need useRouter for assertions)
import { useRouter } from 'next/navigation';

const { getRecentResults } = await import('@kimuntupro/db');

describe('RecentActivity', () => {
  const mockResults: AssistantResult[] = [
    {
      id: 'result-1',
      tenantId: 'test-tenant',
      userId: 'user-123',
      assistant: 'streamlined_plan',
      title: 'Plan: Meal prep SaaS for students',
      summary: 'A comprehensive business plan for a meal prep delivery service targeting college students.',
      sections: {
        overview: 'Business plan overview...',
      },
      sources: [],
      metadata: {
        model: 'gpt-4',
        tokensUsed: 500,
        latencyMs: 2000,
        cost: 0.05,
      },
      createdAt: new Date('2025-01-15T10:00:00Z'),
    },
    {
      id: 'result-2',
      tenantId: 'test-tenant',
      userId: 'user-123',
      assistant: 'exec_summary',
      title: 'Summary: Financial overview for SaaS',
      summary: 'Executive summary with financial projections.',
      sections: {
        financials: 'Financial overview...',
      },
      sources: [],
      createdAt: new Date('2025-01-15T09:00:00Z'),
    },
    {
      id: 'result-3',
      tenantId: 'test-tenant',
      userId: 'user-123',
      assistant: 'market_analysis',
      title: 'Market: AI coding assistant analysis',
      summary: 'Market analysis of the AI coding assistant space.',
      sections: {
        market: 'Market overview...',
      },
      sources: [],
      createdAt: new Date('2025-01-15T08:00:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(getRecentResults).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<RecentActivity tenantId="test-tenant" />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    // Should show 3 skeleton loaders
    const skeletons = screen.getAllByRole('generic').filter((el) =>
      el.className.includes('animate-pulse')
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should fetch and display recent results', async () => {
    vi.mocked(getRecentResults).mockResolvedValue(mockResults);

    render(<RecentActivity tenantId="test-tenant" limit={5} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Plan: Meal prep SaaS for students')).toBeInTheDocument();
    });

    // Verify all results are displayed
    expect(screen.getByText('Plan: Meal prep SaaS for students')).toBeInTheDocument();
    expect(screen.getByText('Summary: Financial overview for SaaS')).toBeInTheDocument();
    expect(screen.getByText('Market: AI coding assistant analysis')).toBeInTheDocument();

    // Verify assistant labels are displayed
    expect(screen.getByText('Streamlined Plan')).toBeInTheDocument();
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    expect(screen.getByText('Market Analysis')).toBeInTheDocument();

    // Verify summaries are displayed
    expect(
      screen.getByText(/A comprehensive business plan for a meal prep delivery service/)
    ).toBeInTheDocument();
  });

  it('should respect the limit prop', async () => {
    vi.mocked(getRecentResults).mockResolvedValue(mockResults);

    render(<RecentActivity tenantId="test-tenant" limit={3} />);

    await waitFor(() => {
      expect(getRecentResults).toHaveBeenCalledWith('test-tenant', 3);
    });
  });

  it('should use default limit of 5 when not provided', async () => {
    vi.mocked(getRecentResults).mockResolvedValue([]);

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(getRecentResults).toHaveBeenCalledWith('test-tenant', 5);
    });
  });

  it('should display error state when fetch fails', async () => {
    vi.mocked(getRecentResults).mockRejectedValue(new Error('Firestore connection failed'));

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load recent activity')).toBeInTheDocument();
    });
  });

  it('should display empty state when no results exist', async () => {
    vi.mocked(getRecentResults).mockResolvedValue([]);

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(
        screen.getByText(/No activity yet. Generate your first business plan/)
      ).toBeInTheDocument();
    });
  });

  it.skip('should navigate to correct assistant page when Open button is clicked', async () => {
    vi.mocked(getRecentResults).mockResolvedValue(mockResults);
    const mockRouter = useRouter();

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(screen.getByText('Plan: Meal prep SaaS for students')).toBeInTheDocument();
    });

    // Find all Open buttons
    const openButtons = screen.getAllByRole('button', { name: /open/i });

    // Click the first Open button (for streamlined_plan)
    fireEvent.click(openButtons[0]);

    // Verify navigation to correct route with resultId
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/business/streamlined-plan?resultId=result-1');
  });

  it.skip('should navigate when clicking on result card', async () => {
    vi.mocked(getRecentResults).mockResolvedValue(mockResults);
    const mockRouter = useRouter();

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(screen.getByText('Plan: Meal prep SaaS for students')).toBeInTheDocument();
    });

    // Click on the result card (not the button)
    const resultCard = screen.getByText('Plan: Meal prep SaaS for students').closest('div')!;
    fireEvent.click(resultCard.parentElement!);

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/business/streamlined-plan?resultId=result-1');
  });

  it('should display correct assistant color pills', async () => {
    vi.mocked(getRecentResults).mockResolvedValue(mockResults);

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(screen.getByText('Streamlined Plan')).toBeInTheDocument();
    });

    const streamlinedPill = screen.getByText('Streamlined Plan');
    expect(streamlinedPill.className).toContain('bg-blue-100');
    expect(streamlinedPill.className).toContain('text-blue-800');

    const execSummaryPill = screen.getByText('Executive Summary');
    expect(execSummaryPill.className).toContain('bg-purple-100');
    expect(execSummaryPill.className).toContain('text-purple-800');

    const marketPill = screen.getByText('Market Analysis');
    expect(marketPill.className).toContain('bg-green-100');
    expect(marketPill.className).toContain('text-green-800');
  });

  it('should format relative timestamps correctly', async () => {
    const now = new Date('2025-01-15T10:05:00Z'); // 5 minutes after first result
    vi.setSystemTime(now);

    vi.mocked(getRecentResults).mockResolvedValue([
      {
        ...mockResults[0],
        createdAt: new Date('2025-01-15T10:04:00Z'), // 1 minute ago
      },
      {
        ...mockResults[1],
        createdAt: new Date('2025-01-15T08:00:00Z'), // 2 hours ago
      },
      {
        ...mockResults[2],
        createdAt: new Date('2025-01-14T10:00:00Z'), // 1 day ago
      },
    ]);

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(screen.getByText('1m ago')).toBeInTheDocument();
    });

    expect(screen.getByText('2h ago')).toBeInTheDocument();
    expect(screen.getByText('1d ago')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should display "Just now" for very recent results', async () => {
    const now = new Date('2025-01-15T10:00:00Z');
    vi.setSystemTime(now);

    vi.mocked(getRecentResults).mockResolvedValue([
      {
        ...mockResults[0],
        createdAt: new Date('2025-01-15T10:00:00Z'), // 0 seconds ago
      },
    ]);

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should refetch results when tenantId changes', async () => {
    vi.mocked(getRecentResults).mockResolvedValue(mockResults);

    const { rerender } = render(<RecentActivity tenantId="tenant-1" />);

    await waitFor(() => {
      expect(getRecentResults).toHaveBeenCalledWith('tenant-1', 5);
    });

    // Change tenantId
    rerender(<RecentActivity tenantId="tenant-2" />);

    await waitFor(() => {
      expect(getRecentResults).toHaveBeenCalledWith('tenant-2', 5);
    });

    expect(getRecentResults).toHaveBeenCalledTimes(2);
  });

  it('should handle results without summary gracefully', async () => {
    vi.mocked(getRecentResults).mockResolvedValue([
      {
        ...mockResults[0],
        summary: '', // Empty summary
      },
    ]);

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      expect(screen.getByText('Plan: Meal prep SaaS for students')).toBeInTheDocument();
    });

    // Title should be visible, but summary should not render
    expect(screen.queryByText(/A comprehensive business plan/)).not.toBeInTheDocument();
  });

  it('should truncate long titles correctly', async () => {
    const longTitle = 'A'.repeat(100);
    vi.mocked(getRecentResults).mockResolvedValue([
      {
        ...mockResults[0],
        title: longTitle,
      },
    ]);

    render(<RecentActivity tenantId="test-tenant" />);

    await waitFor(() => {
      const titleElement = screen.getByText(longTitle);
      expect(titleElement.className).toContain('truncate');
    });
  });
});
