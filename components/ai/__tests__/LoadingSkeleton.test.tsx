import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSkeleton from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders with default 5 sections', () => {
    const { container } = render(<LoadingSkeleton />);

    // Check for loading skeleton data-testid
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Count section skeletons (each section has a border-b except last)
    const sections = container.querySelectorAll('.space-y-6 > div');
    expect(sections.length).toBe(5);
  });

  it('renders with custom number of sections', () => {
    const { container } = render(<LoadingSkeleton sections={3} />);

    const sections = container.querySelectorAll('.space-y-6 > div');
    expect(sections.length).toBe(3);
  });

  it('shows loading message', () => {
    render(<LoadingSkeleton />);

    expect(screen.getByText('Generating your response...')).toBeInTheDocument();
  });

  it('has header skeleton with metadata placeholders', () => {
    const { container } = render(<LoadingSkeleton />);

    // Check for header skeleton section
    const header = container.querySelector('.mb-6.pb-6.border-b');
    expect(header).toBeInTheDocument();

    // Check for multiple metadata skeletons in header
    const metadataSkeletons = header?.querySelectorAll('.h-4');
    expect(metadataSkeletons?.length).toBeGreaterThan(0);
  });

  it('has footer skeleton for copy button area', () => {
    const { container } = render(<LoadingSkeleton />);

    // Check for footer skeleton
    const footer = container.querySelector('.mt-6.pt-4.border-t');
    expect(footer).toBeInTheDocument();
  });

  it('has spinning indicator', () => {
    const { container } = render(<LoadingSkeleton />);

    // Check for animated spinner SVG
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner?.classList.contains('text-emerald-500')).toBe(true);
  });

  it('has glassmorphism styling', () => {
    const { container } = render(<LoadingSkeleton />);

    const mainDiv = screen.getByTestId('loading-skeleton');
    expect(mainDiv.className).toContain('backdrop-blur');
    expect(mainDiv.className).toContain('bg-white/5');
  });

  it('has staggered animation delays on section lines', () => {
    const { container } = render(<LoadingSkeleton sections={3} />);

    // Check that sections have animation delays
    const contentLines = container.querySelectorAll('.space-y-3 .h-3');
    expect(contentLines.length).toBeGreaterThan(0);

    // Check first line has animation delay style
    const firstLine = contentLines[0] as HTMLElement;
    expect(firstLine.style.animationDelay).toBeDefined();
  });

  it('has pulse animation on skeleton elements', () => {
    const { container } = render(<LoadingSkeleton />);

    // Check for elements with animate-pulse class
    const pulsingElements = container.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBeGreaterThan(0);
  });
});
