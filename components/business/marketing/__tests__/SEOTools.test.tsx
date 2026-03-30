import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SEOTools from '../SEOTools';

vi.mock('@kimuntupro/db', () => ({
  saveKeyword: vi.fn().mockResolvedValue('kw-123'),
  listKeywords: vi.fn().mockResolvedValue([]),
  deleteKeyword: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/ai/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
  },
}));

describe('SEOTools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders keyword search form', () => {
    render(<SEOTools tenantId="test-tenant" userId="user-123" />);
    expect(screen.getByPlaceholderText(/enter a keyword/i)).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  it('renders all 3 sub-tabs as buttons', () => {
    render(<SEOTools tenantId="test-tenant" userId="user-123" />);
    expect(screen.getByRole('button', { name: /Keyword Research/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tracked Keywords/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Site Audit/ })).toBeInTheDocument();
  });

  it('shows empty state for tracked keywords', () => {
    render(<SEOTools tenantId="test-tenant" userId="user-123" />);
    fireEvent.click(screen.getByRole('button', { name: /Tracked Keywords/ }));
    expect(screen.getByText('No keywords tracked yet.')).toBeInTheDocument();
  });

  it('shows site audit URL input when tab selected', () => {
    render(<SEOTools tenantId="test-tenant" userId="user-123" />);
    fireEvent.click(screen.getByRole('button', { name: /Site Audit/ }));
    expect(screen.getByPlaceholderText(/enter a url/i)).toBeInTheDocument();
    expect(screen.getByText('Run Audit')).toBeInTheDocument();
  });

  it('calls API when keyword search form is submitted', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ keywords: [{ keyword: 'test', search_volume: 500, keyword_difficulty: 30, cpc: 1.5 }] }),
    } as any);

    render(<SEOTools tenantId="test-tenant" userId="user-123" />);
    const input = screen.getByPlaceholderText(/enter a keyword/i);
    fireEvent.change(input, { target: { value: 'test keyword' } });
    fireEvent.click(screen.getByText('Analyze'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/marketing/keywords', expect.any(Object));
    });
  });
});
