/**
 * Unit tests for WizardContainer component
 * Tests wizard navigation, step progression, and state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WizardContainer from '../WizardContainer';
import type { WizardInput } from '@kimuntupro/shared';

// Mock Firebase auth
vi.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      callback({ uid: 'test-user-123' });
      return vi.fn(); // unsubscribe function
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
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('WizardContainer', () => {
  const mockWizardData: WizardInput = {
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

  const mockSetWizardData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it('renders initial wizard state with step 1', () => {
    render(
      <WizardContainer
        wizardData={mockWizardData}
        setWizardData={mockSetWizardData}
      />
    );

    // Should show Brand Basics step (heading in step content)
    expect(screen.getByRole('heading', { name: 'Brand Basics' })).toBeInTheDocument();
    expect(screen.getByText('Company name, tagline, logo')).toBeInTheDocument();
  });

  it('displays all 6 steps in progress bar', () => {
    render(
      <WizardContainer
        wizardData={mockWizardData}
        setWizardData={mockSetWizardData}
      />
    );

    // Check for step navigation buttons
    expect(screen.getByRole('button', { name: 'Go to Brand Basics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Business Overview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Hero & CTA' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Sections & Layout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Contact & Social' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Visual Style' })).toBeInTheDocument();
  });

  it('highlights current step in progress bar', () => {
    render(
      <WizardContainer
        wizardData={mockWizardData}
        setWizardData={mockSetWizardData}
      />
    );

    const brandBasicsButton = screen.getByRole('button', { name: 'Go to Brand Basics' });
    expect(brandBasicsButton).toHaveClass('bg-emerald-500');
  });

  it('advances to next step when Next button clicked', async () => {
    const user = userEvent.setup();
    const wizardDataWithName = {
      ...mockWizardData,
      companyName: 'Test Company',
    };

    render(
      <WizardContainer
        wizardData={wizardDataWithName}
        setWizardData={mockSetWizardData}
      />
    );

    const nextButton = screen.getByRole('button', { name: 'Next Step' });
    await user.click(nextButton);

    // Should show step 2 content (heading)
    expect(screen.getByRole('heading', { name: 'Business Overview' })).toBeInTheDocument();
    expect(screen.getByText('Tell us about your business. This helps create meaningful content for your website.')).toBeInTheDocument();
  });

  it('goes back to previous step when Back button clicked', async () => {
    const user = userEvent.setup();
    const wizardDataWithName = {
      ...mockWizardData,
      companyName: 'Test Company',
    };

    const { rerender } = render(
      <WizardContainer
        wizardData={wizardDataWithName}
        setWizardData={mockSetWizardData}
      />
    );

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: 'Next Step' });
    await user.click(nextButton);

    // Now click Back
    const backButton = screen.getByRole('button', { name: /Back/ });
    await user.click(backButton);

    // Should be back on step 1
    expect(screen.getByText('Let\'s start with your brand identity. This helps create a cohesive website.')).toBeInTheDocument();
  });

  it('allows jumping to a specific step via progress bar', async () => {
    const user = userEvent.setup();
    render(
      <WizardContainer
        wizardData={mockWizardData}
        setWizardData={mockSetWizardData}
      />
    );

    // Click on step 4 in progress bar
    const step4Button = screen.getByRole('button', { name: 'Go to Sections & Layout' });
    await user.click(step4Button);

    // Should show step 4 content
    expect(screen.getByText('Choose which sections to include on your website and select a layout style.')).toBeInTheDocument();
  });

  it('marks steps as completed after progressing forward', async () => {
    const user = userEvent.setup();
    const wizardDataWithName = {
      ...mockWizardData,
      companyName: 'Test Company',
    };

    render(
      <WizardContainer
        wizardData={wizardDataWithName}
        setWizardData={mockSetWizardData}
      />
    );

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: 'Next Step' });
    await user.click(nextButton);

    // Step 1 button should show a checkmark (completed)
    const step1Button = screen.getByRole('button', { name: 'Go to Brand Basics' });
    expect(step1Button).toHaveClass('bg-emerald-600');
  });

  it('updates wizard data when form fields change', async () => {
    const user = userEvent.setup();
    render(
      <WizardContainer
        wizardData={mockWizardData}
        setWizardData={mockSetWizardData}
      />
    );

    // Type in company name field
    const companyNameInput = screen.getByPlaceholderText('e.g., Acme Inc');
    await user.type(companyNameInput, 'My Company');

    // setWizardData should be called with updates
    expect(mockSetWizardData).toHaveBeenCalled();
  });
});
