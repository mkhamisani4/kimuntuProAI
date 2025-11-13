import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../TaskForm';

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

// Mock fetch globally
global.fetch = vi.fn();

describe('TaskForm', () => {
  const mockOnResult = vi.fn();
  const mockOnError = vi.fn();
  const mockOnLoadingChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it('renders task selector with default assistant', () => {
    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Select Task')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('streamlined_plan');
  });

  it('renders with specified assistant prop', () => {
    render(
      <TaskForm
        assistant="exec_summary"
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    expect(screen.getByRole('combobox')).toHaveValue('exec_summary');
  });

  it('renders prompt textarea with placeholder', () => {
    render(
      <TaskForm
        assistant="streamlined_plan"
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText('Prompt input');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder');
  });

  it('shows character counter', () => {
    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const counter = screen.getByTestId('character-counter');
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveTextContent('0/1000');
  });

  it('updates character counter when typing', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText('Prompt input');
    await user.type(textarea, 'Hello');

    const counter = screen.getByTestId('character-counter');
    expect(counter).toHaveTextContent('5/1000');
  });

  it('prevents typing beyond max length', () => {
    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText('Prompt input') as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute('maxLength', '1000');
  });

  it('disables submit button when input is empty', () => {
    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Run Assistant' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has content', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText('Prompt input');
    await user.type(textarea, 'Test prompt');

    const submitButton = screen.getByRole('button', { name: 'Run Assistant' });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows advanced options for exec_summary', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        assistant="exec_summary"
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    // Advanced options button should be visible
    const advancedButton = screen.getByText(/Advanced Options/);
    expect(advancedButton).toBeInTheDocument();

    // Click to expand
    await user.click(advancedButton);

    // Check for financial input fields
    expect(screen.getByText(/ARPU/)).toBeInTheDocument();
    expect(screen.getByText(/COGS/)).toBeInTheDocument();
    expect(screen.getByText(/Churn Rate/)).toBeInTheDocument();
  });

  it('does not show advanced options for other assistants', () => {
    render(
      <TaskForm
        assistant="streamlined_plan"
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    expect(screen.queryByText(/Advanced Options/)).not.toBeInTheDocument();
  });

  it('calls onLoadingChange when loading state changes', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sections: { 'Test Section': 'Test content' },
        sources: [],
        meta: { model: 'test', tokensIn: 100, costCents: 10, latencyMs: 1000 },
      }),
    });

    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
        onLoadingChange={mockOnLoadingChange}
      />
    );

    const textarea = screen.getByLabelText('Prompt input');
    await user.type(textarea, 'Test prompt');

    const submitButton = screen.getByRole('button', { name: 'Run Assistant' });
    await user.click(submitButton);

    // Should call with true when starting
    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);

    // Wait for completion
    await waitFor(() => {
      expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
    });
  });

  it('calls onResult on successful API response', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      sections: { 'Test Section': 'Test content' },
      sources: [],
      meta: { model: 'test', tokensIn: 100, costCents: 10, latencyMs: 1000 },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText('Prompt input');
    await user.type(textarea, 'Test prompt');

    const submitButton = screen.getByRole('button', { name: 'Run Assistant' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnResult).toHaveBeenCalledWith({
        sections: mockResponse.sections,
        sources: mockResponse.sources,
        meta: mockResponse.meta,
      });
    });
  });

  it('calls onError on failed API response', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' }),
    });

    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText('Prompt input');
    await user.type(textarea, 'Test prompt');

    const submitButton = screen.getByRole('button', { name: 'Run Assistant' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith({
        type: 'server',
        message: 'Server error',
      });
    });
  });

  it('handles quota exceeded error (429)', async () => {
    const user = userEvent.setup();
    const resetsAt = new Date().toISOString();
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ message: 'Quota exceeded', resetsAt }),
    });

    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText('Prompt input');
    await user.type(textarea, 'Test prompt');

    const submitButton = screen.getByRole('button', { name: 'Run Assistant' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith({
        type: 'quota',
        message: 'Quota exceeded',
        resetsAt,
      });
    });
  });

  it('shows loading spinner when submitting', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const textarea = screen.getByLabelText('Prompt input');
    await user.type(textarea, 'Test prompt');

    const submitButton = screen.getByRole('button', { name: 'Run Assistant' });
    await user.click(submitButton);

    // Should show "Generating..." text
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('changes assistant type via selector', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const selector = screen.getByRole('combobox');
    await user.selectOptions(selector, 'market_analysis');

    expect(selector).toHaveValue('market_analysis');
  });
});
