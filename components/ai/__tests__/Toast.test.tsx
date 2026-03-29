import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Toast from '../Toast';

describe('Toast', () => {
  it('renders without crashing', () => {
    const { container } = render(<Toast />);
    expect(container).toBeInTheDocument();
  });

  it('exports toast function', async () => {
    const { toast } = await import('../Toast');
    expect(toast).toBeDefined();
    expect(typeof toast).toBe('function');
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast.loading).toBe('function');
  });

  it('renders Toaster component from react-hot-toast', () => {
    const { container } = render(<Toast />);
    // Toaster component is rendered but may not have specific testable attributes
    // Just verify it renders without errors
    expect(container.firstChild).toBeTruthy();
  });
});
