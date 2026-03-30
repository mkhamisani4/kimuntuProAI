import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentPlanner from '../ContentPlanner';

// Mock CalendarView to avoid FullCalendar dynamic imports
vi.mock('../CalendarView', () => ({
  default: () => <div data-testid="calendar-view">Calendar</div>,
}));

vi.mock('@kimuntupro/db', () => ({
  createPost: vi.fn().mockResolvedValue('post-123'),
  listPosts: vi.fn().mockResolvedValue([]),
  deletePost: vi.fn().mockResolvedValue(undefined),
  uploadPostMedia: vi.fn().mockResolvedValue('https://example.com/media.jpg'),
  updatePost: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/ai/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
  },
}));

describe('ContentPlanner', () => {
  const defaultProps = {
    tenantId: 'test-tenant',
    userId: 'user-123',
    campaigns: [],
    selectedCampaignId: null,
    onDataChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content calendar header', () => {
    render(<ContentPlanner {...defaultProps} />);
    expect(screen.getByText('Content Calendar')).toBeInTheDocument();
  });

  it('renders Create Post buttons', () => {
    render(<ContentPlanner {...defaultProps} />);
    const buttons = screen.getAllByText('Create Post');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no posts after loading', async () => {
    render(<ContentPlanner {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('No posts found.')).toBeInTheDocument();
    });
  });

  it('opens create post modal when button clicked', async () => {
    render(<ContentPlanner {...defaultProps} />);
    // Wait for loading to finish first
    await waitFor(() => {
      expect(screen.getByText('No posts found.')).toBeInTheDocument();
    });
    const buttons = screen.getAllByText('Create Post');
    fireEvent.click(buttons[0]);
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
  });

  it('shows filter buttons after loading', async () => {
    render(<ContentPlanner {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });
    // Use role-based selectors to avoid matching sidebar labels
    expect(screen.getByRole('button', { name: /Scheduled/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Draft/ })).toBeInTheDocument();
  });

  it('has list/calendar view toggle', () => {
    render(<ContentPlanner {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2);
  });
});
