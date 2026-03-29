/**
 * Unit tests for Step1BrandBasics component
 * Tests company name input, tagline, brand voice selection, and logo upload
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step1BrandBasics from '../Step1BrandBasics';
import type { WizardInput } from '@kimuntupro/shared';

// Mock Toast
vi.mock('@/components/ai/Toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
  },
}));

describe('Step1BrandBasics', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    expect(screen.getByText('Brand Basics')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Acme Inc')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Innovation at its finest')).toBeInTheDocument();
  });

  it('shows company name as required field', () => {
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    // Look for required asterisk indicator
    expect(screen.getByText((content, element) => {
      return element?.textContent === '*' && element?.className?.includes('text-red-400');
    })).toBeInTheDocument();
  });

  it('updates company name when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const input = screen.getByPlaceholderText('e.g., Acme Inc');
    await user.type(input, 'My Company');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('updates tagline when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const input = screen.getByPlaceholderText('e.g., Innovation at its finest');
    await user.type(input, 'Best company ever');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('renders all brand voice options', () => {
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Casual')).toBeInTheDocument();
    expect(screen.getByText('Luxury')).toBeInTheDocument();
    expect(screen.getByText('Playful')).toBeInTheDocument();
    expect(screen.getByText('Friendly')).toBeInTheDocument();
  });

  it('selects brand voice when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const professionalButton = screen.getByRole('button', { name: /Professional/ });
    await user.click(professionalButton);

    expect(mockUpdateData).toHaveBeenCalledWith({ brandVoice: 'professional' });
  });

  it('highlights selected brand voice', () => {
    const dataWithVoice = { ...mockData, brandVoice: 'casual' as const };
    render(
      <Step1BrandBasics
        data={dataWithVoice}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const casualButton = screen.getByRole('button', { name: /Casual/ });
    expect(casualButton).toHaveClass('border-emerald-500');
  });

  it('shows logo upload area when no logo', () => {
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, SVG up to 5MB')).toBeInTheDocument();
  });

  it('prevents next without company name', async () => {
    const { toast } = await import('@/components/ai/Toast');
    const user = userEvent.setup();

    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const nextButton = screen.getByRole('button', { name: 'Next Step' });
    await user.click(nextButton);

    expect(toast.error).toHaveBeenCalledWith('Please enter your company name');
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('allows next with company name', async () => {
    const user = userEvent.setup();
    const dataWithName = { ...mockData, companyName: 'Test Company' };

    render(
      <Step1BrandBasics
        data={dataWithName}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const nextButton = screen.getByRole('button', { name: 'Next Step' });
    await user.click(nextButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('displays logo preview when logo URL exists', () => {
    const dataWithLogo = { ...mockData, logoUrl: 'data:image/png;base64,test' };

    render(
      <Step1BrandBasics
        data={dataWithLogo}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const logoImage = screen.getByAltText('Logo preview');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'data:image/png;base64,test');
  });

  it('shows remove button when logo exists', () => {
    const dataWithLogo = { ...mockData, logoUrl: 'data:image/png;base64,test' };

    render(
      <Step1BrandBasics
        data={dataWithLogo}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remove logo' });
    expect(removeButton).toBeInTheDocument();
  });

  it('removes logo when remove button clicked', async () => {
    const { toast } = await import('@/components/ai/Toast');
    const user = userEvent.setup();
    const dataWithLogo = { ...mockData, logoUrl: 'data:image/png;base64,test' };

    render(
      <Step1BrandBasics
        data={dataWithLogo}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remove logo' });
    await user.click(removeButton);

    expect(mockUpdateData).toHaveBeenCalledWith({ logoUrl: null });
    expect(toast.success).toHaveBeenCalledWith('Logo removed');
  });

  it('enforces max length on company name', () => {
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const input = screen.getByPlaceholderText('e.g., Acme Inc') as HTMLInputElement;
    expect(input).toHaveAttribute('maxLength', '100');
  });

  it('enforces max length on tagline', () => {
    render(
      <Step1BrandBasics
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
      />
    );

    const input = screen.getByPlaceholderText('e.g., Innovation at its finest') as HTMLInputElement;
    expect(input).toHaveAttribute('maxLength', '150');
  });
});
