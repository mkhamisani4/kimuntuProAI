import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssistantLayout from '../AssistantLayout';

describe('AssistantLayout', () => {
  it('renders breadcrumb navigation correctly', () => {
    render(
      <AssistantLayout
        title="Test Assistant"
        description="Test description"
        icon="🧪"
      >
        <div>Test Content</div>
      </AssistantLayout>
    );

    // Check breadcrumbs by getting the nav element and checking within it
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb).toHaveTextContent('Dashboard');
    expect(breadcrumb).toHaveTextContent('Business Track');
    expect(breadcrumb).toHaveTextContent('Test Assistant');
  });

  it('renders title, description, and icon', () => {
    render(
      <AssistantLayout
        title="Streamlined Plan"
        description="Generate lean business plans"
        icon="📈"
      >
        <div>Content</div>
      </AssistantLayout>
    );

    expect(screen.getByRole('heading', { name: 'Streamlined Plan' })).toBeInTheDocument();
    expect(screen.getByText('Generate lean business plans')).toBeInTheDocument();
    expect(screen.getByText('📈')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <AssistantLayout
        title="Test"
        description="Test"
        icon="🧪"
      >
        <div data-testid="child-content">Child Content</div>
      </AssistantLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('uses default backHref when not provided', () => {
    const { container } = render(
      <AssistantLayout
        title="Test"
        description="Test"
        icon="🧪"
      >
        <div>Content</div>
      </AssistantLayout>
    );

    // Find the back button link by checking for one that contains "Back" text and has href
    const backLinks = container.querySelectorAll('a[href="/dashboard/business"]');
    const backLink = Array.from(backLinks).find(link => link.textContent?.includes('Back'));
    expect(backLink).toBeDefined();
  });

  it('uses custom backHref when provided', () => {
    const { container } = render(
      <AssistantLayout
        title="Test"
        description="Test"
        icon="🧪"
        backHref="/custom/path"
      >
        <div>Content</div>
      </AssistantLayout>
    );

    // Find the back button link by checking for one that contains "Back" text and has href
    const backLinks = container.querySelectorAll('a[href="/custom/path"]');
    const backLink = Array.from(backLinks).find(link => link.textContent?.includes('Back'));
    expect(backLink).toBeDefined();
  });

  it('has dark gradient background classes', () => {
    const { container } = render(
      <AssistantLayout
        title="Test"
        description="Test"
        icon="🧪"
      >
        <div>Content</div>
      </AssistantLayout>
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).toContain('bg-gradient-to-br');
    expect(mainDiv.className).toContain('from-gray-900');
    expect(mainDiv.className).toContain('via-gray-800');
    expect(mainDiv.className).toContain('to-black');
  });
});
