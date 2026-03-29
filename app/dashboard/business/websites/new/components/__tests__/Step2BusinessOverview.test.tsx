/**
 * Unit tests for Step2BusinessOverview component
 * Tests business description, industry, and service list functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step2BusinessOverview from '../Step2BusinessOverview';
import type { WizardInput } from '@kimuntupro/shared';

// Mock Toast
vi.mock('@/components/ai/Toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('Step2BusinessOverview', () => {
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
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Business Overview')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/We help startups/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Founded in 2024/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/SaaS, E-commerce/)).toBeInTheDocument();
  });

  it('shows character counters for text areas', () => {
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('0/250 characters')).toBeInTheDocument();
    expect(screen.getByText('0/1000 characters')).toBeInTheDocument();
  });

  it('updates character counter when typing in short description', async () => {
    const user = userEvent.setup();
    const dataWithDesc = { ...mockData, shortDescription: 'Hello' };

    render(
      <Step2BusinessOverview
        data={dataWithDesc}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('5/250 characters')).toBeInTheDocument();
  });

  it('updates character counter when typing in about us', async () => {
    const user = userEvent.setup();
    const dataWithAbout = { ...mockData, aboutUs: 'Test about us text' };

    render(
      <Step2BusinessOverview
        data={dataWithAbout}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('18/1000 characters')).toBeInTheDocument();
  });

  it('updates short description when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const textarea = screen.getByPlaceholderText(/We help startups/);
    await user.type(textarea, 'New description');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('updates industry when typing', async () => {
    const user = userEvent.setup();
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const input = screen.getByPlaceholderText(/SaaS, E-commerce/);
    await user.type(input, 'Technology');

    expect(mockUpdateData).toHaveBeenCalled();
  });

  it('shows add service input when no services exist', () => {
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByPlaceholderText('e.g., Web Design')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('adds service when Add button clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const input = screen.getByPlaceholderText('e.g., Web Design');
    await user.type(input, 'SEO Services');

    const addButton = screen.getByRole('button', { name: 'Add' });
    await user.click(addButton);

    expect(mockUpdateData).toHaveBeenCalledWith({
      keyServices: ['SEO Services'],
    });
  });

  it('shows error when adding empty service', async () => {
    const { toast } = await import('@/components/ai/Toast');
    const user = userEvent.setup();

    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add' });
    await user.click(addButton);

    expect(toast.error).toHaveBeenCalledWith('Please enter a service name');
  });

  it('displays existing services', () => {
    const dataWithServices = {
      ...mockData,
      keyServices: ['Web Design', 'SEO'],
    };

    render(
      <Step2BusinessOverview
        data={dataWithServices}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Web Design')).toBeInTheDocument();
    expect(screen.getByText('SEO')).toBeInTheDocument();
  });

  it('removes service when remove button clicked', async () => {
    const user = userEvent.setup();
    const dataWithServices = {
      ...mockData,
      keyServices: ['Web Design', 'SEO'],
    };

    render(
      <Step2BusinessOverview
        data={dataWithServices}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Click remove button for first service
    const removeButtons = screen.getAllByRole('button', { name: /Remove/ });
    await user.click(removeButtons[0]);

    expect(mockUpdateData).toHaveBeenCalledWith({
      keyServices: ['SEO'], // Web Design removed
    });
  });

  it('shows error when adding 11th service', async () => {
    const { toast } = await import('@/components/ai/Toast');
    const user = userEvent.setup();
    const dataWith10Services = {
      ...mockData,
      keyServices: Array(10).fill('Service'),
    };

    render(
      <Step2BusinessOverview
        data={dataWith10Services}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Add input should not be visible when 10 services exist
    expect(screen.queryByPlaceholderText('e.g., Web Design')).not.toBeInTheDocument();
  });

  it('calls onNext when Next button clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByRole('button', { name: 'Next Step' });
    await user.click(nextButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('calls onBack when Back button clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /Back/ });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('enforces max length on text areas', () => {
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const shortDescTextarea = screen.getByPlaceholderText(/We help startups/) as HTMLTextAreaElement;
    expect(shortDescTextarea).toHaveAttribute('maxLength', '250');

    const aboutTextarea = screen.getByPlaceholderText(/Founded in 2024/) as HTMLTextAreaElement;
    expect(aboutTextarea).toHaveAttribute('maxLength', '1000');
  });

  it('adds service on Enter key press', async () => {
    const user = userEvent.setup();
    render(
      <Step2BusinessOverview
        data={mockData}
        updateData={mockUpdateData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const input = screen.getByPlaceholderText('e.g., Web Design');
    await user.type(input, 'Marketing{Enter}');

    expect(mockUpdateData).toHaveBeenCalledWith({
      keyServices: ['Marketing'],
    });
  });
});
