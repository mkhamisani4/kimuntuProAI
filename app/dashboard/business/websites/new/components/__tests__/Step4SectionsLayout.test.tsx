/**
 * Unit tests for Step4SectionsLayout component
 * Tests section toggles and layout style selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step4SectionsLayout from '../Step4SectionsLayout';
import type { WizardInput } from '@kimuntupro/shared';

describe('Step4SectionsLayout', () => {
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

  it('renders all section options', () => {
    render(
      <Step4SectionsLayout
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders all layout style options', () => {
    render(
      <Step4SectionsLayout
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Minimal')).toBeInTheDocument();
    expect(screen.getByText('Modern')).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
    expect(screen.getByText('Playful')).toBeInTheDocument();
  });

  it('shows enabled sections as selected', () => {
    render(
      <Step4SectionsLayout
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const featuresButton = screen.getByRole('button', { name: /Features/ });
    expect(featuresButton).toHaveClass('border-emerald-500');
  });

  it('shows disabled sections as unselected', () => {
    render(
      <Step4SectionsLayout
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const testimonialsButton = screen.getByRole('button', { name: /Testimonials/ });
    expect(testimonialsButton).toHaveClass('border-gray-700');
  });

  it('toggles section when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step4SectionsLayout
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const testimonialsButton = screen.getByRole('button', { name: /Testimonials/ });
    await user.click(testimonialsButton);

    expect(mockUpdateData).toHaveBeenCalledWith({
      enabledSections: {
        ...mockData.enabledSections,
        testimonials: true,
      },
    });
  });

  it('toggles off an enabled section', async () => {
    const user = userEvent.setup();
    render(
      <Step4SectionsLayout
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const featuresButton = screen.getByRole('button', { name: /Features/ });
    await user.click(featuresButton);

    expect(mockUpdateData).toHaveBeenCalledWith({
      enabledSections: {
        ...mockData.enabledSections,
        features: false,
      },
    });
  });

  it('selects layout style when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step4SectionsLayout
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const minimalButton = screen.getByRole('button', { name: /Minimal/ });
    await user.click(minimalButton);

    expect(mockUpdateData).toHaveBeenCalledWith({ layoutStyle: 'minimal' });
  });

  it('highlights selected layout style', () => {
    const dataWithLayout = { ...mockData, layoutStyle: 'modern' as const };
    render(
      <Step4SectionsLayout
        data={dataWithLayout}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const modernButton = screen.getByRole('button', { name: /Modern/ });
    expect(modernButton).toHaveClass('border-emerald-500');
  });

  it('calls navigation functions', async () => {
    const user = userEvent.setup();
    render(
      <Step4SectionsLayout
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
