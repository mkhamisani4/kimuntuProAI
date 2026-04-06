import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CalendarView from '../CalendarView';

// Mock FullCalendar modules so the dynamic imports in CalendarView resolve to mocks
vi.mock('@fullcalendar/react', () => ({
  default: ({ events, eventClick }: any) => (
    <div data-testid="fullcalendar">
      {events?.map((e: any) => (
        <div key={e.id} data-testid={`event-${e.id}`} onClick={() => eventClick?.({ event: { extendedProps: e.extendedProps } })}>
          {e.title}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('@fullcalendar/daygrid', () => ({ default: {} }));
vi.mock('@fullcalendar/interaction', () => ({ default: {} }));

describe('CalendarView', () => {
  it('shows loading state initially', () => {
    render(<CalendarView events={[]} onEventClick={vi.fn()} />);
    expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
  });

  it('renders FullCalendar after dynamic imports resolve', async () => {
    render(<CalendarView events={[]} onEventClick={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
    });
  });

  it('renders events from post data', async () => {
    const events = [
      { id: 'p1', title: 'Test post content', date: '2025-03-01', color: '#E1306C', extendedProps: { post: { id: 'p1' } } },
    ];
    render(<CalendarView events={events} onEventClick={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Test post content')).toBeInTheDocument();
    });
  });

  it('triggers onEventClick when event is clicked', async () => {
    const mockClick = vi.fn();
    const mockPost = { id: 'p1', content: 'hello' };
    const events = [
      { id: 'p1', title: 'Click me', date: '2025-03-01', color: '#E1306C', extendedProps: { post: mockPost } },
    ];
    render(<CalendarView events={events} onEventClick={mockClick} />);
    await waitFor(() => {
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Click me'));
    expect(mockClick).toHaveBeenCalledWith(mockPost);
  });
});
