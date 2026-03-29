/**
 * Unit tests for Step6VisualStyle component
 * Tests color theme, font style selection, and website generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step6VisualStyle from '../Step6VisualStyle';
import type { WizardInput } from '@kimuntupro/shared';

// Mock Firebase auth
vi.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      callback({ uid: 'test-user-123' });
      return vi.fn();
    }),
  },
}));

// Mock Toast
vi.mock('@/components/ai/Toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Step6VisualStyle', () => {
  const mockData: WizardInput = {
    companyName: 'Test Company',
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
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it('renders all color theme options', () => {
    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    expect(screen.getByText('Forest Green')).toBeInTheDocument();
    expect(screen.getByText('Sunset Orange')).toBeInTheDocument();
    expect(screen.getByText('Lavender Purple')).toBeInTheDocument();
    expect(screen.getByText('Rose Pink')).toBeInTheDocument();
    expect(screen.getByText('Slate Gray')).toBeInTheDocument();
  });

  it('renders all font style options', () => {
    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Modern Sans')).toBeInTheDocument();
    expect(screen.getByText('Classic Serif')).toBeInTheDocument();
    expect(screen.getByText('Tech Mono')).toBeInTheDocument();
    expect(screen.getByText('Friendly Rounded')).toBeInTheDocument();
  });

  it('selects color theme when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const oceanButton = screen.getByRole('button', { name: /Ocean Blue/ });
    await user.click(oceanButton);

    expect(mockUpdateData).toHaveBeenCalledWith({ colorTheme: 'ocean' });
  });

  it('selects font style when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const modernButton = screen.getByRole('button', { name: /Modern Sans/ });
    await user.click(modernButton);

    expect(mockUpdateData).toHaveBeenCalledWith({ fontStyle: 'modern' });
  });

  it('highlights selected color theme', () => {
    const dataWithTheme = { ...mockData, colorTheme: 'forest' };
    render(
      <Step6VisualStyle
        data={dataWithTheme}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const forestButton = screen.getByRole('button', { name: /Forest Green/ });
    expect(forestButton).toHaveClass('border-emerald-500');
  });

  it('highlights selected font style', () => {
    const dataWithFont = { ...mockData, fontStyle: 'classic' };
    render(
      <Step6VisualStyle
        data={dataWithFont}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const classicButton = screen.getByRole('button', { name: /Classic Serif/ });
    expect(classicButton).toHaveClass('border-emerald-500');
  });

  it('shows ready to generate message', () => {
    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Ready to Generate!')).toBeInTheDocument();
    expect(screen.getByText(/Pure HTML website with modern, responsive design/)).toBeInTheDocument();
    expect(screen.getByText(/Generated using Claude Sonnet 4.5 AI/)).toBeInTheDocument();
  });

  it('shows Generate Website button', () => {
    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByRole('button', { name: /Generate Website/ })).toBeInTheDocument();
  });

  it('prevents generation without company name', async () => {
    const { toast } = await import('@/components/ai/Toast');
    const user = userEvent.setup();
    const dataWithoutName = { ...mockData, companyName: undefined };

    render(
      <Step6VisualStyle
        data={dataWithoutName}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const generateButton = screen.getByRole('button', { name: /Generate Website/ });
    await user.click(generateButton);

    expect(toast.error).toHaveBeenCalledWith('Please go back and enter your company name');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls API when generating website', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        websiteId: 'website-123',
        status: 'generating',
      }),
    });

    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const generateButton = screen.getByRole('button', { name: /Generate Website/ });
    await user.click(generateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/websites/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test Company'),
      });
    });
  });

  it('redirects to preview page on success', async () => {
    const { toast } = await import('@/components/ai/Toast');
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        websiteId: 'website-123',
        status: 'generating',
      }),
    });

    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const generateButton = screen.getByRole('button', { name: /Generate Website/ });
    await user.click(generateButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    // Wait for the timeout to trigger redirect
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(mockPush).toHaveBeenCalledWith('/dashboard/business/websites/website-123');
  });

  it('handles quota exceeded error', async () => {
    const { toast } = await import('@/components/ai/Toast');
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        message: 'Quota exceeded',
      }),
    });

    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const generateButton = screen.getByRole('button', { name: /Generate Website/ });
    await user.click(generateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Quota exceeded'),
        expect.anything()
      );
    });
  });

  it('shows loading state when generating', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const generateButton = screen.getByRole('button', { name: /Generate Website/ });
    await user.click(generateButton);

    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('disables buttons while generating', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockImplementationOnce(() =>
      new Promise((resolve) =>
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, websiteId: 'test-123' })
        }), 100)
      )
    );

    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const generateButton = screen.getByRole('button', { name: /Generate Website/ });
    await user.click(generateButton);

    const backButton = screen.getByRole('button', { name: /Back/ });
    expect(backButton).toBeDisabled();
  });

  it('calls onBack when Back button clicked', async () => {
    const user = userEvent.setup();
    render(
      <Step6VisualStyle
        data={mockData}
        updateData={mockUpdateData}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /Back/ });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });
});
