/**
 * Unit tests for Step3HeroCta component
 * Tests hero headline, subheadline, CTA, and main goal selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step3HeroCta from '../Step3HeroCta';
import type { WizardInput } from '@kimuntupro/shared';

describe('Step3HeroCta', () => {
  const mockData: WizardInput = {
    enabledSections: {
      features: true,
      services: true,
      about: true,
      testimonials: false,
      pricing: false,
      faq: false,
      contact: true,
    },
  };

  const mockUpdateData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <Step3HeroCta
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Hero & Call-to-Action')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Build Your Dream Website/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/No coding required/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Get Started Free/)).toBeInTheDocument();
  });

  it('renders all main goal options', () => {
    render(
      <Step3HeroCta
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Book a Consultation')).toBeInTheDocument();
    expect(screen.getByText('Purchase Product')).toBeInTheDocument();
    expect(screen.getByText('Sign Up / Register')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('updates hero headline when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step3HeroCta
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const input = screen.getByPlaceholderText(/Build Your Dream Website/);
    await user.type(input, 'New Headline');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('selects main goal when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step3HeroCta
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const consultButton = screen.getByRole('button', { name: /Book a Consultation/ });
    await user.click(consultButton);

    expect(mockUpdateData).toHaveBeenCalledWith({ mainGoal: 'consult' });
  });

  it('highlights selected main goal', () => {
    const dataWithGoal = { ...mockData, mainGoal: 'buy' as const };
    render(
      <Step3HeroCta
        data={dataWithGoal}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const buyButton = screen.getByRole('button', { name: /Purchase Product/ });
    expect(buyButton).toHaveClass('border-emerald-500');
  });

  it('shows character counter for subheadline', () => {
    render(
      <Step3HeroCta
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/0\/250/)).toBeInTheDocument();
  });

  it('enforces max lengths', () => {
    render(
      <Step3HeroCta
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const headlineInput = screen.getByPlaceholderText(/Build Your Dream Website/) as HTMLInputElement;
    expect(headlineInput).toHaveAttribute('maxLength', '100');

    const ctaInput = screen.getByPlaceholderText(/Get Started Free/) as HTMLInputElement;
    expect(ctaInput).toHaveAttribute('maxLength', '50');
  });

  it('calls navigation functions', async () => {
    const user = userEvent.setup();
    render(
      <Step3HeroCta
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(mockOnNext).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Back/ }));
    expect(mockOnBack).toHaveBeenCalled();
  });
});
