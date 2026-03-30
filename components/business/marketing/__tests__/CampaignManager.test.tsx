import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CampaignManager from '../CampaignManager';

vi.mock('@kimuntupro/db', () => ({
  createCampaign: vi.fn().mockResolvedValue('campaign-123'),
  listCampaigns: vi.fn().mockResolvedValue([]),
  updateCampaign: vi.fn().mockResolvedValue(undefined),
  deleteCampaign: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/ai/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
  },
}));

describe('CampaignManager', () => {
  const defaultProps = {
    tenantId: 'test-tenant',
    userId: 'user-123',
    posts: [],
    keywords: [],
    onCampaignSelect: vi.fn(),
    onDataChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders campaigns header', () => {
    render(<CampaignManager {...defaultProps} />);
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
  });

  it('renders New Campaign button', () => {
    render(<CampaignManager {...defaultProps} />);
    expect(screen.getByText('New Campaign')).toBeInTheDocument();
  });

  it('shows empty state when no campaigns after loading', async () => {
    render(<CampaignManager {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('No campaigns yet.')).toBeInTheDocument();
    });
  });

  it('opens create modal when New Campaign clicked', async () => {
    render(<CampaignManager {...defaultProps} />);
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText('No campaigns yet.')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('New Campaign'));
    expect(screen.getByText('Campaign Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Create Campaign')).toBeInTheDocument();
  });

  it('renders campaign cards when campaigns exist', async () => {
    const { listCampaigns } = await import('@kimuntupro/db');
    vi.mocked(listCampaigns).mockResolvedValue([
      {
        id: 'c1',
        tenantId: 'test-tenant',
        userId: 'user-123',
        title: 'Test Campaign',
        description: 'A test',
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    render(<CampaignManager {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });
  });
});
