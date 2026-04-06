import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MarketingDashboard from '../MarketingDashboard';

// Mock all child components
vi.mock('../SEOTools', () => ({
  default: (props: any) => <div data-testid="seo-tools">SEOTools {props.tenantId}</div>,
}));
vi.mock('../ContentPlanner', () => ({
  default: (props: any) => <div data-testid="content-planner">ContentPlanner {props.tenantId}</div>,
}));
vi.mock('../CampaignManager', () => ({
  default: (props: any) => <div data-testid="campaign-manager">CampaignManager {props.tenantId}</div>,
}));

// Mock database functions
vi.mock('@kimuntupro/db', () => ({
  listPosts: vi.fn().mockResolvedValue([]),
  listCampaigns: vi.fn().mockResolvedValue([]),
  listKeywords: vi.fn().mockResolvedValue([]),
  getMarketingSettings: vi.fn().mockResolvedValue(null),
}));

// Mock toast
vi.mock('@/components/ai/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
  },
}));

describe('MarketingDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 4 tab buttons', () => {
    render(<MarketingDashboard userId="user-123" tenantId="test-tenant" />);
    expect(screen.getByRole('button', { name: /Overview/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SEO Tools/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Content Planner/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Campaigns/ })).toBeInTheDocument();
  });

  it('shows Overview tab content by default', () => {
    render(<MarketingDashboard userId="user-123" tenantId="test-tenant" />);
    expect(screen.getByText('Marketing Alerts')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('switches to SEO Tools tab when clicked', () => {
    render(<MarketingDashboard userId="user-123" tenantId="test-tenant" />);
    fireEvent.click(screen.getByRole('button', { name: /SEO Tools/ }));
    expect(screen.getByTestId('seo-tools')).toBeInTheDocument();
  });

  it('passes tenantId to child components', () => {
    render(<MarketingDashboard userId="user-123" tenantId="test-tenant" />);
    // All mocked children render tenantId in their text
    expect(screen.getByTestId('seo-tools')).toHaveTextContent('test-tenant');
    expect(screen.getByTestId('content-planner')).toHaveTextContent('test-tenant');
    expect(screen.getByTestId('campaign-manager')).toHaveTextContent('test-tenant');
  });

  it('shows connect socials banner when no settings', () => {
    render(<MarketingDashboard userId="user-123" tenantId="test-tenant" />);
    expect(screen.getByText('Connect Social Accounts')).toBeInTheDocument();
  });
});
