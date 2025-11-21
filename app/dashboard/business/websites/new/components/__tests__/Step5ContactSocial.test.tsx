/**
 * Unit tests for Step5ContactSocial component
 * Tests contact information and social media link inputs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step5ContactSocial from '../Step5ContactSocial';
import type { WizardInput } from '@kimuntupro/shared';

describe('Step5ContactSocial', () => {
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

  it('renders contact information fields', () => {
    render(
      <Step5ContactSocial
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByPlaceholderText('e.g., hello@yourcompany.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., (555) 123-4567')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., San Francisco, CA')).toBeInTheDocument();
  });

  it('renders social media fields', () => {
    render(
      <Step5ContactSocial
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByPlaceholderText('https://instagram.com/yourcompany')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://linkedin.com/company/yourcompany')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://twitter.com/yourcompany')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://facebook.com/yourcompany')).toBeInTheDocument();
  });

  it('updates contact email when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step5ContactSocial
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const emailInput = screen.getByPlaceholderText('e.g., hello@yourcompany.com');
    await user.type(emailInput, 'test@example.com');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('updates contact phone when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step5ContactSocial
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const phoneInput = screen.getByPlaceholderText('e.g., (555) 123-4567');
    await user.type(phoneInput, '555-1234');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('updates location when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step5ContactSocial
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const locationInput = screen.getByPlaceholderText('e.g., San Francisco, CA');
    await user.type(locationInput, 'New York');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('updates Instagram link when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step5ContactSocial
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const instagramInput = screen.getByPlaceholderText('https://instagram.com/yourcompany');
    await user.type(instagramInput, 'https://instagram.com/mycompany');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('displays existing contact information', () => {
    const dataWithContact = {
      ...mockData,
      contactEmail: 'test@example.com',
      contactPhone: '555-1234',
      location: 'San Francisco',
    };

    render(
      <Step5ContactSocial
        data={dataWithContact}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('555-1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('San Francisco')).toBeInTheDocument();
  });

  it('displays existing social links', () => {
    const dataWithSocial = {
      ...mockData,
      socialLinks: {
        instagram: 'https://instagram.com/test',
        linkedin: 'https://linkedin.com/company/test',
      },
    };

    render(
      <Step5ContactSocial
        data={dataWithSocial}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByDisplayValue('https://instagram.com/test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://linkedin.com/company/test')).toBeInTheDocument();
  });

  it('has correct input types', () => {
    render(
      <Step5ContactSocial
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const emailInput = screen.getByPlaceholderText('e.g., hello@yourcompany.com') as HTMLInputElement;
    expect(emailInput).toHaveAttribute('type', 'email');

    const phoneInput = screen.getByPlaceholderText('e.g., (555) 123-4567') as HTMLInputElement;
    expect(phoneInput).toHaveAttribute('type', 'tel');

    const instagramInput = screen.getByPlaceholderText('https://instagram.com/yourcompany') as HTMLInputElement;
    expect(instagramInput).toHaveAttribute('type', 'url');
  });

  it('calls navigation functions', async () => {
    const user = userEvent.setup();
    render(
      <Step5ContactSocial
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
