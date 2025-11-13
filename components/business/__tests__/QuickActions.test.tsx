import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuickActions from '../QuickActions';

describe('QuickActions', () => {
  it('renders all three AI assistant cards', () => {
    render(<QuickActions />);

    // Check for the three AI assistant cards
    expect(screen.getByText('Streamlined Business Plan')).toBeInTheDocument();
    expect(screen.getByText('Executive Summary + Financials')).toBeInTheDocument();
    expect(screen.getByText('Market Analysis')).toBeInTheDocument();
  });

  it('has correct links for AI assistant cards', () => {
    render(<QuickActions />);

    // Check links
    const streamlinedPlanLink = screen.getByRole('link', { name: /Generate Plan/i });
    expect(streamlinedPlanLink).toHaveAttribute('href', '/dashboard/business/streamlined-plan');

    const execSummaryLink = screen.getByRole('link', { name: /Create Summary/i });
    expect(execSummaryLink).toHaveAttribute('href', '/dashboard/business/exec-summary');

    const marketAnalysisLink = screen.getByRole('link', { name: /Analyze Market/i });
    expect(marketAnalysisLink).toHaveAttribute('href', '/dashboard/business/market-analysis');
  });

  it('does not show "Coming Soon" badges on AI assistant cards', () => {
    const { container } = render(<QuickActions />);

    // Get the first three cards (AI assistants)
    const cards = container.querySelectorAll('.bg-white\\/5');
    const firstThreeCards = Array.from(cards).slice(0, 3);

    firstThreeCards.forEach(card => {
      expect(card.textContent).not.toContain('Coming Soon');
    });
  });

  it('renders other action cards', () => {
    render(<QuickActions />);

    // Check for other cards
    expect(screen.getByText('Marketing Suite (SEO • Email • Social)')).toBeInTheDocument();
    expect(screen.getByText('Funding Strategy')).toBeInTheDocument();
    expect(screen.getByText('AI Website Builder')).toBeInTheDocument();
  });

  it('has correct section attributes', () => {
    const { container } = render(<QuickActions />);

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('role', 'region');
    expect(section).toHaveAttribute('aria-label', 'Quick actions');
  });
});
