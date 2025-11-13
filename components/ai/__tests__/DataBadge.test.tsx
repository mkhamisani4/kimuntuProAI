import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataBadge from '../DataBadge';

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date: Date, options?: any) => {
    // Simple mock implementation
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'less than a minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }),
}));

describe('DataBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Knowledge Base Mode', () => {
    it('renders knowledge base badge when isLive is false', () => {
      render(<DataBadge isLive={false} />);

      const badge = screen.getByTestId('data-badge-knowledge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('📚 Knowledge Base');
    });

    it('applies correct styling for knowledge base badge', () => {
      render(<DataBadge isLive={false} />);

      const badge = screen.getByTestId('data-badge-knowledge');
      expect(badge.className).toContain('bg-gray-100');
      expect(badge.className).toContain('text-gray-600');
      expect(badge.className).toContain('rounded-full');
    });

    it('does not display timestamp for knowledge base', () => {
      render(<DataBadge isLive={false} timestamp="2025-01-15T10:00:00Z" />);

      const badge = screen.getByTestId('data-badge-knowledge');
      expect(badge.textContent).not.toContain('ago');
      expect(badge.textContent).not.toContain('just now');
    });
  });

  describe('Live Data Mode', () => {
    it('renders live data badge when isLive is true', () => {
      render(<DataBadge isLive={true} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('🌐 Live Data');
    });

    it('applies correct styling for live data badge', () => {
      render(<DataBadge isLive={true} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.className).toContain('bg-emerald-100');
      expect(badge.className).toContain('text-emerald-700');
      expect(badge.className).toContain('rounded-full');
    });

    it('displays "just now" when no timestamp provided', () => {
      render(<DataBadge isLive={true} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge).toHaveTextContent('just now');
    });

    it('displays relative time when timestamp provided', () => {
      const timestamp = new Date(Date.now() - 5 * 60000).toISOString(); // 5 minutes ago

      render(<DataBadge isLive={true} timestamp={timestamp} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.textContent).toContain('5 minutes ago');
    });

    it('formats recent timestamps correctly', () => {
      const timestamp = new Date(Date.now() - 30000).toISOString(); // 30 seconds ago

      render(<DataBadge isLive={true} timestamp={timestamp} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.textContent).toContain('less than a minute ago');
    });

    it('formats hour-old timestamps correctly', () => {
      const timestamp = new Date(Date.now() - 2 * 3600000).toISOString(); // 2 hours ago

      render(<DataBadge isLive={true} timestamp={timestamp} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.textContent).toContain('2 hours ago');
    });

    it('formats day-old timestamps correctly', () => {
      const timestamp = new Date(Date.now() - 3 * 86400000).toISOString(); // 3 days ago

      render(<DataBadge isLive={true} timestamp={timestamp} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.textContent).toContain('3 days ago');
    });
  });

  describe('Accessibility', () => {
    it('has inline-flex display for proper alignment', () => {
      const { container } = render(<DataBadge isLive={true} />);

      const badge = container.querySelector('.inline-flex');
      expect(badge).toBeInTheDocument();
    });

    it('uses readable font weight', () => {
      render(<DataBadge isLive={true} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.className).toContain('font-medium');
    });

    it('uses appropriate text size', () => {
      render(<DataBadge isLive={false} />);

      const badge = screen.getByTestId('data-badge-knowledge');
      expect(badge.className).toContain('text-xs');
    });
  });

  describe('Visual Design', () => {
    it('includes emoji icon in knowledge base badge', () => {
      render(<DataBadge isLive={false} />);

      const badge = screen.getByTestId('data-badge-knowledge');
      expect(badge.textContent).toContain('📚');
    });

    it('includes emoji icon in live data badge', () => {
      render(<DataBadge isLive={true} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.textContent).toContain('🌐');
    });

    it('has gap spacing between elements', () => {
      render(<DataBadge isLive={true} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.className).toContain('gap-1');
    });

    it('has padding for proper spacing', () => {
      render(<DataBadge isLive={true} />);

      const badge = screen.getByTestId('data-badge-live');
      expect(badge.className).toContain('px-2');
      expect(badge.className).toContain('py-1');
    });
  });
});
